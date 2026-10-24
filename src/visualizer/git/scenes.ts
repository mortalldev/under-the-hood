import { L, type Scene, type Text } from "../principles/scene";

/**
 * One commit-graph animation per git topic, keyed by the topic's slug in
 * content/git/registry.ts. Commits are small boxes, refs are pills; arrows
 * point from a commit to its parent and from a ref to the commit it names,
 * the way Git stores them.
 */

const commit = (label: Text, x: number, y: number, w = 46) => ({ label, x, y, w, h: 34 });
const ref = (label: Text, x: number, y: number, w = 76) => ({ label, x, y, w, h: 24, kind: "data" as const });
const file = (label: Text, x: number, y: number, w = 150) => ({ label, x, y, w, h: 30, kind: "data" as const });
const head = (label: Text, x: number, y: number) => ({ label, x, y, w: 150, h: 26, kind: "note" as const });

const objectModel: Scene = {
  title: L("Inside .git: blobs, trees, commits, refs", ".git ichida: blob, tree, commit, ref"),
  width: 680,
  height: 300,
  code: `$ git cat-file -p HEAD
tree 9b1c…
parent 7d01…
author Ada <ada@example.com> 1761300000 +0500

Add README

$ git cat-file -p 9b1c
100644 blob e69d…    README.md
040000 tree 4c0e…    src

$ cat .git/HEAD
ref: refs/heads/main
$ git rev-parse main
a71b…`,
  nodes: {
    head: ref("HEAD", 70, 30, 90),
    main: ref("main", 70, 90, 90),
    c1: { label: "commit 3f2a", sub: "tree · parent · author", x: 240, y: 90, w: 160, h: 44 },
    t1: { label: "tree 9b1c", sub: "README.md · src/", x: 425, y: 90, w: 140, h: 44 },
    b1: { label: "blob e69d", sub: "README.md v1", x: 600, y: 40, w: 140, h: 44 },
    t2: { label: "tree 4c0e", sub: "src/", x: 600, y: 140, w: 140, h: 44 },
    c2: { label: "commit a71b", sub: "parent 3f2a", x: 240, y: 240, w: 160, h: 44 },
    t3: { label: "tree d02f", sub: "README.md · src/", x: 425, y: 240, w: 140, h: 44 },
    b2: { label: "blob 5c1e", sub: "README.md v2", x: 600, y: 240, w: 140, h: 44 },
  },
  frames: [
    {
      add: ["b1"],
      tone: { b1: "active" },
      note: L(
        "Git is a content-addressable store. The contents of README.md become a blob, named by the hash of those bytes. Same content, same name — anywhere in history.",
        "Git content-addressable store. README.md tarkibi blob boʻladi va u shu baytlarning hash'i bilan nomlanadi. Bir xil tarkib — bir xil nom, tarixning istalgan joyida.",
      ),
    },
    {
      add: ["t1", "t2"],
      tone: { b1: "default" },
      edges: [
        ["t1", "b1"],
        ["t1", "t2"],
      ],
      line: 8,
      note: L("A tree is a directory listing: each name points to a blob (file) or another tree (folder) by hash.", "Tree — papka roʻyxati: har bir nom hash orqali blob'ga (fayl) yoki boshqa tree'ga (papka) ishora qiladi."),
    },
    {
      add: ["c1"],
      tone: { c1: "active" },
      addEdges: [["c1", "t1", { tone: "active" }]],
      line: 1,
      note: L(
        "A commit points to one root tree — a full snapshot, not a diff — plus its parent, author and message. Its hash covers all of that, so history can't change silently.",
        "Commit bitta root tree'ga — diff emas, toʻliq snapshot'ga — hamda parent, muallif va xabarga ishora qiladi. Uning hash'i bularning hammasini qamraydi, shuning uchun tarix jimgina oʻzgara olmaydi.",
      ),
    },
    {
      add: ["main", "head"],
      tone: { c1: "default" },
      addEdges: [
        ["main", "c1", { tone: "active" }],
        ["head", "main", { tone: "active" }],
      ],
      line: 13,
      note: L(
        "A branch is just a name for a commit hash (stored in .git/refs/heads/main or in packed-refs). HEAD says which branch you are on: \"ref: refs/heads/main\".",
        "Branch — commit hash'i uchun shunchaki nom (.git/refs/heads/main yoki packed-refs'da saqlanadi). HEAD qaysi branch'da turganingizni bildiradi: \"ref: refs/heads/main\".",
      ),
    },
    {
      add: ["b2", "t3", "c2"],
      tone: { t2: "match", b2: "active", t3: "active", c2: "active", main: "default", head: "default" },
      badge: { t2: L("reused", "qayta ishlatildi") },
      addEdges: [
        ["t3", "b2"],
        ["t3", "t2", { tone: "match" }],
        ["c2", "t3"],
        ["c2", "c1", { label: "parent" }],
      ],
      note: L(
        "Edit README.md and commit: one new blob, one new root tree, one new commit. The unchanged src/ tree is reused by hash, which is why snapshots are cheap.",
        "README.md'ni tahrirlab commit qiling: bitta yangi blob, bitta yangi root tree, bitta yangi commit. Oʻzgarmagan src/ tree hash orqali qayta ishlatiladi, shuning uchun snapshot'lar arzon.",
      ),
    },
    {
      at: { main: [70, 240] },
      tone: { b2: "default", t3: "default", c2: "default", main: "active" },
      dropEdges: ["main>c1"],
      addEdges: [["main", "c2", { tone: "active" }]],
      line: 15,
      note: L(
        "Committing moved main to the new hash; nothing else changed. That is why creating, switching and deleting branches is instant.",
        "Commit qilish main'ni yangi hash'ga siljitdi; boshqa hech narsa oʻzgarmadi. Shuning uchun branch yaratish, almashtirish va oʻchirish bir zumda boʻladi.",
      ),
    },
    {
      tone: { main: "default", t2: "default" },
      badge: { t2: "" },
      note: L(
        "On disk Git later packs objects and stores deltas between similar ones, but the model you reason with is always this: immutable snapshots linked by hashes, and movable names on top.",
        "Diskda Git keyinroq object'larni pack qiladi va oʻxshashlari orasidagi delta'larni saqlaydi, lekin siz fikrlaydigan model doim shu: hash'lar bilan bogʻlangan oʻzgarmas snapshot'lar va ularning ustidagi koʻchadigan nomlar.",
      ),
    },
  ],
};

