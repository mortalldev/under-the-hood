import { L, type Scene } from "../scene";

export const failFast: Scene = {
  title: L("Fail fast: crash at the door, not in production", "Fail fast: production'da emas, eshik oldida yiqiling"),
  code: `// fail late: a missing key becomes "" and travels on
const apiKey = process.env.API_KEY || "";
// … an hour later, deep inside a request:
await payments.charge({ key: apiKey }); // 401 Unauthorized

// fail fast: stop at startup with a clear message
const apiKey = process.env.API_KEY;
if (!apiKey) throw new Error("API_KEY is required");`,
  nodes: {
    boot: { label: L("App start", "Ilova start"), sub: 'API_KEY = ""', x: 90, y: 150, w: 150 },
    req: { label: L("User request", "Foydalanuvchi soʻrovi"), x: 260, y: 150, w: 150 },
    deep: { label: "charge()", sub: L("payment code", "toʻlov kodi"), x: 420, y: 150, w: 140 },
    err: { label: L("401 in prod", "prod'da 401"), x: 565, y: 150, w: 120, kind: "data" },
    fix: { label: L("Fix .env, redeploy", ".env'ni tuzat, qayta deploy"), x: 330, y: 150, w: 220, kind: "data" },
  },
  frames: [
    {
      add: ["boot"],
      verdict: "bad",
      line: 2,
      note: L('The key is missing, but the default "" hides it. The app starts happily.', 'Kalit yoʻq, lekin standart "" buni yashiradi. Ilova bemalol ishga tushadi.'),
    },
    {
      add: ["req"],
      edges: [["boot", "req", { label: L("1 hour", "1 soat"), flow: true }]],
      line: 3,
      note: L("Real users arrive.", "Haqiqiy foydalanuvchilar kela boshlaydi."),
    },
    {
      add: ["deep"],
      addEdges: [["req", "deep", { flow: true }]],
      line: 4,
      note: L("The empty key travels deep into the payment code…", "Boʻsh kalit toʻlov kodining ichigacha yetib boradi…"),
    },
    {
      add: ["err"],
      tone: { deep: "danger", err: "danger" },
      addEdges: [["deep", "err", { tone: "danger" }]],
      line: 4,
      note: L(
        "…and fails there: far from the cause, in production, with a vague error and real customers affected.",
        "…va oʻsha yerda yiqiladi: sababdan uzoqda, production'da, noaniq xato bilan va haqiqiy mijozlarga ta'sir qilib.",
      ),
    },
    {
      remove: ["req", "deep", "err"],
      add: ["fix"],
      verdict: "good",
      relabel: { boot: { sub: "API_KEY is required" } },
      tone: { boot: "danger", fix: "match" },
      badge: { boot: "✕" },
      edges: [["boot", "fix", { tone: "match", flow: true }]],
      line: 8,
      note: L(
        "Fail fast: validate at startup. The deploy fails immediately, with a message that names the problem.",
        "Fail fast: ishga tushishda tekshiring. Deploy darhol, muammoni nomi bilan aytadigan xabar bilan yiqiladi.",
      ),
    },
    {
      tone: { boot: "default", fix: "default" },
      badge: { boot: "" },
      edges: [["boot", "fix"]],
      note: L("Same idea inside functions: guard clauses reject bad input on the first lines.", "Funksiyalar ichida ham xuddi shunday: guard clause notoʻgʻri input'ni birinchi qatorlardayoq rad etadi."),
    },
  ],
};

