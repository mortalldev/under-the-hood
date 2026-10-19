import { L, type Scene } from "../scene";

export const dry: Scene = {
  title: L("DRY: one rule, three copies", "DRY: bitta qoida, uchta nusxa"),
  code: `// the rule "min 8 characters" copied three times
if (form.password.length < 8) showError();   // signup.tsx
if (body.password.length < 8) reject();      // api/signup.ts
if (input.password.length < 8) fail();       // reset.ts

// one source of truth
export const MIN_PASSWORD = 8;
export const isValidPassword = (p: string) => p.length >= MIN_PASSWORD;
// every caller: isValidPassword(password)`,
  nodes: {
    a: { label: "signup.tsx", sub: "length < 8", x: 110, y: 225, w: 160 },
    b: { label: "api/signup.ts", sub: "length < 8", x: 320, y: 225, w: 160 },
    c: { label: "reset.ts", sub: "length < 8", x: 530, y: 225, w: 160 },
    req: { label: L("New rule: 12", "Yangi qoida: 12"), x: 320, y: 55, w: 170, kind: "data" },
    rule: { label: "password.ts", sub: "MIN_PASSWORD = 8", x: 320, y: 60, w: 200 },
  },
  frames: [
    {
      add: ["a", "b", "c"],
      verdict: "bad",
      line: 2,
      note: L("The same rule — a piece of knowledge — is written in three files.", "Bitta qoida — bitta bilim — uchta faylda yozilgan."),
    },
    {
      add: ["req"],
      tone: { req: "compare" },
      line: 1,
      note: L("Security asks for at least 12 characters.", "Xavfsizlik jamoasi kamida 12 belgini talab qiladi."),
    },
    {
      relabel: { a: { sub: "length < 12" }, b: { sub: "length < 12" } },
      tone: { a: "match", b: "match", c: "danger" },
      badge: { c: "8 !" },
      edges: [
        ["req", "a", { tone: "match", flow: true }],
        ["req", "b", { tone: "match", flow: true }],
      ],
      line: 4,
      note: L(
        "Two copies get updated, the third is forgotten. Password reset still accepts 8 characters — a classic DRY bug.",
        "Ikki nusxa yangilanadi, uchinchisi unutiladi. Parolni tiklash hamon 8 belgini qabul qiladi — klassik DRY xatosi.",
      ),
    },
    {
      remove: ["req"],
      add: ["rule"],
      verdict: "good",
      relabel: { a: { sub: "isValidPassword()" }, b: { sub: "isValidPassword()" }, c: { sub: "isValidPassword()" } },
      tone: { a: "default", b: "default", c: "default" },
      badge: { c: "" },
      edges: [["rule", "a"], ["rule", "b"], ["rule", "c"]],
      line: 7,
      note: L("Move the knowledge into one place. Callers ask isValidPassword().", "Bilimni bitta joyga koʻchiring. Chaqiruvchilar isValidPassword()'dan soʻraydi."),
    },
    {
      relabel: { rule: { sub: "MIN_PASSWORD = 12" } },
      tone: { rule: "active", a: "match", b: "match", c: "match" },
      edges: [
        ["rule", "a", { tone: "match", flow: true }],
        ["rule", "b", { tone: "match", flow: true }],
        ["rule", "c", { tone: "match", flow: true }],
      ],
      line: 8,
      note: L("Changing the rule is now a one-line edit, and every caller follows.", "Endi qoidani oʻzgartirish — bitta qatorli tahrir, barcha chaqiruvchilar unga ergashadi."),
    },
    {
      tone: { rule: "default", a: "default", b: "default", c: "default" },
      edges: [["rule", "a"], ["rule", "b"], ["rule", "c"]],
      note: L(
        "DRY is about knowledge, not identical text. Two look-alike snippets that change for different reasons should stay separate.",
        "DRY bir xil matn haqida emas, bilim haqida. Har xil sabablarga koʻra oʻzgaradigan ikki oʻxshash kod alohida qolishi kerak.",
      ),
    },
  ],
};

