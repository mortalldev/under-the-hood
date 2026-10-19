import { L, type Scene } from "../scene";

export const singleResponsibility: Scene = {
  title: L("SRP: one class, three reasons to change", "SRP: bitta class, oʻzgarishning uchta sababi"),
  code: `class InvoiceService {
  total(items: Item[]) { /* business rules */ }
  save(invoice: Invoice) { /* SQL */ }
  email(invoice: Invoice) { /* SMTP + HTML */ }
}

// after: split by reason to change
class InvoiceCalculator { total(items: Item[]) {} }
class InvoiceRepository { save(invoice: Invoice) {} }
class InvoiceMailer     { send(invoice: Invoice) {} }`,
  nodes: {
    svc: { label: "InvoiceService", sub: "total · save · email", x: 320, y: 185, w: 240, h: 62 },
    fin: { label: L("Accounting", "Buxgalteriya"), x: 110, y: 45, kind: "data" },
    dba: { label: "DBA", x: 320, y: 45, kind: "data" },
    mkt: { label: L("Marketing", "Marketing"), x: 530, y: 45, kind: "data" },
    calc: { label: "InvoiceCalculator", sub: "total()", x: 110, y: 220, w: 170 },
    repo: { label: "InvoiceRepository", sub: "save()", x: 320, y: 220, w: 170 },
    mail: { label: "InvoiceMailer", sub: "send()", x: 530, y: 220, w: 170 },
  },
  frames: [
    {
      add: ["svc"],
      verdict: "bad",
      line: 1,
      note: L("One class does three jobs: it calculates the total, saves to the database and sends the email.", "Bitta class uchta ishni qiladi: jamini hisoblaydi, bazaga saqlaydi va email yuboradi."),
    },
    {
      add: ["fin"],
      tone: { svc: "compare" },
      edges: [["fin", "svc", { tone: "compare", label: L("tax rule", "soliq qoidasi"), flow: true }]],
      line: 2,
      note: L("Accounting changes the tax rule → InvoiceService has to change.", "Buxgalteriya soliq qoidasini oʻzgartiradi → InvoiceService oʻzgarishi kerak."),
    },
    {
      add: ["dba"],
      addEdges: [["dba", "svc", { tone: "compare", label: L("new DB", "yangi DB"), flow: true }]],
      line: 3,
      note: L("The DBA moves to a new database → the same class changes again.", "DBA yangi bazaga oʻtadi → yana oʻsha class oʻzgaradi."),
    },
    {
      add: ["mkt"],
      tone: { svc: "danger" },
      badge: { svc: "×3" },
      addEdges: [["mkt", "svc", { tone: "compare", label: L("template", "shablon"), flow: true }]],
      line: 4,
      note: L(
        "Marketing wants a new email template. Three teams, three reasons to change, one file: merge conflicts and changes that break unrelated features.",
        "Marketing yangi email shablonini soʻraydi. Uch jamoa, oʻzgarishning uch sababi, bitta fayl: merge conflict'lar va bogʻliq boʻlmagan imkoniyatlarni buzadigan oʻzgarishlar.",
      ),
    },
    {
      remove: ["svc"],
      add: ["calc"],
      verdict: "good",
      tone: { fin: "match", calc: "match" },
      edges: [["fin", "calc", { tone: "match", flow: true }]],
      line: 8,
      note: L("Split by reason to change. Accounting's rules now live in InvoiceCalculator only.", "Oʻzgarish sababi boʻyicha ajrating. Buxgalteriya qoidalari endi faqat InvoiceCalculator'da."),
    },
    {
      add: ["repo"],
      tone: { dba: "match", repo: "match" },
      addEdges: [["dba", "repo", { tone: "match", flow: true }]],
      line: 9,
      note: L("Persistence goes to InvoiceRepository — the DBA's changes land here.", "Saqlash InvoiceRepository'ga oʻtadi — DBA oʻzgarishlari shu yerga tushadi."),
    },
    {
      add: ["mail"],
      tone: { mkt: "match", mail: "match" },
      addEdges: [["mkt", "mail", { tone: "match", flow: true }]],
      line: 10,
      note: L("Email goes to InvoiceMailer. Each class now answers to exactly one team.", "Email InvoiceMailer'ga oʻtadi. Endi har bir class aynan bitta jamoaga javob beradi."),
    },
    {
      tone: { fin: "active", calc: "active", dba: "muted", repo: "muted", mkt: "muted", mail: "muted" },
      edges: [["fin", "calc", { tone: "active", flow: true }]],
      note: L(
        "A tax change now touches one small class. The other two are not edited, re-reviewed or put at risk.",
        "Endi soliq oʻzgarishi bitta kichik class'ga tegadi. Qolgan ikkitasi tahrirlanmaydi, qayta review qilinmaydi va xavf ostida qolmaydi.",
      ),
    },
  ],
};

