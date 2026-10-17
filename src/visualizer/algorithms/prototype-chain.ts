import { recorder } from "../core/recorder";
import { fail, ok, type ParseResult } from "../core/types";

export const prototypeCode = `class Animal {
  constructor(name) { this.name = name; }
  speak() { return \`\${this.name} makes a sound\`; }
}
class Dog extends Animal {
  bark() { return "woof"; }
}
const rex = new Dog("Rex");
rex.toString = () => "a good dog";   // own property shadows the inherited one
rex[key];   // [[Get]]: own → [[Prototype]] → … → null`;

export interface ProtoObject {
  id: string;
  label: string;
  props: string[];
}

export interface PrototypeState {
  chain: ProtoObject[];
  key: string;
  index: number | null;
  found: number | null;
  done: boolean;
}

const prototypeChain: ProtoObject[] = [
  { id: "rex", label: "rex", props: ["name", "toString"] },
  { id: "dog", label: "Dog.prototype", props: ["constructor", "bark"] },
  { id: "animal", label: "Animal.prototype", props: ["constructor", "speak"] },
  { id: "object", label: "Object.prototype", props: ["constructor", "toString", "hasOwnProperty", "valueOf", "isPrototypeOf"] },
];

export function parsePrototypeKey(raw: string): ParseResult<string> {
  const key = raw.trim();
  if (!/^[A-Za-z_$][\w$]{0,20}$/.test(key)) return fail("Enter a property name, e.g. speak.", "Property nomini kiriting, masalan speak.");
  return ok(key);
}

export function prototypeSteps(key: string) {
  const rec = recorder<PrototypeState>();
  const st: PrototypeState = { chain: prototypeChain, key, index: null, found: null, done: false };
  rec.push(st, 10, `Read rex.${key}. Property lookup ([[Get]]) checks the object itself first, then follows the hidden [[Prototype]] link (exposed as Object.getPrototypeOf / __proto__).`, `rex.${key} oʻqiladi. Property qidiruvi ([[Get]]) avval obyektning oʻzini tekshiradi, keyin yashirin [[Prototype]] havolasi boʻylab boradi (Object.getPrototypeOf / __proto__ orqali koʻrinadi).`);
  for (let i = 0; i < prototypeChain.length; i++) {
    st.index = i;
    const obj = prototypeChain[i];
    if (obj.props.includes(key)) {
      st.found = i;
      st.done = true;
      const shadow = i === 0 && prototypeChain.slice(1).some((o) => o.props.includes(key));
      rec.push(
        st,
        10,
        `Found "${key}" as an own property of ${obj.label}${i > 0 ? `, ${i} hop(s) up the chain` : ""}.${shadow ? " It shadows an inherited property with the same name further up." : ""}${i > 0 && key !== "constructor" ? " If it is a method, `this` is still rex: lookup location and `this` binding are independent." : ""}`,
        `"${key}" ${obj.label} ning own property'si sifatida topildi${i > 0 ? `, zanjir boʻylab ${i} qadam yuqorida` : ""}.${shadow ? " U yuqoridagi xuddi shu nomli meros property'ni yashiradi (shadow)." : ""}${i > 0 && key !== "constructor" ? " Agar bu metod boʻlsa, `this` baribir rex: qayerda topilgani va `this` binding bir-biriga bogʻliq emas." : ""}`,
      );
      return rec.steps;
    }
    rec.push(st, 10, `${obj.label} has no own "${key}" → follow [[Prototype]] to ${prototypeChain[i + 1]?.label ?? "null"}.`, `${obj.label} da own "${key}" yoʻq → [[Prototype]] boʻylab ${prototypeChain[i + 1]?.label ?? "null"} ga oʻtamiz.`);
  }
  st.index = null;
  st.done = true;
  rec.push(st, 10, `Reached null: rex.${key} is undefined. A miss walks the whole chain — one reason deep prototype chains and "in" checks on hot paths cost more.`, `null ga yetildi: rex.${key} undefined. Topilmagan holat butun zanjirni aylanib chiqadi — chuqur prototype zanjirlari va hot path'dagi "in" tekshiruvlari qimmatroq boʻlishining bir sababi.`);
  return rec.steps;
}