const threeAreas: Scene = {
  title: L("Working tree → index → commit", "Working tree → index → commit"),
  width: 660,
  code: `git status -sb                     # what changed, what is staged
git diff                           # working tree vs index
git add -p app.ts                  # stage chosen hunks
git diff --staged                  # index vs HEAD: exactly what will be committed
git commit -m "feat: retry fetchUser on 503"
git restore --staged styles.css    # unstage, keep the edits
git restore styles.css             # discard the edits (cannot be undone)`,
  nodes: {
    hw: head(L("Working tree", "Working tree"), 110, 30),
    hi: head(L("Index (staging)", "Index (staging)"), 330, 30),
    hr: head(L("Repository (HEAD)", "Repository (HEAD)"), 550, 30),
    app: file("app.ts", 110, 110),
    css: file("styles.css", 110, 170),
    c: { label: "commit 5e1d", x: 550, y: 245, w: 140, h: 40 },
  },
  frames: [
    {
      add: ["hw", "hi", "hr", "app", "css"],
      tone: { app: "compare", css: "compare" },
      badge: { app: "M", css: "M" },
      line: 1,
      note: L("You edited two files. The changes exist only in the working tree; git status lists them as modified.", "Siz ikki faylni tahrirladingiz. Oʻzgarishlar faqat working tree'da; git status ularni modified deb koʻrsatadi."),
    },
    {
      at: { app: [330, 110] },
      tone: { app: "active" },
      line: 3,
      note: L(
        "git add copies the file's current content into the index — the draft of your next commit. git add -p lets you pick hunk by hunk, so one commit holds one change.",
        "git add faylning joriy tarkibini index'ga — keyingi commit'ingiz qoralamasiga — koʻchiradi. git add -p qismma-qism tanlash imkonini beradi, shunda bitta commit'da bitta oʻzgarish boʻladi.",
      ),
    },
    {
      line: 4,
      note: L(
        "git diff shows working tree vs index; git diff --staged shows index vs HEAD — exactly what the commit will contain. Read it before every commit.",
        "git diff working tree va index farqini koʻrsatadi; git diff --staged esa index va HEAD farqini — commit aynan nimani oʻz ichiga olishini. Har bir commit'dan oldin uni oʻqing.",
      ),
    },
    {
      add: ["c"],
      at: { app: [550, 110] },
      tone: { app: "match", c: "match" },
      badge: { app: "" },
      edges: [["c", "app", { tone: "match" }]],
      line: 5,
      note: L(
        "git commit turns the index into a new snapshot. app.ts is now in HEAD; styles.css is still only modified in the working tree.",
        "git commit index'ni yangi snapshot'ga aylantiradi. app.ts endi HEAD'da; styles.css esa hali ham faqat working tree'da oʻzgargan holatda.",
      ),
    },
    {
      at: { css: [330, 170] },
      tone: { css: "active", app: "default", c: "default" },
      edges: [],
      line: 3,
      note: L("Then you stage styles.css by mistake — it belongs in a separate commit.", "Keyin styles.css'ni xato bilan stage qilasiz — u alohida commit'ga tegishli."),
    },
    {
      at: { css: [110, 170] },
      tone: { css: "compare" },
      line: 6,
      note: L("git restore --staged styles.css takes it out of the index. Your edits stay in the working tree.", "git restore --staged styles.css uni index'dan chiqaradi. Tahrirlaringiz working tree'da qoladi."),
    },
    {
      tone: { css: "danger" },
      badge: { css: "" },
      line: 7,
      note: L(
        "git restore styles.css throws the edits away. They were never committed, so not even the reflog can bring them back.",
        "git restore styles.css tahrirlarni tashlab yuboradi. Ular hech qachon commit qilinmagan, shuning uchun ularni hatto reflog ham qaytara olmaydi.",
      ),
    },
    {
      remove: ["css"],
      note: L(
        "switch and restore (Git 2.23) split the old checkout command into two clear jobs: move between branches, and restore files.",
        "switch va restore (Git 2.23) eski checkout buyrugʻini ikkita aniq vazifaga ajratdi: branch'lar orasida yurish va fayllarni tiklash.",
      ),
    },
  ],
};

const branches: Scene = {
  title: L("A branch is a pointer; HEAD says which one", "Branch — pointer; HEAD qaysi biri ekanini aytadi"),
  height: 260,
  code: `git switch -c feature        # create and switch (was: git checkout -b)
git commit -m "D"
git commit -m "E"
git switch main              # back to main (git switch - = previous branch)
git switch --detach B        # look at an old commit
git switch -c fix-from-b     # keep work done on a detached HEAD
git branch -d feature        # delete once merged (-D forces)`,
  nodes: {
    A: commit("A", 80, 130),
    B: commit("B", 170, 130),
    C: commit("C", 260, 130),
    D: commit("D", 350, 60),
    E: commit("E", 440, 60),
    main: ref("main", 260, 195),
    feature: ref("feature", 260, 88, 80),
    head: ref("HEAD", 260, 232, 60),
  },
  frames: [
    {
      add: ["A", "B", "C", "main", "head"],
      edges: [
        ["B", "A"],
        ["C", "B"],
        ["main", "C"],
        ["head", "main", { tone: "active" }],
      ],
      note: L("Three commits; main points to C, and HEAD points to main.", "Uchta commit; main C'ga, HEAD esa main'ga ishora qiladi."),
    },
    {
      add: ["feature"],
      at: { head: [170, 88] },
      tone: { feature: "active" },
      dropEdges: ["head>main"],
      addEdges: [
        ["feature", "C", { tone: "active" }],
        ["head", "feature", { tone: "active" }],
      ],
      line: 1,
      note: L("git switch -c feature creates a new pointer at the same commit and moves HEAD to it. No files are copied.", "git switch -c feature xuddi shu commit'da yangi pointer yaratadi va HEAD'ni unga oʻtkazadi. Hech qanday fayl nusxalanmaydi."),
    },
    {
      add: ["D"],
      at: { feature: [350, 18], head: [430, 18] },
      dropEdges: ["feature>C"],
      addEdges: [
        ["D", "C"],
        ["feature", "D", { tone: "active" }],
      ],
      line: 2,
      note: L("Commit on feature: new commit D, and the branch HEAD is on moves forward. main stays at C.", "feature'da commit: yangi D commit va HEAD turgan branch oldinga siljiydi. main C'da qoladi."),
    },
    {
      add: ["E"],
      at: { feature: [440, 18], head: [530, 18] },
      dropEdges: ["feature>D"],
      addEdges: [
        ["E", "D"],
        ["feature", "E", { tone: "active" }],
      ],
      line: 3,
      note: L("Another commit, E. Two branches now point to different commits.", "Yana bir commit, E. Endi ikki branch turli commit'larga ishora qiladi."),
    },
    {
      at: { head: [260, 232] },
      tone: { feature: "default", main: "active" },
      dropEdges: ["head>feature"],
      edges: [
        ["B", "A"],
        ["C", "B"],
        ["D", "C"],
        ["E", "D"],
        ["main", "C", { tone: "active" }],
        ["feature", "E"],
        ["head", "main", { tone: "active" }],
      ],
      line: 4,
      note: L(
        "git switch main: HEAD points to main again and the working tree becomes C's snapshot. D and E are safe on feature.",
        "git switch main: HEAD yana main'ga ishora qiladi va working tree C snapshot'iga aylanadi. D va E feature'da xavfsiz.",
      ),
    },
    {
      at: { head: [170, 192] },
      tone: { main: "default", head: "compare", B: "compare" },
      dropEdges: ["head>main"],
      addEdges: [["head", "B", { tone: "compare" }]],
      line: 5,
      note: L(
        "git switch --detach B: HEAD points straight at a commit, not at a branch. Commits made here are lost once you leave — unless you create a branch with git switch -c.",
        "git switch --detach B: HEAD branch'ga emas, toʻgʻridan-toʻgʻri commit'ga ishora qiladi. Bu yerda qilingan commit'lar chiqib ketishingiz bilan yoʻqoladi — agar git switch -c bilan branch yaratmasangiz.",
      ),
    },
  ],
};