export const kiss: Scene = {
  title: L("KISS: decode vs read", "KISS: shifrni ochish va oddiy oʻqish"),
  code: `// "clever": a bitmask nobody reads at a glance
const isWeekend = (d: Date) =>
  !!((1 << d.getDay()) & 0b1000001);

// simple: says what it means
const isWeekend = (d: Date) =>
  d.getDay() === 0 || d.getDay() === 6;`,
  nodes: {
    clever: { label: "isWeekend(saturday)", sub: "!!((1 << day) & 0b1000001)", x: 320, y: 70, w: 290, h: 58 },
    s1: { label: "1 << 6 = 64", x: 110, y: 215, w: 150, kind: "data" },
    s2: { label: "64 & 65 = 64", x: 320, y: 215, w: 150, kind: "data" },
    s3: { label: "!!64 = true", x: 530, y: 215, w: 150, kind: "data" },
    simple: { label: "isWeekend(saturday)", sub: "day === 0 || day === 6", x: 320, y: 70, w: 290, h: 58 },
    s4: { label: L("6 === 6 → true", "6 === 6 → true"), x: 320, y: 215, w: 170, kind: "data" },
  },
  frames: [
    {
      add: ["clever"],
      verdict: "bad",
      line: 3,
      note: L("To answer a yes/no question, the reader must decode a bitmask.", "Ha/yoʻq savoliga javob berish uchun oʻquvchi bitmask'ni ochishi kerak."),
    },
    {
      add: ["s1"],
      edges: [["clever", "s1"]],
      line: 3,
      note: L("In your head: Saturday is 6, so 1 << 6 = 64…", "Xayolda: shanba — 6, demak 1 << 6 = 64…"),
    },
    {
      add: ["s2"],
      addEdges: [["s1", "s2"]],
      line: 3,
      note: L("…0b1000001 is 65, and 64 & 65 = 64…", "…0b1000001 — bu 65, 64 & 65 = 64…"),
    },
    {
      add: ["s3"],
      addEdges: [["s2", "s3"]],
      tone: { clever: "compare" },
      badge: { clever: L("3 steps", "3 qadam") },
      line: 3,
      note: L("…and !! turns 64 into true. Three steps of decoding, and one typo in the mask is invisible.", "…va !! 64 ni true'ga aylantiradi. Uch qadam shifr ochish, maskadagi bitta xato esa koʻzga koʻrinmaydi."),
    },
    {
      remove: ["clever", "s1", "s2", "s3"],
      add: ["simple", "s4"],
      verdict: "good",
      tone: { simple: "match", s4: "match" },
      badge: { simple: L("1 step", "1 qadam") },
      edges: [["simple", "s4", { tone: "match", flow: true }]],
      line: 7,
      note: L("The simple version reads like the requirement: Sunday or Saturday.", "Oddiy versiya talabning oʻzidek oʻqiladi: yakshanba yoki shanba."),
    },
    {
      tone: { simple: "default", s4: "default" },
      badge: { simple: "" },
      edges: [["simple", "s4"]],
      note: L(
        "Same speed, same result. KISS means minimising what the reader has to keep in their head.",
        "Tezlik ham, natija ham bir xil. KISS — oʻquvchi xayolida saqlashi kerak boʻlgan narsani kamaytirish.",
      ),
    },
  ],
};

export const yagni: Scene = {
  title: L("YAGNI: the plugin system nobody asked for", "YAGNI: hech kim soʻramagan plugin tizimi"),
  code: `// today's requirement: export as JSON
const exportJson = (data: unknown) =>
  new Blob([JSON.stringify(data)], { type: "application/json" });

// "for the future": nobody asked for these yet
interface ExportPlugin { name: string; export(data: unknown): Blob }
class ExportRegistry { register(p: ExportPlugin) {} }
class XmlExporter implements ExportPlugin { /* … */ }
class PdfExporter implements ExportPlugin { /* … */ }`,
  nodes: {
    need: { label: L("Need: export JSON", "Talab: JSON eksport"), x: 320, y: 40, w: 200, kind: "data" },
    reg: { label: "ExportRegistry", sub: "register · get · list", x: 320, y: 140, w: 210 },
    xml: { label: "XmlExporter", x: 110, y: 245, w: 140 },
    pdf: { label: "PdfExporter", x: 320, y: 245, w: 140 },
    csv: { label: "CsvExporter", x: 530, y: 245, w: 140 },
    json: { label: "exportJson()", sub: L("3 lines", "3 qator"), x: 320, y: 145, w: 180 },
    later: { label: L("Later: CSV really requested", "Keyin: CSV haqiqatan soʻraldi"), x: 320, y: 250, w: 260, kind: "data" },
  },
  frames: [
    {
      add: ["need"],
      line: 1,
      note: L("The only requirement today: export data as JSON.", "Bugungi yagona talab: ma'lumotni JSON sifatida eksport qilish."),
    },
    {
      add: ["reg"],
      verdict: "bad",
      edges: [["need", "reg"]],
      line: 7,
      note: L("Someone 'plans ahead' and builds a plugin registry…", "Kimdir 'oldindan rejalashtirib', plugin registry quradi…"),
    },
    {
      add: ["xml", "pdf", "csv"],
      addEdges: [
        ["reg", "xml", { dashed: true }],
        ["reg", "pdf", { dashed: true }],
        ["reg", "csv", { dashed: true }],
      ],
      line: 8,
      note: L("…and XML, PDF and CSV exporters, just in case.", "…va har ehtimolga qarshi XML, PDF va CSV exporter'lar."),
    },
    {
      tone: { reg: "danger", xml: "muted", pdf: "muted", csv: "muted" },
      badge: { reg: "+400 LOC" },
      line: 9,
      note: L(
        "All of it must be written, tested, reviewed and kept working. A year later only JSON is used — and the guessed API doesn't fit the real need anyway.",
        "Bularning hammasini yozish, test qilish, review qilish va ishlab turishini ta'minlash kerak. Bir yildan keyin faqat JSON ishlatiladi, taxmin qilingan API esa haqiqiy talabga baribir mos kelmaydi.",
      ),
    },
    {
      remove: ["reg", "xml", "pdf", "csv"],
      add: ["json"],
      verdict: "good",
      tone: { json: "match" },
      edges: [["need", "json", { tone: "match", flow: true }]],
      line: 2,
      note: L("YAGNI: write the three lines that are needed now.", "YAGNI: hozir kerakli uch qatorni yozing."),
    },
    {
      add: ["later"],
      tone: { json: "default", later: "compare" },
      addEdges: [["json", "later", { dashed: true, label: "refactor" }]],
      note: L(
        "When a second format is really requested, refactor then — with real requirements in hand. Clean code keeps that cheap.",
        "Ikkinchi format haqiqatan soʻralganda, oʻshanda refactor qiling — qoʻlingizda haqiqiy talablar bilan. Toza kod buni arzon qiladi.",
      ),
    },
  ],
};

