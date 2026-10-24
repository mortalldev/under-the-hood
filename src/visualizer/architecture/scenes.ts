import type { Localized } from "../core/types";
import { L, type Scene } from "../principles/scene";

/**
 * One animation per architecture topic, keyed by the topic's slug in
 * content/architecture/registry.ts. Same scene format as the principles:
 * boxes and arrows, played as delta frames.
 */

const layer = (label: string, y: number) => ({ label, x: 120, y, w: 190, h: 36 });
const slice = (label: string, x: number, y: number) => ({ label, x, y, w: 120, h: 36 });

const featureSlicedDesign: Scene = {
  title: L("FSD: six layers, imports only point down", "FSD: oltita layer, import faqat pastga qaraydi"),
  height: 350,
  code: `src/
  app/        // providers, router, global styles
  pages/      // checkout/, profile/
  widgets/    // header/, cart-summary/
  features/   // auth/, add-to-cart/
  entities/   // user/, product/
  shared/     // ui/, api/, lib/, config/ — no business meaning

// features/cart/index.ts — the slice's public API
export { AddToCartButton } from "./ui/AddToCartButton";
export { useCart } from "./model/useCart";

// pages/checkout/ui/CheckoutPage.tsx — compose at the layer above
import { LoginGate } from "@/features/auth";
import { CartList } from "@/features/cart";`,
  nodes: {
    app: layer("app/", 30),
    pages: layer("pages/", 87),
    widgets: layer("widgets/", 144),
    features: layer("features/", 201),
    entities: layer("entities/", 258),
    shared: layer("shared/", 315),
    checkout: { label: "checkout", x: 480, y: 87, w: 140, h: 36 },
    auth: slice("auth", 400, 201),
    cart: slice("cart", 560, 201),
    user: slice("user", 400, 258),
    product: slice("product", 560, 258),
    sh: { label: "ui · api · lib", x: 480, y: 315, w: 200, h: 36 },
  },
  frames: [
    {
      add: ["app", "pages", "widgets", "features", "entities", "shared"],
      line: 1,
      note: L(
        "Feature-Sliced Design splits src/ into standard layers: app wires everything together, shared holds reusable code with no business meaning.",
        "Feature-Sliced Design src/'ni standart layer'larga boʻladi: app hammasini bogʻlaydi, shared'da biznes ma'nosi yoʻq qayta ishlatiladigan kod turadi.",
      ),
    },
    {
      edges: [
        ["pages", "widgets", { tone: "match", flow: true }],
        ["widgets", "features", { tone: "match", flow: true }],
        ["features", "entities", { tone: "match", flow: true }],
        ["entities", "shared", { tone: "match", flow: true }],
      ],
      line: 2,
      note: L("The one rule: a module may import only from layers below its own.", "Yagona qoida: modul faqat oʻzidan pastdagi layer'lardan import qila oladi."),
    },
    {
      add: ["checkout", "auth", "cart", "user", "product", "sh"],
      tone: { app: "muted", pages: "muted", widgets: "muted", features: "muted", entities: "muted", shared: "muted" },
      edges: [
        ["checkout", "cart", { tone: "match" }],
        ["cart", "product", { tone: "match" }],
        ["auth", "user", { tone: "match" }],
        ["product", "sh", { tone: "match" }],
      ],
      badge: { cart: "index.ts" },
      line: 9,
      note: L(
        "Each layer (except app and shared) is cut into slices by business domain. Other code may import a slice only through its public API, index.ts.",
        "Har bir layer (app va shared'dan tashqari) biznes domeni boʻyicha slice'larga boʻlinadi. Boshqa kod slice'ni faqat uning public API'si — index.ts orqali import qila oladi.",
      ),
    },
    {
      verdict: "bad",
      tone: { cart: "danger", auth: "danger" },
      addEdges: [["cart", "auth", { tone: "danger", label: "import" }]],
      badge: { cart: "" },
      note: L(
        "cart imports from auth: two slices on the same layer now depend on each other. Features stop being independent and import cycles appear.",
        "cart auth'dan import qiladi: bir layer'dagi ikki slice endi bir-biriga bogʻliq. Feature'lar mustaqil boʻlmay qoladi va import sikllari paydo boʻladi.",
      ),
    },
    {
      tone: { user: "danger" },
      addEdges: [["user", "auth", { tone: "danger", label: "import" }]],
      note: L("Worse: the user entity imports a feature, pointing up. A low layer now knows about a high one.", "Bundan battari: user entity feature'dan import qiladi, ya'ni yuqoriga qaraydi. Past layer endi yuqoridagisini biladi."),
    },
    {
      verdict: "good",
      tone: { cart: "default", auth: "default", user: "default", checkout: "active" },
      dropEdges: ["cart>auth", "user>auth"],
      addEdges: [["checkout", "auth", { tone: "active", flow: true }]],
      line: 13,
      note: L(
        "Fix: compose one layer higher. The checkout page uses both auth and cart; anything they both need about the user lives in entities/user.",
        "Yechim: bir layer yuqorida birlashtiring. Checkout sahifasi auth'ni ham, cart'ni ham ishlatadi; ikkalasiga kerak boʻlgan user ma'lumoti entities/user'da yashaydi.",
      ),
    },
    {
      tone: { checkout: "default" },
      note: L(
        "Write the rule down as a lint check (Steiger, the FSD linter, or eslint-plugin-boundaries) so CI rejects an upward import instead of a reviewer.",
        "Qoidani lint tekshiruvi sifatida yozing (FSD linter'i Steiger yoki eslint-plugin-boundaries): yuqoriga qaragan import'ni reviewer emas, CI rad etsin.",
      ),
    },
  ],
};

const atomicDesign: Scene = {
  title: L("Atomic Design: one Button change reaches every page", "Atomic Design: bitta Button oʻzgarishi har bir sahifaga yetadi"),
  height: 320,
  code: `// atoms: styled only from design tokens
export const Button = (p: ButtonProps) => <button className={button(p)} {...p} />;
export const Input = (p: InputProps) => <input className="input" {...p} />;

// molecule: atoms that work as one unit
export const SearchField = () => (
  <form role="search">
    <Label htmlFor="q">Search</Label> <Input id="q" name="q" /> <Button>Go</Button>
  </form>
);

// organism → template → page
export const SiteHeader = () => <header><Logo /><SearchField /><UserMenu /></header>;
export const SearchTemplate = ({ results }: Props) => <><SiteHeader /><ResultList items={results} /></>;
export default async function SearchPage() { return <SearchTemplate results={await search()} />; }`,
  nodes: {
    label: { label: "Label", x: 90, y: 285, w: 120, h: 36 },
    input: { label: "Input", x: 250, y: 285, w: 120, h: 36 },
    button: { label: "Button", x: 410, y: 285, w: 120, h: 36 },
    tokens: { label: L("Design tokens", "Design token'lar"), x: 565, y: 285, w: 130, h: 36, kind: "data" },
    search: { label: "SearchField", x: 250, y: 210, w: 170, h: 40 },
    header: { label: "SiteHeader", x: 250, y: 135, w: 190, h: 40 },
    template: { label: "SearchTemplate", x: 250, y: 60, w: 190, h: 40 },
    page: { label: "/search", x: 520, y: 60, w: 170, h: 40 },
  },
  frames: [
    {
      add: ["tokens", "label", "input", "button"],
      badge: { button: "atom" },
      edges: [["tokens", "button", { flow: true }]],
      line: 1,
      note: L(
        "Atoms: the smallest pieces, such as Label, Input and Button. They take colour, spacing and type only from design tokens.",
        "Atom'lar: eng kichik boʻlaklar, masalan Label, Input va Button. Rang, oraliq va shriftni faqat design token'lardan oladi.",
      ),
    },
    {
      add: ["search"],
      badge: { search: "molecule" },
      edges: [
        ["label", "search"],
        ["input", "search"],
        ["button", "search"],
      ],
      line: 6,
      note: L("Molecule: a few atoms that work as one unit. A search field is a label, an input and a button.", "Molecule: bitta birlik boʻlib ishlaydigan bir nechta atom. Qidiruv maydoni — label, input va button."),
    },
    {
      add: ["header"],
      badge: { header: "organism" },
      addEdges: [["search", "header"]],
      line: 13,
      note: L("Organism: a distinct section of the interface built from molecules — the site header with logo, search and user menu.", "Organism: molecule'lardan qurilgan alohida interfeys qismi — logo, qidiruv va user menu'li sayt header'i."),
    },
    {
      add: ["template"],
      badge: { template: "template" },
      addEdges: [["header", "template"]],
      line: 14,
      note: L("Template: the page layout with placeholders, no real content yet.", "Template: placeholder'li sahifa layout'i, hali real kontent yoʻq."),
    },
    {
      add: ["page"],
      badge: { page: "page" },
      addEdges: [["template", "page"]],
      line: 15,
      note: L(
        "Page: the template filled with real data. This is where you check the design survives long names, empty results and slow networks.",
        "Page: real ma'lumot bilan toʻldirilgan template. Dizayn uzun nomlar, boʻsh natijalar va sekin tarmoqqa chidashini shu yerda tekshirasiz.",
      ),
    },
    {
      tone: { button: "compare", search: "compare", header: "compare", template: "compare", page: "compare" },
      edges: [
        ["button", "search", { tone: "compare", flow: true }],
        ["search", "header", { tone: "compare", flow: true }],
        ["header", "template", { tone: "compare", flow: true }],
        ["template", "page", { tone: "compare", flow: true }],
      ],
      line: 2,
      note: L(
        "Change Button once and every molecule, organism and page that uses it changes too. That is the consistency you want, and also a large blast radius: guard it with visual regression tests.",
        "Button'ni bir marta oʻzgartirsangiz, uni ishlatadigan har bir molecule, organism va sahifa ham oʻzgaradi. Bu siz xohlagan izchillik, lekin ta'sir doirasi ham katta: uni vizual regression testlar bilan himoya qiling.",
      ),
    },
    {
      tone: { button: "default", search: "default", header: "default", template: "default", page: "default" },
      edges: [],
      note: L(
        "In real codebases teams rarely argue whether something is a molecule or an organism. They keep a components/ui folder (shadcn/ui style) and the core idea: compose upward from small, tested pieces.",
        "Real kod bazalarida jamoalar biror narsa molecule'mi yoki organism'mi deb kamdan-kam bahslashadi. Ular components/ui papkasini (shadcn/ui uslubida) va asosiy gʻoyani saqlaydi: kichik, test qilingan boʻlaklardan yuqoriga qarab yigʻish.",
      ),
    },
  ],
};

