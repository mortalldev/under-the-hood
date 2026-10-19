import { L, type Scene } from "../scene";

export const separationOfConcerns: Scene = {
  title: L("SoC: untangle data, rules and view", "SoC: ma'lumot, qoida va koʻrinishni ajratish"),
  code: `// before: one component does everything
function Orders() {
  useEffect(() => { fetch("/api/orders").then(setOrders); }, []);
  const paid = orders.filter(isPaid).sort(byTotal);
  return <ul>{paid.map(row)}</ul>;
}
// after: each concern in its own place
const useOrders = () => useQuery({ queryKey: ["orders"], queryFn: api.orders }); // data
const topPaid = (orders: Order[]) => orders.filter(isPaid).sort(byTotal);         // rules
const OrdersList = ({ orders }: Props) => <ul>{orders.map(row)}</ul>;             // view`,
  nodes: {
    all: { label: "Orders()", sub: "fetch · filter · sort · render", x: 320, y: 150, w: 300, h: 70 },
    data: { label: "useOrders()", sub: L("data", "ma'lumot"), x: 320, y: 250, w: 190 },
    logic: { label: "topPaid()", sub: L("pure rules", "pure qoidalar"), x: 320, y: 150, w: 190 },
    ui: { label: "OrdersList", sub: L("view", "koʻrinish"), x: 320, y: 50, w: 190 },
  },
  frames: [
    {
      add: ["all"],
      verdict: "bad",
      line: 2,
      note: L("One component mixes data fetching, business rules and rendering.", "Bitta component ma'lumot olish, biznes qoidalar va render'ni aralashtiradi."),
    },
    {
      tone: { all: "danger" },
      badge: { all: "×3" },
      line: 4,
      note: L(
        "To test the sorting rule you must mock fetch and render React. To change the API you edit a UI file.",
        "Saralash qoidasini test qilish uchun fetch'ni mock qilib, React'ni render qilish kerak. API'ni oʻzgartirish uchun UI faylini tahrirlaysiz.",
      ),
    },
    {
      remove: ["all"],
      add: ["data"],
      verdict: "good",
      line: 8,
      note: L("Pull data access into a hook.", "Ma'lumotga kirishni hook'ga chiqaring."),
    },
    {
      add: ["logic"],
      edges: [["data", "logic", { label: "orders", flow: true }]],
      line: 9,
      note: L("Business rules become a pure function — testable with a plain array.", "Biznes qoidalar pure function'ga aylanadi — oddiy massiv bilan test qilsa boʻladi."),
    },
    {
      add: ["ui"],
      addEdges: [["logic", "ui", { label: "props", flow: true }]],
      line: 10,
      note: L("The view only renders what it is given.", "Koʻrinish faqat berilgan narsani render qiladi."),
    },
    {
      tone: { logic: "match" },
      badge: { logic: "test ✓" },
      note: L(
        "Each layer changes for its own reason and can be tested on its own. This is SRP at the scale of the architecture.",
        "Har bir qatlam oʻz sababi bilan oʻzgaradi va alohida test qilinadi. Bu — arxitektura miqyosidagi SRP.",
      ),
    },
  ],
};