export const openClosed: Scene = {
  title: L("OCP: add a payment method without editing checkout", "OCP: checkout'ni tahrirlamasdan toʻlov turi qoʻshish"),
  code: `// before: every new method edits checkout()
function checkout(method: string, amount: number) {
  if (method === "card") { /* … */ }
  else if (method === "paypal") { /* … */ }
  else if (method === "click") { /* edit again! */ }
}

// after: closed for modification, open for extension
interface PaymentMethod { pay(amount: number): Promise<void> }
class CardPayment implements PaymentMethod { /* … */ }
class PaypalPayment implements PaymentMethod { /* … */ }
class ClickPayment implements PaymentMethod { /* new file */ }
const checkout = (m: PaymentMethod, amount: number) => m.pay(amount);`,
  nodes: {
    old: { label: "checkout()", sub: "if card … else if paypal", x: 320, y: 140, w: 260, h: 62 },
    chk: { label: "checkout()", sub: "m.pay(amount)", x: 320, y: 45, w: 180 },
    iface: { label: "PaymentMethod", sub: "pay(amount)", x: 320, y: 145, w: 180, kind: "interface" },
    card: { label: "CardPayment", x: 110, y: 250 },
    paypal: { label: "PaypalPayment", x: 320, y: 250 },
    click: { label: "ClickPayment", x: 530, y: 250 },
  },
  frames: [
    {
      add: ["old"],
      verdict: "bad",
      line: 3,
      note: L("checkout() knows every payment method by name.", "checkout() har bir toʻlov turini nomi bilan biladi."),
    },
    {
      relabel: { old: { sub: "card | paypal | click" } },
      tone: { old: "danger" },
      badge: { old: L("edit", "tahrir") },
      line: 5,
      note: L(
        "Adding Click means opening tested code and editing it. Every new method risks breaking the old ones.",
        "Click qoʻshish uchun tekshirilgan kodni ochib tahrirlash kerak. Har bir yangi tur eskilarini buzish xavfini tugʻdiradi.",
      ),
    },
    {
      remove: ["old"],
      add: ["chk", "iface"],
      verdict: "good",
      edges: [["chk", "iface", { label: "pay()" }]],
      line: 9,
      note: L("Introduce an abstraction: checkout() only talks to the PaymentMethod interface.", "Abstraksiya kiriting: checkout() faqat PaymentMethod interface'i bilan gaplashadi."),
    },
    {
      add: ["card", "paypal"],
      addEdges: [
        ["card", "iface", { dashed: true }],
        ["paypal", "iface", { dashed: true }],
      ],
      line: 10,
      note: L("Existing methods implement the interface.", "Mavjud toʻlov turlari interface'ni amalga oshiradi."),
    },
    {
      add: ["click"],
      tone: { click: "match", chk: "match" },
      badge: { click: L("new", "yangi"), chk: L("0 edits", "0 tahrir") },
      addEdges: [["click", "iface", { dashed: true, tone: "match" }]],
      line: 12,
      note: L(
        "A new method is a new class. checkout() is not touched: closed for modification, open for extension.",
        "Yangi tur — yangi class. checkout()'ga tegilmaydi: oʻzgartirish uchun yopiq, kengaytirish uchun ochiq.",
      ),
    },
    {
      tone: { click: "default", chk: "active" },
      badge: { click: "", chk: "" },
      edges: [
        ["chk", "iface", { label: "pay()", tone: "active", flow: true }],
        ["card", "iface", { dashed: true }],
        ["paypal", "iface", { dashed: true }],
        ["click", "iface", { dashed: true }],
      ],
      line: 13,
      note: L("At runtime checkout() calls pay() on whichever implementation it receives.", "Ishlash vaqtida checkout() qaysi implementatsiya berilsa, oʻshaning pay() metodini chaqiradi."),
    },
  ],
};

