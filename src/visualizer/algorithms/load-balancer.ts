import { parseInteger, parseNumbers, splitParts } from "../core/parse";
import { recorder } from "../core/recorder";
import { ok, type ParseResult } from "../core/types";

export type LbPolicy = "round-robin" | "least-connections";

export const loadBalancerCode = `function pick(servers: Server[], policy: Policy): Server {
  if (policy === "round-robin") {
    return servers[next++ % servers.length];        // ignores current load
  }
  // least-connections: fewest in-flight requests wins
  return servers.reduce((a, b) => (b.active < a.active ? b : a));
}`;

export interface LbInput {
  servers: number;
  durations: number[];
}

export interface LbState {
  time: number;
  /** Remaining time of each in-flight request, per server. */
  load: number[][];
  assigned: number | null;
  request: number | null;
  maxActive: number[];
  policy: LbPolicy;
}

export function parseLb(raw: string): ParseResult<LbInput> {
  const parts = splitParts(raw, 2);
  if (!parts.ok) return parts;
  const servers = parseInteger(parts.value[0], "servers", 2, 4);
  if (!servers.ok) return servers;
  const d = parseNumbers(parts.value[1], { min: 1, max: 14, label: "durations" });
  if (!d.ok) return d;
  return ok({ servers: servers.value, durations: d.value.map((x) => Math.min(9, Math.max(1, x))) });
}

export function loadBalancerSteps({ servers, durations }: LbInput, policy: LbPolicy) {
  const rec = recorder<LbState>();
  const st: LbState = { time: 0, load: Array.from({ length: servers }, () => []), assigned: null, request: null, maxActive: new Array(servers).fill(0), policy };
  let next = 0;
  rec.push(st, 1, `${servers} servers. One request arrives per tick; the number is how many ticks it keeps a connection busy. Policy: ${policy}.`, `${servers} ta server. Har tick'da bitta request keladi; son — u ulanishni necha tick band qilishi. Siyosat: ${policy}.`);
  durations.forEach((d, i) => {
    st.time = i;
    st.load = st.load.map((reqs) => reqs.map((r) => r - 1).filter((r) => r > 0));
    let target: number;
    if (policy === "round-robin") target = next++ % servers;
    else target = st.load.reduce((best, reqs, k) => (reqs.length < st.load[best].length ? k : best), 0);
    st.load[target].push(d);
    st.assigned = target;
    st.request = i;
    st.maxActive[target] = Math.max(st.maxActive[target], st.load[target].length);
    rec.push(
      st,
      policy === "round-robin" ? 3 : 6,
      `t=${i}: request (${d} ticks) → server ${target + 1}${policy === "round-robin" ? " (its turn, whatever its load)" : ` (fewest active: ${st.load[target].length - 1})`}. Active: ${st.load.map((r) => r.length).join(" / ")}.`,
      `t=${i}: request (${d} tick) → ${target + 1}-server${policy === "round-robin" ? " (yuklamasidan qat'i nazar navbati)" : ` (eng kam faol: ${st.load[target].length - 1})`}. Faol: ${st.load.map((r) => r.length).join(" / ")}.`,
    );
  });
  st.assigned = null;
  st.request = null;
  rec.push(st, 6, `Peak concurrent requests per server: ${st.maxActive.join(" / ")}. With uneven request costs round-robin piles slow requests onto the same server; least-connections adapts — but needs live connection counts (easy in one LB, harder across many LB instances).`, `Har bir serverdagi eng koʻp parallel request: ${st.maxActive.join(" / ")}. Request narxlari notekis boʻlsa, round-robin sekin request'larni bitta serverga yigʻadi; least-connections moslashadi — lekin jonli ulanishlar sonini bilishi kerak (bitta LB'da oson, koʻp LB nusxalarida qiyinroq).`);
  return rec.steps;
}