const merge: Scene = {
  title: L("Merge: fast-forward or a merge commit", "Merge: fast-forward yoki merge commit"),
  width: 660,
  height: 260,
  code: `git switch main
git merge feature             # fast-forward when main is an ancestor
git merge --no-ff feature     # always record a merge commit
git merge feature             # diverged: three-way merge → commit M
# on conflict:
git status                    # lists conflicted files
git add src/app.ts            # after fixing the <<<<<<< markers
git commit                    # or: git merge --abort`,
  nodes: {
    A: commit("A", 70, 150),
    B: commit("B", 150, 150),
    C: commit("C", 230, 150),
    D: commit("D", 310, 70),
    E: commit("E", 390, 70),
    F: commit("F", 310, 150),
    M: commit("M", 470, 150),
    main: ref("main", 230, 205),
    feature: ref("feature", 480, 70, 80),
  },
  frames: [
    {
      add: ["A", "B", "C", "D", "E", "main", "feature"],
      edges: [
        ["B", "A"],
        ["C", "B"],
        ["D", "C"],
        ["E", "D"],
        ["main", "C"],
        ["feature", "E"],
      ],
      note: L("feature branched from C and has two commits. main has not moved.", "feature C'dan ajralgan va ikkita commit'ga ega. main joyidan siljimagan."),
    },
    {
      at: { main: [390, 112] },
      tone: { main: "match" },
      dropEdges: ["main>C"],
      addEdges: [["main", "E", { tone: "match" }]],
      line: 2,
      note: L(
        "git merge feature on main: main is an ancestor of feature, so Git just moves the pointer forward. A fast-forward creates no new commit.",
        "main'da git merge feature: main feature'ning ajdodi, shuning uchun Git pointer'ni shunchaki oldinga suradi. Fast-forward yangi commit yaratmaydi.",
      ),
    },
    {
      add: ["F"],
      at: { main: [310, 205] },
      tone: { main: "default", F: "active" },
      dropEdges: ["main>E"],
      addEdges: [
        ["F", "C"],
        ["main", "F"],
      ],
      line: 4,
      note: L(
        "Now the usual case: before you merge, a teammate already put F on main. Neither branch contains the other — they have diverged.",
        "Endi odatiy holat: siz merge qilishdan oldin jamoadosh main'ga F'ni qoʻyib boʻlgan. Hech bir branch ikkinchisini oʻz ichiga olmaydi — ular ajralib ketgan.",
      ),
    },
    {
      add: ["M"],
      at: { main: [470, 205] },
      tone: { F: "default", M: "active", C: "compare" },
      badge: { M: L("2 parents", "2 parent") },
      dropEdges: ["main>F"],
      addEdges: [
        ["M", "F", { tone: "active" }],
        ["M", "E", { tone: "active" }],
        ["main", "M"],
      ],
      note: L(
        "Three-way merge: Git compares the merge base C with F and with E, combines both sets of changes and records M with two parents.",
        "Three-way merge: Git merge base C'ni F bilan va E bilan solishtiradi, ikkala oʻzgarishlar toʻplamini birlashtiradi va ikki parent'li M'ni yozadi.",
      ),
    },
    {
      tone: { M: "danger", C: "default" },
      badge: { M: "conflict" },
      line: 6,
      note: L(
        "If F and E changed the same lines, Git stops and marks the file with <<<<<<< ======= >>>>>>>. Edit it, git add it, then git commit — or git merge --abort to go back.",
        "Agar F va E bir xil qatorlarni oʻzgartirgan boʻlsa, Git toʻxtaydi va faylni <<<<<<< ======= >>>>>>> bilan belgilaydi. Uni tahrirlang, git add qiling, keyin git commit — yoki orqaga qaytish uchun git merge --abort.",
      ),
    },
    {
      tone: { M: "match" },
      badge: { M: "" },
      line: 3,
      note: L(
        "--no-ff always records a merge commit, keeping a feature's commits grouped. GitHub's \"Squash and merge\" instead creates one new commit on main with no link to the branch's commits.",
        "--no-ff har doim merge commit yozadi va feature commit'larini guruhlangan holda saqlaydi. GitHub'ning \"Squash and merge\"i esa main'da branch commit'lariga bogʻlanmagan bitta yangi commit yaratadi.",
      ),
    },
  ],
};

const rebase: Scene = {
  title: L("Rebase: replay your commits on top", "Rebase: commit'laringizni ustiga qayta qoʻyish"),
  width: 680,
  height: 260,
  code: `git switch feature
git rebase main                            # replay D and E on top of F
# on conflict: fix the file, then
git add <file> && git rebase --continue    # or: git rebase --abort
git push --force-with-lease                # only if feature was already pushed
git config --global pull.rebase true       # git pull = fetch + rebase
git rebase --onto main old-base feature    # move only a range of commits`,
  nodes: {
    A: commit("A", 70, 150),
    B: commit("B", 150, 150),
    C: commit("C", 230, 150),
    F: commit("F", 310, 150),
    D: commit("D", 310, 70),
    E: commit("E", 390, 70),
    D2: commit("D′", 390, 230),
    E2: commit("E′", 470, 230),
    main: ref("main", 310, 192),
    feature: ref("feature", 480, 70, 80),
  },
  frames: [
    {
      add: ["A", "B", "C", "F", "D", "E", "main", "feature"],
      edges: [
        ["B", "A"],
        ["C", "B"],
        ["F", "C"],
        ["D", "C"],
        ["E", "D"],
        ["main", "F"],
        ["feature", "E"],
      ],
      note: L("feature started at C; main has since moved on to F.", "feature C'dan boshlangan; shundan beri main F'ga oʻtib ketgan."),
    },
    {
      tone: { D: "compare", E: "compare" },
      line: 2,
      note: L(
        "git rebase main finds the commits on feature that main doesn't have (D and E) and sets them aside as patches.",
        "git rebase main feature'da boʻlib, main'da boʻlmagan commit'larni (D va E) topadi va ularni patch sifatida chetga qoʻyadi.",
      ),
    },
    {
      add: ["D2"],
      tone: { D2: "active" },
      addEdges: [["D2", "F", { tone: "active" }]],
      note: L("It replays D on top of F, creating D′: the same change, but a new commit with a new parent and therefore a new hash.", "U D'ni F ustida qayta qoʻllaydi va D′ hosil boʻladi: xuddi shu oʻzgarish, lekin yangi parent'li, demak yangi hash'li yangi commit."),
    },
    {
      add: ["E2"],
      at: { feature: [560, 230] },
      tone: { E2: "active", D: "muted", E: "muted" },
      dropEdges: ["feature>E"],
      addEdges: [
        ["E2", "D2", { tone: "active" }],
        ["feature", "E2", { tone: "active" }],
      ],
      note: L(
        "Then E′ on top of D′, and feature moves to E′. The old D and E are no longer on any branch; the reflog still remembers them for a while.",
        "Keyin D′ ustiga E′ va feature E′'ga oʻtadi. Eski D va E endi hech qaysi branch'da emas; reflog ularni hali bir muddat eslab turadi.",
      ),
    },
    {
      remove: ["D", "E"],
      tone: { D2: "default", E2: "default" },
      line: 5,
      note: L(
        "Merging feature into main is now a fast-forward, and history is a straight line. The golden rule: don't rebase commits other people have built on. If feature was pushed, update it with --force-with-lease.",
        "Endi feature'ni main'ga merge qilish fast-forward va tarix toʻgʻri chiziq. Oltin qoida: boshqalar ustiga ish qurgan commit'larni rebase qilmang. Agar feature push qilingan boʻlsa, uni --force-with-lease bilan yangilang.",
      ),
    },
    {
      line: 6,
      note: L(
        "pull.rebase = true makes every git pull rebase your local commits instead of creating \"Merge branch 'main'\" commits.",
        "pull.rebase = true har bir git pull'ni \"Merge branch 'main'\" commit'larini yaratish oʻrniga lokal commit'laringizni rebase qiladigan qiladi.",
      ),
    },
  ],
};

const todo = (label: string, sub: string, x: number) => ({ label, sub, x, y: 70, w: 140, h: 44 });

