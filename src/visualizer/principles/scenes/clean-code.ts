import { L, type Scene } from "../scene";

export const codeSmells: Scene = {
  title: L("Code smells: symptoms with known cures", "Code smell: davosi ma'lum alomatlar"),
  code: `function processOrder(id, user, items, coupon, tax, ship,
                      notify, isAdmin, dryRun) {        // long parameter list
  // … 180 lines …                                     // long function
  if (isAdmin) { /* … */ } else { /* … */ }             // flag argument
  const total = items.reduce((s, i) => s + i.price, 0); // duplicated elsewhere
}
// each smell suggests a refactoring:
// long function → Extract Function · many params → Parameter Object
// flag argument → split into two functions · duplication → extract & reuse`,
  nodes: {
    fn: { label: "processOrder()", sub: L("works ✓", "ishlaydi ✓"), x: 320, y: 150, w: 210, h: 60 },
    params: { label: "Long parameter list", sub: L("9 params", "9 parametr"), x: 120, y: 50, w: 200 },
    long: { label: "Long function", sub: L("180 lines", "180 qator"), x: 520, y: 50, w: 200 },
    flag: { label: "Flag argument", sub: "isAdmin", x: 120, y: 250, w: 200 },
    dup: { label: "Duplicated code", sub: L("3 places", "3 joyda"), x: 520, y: 250, w: 200 },
  },
  frames: [
    {
      add: ["fn"],
      line: 1,
      note: L("The code works. But something smells.", "Kod ishlaydi. Lekin nimadir 'hid' chiqaryapti."),
    },
    {
      add: ["params"],
      verdict: "bad",
      tone: { params: "compare" },
      edges: [["params", "fn", { dashed: true, tone: "compare" }]],
      line: 2,
      note: L("9 parameters: callers can't remember the order, and two booleans are easy to swap.", "9 ta parametr: chaqiruvchilar tartibni eslay olmaydi, ikkita boolean'ni almashtirib yuborish oson."),
    },
    {
      add: ["long"],
      tone: { long: "compare" },
      addEdges: [["long", "fn", { dashed: true, tone: "compare" }]],
      line: 3,
      note: L("180 lines: it does many things, so it can't be named honestly.", "180 qator: u koʻp ish qiladi, shuning uchun uni halol nomlab boʻlmaydi."),
    },
    {
      add: ["flag"],
      tone: { flag: "compare" },
      addEdges: [["flag", "fn", { dashed: true, tone: "compare" }]],
      line: 4,
      note: L("A boolean flag argument: two functions pretending to be one.", "Boolean flag argument: oʻzini bitta qilib koʻrsatayotgan ikki funksiya."),
    },
    {
      add: ["dup"],
      tone: { dup: "compare", fn: "danger" },
      badge: { fn: L("4 smells", "4 smell") },
      addEdges: [["dup", "fn", { dashed: true, tone: "compare" }]],
      line: 5,
      note: L("And the total is calculated the same way in three places.", "Jami summa esa uch joyda bir xil usulda hisoblanadi."),
    },
    {
      verdict: "good",
      relabel: {
        params: { sub: "→ Parameter Object" },
        long: { sub: "→ Extract Function" },
        flag: { sub: L("→ split in two", "→ ikkiga ajratish") },
        dup: { sub: "→ extract & reuse" },
      },
      tone: { params: "match", long: "match", flag: "match", dup: "match", fn: "default" },
      badge: { fn: "" },
      edges: [
        ["params", "fn", { tone: "match" }],
        ["long", "fn", { tone: "match" }],
        ["flag", "fn", { tone: "match" }],
        ["dup", "fn", { tone: "match" }],
      ],
      line: 8,
      note: L("A smell is not a bug but a hint, and each one has a well-known refactoring.", "Smell — xato emas, ishora. Har birining ma'lum refactoring usuli bor."),
    },
  ],
};