export const liskovSubstitution: Scene = {
  title: L("LSP: Square breaks Rectangle's promise", "LSP: Square Rectangle'ning va'dasini buzadi"),
  code: `class Rectangle {
  setWidth(w: number) { this.width = w; }
  area() { return this.width * this.height; }
}
class Square extends Rectangle {
  setWidth(w: number) { this.width = w; this.height = w; }
}
function stretch(r: Rectangle) {
  r.setWidth(10);
  return r.area(); // caller expects 10 × height
}
// fix: interface Shape { area(): number } — no false "is-a"`,
  nodes: {
    fn: { label: "stretch(r)", sub: "setWidth(10)", x: 100, y: 150, w: 150 },
    rect: { label: "Rectangle", sub: "2 × 5", x: 330, y: 75, w: 150 },
    sq: { label: "Square", sub: "5 × 5", x: 330, y: 225, w: 150 },
    resR: { label: "area = 50", x: 545, y: 75, w: 130, kind: "data" },
    resS: { label: "area = 100", x: 545, y: 225, w: 130, kind: "data" },
    shape: { label: "Shape", sub: "area()", x: 320, y: 60, kind: "interface" },
  },
  frames: [
    {
      add: ["fn", "rect"],
      edges: [["fn", "rect"]],
      line: 8,
      note: L("stretch() is written against Rectangle: set the width to 10, keep the height.", "stretch() Rectangle uchun yozilgan: kenglikni 10 qiladi, balandlik oʻzgarmaydi."),
    },
    {
      add: ["resR"],
      relabel: { rect: { sub: "10 × 5" } },
      tone: { resR: "match" },
      edges: [["fn", "rect", { flow: true }], ["rect", "resR", { tone: "match" }]],
      line: 10,
      note: L("With a real Rectangle (2 × 5) the result is 50, as the caller expects.", "Haqiqiy Rectangle (2 × 5) bilan natija 50 — chaqiruvchi kutganidek."),
    },
    {
      add: ["sq"],
      verdict: "bad",
      addEdges: [["fn", "sq", { flow: true }]],
      line: 5,
      note: L("Square extends Rectangle, so the type checker happily accepts it here.", "Square Rectangle'dan meros oladi, shuning uchun type checker uni bemalol qabul qiladi."),
    },
    {
      add: ["resS"],
      relabel: { sq: { sub: "10 × 10" } },
      tone: { sq: "danger", resS: "danger" },
      addEdges: [["sq", "resS", { tone: "danger" }]],
      line: 6,
      note: L(
        "But Square.setWidth also changes the height: 100 instead of 50. The subclass broke the parent's promise.",
        "Lekin Square.setWidth balandlikni ham oʻzgartiradi: 50 oʻrniga 100. Subclass parent'ning va'dasini buzdi.",
      ),
    },
    {
      remove: ["fn", "resR", "resS"],
      add: ["shape"],
      verdict: "good",
      at: { rect: [180, 210], sq: [460, 210] },
      relabel: { rect: { sub: "w × h" }, sq: { sub: "side²" } },
      tone: { sq: "default" },
      edges: [
        ["rect", "shape", { dashed: true }],
        ["sq", "shape", { dashed: true }],
      ],
      line: 12,
      note: L(
        "Fix: drop the false 'is-a'. Both implement Shape, and nobody can call setWidth on a Square any more.",
        "Yechim: soxta 'is-a' munosabatidan voz keching. Ikkalasi ham Shape'ni amalga oshiradi, endi hech kim Square'da setWidth chaqira olmaydi.",
      ),
    },
    {
      tone: { rect: "match", sq: "match" },
      note: L(
        "Rule of thumb: if a subclass has to throw 'not supported', or callers check instanceof, LSP is broken.",
        "Amaliy belgi: subclass 'not supported' xatosini tashlashga majbur boʻlsa yoki chaqiruvchilar instanceof tekshirsa, LSP buzilgan.",
      ),
    },
  ],
};