const interactiveRebase: Scene = {
  title: L("Interactive rebase with fixup commits", "Fixup commit'lar bilan interactive rebase"),
  width: 680,
  height: 260,
  code: `git commit --fixup=a1b2c3d          # message: "fixup! feat: login form"
git rebase -i --autosquash origin/main

# the todo list Git opens:
pick a1b2c3d feat: login form
fixup e4f5a6b fixup! feat: login form
pick 9c8d7e6 feat: logout
drop 1f2e3d4 wip

git push --force-with-lease`,
  nodes: {
    c1: todo("a1b2c3d", "feat: login form", 90),
    c2: todo("9c8d7e6", "feat: logout", 245),
    c3: todo("e4f5a6b", "fixup! feat: login…", 400),
    c4: todo("1f2e3d4", "wip", 555),
    n1: { label: "77ab01e", sub: "feat: login form", x: 245, y: 200, w: 150, h: 44 },
    n2: { label: "c3d4e5f", sub: "feat: logout", x: 430, y: 200, w: 150, h: 44 },
  },
  frames: [
    {
      add: ["c1", "c2", "c3", "c4"],
      edges: [
        ["c2", "c1"],
        ["c3", "c2"],
        ["c4", "c3"],
      ],
      line: 1,
      note: L(
        "Your branch before review: two real commits, a fix for the first one made with git commit --fixup, and a WIP commit.",
        "Review oldidan branch'ingiz: ikkita haqiqiy commit, birinchisi uchun git commit --fixup bilan qilingan tuzatish va WIP commit.",
      ),
    },
    {
      at: { c3: [245, 70], c2: [400, 70] },
      tone: { c3: "compare" },
      edges: [
        ["c3", "c1", { tone: "compare" }],
        ["c2", "c3"],
        ["c4", "c2"],
      ],
      line: 6,
      note: L(
        "git rebase -i --autosquash reads the \"fixup!\" prefix, moves that commit right after its target and marks it fixup in the todo list.",
        "git rebase -i --autosquash \"fixup!\" prefiksini oʻqiydi, shu commit'ni maqsadining darhol orqasiga koʻchiradi va todo roʻyxatida fixup deb belgilaydi.",
      ),
    },
    {
      tone: { c4: "danger" },
      badge: { c4: "drop" },
      line: 8,
      note: L("In the todo list you change the WIP commit's \"pick\" to \"drop\". You could also reword or reorder lines here.", "Todo roʻyxatida WIP commit'ning \"pick\"ini \"drop\"ga oʻzgartirasiz. Bu yerda qatorlarni reword yoki qayta tartiblash ham mumkin."),
    },
    {
      add: ["n1", "n2"],
      tone: { c1: "muted", c2: "muted", c3: "muted", c4: "muted", n1: "match", n2: "match" },
      badge: { c4: "" },
      edges: [["n2", "n1", { tone: "match" }]],
      line: 5,
      note: L(
        "Git replays the plan: a1b2c3d plus its fixup become one commit, logout is re-applied, wip disappears. Every commit gets a new hash.",
        "Git rejani bajaradi: a1b2c3d va uning fixup'i bitta commit boʻladi, logout qayta qoʻllanadi, wip yoʻqoladi. Har bir commit yangi hash oladi.",
      ),
    },
    {
      remove: ["c1", "c2", "c3", "c4"],
      tone: { n1: "default", n2: "default" },
      line: 10,
      note: L(
        "Reviewers now read two clean commits. With rebase.updateRefs, branches stacked on top of this one move too. Push the rewritten branch with --force-with-lease.",
        "Endi reviewer'lar ikkita toza commit'ni oʻqiydi. rebase.updateRefs bilan bu branch ustida qurilgan branch'lar ham birga koʻchadi. Qayta yozilgan branch'ni --force-with-lease bilan push qiling.",
      ),
    },
  ],
};

const cherryPick: Scene = {
  title: L("Cherry-pick a hotfix onto a release branch", "Hotfix'ni release branch'ga cherry-pick qilish"),
  height: 240,
  code: `git switch release/1.2
git cherry-pick -x 7f3c9e1      # copy commit H
git cherry-pick A..B            # copy a range (A itself excluded)
git cherry-pick --continue      # after fixing a conflict
git cherry-pick --abort`,
  nodes: {
    A: commit("A", 70, 70),
    B: commit("B", 150, 70),
    C: commit("C", 230, 70),
    H: commit("H", 310, 70),
    D: commit("D", 390, 70),
    main: ref("main", 480, 70, 70),
    R1: commit("R1", 230, 170),
    H2: commit("H′", 310, 170),
    release: ref("release/1.2", 330, 170, 110),
  },
  frames: [
    {
      add: ["A", "B", "C", "H", "D", "main", "R1", "release"],
      tone: { H: "danger" },
      badge: { H: "fix" },
      edges: [
        ["B", "A"],
        ["C", "B"],
        ["H", "C"],
        ["D", "H"],
        ["main", "D"],
        ["R1", "B"],
        ["release", "R1"],
      ],
      note: L(
        "A security fix H lands on main. release/1.2 branched off at B and must get H — but not C or D, which are new features.",
        "Xavfsizlik tuzatishi H main'ga tushadi. release/1.2 B'dan ajralgan va H'ni olishi kerak — lekin yangi imkoniyatlar boʻlgan C yoki D'ni emas.",
      ),
    },
    {
      add: ["H2"],
      at: { release: [420, 170] },
      tone: { H2: "match" },
      dropEdges: ["release>R1"],
      addEdges: [
        ["H2", "R1", { tone: "match" }],
        ["release", "H2", { tone: "match" }],
      ],
      line: 2,
      note: L(
        "git cherry-pick H applies H's diff on top of release/1.2 as a new commit H′: same change, different parent, different hash.",
        "git cherry-pick H H diff'ini release/1.2 ustida yangi H′ commit sifatida qoʻllaydi: oʻsha oʻzgarish, boshqa parent, boshqa hash.",
      ),
    },
    {
      tone: { H: "default", H2: "default" },
      badge: { H: "" },
      note: L(
        "-x appends \"(cherry picked from commit 7f3c9e1)\" to the message so anyone can trace H′ back to H. If H relied on code from C, expect a conflict.",
        "-x xabarga \"(cherry picked from commit 7f3c9e1)\" qoʻshadi, shunda istalgan kishi H′'dan H'ga qaytib kuzata oladi. Agar H C'dagi kodga tayansa, conflict kuting.",
      ),
    },
    {
      line: 3,
      note: L(
        "Cherry-picks duplicate commits, so use them for targeted backports, not as a way to move features between long-lived branches.",
        "Cherry-pick commit'larni takrorlaydi, shuning uchun ularni maqsadli backport uchun ishlating, uzoq yashaydigan branch'lar orasida feature koʻchirish usuli sifatida emas.",
      ),
    },
  ],
};

const resetRevert: Scene = {
  title: L("reset moves the branch; revert adds a commit", "reset branch'ni siljitadi; revert commit qoʻshadi"),
  width: 660,
  height: 260,
  code: `git reset --soft HEAD~1    # undo the commit, keep changes staged
git reset HEAD~1           # --mixed (default): keep changes, unstaged
git reset --hard HEAD~1    # drop commit and changes (reflog still finds the commit)
git revert 9d2e4f1         # new commit that undoes it: safe after push
git revert -m 1 <merge>    # revert a merge, keeping parent 1`,
  nodes: {
    A: commit("A", 80, 110),
    B: commit("B", 170, 110),
    C: commit("C", 260, 110),
    D: commit("D", 350, 110),
    main: ref("main", 350, 165, 70),
    idx: file(L("index: D's changes", "index: D oʻzgarishlari"), 540, 60, 180),
    work: file(L("working tree: D's changes", "working tree: D oʻzgarishlari"), 540, 220, 200),
    Dr: commit("D⁻¹", 440, 110, 54),
  },
  frames: [
    {
      add: ["A", "B", "C", "D", "main"],
      tone: { D: "danger" },
      edges: [
        ["B", "A"],
        ["C", "B"],
        ["D", "C"],
        ["main", "D"],
      ],
      note: L("Commit D is wrong. There are two very different ways to undo it.", "D commit notoʻgʻri. Uni bekor qilishning ikki xil usuli bor."),
    },
    {
      add: ["idx"],
      at: { main: [260, 165] },
      tone: { D: "muted", idx: "active" },
      dropEdges: ["main>D"],
      addEdges: [["main", "C"]],
      line: 1,
      note: L("git reset --soft HEAD~1 moves main back to C. D's changes stay staged, ready to commit again.", "git reset --soft HEAD~1 main'ni C'ga qaytaradi. D oʻzgarishlari staged holda qoladi va qayta commit qilishga tayyor."),
    },
    {
      remove: ["idx"],
      add: ["work"],
      tone: { work: "compare" },
      line: 2,
      note: L("The default, --mixed, also moves main back but unstages the changes: they're left in the working tree.", "Standart --mixed ham main'ni orqaga suradi, lekin oʻzgarishlarni unstage qiladi: ular working tree'da qoladi."),
    },
    {
      remove: ["work"],
      badge: { D: "reflog" },
      line: 3,
      note: L(
        "--hard also discards the index and working tree. Commit D can still be found in the reflog; uncommitted edits cannot.",
        "--hard index va working tree'ni ham tashlab yuboradi. D commit'ni hali reflog'dan topish mumkin; commit qilinmagan tahrirlarni esa yoʻq.",
      ),
    },
    {
      at: { main: [350, 165] },
      tone: { D: "danger" },
      badge: { D: L("pushed", "push qilingan") },
      dropEdges: ["main>C"],
      addEdges: [["main", "D"]],
      note: L(
        "But if D was already pushed, teammates may have built on it. Moving main back would rewrite history they have.",
        "Lekin D allaqachon push qilingan boʻlsa, jamoadoshlar uning ustiga ish qurgan boʻlishi mumkin. main'ni orqaga surish ulardagi tarixni qayta yozadi.",
      ),
    },
    {
      add: ["Dr"],
      verdict: "good",
      at: { main: [440, 165] },
      tone: { D: "default", Dr: "match" },
      badge: { D: "" },
      dropEdges: ["main>D"],
      addEdges: [
        ["Dr", "D", { tone: "match" }],
        ["main", "Dr", { tone: "match" }],
      ],
      line: 4,
      note: L(
        "git revert D adds a new commit that applies D's diff in reverse. History only grows, so it's safe on shared branches. Reverting a merge needs -m to pick the parent to keep.",
        "git revert D D diff'ini teskari qoʻllaydigan yangi commit qoʻshadi. Tarix faqat oʻsadi, shuning uchun umumiy branch'larda xavfsiz. Merge'ni revert qilish uchun saqlanadigan parent'ni -m bilan tanlash kerak.",
      ),
    },
  ],
};

