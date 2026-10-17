import type { Locale } from "@/i18n/routing";

/**
 * "In plain words" — one everyday analogy per lesson, shown above the TL;DR.
 * It gives a reader with no background the right picture before the precise
 * explanation; the lesson itself then makes the picture exact.
 */
type Plain = Record<Locale, string>;
const p = (en: string, uz: string): Plain => ({ en, uz });

export const plain: Record<string, Plain> = {
  "start/how-to-learn": p(
    "Learning here works like learning to cook from a good teacher: first you watch the dish being made step by step (the animation), then you are told why each step matters (the mechanism), and only then do you cook it yourself (the quiz and the code). Reading alone is like watching cooking videos — it feels like learning, but recall is what makes it stick.",
    "Bu yerda oʻrganish yaxshi oshpazdan pishirishni oʻrganishga oʻxshaydi: avval taom qadamma-qadam qanday tayyorlanishini koʻrasiz (animatsiya), keyin har bir qadam nega muhimligini eshitasiz (mexanizm), shundan keyingina oʻzingiz pishirasiz (quiz va kod). Faqat oʻqish — pishirish videolarini koʻrishga oʻxshaydi: oʻrganayotgandek tuyuladi, lekin bilimni mustahkamlaydigan narsa — eslab koʻrish.",
  ),
  "dsa/big-o": p(
    "Big-O answers one question: if the input becomes 10 times bigger, how much longer will the work take? Looking up a word in a dictionary by flipping to the middle (log n) barely gets slower; reading every page (n) gets 10× slower; comparing every page with every other page (n²) gets 100× slower.",
    "Big-O bitta savolga javob beradi: input 10 baravar kattalashsa, ish qancha uzoqroq davom etadi? Lugʻatdan soʻzni oʻrtasidan ochib qidirish (log n) deyarli sekinlashmaydi; har bir sahifani oʻqish (n) 10 baravar sekinlashadi; har bir sahifani boshqa har bir sahifa bilan solishtirish (n²) esa 100 baravar sekinlashadi.",
  ),
  "dsa/js-toolkit": p(
    "JavaScript is a great interview language, but it has a few traps — like a car whose fuel gauge reads in a different unit. sort() compares numbers as text, very large numbers silently lose digits, and there is no built-in priority queue. Know these few traps and keep a small toolbox ready, and JS becomes fast to work with.",
    "JavaScript — interview uchun ajoyib til, lekin unda bir nechta tuzoq bor — xuddi yoqilgʻi koʻrsatkichi boshqa birlikda koʻrsatadigan mashinadek. sort() sonlarni matn sifatida solishtiradi, juda katta sonlar raqamlarini jimgina yoʻqotadi, oʻrnatilgan priority queue esa yoʻq. Shu bir nechta tuzoqni biling va kichik asboblar toʻplamini tayyor tuting — JS bilan tez ishlaysiz.",
  ),
  "dsa/arrays-hashing": p(
    "A hash map is a cloakroom: you hand over your coat, get a numbered ticket, and later the attendant goes straight to the right hook instead of searching every coat. That is why lookups are instant on average — and why two coats landing on the same hook (a collision) is the thing that can slow it down.",
    "Hash map — bu garderob: paltongizni topshirasiz, raqamli talon olasiz va keyin xodim har bir paltoni qidirmasdan toʻgʻri ilgakka boradi. Shuning uchun qidirish oʻrtacha bir lahzada boʻladi — ikki palto bitta ilgakka tushib qolishi (collision) esa uni sekinlashtirishi mumkin boʻlgan narsa.",
  ),
  "dsa/prefix-sum": p(
    "Imagine a car's odometer. To know how far you drove between two towns, you don't re-measure the road — you subtract the two odometer readings. A prefix sum is that odometer for an array: compute running totals once, then any range sum is one subtraction.",
    "Mashinaning odometrini tasavvur qiling. Ikki shahar orasida qancha yurganingizni bilish uchun yoʻlni qayta oʻlchamaysiz — ikki koʻrsatkichni ayirasiz. Prefix sum — massiv uchun oʻsha odometr: jamgʻarma yigʻindilarni bir marta hisoblang, keyin istalgan oraliq yigʻindisi bitta ayirish bilan topiladi.",
  ),
  "dsa/two-pointers": p(
    "Two people search a sorted bookshelf for two books whose prices add up to a target: one starts at the cheap end, one at the expensive end. If the total is too high, the right person steps left; too low, the left person steps right. Each step rules out a whole group of pairs, so nobody ever walks back.",
    "Ikki kishi saralangan kitob javonidan narxlari yigʻindisi maqsadga teng ikki kitobni qidiradi: biri arzon uchidan, biri qimmat uchidan boshlaydi. Yigʻindi juda katta boʻlsa, oʻngdagi chapga bir qadam yuradi; juda kichik boʻlsa, chapdagi oʻngga yuradi. Har bir qadam juftliklarning butun guruhini chiqarib tashlaydi, shuning uchun hech kim orqaga qaytmaydi.",
  ),
  "dsa/sliding-window": p(
    "Think of a train window passing a row of houses: the view is a frame that moves forward — one house enters on the right, one leaves on the left. Instead of re-counting everything in the frame, you only update for what entered and what left. That turns 'check every sub-range' into one pass.",
    "Uylar qatori yonidan oʻtayotgan poyezd derazasini tasavvur qiling: koʻrinish oldinga siljiydigan ramka — oʻngdan bitta uy kiradi, chapdan bittasi chiqadi. Ramkadagi hamma narsani qayta sanash oʻrniga, faqat kirgan va chiqqanini hisobga olasiz. Bu “har bir oraliqni tekshirish”ni bitta oʻtishga aylantiradi.",
  ),
  "dsa/binary-search": p(
    "The number-guessing game: 'I'm thinking of a number from 1 to 100.' A good player always guesses the middle, and each 'higher' or 'lower' throws away half of what's left — so even a million options take about 20 guesses. Binary search is that game played on anything that is sorted or that answers yes/no in order.",
    "Son topish oʻyini: “1 dan 100 gacha son oʻyladim.” Yaxshi oʻyinchi doim oʻrtani aytadi va har bir “kattaroq” yoki “kichikroq” qolganning yarmini tashlab yuboradi — shuning uchun million variant ham taxminan 20 ta urinishda topiladi. Binary search — saralangan yoki tartib bilan ha/yoʻq javob beradigan istalgan narsa ustida oʻynaladigan shu oʻyin.",
  ),
  "dsa/monotonic-stack": p(
    "People stand in a line and each wants to know: who is the first taller person in front of me? Keep a stack of people still waiting for an answer. When someone tall arrives, everyone shorter in the stack gets their answer and leaves. The stack stays ordered, and each person enters and leaves once.",
    "Odamlar qatorda turibdi va har biri bilmoqchi: oldimdagi birinchi baland odam kim? Hali javob kutayotganlar stack'ini saqlang. Baland odam kelganda, stack'dagi undan pastlarning hammasi javobini olib chiqib ketadi. Stack tartibli qoladi va har bir odam bir marta kiradi, bir marta chiqadi.",
  ),
  "dsa/linked-list": p(
    "A treasure hunt: each clue tells you where the next clue is hidden. You can't jump to clue number 7 — you follow the chain. But adding a new clue in the middle is easy: change one note to point to it. Most linked-list tricks are about re-pointing notes without losing the rest of the chain.",
    "Xazina qidirish oʻyini: har bir ishora keyingi ishora qayerga yashirilganini aytadi. 7-ishoraga sakray olmaysiz — zanjir boʻylab yurasiz. Lekin oʻrtaga yangi ishora qoʻshish oson: bitta yozuvni unga koʻrsatadigan qilib oʻzgartirasiz. Linked list hiylalarining koʻpi — zanjirning qolgan qismini yoʻqotmasdan yozuvlarni qayta yoʻnaltirish haqida.",
  ),
  "dsa/trees": p(
    "A family tree or a company org chart: one person at the top, each with their own subordinates. DFS explores one branch all the way down before trying the next (like reading a whole department's files); BFS goes level by level (all managers, then all their reports). A BST is a tree kept in order so you can find a name like in a phone book.",
    "Shajara yoki kompaniya tuzilmasi: tepada bitta odam, har birining oʻz boʻysunuvchilari bor. DFS keyingisiga oʻtishdan oldin bitta shoxni oxirigacha oʻrganadi (bitta boʻlim hujjatlarini toʻliq oʻqigandek); BFS esa daraja-darajasi bilan yuradi (avval barcha rahbarlar, keyin ularning xodimlari). BST — tartibda saqlanadigan daraxt, unda ismni telefon kitobidagidek topasiz.",
  ),
  "dsa/heap": p(
    "A hospital emergency room: patients don't wait in arrival order — the most urgent one is always seen next. A heap keeps 'the most urgent item' at the top and can add or remove someone in a few steps, without keeping the whole list perfectly sorted. That's exactly what 'give me the top K' problems need.",
    "Shifoxonaning shoshilinch boʻlimi: bemorlar kelish tartibida kutmaydi — eng shoshilinchi doim navbatdagi. Heap “eng shoshilinch element”ni tepada ushlab turadi va butun roʻyxatni mukammal saralamasdan bir necha qadamda kimnidir qoʻsha yoki chiqara oladi. “Eng yaxshi K tasini ber” masalalariga aynan shu kerak.",
  ),
  "dsa/intervals": p(
    "A meeting-room calendar. If you sort meetings by start time, overlaps become obvious: a meeting overlaps the previous one only if it starts before that one ends. A sweep line is reading the calendar left to right and counting: +1 when a meeting starts, −1 when it ends — the peak is how many rooms you need.",
    "Majlislar xonasi kalendari. Majlislarni boshlanish vaqti boʻyicha saralasangiz, kesishuvlar ochiq koʻrinadi: majlis oldingisi bilan faqat u tugashidan oldin boshlansa kesishadi. Sweep line — kalendarni chapdan oʻngga oʻqib sanash: majlis boshlanganda +1, tugaganda −1 — choʻqqi sizga nechta xona kerakligini koʻrsatadi.",
  ),
  "dsa/graph-bfs-dfs": p(
    "A city map with crossroads and streets. BFS is like a ripple in water: it reaches everything one street away, then two streets away — so the first time it reaches a place, that is the shortest route. DFS is like walking a maze with one hand on the wall: go as deep as you can, then back up and try the next turn.",
    "Chorrahalar va koʻchalari bor shahar xaritasi. BFS suvdagi toʻlqinga oʻxshaydi: avval bir koʻcha narida joylashgan hamma joyga, keyin ikki koʻcha naridagilarga yetadi — shuning uchun biror joyga birinchi yetgani eng qisqa yoʻl boʻladi. DFS esa labirintda bir qoʻlni devorga qoʻyib yurishga oʻxshaydi: iloji boricha chuqur boring, keyin ortga qaytib keyingi burilishni sinang.",
  ),
  "dsa/topological-sort": p(
    "Getting dressed: socks before shoes, shirt before jacket. Topological sort finds an order that respects every 'this before that' rule. Start with things nothing depends on, do them, cross them off, and repeat. If at some point everything left still waits on something else, you've found a circular dependency.",
    "Kiyinish: paypoq oyoq kiyimdan oldin, koʻylak kurtkadan oldin. Topological sort har bir “buni undan oldin” qoidasiga rioya qiladigan tartibni topadi. Hech narsa bogʻliq boʻlmagan narsalardan boshlang, ularni bajaring, roʻyxatdan oʻchiring va takrorlang. Agar biror paytda qolgan hamma narsa yana nimanidir kutayotgan boʻlsa — aylanma bogʻliqlik topdingiz.",
  ),
  "dsa/union-find": p(
    "Friend groups at a party: each group has one 'leader' everyone points to. When two people from different groups become friends, one leader starts following the other — the groups merge. To ask 'are these two in the same group?', just compare their leaders. Shortcuts (path compression) make the answer almost instant.",
    "Ziyofatdagi doʻstlar guruhlari: har bir guruhda hamma koʻrsatadigan bitta “yetakchi” bor. Turli guruhdan ikki kishi doʻst boʻlsa, bir yetakchi ikkinchisiga ergashadi — guruhlar birlashadi. “Bu ikkisi bitta guruhdami?” deb soʻrash uchun shunchaki ularning yetakchilarini solishtiring. Yorliqlar (path compression) javobni deyarli bir lahzali qiladi.",
  ),
  "dsa/shortest-paths": p(
    "A navigation app choosing a route by travel time. Dijkstra always expands the closest place it hasn't finalized yet — like water filling a landscape from the source, reaching nearer places first. It needs travel times to be non-negative; if some roads 'give time back', Bellman-Ford checks every road repeatedly instead.",
    "Yoʻl vaqti boʻyicha marshrut tanlaydigan navigatsiya ilovasi. Dijkstra doim hali yakunlanmagan eng yaqin joyni kengaytiradi — manbadan landshaftni toʻldirayotgan suvdek, avval yaqinroq joylarga yetadi. Unga yoʻl vaqtlari manfiy boʻlmasligi kerak; agar ba'zi yoʻllar “vaqtni qaytarsa”, Bellman-Ford har bir yoʻlni qayta-qayta tekshiradi.",
  ),
  "dsa/mst": p(
    "Connecting villages with power lines as cheaply as possible, so every village gets electricity. Kruskal's idea: always build the cheapest line left — unless it connects two villages that are already connected (that line would be wasted). Union-Find answers 'already connected?' instantly.",
    "Qishloqlarni elektr liniyalari bilan iloji boricha arzon ulash, shunda har bir qishloq elektr oladi. Kruskal gʻoyasi: doim qolgan eng arzon liniyani quring — agar u allaqachon ulangan ikki qishloqni bogʻlamasa (bunday liniya behuda boʻlardi). “Allaqachon ulanganmi?” savoliga Union-Find bir lahzada javob beradi.",
  ),
  "dsa/backtracking": p(
    "Solving a maze with chalk: go forward, mark your path, and at a dead end walk back to the last fork and try another way. Backtracking is 'choose, explore, un-choose'. Pruning is noticing early that a path can't work — like seeing a wall at the end of a corridor and not walking it at all.",
    "Labirintni boʻr bilan yechish: oldinga yuring, yoʻlingizni belgilang, boshi berk joyda oxirgi ayrilishga qaytib, boshqa yoʻlni sinang. Backtracking — “tanla, oʻrgan, tanlovni bekor qil”. Pruning — yoʻl ishlamasligini erta sezish: koridor oxirida devorni koʻrib, umuman unga kirmaslik.",
  ),
  "dsa/dynamic-programming": p(
    "Climbing stairs and noting on each step how many ways there are to reach it. Step 10's answer is built from steps 9 and 8, which you already wrote down — so you never recompute. Dynamic programming is exactly that: break the problem into smaller versions of itself, solve each once, and reuse the notes.",
    "Zinapoyaga chiqib, har bir pogʻonada unga necha xil yoʻl bilan yetish mumkinligini yozib borish. 10-pogʻonaning javobi siz allaqachon yozgan 9 va 8-pogʻonalardan quriladi — shuning uchun hech qachon qayta hisoblamaysiz. Dynamic programming aynan shu: masalani oʻzining kichikroq versiyalariga boʻling, har birini bir marta yeching va yozuvlardan qayta foydalaning.",
  ),
  "dsa/trie": p(
    "Your phone's autocomplete. Words that start the same share the same path of letters, like a tree of letters: c → a → t and c → a → r share 'ca'. Walking down the letters you've typed instantly gives you every word that continues them.",
    "Telefoningizdagi autocomplete. Bir xil boshlanadigan soʻzlar harflarning bitta yoʻlini boʻlishadi, xuddi harflar daraxtidek: c → a → t va c → a → r “ca”ni boʻlishadi. Yozgan harflaringiz boʻylab pastga tushish ularni davom ettiradigan barcha soʻzlarni darhol beradi.",
  ),
  "dsa/segment-fenwick": p(
    "A sales report with totals per day, per week and per month. To answer 'sales from the 3rd to the 20th' you add a few precomputed weekly totals instead of 18 daily numbers — and when one day's number changes, only the few totals that include it need updating. Segment and Fenwick trees are those layered totals.",
    "Kunlik, haftalik va oylik jamlar bor savdo hisoboti. “3-dan 20-gacha savdo” savoliga 18 ta kunlik son oʻrniga oldindan hisoblangan bir nechta haftalik jamni qoʻshib javob berasiz — bir kunning soni oʻzgarganda esa faqat uni oʻz ichiga olgan bir nechta jamni yangilash kerak. Segment va Fenwick tree — aynan shu qatlamli jamlar.",
  ),
  "dsa/bit-manipulation": p(
    "A row of light switches: each bit is one switch, on or off. A number is just a way to write down which switches are on. AND, OR and XOR flip or check many switches at once — so 'is the 3rd switch on?' or 'turn off the lowest switch that is on' becomes a single instant operation.",
    "Bir qator yorugʻlik kalitlari: har bir bit — bitta kalit, yoqilgan yoki oʻchirilgan. Son — qaysi kalitlar yoqilganini yozib qoʻyish usuli xolos. AND, OR va XOR bir vaqtda koʻp kalitlarni almashtiradi yoki tekshiradi — shuning uchun “3-kalit yoqilganmi?” yoki “yoqilganlarning eng pastkisini oʻchir” bitta lahzali amalga aylanadi.",
  ),
  "dsa/greedy": p(
    "Giving change with as few coins as possible: always take the biggest coin that still fits. Greedy algorithms make the best-looking choice right now and never look back. It's fast and simple, but it only works when you can prove the local choice never hurts later — with some coin systems it fails.",
    "Iloji boricha kam tanga bilan qaytim berish: doim hali sigʻadigan eng katta tangani oling. Greedy algoritmlar hozir eng yaxshi koʻrinadigan tanlovni qiladi va hech qachon ortga qaramaydi. Bu tez va sodda, lekin faqat lokal tanlov keyinroq zarar bermasligini isbotlay olsangiz ishlaydi — ba'zi tanga tizimlarida u xato beradi.",
  ),
  "javascript/event-loop": p(
    "A restaurant with one chef. The chef cooks one dish at a time (the call stack). Orders that need waiting — the oven timer, a delivery — are handled by helpers, who leave finished items on two counters: an urgent counter (microtasks, e.g. promises) and a normal one (tasks, e.g. setTimeout). After each dish the chef clears the whole urgent counter first, then takes one normal item.",
    "Bitta oshpazi bor restoran. Oshpaz bir vaqtda bitta taom pishiradi (call stack). Kutishni talab qiladigan buyurtmalar — pech taymeri, yetkazib berish — yordamchilarga topshiriladi, ular tayyor narsalarni ikki peshtaxtaga qoʻyadi: shoshilinch (microtask'lar, masalan promise'lar) va oddiy (task'lar, masalan setTimeout). Har bir taomdan keyin oshpaz avval shoshilinch peshtaxtani butunlay boʻshatadi, keyin oddiydan bittasini oladi.",
  ),
  "javascript/execution-context-closures": p(
    "A function is like a person who leaves home with a backpack. Whatever variables were around when the function was created go into the backpack — and the function carries them everywhere, even after the place it came from is gone. That backpack is a closure, and it's why a counter function can remember its count.",
    "Funksiya uydan ryukzak bilan chiqqan odamga oʻxshaydi. Funksiya yaratilganda atrofda boʻlgan oʻzgaruvchilar ryukzakka tushadi — va funksiya ularni hamma joyga olib yuradi, hatto u kelgan joy yoʻqolgandan keyin ham. Oʻsha ryukzak — closure, va shuning uchun hisoblagich funksiya oʻz sanogʻini eslab qola oladi.",
  ),
  "javascript/this-prototypes": p(
    "`this` is like the word 'me' — its meaning depends on who is speaking, i.e. how the function is called, not where it was written. Prototypes are a chain of 'ask your parent': if an object doesn't have a property, JavaScript asks its prototype, then that one's prototype, and so on until someone answers.",
    "`this` “men” soʻziga oʻxshaydi — uning ma'nosi kim gapirayotganiga, ya'ni funksiya qanday chaqirilganiga bogʻliq, qayerda yozilganiga emas. Prototype'lar — “ota-onangdan soʻra” zanjiri: obyektda xususiyat boʻlmasa, JavaScript uning prototype'idan, keyin uning prototype'idan soʻraydi va hokazo, kimdir javob bermaguncha.",
  ),
  "javascript/memory-gc": p(
    "Memory is a storage room and the garbage collector is a cleaner who keeps anything still reachable from the front door — by following labels from box to box. Everything no label leads to gets thrown away. A memory leak is usually a forgotten label: a cache or event listener still pointing at things you no longer need.",
    "Xotira — ombor xonasi, garbage collector esa eshikdan hali yetib boriladigan har narsani — qutidan qutiga yorliqlar boʻylab yurib — saqlab qoladigan farrosh. Hech bir yorliq olib bormaydigan narsalarning hammasi tashlanadi. Memory leak odatda unutilgan yorliq: endi kerak boʻlmagan narsalarga hali ham koʻrsatayotgan cache yoki event listener.",
  ),
  "javascript/v8-internals": p(
    "V8 is like a warehouse that learns your habits. If objects always arrive with the same fields in the same order, it builds a fixed shelf layout (a hidden class) and remembers where each field is — so later lookups skip the search. Change shapes constantly and it has to fall back to slow, generic searching.",
    "V8 odatlaringizni oʻrganadigan omborga oʻxshaydi. Obyektlar doim bir xil field'lar bilan bir xil tartibda kelsa, u qat'iy javon tartibini (hidden class) quradi va har bir field qayerdaligini eslab qoladi — keyingi qidiruvlar qidirishni chetlab oʻtadi. Shakllarni doim oʻzgartirsangiz, u sekin, umumiy qidirishga qaytishga majbur boʻladi.",
  ),
  "javascript/iterators-generators": p(
    "A generator is a book you read with a bookmark: it gives you one page, stops, and continues exactly where it left off when you ask for the next one. That's why it can produce endless sequences, or huge files piece by piece, without loading everything at once.",
    "Generator — xatchoʻp bilan oʻqiladigan kitob: u sizga bitta sahifa beradi, toʻxtaydi va keyingisini soʻraganingizda aynan qolgan joyidan davom etadi. Shuning uchun u hammasini birdaniga yuklamasdan cheksiz ketma-ketliklar yoki ulkan fayllarni boʻlakma-boʻlak bera oladi.",
  ),
  "javascript/proxy-reflect-weak": p(
    "A Proxy is a receptionist standing in front of an object: every request — read this, change that — goes through them first, so they can log it, check it or answer differently. A WeakMap is a sticky note that falls off by itself when the thing it's stuck to is thrown away, so it never keeps garbage alive.",
    "Proxy — obyekt oldida turgan qabulxona xodimi: har bir soʻrov — buni oʻqi, uni oʻzgartir — avval undan oʻtadi, shuning uchun u uni yozib qoʻyishi, tekshirishi yoki boshqacha javob berishi mumkin. WeakMap — yopishtirilgan narsa tashlab yuborilganda oʻzi tushib ketadigan stiker, shuning uchun u hech qachon keraksiz narsani tirik ushlab turmaydi.",
  ),
  "javascript/modules-equality-coercion": p(
    "== is a translator that tries to make two things comparable before comparing them — sometimes with surprising translations ('' == 0 is true). === refuses to translate: different types are simply different. Modules are separate rooms with doors: you see only what a file explicitly exports.",
    "== — ikki narsani solishtirishdan oldin ularni solishtiriladigan qilishga urinadigan tarjimon — ba'zan kutilmagan tarjimalar bilan ('' == 0 true). === tarjima qilishdan bosh tortadi: har xil turlar shunchaki har xil. Modullar — eshikli alohida xonalar: siz faqat fayl aniq export qilgan narsani koʻrasiz.",
  ),
  "javascript/async-patterns": p(
    "Sending 100 couriers at once can jam the road; sending them one by one takes all day. A concurrency limit is a dispatcher who keeps, say, 5 couriers on the road at a time. Cancellation is being able to call them back, a timeout is a deadline, and a retry with backoff is trying again — but waiting a bit longer each time.",
    "100 ta kuryerni birdaniga joʻnatish yoʻlni tiqib qoʻyishi mumkin; birma-bir joʻnatish esa butun kunni oladi. Concurrency limit — yoʻlda bir vaqtda, masalan, 5 ta kuryerni ushlab turadigan dispetcher. Bekor qilish — ularni ortga chaqira olish, timeout — muddat, backoff bilan retry esa qayta urinish — lekin har safar biroz koʻproq kutib.",
  ),
  "javascript/modern-javascript": p(
    "JavaScript gets a new edition every year, like a phone getting software updates. Recent updates mostly remove everyday friction: sorting without changing the original array, grouping items in one call, set operations like union, and cleaning up resources automatically. Newer isn't always available everywhere — check the runtime first.",
    "JavaScript har yili yangi nashr oladi, xuddi telefon dasturiy yangilanishlar olgandek. Soʻnggi yangilanishlar asosan kundalik noqulayliklarni yoʻqotadi: asl massivni oʻzgartirmasdan saralash, elementlarni bitta chaqiruvda guruhlash, union kabi set amallari va resurslarni avtomatik tozalash. Yangisi hamma joyda ham mavjud emas — avval runtime'ni tekshiring.",
  ),
  "typescript/structural-typing-narrowing": p(
    "TypeScript checks shapes, not names — like a socket that accepts any plug with the right pins, whatever brand is printed on it. Narrowing is TypeScript following your if-checks: after `if (typeof x === \"string\")`, it knows that inside the block x is a string.",
    "TypeScript nomlarni emas, shakllarni tekshiradi — xuddi ustiga qaysi brend yozilganidan qat'i nazar, toʻgʻri pinli istalgan vilkani qabul qiladigan rozetkadek. Narrowing — TypeScript sizning if-tekshiruvlaringizga ergashishi: `if (typeof x === \"string\")` dan keyin u blok ichida x string ekanini biladi.",
  ),
  "typescript/generics-variance": p(
    "A generic is a labeled box: 'Box of T' says 'whatever you put in, you get the same kind back out'. Variance asks when a box of cats can be used where a box of animals is expected: reading from it is fine, but if someone can put a dog into it, it's not safe.",
    "Generic — yorliqli quti: “T qutisi” — “nima solsangiz, xuddi shu turdagisini qaytarib olasiz” degani. Variance mushuklar qutisini hayvonlar qutisi kutilgan joyda qachon ishlatish mumkinligini soʻraydi: undan oʻqish xavfsiz, lekin kimdir unga it sola olsa — xavfsiz emas.",
  ),
  "typescript/conditional-types": p(
    "A conditional type is an if-statement for types: 'if T looks like an array, give me its element type, otherwise T'. `infer` is a blank you leave in the pattern — like 'Array of ___' — and TypeScript fills it in for you when the shape matches.",
    "Conditional type — turlar uchun if: “agar T massivga oʻxshasa, uning element turini ber, aks holda T”. `infer` — pattern'da qoldirgan boʻsh joyingiz — “___ massivi” kabi — shakl mos kelganda TypeScript uni siz uchun toʻldiradi.",
  ),
  "typescript/mapped-template-types": p(
    "A mapped type is a photocopier for object types: 'take every field of this type and make it optional' or 'readonly'. Template literal types do the same with strings — from 'click' they can produce 'onClick' — so TypeScript can check names you build from other names.",
    "Mapped type — obyekt turlari uchun nusxa koʻchiruvchi apparat: “bu turning har bir field'ini olib, uni ixtiyoriy qil” yoki “readonly qil”. Template literal type'lar xuddi shuni string'lar bilan qiladi — 'click'dan 'onClick' hosil qila oladi — shunda TypeScript boshqa nomlardan qurgan nomlaringizni tekshira oladi.",
  ),
  "typescript/utility-types-from-scratch": p(
    "Partial, Pick, Omit and friends aren't magic — they're short recipes built from the same few ingredients: mapped types, conditional types and keyof. Rebuilding them yourself is like taking a clock apart: afterwards you can build new tools of your own.",
    "Partial, Pick, Omit va boshqalar sehr emas — ular bir xil bir nechta ingrediyentdan qurilgan qisqa retseptlar: mapped type'lar, conditional type'lar va keyof. Ularni oʻzingiz qayta yozish soatni qismlarga ajratishga oʻxshaydi: keyin oʻzingizning yangi vositalaringizni qura olasiz.",
  ),
  "typescript/branded-satisfies-const": p(
    "A UserId and an OrderId are both strings, so TypeScript lets you mix them up. A branded type adds an invisible stamp, so passing an OrderId where a UserId is expected becomes an error. `satisfies` checks a value against a type without forgetting its exact details — like a quality check that doesn't relabel the product.",
    "UserId ham, OrderId ham string, shuning uchun TypeScript ularni chalkashtirishga ruxsat beradi. Branded type koʻrinmas muhr qoʻshadi, shunda UserId kutilgan joyga OrderId berish xatoga aylanadi. `satisfies` qiymatni tur bilan tekshiradi, lekin uning aniq tafsilotlarini unutmaydi — mahsulotga yangi yorliq yopishtirmaydigan sifat nazoratidek.",
  ),
  "typescript/type-level-limits": p(
    "You can write whole programs in TypeScript's type system, the same way you can build a computer in Minecraft — impressive, slow, and hard for others to maintain. The skill is knowing when a clever type helps your team catch bugs, and when a plain type plus a runtime check is the kinder choice.",
    "TypeScript tur tizimida butun dasturlar yozish mumkin, xuddi Minecraft'da kompyuter qurish mumkin boʻlgandek — ta'sirli, sekin va boshqalar uchun qoʻllab-quvvatlash qiyin. Mahorat — qachon aqlli tur jamoangizga bug'larni ushlashda yordam berishini va qachon oddiy tur va runtime tekshiruv yaxshiroq tanlov ekanini bilishda.",
  ),
  "typescript/modern-typescript": p(
    "TypeScript 7 is the same checker rewritten in a faster language — like a new engine in the same car: same steering, about 10× quicker. TypeScript 6 is the bridge that turns on modern defaults first. And Node can now run .ts files directly by simply erasing the types — it doesn't check them, so you still run the checker separately.",
    "TypeScript 7 — tezroq tilda qayta yozilgan xuddi shu checker — xuddi oʻsha mashinadagi yangi dvigateldek: boshqaruv bir xil, taxminan 10 baravar tezroq. TypeScript 6 — avval zamonaviy standartlarni yoqadigan koʻprik. Node esa endi .ts fayllarni turlarni shunchaki oʻchirib, toʻgʻridan-toʻgʻri ishga tushira oladi — u ularni tekshirmaydi, shuning uchun checker'ni baribir alohida ishga tushirasiz.",
  ),
  "react/rendering-reconciliation": p(
    "React is an architect comparing two blueprints of your UI — the old one and the new one — and telling the builders only what changed: 'repaint this door, add one window'. Keys are name tags on list items, so React knows which item moved instead of rebuilding them all.",
    "React — UI'ingizning ikki chizmasini — eskisi va yangisini — solishtirib, quruvchilarga faqat nima oʻzgarganini aytadigan arxitektor: “bu eshikni boʻya, bitta deraza qoʻsh”. Key'lar — roʻyxat elementlaridagi ism yorliqlari, shunda React hammasini qayta qurish oʻrniga qaysi element koʻchganini biladi.",
  ),
  "react/fiber-architecture": p(
    "Fiber lets React work like a cook who can pause chopping vegetables to answer the doorbell and then continue exactly where they stopped. Rendering is split into small units of work, so urgent things — like your typing — don't have to wait for a big update to finish.",
    "Fiber React'ga sabzavot toʻgʻrashni toʻxtatib, eshik qoʻngʻirogʻiga javob berib, keyin aynan toʻxtagan joyidan davom eta oladigan oshpazdek ishlash imkonini beradi. Render kichik ish birliklariga boʻlinadi, shuning uchun shoshilinch narsalar — masalan, yozishingiz — katta yangilanish tugashini kutishi shart emas.",
  ),
  "react/hooks-internals": p(
    "React remembers each component's hooks by their position, like numbered lockers: the first useState gets locker 1, the second gets locker 2. That's why hooks can't be inside ifs or loops — if the order changes, a component opens the wrong locker. Effects are 'after the screen updates, also do this'.",
    "React har bir komponentning hook'larini ularning oʻrni boʻyicha eslab qoladi, xuddi raqamlangan shkafchalardek: birinchi useState 1-shkafchani, ikkinchisi 2-shkafchani oladi. Shuning uchun hook'lar if yoki loop ichida boʻla olmaydi — tartib oʻzgarsa, komponent notoʻgʻri shkafchani ochadi. Effect'lar — “ekran yangilangandan keyin buni ham qil”.",
  ),
  "react/memoization-compiler": p(
    "Memoization is a sticky note on the fridge: 'if the ingredients didn't change, the dish is the same — don't cook it again'. memo, useMemo and useCallback write those notes by hand. The React Compiler writes them for you automatically, so you mostly stop thinking about it.",
    "Memoization — muzlatkichdagi yopishqoq qogʻoz: “agar masalliqlar oʻzgarmagan boʻlsa, taom bir xil — uni qayta pishirma”. memo, useMemo va useCallback bu qogʻozlarni qoʻlda yozadi. React Compiler ularni siz uchun avtomatik yozadi, shuning uchun bu haqda deyarli oʻylamaysiz.",
  ),
  "react/concurrent-suspense": p(
    "Transitions are like marking a task 'not urgent': React keeps the screen responsive to your typing and finishes the slow update in the background. Suspense is a 'loading…' sign you put up while part of the page waits for data — the rest of the page stays visible and usable.",
    "Transition'lar vazifani “shoshilinch emas” deb belgilashga oʻxshaydi: React ekranni yozishingizga sezgir saqlaydi va sekin yangilanishni orqa fonda tugatadi. Suspense — sahifaning bir qismi ma'lumot kutayotganda qoʻyadigan “yuklanmoqda…” belgisi — sahifaning qolgan qismi koʻrinib turadi va ishlaydi.",
  ),
  "react/server-components": p(
    "Server Components are cooked in the restaurant kitchen and served ready — the browser only gets the finished plate (HTML), no recipe and no ingredients (JavaScript). Client Components are dishes you finish at the table, like a sizzling plate you can interact with — they need their JavaScript in the browser.",
    "Server Component'lar restoran oshxonasida pishirilib, tayyor holda beriladi — brauzer faqat tayyor likopchani (HTML) oladi, retsept ham, masalliq ham (JavaScript) yoʻq. Client Component'lar — stol ustida yakunlanadigan taomlar, masalan, siz bilan oʻzaro ta'sirlashadigan qaynoq likopcha — ularga brauzerda JavaScript kerak.",
  ),
  "react/state-performance": p(
    "State is like water in pipes: put it high up in the house and every room below gets wet on every change. Keep state close to where it's used, and only the rooms that need it re-render. The profiler is a flow meter showing exactly which rooms got water and how long it took.",
    "State quvurlardagi suvga oʻxshaydi: uni uyning yuqorisiga qoʻysangiz, har oʻzgarishda pastdagi har bir xona hoʻl boʻladi. State'ni u ishlatiladigan joyga yaqin saqlang — faqat unga muhtoj xonalar qayta render boʻladi. Profiler — qaysi xonalarga suv kelgani va bu qancha vaqt olganini aniq koʻrsatadigan oqim hisoblagichi.",
  ),
  "react/react-19-actions": p(
    "Before React 19 you handled 'saving…' states, errors and race conditions by hand for every form. Actions are a form that knows how to send itself: React tracks 'is it pending?', keeps the last result, and can show the expected result immediately (optimistic UI) — then quietly fixes it if the server says no.",
    "React 19'dan oldin har bir form uchun “saqlanmoqda…” holatlari, xatolar va race condition'larni qoʻlda hal qilardingiz. Action'lar — oʻzini qanday yuborishni biladigan form: React “kutilmoqdami?” ni kuzatadi, oxirgi natijani saqlaydi va kutilgan natijani darhol koʻrsata oladi (optimistic UI) — keyin server “yoʻq” desa, uni jimgina tuzatadi.",
  ),
  "nextjs/app-router-architecture": p(
    "The app folder is a building plan where folders are rooms and the URL is the path through them. A layout is the hallway shared by every room on a floor — it stays in place while you walk between rooms, so it doesn't reload. Loading and error files are signs that appear automatically in the right room.",
    "app papkasi — papkalar xonalar, URL esa ular orqali oʻtadigan yoʻl boʻlgan bino rejasi. Layout — qavatdagi barcha xonalar boʻlishadigan dahliz — xonalar orasida yurganingizda u joyida qoladi, shuning uchun qayta yuklanmaydi. Loading va error fayllari — toʻgʻri xonada avtomatik paydo boʻladigan belgilar.",
  ),
  "nextjs/rendering-strategies": p(
    "A bakery: static pages are bread baked in the morning and handed out instantly; dynamic pages are made to order; partial prerendering is a sandwich with pre-baked bread and a fresh filling added at the counter. The goal is to serve as much as possible from the morning batch.",
    "Novvoyxona: statik sahifalar — ertalab pishirilib, darhol beriladigan non; dinamik sahifalar — buyurtma boʻyicha tayyorlanadi; partial prerendering — oldindan pishirilgan non va peshtaxtada qoʻshiladigan yangi ichlikli sendvich. Maqsad — iloji boricha koʻproq narsani ertalabki partiyadan berish.",
  ),
  "nextjs/rsc-hydration": p(
    "The server sends a fully painted picture (HTML) so you see the page immediately, plus instructions (the RSC payload) describing it. Hydration is the browser plugging the interactive parts into that picture — like connecting the wires behind a light switch that's already mounted on the wall.",
    "Server sahifani darhol koʻrishingiz uchun toʻliq chizilgan rasmni (HTML) va uni tasvirlaydigan koʻrsatmalarni (RSC payload) yuboradi. Hydration — brauzerning oʻsha rasmga interaktiv qismlarni ulashi — devorga allaqachon oʻrnatilgan kalit orqasidagi simlarni ulagandek.",
  ),
  "nextjs/caching": p(
    "Caching in Next.js is a set of labeled food containers: 'use cache' puts a result in a container, cacheLife says how long it stays fresh, and a tag lets you throw away exactly the containers that went stale after someone changed the data — without emptying the whole fridge.",
    "Next.js'da caching — yorliqli oziq-ovqat idishlari toʻplami: 'use cache' natijani idishga soladi, cacheLife u qancha vaqt yangi qolishini aytadi, tag esa kimdir ma'lumotni oʻzgartirgandan keyin aynan eskirgan idishlarni — butun muzlatkichni boʻshatmasdan — tashlab yuborishga imkon beradi.",
  ),
  "nextjs/server-actions-proxy-runtime": p(
    "A Server Action is a button in your page that is wired directly to a function on the server — no API route to write by hand. The proxy is a doorman who looks at every request first and can redirect it. Treat every action like a public door: anyone can knock, so check who they are inside it.",
    "Server Action — sahifangizdagi serverdagi funksiyaga toʻgʻridan-toʻgʻri ulangan tugma — qoʻlda API route yozish shart emas. Proxy — har bir request'ga avval qaraydigan va uni boshqa joyga yoʻnaltira oladigan eshik qoʻriqchisi. Har bir action'ni ommaviy eshik deb biling: istalgan odam taqillatishi mumkin, shuning uchun uning ichida kim ekanini tekshiring.",
  ),
  "nextjs/production-problems": p(
    "Most production problems are a mismatch between two places: the server drew one thing and the browser expected another (hydration errors), a page grew heavy with code it rarely uses, or something was cached longer than it should be. The skill is finding which side is wrong before changing code.",
    "Production muammolarining koʻpi — ikki joy orasidagi nomuvofiqlik: server bir narsani chizdi, brauzer esa boshqasini kutdi (hydration xatolari), sahifa kamdan-kam ishlatiladigan kod bilan ogʻirlashdi yoki nimadir kerakligidan uzoqroq cache'landi. Mahorat — kodni oʻzgartirishdan oldin qaysi tomon notoʻgʻri ekanini topish.",
  ),
  "nodejs/event-loop-phases": p(
    "Node's event loop is a postman with a fixed route: first the timers box, then the mailbox of finished I/O, then 'setImmediate' items, then close events — and back again. Between every stop he also handles the urgent envelopes (process.nextTick and promises). Knowing the route explains which callback runs first.",
    "Node'ning event loop'i — qat'iy marshrutli pochtachi: avval timer'lar qutisi, keyin tugagan I/O pochta qutisi, keyin 'setImmediate' narsalari, keyin close event'lari — va yana boshiga. Har bir bekat orasida u shoshilinch konvertlarni ham (process.nextTick va promise'lar) hal qiladi. Marshrutni bilish qaysi callback birinchi ishlashini tushuntiradi.",
  ),
  "nodejs/libuv-thread-pool": p(
    "JavaScript in Node runs on one thread, but slow chores — reading files, hashing passwords, compressing — are handed to a small team of 4 helpers behind the scenes. If you give them 6 heavy jobs at once, 2 must wait. Network requests don't use this team: the operating system watches sockets directly.",
    "Node'da JavaScript bitta thread'da ishlaydi, lekin sekin yumushlar — fayllarni oʻqish, parollarni hash'lash, siqish — parda ortidagi 4 nafar yordamchidan iborat kichik jamoaga topshiriladi. Ularga birdaniga 6 ta ogʻir ish bersangiz, 2 tasi kutishi kerak. Tarmoq request'lari bu jamoadan foydalanmaydi: operatsion tizim socket'larni toʻgʻridan-toʻgʻri kuzatadi.",
  ),
  "nodejs/streams-backpressure": p(
    "Filling a bucket from a hose that's faster than the bucket's drain: without a valve, it overflows. A stream processes data in small chunks, and backpressure is the valve — when the receiver is full, the sender pauses until there's room. That's how Node copies a 10 GB file with a few megabytes of memory.",
    "Chelakni uning teshigidan tezroq oqadigan shlang bilan toʻldirish: kransiz u toʻlib toshadi. Stream ma'lumotni kichik boʻlaklarda qayta ishlaydi, backpressure esa oʻsha kran — qabul qiluvchi toʻlganda, yuboruvchi joy boʻlguncha toʻxtab turadi. Node 10 GB faylni bir necha megabayt xotira bilan shunday nusxalaydi.",
  ),
  "nodejs/workers-cluster-processes": p(
    "One Node process is one chef. Worker threads are extra chefs in the same kitchen for heavy chopping (CPU work). Cluster opens several identical kitchens behind one door to serve more customers. A child process hires an outside specialist — any program, like ffmpeg — in a completely separate kitchen.",
    "Bitta Node jarayoni — bitta oshpaz. Worker thread'lar — ogʻir toʻgʻrash ishlari (CPU ishi) uchun xuddi shu oshxonadagi qoʻshimcha oshpazlar. Cluster koʻproq mijozga xizmat qilish uchun bitta eshik ortida bir nechta bir xil oshxona ochadi. Child process esa butunlay alohida oshxonada tashqi mutaxassisni — istalgan dasturni, masalan ffmpeg'ni — yollaydi.",
  ),
  "nodejs/memory-profiling": p(
    "A memory leak is a room where boxes keep piling up because someone keeps a key to each of them. A heap snapshot is a photo of the room; taking two photos a few minutes apart shows which boxes keep multiplying — and the retainer chain shows who still holds the key.",
    "Memory leak — har biriga kimdir kalit ushlab turgani uchun qutilar uyulib boradigan xona. Heap snapshot — xonaning surati; bir necha daqiqa oraliqda ikki surat olish qaysi qutilar koʻpayib borayotganini koʻrsatadi — retainer zanjiri esa kalitni hali kim ushlab turganini koʻrsatadi.",
  ),
  "nodejs/errors-shutdown-security": p(
    "A graceful shutdown is closing a shop properly: stop letting new customers in, finish serving those inside, lock the till, then turn off the lights — instead of cutting the power mid-sale. Error handling decides which problems you can recover from, and security is making sure nobody walks in through the back door.",
    "Graceful shutdown — doʻkonni toʻgʻri yopish: yangi mijozlarni kiritishni toʻxtatish, ichkaridagilarga xizmat qilib boʻlish, kassani qulflash, keyin chiroqlarni oʻchirish — savdo oʻrtasida tokni uzish oʻrniga. Xatolarni boshqarish qaysi muammolardan tiklanish mumkinligini hal qiladi, xavfsizlik esa hech kim orqa eshikdan kirmasligini ta'minlash.",
  ),
  "nodejs/modern-node": p(
    "For years Node projects needed a pile of small packages for basics: running tests, reloading on changes, reading .env files, running TypeScript. Modern Node now ships these in the box, like a phone that finally includes a charger — fewer dependencies to install, update and trust.",
    "Yillar davomida Node loyihalariga oddiy narsalar uchun bir uyum kichik paketlar kerak edi: testlarni ishga tushirish, oʻzgarishlarda qayta yuklash, .env fayllarni oʻqish, TypeScript'ni ishga tushirish. Zamonaviy Node endi bularni qutida beradi, xuddi nihoyat zaryadlovchi bilan keladigan telefondek — oʻrnatish, yangilash va ishonish kerak boʻlgan bogʻliqliklar kamroq.",
  ),
  "system-design/interview-framework": p(
    "A system design interview is like an architect's first meeting with a client: first ask who will live in the house and how many people (requirements and scale), sketch the floor plan (high-level design), then zoom into the tricky rooms (deep dives) and explain what you'd trade off.",
    "System design interview — arxitektorning mijoz bilan birinchi uchrashuviga oʻxshaydi: avval uyda kim va necha kishi yashashini soʻrang (talablar va masshtab), qavat rejasini chizing (yuqori darajadagi dizayn), keyin murakkab xonalarga yaqinlashing (chuqur tahlil) va nimadan voz kechishingizni tushuntiring.",
  ),
  "system-design/load-balancing": p(
    "A load balancer is the host at a busy restaurant seating guests at different tables so no single waiter is overwhelmed. Health checks are the host noticing a waiter is sick and not sending them guests. Different strategies decide who gets the next guest: take turns, or pick the least busy waiter.",
    "Load balancer — gavjum restoranda mehmonlarni turli stollarga oʻtqazadigan, shunda hech bir ofitsiant haddan tashqari band boʻlmaydigan administrator. Health check — administrator ofitsiantning kasalligini payqab, unga mehmon yubormasligi. Turli strategiyalar keyingi mehmonni kim olishini hal qiladi: navbat bilan yoki eng kam band ofitsiantni tanlash.",
  ),
  "system-design/caching": p(
    "A cache is the notebook on your desk where you copy the phone numbers you call often, so you don't open the big directory every time. It's fast, but the notebook can be out of date — so the hard part isn't writing the copy, it's knowing when to cross it out.",
    "Cache — tez-tez qoʻngʻiroq qiladigan telefon raqamlarini koʻchirib yozadigan stolingizdagi daftar, shunda har safar katta ma'lumotnomani ochmaysiz. Bu tez, lekin daftar eskirgan boʻlishi mumkin — shuning uchun qiyin qism nusxani yozish emas, uni qachon oʻchirishni bilish.",
  ),
  "system-design/sharding-replication": p(
    "Replication is keeping photocopies of the same notebook in several offices, so if one burns down nothing is lost and many people can read at once. Sharding is splitting one huge notebook into volumes — A to H, I to P, Q to Z — because no single shelf can hold it all.",
    "Replication — bir xil daftarning nusxalarini bir nechta ofisda saqlash, shunda biri yonib ketsa ham hech narsa yoʻqolmaydi va koʻp odam bir vaqtda oʻqiy oladi. Sharding — bitta ulkan daftarni jildlarga boʻlish — A dan H gacha, I dan P gacha, Q dan Z gacha — chunki hech bir javon hammasini sigʻdira olmaydi.",
  ),
  "system-design/consistency": p(
    "Two bank branches share one account. If the phone line between them breaks, each branch must choose: refuse to serve until the line is back (consistent), or keep serving and reconcile later (available). Quorums are voting: if enough branches agree on every read and write, at least one always has the latest answer.",
    "Ikki bank filiali bitta hisobni boʻlishadi. Ular orasidagi telefon liniyasi uzilsa, har bir filial tanlashi kerak: liniya tiklanguncha xizmat koʻrsatishdan bosh tortish (consistent) yoki xizmatni davom ettirib, keyin muvofiqlashtirish (available). Quorum'lar — ovoz berish: har bir oʻqish va yozishda yetarlicha filial rozi boʻlsa, kamida bittasida doim eng soʻnggi javob boʻladi.",
  ),
  "system-design/message-queues": p(
    "A message queue is the order rail in a kitchen: waiters pin orders and walk away, cooks take them when they're ready. Nobody waits for anybody, a rush of orders just makes the rail longer, and if a cook drops an order, it can be pinned again — so cooks must be fine with seeing the same order twice.",
    "Message queue — oshxonadagi buyurtmalar ilgagi: ofitsiantlar buyurtmalarni ilib ketishadi, oshpazlar tayyor boʻlganda olishadi. Hech kim hech kimni kutmaydi, buyurtmalar oqimi faqat ilgakni uzaytiradi, oshpaz buyurtmani tushirib yuborsa, uni qayta ilish mumkin — shuning uchun oshpazlar bir xil buyurtmani ikki marta koʻrishga tayyor boʻlishi kerak.",
  ),
  "system-design/rate-limiting": p(
    "A token bucket is a jar of tickets that refills at a steady rate — say, one ticket per second, up to 10. Every request needs a ticket. A quick burst can use up the jar, but over time nobody can go faster than the refill rate. Without a ticket, the request gets '429: try again later'.",
    "Token bucket — barqaror tezlikda toʻldiriladigan chiptalar bankasi — masalan, soniyasiga bitta chipta, 10 tagacha. Har bir request'ga chipta kerak. Tez portlash bankani boʻshatishi mumkin, lekin vaqt oʻtishi bilan hech kim toʻldirish tezligidan tezroq yura olmaydi. Chiptasiz request “429: keyinroq urinib koʻring” javobini oladi.",
  ),
  "system-design/frontend-system-design": p(
    "Designing a frontend is like designing a shop's interior, not just its warehouse: what the customer sees first, how fast the shelves are restocked (data loading), what happens when the lights flicker (offline and errors), and whether everyone — including people using a keyboard or screen reader — can find what they came for.",
    "Frontend loyihalash faqat omborini emas, doʻkon interyerini loyihalashga oʻxshaydi: mijoz birinchi nimani koʻradi, javonlar qanchalik tez toʻldiriladi (ma'lumot yuklash), chiroqlar oʻchib-yonganda nima boʻladi (offline va xatolar) va hamma — klaviatura yoki screen reader ishlatadiganlar ham — kelgan narsasini topa oladimi.",
  ),
  "system-design/url-shortener": p(
    "A URL shortener is a cloakroom for links: you hand in a long address and get a short ticket like 'x7Ka9'. Later anyone with the ticket gets sent to the original. Almost all traffic is people redeeming tickets, so the whole design is about making that lookup instant and never handing out the same ticket twice.",
    "URL qisqartiruvchi — havolalar uchun garderob: uzun manzilni topshirib, 'x7Ka9' kabi qisqa talon olasiz. Keyin talonli har kim asl manzilga yoʻnaltiriladi. Deyarli butun trafik — talonlarni almashtirayotgan odamlar, shuning uchun butun dizayn shu qidiruvni bir lahzali qilish va bitta talonni hech qachon ikki marta bermaslik haqida.",
  ),
  "interview/coding-interview-process": p(
    "A coding interview is less like an exam and more like pair programming with a colleague watching: they score how you think. Say the problem back, try small examples, start with the obvious slow solution, then improve it — out loud. A clear process often beats a perfect answer delivered in silence.",
    "Coding interview imtihondan koʻra hamkasb kuzatib turgan pair programming'ga koʻproq oʻxshaydi: ular qanday fikrlashingizni baholaydi. Masalani qayta ayting, kichik misollarni sinang, aniq sekin yechimdan boshlang, keyin uni yaxshilang — ovoz chiqarib. Aniq jarayon koʻpincha jimgina berilgan mukammal javobdan yaxshiroq.",
  ),
  "interview/behavioral-star": p(
    "Behavioral questions are 'tell me a story where…'. STAR is a story recipe: the Situation in a sentence, your Task, what you Actually did (most of the time), and the Result with numbers. Prepare a handful of real stories ahead of time — one good story can answer many different questions.",
    "Behavioral savollar — “… boʻlgan bir voqeani aytib bering”. STAR — hikoya retsepti: bir jumlada Situation, sizning Task'ingiz, aynan nima qilganingiz (Action, vaqtning koʻp qismi) va sonlar bilan Result. Oldindan bir nechta real hikoya tayyorlang — bitta yaxshi hikoya koʻp turli savollarga javob bera oladi.",
  ),
  "interview/senior-signals": p(
    "A junior answers the question; a senior also explains what they're giving up and why, asks what happens when things fail, and puts rough numbers on it. It's the difference between 'I'd use a cache' and 'a cache cuts reads 10×, the cost is stale data for up to a minute — acceptable here because…'.",
    "Junior savolga javob beradi; senior esa nimadan voz kechayotganini va nega ekanini ham tushuntiradi, ishlar buzilganda nima boʻlishini soʻraydi va taxminiy sonlar keltiradi. Bu “cache ishlatardim” bilan “cache oʻqishlarni 10 baravar kamaytiradi, narxi — bir daqiqagacha eskirgan ma'lumot, bu yerda maqbul, chunki…” orasidagi farq.",
  ),
  "interview/mock-interview": p(
    "Rehearsal before the concert. Reading notes feels like practice, but only playing the piece out loud, with a clock running, shows where you stumble. Do a timed mock, compare with the model answer, write down three things to fix, and come back to the weak topics a few days later.",
    "Konsertdan oldingi repetitsiya. Notalarni oʻqish mashqdek tuyuladi, lekin faqat asarni soat ketayotganda ovoz chiqarib ijro etish qayerda qoqilishingizni koʻrsatadi. Vaqt bilan mock oʻtkazing, namunaviy javob bilan solishtiring, tuzatish uchun uchta narsani yozing va zaif mavzularga bir necha kundan keyin qayting.",
  ),
};
