import type { Localized } from "@/visualizer/core/types";

/**
 * Type-level exercises. `tests` is appended after the learner's code and must
 * type-check with zero errors. Helpers Equal/Expect are always in scope.
 */
export interface Puzzle {
  title: Localized;
  prompt: Localized;
  starter: string;
  tests: string;
  solution: string;
}

export const PUZZLE_PRELUDE = `type Equal<X, Y> = (<T>() => T extends X ? 1 : 2) extends (<T>() => T extends Y ? 1 : 2) ? true : false;
type Expect<T extends true> = T;
`;

export const puzzles = {
  "my-pick": {
    title: { en: "Implement MyPick<T, K>", uz: "MyPick<T, K> ni yozing" },
    prompt: {
      en: "Build Pick from scratch with a mapped type. K must be constrained to keys of T.",
      uz: "Mapped type yordamida Pick'ni noldan yozing. K faqat T ning key'lari boʻlishi shart.",
    },
    starter: `type MyPick<T, K> = any;`,
    tests: `interface Todo { title: string; done: boolean; tags: string[] }
type cases = [
  Expect<Equal<MyPick<Todo, "title">, { title: string }>>,
  Expect<Equal<MyPick<Todo, "title" | "done">, { title: string; done: boolean }>>,
];
// @ts-expect-error — "nope" is not a key of Todo
type invalid = MyPick<Todo, "nope">;`,
    solution: `type MyPick<T, K extends keyof T> = { [P in K]: T[P] };`,
  },
  "deep-readonly": {
    title: { en: "Implement DeepReadonly<T>", uz: "DeepReadonly<T> ni yozing" },
    prompt: {
      en: "Make every property readonly at every depth, but leave functions callable as they are.",
      uz: "Har bir chuqurlikdagi har bir property'ni readonly qiling, lekin funksiyalarni oʻz holicha chaqiriladigan qoldiring.",
    },
    starter: `type DeepReadonly<T> = any;`,
    tests: `type X = { a: { b: { c: number[] } }; f: () => void };
type R = DeepReadonly<X>;
type cases = [
  Expect<Equal<R["a"]["b"]["c"], readonly number[]>>,
  Expect<Equal<R["f"], () => void>>,
];
declare const r: R;
// @ts-expect-error — nested write must fail
r.a.b = { c: [] };`,
    solution: `type DeepReadonly<T> = T extends (...args: never[]) => unknown
  ? T
  : { readonly [K in keyof T]: DeepReadonly<T[K]> };`,
  },
  "tuple-to-union": {
    title: { en: "TupleToUnion and First", uz: "TupleToUnion va First" },
    prompt: {
      en: "TupleToUnion<[1, 'a']> = 1 | 'a'. First<T> returns the first element type, or never for an empty tuple — use infer.",
      uz: "TupleToUnion<[1, 'a']> = 1 | 'a'. First<T> birinchi element turini, boʻsh tuple uchun never qaytaradi — infer ishlating.",
    },
    starter: `type TupleToUnion<T extends readonly unknown[]> = any;
type First<T extends readonly unknown[]> = any;`,
    tests: `type cases = [
  Expect<Equal<TupleToUnion<[1, "a", true]>, 1 | "a" | true>>,
  Expect<Equal<First<[3, 2, 1]>, 3>>,
  Expect<Equal<First<[]>, never>>,
  Expect<Equal<First<[undefined]>, undefined>>,
];`,
    solution: `type TupleToUnion<T extends readonly unknown[]> = T[number];
type First<T extends readonly unknown[]> = T extends [infer H, ...unknown[]] ? H : never;`,
  },
  "union-to-intersection": {
    title: { en: "UnionToIntersection<U>", uz: "UnionToIntersection<U>" },
    prompt: {
      en: "Turn A | B into A & B. Hint: distribute U into a function parameter position (contravariant), then infer a single type from it.",
      uz: "A | B ni A & B ga aylantiring. Maslahat: U ni funksiya parametri pozitsiyasiga (contravariant) taqsimlang, keyin undan bitta turni infer qiling.",
    },
    starter: `type UnionToIntersection<U> = any;`,
    tests: `type cases = [
  Expect<Equal<UnionToIntersection<{ a: 1 } | { b: 2 }>, { a: 1 } & { b: 2 }>>,
  Expect<Equal<UnionToIntersection<"x">, "x">>,
];`,
    solution: `type UnionToIntersection<U> =
  (U extends unknown ? (arg: U) => void : never) extends (arg: infer I) => void ? I : never;`,
  },
  "template-literal-routes": {
    title: { en: "Extract route params", uz: "Route parametrlarini ajratib olish" },
    prompt: {
      en: 'Params<"/users/:id/posts/:postId"> should be "id" | "postId". Use template literal types with infer and recursion.',
      uz: 'Params<"/users/:id/posts/:postId"> natijasi "id" | "postId" boʻlishi kerak. infer va recursion bilan template literal type ishlating.',
    },
    starter: `type Params<S extends string> = any;`,
    tests: `type cases = [
  Expect<Equal<Params<"/users/:id/posts/:postId">, "id" | "postId">>,
  Expect<Equal<Params<"/about">, never>>,
  Expect<Equal<Params<"/:a">, "a">>,
];`,
    solution: `type Params<S extends string> =
  S extends \`\${string}:\${infer P}/\${infer Rest}\`
    ? P | Params<\`/\${Rest}\`>
    : S extends \`\${string}:\${infer P}\` ? P : never;`,
  },
  "branded-ids": {
    title: { en: "Branded IDs", uz: "Branded ID'lar" },
    prompt: {
      en: "Define Brand<T, B> so a UserId cannot be passed where an OrderId is expected, while both remain strings at runtime.",
      uz: "Brand<T, B> ni shunday aniqlangki, UserId'ni OrderId kutilgan joyga berib boʻlmasin, lekin ikkalasi ham runtime'da string boʻlib qolsin.",
    },
    starter: `type Brand<T, B extends string> = T;
type UserId = Brand<string, "UserId">;
type OrderId = Brand<string, "OrderId">;`,
    tests: `declare function loadOrder(id: OrderId): void;
declare const u: UserId;
declare const o: OrderId;
loadOrder(o);
// @ts-expect-error — a UserId is not an OrderId
loadOrder(u);
const s: string = u; // still usable as a string`,
    solution: `declare const brand: unique symbol;
type Brand<T, B extends string> = T & { readonly [brand]: B };
type UserId = Brand<string, "UserId">;
type OrderId = Brand<string, "OrderId">;`,
  },
} satisfies Record<string, Puzzle>;

export type PuzzleId = keyof typeof puzzles;

export const isPuzzleId = (id: string): id is PuzzleId => id in puzzles;