export const refactoring: Scene = {
  title: L("Refactoring: small steps under green tests", "Refactoring: yashil testlar ostida kichik qadamlar"),
  code: `// 1. tests are green before you start
// 2. one small, behaviour-preserving step at a time
function calcPrice(order: Order) {
  const base = subtotal(order);
  const discounted = applyDiscount(base, order.coupon); // Extract Function
  return addTax(discounted, order.region);              // Extract Function
}
// 3. run the tests after every step; commit when green
// never mix refactoring and a new feature in one step`,
  nodes: {
    tests: { label: "tests", sub: "42 ✓", x: 320, y: 40, w: 150, kind: "data" },
    v1: { label: "calcPrice()", sub: L("60 lines", "60 qator"), x: 320, y: 160, w: 190 },
    ext1: { label: "applyDiscount()", x: 500, y: 130, w: 170 },
    ext2: { label: "addTax()", x: 500, y: 230, w: 170 },
    feat: { label: L("+ new feature", "+ yangi imkoniyat"), x: 170, y: 260, w: 170, kind: "data" },
  },
  frames: [
    {
      add: ["v1", "tests"],
      tone: { tests: "match" },
      edges: [["tests", "v1", { tone: "match", label: L("guards", "himoya") }]],
      line: 1,
      note: L("Start from green tests: they pin down today's behaviour.", "Yashil testlardan boshlang: ular bugungi xatti-harakatni qayd etadi."),
    },
    {
      add: ["ext1"],
      at: { v1: [190, 170] },
      relabel: { v1: { sub: L("40 lines", "40 qator") } },
      tone: { v1: "active" },
      addEdges: [["v1", "ext1"]],
      line: 5,
      note: L("One small step: extract applyDiscount().", "Bitta kichik qadam: applyDiscount()'ni ajratib chiqaring."),
    },
    {
      badge: { tests: "✓" },
      edges: [["tests", "v1", { tone: "match", flow: true }], ["v1", "ext1"]],
      line: 7,
      note: L("Run the tests: still green, behaviour unchanged. Commit.", "Testlarni ishga tushiring: hamon yashil, xatti-harakat oʻzgarmagan. Commit."),
    },
    {
      add: ["ext2"],
      relabel: { v1: { sub: L("12 lines", "12 qator") } },
      addEdges: [["v1", "ext2"]],
      line: 6,
      note: L("Next step: extract addTax(). Run the tests again.", "Keyingi qadam: addTax()'ni ajrating. Testlarni yana ishga tushiring."),
    },
    {
      add: ["feat"],
      verdict: "bad",
      tone: { tests: "danger", feat: "danger" },
      badge: { tests: "✕ 2" },
      addEdges: [["feat", "v1", { tone: "danger", dashed: true }]],
      line: 9,
      note: L(
        "Sneak a feature into the same step and two tests fail. Was it the refactor or the feature? You can't tell.",
        "Shu qadamga yangi imkoniyat qoʻshib yuborsangiz, ikkita test yiqiladi. Refactor buzdimi yoki imkoniyatmi? Bilib boʻlmaydi.",
      ),
    },
    {
      remove: ["feat"],
      verdict: "good",
      tone: { tests: "match", v1: "match" },
      badge: { tests: "✓" },
      line: 3,
      note: L("Refactor and feature go in separate commits. calcPrice() now reads like a recipe.", "Refactor va imkoniyat alohida commit'larda. Endi calcPrice() retsept kabi oʻqiladi."),
    },
  ],
};

export const technicalDebt: Scene = {
  title: L("Technical debt: the interest you pay later", "Technical debt: keyin toʻlanadigan foiz"),
  code: `// shortcut: copy-paste the checkout for each new country
if (country === "UZ") { /* copy of checkout, edited */ }
if (country === "KZ") { /* another copy */ }
// interest: every checkout change is now made in every copy

// paying it back: one checkout, per-country rules as data
const rules: Record<Country, CheckoutRules> = { UZ: …, KZ: … };
checkout(order, rules[order.country]);`,
  nodes: {
    debt: { label: L("debt", "qarz"), sub: L("0 copies", "0 nusxa"), x: 320, y: 50, w: 170, kind: "data" },
    f1: { label: L("UZ checkout", "UZ checkout"), x: 85, y: 200, w: 140 },
    f2: { label: L("KZ checkout", "KZ checkout"), x: 245, y: 200, w: 140 },
    f3: { label: L("tax bug fix", "soliq tuzatish"), x: 405, y: 200, w: 140 },
    f4: { label: L("new payment", "yangi toʻlov"), x: 560, y: 200, w: 140 },
  },
  frames: [
    {
      add: ["f1"],
      badge: { f1: L("2 days", "2 kun") },
      line: 1,
      note: L("Deadline: copy the checkout for a new country. Shipped fast.", "Muddat yaqin: checkout yangi davlat uchun nusxalanadi. Tez yetkazildi."),
    },
    {
      add: ["debt", "f2"],
      verdict: "bad",
      relabel: { debt: { sub: L("2 copies", "2 nusxa") } },
      tone: { debt: "compare" },
      badge: { f2: L("2 days", "2 kun") },
      edges: [["debt", "f1", { dashed: true }], ["debt", "f2", { dashed: true }]],
      line: 3,
      note: L("Again for the next country. The debt grows quietly.", "Keyingi davlat uchun yana. Qarz jimgina oʻsadi."),
    },
    {
      add: ["f3"],
      tone: { f3: "compare" },
      badge: { f3: "×2" },
      addEdges: [["debt", "f3", { dashed: true, tone: "compare" }]],
      line: 4,
      note: L("Interest: one tax fix must be made in both copies — and one is easy to miss.", "Foiz: bitta soliq tuzatishini ikkala nusxada qilish kerak — biri osongina esdan chiqadi."),
    },
    {
      add: ["f4"],
      tone: { f4: "danger", debt: "danger" },
      badge: { f4: L("6 days", "6 kun") },
      addEdges: [["debt", "f4", { dashed: true, tone: "danger" }]],
      line: 4,
      note: L("Each new feature costs more than the last. That slowdown is the interest.", "Har bir yangi imkoniyat oldingisidan qimmatroq. Mana shu sekinlashuv — foiz."),
    },
    {
      verdict: "good",
      relabel: { debt: { sub: L("paid: 1 checkout", "toʻlandi: 1 checkout") } },
      tone: { debt: "match", f3: "match", f4: "match" },
      badge: { f3: "×1", f4: L("1 day", "1 kun") },
      edges: [],
      line: 7,
      note: L("Pay it back: one checkout, with country differences as data. New work is cheap again.", "Qarzni toʻlang: bitta checkout, davlatlar farqi esa ma'lumot sifatida. Yangi ish yana arzonlashdi."),
    },
    {
      tone: { debt: "default", f3: "default", f4: "default" },
      note: L(
        "Debt isn't always bad: a conscious shortcut to hit a deadline can be smart — if you record it and plan the payback.",
        "Qarz har doim ham yomon emas: muddatga ulgurish uchun ongli qisqa yoʻl oqilona boʻlishi mumkin — agar uni yozib qoʻyib, toʻlashni rejalashtirsangiz.",
      ),
    },
  ],
};