export const couplingCohesion: Scene = {
  title: L("Coupling & cohesion: the utils.ts trap", "Coupling va cohesion: utils.ts tuzogʻi"),
  code: `// utils.ts — low cohesion: unrelated things in one file
export const formatDate = …;  export const addTax = …;
export const $ = (sel: string) => document.querySelector(sel);
// every module imports utils → high coupling
import { addTax, $, formatDate } from "./utils";

// high cohesion: things that change together live together
// date.ts   → formatDate, parseDate
// money.ts  → addTax, round
// dom.ts    → $, on`,
  nodes: {
    utils: { label: "utils.ts", sub: "date · money · dom", x: 320, y: 150, w: 200 },
    cart: { label: "cart.ts", x: 110, y: 45, w: 130 },
    invoice: { label: "invoice.ts", x: 320, y: 45, w: 130 },
    report: { label: "report.ts", x: 530, y: 45, w: 130 },
    header: { label: "header.tsx", x: 320, y: 255, w: 130 },
    money: { label: "money.ts", x: 170, y: 150, w: 130, kind: "data" },
    date: { label: "date.ts", x: 470, y: 150, w: 130, kind: "data" },
    dom: { label: "dom.ts", x: 470, y: 255, w: 130, kind: "data" },
  },
  frames: [
    {
      add: ["utils"],
      verdict: "bad",
      line: 1,
      note: L("utils.ts holds dates, money and DOM helpers — things that have nothing in common. Low cohesion.", "utils.ts'da sana, pul va DOM yordamchilari — bir-biriga aloqasi yoʻq narsalar. Past cohesion."),
    },
    {
      add: ["cart", "invoice", "report", "header"],
      badge: { utils: "4" },
      edges: [["cart", "utils"], ["invoice", "utils"], ["report", "utils"], ["header", "utils"]],
      line: 5,
      note: L("Every module imports it, so everything is coupled to everything through one file.", "Har bir modul uni import qiladi, shuning uchun hamma narsa bitta fayl orqali bir-biriga bogʻlanadi."),
    },
    {
      relabel: { utils: { sub: L("changed: $()", "oʻzgardi: $()") } },
      tone: { utils: "danger", cart: "compare", invoice: "compare", report: "compare", header: "compare" },
      edges: [
        ["utils", "cart", { tone: "danger", flow: true }],
        ["utils", "invoice", { tone: "danger", flow: true }],
        ["utils", "report", { tone: "danger", flow: true }],
        ["utils", "header", { tone: "danger", flow: true }],
      ],
      line: 3,
      note: L(
        "Change one DOM helper and all four importers must be rebuilt and re-checked — even the cart, which only adds tax.",
        "Bitta DOM yordamchisini oʻzgartirsangiz, toʻrtala import qiluvchini qayta tekshirish kerak — hatto faqat soliq qoʻshadigan cart'ni ham.",
      ),
    },
    {
      remove: ["utils"],
      add: ["money", "date", "dom"],
      verdict: "good",
      at: { header: [170, 255] },
      tone: { cart: "default", invoice: "default", report: "default", header: "default" },
      badge: { utils: "" },
      edges: [["cart", "money"], ["invoice", "money"], ["invoice", "date"], ["report", "date"], ["header", "dom"]],
      line: 7,
      note: L("Split by what changes together: money.ts, date.ts, dom.ts. Each file is cohesive.", "Birga oʻzgaradigan narsalar boʻyicha ajrating: money.ts, date.ts, dom.ts. Har bir fayl cohesive."),
    },
    {
      tone: { dom: "compare", header: "compare", cart: "muted", invoice: "muted", report: "muted", money: "muted", date: "muted" },
      edges: [
        ["cart", "money"],
        ["invoice", "money"],
        ["invoice", "date"],
        ["report", "date"],
        ["dom", "header", { tone: "compare", flow: true }],
      ],
      line: 10,
      note: L("Now a DOM change reaches only header.tsx. Low coupling, high cohesion.", "Endi DOM oʻzgarishi faqat header.tsx'ga yetib boradi. Low coupling, high cohesion."),
    },
  ],
};