const remote = (label: string, team: Localized, x: number) => ({ label, sub: team, x, y: 250, w: 150 });

const microFrontends: Scene = {
  title: L("Micro-frontends: independent deploys, shared singletons", "Micro-frontends: mustaqil deploy, umumiy singleton'lar"),
  code: `// shell: webpack / Rspack config (Module Federation)
new ModuleFederationPlugin({
  name: "shell",
  remotes: {
    search: "search@https://cdn.example.com/search/remoteEntry.js",
    checkout: "checkout@https://cdn.example.com/checkout/remoteEntry.js",
  },
  shared: { react: { singleton: true }, "react-dom": { singleton: true } },
});

// shell route: loaded at runtime, deployed by another team
const Checkout = lazy(() => import("checkout/App"));`,
  nodes: {
    teamA: { label: L("Search team", "Search jamoasi"), x: 110, y: 40, w: 130, h: 34, kind: "data" },
    teamB: { label: L("Checkout team", "Checkout jamoasi"), x: 320, y: 40, w: 140, h: 34, kind: "data" },
    teamC: { label: L("Profile team", "Profile jamoasi"), x: 530, y: 40, w: 130, h: 34, kind: "data" },
    mono: { label: L("frontend (one bundle)", "frontend (bitta bundle)"), sub: L("one build · one deploy", "bitta build · bitta deploy"), x: 320, y: 150, w: 260 },
    shell: { label: "App shell", sub: "routing · auth · layout", x: 320, y: 150, w: 200 },
    search: remote("search", L("Search team", "Search jamoasi"), 110),
    checkout: remote("checkout", L("Checkout team", "Checkout jamoasi"), 320),
    profile: remote("profile", L("Profile team", "Profile jamoasi"), 530),
  },
  frames: [
    {
      add: ["teamA", "teamB", "teamC", "mono"],
      verdict: "bad",
      tone: { mono: "compare" },
      edges: [
        ["teamA", "mono", { tone: "compare" }],
        ["teamB", "mono", { tone: "compare" }],
        ["teamC", "mono", { tone: "compare" }],
      ],
      note: L(
        "Three teams, one bundle. Every release waits for all three, and one team's failing test blocks the others' fixes.",
        "Uch jamoa, bitta bundle. Har bir release uchala jamoani kutadi, bitta jamoaning yiqilgan testi boshqalarning tuzatishlarini toʻsib qoʻyadi.",
      ),
    },
    {
      remove: ["mono", "teamA", "teamB", "teamC"],
      add: ["shell", "search", "checkout", "profile"],
      verdict: "good",
      edges: [
        ["shell", "search", { flow: true }],
        ["shell", "checkout", { flow: true, label: L("load at runtime", "runtime'da yuklash") }],
        ["shell", "profile", { flow: true }],
      ],
      line: 4,
      note: L(
        "A thin shell owns routing and login and loads each team's app at runtime (Module Federation, import maps or iframes). Each team owns a vertical slice end to end.",
        "Yupqa shell routing va login'ga egalik qiladi va har bir jamoa ilovasini runtime'da yuklaydi (Module Federation, import map yoki iframe). Har bir jamoa vertikal boʻlakka boshidan oxirigacha egalik qiladi.",
      ),
    },
    {
      tone: { checkout: "match" },
      badge: { checkout: "v10" },
      edges: [["shell", "checkout", { tone: "match", flow: true }]],
      line: 12,
      note: L(
        "Checkout ships v10 from its own pipeline at 14:00. Search and profile are not rebuilt or redeployed; the shell picks up the new remoteEntry.js on the next page load.",
        "Checkout soat 14:00 da oʻz pipeline'idan v10'ni chiqaradi. Search va profile qayta build ham, deploy ham qilinmaydi; shell keyingi sahifa yuklanishida yangi remoteEntry.js'ni oladi.",
      ),
    },
    {
      tone: { checkout: "danger", search: "danger" },
      badge: { checkout: "React ×2", search: "" },
      edges: [],
      note: L(
        "The cost: if each remote bundles its own React, users download it twice and hooks or context break across the boundary. Share singletons (react, react-dom, the design system) and agree on versions.",
        "Narxi: har bir remote oʻz React'ini bundle qilsa, foydalanuvchi uni ikki marta yuklaydi va hook yoki context chegara orqali buziladi. Singleton'larni (react, react-dom, design system) umumiy qiling va versiyalarni kelishib oling.",
      ),
    },
    {
      line: 8,
      tone: { checkout: "default", search: "default" },
      badge: { checkout: "" },
      note: L(
        "Micro-frontends solve an organisational problem: many teams shipping one product. For one or two teams a single app in a monorepo is simpler, faster and easier to keep consistent.",
        "Micro-frontends tashkiliy muammoni hal qiladi: koʻp jamoa bitta mahsulot chiqaradi. Bir-ikki jamoa uchun monorepo'dagi bitta ilova soddaroq, tezroq va izchil saqlash osonroq.",
      ),
    },
  ],
};

const pkg = (label: string, x: number, y: number, w = 140) => ({ label, x, y, w, h: 40 });

const monorepo: Scene = {
  title: L("Monorepo: affected builds and a shared cache", "Monorepo: ta'sirlangan build'lar va umumiy cache"),
  code: `# pnpm-workspace.yaml
packages:
  - "apps/*"
  - "packages/*"

// apps/web/package.json — local package, no publishing
{ "dependencies": { "@acme/ui": "workspace:*" } }

// turbo.json
{
  "tasks": {
    "build": { "dependsOn": ["^build"], "outputs": ["dist/**", ".next/**"] },
    "test": { "dependsOn": ["^build"] }
  }
}

$ pnpm turbo run build`,
  nodes: {
    web: pkg("apps/web", 170, 45, 130),
    admin: pkg("apps/admin", 470, 45, 130),
    ui: pkg("packages/ui", 170, 150),
    utils: pkg("packages/utils", 470, 150),
    config: pkg("packages/config", 320, 255, 160),
  },
  frames: [
    {
      add: ["web", "admin", "ui", "utils", "config"],
      edges: [
        ["web", "ui"],
        ["admin", "ui"],
        ["admin", "utils"],
        ["ui", "utils"],
        ["ui", "config"],
        ["utils", "config"],
      ],
      line: 2,
      note: L(
        "One repository holds two apps and three shared packages. Arrows are dependencies; workspace:* links local packages without publishing them.",
        "Bitta repository'da ikki ilova va uchta umumiy package bor. Strelkalar — dependency'lar; workspace:* lokal package'larni nashr qilmasdan bogʻlaydi.",
      ),
    },
    {
      tone: { utils: "compare" },
      badge: { utils: L("changed", "oʻzgardi") },
      line: 7,
      note: L("You edit packages/utils. Which projects could break? Follow the arrows backwards.", "Siz packages/utils'ni tahrirlaysiz. Qaysi loyihalar buzilishi mumkin? Strelkalarni teskari kuzating."),
    },
    {
      tone: { ui: "active", web: "active", admin: "active" },
      badge: { ui: L("affected", "ta'sirlangan"), web: L("affected", "ta'sirlangan"), admin: L("affected", "ta'sirlangan") },
      edges: [
        ["web", "ui", { tone: "active" }],
        ["admin", "ui", { tone: "active" }],
        ["admin", "utils", { tone: "active" }],
        ["ui", "utils", { tone: "active" }],
        ["ui", "config"],
        ["utils", "config"],
      ],
      note: L(
        "The affected set is utils, ui (which depends on it), web and admin. config is not affected: nothing it depends on changed.",
        "Ta'sirlangan toʻplam: utils, ui (unga bogʻliq), web va admin. config ta'sirlanmagan: u bogʻliq boʻlgan hech narsa oʻzgarmadi.",
      ),
    },
    {
      tone: { config: "match" },
      badge: { config: "cache hit" },
      line: 12,
      note: L(
        "turbo run build hashes each task's inputs. config's hash is unchanged, so its output is restored from cache; the rest run in dependency order (utils → ui → apps), in parallel where possible.",
        "turbo run build har bir task input'larining hash'ini hisoblaydi. config hash'i oʻzgarmagan, shuning uchun natijasi cache'dan tiklanadi; qolganlari dependency tartibida (utils → ui → apps), imkon boricha parallel ishlaydi.",
      ),
    },
    {
      tone: { utils: "match", ui: "match", web: "match", admin: "match" },
      badge: { utils: "cache hit", ui: "cache hit", web: "cache hit", admin: "cache hit" },
      edges: [
        ["web", "ui", { tone: "match" }],
        ["admin", "ui", { tone: "match" }],
        ["admin", "utils", { tone: "match" }],
        ["ui", "utils", { tone: "match" }],
        ["ui", "config", { tone: "match" }],
        ["utils", "config", { tone: "match" }],
      ],
      line: 17,
      note: L(
        "Run it again with no changes: every task is a cache hit (Turborepo prints FULL TURBO). With a remote cache, CI and teammates reuse each other's results.",
        "Oʻzgarishsiz yana ishga tushiring: har bir task cache hit (Turborepo FULL TURBO deb yozadi). Remote cache bilan CI va jamoadoshlar bir-birining natijasidan foydalanadi.",
      ),
    },
    {
      tone: { utils: "default", ui: "default", web: "default", admin: "default", config: "default" },
      badge: { utils: "", ui: "", web: "", admin: "", config: "" },
      note: L(
        "Google keeps most of its code in one monorepo; that only works with heavy tooling: affected-only builds, caching, CODEOWNERS and enforced boundaries. Without them a monorepo is just a slow big repo.",
        "Google kodining katta qismini bitta monorepo'da saqlaydi; bu faqat kuchli tool'lar bilan ishlaydi: faqat ta'sirlangan qismni build qilish, caching, CODEOWNERS va majburiy chegaralar. Ularsiz monorepo shunchaki sekin katta repo.",
      ),
    },
  ],
};