export const leastAstonishment: Scene = {
  title: L("POLA: a getter with hidden side effects", "POLA: yashirin yon ta'sirli getter"),
  code: `// looks like a read…
function getUser(id: string) {
  cache.clear();               // surprise #1
  analytics.track("user");     // surprise #2
  return db.find(id);
}
// …name and behaviour agree
function findUser(id: string) { return db.find(id); }
function resetCache() { cache.clear(); }`,
  nodes: {
    caller: { label: L("profile page", "profil sahifasi"), x: 100, y: 150, w: 150 },
    fn: { label: "getUser()", x: 320, y: 150, w: 150 },
    db: { label: "db", x: 545, y: 150, w: 120, kind: "data" },
    cache: { label: "cache", x: 545, y: 50, w: 120, kind: "data" },
    an: { label: "analytics", x: 545, y: 250, w: 120, kind: "data" },
    reset: { label: "resetCache()", x: 320, y: 50, w: 150 },
  },
  frames: [
    {
      add: ["caller", "fn"],
      edges: [["caller", "fn", { label: L("get = read", "get = oʻqish"), flow: true }]],
      line: 2,
      note: L("The caller reads the name: a 'get' should only read.", "Chaqiruvchi nomni oʻqiydi: 'get' faqat oʻqishi kerak."),
    },
    {
      add: ["db"],
      addEdges: [["fn", "db"]],
      line: 5,
      note: L("It does read the user…", "U foydalanuvchini oʻqiydi ham…"),
    },
    {
      add: ["cache"],
      verdict: "bad",
      tone: { cache: "danger" },
      addEdges: [["fn", "cache", { tone: "danger", label: "clear()" }]],
      line: 3,
      note: L("…but it also wipes the cache, and the whole app suddenly gets slower.", "…lekin cache'ni ham tozalaydi va butun ilova birdan sekinlashadi."),
    },
    {
      add: ["an"],
      tone: { an: "danger", fn: "danger" },
      badge: { fn: "!" },
      addEdges: [["fn", "an", { tone: "danger", label: "track()" }]],
      line: 4,
      note: L(
        "…and sends analytics. Call it in a loop and you send 1,000 events. Nobody expected that from a getter.",
        "…va analytics yuboradi. Uni loop ichida chaqirsangiz, 1000 ta event ketadi. Getter'dan buni hech kim kutmagan.",
      ),
    },
    {
      remove: ["an"],
      add: ["reset"],
      verdict: "good",
      relabel: { fn: { label: "findUser()" } },
      tone: { fn: "match", cache: "default" },
      badge: { fn: "" },
      edges: [
        ["caller", "fn", { flow: true }],
        ["fn", "db"],
        ["reset", "cache", { label: "clear()" }],
      ],
      line: 8,
      note: L(
        "Make the name tell the truth, and move side effects into functions that announce them.",
        "Nom haqiqatni aytsin, yon ta'sirlarni esa ularni ochiq e'lon qiladigan funksiyalarga oʻtkazing.",
      ),
    },
    {
      tone: { fn: "default" },
      line: 9,
      note: L(
        "A classic JS surprise: [10, 1, 2].sort() → [1, 10, 2]. Design APIs so a reader can guess them right.",
        "JavaScript'dagi klassik kutilmagan holat: [10, 1, 2].sort() → [1, 10, 2]. API'larni oʻquvchi toʻgʻri taxmin qila oladigan qilib loyihalang.",
      ),
    },
  ],
};