export const encapsulation: Scene = {
  title: L("Encapsulation: one door into the data", "Encapsulation: ma'lumotga bitta eshik"),
  code: `// exposed state: anyone can break the invariant
account.balance = -500;

class Account {
  #balance = 0;                       // hidden
  deposit(amount: number) {
    if (amount <= 0) throw new RangeError("amount must be > 0");
    this.#balance += amount;
  }
  get balance() { return this.#balance; } // read-only view
}`,
  nodes: {
    acc: { label: "Account", sub: "balance: 100", x: 470, y: 150, w: 180 },
    c1: { label: "checkout.ts", x: 100, y: 65, w: 140 },
    c2: { label: "refund.ts", x: 100, y: 235, w: 140 },
    api: { label: "deposit()", sub: L("validates", "tekshiradi"), x: 285, y: 150, w: 150 },
  },
  frames: [
    {
      add: ["acc", "c1", "c2"],
      verdict: "bad",
      edges: [
        ["c1", "acc", { label: "balance =" }],
        ["c2", "acc", { label: "balance =" }],
      ],
      line: 2,
      note: L("balance is a public field: any file can assign to it.", "balance — public maydon: istalgan fayl unga qiymat bera oladi."),
    },
    {
      relabel: { acc: { sub: "balance: -500" } },
      tone: { acc: "danger", c2: "danger" },
      edges: [
        ["c1", "acc", { label: "balance =" }],
        ["c2", "acc", { label: "-500", tone: "danger", flow: true }],
      ],
      line: 2,
      note: L(
        "refund.ts writes −500. Nothing stopped it: the 'never negative' rule lives nowhere.",
        "refund.ts −500 yozadi. Hech narsa toʻxtatmadi: 'hech qachon manfiy emas' qoidasi hech qayerda yoʻq.",
      ),
    },
    {
      add: ["api"],
      verdict: "good",
      at: { acc: [500, 150] },
      relabel: { acc: { sub: "#balance: 100" } },
      tone: { acc: "default", c2: "default" },
      edges: [["c1", "api"], ["c2", "api"], ["api", "acc"]],
      line: 5,
      note: L("Hide the field (#balance) and expose operations instead.", "Maydonni yashiring (#balance) va uning oʻrniga amallarni oching."),
    },
    {
      tone: { api: "danger", c2: "danger" },
      badge: { api: "✕" },
      edges: [
        ["c1", "api"],
        ["c2", "api", { label: "-500", tone: "danger", flow: true }],
        ["api", "acc"],
      ],
      line: 7,
      note: L("Invalid input is rejected at the only way in.", "Notoʻgʻri qiymat yagona kirish joyida rad etiladi."),
    },
    {
      relabel: { acc: { sub: "#balance: 150" } },
      tone: { api: "match", c2: "default", acc: "match" },
      badge: { api: "" },
      edges: [
        ["c1", "api", { label: "+50", tone: "match", flow: true }],
        ["c2", "api"],
        ["api", "acc", { tone: "match", flow: true }],
      ],
      line: 8,
      note: L(
        "Valid operations pass. The internals can now change (cents, a ledger…) without touching any caller.",
        "Toʻgʻri amallar oʻtadi. Endi ichki tuzilma (tiyinlar, ledger…) chaqiruvchilarga tegmasdan oʻzgarishi mumkin.",
      ),
    },
  ],
};