const entry = (label: string, y: number) => ({ label, x: 540, y, w: 220, h: 28, kind: "data" as const });

const reflog: Scene = {
  title: L("Reflog: the way back from a bad reset", "Reflog: yomon reset'dan qaytish yoʻli"),
  width: 680,
  height: 240,
  code: `git reset --hard B          # oops
git reflog                  # HEAD@{0}: reset: moving to B
                            # HEAD@{1}: commit: D
git reset --hard HEAD@{1}   # back to D
git branch rescue 9d2e4f1   # or keep the lost commit on a new branch
git reflog show feature     # each branch has its own reflog too`,
  nodes: {
    A: commit("A", 80, 90),
    B: commit("B", 170, 90),
    C: commit("C", 260, 90),
    D: commit("D", 350, 90),
    main: ref("main", 350, 145, 70),
    r0: entry("HEAD@{0} reset: moving to B", 50),
    r1: entry("HEAD@{1} commit: D", 100),
    r2: entry("HEAD@{2} commit: C", 150),
  },
  frames: [
    {
      add: ["A", "B", "C", "D", "main"],
      edges: [
        ["B", "A"],
        ["C", "B"],
        ["D", "C"],
        ["main", "D"],
      ],
      note: L("Before the mistake: main is at D.", "Xatodan oldin: main D'da."),
    },
    {
      at: { main: [170, 145] },
      tone: { C: "muted", D: "muted", main: "danger" },
      dropEdges: ["main>D"],
      addEdges: [["main", "B", { tone: "danger" }]],
      line: 1,
      note: L(
        "git reset --hard B by accident. C and D are not reachable from any branch, so git log no longer shows them. They still exist in the object store.",
        "Tasodifan git reset --hard B. C va D endi hech qaysi branch'dan yetib boʻlmaydi, shuning uchun git log ularni koʻrsatmaydi. Ular object store'da hali mavjud.",
      ),
    },
    {
      add: ["r0", "r1", "r2"],
      tone: { r1: "active" },
      addEdges: [
        ["r1", "D", { tone: "active", dashed: true }],
        ["r2", "C", { dashed: true }],
      ],
      line: 2,
      note: L("git reflog: every time HEAD moved — commit, reset, rebase, switch — Git wrote down where it was.", "git reflog: HEAD har safar siljiganda — commit, reset, rebase, switch — Git u qayerda boʻlganini yozib qoʻygan."),
    },
    {
      at: { main: [350, 145] },
      tone: { C: "default", D: "match", main: "match", r1: "match" },
      dropEdges: ["main>B"],
      addEdges: [["main", "D", { tone: "match" }]],
      line: 4,
      note: L("git reset --hard HEAD@{1} puts main back at D. Nothing was lost.", "git reset --hard HEAD@{1} main'ni yana D'ga qoʻyadi. Hech narsa yoʻqolmadi."),
    },
    {
      tone: { D: "default", main: "default", r1: "default" },
      edges: [
        ["B", "A"],
        ["C", "B"],
        ["D", "C"],
        ["main", "D"],
      ],
      note: L(
        "The reflog is local to your clone and expires: by default unreachable entries after 30 days, others after 90. It never contains changes you didn't commit.",
        "Reflog faqat sizning clone'ingizda va muddati tugaydi: standart holatda yetib boʻlmaydigan yozuvlar 30 kundan, qolganlari 90 kundan keyin. Unda siz commit qilmagan oʻzgarishlar hech qachon boʻlmaydi.",
      ),
    },
  ],
};

const stash: Scene = {
  title: L("Stash: park work, switch tasks, bring it back", "Stash: ishni chetga qoʻying, vazifani almashtiring, qaytaring"),
  height: 260,
  code: `git stash push -u -m "wip: filters"   # -u also stashes untracked files
git switch hotfix && git commit -am "fix: null check"
git switch -
git stash list                        # stash@{0}: On feature: wip: filters
git stash pop                         # apply + drop (kept if there is a conflict)
git stash apply stash@{1}             # apply without dropping`,
  nodes: {
    work: file(L("app.ts (modified)", "app.ts (oʻzgargan)"), 120, 80, 180),
    work2: file(L("filters.ts (untracked)", "filters.ts (untracked)"), 120, 140, 180),
    st: { label: "stash@{0}", sub: "wip: filters", x: 480, y: 110, w: 170 },
    hf: { label: "fix: null check", sub: "hotfix", x: 320, y: 220, w: 170 },
  },
  frames: [
    {
      add: ["work", "work2"],
      tone: { work: "compare", work2: "compare" },
      note: L("You are halfway through a feature when an urgent bug report arrives.", "Siz feature'ning yarmida turganingizda shoshilinch bug haqida xabar keladi."),
    },
    {
      remove: ["work", "work2"],
      add: ["st"],
      tone: { st: "active" },
      line: 1,
      note: L(
        "git stash push -u -m \"wip: filters\" saves tracked and untracked changes and leaves a clean working tree.",
        "git stash push -u -m \"wip: filters\" tracked va untracked oʻzgarishlarni saqlaydi va working tree'ni toza qoldiradi.",
      ),
    },
    {
      add: ["hf"],
      tone: { st: "default", hf: "match" },
      line: 2,
      note: L("Switch to the hotfix branch, fix, commit, push.", "Hotfix branch'ga oʻting, tuzating, commit qiling, push qiling."),
    },
    {
      remove: ["st"],
      add: ["work", "work2"],
      tone: { hf: "muted", work: "compare", work2: "compare" },
      line: 5,
      note: L(
        "Back on your branch, git stash pop re-applies the changes and drops the entry. If it conflicts, the entry is kept so nothing is lost.",
        "Branch'ingizga qaytgach, git stash pop oʻzgarishlarni qayta qoʻllaydi va yozuvni oʻchiradi. Conflict boʻlsa, hech narsa yoʻqolmasligi uchun yozuv saqlanadi.",
      ),
    },
    {
      remove: ["hf"],
      note: L(
        "Stashes are easy to forget. Name them, keep the list short, or use a WIP commit or a second worktree instead.",
        "Stash'lar oson unutiladi. Ularni nomlang, roʻyxatni qisqa saqlang yoki uning oʻrniga WIP commit yoki ikkinchi worktree ishlating.",
      ),
    },
  ],
};

const pointer = (label: Text, sub: string, y: number) => ({ label, sub, x: 580, y, w: 180 });

