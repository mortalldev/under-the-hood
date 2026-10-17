"use client";

import { parseRerender, rerenderCode, rerenderSteps, type ComponentSpec } from "@/visualizer/algorithms/rerender";
import type { Tone } from "@/visualizer/core/types";
import { Stats, TreeView, type TreeNodeSpec } from "../primitives";
import { useL } from "../useL";
import { Visualizer } from "../Visualizer";

function flatten(c: ComponentSpec, out: ComponentSpec[] = []): ComponentSpec[] {
  out.push(c);
  c.children.forEach((k) => flatten(k, out));
  return out;
}

export function RerenderViz() {
  const l = useL();
  return (
    <Visualizer
      title={{ en: "Which components re-render after setState?", uz: "setState'dan keyin qaysi komponentlar re-render boʻladi?" }}
      code={rerenderCode}
      defaultInput="App(Header, Page(Toolbar, List*(Row, Row2), Chart*!, Sidebar(Ad)), Footer); Page"
      parse={parseRerender}
      generate={rerenderSteps}
      inputLabel={{ en: "tree (* = memo, ! = new object prop each render); component that calls setState", uz: "daraxt (* = memo, ! = har render'da yangi object prop); setState chaqiradigan komponent" }}
      presets={[
        { label: "Page", input: "App(Header, Page(Toolbar, List*(Row, Row2), Chart*!, Sidebar(Ad)), Footer); Page" },
        { label: "App", input: "App(Header, Page(Toolbar, List*(Row, Row2), Chart*!, Sidebar(Ad)), Footer); App" },
        { label: "List", input: "App(Header, Page(Toolbar, List*(Row, Row2), Chart*!, Sidebar(Ad)), Footer); List" },
      ]}
      render={(s) => {
        const all = flatten(s.tree);
        const nodes: TreeNodeSpec[] = all.map((c) => {
          let tone: Tone | undefined;
          if (s.rendered.includes(c.name)) tone = "compare";
          if (s.skipped.includes(c.name)) tone = "match";
          if (c.name === s.current) tone = "active";
          return { id: c.name, label: c.name.slice(0, 6), badge: `${c.memo ? "memo" : ""}${c.unstable ? " !" : ""}` || undefined, children: c.children.map((k) => k.name), tone };
        });
        return (
          <div className="flex flex-col gap-3">
            <TreeView root={s.tree.name} nodes={nodes} />
            <Stats items={[[l("rendered", "render qilindi"), s.rendered.join(", ") || "—"], [l("bailed out", "bail out"), s.skipped.join(", ") || "—"]]} />
          </div>
        );
      }}
    />
  );
}