export const compositionOverInheritance: Scene = {
  title: L("Composition: capabilities instead of a family tree", "Composition: oila daraxti oʻrniga qobiliyatlar"),
  code: `class Bird { fly() {} }
class Duck extends Bird {}
class Penguin extends Bird {
  fly() { throw new Error("can't fly"); }   // inherited a lie
}
// compose capabilities instead
const canFly  = { fly: () => "flying" };
const canSwim = { swim: () => "swimming" };
const duck    = { ...canFly, ...canSwim };
const penguin = { ...canSwim };
const drone   = { ...canFly };   // no Bird needed`,
  nodes: {
    bird: { label: "Bird", sub: "fly()", x: 320, y: 55, w: 150 },
    duck: { label: "Duck", x: 170, y: 200, w: 140 },
    peng: { label: "Penguin", x: 470, y: 200, w: 140 },
    fly: { label: "canFly", x: 200, y: 60, w: 130, kind: "data" },
    swim: { label: "canSwim", x: 440, y: 60, w: 130, kind: "data" },
    drone: { label: "drone", sub: "fly", x: 110, y: 230, w: 130 },
  },
  frames: [
    {
      add: ["bird"],
      line: 1,
      note: L("The base class Bird can fly.", "Bird base class'i ucha oladi."),
    },
    {
      add: ["duck"],
      edges: [["duck", "bird", { label: "extends" }]],
      line: 2,
      note: L("Duck inherits fly(). Fine so far.", "Duck fly()'ni meros oladi. Hozircha yaxshi."),
    },
    {
      add: ["peng"],
      verdict: "bad",
      tone: { peng: "danger" },
      badge: { peng: "fly() ✕" },
      addEdges: [["peng", "bird", { label: "extends", tone: "danger" }]],
      line: 4,
      note: L(
        "Penguin inherits fly() too and has to override it to throw. The hierarchy forced a false 'is-a'.",
        "Penguin ham fly()'ni meros oladi va uni xato tashlash bilan qayta yozishga majbur. Ierarxiya soxta 'is-a'ni majburladi.",
      ),
    },
    {
      relabel: { bird: { sub: "fly() · swim()?" } },
      tone: { bird: "compare" },
      note: L(
        "Now add swimming: put swim() in Bird (so every bird swims?) or create SwimmingFlyingBird… the tree explodes.",
        "Endi suzishni qoʻshing: swim()'ni Bird'ga qoʻyasizmi (har bir qush suzadimi?) yoki SwimmingFlyingBird yaratasizmi… daraxt portlaydi.",
      ),
    },
    {
      remove: ["bird"],
      add: ["fly", "swim"],
      verdict: "good",
      at: { duck: [320, 225], peng: [530, 225] },
      relabel: { duck: { sub: "fly · swim" }, peng: { sub: "swim" } },
      tone: { peng: "default" },
      badge: { peng: "" },
      edges: [["fly", "duck"], ["swim", "duck"], ["swim", "peng"]],
      line: 9,
      note: L("Compose small capabilities instead. Each object has exactly what it can do.", "Buning oʻrniga kichik qobiliyatlarni birlashtiring. Har bir obyektda aynan qila oladigan narsasi bor."),
    },
    {
      add: ["drone"],
      tone: { drone: "match" },
      addEdges: [["fly", "drone", { tone: "match", flow: true }]],
      line: 11,
      note: L("Reuse without a family tree: a drone is not a bird, but it can fly.", "Oila daraxtisiz qayta foydalanish: dron qush emas, lekin ucha oladi."),
    },
  ],
};

export const lawOfDemeter: Scene = {
  title: L("Law of Demeter: don't reach through strangers", "Law of Demeter: begonalar orqali kirmang"),
  code: `// reaching through strangers
const city = order.getCustomer().getAddress().getCity();

// ask your direct friend
class Order {
  shippingCity() { return this.customer.address.city; }
}
const city = order.shippingCity();`,
  nodes: {
    caller: { label: "checkout.ts", x: 100, y: 150, w: 140 },
    order: { label: "Order", x: 400, y: 250, w: 150 },
    cust: { label: "Customer", x: 400, y: 150, w: 150 },
    addr: { label: "Address", sub: "city", x: 400, y: 50, w: 150 },
  },
  frames: [
    {
      add: ["caller", "order"],
      edges: [["caller", "order"]],
      line: 2,
      note: L("checkout.ts holds an order — its direct friend.", "checkout.ts'da order bor — bu uning yaqin doʻsti."),
    },
    {
      add: ["cust"],
      verdict: "bad",
      addEdges: [
        ["order", "cust", { dashed: true, tone: "muted" }],
        ["caller", "cust", { tone: "danger", label: "getCustomer()" }],
      ],
      line: 2,
      note: L("…but then it reaches into the order's customer…", "…lekin keyin buyurtmaning mijoziga kirib boradi…"),
    },
    {
      add: ["addr"],
      badge: { caller: "3" },
      addEdges: [
        ["cust", "addr", { dashed: true, tone: "muted" }],
        ["caller", "addr", { tone: "danger", label: "getAddress()" }],
      ],
      line: 2,
      note: L("…and the customer's address. checkout.ts now depends on the internals of three classes.", "…va mijozning manziliga. Endi checkout.ts uchta class'ning ichki tuzilishiga bogʻliq."),
    },
    {
      relabel: { cust: { sub: "addresses[]" } },
      tone: { cust: "compare", caller: "danger" },
      line: 2,
      note: L(
        "Customer changes to hold many addresses → checkout.ts breaks, although all it wanted was a city.",
        "Customer koʻp manzilli boʻlib oʻzgaradi → checkout.ts buziladi, garchi unga faqat shahar kerak boʻlsa ham.",
      ),
    },
    {
      verdict: "good",
      relabel: { order: { sub: "shippingCity()" } },
      tone: { caller: "default", cust: "default" },
      badge: { caller: "" },
      edges: [
        ["caller", "order", { tone: "match", label: "shippingCity()", flow: true }],
        ["order", "cust", { dashed: true }],
        ["cust", "addr", { dashed: true }],
      ],
      line: 8,
      note: L("Ask your friend for what you need. Order knows how to find the city.", "Kerakli narsani doʻstingizdan soʻrang. Shaharni qanday topishni Order biladi."),
    },
    {
      tone: { cust: "compare", order: "active" },
      line: 6,
      note: L("The next structural change is absorbed inside Order; callers don't notice it.", "Keyingi tuzilma oʻzgarishi Order ichida hal boʻladi; chaqiruvchilar buni sezmaydi ham."),
    },
  ],
};