const remotes: Scene = {
  title: L("fetch, pull, push and force-with-lease", "fetch, pull, push va force-with-lease"),
  width: 700,
  height: 290,
  code: `git fetch origin                  # update origin/* only — always safe
git log main..origin/main         # what the server has that you don't
git pull --rebase                 # fetch + rebase your commits on top
git push                          # fast-forward the server's branch
git push -u origin feat/login     # first push: set the upstream
git config --global push.autoSetupRemote true   # … or never type -u again
git push --force-with-lease --force-if-includes # after rewriting a pushed branch`,
  nodes: {
    B: commit("B", 120, 150),
    X: commit("X", 240, 60),
    Y: commit("Y", 240, 240),
    Y2: commit("Y′", 360, 150),
    server: pointer(L("GitHub: main", "GitHub: main"), "→ B", 60),
    origin: { label: "origin/main", sub: "→ B", x: 580, y: 150, w: 180, kind: "data" },
    main: pointer(L("main (local)", "main (lokal)"), "→ B", 240),
  },
  frames: [
    {
      add: ["B", "server", "origin", "main"],
      note: L(
        "Three refs: the branch on the server, your remote-tracking ref origin/main (your last snapshot of the server), and your local main. All point to B.",
        "Uchta ref: serverdagi branch, remote-tracking ref origin/main (serverning sizdagi oxirgi surati) va lokal main. Hammasi B'ga ishora qiladi.",
      ),
    },
    {
      add: ["X"],
      tone: { server: "active" },
      relabel: { server: { sub: "→ X" } },
      edges: [["X", "B"]],
      note: L("A teammate pushes X. Your origin/main still says B: Git does not watch the network.", "Jamoadosh X'ni push qiladi. Sizdagi origin/main hali ham B deydi: Git tarmoqni kuzatib turmaydi."),
    },
    {
      add: ["Y"],
      tone: { server: "default", main: "active" },
      relabel: { main: { sub: "→ Y" } },
      addEdges: [["Y", "B"]],
      note: L("Meanwhile you commit Y locally.", "Bu orada siz lokal Y commit qilasiz."),
    },
    {
      tone: { main: "default", origin: "active" },
      relabel: { origin: { sub: "→ X" } },
      line: 1,
      note: L(
        "git fetch downloads X and moves origin/main. Your files and your main are untouched, so fetching is always safe.",
        "git fetch X'ni yuklab oladi va origin/main'ni siljitadi. Fayllaringiz va main'ingizga tegilmaydi, shuning uchun fetch har doim xavfsiz.",
      ),
    },
    {
      tone: { origin: "default", server: "danger" },
      badge: { server: "rejected" },
      line: 4,
      note: L(
        "git push is rejected as non-fast-forward: the server has X, which your branch doesn't contain. Git refuses to throw X away.",
        "git push non-fast-forward sifatida rad etiladi: serverda X bor, sizning branch'ingizda esa u yoʻq. Git X'ni tashlab yuborishni rad etadi.",
      ),
    },
    {
      add: ["Y2"],
      tone: { server: "default", Y: "muted", main: "active" },
      badge: { server: "" },
      relabel: { main: { sub: "→ Y′" } },
      addEdges: [["Y2", "X", { tone: "active" }]],
      line: 3,
      note: L("git pull --rebase = fetch, then replay Y on top of X as Y′.", "git pull --rebase = fetch, keyin Y'ni X ustiga Y′ sifatida qayta qoʻyish."),
    },
    {
      remove: ["Y"],
      tone: { server: "match", origin: "match", main: "match" },
      relabel: { server: { sub: "→ Y′" }, origin: { sub: "→ Y′" } },
      line: 4,
      note: L("Now git push is a fast-forward and succeeds. All three refs agree again.", "Endi git push fast-forward va muvaffaqiyatli. Uchala ref yana mos keladi."),
    },
    {
      tone: { server: "default", origin: "default", main: "default" },
      line: 7,
      note: L(
        "When you rewrote a pushed branch, never use plain --force. --force-with-lease refuses if the server moved since your last fetch; --force-if-includes also checks you actually integrated what you fetched.",
        "Push qilingan branch'ni qayta yozganingizda oddiy --force'ni hech qachon ishlatmang. --force-with-lease oxirgi fetch'ingizdan keyin server siljigan boʻlsa rad etadi; --force-if-includes esa fetch qilganingizni haqiqatan birlashtirganingizni ham tekshiradi.",
      ),
    },
  ],
};

const pr = (label: string, x: number) => ({ label, x, y: 60, w: 120, h: 30, kind: "data" as const });

const workflows: Scene = {
  title: L("Trunk-based: small branches, merged daily", "Trunk-based: kichik branch'lar, har kuni merge"),
  width: 700,
  height: 290,
  code: `git switch -c feat/login origin/main
# …small commits…
git push -u origin feat/login
gh pr create --fill                 # open the PR (GitHub CLI)
# review + required CI checks pass → "Squash and merge" or the merge queue
git switch main && git pull
git branch -D feat/login            # squash-merged, so -d can't see it as merged

# Conventional Commits
feat(auth): add passkey login
fix(cache): invalidate the user on logout`,
  nodes: {
    m1: commit("", 70, 150, 30),
    m2: commit("", 150, 150, 30),
    m3: commit("", 230, 150, 30),
    m4: commit("", 310, 150, 30),
    m5: commit("", 390, 150, 30),
    m6: commit("", 470, 150, 30),
    p1: pr("feat/login · 1d", 150),
    p2: pr("fix/cache · 4h", 310),
    p3: pr("feat/promo · 2d", 470),
    ci: { label: "review + CI", x: 610, y: 150, w: 130, kind: "data" },
    dev: { label: L("develop / release/*: weeks of drift", "develop / release/*: haftalab ajralish"), x: 330, y: 245, w: 330, h: 34, kind: "data" },
  },
  frames: [
    {
      add: ["m1", "m2", "m3"],
      edges: [
        ["m2", "m1"],
        ["m3", "m2"],
      ],
      note: L("Trunk-based development: one main branch that everyone integrates into at least once a day.", "Trunk-based development: hamma kamida kuniga bir marta birlashtiradigan bitta main branch."),
    },
    {
      add: ["p1"],
      tone: { p1: "active" },
      addEdges: [["p1", "m2", { tone: "active", flow: true, label: "squash" }]],
      line: 1,
      note: L("A short-lived branch becomes a pull request and is squash-merged within a day or two.", "Qisqa umrli branch pull request'ga aylanadi va bir-ikki kun ichida squash-merge qilinadi."),
    },
    {
      add: ["p2", "m4", "m5"],
      tone: { p1: "default", p2: "active" },
      addEdges: [
        ["m4", "m3"],
        ["m5", "m4"],
        ["p2", "m4", { tone: "active", flow: true }],
      ],
      line: 4,
      note: L("Small PRs are reviewed fast and rarely conflict, because nobody is far from main.", "Kichik PR'lar tez review qilinadi va kam conflict beradi, chunki hech kim main'dan uzoqlashmaydi."),
    },
    {
      add: ["ci"],
      tone: { p2: "default", ci: "match" },
      addEdges: [["ci", "m5", { tone: "match" }]],
      line: 5,
      note: L(
        "Branch protection: no direct pushes to main, required review and checks. A merge queue tests each PR combined with the ones ahead of it before it lands.",
        "Branch himoyasi: main'ga toʻgʻridan-toʻgʻri push yoʻq, review va tekshiruvlar majburiy. Merge queue har bir PR'ni tushishidan oldin oldindagilar bilan birgalikda test qiladi.",
      ),
    },
    {
      add: ["p3", "m6"],
      tone: { ci: "default", p3: "compare" },
      badge: { p3: "flag off" },
      dropEdges: ["ci>m5"],
      addEdges: [
        ["m6", "m5"],
        ["p3", "m6", { tone: "compare", flow: true }],
        ["ci", "m6"],
      ],
      note: L(
        "An unfinished feature still merges — hidden behind a feature flag. Releasing is deploying main; turning the feature on is a config change.",
        "Tugallanmagan feature ham merge qilinadi — feature flag ortida yashirilgan holda. Release — bu main'ni deploy qilish; feature'ni yoqish esa config oʻzgarishi.",
      ),
    },
    {
      add: ["dev"],
      verdict: "bad",
      tone: { p3: "default", dev: "danger" },
      badge: { p3: "" },
      note: L(
        "Git flow keeps long-lived develop, release and hotfix branches. Its author added a note in 2020 recommending simpler GitHub flow for software that is delivered continuously.",
        "Git flow uzoq yashaydigan develop, release va hotfix branch'larini saqlaydi. Uning muallifi 2020-yilda uzluksiz yetkaziladigan dasturlar uchun soddaroq GitHub flow'ni tavsiya qiluvchi izoh qoʻshgan.",
      ),
    },
    {
      remove: ["dev"],
      verdict: "good",
      line: 10,
      note: L(
        "DORA's research links trunk-based development with higher delivery performance. Conventional Commit messages (feat:, fix:) make changelogs and version bumps automatic.",
        "DORA tadqiqotlari trunk-based development'ni yuqoriroq yetkazish samaradorligi bilan bogʻlaydi. Conventional Commit xabarlari (feat:, fix:) changelog va versiya oshirishni avtomatik qiladi.",
      ),
    },
  ],
};