export const boyScoutRule: Scene = {
  title: L("Boy Scout Rule: small cleanups compound", "Boy Scout Rule: kichik tozalashlar jamlanadi"),
  code: `// you came to fix a bug on line 120…
- const d = calc(x, true);
+ const deliveryFee = calcDeliveryFee(order, { express: true });
// …and also, while you are there:
//  • renamed one unclear variable
//  • deleted a dead function
//  • added a test for the bug you fixed
// small, in the same area, no big rewrite`,
  nodes: {
    file: { label: "cart.ts", sub: L("smells: 6", "smell: 6"), x: 320, y: 60, w: 180 },
    c1: { label: L("you: bug fix", "siz: bug fix"), x: 85, y: 220, w: 140, kind: "data" },
    c2: { label: L("teammate", "hamkasb"), x: 245, y: 220, w: 140, kind: "data" },
    c3: { label: L("you again", "yana siz"), x: 405, y: 220, w: 140, kind: "data" },
    c4: { label: L("next week", "keyingi hafta"), x: 560, y: 220, w: 140, kind: "data" },
  },
  frames: [
    {
      add: ["file"],
      tone: { file: "danger" },
      line: 1,
      note: L("You open cart.ts to fix a bug. The file has 6 known smells.", "Bugni tuzatish uchun cart.ts'ni ochasiz. Faylda 6 ta ma'lum smell bor."),
    },
    {
      add: ["c1"],
      relabel: { file: { sub: L("smells: 5", "smell: 5") } },
      tone: { file: "compare" },
      badge: { c1: "+ rename" },
      edges: [["c1", "file", { flow: true }]],
      line: 3,
      note: L("Fix the bug and rename the unclear variable right next to it.", "Bugni tuzating va yonidagi tushunarsiz oʻzgaruvchi nomini oʻzgartiring."),
    },
    {
      add: ["c2"],
      relabel: { file: { sub: L("smells: 4", "smell: 4") } },
      badge: { c2: "+ dead code" },
      addEdges: [["c2", "file", { flow: true }]],
      line: 6,
      note: L("A teammate passes by later and deletes a dead function.", "Keyinroq hamkasb oʻtib ketayotib, ishlatilmaydigan funksiyani oʻchiradi."),
    },
    {
      add: ["c3"],
      relabel: { file: { sub: L("smells: 3", "smell: 3") } },
      badge: { c3: "+ test" },
      addEdges: [["c3", "file", { flow: true }]],
      line: 7,
      note: L("You come back and add the missing test.", "Siz qaytib kelib, yetishmayotgan testni qoʻshasiz."),
    },
    {
      add: ["c4"],
      verdict: "good",
      relabel: { file: { sub: L("smells: 1", "smell: 1") } },
      tone: { file: "match" },
      badge: { c4: "+ extract" },
      addEdges: [["c4", "file", { flow: true, tone: "match" }]],
      line: 8,
      note: L("No big 'rewrite sprint' was needed. Small, constant cleanups add up.", "Katta 'qayta yozish sprinti' kerak boʻlmadi. Kichik, doimiy tozalashlar jamlanib boradi."),
    },
    {
      tone: { file: "default" },
      line: 8,
      note: L(
        "Keep it scoped: clean what you touch, in the same area. A large unrelated cleanup belongs in its own PR.",
        "Doirani saqlang: tekkan joyingizni, oʻsha atrofda tozalang. Katta, aloqasiz tozalash alohida PR'ga loyiq.",
      ),
    },
  ],
};