const svc = (label: string, x: number) => ({ label, x, y: 255, w: 130 });

const bff: Scene = {
  title: L("BFF: one endpoint per screen, per client", "BFF: har bir client uchun, har bir ekranga bitta endpoint"),
  code: `// web-bff: GET /api/home — one round trip for the whole screen
export async function GET(req: Request) {
  const userId = await auth(req);
  const [user, orders, picks] = await Promise.all([
    users.get(userId),
    orders.recent(userId, { limit: 3 }),
    catalog.recommended(userId),
  ]);
  return Response.json({
    greeting: user.firstName,
    orders: orders.map((o) => ({ id: o.id, status: o.status })),
    picks: picks.slice(0, 8),
  });
}`,
  nodes: {
    web: { label: "Web app", x: 110, y: 40, w: 130, kind: "data" },
    ios: { label: "iOS app", x: 530, y: 40, w: 130, kind: "data" },
    webbff: { label: "web-bff", x: 215, y: 148, w: 140 },
    mobbff: { label: "mobile-bff", x: 425, y: 148, w: 140 },
    users: svc("users", 110),
    orders: svc("orders", 320),
    catalog: svc("catalog", 530),
  },
  frames: [
    {
      add: ["web", "ios", "users", "orders", "catalog"],
      verdict: "bad",
      edges: [
        ["web", "users", { tone: "compare" }],
        ["web", "orders", { tone: "compare" }],
        ["web", "catalog", { tone: "compare" }],
        ["ios", "users", { tone: "compare" }],
        ["ios", "orders", { tone: "compare" }],
        ["ios", "catalog", { tone: "compare" }],
      ],
      note: L(
        "Each client calls three services itself: three round trips over a mobile network, fields the phone never shows, and auth and error handling written twice.",
        "Har bir client uchta service'ni oʻzi chaqiradi: mobil tarmoq orqali uchta borib-kelish, telefon hech qachon koʻrsatmaydigan maydonlar, auth va xatolarni ishlash ikki marta yoziladi.",
      ),
    },
    {
      add: ["webbff"],
      verdict: "good",
      tone: { webbff: "active" },
      edges: [
        ["web", "webbff", { tone: "active", flow: true, label: "GET /home" }],
        ["webbff", "users"],
        ["webbff", "orders"],
        ["webbff", "catalog"],
        ["ios", "users", { tone: "compare" }],
        ["ios", "orders", { tone: "compare" }],
        ["ios", "catalog", { tone: "compare" }],
      ],
      line: 2,
      note: L(
        "web-bff exposes one endpoint per screen and returns exactly what it renders. The fan-out to three services happens inside the data centre, where latency is a millisecond, not a hundred.",
        "web-bff har bir ekran uchun bitta endpoint ochadi va aynan u render qiladigan narsani qaytaradi. Uchta service'ga tarqalish data markaz ichida boʻladi, u yerda kechikish yuz emas, bir millisekund.",
      ),
    },
    {
      add: ["mobbff"],
      tone: { webbff: "default", mobbff: "active" },
      edges: [
        ["web", "webbff", { flow: true }],
        ["webbff", "users"],
        ["webbff", "orders"],
        ["webbff", "catalog"],
        ["ios", "mobbff", { tone: "active", flow: true }],
        ["mobbff", "users"],
        ["mobbff", "orders"],
        ["mobbff", "catalog"],
      ],
      line: 9,
      note: L(
        "mobile-bff returns a smaller payload and keeps old fields alive for app versions still installed on phones. Each BFF is owned by the team that owns its client.",
        "mobile-bff kichikroq payload qaytaradi va telefonlarda hali oʻrnatilgan eski ilova versiyalari uchun eski maydonlarni saqlaydi. Har bir BFF oʻz client'iga egalik qiladigan jamoaga tegishli.",
      ),
    },
    {
      tone: { mobbff: "default" },
      note: L(
        "BFF vs API gateway: a gateway is generic (auth, rate limits, routing) for everyone; a BFF is composition for one client. In Next.js, route handlers and Server Components often are the web BFF.",
        "BFF va API gateway: gateway hamma uchun umumiy (auth, rate limit, routing); BFF bitta client uchun kompozitsiya. Next.js'da route handler va Server Component'lar koʻpincha web BFF'ning oʻzi.",
      ),
    },
  ],
};

const tier = (label: string, sub: string, y: number) => ({ label, sub, x: 230, y, w: 210 });

const layered: Scene = {
  title: L("Layered: each layer calls only the one below", "Layered: har bir layer faqat pastdagisini chaqiradi"),
  code: `// presentation
app.post("/orders", async (req, res) => {
  const order = await orderService.place(req.body);
  res.status(201).json(order);
});

// business
class OrderService {
  async place(input: NewOrder) {
    if (input.items.length === 0) throw new ValidationError("empty order");
    return this.repo.insert({ ...input, status: "pending" });
  }
}

// data access
class OrderRepository {
  insert(o: NewOrder) { return db.query("INSERT INTO orders (user_id, status) VALUES ($1, $2)", [o.userId, o.status]); }
}`,
  nodes: {
    ctrl: tier("OrderController", "presentation", 40),
    svc: tier("OrderService", "business", 115),
    repo: tier("OrderRepository", "data access", 190),
    db: { label: "PostgreSQL", x: 230, y: 265, w: 210, kind: "data" },
    dynamo: { label: "DynamoDB", x: 520, y: 265, w: 150, kind: "data" },
  },
  frames: [
    {
      add: ["ctrl", "svc", "repo", "db"],
      edges: [
        ["ctrl", "svc"],
        ["svc", "repo"],
        ["repo", "db"],
      ],
      line: 1,
      note: L("Three layers, each calling only the one below it: presentation, business, data access.", "Uchta layer, har biri faqat oʻzidan pastdagisini chaqiradi: presentation, business, data access."),
    },
    {
      tone: { ctrl: "active", svc: "active", repo: "active" },
      edges: [
        ["ctrl", "svc", { tone: "active", flow: true }],
        ["svc", "repo", { tone: "active", flow: true }],
        ["repo", "db", { tone: "active", flow: true }],
      ],
      line: 10,
      note: L(
        "POST /orders: the controller maps HTTP to a call, the service applies the rules (no empty orders), the repository runs the SQL.",
        "POST /orders: controller HTTP'ni chaqiruvga aylantiradi, service qoidalarni qoʻllaydi (boʻsh buyurtma yoʻq), repository SQL'ni bajaradi.",
      ),
    },
    {
      verdict: "bad",
      tone: { ctrl: "danger", svc: "muted", repo: "muted" },
      edges: [
        ["ctrl", "svc", { tone: "muted" }],
        ["svc", "repo", { tone: "muted" }],
        ["repo", "db", { tone: "muted" }],
        ["ctrl", "db", { tone: "danger", label: "SELECT …" }],
      ],
      note: L(
        "A shortcut: the controller queries the database directly, \"just this once\". The business rules are skipped and the SQL now lives in two places.",
        "Qisqa yoʻl: controller \"faqat bir marta\" deb bazaga toʻgʻridan-toʻgʻri soʻrov yuboradi. Biznes qoidalar chetlab oʻtiladi va SQL endi ikki joyda yashaydi.",
      ),
    },
    {
      verdict: "good",
      add: ["dynamo"],
      tone: { ctrl: "default", svc: "default", repo: "active", db: "muted", dynamo: "match" },
      edges: [
        ["ctrl", "svc"],
        ["svc", "repo"],
        ["repo", "dynamo", { tone: "match", flow: true }],
      ],
      line: 16,
      note: L("With the rule kept, moving storage to DynamoDB changes only the repository. Controller and service don't notice.", "Qoida saqlansa, saqlashni DynamoDB'ga koʻchirish faqat repository'ni oʻzgartiradi. Controller va service buni sezmaydi."),
    },
    {
      tone: { repo: "default", svc: "compare", db: "default", dynamo: "muted" },
      edges: [
        ["ctrl", "svc"],
        ["svc", "repo", { tone: "compare" }],
        ["repo", "db"],
      ],
      line: 11,
      note: L(
        "The weak spot: business still depends on data access, so the arrow points from rules to storage details. Hexagonal and Clean Architecture flip exactly this arrow. For CRUD apps, plain layers are fine.",
        "Zaif joy: business hali ham data access'ga bogʻliq, ya'ni strelka qoidalardan saqlash tafsilotlariga qaraydi. Hexagonal va Clean Architecture aynan shu strelkani teskari qiladi. CRUD ilovalar uchun oddiy layer'lar yetarli.",
      ),
    },
  ],
};