export const prematureOptimization: Scene = {
  title: L("Measure first: where does the time go?", "Avval oʻlchang: vaqt qayerga ketyapti?"),
  code: `// hand-tuned before measuring: harder to read, saves 0.5 ms
function formatRow(r: Row) {
  let s = ""; for (let i = 0; i < r.cells.length; i++) s += r.cells[i] + "\\t";
  return s;
}
// the profiler shows where the time actually goes
const rows = await db.query(sql);         // 480 ms: N+1 queries
// fix the real bottleneck: one query with a JOIN
const rows = await db.query(sqlWithJoin); // 35 ms`,
  nodes: {
    parse: { label: "parseInput()", sub: "? ms", x: 85, y: 150, w: 140 },
    fmt: { label: "formatRow()", sub: "? ms", x: 245, y: 150, w: 140 },
    db: { label: "db.query()", sub: "? ms", x: 405, y: 150, w: 140 },
    render: { label: "render()", sub: "? ms", x: 560, y: 150, w: 140 },
  },
  frames: [
    {
      add: ["parse", "fmt", "db", "render"],
      edges: [["parse", "fmt"], ["fmt", "db"], ["db", "render"]],
      note: L("A page is slow. Where is the time spent? Nobody knows yet.", "Sahifa sekin. Vaqt qayerga ketyapti? Hozircha hech kim bilmaydi."),
    },
    {
      verdict: "bad",
      tone: { fmt: "compare" },
      badge: { fmt: L("tuned", "optimallashgan") },
      line: 3,
      note: L("A developer guesses and micro-optimises formatRow(). The code gets harder to read.", "Dasturchi taxmin qilib, formatRow()'ni mayda optimallashtiradi. Kod oʻqishga qiyinlashadi."),
    },
    {
      relabel: { parse: { sub: "2 ms" }, fmt: { sub: "1 → 0.5 ms" }, db: { sub: "480 ms" }, render: { sub: "12 ms" } },
      tone: { db: "danger", fmt: "muted" },
      badge: { db: "97%" },
      line: 7,
      note: L(
        "Then the profiler runs: formatRow() was 1 ms. The real cost is 480 ms in the database (N+1 queries).",
        "Keyin profiler ishga tushiriladi: formatRow() atigi 1 ms edi. Haqiqiy narx — bazadagi 480 ms (N+1 soʻrovlar).",
      ),
    },
    {
      verdict: "good",
      relabel: { db: { sub: "480 → 35 ms" } },
      tone: { db: "match", fmt: "default" },
      badge: { db: "13×", fmt: "" },
      line: 9,
      note: L("Optimise what was measured: one query with a JOIN. 13× faster where it matters.", "Oʻlchanganini optimallashtiring: JOIN bilan bitta soʻrov. Muhim joyda 13 barobar tezroq."),
    },
    {
      tone: { db: "default" },
      badge: { db: "" },
      note: L(
        "Knuth: premature optimisation is the root of all evil (in about 97% of cases). Write clear code, measure, then fix the hot 3%.",
        "Knuth: erta optimallashtirish — barcha yovuzliklarning ildizi (taxminan 97% holatda). Aniq kod yozing, oʻlchang, keyin 'issiq' 3%'ni tuzating.",
      ),
    },
  ],
};