export const interfaceSegregation: Scene = {
  title: L("ISP: a fat interface forces lies", "ISP: katta interface yolgʻonga majburlaydi"),
  code: `interface Machine {
  print(doc: Doc): void;
  scan(doc: Doc): void;
  fax(doc: Doc): void;
}
class SimplePrinter implements Machine {
  scan() { throw new Error("Not supported"); }
  fax()  { throw new Error("Not supported"); }
}
// split: each client depends only on what it uses
interface Printer { print(doc: Doc): void }
interface Scanner { scan(doc: Doc): void }
interface Fax     { fax(doc: Doc): void }`,
  nodes: {
    fat: { label: "Machine", sub: "print · scan · fax", x: 320, y: 70, w: 220, kind: "interface" },
    sp: { label: "SimplePrinter", x: 170, y: 225, w: 160 },
    om: { label: "OfficeMachine", x: 470, y: 225, w: 160 },
    pr: { label: "Printer", sub: "print()", x: 130, y: 70, w: 140, kind: "interface" },
    sc: { label: "Scanner", sub: "scan()", x: 320, y: 70, w: 140, kind: "interface" },
    fx: { label: "Fax", sub: "fax()", x: 510, y: 70, w: 140, kind: "interface" },
  },
  frames: [
    {
      add: ["fat"],
      verdict: "bad",
      line: 1,
      note: L("One fat interface with three methods.", "Uchta metodli bitta katta interface."),
    },
    {
      add: ["sp", "om"],
      edges: [
        ["sp", "fat", { dashed: true }],
        ["om", "fat", { dashed: true }],
      ],
      line: 6,
      note: L("Every implementer must provide all three.", "Har bir implementatsiya uchalasini ham taqdim etishi shart."),
    },
    {
      tone: { sp: "danger" },
      badge: { sp: "2 ✕" },
      line: 7,
      note: L(
        "SimplePrinter can only print, yet it must 'implement' scan and fax by throwing. The type now lies.",
        "SimplePrinter faqat chop eta oladi, lekin scan va fax'ni xato tashlab 'amalga oshirishga' majbur. Endi type yolgʻon gapiradi.",
      ),
    },
    {
      relabel: { fat: { sub: "print · scan · fax(opts)" } },
      tone: { fat: "compare" },
      line: 4,
      note: L(
        "When fax() changes its signature, SimplePrinter has to change too — although it never faxes.",
        "fax() imzosi oʻzgarsa, SimplePrinter ham oʻzgarishi kerak, garchi u hech qachon fax yubormasa ham.",
      ),
    },
    {
      remove: ["fat"],
      add: ["pr", "sc", "fx"],
      verdict: "good",
      tone: { sp: "default" },
      badge: { sp: "" },
      edges: [
        ["sp", "pr", { dashed: true }],
        ["om", "pr", { dashed: true }],
        ["om", "sc", { dashed: true }],
        ["om", "fx", { dashed: true }],
      ],
      line: 11,
      note: L(
        "Split into role interfaces. SimplePrinter depends only on Printer; OfficeMachine implements all three.",
        "Rol interface'lariga ajrating. SimplePrinter faqat Printer'ga bogʻliq; OfficeMachine uchalasini amalga oshiradi.",
      ),
    },
    {
      relabel: { fx: { sub: "fax(opts)" } },
      tone: { fx: "compare", om: "compare", sp: "match" },
      line: 13,
      note: L("Now a change to Fax reaches only the classes that actually fax.", "Endi Fax'dagi oʻzgarish faqat haqiqatan fax yuboradigan class'larga yetib boradi."),
    },
  ],
};