export const commandQuerySeparation: Scene = {
  title: L("CQS: asking a question shouldn't change the answer", "CQS: savol berish javobni oʻzgartirmasligi kerak"),
  code: `let count = 0;
// mixed: returns a value AND changes state
function next() { return ++count; }
console.log(next()); // a debug line changes the result!
const id = next();

// command: changes state, returns nothing
function increment(): void { count++; }
// query: returns state, changes nothing
function current(): number { return count; }`,
  nodes: {
    state: { label: "count", sub: "0", x: 530, y: 150, w: 130, kind: "data" },
    fn: { label: "next()", sub: L("read + write", "oʻqish + yozish"), x: 300, y: 150, w: 160 },
    use: { label: "const id", x: 90, y: 230, w: 130 },
    log: { label: "console.log", x: 90, y: 70, w: 130 },
    q: { label: "current()", sub: "query", x: 300, y: 60, w: 160 },
  },
  frames: [
    {
      add: ["state", "fn"],
      verdict: "bad",
      edges: [["fn", "state", { label: "++" }]],
      line: 3,
      note: L("next() both returns the count and increments it.", "next() count'ni ham qaytaradi, ham oshiradi."),
    },
    {
      add: ["use"],
      relabel: { state: { sub: "1" } },
      badge: { use: "id = 1" },
      addEdges: [["use", "fn", { flow: true }]],
      line: 5,
      note: L("Normal use: id = 1.", "Oddiy ishlatish: id = 1."),
    },
    {
      add: ["log"],
      relabel: { state: { sub: "2" } },
      tone: { use: "danger", log: "compare" },
      badge: { use: "id = 2" },
      addEdges: [["log", "fn", { tone: "compare", flow: true }]],
      line: 4,
      note: L(
        "Add a debug log that calls next(), and the real id silently becomes 2. Asking a question changed the answer.",
        "next()'ni chaqiradigan debug log qoʻshing — haqiqiy id jimgina 2 boʻlib qoladi. Savol berish javobni oʻzgartirdi.",
      ),
    },
    {
      add: ["q"],
      verdict: "good",
      at: { fn: [300, 240] },
      relabel: { fn: { label: "increment()", sub: "command" }, state: { sub: "1" } },
      tone: { use: "default", log: "default" },
      badge: { use: "" },
      edges: [
        ["use", "fn", { label: "void" }],
        ["fn", "state", { label: "++", tone: "active" }],
        ["log", "q"],
        ["q", "state", { dashed: true, label: L("reads", "oʻqiydi") }],
      ],
      line: 8,
      note: L(
        "Split it: increment() is a command (returns void), current() is a query (no side effects).",
        "Ajrating: increment() — command (void qaytaradi), current() — query (yon ta'siri yoʻq).",
      ),
    },
    {
      tone: { log: "match", q: "match" },
      badge: { log: "1, 1, 1" },
      edges: [
        ["use", "fn", { label: "void" }],
        ["fn", "state", { label: "++" }],
        ["log", "q", { tone: "match", flow: true }],
        ["q", "state", { dashed: true, label: L("reads", "oʻqiydi") }],
      ],
      line: 10,
      note: L(
        "Now current() can be called any number of times — in logs, tests or the debugger — and nothing changes.",
        "Endi current()'ni istalgancha chaqirish mumkin — log'da, testda, debugger'da — va hech narsa oʻzgarmaydi.",
      ),
    },
  ],
};

export const immutability: Scene = {
  title: L("Immutability: shared references vs new values", "Immutability: umumiy havola va yangi qiymat"),
  code: `const cart = { items: ["book"] };
const saved = cart;            // same object, not a copy
cart.items.push("pen");        // mutation
// saved.items is ["book", "pen"] too — and React won't re-render

// immutable update: a new object, the old one untouched
const next = { ...cart, items: [...cart.items, "pen"] };
// cart !== next → change detection is a cheap reference check`,
  nodes: {
    a: { label: "cart", x: 100, y: 60, w: 120, kind: "data" },
    s: { label: "saved", x: 100, y: 150, w: 120, kind: "data" },
    n: { label: "next", x: 100, y: 245, w: 120, kind: "data" },
    obj: { label: "{ items }", sub: '["book"]', x: 420, y: 105, w: 190 },
    obj2: { label: L("{ items } (new)", "{ items } (yangi)"), sub: '["book", "pen"]', x: 420, y: 245, w: 190 },
  },
  frames: [
    {
      add: ["a", "obj"],
      edges: [["a", "obj"]],
      line: 1,
      note: L("cart points to an object in memory.", "cart xotiradagi obyektga ishora qiladi."),
    },
    {
      add: ["s"],
      addEdges: [["s", "obj", { label: L("same ref", "bir xil havola") }]],
      line: 2,
      note: L("saved = cart copies the reference, not the object.", "saved = cart obyektni emas, havolani nusxalaydi."),
    },
    {
      verdict: "bad",
      relabel: { obj: { sub: '["book", "pen"]' } },
      tone: { obj: "danger" },
      edges: [
        ["a", "obj", { tone: "danger", label: "push()", flow: true }],
        ["s", "obj", { label: L("same ref", "bir xil havola") }],
      ],
      line: 3,
      note: L("push() mutates the shared object…", "push() umumiy obyektni oʻzgartiradi…"),
    },
    {
      tone: { s: "danger" },
      badge: { s: L("changed!", "oʻzgardi!") },
      line: 4,
      note: L(
        "…so saved changed too, behind its back. And React compares references: same object → no re-render.",
        "…demak saved ham bilmagan holda oʻzgardi. React esa havolalarni solishtiradi: bir xil obyekt → qayta render yoʻq.",
      ),
    },
    {
      add: ["n", "obj2"],
      verdict: "good",
      relabel: { obj: { sub: '["book"]' } },
      tone: { obj: "default", s: "default", obj2: "match", n: "match" },
      badge: { s: "" },
      edges: [
        ["a", "obj"],
        ["s", "obj"],
        ["n", "obj2", { tone: "match", flow: true }],
      ],
      line: 7,
      note: L("Immutable update: build a new object. The old one stays as it was, so saved is still correct.", "Immutable yangilash: yangi obyekt yarating. Eskisi oʻz holicha qoladi, saved ham toʻgʻri qoladi."),
    },
    {
      tone: { n: "active", obj2: "default" },
      badge: { n: "≠ cart" },
      edges: [["a", "obj"], ["s", "obj"], ["n", "obj2"]],
      line: 8,
      note: L(
        "cart !== next is a one-step check. That is how React, Redux and memo detect changes cheaply.",
        "cart !== next — bir qadamli tekshiruv. React, Redux va memo oʻzgarishni aynan shunday arzon aniqlaydi.",
      ),
    },
  ],
};