export const tellDontAsk: Scene = {
  title: L("Tell, Don't Ask: let the data decide", "Tell, Don't Ask: qarorni ma'lumot egasi qilsin"),
  code: `// ask: pull data out, decide outside
if (account.balance >= amount) {
  account.balance -= amount;
}

// tell: the object owns the decision
class Account {
  withdraw(amount: number) {
    if (amount > this.#balance) throw new InsufficientFunds();
    this.#balance -= amount;
  }
}
account.withdraw(amount);`,
  nodes: {
    pay: { label: "PaymentService", x: 130, y: 70, w: 170 },
    ref: { label: "RefundService", x: 130, y: 230, w: 170 },
    acc: { label: "Account", sub: "balance", x: 480, y: 150, w: 170 },
  },
  frames: [
    {
      add: ["pay", "acc"],
      verdict: "bad",
      edges: [["acc", "pay", { label: "balance?", flow: true }]],
      line: 2,
      note: L("PaymentService asks the account for its balance…", "PaymentService hisobdan balansini soʻraydi…"),
    },
    {
      edges: [["pay", "acc", { label: "balance −=", flow: true }]],
      line: 3,
      note: L("…makes the decision itself, then writes the result back.", "…qarorni oʻzi qabul qiladi, keyin natijani qaytarib yozadi."),
    },
    {
      add: ["ref"],
      tone: { ref: "danger", acc: "danger" },
      badge: { ref: L("no check", "tekshiruvsiz") },
      addEdges: [["ref", "acc", { label: "balance −=", tone: "danger", flow: true }]],
      note: L(
        "Another caller copies the rule — or forgets it. The rule lives outside the data it protects.",
        "Boshqa chaqiruvchi qoidani nusxalaydi yoki unutadi. Qoida u himoya qiladigan ma'lumotdan tashqarida yashaydi.",
      ),
    },
    {
      verdict: "good",
      relabel: { acc: { sub: L("withdraw() checks", "withdraw() tekshiradi") } },
      tone: { ref: "default", acc: "match" },
      badge: { ref: "" },
      edges: [
        ["pay", "acc", { label: "withdraw()", flow: true }],
        ["ref", "acc", { label: "withdraw()", flow: true }],
      ],
      line: 13,
      note: L("Tell the account what you want. The check lives with the balance — once.", "Hisobga nima istashingizni ayting. Tekshiruv balans bilan birga, bitta joyda yashaydi."),
    },
    {
      tone: { acc: "active", ref: "compare" },
      badge: { acc: L("✕ funds", "✕ mablagʻ") },
      edges: [
        ["pay", "acc", { label: "withdraw()" }],
        ["ref", "acc", { label: "withdraw(900)", tone: "compare", flow: true }],
      ],
      line: 9,
      note: L("If funds are short, Account refuses. No caller can bypass the rule.", "Mablagʻ yetmasa, Account rad etadi. Hech bir chaqiruvchi qoidani chetlab oʻta olmaydi."),
    },
  ],
};