export const dependencyInversion: Scene = {
  title: L("DIP: invert the arrow", "DIP: bogʻliqlik yoʻnalishini teskari qilish"),
  code: `// before: business logic creates its own database
class SignupService {
  private db = new PostgresClient(url);
}

// after: both sides depend on an abstraction
interface UserStore { add(email: string): Promise<void> }
class SignupService {
  constructor(private users: UserStore) {}
}
class PostgresUserStore implements UserStore { /* … */ }
class InMemoryUserStore implements UserStore { /* tests */ }
new SignupService(new PostgresUserStore(pool));`,
  nodes: {
    svc: { label: "SignupService", sub: L("high level", "yuqori daraja"), x: 320, y: 45, w: 180 },
    pg: { label: "PostgresClient", sub: L("low level", "past daraja"), x: 320, y: 245, w: 180 },
    store: { label: "UserStore", sub: "add(email)", x: 320, y: 145, w: 170, kind: "interface" },
    pgs: { label: "PostgresUserStore", x: 160, y: 250, w: 180 },
    mem: { label: "InMemoryUserStore", x: 480, y: 250, w: 180 },
  },
  frames: [
    {
      add: ["svc", "pg"],
      verdict: "bad",
      edges: [["svc", "pg", { label: "new", tone: "danger" }]],
      line: 3,
      note: L("High-level policy points straight at a low-level detail.", "Yuqori darajadagi mantiq toʻgʻridan-toʻgʻri past darajadagi tafsilotga bogʻlangan."),
    },
    {
      tone: { pg: "danger", svc: "compare" },
      badge: { pg: "?" },
      line: 3,
      note: L(
        "Want to test without a database, or switch to another store? You must edit SignupService itself.",
        "Bazasiz test qilmoqchimisiz yoki boshqa omborga oʻtmoqchimisiz? SignupService'ning oʻzini tahrirlashingiz kerak.",
      ),
    },
    {
      remove: ["pg"],
      add: ["store"],
      verdict: "good",
      tone: { svc: "default" },
      edges: [["svc", "store"]],
      line: 7,
      note: L("Introduce an interface owned by the high-level side: UserStore.", "Yuqori daraja egalik qiladigan interface kiriting: UserStore."),
    },
    {
      add: ["pgs"],
      addEdges: [["pgs", "store", { dashed: true, label: "implements" }]],
      line: 11,
      note: L("The detail now depends on the abstraction — the arrow is inverted.", "Endi tafsilot abstraksiyaga bogʻliq — strelka teskari yoʻnaldi."),
    },
    {
      add: ["mem"],
      tone: { mem: "match" },
      addEdges: [["mem", "store", { dashed: true, tone: "match" }]],
      line: 12,
      note: L("Tests plug in an in-memory store. SignupService did not change.", "Testlar xotiradagi omborni ulaydi. SignupService oʻzgarmadi."),
    },
    {
      tone: { mem: "default", svc: "active" },
      edges: [
        ["svc", "store", { tone: "active", flow: true }],
        ["pgs", "store", { dashed: true }],
        ["mem", "store", { dashed: true }],
      ],
      line: 13,
      note: L(
        "Which implementation is used is decided outside, when the app is wired together (dependency injection).",
        "Qaysi implementatsiya ishlatilishi tashqarida, ilova yigʻilayotganda hal qilinadi (dependency injection).",
      ),
    },
  ],
};