const corner = (label: string, x: number, y: number) => ({ label, x, y, w: 140 });

const mvcMvvm: Scene = {
  title: L("MVC → MVVM → Flux: which way does data flow?", "MVC → MVVM → Flux: ma'lumot qaysi tomonga oqadi?"),
  code: `// Flux / Redux-style one-way loop with useReducer
type Action = { type: "added"; text: string } | { type: "toggled"; id: string };

function todos(state: Todo[], action: Action): Todo[] {
  switch (action.type) {
    case "added": return [...state, { id: crypto.randomUUID(), text: action.text, done: false }];
    case "toggled": return state.map((t) => (t.id === action.id ? { ...t, done: !t.done } : t));
  }
}

function TodoApp() {
  const [state, dispatch] = useReducer(todos, []);
  return <TodoList todos={state} onToggle={(id) => dispatch({ type: "toggled", id })} />;
}`,
  nodes: {
    ctrl: corner("Controller", 320, 60),
    model: corner("Model", 510, 230),
    view: corner("View", 130, 230),
    view2: corner("View", 130, 150),
    vm: corner("ViewModel", 320, 150),
    model2: corner("Model", 510, 150),
    store: { label: "Store", sub: "reducer(state, action)", x: 320, y: 60, w: 180 },
    action: corner("Action", 130, 230),
    rview: corner("View (React)", 510, 230),
  },
  frames: [
    {
      add: ["view", "ctrl", "model"],
      edges: [
        ["view", "ctrl", { label: "input" }],
        ["ctrl", "model", { label: "update" }],
        ["model", "view", { dashed: true, label: "notify" }],
      ],
      note: L(
        "MVC (Smalltalk, 1970s; later Rails and Spring MVC): the controller turns input into model updates, and the model notifies the view.",
        "MVC (Smalltalk, 1970-yillar; keyin Rails va Spring MVC): controller input'ni model yangilanishiga aylantiradi, model esa view'ga xabar beradi.",
      ),
    },
    {
      verdict: "bad",
      tone: { view: "danger", model: "danger" },
      addEdges: [["view", "model", { tone: "danger", dashed: true, label: "two-way" }]],
      note: L(
        "In big client apps views and models start updating each other in both directions, and one change cascades unpredictably. Facebook described an unread-message counter that kept going out of sync for this reason when it introduced Flux in 2014.",
        "Katta client ilovalarda view va model bir-birini ikki tomonlama yangilay boshlaydi va bitta oʻzgarish oldindan aytib boʻlmaydigan zanjir hosil qiladi. Facebook 2014-yilda Flux'ni taqdim qilganda shu sabab bilan doim notoʻgʻri koʻrsatadigan oʻqilmagan xabarlar hisoblagichini misol qilgan.",
      ),
    },
    {
      remove: ["view", "ctrl", "model"],
      add: ["view2", "vm", "model2"],
      verdict: null,
      edges: [
        ["view2", "vm", { label: "binding" }],
        ["vm", "model2"],
      ],
      note: L(
        "MVVM (WPF, Angular, Vue, SwiftUI): the ViewModel exposes state and commands shaped for one view, and the view binds to it declaratively.",
        "MVVM (WPF, Angular, Vue, SwiftUI): ViewModel bitta view uchun moslangan state va command'larni ochadi, view esa unga deklarativ bogʻlanadi.",
      ),
    },
    {
      remove: ["view2", "vm", "model2"],
      add: ["store", "action", "rview"],
      verdict: "good",
      edges: [
        ["action", "store", { tone: "match", flow: true, label: "dispatch" }],
        ["store", "rview", { tone: "match", flow: true, label: "new state" }],
        ["rview", "action", { tone: "match", flow: true, label: "user event" }],
      ],
      line: 4,
      note: L(
        "Flux: data flows one way in a loop. The view never edits state; it dispatches actions, a reducer computes the next state, the view re-renders. Redux, useReducer and Zustand all follow this shape.",
        "Flux: ma'lumot halqa boʻylab bir tomonga oqadi. View hech qachon state'ni tahrirlamaydi; u action yuboradi, reducer keyingi state'ni hisoblaydi, view qayta render boʻladi. Redux, useReducer va Zustand shu shaklga amal qiladi.",
      ),
    },
    {
      line: 12,
      note: L(
        "The interview point is not the acronym but the direction: one source of truth, changes only through explicit actions, so any state can be explained by the list of actions that produced it.",
        "Interview'dagi asosiy nuqta qisqartma emas, yoʻnalish: yagona haqiqat manbai, oʻzgarish faqat aniq action'lar orqali, shuning uchun har qanday state'ni uni yaratgan action'lar roʻyxati bilan tushuntirish mumkin.",
      ),
    },
  ],
};

const hexagonal: Scene = {
  title: L("Hexagonal: the core owns the ports, adapters plug in", "Hexagonal: port'lar yadroga tegishli, adapter'lar ulanadi"),
  width: 760,
  code: `// core — no express, no pg, no React
export interface PlaceOrder { place(cmd: NewOrder): Promise<OrderId> }   // driving port
export interface OrderRepo { save(o: Order): Promise<void> }              // driven port

export class OrderService implements PlaceOrder {
  constructor(private repo: OrderRepo) {}
  async place(cmd: NewOrder) {
    const order = Order.create(cmd);       // business rules
    await this.repo.save(order);
    return order.id;
  }
}

// adapters — outside the core
app.post("/orders", async (req, res) => res.json(await placeOrder.place(req.body)));
class PostgresOrderRepo implements OrderRepo { /* SQL */ }
class InMemoryOrderRepo implements OrderRepo { orders = new Map<OrderId, Order>(); /* … */ }`,
  nodes: {
    core: { label: "OrderService", sub: L("domain core", "domain yadrosi"), x: 380, y: 160, w: 140 },
    portIn: { label: "PlaceOrder", x: 225, y: 160, w: 120, kind: "interface" },
    portOut: { label: "OrderRepo", x: 535, y: 160, w: 120, kind: "interface" },
    http: { label: "HTTP controller", x: 75, y: 85, w: 130 },
    test: { label: L("Unit test", "Unit test"), x: 75, y: 235, w: 130 },
    pg: { label: "PostgresOrderRepo", x: 680, y: 85, w: 140 },
    mem: { label: "InMemoryOrderRepo", x: 680, y: 235, w: 140 },
  },
  frames: [
    {
      add: ["core"],
      line: 1,
      note: L("Put the business rules in the middle, with no import of a web framework, a database driver or a UI library.", "Biznes qoidalarni oʻrtaga qoʻying: veb-framework, database driver yoki UI kutubxona import qilinmaydi."),
    },
    {
      add: ["portIn", "portOut"],
      edges: [
        ["core", "portIn", { dashed: true, label: "implements" }],
        ["core", "portOut", { label: "uses" }],
      ],
      line: 2,
      note: L(
        "Ports are interfaces the core owns: a driving port is what the app offers (PlaceOrder), a driven port is what it needs (OrderRepo).",
        "Port'lar yadroga tegishli interface'lar: driving port ilova nimani taklif qilishi (PlaceOrder), driven port unga nima kerakligi (OrderRepo).",
      ),
    },
    {
      add: ["http", "pg"],
      tone: { http: "active", pg: "active" },
      addEdges: [
        ["http", "portIn", { tone: "active", flow: true }],
        ["pg", "portOut", { tone: "active", dashed: true, label: "implements" }],
      ],
      line: 15,
      note: L(
        "Adapters translate between the outside world and a port: HTTP request → place(); save() → SQL. The core never sees req, res or SQL.",
        "Adapter'lar tashqi dunyo va port orasida tarjima qiladi: HTTP so'rov → place(); save() → SQL. Yadro req, res yoki SQL'ni hech qachon koʻrmaydi.",
      ),
    },
    {
      add: ["test", "mem"],
      tone: { http: "muted", pg: "muted", test: "match", mem: "match" },
      addEdges: [
        ["test", "portIn", { tone: "match", flow: true }],
        ["mem", "portOut", { tone: "match", dashed: true }],
      ],
      line: 17,
      note: L(
        "A unit test drives the same core through the same port, with an in-memory repository. It runs in milliseconds and needs no database.",
        "Unit test xuddi shu yadroni xuddi shu port orqali, in-memory repository bilan ishlatadi. U millisekundlarda ishlaydi va baza talab qilmaydi.",
      ),
    },
    {
      tone: { http: "default", pg: "default", test: "default", mem: "default" },
      note: L(
        "Moving from Postgres to DynamoDB is a new adapter; the core is untouched. Alistair Cockburn named the pattern in 2005. The six sides mean nothing: a hexagon just has room for many ports.",
        "Postgres'dan DynamoDB'ga oʻtish — yangi adapter; yadroga tegilmaydi. Alistair Cockburn bu pattern'ni 2005-yilda nomlagan. Olti tomon hech narsani anglatmaydi: oltiburchakda shunchaki koʻp port uchun joy bor.",
      ),
    },
  ],
};