export const leastPrivilege: Scene = {
  title: L("Least privilege: limit the blast radius", "Least privilege: zarar radiusini cheklash"),
  code: `// the report job connects as the admin user
const db = connect({ user: "admin" });   // can DROP TABLE

// give it only what it needs
const db = connect({ user: "report_reader" });
// GRANT SELECT ON orders TO report_reader;
// a bug or a leaked key can now only read orders`,
  nodes: {
    job: { label: L("report job", "hisobot job'i"), sub: "user: admin", x: 130, y: 150, w: 180 },
    orders: { label: "orders", x: 490, y: 50, w: 140, kind: "data" },
    users: { label: "users", x: 490, y: 150, w: 140, kind: "data" },
    payments: { label: "payments", x: 490, y: 250, w: 140, kind: "data" },
  },
  frames: [
    {
      add: ["job"],
      verdict: "bad",
      line: 2,
      note: L("A nightly report job connects as admin.", "Tungi hisobot job'i admin sifatida ulanadi."),
    },
    {
      add: ["orders", "users", "payments"],
      edges: [
        ["job", "orders", { label: "read" }],
        ["job", "users", { label: "write" }],
        ["job", "payments", { label: "drop" }],
      ],
      line: 2,
      note: L(
        "It can read, write and even drop every table — although all it needs is to read orders.",
        "U har bir jadvalni oʻqiy, yoza va hatto oʻchira oladi, garchi unga faqat orders'ni oʻqish kerak boʻlsa ham.",
      ),
    },
    {
      tone: { job: "danger", users: "danger", payments: "danger" },
      badge: { job: L("bug / leak", "bug / sizish") },
      edges: [
        ["job", "orders", { label: "read" }],
        ["job", "users", { label: "write", tone: "danger", flow: true }],
        ["job", "payments", { label: "drop", tone: "danger", flow: true }],
      ],
      note: L(
        "One SQL-injection bug or a leaked key, and an attacker inherits all of that power.",
        "Bitta SQL injection xatosi yoki sizib chiqqan kalit — va hujumchi shu kuchning barchasini qoʻlga kiritadi.",
      ),
    },
    {
      verdict: "good",
      relabel: { job: { sub: "user: report_reader" } },
      tone: { job: "default", users: "muted", payments: "muted", orders: "match" },
      badge: { job: "" },
      edges: [["job", "orders", { label: "SELECT", tone: "match", flow: true }]],
      line: 6,
      note: L("Grant only SELECT on orders.", "Faqat orders'ga SELECT ruxsatini bering."),
    },
    {
      tone: { job: "compare" },
      badge: { job: L("bug / leak", "bug / sizish") },
      edges: [
        ["job", "orders", { label: "SELECT", tone: "match" }],
        ["job", "users", { label: L("denied", "rad etildi"), tone: "danger", dashed: true }],
        ["job", "payments", { label: L("denied", "rad etildi"), tone: "danger", dashed: true }],
      ],
      line: 7,
      note: L(
        "The same bug now hits a wall: the damage is limited to reading one table.",
        "Endi oʻsha xato devorga urilib qoladi: zarar bitta jadvalni oʻqish bilan cheklanadi.",
      ),
    },
  ],
};