const bisectCommits = Object.fromEntries(Array.from({ length: 9 }, (_, i) => [`c${i + 1}`, commit(String(i + 1), 60 + i * 72, 110)]));

const bisect: Scene = {
  title: L("Bisect: binary search through history", "Bisect: tarix boʻylab binary search"),
  width: 700,
  height: 230,
  code: `git bisect start
git bisect bad                 # the current commit (9) is broken
git bisect good v1.4.0         # commit 1 was fine
# Git checks out 5 → run the test
git bisect good                # → checks out 7
git bisect bad                 # → checks out 6
git bisect good                # "7 is the first bad commit"
git bisect reset

git bisect run npm test        # automate: exit 0 = good, 125 = skip, other 1–127 = bad`,
  nodes: {
    ...bisectCommits,
    good: ref("good", 60, 175, 70),
    bad: ref("bad", 636, 175, 70),
  },
  frames: [
    {
      add: ["c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8", "c9", "good", "bad"],
      tone: { c1: "match", c9: "danger" },
      edges: [
        ...Array.from({ length: 8 }, (_, i) => [`c${i + 2}`, `c${i + 1}`] as [string, string]),
        ["good", "c1", { tone: "match" }],
        ["bad", "c9", { tone: "danger" }],
      ],
      line: 2,
      note: L("Release v1.4.0 (commit 1) worked; main (commit 9) is broken. Seven commits in between.", "v1.4.0 release (1-commit) ishlagan; main (9-commit) buzuq. Oraliqda yettita commit."),
    },
    {
      tone: { c5: "active" },
      badge: { c5: "test" },
      line: 4,
      note: L("git bisect checks out the middle commit, 5. You run the failing test.", "git bisect oʻrtadagi 5-commit'ni ochadi. Siz yiqilayotgan testni ishga tushirasiz."),
    },
    {
      tone: { c5: "match", c1: "muted", c2: "muted", c3: "muted", c4: "muted" },
      badge: { c5: "" },
      line: 5,
      note: L("It passes: git bisect good. The bug is somewhere in 6–9; half the range is gone.", "U oʻtadi: git bisect good. Bug 6–9 oraligʻida; oraliqning yarmi chiqib ketdi."),
    },
    {
      tone: { c5: "muted", c7: "danger", c8: "muted", c9: "muted" },
      badge: { c7: "test" },
      line: 6,
      note: L("Git checks out 7. It fails: git bisect bad. Now only 6–7 are left.", "Git 7'ni ochadi. U yiqiladi: git bisect bad. Endi faqat 6–7 qoldi."),
    },
    {
      tone: { c6: "match", c7: "danger" },
      badge: { c7: L("first bad", "birinchi buzuq") },
      line: 7,
      note: L("6 passes, so 7 is the first bad commit. Three tests for seven candidates: about log₂ n. A thousand commits take about ten.", "6 oʻtadi, demak 7 — birinchi buzuq commit. Yettita nomzod uchun uchta test: taxminan log₂ n. Ming commit uchun oʻnga yaqin."),
    },
    {
      tone: { c1: "default", c2: "default", c3: "default", c4: "default", c5: "default", c6: "default", c8: "default", c9: "default" },
      line: 10,
      note: L(
        "git bisect run npm test does all of this unattended. Exit code 125 means \"can't test this one\" (e.g. it doesn't build), and Git skips it.",
        "git bisect run npm test bularning hammasini odamsiz bajaradi. 125 exit code \"buni test qilib boʻlmaydi\" degani (masalan, build boʻlmaydi) va Git uni oʻtkazib yuboradi.",
      ),
    },
  ],
};

const tree = (label: string, sub: string, x: number, y: number) => ({ label, sub, x, y, w: 190, kind: "data" as const });

const worktree: Scene = {
  title: L("Worktrees: many folders, one repository", "Worktree: koʻp papka, bitta repository"),
  height: 280,
  code: `git worktree add ../app-hotfix -b hotfix/login origin/main
git worktree add ../app-review pr-812
git worktree list
# ~/app          a1b2c3d [feat/filters]
# ~/app-hotfix   7f3c9e1 [hotfix/login]
# ~/app-review   5d6e7f8 [pr-812]
git worktree remove ../app-hotfix
git worktree prune`,
  nodes: {
    repo: { label: L(".git (one repository)", ".git (bitta repository)"), sub: "objects · refs", x: 320, y: 140, w: 200 },
    wt1: tree("~/app", "feat/filters", 120, 50),
    wt2: tree("~/app-hotfix", "hotfix/login", 120, 230),
    wt3: tree("~/app-review", "pr-812", 520, 50),
  },
  frames: [
    {
      add: ["repo", "wt1"],
      edges: [["wt1", "repo"]],
      note: L("Normally a repository has one working directory with one branch checked out.", "Odatda repository'da bitta branch ochilgan bitta ishchi papka boʻladi."),
    },
    {
      tone: { wt1: "compare" },
      note: L("You are mid-feature with a dev server running when a hotfix is needed. Stashing would interrupt everything.", "Siz feature'ning oʻrtasidasiz va dev server ishlab turibdi, shu payt hotfix kerak boʻladi. Stash qilish hammasini toʻxtatib qoʻyadi."),
    },
    {
      add: ["wt2"],
      tone: { wt2: "active" },
      addEdges: [["wt2", "repo", { tone: "active" }]],
      line: 1,
      note: L(
        "git worktree add creates a second folder with its own branch, index and files, sharing the same object store. No second clone, no re-download.",
        "git worktree add oʻz branch'i, index'i va fayllari boʻlgan ikkinchi papka yaratadi, object store esa umumiy. Ikkinchi clone ham, qayta yuklab olish ham yoʻq.",
      ),
    },
    {
      add: ["wt3"],
      tone: { wt2: "default", wt3: "active" },
      addEdges: [["wt3", "repo", { tone: "active" }]],
      line: 2,
      note: L(
        "Review a teammate's PR in a third folder while your tests run in the first. A branch can be checked out in only one worktree at a time.",
        "Testlaringiz birinchi papkada ishlayotganda jamoadoshning PR'ini uchinchi papkada review qiling. Bitta branch bir vaqtda faqat bitta worktree'da ochilishi mumkin.",
      ),
    },
    {
      tone: { wt1: "default", wt3: "default" },
      line: 3,
      note: L(
        "This is also how coding agents run tasks in parallel without stepping on each other. Clean up with git worktree remove and prune.",
        "Coding agent'lar ham vazifalarni bir-biriga xalal bermasdan parallel bajarish uchun shundan foydalanadi. git worktree remove va prune bilan tozalang.",
      ),
    },
  ],
};