const ring = (label: Localized, x: number) => ({ label, x, y: 30, w: 150, h: 26, kind: "note" as const });

const cleanArchitecture: Scene = {
  title: L("Clean Architecture: every arrow points inward", "Clean Architecture: har bir strelka ichkariga qaraydi"),
  width: 760,
  code: `// entities
class Order { constructor(readonly items: Item[]) { if (!items.length) throw new Error("empty order"); } }

// use case + the port it owns
interface OrderRepo { save(o: Order): Promise<void> }
class PlaceOrder {
  constructor(private repo: OrderRepo) {}
  run(items: Item[]) { return this.repo.save(new Order(items)); }
}

// interface adapters
const placeOrderController = (uc: PlaceOrder) => async (req: Request) =>
  Response.json(await uc.run((await req.json()).items), { status: 201 });

// frameworks & drivers
class SqlOrderRepo implements OrderRepo { async save(o: Order) { await db.query("INSERT INTO orders …"); } }`,
  nodes: {
    h1: ring(L("Frameworks & drivers", "Framework va driver'lar"), 95),
    h2: ring(L("Interface adapters", "Interface adapter'lar"), 285),
    h3: ring(L("Use cases", "Use case'lar"), 475),
    h4: ring(L("Entities", "Entity'lar"), 665),
    next: { label: "Next.js route", x: 95, y: 110 },
    ctrl: { label: "Controller", x: 285, y: 110 },
    uc: { label: "PlaceOrder", sub: "use case", x: 475, y: 110 },
    ent: { label: "Order", sub: "entity", x: 665, y: 110 },
    repoImpl: { label: "SqlOrderRepo", x: 95, y: 200 },
    port: { label: "OrderRepo", x: 475, y: 210, kind: "interface" },
    pg: { label: "pg driver", x: 95, y: 272, w: 120, h: 30, kind: "data" },
  },
  frames: [
    {
      add: ["h1", "h2", "h3", "h4", "ent"],
      line: 1,
      note: L("Read the columns as rings, outermost on the left. At the centre: entities, the business rules that would exist even without this app.", "Ustunlarni halqa deb oʻqing, eng tashqisi chapda. Markazda entity'lar: bu ilova boʻlmasa ham mavjud boʻladigan biznes qoidalar."),
    },
    {
      add: ["uc"],
      edges: [["uc", "ent"]],
      line: 6,
      note: L("Use cases orchestrate entities for one application action, such as placing an order.", "Use case'lar bitta ilova amali uchun entity'larni boshqaradi, masalan buyurtma berish."),
    },
    {
      add: ["next", "ctrl"],
      addEdges: [
        ["next", "ctrl", { flow: true }],
        ["ctrl", "uc", { flow: true }],
      ],
      line: 12,
      note: L(
        "The Dependency Rule: source code may only depend on rings further in. The route knows the controller, the controller knows the use case, never the reverse.",
        "Dependency Rule: source code faqat ichkariroqdagi halqalarga bogʻlanishi mumkin. Route controller'ni biladi, controller use case'ni biladi, hech qachon teskarisi emas.",
      ),
    },
    {
      add: ["pg"],
      verdict: "bad",
      tone: { uc: "danger", pg: "danger" },
      addEdges: [["uc", "pg", { tone: "danger", label: "import pg" }]],
      note: L("The use case imports the database driver: an arrow pointing outward. Business rules now change when the driver does.", "Use case database driver'ni import qiladi: tashqariga qaragan strelka. Endi driver oʻzgarsa, biznes qoidalar ham oʻzgaradi."),
    },
    {
      add: ["port", "repoImpl"],
      verdict: "good",
      tone: { uc: "default", pg: "default", port: "match", repoImpl: "match" },
      dropEdges: ["uc>pg"],
      addEdges: [
        ["uc", "port", { tone: "match" }],
        ["repoImpl", "port", { tone: "match", dashed: true, label: "implements" }],
        ["repoImpl", "pg"],
      ],
      line: 16,
      note: L(
        "Invert it: the use case owns an OrderRepo interface, and SqlOrderRepo in the outer ring implements it. Every arrow that crosses a ring points inward again.",
        "Teskari qiling: OrderRepo interface'i use case'ga tegishli, tashqi halqadagi SqlOrderRepo uni amalga oshiradi. Halqani kesib oʻtadigan har bir strelka yana ichkariga qaraydi.",
      ),
    },
    {
      tone: { port: "default", repoImpl: "default" },
      note: L(
        "Clean Architecture is hexagonal plus named rings. The rings are a direction, not a quota: a CRUD endpoint doesn't need four folders.",
        "Clean Architecture — bu hexagonal va nomlangan halqalar. Halqalar kvota emas, yoʻnalish: CRUD endpoint'ga toʻrtta papka shart emas.",
      ),
    },
  ],
};

const mod = (label: string, x: number) => ({ label, sub: "public API", x, y: 140 });
const tables = (label: string, x: number) => ({ label, x, y: 262, w: 130, h: 36, kind: "data" as const });

const modularMonolith: Scene = {
  title: L("Modular monolith: one deploy, enforced boundaries", "Modular monolith: bitta deploy, majburiy chegaralar"),
  height: 320,
  code: `src/modules/
  billing/
    index.ts        // public API: the only file other modules may import
    internal/       // tables, services — never imported from outside
  orders/
  catalog/

// orders/internal/checkout.ts
import { charge } from "@/modules/billing";                       // ✓ public API
// import { invoices } from "@/modules/billing/internal/db";      // ✗ blocked by a lint rule

await charge({ orderId, amount });`,
  nodes: {
    deploy: { label: L("one process · one deploy", "bitta jarayon · bitta deploy"), x: 320, y: 35, w: 280, h: 36, kind: "data" },
    catalog: mod("catalog", 110),
    orders: mod("orders", 320),
    billing: mod("billing", 530),
    catDb: tables("catalog.*", 110),
    ordDb: tables("orders.*", 320),
    billDb: tables("billing.*", 530),
  },
  frames: [
    {
      add: ["deploy", "catalog", "orders", "billing"],
      line: 1,
      note: L("One codebase, one deployment, split into modules by business capability.", "Bitta kod bazasi, bitta deploy, biznes imkoniyati boʻyicha modullarga boʻlingan."),
    },
    {
      add: ["catDb", "ordDb", "billDb"],
      edges: [
        ["catalog", "catDb"],
        ["orders", "ordDb"],
        ["billing", "billDb"],
      ],
      line: 4,
      note: L("Each module owns its tables (a schema per module) inside the same database.", "Har bir modul bitta baza ichidagi oʻz jadvallariga (har modulga bitta schema) egalik qiladi."),
    },
    {
      verdict: "bad",
      tone: { orders: "danger", billDb: "danger" },
      addEdges: [["orders", "billDb", { tone: "danger", label: "SELECT" }]],
      line: 10,
      note: L(
        "orders reads billing's tables directly. Now billing can't rename a column without breaking orders, and nobody sees the coupling in the module list.",
        "orders billing jadvallarini toʻgʻridan-toʻgʻri oʻqiydi. Endi billing orders'ni buzmasdan ustun nomini oʻzgartira olmaydi va bu bogʻliqlikni modullar roʻyxatida hech kim koʻrmaydi.",
      ),
    },
    {
      verdict: "good",
      tone: { orders: "default", billDb: "default", billing: "match" },
      dropEdges: ["orders>billDb"],
      addEdges: [["orders", "billing", { tone: "match", flow: true, label: "charge()" }]],
      line: 9,
      note: L(
        "Go through billing's public API, or publish an in-process event. A lint rule (eslint-plugin-boundaries, dependency-cruiser, Nx module boundaries) fails CI on any import of another module's internal/.",
        "Billing'ning public API'si orqali boring yoki jarayon ichida event e'lon qiling. Lint qoidasi (eslint-plugin-boundaries, dependency-cruiser, Nx module boundaries) boshqa modulning internal/ papkasidan qilingan har qanday import'da CI'ni yiqitadi.",
      ),
    },
    {
      tone: { billing: "active" },
      relabel: { billing: { sub: L("extracted service", "ajratilgan service") } },
      edges: [
        ["catalog", "catDb"],
        ["orders", "ordDb"],
        ["billing", "billDb"],
        ["orders", "billing", { tone: "active", flow: true, label: "HTTP / events" }],
      ],
      note: L(
        "Because the boundary was clean, extracting billing into its own service later is mechanical: the call site stays, only the transport changes.",
        "Chegara toza boʻlgani uchun billing'ni keyinroq alohida service'ga ajratish mexanik ish: chaqiruv joyi qoladi, faqat transport oʻzgaradi.",
      ),
    },
    {
      tone: { billing: "default" },
      relabel: { billing: { sub: "public API" } },
      note: L(
        "Shopify wrote in 2019 about choosing a modular monolith for its core Rails app instead of splitting into microservices. Most teams should start here.",
        "Shopify 2019-yilda asosiy Rails ilovasi uchun microservices'ga boʻlish oʻrniga modular monolith tanlagani haqida yozgan. Koʻp jamoalar shu yerdan boshlashi kerak.",
      ),
    },
  ],
};

const ctx = (label: Localized, sub: Localized, x: number) => ({ label, sub, x, y: 70, w: 200 });
const team = (label: Localized, x: number) => ({ label, x, y: 275, w: 140, h: 34, kind: "data" as const });

const domainDrivenDesign: Scene = {
  title: L("DDD: one word, three bounded contexts", "DDD: bitta soʻz, uchta bounded context"),
  width: 700,
  height: 320,
  code: `// sales/customer.ts — what "customer" means to Sales
type Customer = { id: CustomerId; company: string; dealStage: "lead" | "qualified" | "won" };

// shipping/recipient.ts — Shipping never sees deal stages
type Recipient = { customerId: CustomerId; name: string; address: Address };

// ubiquitous language: methods named after what the business says
class Order {
  place() { if (this.lines.length === 0) throw new DomainError("Order has no lines"); this.status = "placed"; }
}

// shipping/acl.ts — anti-corruption layer over the legacy warehouse API
const toRecipient = (row: LegacyWmsRow): Recipient =>
  ({ customerId: row.CUST_NO as CustomerId, name: row.NM, address: parseAddress(row.ADDR1) });`,
  nodes: {
    one: { label: "Customer", sub: L("40 fields, used by everyone", "40 ta maydon, hamma ishlatadi"), x: 350, y: 160, w: 260 },
    sales: ctx(L("Sales context", "Sales context"), L("Customer: deal stage", "Customer: deal bosqichi"), 130),
    support: ctx(L("Support context", "Support context"), L("Customer: tickets, SLA", "Customer: ticket, SLA"), 350),
    shipping: ctx(L("Shipping context", "Shipping context"), L("Recipient: address", "Recipient: manzil"), 570),
    t1: team(L("Sales team", "Sales jamoasi"), 130),
    t2: team(L("Support team", "Support jamoasi"), 350),
    t3: team(L("Shipping team", "Shipping jamoasi"), 570),
    acl: { label: "ACL", sub: "anti-corruption", x: 500, y: 175, w: 130, h: 44, kind: "interface" },
    legacy: { label: "Legacy WMS", x: 635, y: 175, w: 110, h: 36, kind: "data" },
  },
  frames: [
    {
      add: ["one", "t1", "t2", "t3"],
      verdict: "bad",
      tone: { one: "danger" },
      edges: [
        ["t1", "one", { tone: "compare" }],
        ["t2", "one", { tone: "compare" }],
        ["t3", "one", { tone: "compare" }],
      ],
      note: L(
        "One shared Customer model. Every team adds its own fields, and a change Sales needs breaks Shipping's code.",
        "Bitta umumiy Customer modeli. Har bir jamoa oʻz maydonlarini qoʻshadi va Sales'ga kerak boʻlgan oʻzgarish Shipping kodini buzadi.",
      ),
    },
    {
      remove: ["one"],
      add: ["sales", "support", "shipping"],
      verdict: "good",
      edges: [
        ["t1", "sales", { tone: "match" }],
        ["t2", "support", { tone: "match" }],
        ["t3", "shipping", { tone: "match" }],
      ],
      line: 2,
      note: L(
        "Bounded contexts: each team gets its own model and its own language. \"Customer\" means something different in Sales and Support, and that is fine — inside one context each word has one meaning.",
        "Bounded context'lar: har bir jamoa oʻz modeli va oʻz tiliga ega. \"Customer\" Sales va Support'da turlicha ma'noni anglatadi va bu normal — bitta context ichida har bir soʻz bitta ma'noga ega.",
      ),
    },
    {
      add: ["acl", "legacy"],
      addEdges: [
        ["sales", "support", { flow: true, label: "CustomerSignedUp" }],
        ["shipping", "acl"],
        ["acl", "legacy", { dashed: true }],
      ],
      line: 13,
      note: L(
        "Contexts meet through explicit contracts: published events, or an anti-corruption layer that translates a legacy model so its names don't leak into yours.",
        "Context'lar aniq kontraktlar orqali uchrashadi: e'lon qilingan event'lar yoki legacy modelni tarjima qilib, uning nomlari sizning modelingizga oʻtib ketmasligini ta'minlaydigan anti-corruption layer.",
      ),
    },
    {
      line: 9,
      note: L(
        "Ubiquitous language: code uses the words domain experts use — order.place(), not order.status = 2. Aggregates such as Order guard their own rules.",
        "Ubiquitous language: kod domain mutaxassislari ishlatadigan soʻzlarni ishlatadi — order.status = 2 emas, order.place(). Order kabi aggregate'lar oʻz qoidalarini oʻzi himoya qiladi.",
      ),
    },
    {
      note: L(
        "Bounded contexts are the best first cut for modules in a monolith and, later, for microservices: the seams already follow how the business is organised.",
        "Bounded context'lar monolith'dagi modullar va keyinchalik microservices uchun eng yaxshi birinchi kesim: choklar allaqachon biznes qanday tashkil qilinganiga mos keladi.",
      ),
    },
  ],
};

const service = (label: string, x: number) => ({ label, x, y: 150, w: 140 });
const store = (label: string, x: number) => ({ label, x, y: 270, w: 140, h: 36, kind: "data" as const });

const microservices: Scene = {
  title: L("Microservices: own data, isolate failure", "Microservices: oʻz ma'lumoti, xatoni izolyatsiya qilish"),
  height: 320,
  code: `// orders-service: call payments with a timeout, retries and an idempotency key
async function charge(orderId: string, amount: number) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(PAYMENTS_URL + "/charges", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Idempotency-Key": orderId },
        body: JSON.stringify({ orderId, amount }),
        signal: AbortSignal.timeout(2_000),
      });
      if (res.ok) return await res.json();
    } catch { /* timeout or network error: retry */ }
    await sleep(2 ** attempt * 200 + Math.random() * 100);   // backoff + jitter
  }
  throw new PaymentUnavailable(orderId);                       // caller stores "payment pending"
}`,
  nodes: {
    gw: { label: "API gateway", x: 320, y: 40, w: 170 },
    users: service("users", 110),
    orders: service("orders", 320),
    payments: service("payments", 530),
    shared: { label: L("one shared database", "bitta umumiy baza"), x: 320, y: 270, w: 300, h: 36, kind: "data" },
    udb: store("users DB", 110),
    odb: store("orders DB", 320),
    pdb: store("payments DB", 530),
  },
  frames: [
    {
      add: ["gw", "users", "orders", "payments", "shared"],
      verdict: "bad",
      tone: { shared: "danger" },
      edges: [
        ["gw", "users"],
        ["gw", "orders"],
        ["gw", "payments"],
        ["users", "shared", { tone: "danger" }],
        ["orders", "shared", { tone: "danger" }],
        ["payments", "shared", { tone: "danger" }],
      ],
      note: L(
        "Three services sharing one database: a schema change in orders breaks payments, so deploys still have to be coordinated. This is a distributed monolith — the costs of both, the benefits of neither.",
        "Bitta bazani boʻlishadigan uchta service: orders'dagi schema oʻzgarishi payments'ni buzadi, ya'ni deploy'lar hali ham kelishilishi kerak. Bu distributed monolith — ikkalasining xarajati bor, foydasi yoʻq.",
      ),
    },
    {
      remove: ["shared"],
      add: ["udb", "odb", "pdb"],
      verdict: "good",
      edges: [
        ["gw", "users"],
        ["gw", "orders"],
        ["gw", "payments"],
        ["users", "udb"],
        ["orders", "odb"],
        ["payments", "pdb"],
        ["orders", "payments", { label: "API" }],
      ],
      note: L(
        "Database per service: each team changes its own schema freely. Other services get its data only through its API or its events.",
        "Har bir service'ga oʻz bazasi: har bir jamoa oʻz schema'sini erkin oʻzgartiradi. Boshqa service'lar uning ma'lumotini faqat API yoki event'lari orqali oladi.",
      ),
    },
    {
      tone: { payments: "danger" },
      badge: { payments: "down" },
      dropEdges: ["orders>payments"],
      addEdges: [["orders", "payments", { tone: "danger", dashed: true, label: "timeout" }]],
      line: 9,
      note: L(
        "payments goes down. A network call can fail or hang, so orders must time out fast, retry with backoff and jitter, and stop calling for a while (a circuit breaker) instead of piling up requests.",
        "payments ishdan chiqadi. Tarmoq chaqiruvi yiqilishi yoki osilib qolishi mumkin, shuning uchun orders tez timeout qilishi, backoff va jitter bilan qayta urinishi va so'rovlarni toʻplash oʻrniga bir muddat chaqirishni toʻxtatishi (circuit breaker) kerak.",
      ),
    },
    {
      tone: { orders: "active" },
      badge: { orders: L("pending", "kutilmoqda") },
      line: 15,
      note: L(
        "orders accepts the order as \"payment pending\" and retries later; the idempotency key makes a retried charge safe. users and catalog keep working: the failure stays inside one service.",
        "orders buyurtmani \"toʻlov kutilmoqda\" holatida qabul qiladi va keyinroq qayta urinadi; idempotency key qayta yuborilgan toʻlovni xavfsiz qiladi. users va catalog ishlashda davom etadi: xato bitta service ichida qoladi.",
      ),
    },
    {
      tone: { orders: "default", payments: "match" },
      badge: { orders: "", payments: "v42" },
      dropEdges: ["orders>payments"],
      addEdges: [["orders", "payments", { label: "API" }]],
      note: L(
        "Each service deploys on its own, owned end to end by a small team (Amazon's \"two-pizza teams\"). You pay with network failures, distributed tracing, API versioning and eventual consistency — so start from a modular monolith.",
        "Har bir service alohida deploy qilinadi va boshidan oxirigacha kichik jamoaga tegishli (Amazon'ning \"two-pizza team\"lari). Buning narxi — tarmoq xatolari, distributed tracing, API versiyalash va eventual consistency; shuning uchun modular monolith'dan boshlang.",
      ),
    },
  ],
};