const largeRepos: Scene = {
  title: L("Partial clone and sparse checkout", "Partial clone va sparse checkout"),
  width: 680,
  height: 300,
  code: `git clone --filter=blob:none https://github.com/acme/monorepo   # partial clone
cd monorepo
git sparse-checkout set apps/web packages/ui                     # cone mode
git sparse-checkout add packages/config
git clone --depth 1 <url>          # shallow: for CI builds that throw the clone away
scalar clone <url>                 # partial clone + sparse + maintenance, preconfigured
git maintenance start              # background prefetch, commit-graph, repacking
git config core.fsmonitor true     # fast git status on huge trees`,
  nodes: {
    server: { label: L("server repository", "server repository"), sub: L("10 years · 40 GB", "10 yil · 40 GB"), x: 110, y: 150, w: 180 },
    local: { label: L("your clone", "sizning clone'ingiz"), sub: L("40 GB · 30 min", "40 GB · 30 daq"), x: 540, y: 150, w: 200 },
    history: { label: L("commits + trees", "commit + tree'lar"), x: 330, y: 70, w: 160, h: 32, kind: "data" },
    blobs: { label: L("blobs (file contents)", "blob'lar (fayl tarkibi)"), x: 330, y: 230, w: 180, h: 32, kind: "data" },
    d1: { label: "apps/web/", x: 470, y: 262, w: 120, h: 30, kind: "data" },
    d2: { label: "packages/ui/", x: 615, y: 262, w: 120, h: 30, kind: "data" },
  },
  frames: [
    {
      add: ["server", "local"],
      verdict: "bad",
      tone: { local: "danger" },
      edges: [["server", "local", { tone: "danger", flow: true, label: "git clone" }]],
      note: L("A plain clone downloads every version of every file ever committed.", "Oddiy clone hech qachon commit qilingan har bir faylning har bir versiyasini yuklab oladi."),
    },
    {
      add: ["history"],
      verdict: "good",
      tone: { local: "match", history: "active" },
      relabel: { local: { sub: L("history, no old files", "tarix, eski fayllarsiz") } },
      edges: [
        ["server", "history", { tone: "active", flow: true }],
        ["history", "local", { tone: "active", flow: true }],
      ],
      line: 1,
      note: L(
        "git clone --filter=blob:none is a partial clone: it downloads all commits and trees, but file contents only when they're needed.",
        "git clone --filter=blob:none — partial clone: u barcha commit va tree'larni yuklaydi, fayl tarkibini esa faqat kerak boʻlganda.",
      ),
    },
    {
      add: ["blobs"],
      tone: { history: "default", blobs: "compare" },
      addEdges: [
        ["server", "blobs", { tone: "compare", dashed: true }],
        ["blobs", "local", { tone: "compare", dashed: true, label: L("on demand", "kerak boʻlganda") }],
      ],
      note: L(
        "Checking out main fetches just today's files. Opening an old commit or running blame fetches the missing blobs then. git log stays fully local.",
        "main'ni ochish faqat bugungi fayllarni oladi. Eski commit'ni ochish yoki blame ishga tushirish yetishmayotgan blob'larni oʻshanda oladi. git log toʻliq lokal qoladi.",
      ),
    },
    {
      add: ["d1", "d2"],
      tone: { blobs: "default", d1: "match", d2: "match" },
      line: 3,
      note: L(
        "git sparse-checkout set apps/web packages/ui (cone mode) keeps only those directories in your working tree, so status, build and editor indexing stay fast.",
        "git sparse-checkout set apps/web packages/ui (cone rejimi) working tree'da faqat shu papkalarni qoldiradi, shunda status, build va editor indekslash tez qoladi.",
      ),
    },
    {
      tone: { d1: "default", d2: "default", local: "default" },
      line: 6,
      note: L(
        "scalar, built by Microsoft for its largest repositories and now shipped with Git, sets all of this up in one command, plus background maintenance. Use --depth 1 only for throwaway CI clones.",
        "Microsoft eng katta repository'lari uchun yaratgan va hozir Git bilan birga keladigan scalar bularning hammasini va fondagi maintenance'ni bitta buyruq bilan sozlaydi. --depth 1'ni faqat bir martalik CI clone'lari uchun ishlating.",
      ),
    },
  ],
};

const hook = (label: string, sub: string, x: number) => ({ label, sub, x, y: 120, w: 120 });

const hooks: Scene = {
  title: L("Hooks: checks that run before a commit lands", "Hook'lar: commit tushishidan oldin ishlaydigan tekshiruvlar"),
  width: 700,
  height: 230,
  code: `# lefthook.yml — install the hooks with: npx lefthook install
pre-commit:
  commands:
    lint:
      glob: "*.{ts,tsx}"
      run: npx eslint {staged_files}
commit-msg:
  commands:
    commitlint:
      run: npx commitlint --edit {1}
pre-push:
  commands:
    test:
      run: npm test

# config worth turning on
git config --global rerere.enabled true       # reuse recorded conflict resolutions
git config --global rebase.updateRefs true    # move stacked branches on rebase
git config --global diff.algorithm histogram  # more readable diffs`,
  nodes: {
    dev: { label: "git commit", x: 70, y: 120, w: 100, h: 36, kind: "data" },
    pre: hook("pre-commit", "eslint", 210),
    msg: hook("commit-msg", "commitlint", 360),
    c: { label: "commit", x: 500, y: 120, w: 100 },
    push: hook("pre-push", "npm test", 635),
  },
  frames: [
    {
      add: ["dev", "pre"],
      edges: [["dev", "pre", { flow: true }]],
      line: 2,
      note: L(
        "Hooks are scripts Git runs at fixed points. pre-commit runs before the commit is created — here, ESLint on the staged files only.",
        "Hook'lar — Git belgilangan nuqtalarda ishga tushiradigan skriptlar. pre-commit commit yaratilishidan oldin ishlaydi — bu yerda faqat staged fayllarda ESLint.",
      ),
    },
    {
      verdict: "bad",
      tone: { pre: "danger" },
      badge: { pre: "exit 1" },
      line: 6,
      note: L("ESLint finds an error, the hook exits non-zero, and Git aborts the commit.", "ESLint xato topadi, hook noldan farqli kod bilan chiqadi va Git commit'ni bekor qiladi."),
    },
    {
      add: ["msg"],
      verdict: null,
      tone: { pre: "match" },
      badge: { pre: "" },
      addEdges: [["pre", "msg", { flow: true }]],
      line: 10,
      note: L("After the fix, lint passes. commit-msg checks the message follows Conventional Commits (\"feat(auth): …\").", "Tuzatishdan keyin lint oʻtadi. commit-msg xabar Conventional Commits'ga (\"feat(auth): …\") mos kelishini tekshiradi."),
    },
    {
      add: ["c"],
      tone: { msg: "match", c: "match" },
      addEdges: [["msg", "c", { tone: "match", flow: true }]],
      note: L("Both hooks passed, so the commit is created.", "Ikkala hook ham oʻtdi, shuning uchun commit yaratiladi."),
    },
    {
      add: ["push"],
      tone: { push: "active" },
      addEdges: [["c", "push", { flow: true }]],
      line: 14,
      note: L(
        "pre-push runs slower checks before anything leaves your machine. Hooks are not cloned (for safety), so teams share them with Husky or Lefthook, which install them from a tracked file.",
        "pre-push hech narsa kompyuteringizdan chiqmasidan oldin sekinroq tekshiruvlarni bajaradi. Hook'lar (xavfsizlik uchun) clone qilinmaydi, shuning uchun jamoalar ularni kuzatiladigan fayldan oʻrnatadigan Husky yoki Lefthook bilan boʻlishadi.",
      ),
    },
    {
      tone: { pre: "default", msg: "default", c: "default", push: "default" },
      line: 17,
      note: L(
        "Anyone can skip hooks with --no-verify, so CI must run the same checks. A few config settings are worth enabling everywhere: rerere, rebase.updateRefs, push.autoSetupRemote.",
        "Har kim hook'larni --no-verify bilan chetlab oʻta oladi, shuning uchun CI xuddi shu tekshiruvlarni bajarishi kerak. Bir nechta sozlamani hamma joyda yoqishga arziydi: rerere, rebase.updateRefs, push.autoSetupRemote.",
      ),
    },
  ],
};

export const scenes: Record<string, Scene> = {
  "object-model": objectModel,
  "three-areas": threeAreas,
  branches,
  merge,
  rebase,
  "interactive-rebase": interactiveRebase,
  "cherry-pick": cherryPick,
  "reset-revert": resetRevert,
  reflog,
  stash,
  remotes,
  workflows,
  bisect,
  worktree,
  "large-repos": largeRepos,
  hooks,
};