const consumer = (label: string, y: number) => ({ label, x: 530, y, w: 140 });

const eventDriven: Scene = {
  title: L("Event-driven: publish a fact, let others react", "Event-driven: faktni e'lon qiling, boshqalar javob bersin"),
  code: `// producer: publish a fact, keyed by order id (ordered per key)
await producer.send({
  topic: "orders.placed",
  messages: [{ key: order.id, value: JSON.stringify({ type: "OrderPlaced", orderId: order.id, total: order.total }) }],
});

// consumer: idempotent, because delivery is at-least-once
await consumer.run({
  eachMessage: async ({ message }) => {
    const event = JSON.parse(message.value!.toString());
    if (await processed.has(event.orderId)) return;   // duplicate → skip
    await sendConfirmationEmail(event.orderId);
    await processed.add(event.orderId);
  },
});`,
  nodes: {
    order: { label: "OrderService", x: 100, y: 150, w: 140 },
    email: consumer("EmailService", 50),
    inv: consumer("Inventory", 150),
    analytics: consumer("Analytics", 250),
    broker: { label: "Kafka topic", sub: "orders.placed", x: 320, y: 150, w: 150, kind: "data" },
    fraud: { label: "FraudCheck", x: 320, y: 262, w: 140 },
  },
  frames: [
    {
      add: ["order", "email", "inv", "analytics"],
      verdict: "bad",
      edges: [
        ["order", "email", { tone: "compare", flow: true }],
        ["order", "inv", { tone: "compare", flow: true }],
        ["order", "analytics", { tone: "compare", flow: true }],
      ],
      note: L(
        "Synchronous chain: placing an order calls three services one after another. Latency is the sum of all three, and OrderService has to know every one of them.",
        "Sinxron zanjir: buyurtma berish uchta service'ni ketma-ket chaqiradi. Kechikish uchalasining yigʻindisi va OrderService ularning har birini bilishi kerak.",
      ),
    },
    {
      tone: { email: "danger", order: "danger" },
      edges: [
        ["order", "email", { tone: "danger" }],
        ["order", "inv", { tone: "compare" }],
        ["order", "analytics", { tone: "compare" }],
      ],
      note: L("Email is down, so POST /orders returns 500 — even though the order itself was fine.", "Email ishlamayapti, shuning uchun POST /orders 500 qaytaradi — buyurtmaning oʻzi joyida boʻlsa ham."),
    },
    {
      add: ["broker"],
      verdict: "good",
      tone: { email: "default", order: "default", broker: "active" },
      edges: [
        ["order", "broker", { tone: "match", flow: true, label: "OrderPlaced" }],
        ["broker", "email", { flow: true }],
        ["broker", "inv", { flow: true }],
        ["broker", "analytics", { flow: true }],
      ],
      line: 2,
      note: L(
        "Instead, OrderService publishes one event to a topic and returns. Each consumer reads the topic at its own pace and keeps its own position (offset).",
        "Buning oʻrniga OrderService topic'ga bitta event e'lon qiladi va javob qaytaradi. Har bir consumer topic'ni oʻz tezligida oʻqiydi va oʻz pozitsiyasini (offset) saqlaydi.",
      ),
    },
    {
      tone: { email: "danger", broker: "default" },
      badge: { email: L("lag 2 min", "2 daq orqada") },
      edges: [
        ["order", "broker", { tone: "match", flow: true }],
        ["broker", "email", { tone: "danger", dashed: true }],
        ["broker", "inv", { flow: true }],
        ["broker", "analytics", { flow: true }],
      ],
      note: L(
        "Email goes down again. Its events wait in the topic; when it recovers it continues from its offset. Checkout never noticed.",
        "Email yana ishdan chiqadi. Uning event'lari topic'da kutib turadi; tiklangach, u oʻz offset'idan davom etadi. Checkout buni sezmadi ham.",
      ),
    },
    {
      add: ["fraud"],
      tone: { email: "default", fraud: "match" },
      badge: { email: "", fraud: L("new", "yangi") },
      edges: [
        ["order", "broker", { flow: true }],
        ["broker", "email", { flow: true }],
        ["broker", "inv", { flow: true }],
        ["broker", "analytics", { flow: true }],
        ["broker", "fraud", { tone: "match", flow: true }],
      ],
      line: 8,
      note: L("A new FraudCheck consumer subscribes to the same topic. OrderService was not changed or redeployed.", "Yangi FraudCheck consumer xuddi shu topic'ga obuna boʻladi. OrderService oʻzgartirilmadi ham, qayta deploy ham qilinmadi."),
    },
    {
      tone: { fraud: "default" },
      badge: { fraud: "" },
      line: 11,
      note: L(
        "The costs: eventual consistency, duplicate deliveries (so consumers must be idempotent), ordering only within a partition key, and harder debugging without trace ids. Kafka itself was built at LinkedIn for this kind of fan-out.",
        "Narxi: eventual consistency, takroriy yetkazish (shuning uchun consumer'lar idempotent boʻlishi kerak), tartib faqat bitta partition key ichida va trace id'larsiz qiyinroq debugging. Kafka'ning oʻzi LinkedIn'da aynan shunday tarqatish uchun yaratilgan.",
      ),
    },
  ],
};

const cqrs: Scene = {
  title: L("CQRS: write one model, read another", "CQRS: bitta modelga yozing, boshqasidan oʻqing"),
  width: 700,
  code: `// write side: rules + normalised tables + outbox in one transaction
async function placeOrder(cmd: PlaceOrder) {
  const order = Order.create(cmd);
  await db.transaction(async (tx) => {
    await tx.orders.insert(order);
    await tx.outbox.insert({ type: "OrderPlaced", payload: order });
  });
}

// projector: builds the read model from events
on("OrderPlaced", async (e) => {
  await readDb.ordersByCustomer.upsert({ customerId: e.customerId, orderId: e.id, total: e.total, status: "placed" });
});

// query: already shaped for the screen, no joins
const rows = await readDb.ordersByCustomer.find({ customerId });`,
  nodes: {
    client: { label: "Client", x: 80, y: 150, w: 120, kind: "data" },
    cmd: { label: "Command handler", sub: "PlaceOrder", x: 260, y: 70, w: 160 },
    wdb: { label: L("write model", "write model"), x: 460, y: 70, w: 150, kind: "data" },
    events: { label: L("events", "event'lar"), x: 620, y: 150, w: 120, kind: "data" },
    proj: { label: "Projector", x: 460, y: 230, w: 150 },
    rdb: { label: L("read model", "read model"), sub: "orders_by_customer", x: 260, y: 230, w: 170, kind: "data" },
  },
  frames: [
    {
      add: ["client", "cmd", "wdb"],
      edges: [
        ["client", "cmd", { flow: true, label: "PlaceOrder" }],
        ["cmd", "wdb", { flow: true }],
      ],
      line: 2,
      note: L("Writes arrive as commands. The handler checks the rules and writes to a normalised model built for consistency.", "Yozish command sifatida keladi. Handler qoidalarni tekshiradi va izchillik uchun qurilgan normallashgan modelga yozadi."),
    },
    {
      add: ["events"],
      addEdges: [["wdb", "events", { flow: true, label: "OrderPlaced" }]],
      line: 6,
      note: L(
        "Each committed change also produces an event — via an outbox row in the same transaction, or change data capture — so no change is lost.",
        "Har bir commit qilingan oʻzgarish event ham hosil qiladi — oʻsha transaction ichidagi outbox qatori yoki change data capture orqali — shunda hech bir oʻzgarish yoʻqolmaydi.",
      ),
    },
    {
      add: ["proj", "rdb"],
      addEdges: [
        ["events", "proj", { flow: true }],
        ["proj", "rdb", { flow: true }],
      ],
      line: 11,
      note: L("A projector listens and maintains a denormalised read model shaped like the screen: one row per order, already joined.", "Projector tinglaydi va ekranga moslangan denormallashgan read model'ni yuritadi: har buyurtmaga bitta qator, allaqachon join qilingan."),
    },
    {
      tone: { rdb: "match" },
      addEdges: [["client", "rdb", { tone: "match", flow: true, label: "GET /orders" }]],
      line: 16,
      note: L(
        "Queries read the precomputed view: no joins, and the read side scales on its own with replicas, a cache or a search index.",
        "So'rovlar oldindan hisoblangan view'ni oʻqiydi: join yoʻq va oʻqish tomoni replica, cache yoki search index bilan alohida kengayadi.",
      ),
    },
    {
      tone: { rdb: "compare" },
      badge: { rdb: L("lag ~200 ms", "~200 ms orqada") },
      note: L(
        "The price is eventual consistency: right after placing an order the list may not show it yet. Hide it with an optimistic update, or read your own writes from the write side.",
        "Narxi — eventual consistency: buyurtma berilgandan keyin darhol roʻyxatda u hali koʻrinmasligi mumkin. Buni optimistic update bilan yashiring yoki oʻz yozganingizni write tomondan oʻqing.",
      ),
    },
    {
      tone: { rdb: "default" },
      badge: { rdb: "" },
      note: L(
        "Use CQRS when reads and writes differ a lot in shape or load (feeds, dashboards, search). For plain CRUD it doubles the moving parts. It pairs well with event sourcing but doesn't require it.",
        "CQRS'ni oʻqish va yozish shakli yoki yuklamasi juda farq qilganda ishlating (feed, dashboard, qidiruv). Oddiy CRUD uchun u harakatlanuvchi qismlarni ikki barobar oshiradi. Event sourcing bilan yaxshi juftlashadi, lekin uni talab qilmaydi.",
      ),
    },
  ],
};

const ev = (label: string, x: number) => ({ label, x, y: 80, w: 130, h: 36, kind: "data" as const });

const eventSourcing: Scene = {
  title: L("Event sourcing: state is a fold over the log", "Event sourcing: state — log ustidan fold"),
  code: `type Event =
  | { type: "Opened" }
  | { type: "Deposited"; amount: number }
  | { type: "Withdrew"; amount: number };

const apply = (balance: number, e: Event) =>
  e.type === "Deposited" ? balance + e.amount : e.type === "Withdrew" ? balance - e.amount : balance;

async function withdraw(accountId: string, amount: number) {
  const events = await store.read(accountId);            // or: snapshot + newer events
  const balance = events.reduce(apply, 0);
  if (amount > balance) throw new InsufficientFunds();
  await store.append(accountId, [{ type: "Withdrew", amount }], { expectedVersion: events.length });
}`,
  nodes: {
    e1: ev("Opened", 85),
    e2: ev("Deposited 100", 230),
    e3: ev("Withdrew 30", 375),
    e4: ev("Deposited 50", 520),
    bal: { label: "balance", sub: "0", x: 320, y: 200, w: 180 },
    cmd: { label: "withdraw(500)", x: 540, y: 200, w: 150 },
    snap: { label: "snapshot v3 = 70", x: 110, y: 230, w: 150, h: 36, kind: "data" },
  },
  frames: [
    {
      add: ["e1", "bal"],
      edges: [["e1", "bal", { flow: true }]],
      line: 1,
      note: L("Instead of storing the current balance, store what happened, as an append-only list of events.", "Joriy balansni saqlash oʻrniga nima sodir boʻlganini faqat qoʻshiladigan event'lar roʻyxati sifatida saqlang."),
    },
    {
      add: ["e2"],
      relabel: { bal: { sub: "100" } },
      edges: [["e2", "bal", { tone: "active", flow: true }]],
      line: 7,
      note: L("Current state is computed by applying each event in order: 0 + 100 = 100.", "Joriy holat har bir event'ni tartib bilan qoʻllab hisoblanadi: 0 + 100 = 100."),
    },
    {
      add: ["e3"],
      relabel: { bal: { sub: "70" } },
      edges: [["e3", "bal", { tone: "active", flow: true }]],
      note: L("100 − 30 = 70.", "100 − 30 = 70."),
    },
    {
      add: ["e4"],
      relabel: { bal: { sub: "120" } },
      edges: [["e4", "bal", { tone: "active", flow: true }]],
      line: 11,
      note: L("70 + 50 = 120. The balance is a fold — events.reduce(apply, 0) — never a stored number.", "70 + 50 = 120. Balans — fold, ya'ni events.reduce(apply, 0); u hech qachon saqlangan son emas."),
    },
    {
      add: ["cmd"],
      tone: { cmd: "danger" },
      edges: [["cmd", "bal", { tone: "danger" }]],
      line: 12,
      note: L(
        "A command is checked against the current state first. withdraw(500) fails against 120, so nothing is appended.",
        "Command avval joriy holatga qarshi tekshiriladi. withdraw(500) 120 ga qarshi yiqiladi, shuning uchun hech narsa qoʻshilmaydi.",
      ),
    },
    {
      remove: ["cmd"],
      edges: [],
      line: 13,
      note: L(
        "You get a full audit log and time travel (\"what was the balance on 1 March?\"), and you can build new read models from old events. expectedVersion stops two writers from appending at once.",
        "Sizda toʻliq audit log va vaqt boʻyicha sayohat (\"1-martda balans qancha edi?\") boʻladi va eski event'lardan yangi read model'lar qura olasiz. expectedVersion ikki yozuvchining bir vaqtda qoʻshishini toʻxtatadi.",
      ),
    },
    {
      add: ["snap"],
      tone: { snap: "match" },
      edges: [["snap", "bal", { tone: "match" }]],
      line: 10,
      note: L(
        "Long streams are loaded from a snapshot plus newer events. The hard parts are versioning event schemas forever and deleting personal data from an immutable log.",
        "Uzun stream'lar snapshot va undan keyingi event'lardan yuklanadi. Qiyin qismlari — event schema'larini abadiy versiyalash va oʻzgarmas log'dan shaxsiy ma'lumotni oʻchirish.",
      ),
    },
  ],
};

const step = (label: string, sub: string, x: number) => ({ label, sub, x, y: 80, w: 130 });

const saga: Scene = {
  title: L("Saga: local transactions and compensations", "Saga: lokal transaction'lar va kompensatsiyalar"),
  width: 700,
  code: `// orchestrated saga: every step and every compensation is idempotent
async function placeOrderSaga(input: NewOrder) {
  const order = await orders.create(input);                        // T1
  try {
    const charge = await payments.charge(order.id, order.total);   // T2
    try {
      await inventory.reserve(order.id, order.items);              // T3
      await shipping.book(order.id);                               // T4
    } catch (e) {
      await payments.refund(charge.id);                            // C2
      throw e;
    }
  } catch (e) {
    await orders.cancel(order.id, String(e));                      // C1
    throw e;
  }
}`,
  nodes: {
    order: step("Order", "create", 90),
    pay: step("Payment", "charge", 260),
    inv: step("Inventory", "reserve", 430),
    ship: step("Shipping", "book", 600),
    cpay: { label: "refund", x: 260, y: 220, w: 150, h: 36, kind: "data" },
    corder: { label: "cancel order", x: 90, y: 220, w: 140, h: 36, kind: "data" },
    orch: { label: "OrderSaga", sub: "orchestrator", x: 520, y: 235, w: 170 },
  },
  frames: [
    {
      add: ["order"],
      tone: { order: "match" },
      line: 3,
      note: L(
        "Order, payment and inventory each have their own database, so there is no single ACID transaction across them. A saga is a sequence of local transactions. T1: create the order.",
        "Order, payment va inventory'ning har birida oʻz bazasi bor, shuning uchun ular orasida yagona ACID transaction yoʻq. Saga — lokal transaction'lar ketma-ketligi. T1: buyurtma yaratish.",
      ),
    },
    {
      add: ["pay"],
      tone: { pay: "match" },
      edges: [["order", "pay", { flow: true }]],
      line: 5,
      note: L("T2: payments charges the card and commits in its own database.", "T2: payments kartadan pul yechadi va oʻz bazasida commit qiladi."),
    },
    {
      add: ["inv"],
      verdict: "bad",
      tone: { inv: "danger" },
      badge: { inv: L("out of stock", "omborda yoʻq") },
      addEdges: [["pay", "inv", { tone: "danger", flow: true }]],
      line: 7,
      note: L("T3 fails: the item is out of stock. But T1 and T2 already committed — there is nothing to roll back.", "T3 yiqiladi: mahsulot omborda yoʻq. Lekin T1 va T2 allaqachon commit boʻlgan — orqaga qaytariladigan narsa yoʻq."),
    },
    {
      add: ["cpay"],
      tone: { cpay: "compare" },
      addEdges: [["inv", "cpay", { tone: "compare", flow: true }]],
      line: 10,
      note: L("So the saga runs compensating transactions in reverse order. C2: refund the payment.", "Shuning uchun saga kompensatsiya transaction'larini teskari tartibda bajaradi. C2: toʻlovni qaytarish."),
    },
    {
      add: ["corder"],
      verdict: "good",
      tone: { corder: "compare" },
      addEdges: [["cpay", "corder", { tone: "compare", flow: true }]],
      line: 14,
      note: L(
        "C1: cancel the order and tell the customer. The system is consistent again — eventually. Compensations are business actions (a refund), not an undo of history.",
        "C1: buyurtmani bekor qilish va mijozga xabar berish. Tizim yana izchil — oxir-oqibat. Kompensatsiyalar tarixni bekor qilish emas, biznes amallari (pulni qaytarish).",
      ),
    },
    {
      add: ["orch"],
      tone: { orch: "active" },
      addEdges: [
        ["orch", "order", { tone: "active", dashed: true }],
        ["orch", "pay", { tone: "active", dashed: true }],
        ["orch", "inv", { tone: "active", dashed: true }],
      ],
      line: 2,
      note: L(
        "Orchestration: one coordinator owns the flow (durable workflow engines such as Temporal or AWS Step Functions). Choreography: each service reacts to the previous one's events. Either way, every step must be safe to retry.",
        "Orchestration: oqimga bitta koordinator egalik qiladi (Temporal yoki AWS Step Functions kabi durable workflow dvigatellari). Choreography: har bir service oldingisining event'lariga javob beradi. Har ikki holatda ham har bir qadamni qayta urinish xavfsiz boʻlishi kerak.",
      ),
    },
  ],
};

export const scenes: Record<string, Scene> = {
  "feature-sliced-design": featureSlicedDesign,
  "atomic-design": atomicDesign,
  "micro-frontends": microFrontends,
  monorepo,
  bff,
  layered,
  "mvc-mvvm": mvcMvvm,
  hexagonal,
  "clean-architecture": cleanArchitecture,
  "modular-monolith": modularMonolith,
  "domain-driven-design": domainDrivenDesign,
  microservices,
  "event-driven": eventDriven,
  cqrs,
  "event-sourcing": eventSourcing,
  saga,
};
