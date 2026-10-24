import type { Localized } from "@/visualizer/core/types";
import { row, type Library, type LibraryCategory, type LibraryEntry } from "../library";

/**
 * Map of the git library: groups → topics. The body of each topic is
 * `git/<slug>/{en,uz}.mdx`, its animation a commit-graph scene in
 * `visualizer/git/scenes.ts`. Commands are never translated.
 */
export const categorySlugs = ["basics", "integrate", "undo", "collaborate", "power"] as const;
export type CategorySlug = (typeof categorySlugs)[number];

export const categories: LibraryCategory<CategorySlug>[] = [
  {
    slug: "basics",
    title: { en: "How Git works", uz: "Git qanday ishlaydi" },
    summary: {
      en: "The model that makes every other command obvious: objects and refs, the three areas, and branches as movable pointers.",
      uz: "Qolgan har bir buyruqni tushunarli qiladigan model: object va ref'lar, uchta hudud va koʻchadigan pointer sifatidagi branch'lar.",
    },
    hue: "sky",
  },
  {
    slug: "integrate",
    title: { en: "Combining work", uz: "Ishni birlashtirish" },
    summary: {
      en: "Merge, rebase, interactive rebase with fixup commits, and cherry-pick: four ways to bring commits together and when each is right.",
      uz: "Merge, rebase, fixup commit'li interactive rebase va cherry-pick: commit'larni birlashtirishning toʻrt usuli va har biri qachon toʻgʻri.",
    },
    hue: "violet",
  },
  {
    slug: "undo",
    title: { en: "Undo and recover", uz: "Bekor qilish va tiklash" },
    summary: {
      en: "Reset or revert, find any lost commit in the reflog, and park unfinished work with stash.",
      uz: "Reset yoki revert, yoʻqolgan har qanday commit'ni reflog'dan topish va tugallanmagan ishni stash bilan chetga qoʻyish.",
    },
    hue: "rose",
  },
  {
    slug: "collaborate",
    title: { en: "Working in a team", uz: "Jamoada ishlash" },
    summary: {
      en: "Remotes, fetch, pull and safe force-pushes, then the branching workflows and commit conventions teams actually use.",
      uz: "Remote'lar, fetch, pull va xavfsiz force-push, keyin jamoalar haqiqatda ishlatadigan branching workflow'lar va commit qoidalari.",
    },
    hue: "emerald",
  },
  {
    slug: "power",
    title: { en: "Power tools", uz: "Kuchli tool'lar" },
    summary: {
      en: "Find the commit that broke the build, work on two branches at once, tame huge repositories and automate checks with hooks.",
      uz: "Build'ni buzgan commit'ni toping, bir vaqtda ikki branch'da ishlang, ulkan repository'larni boshqaring va tekshiruvlarni hook'lar bilan avtomatlashtiring.",
    },
    hue: "amber",
  },
];

const p = row<CategorySlug>;

export const topics: LibraryEntry<CategorySlug>[] = [
  // How Git works
  p("basics", "object-model", "OBJ", "How Git stores data", "blobs, trees, commits, refs", "A commit is a snapshot, not a diff, and a branch is just a name for a hash.", "Commit diff emas, snapshot; branch esa hash uchun shunchaki nom.", ["three-areas", "branches", "reflog"]),
  p("basics", "three-areas", "ADD", "Working tree, index, commit", "status · add -p · restore · commit", "Every change moves through three areas; restore moves it back.", "Har bir oʻzgarish uchta hududdan oʻtadi; restore uni orqaga qaytaradi.", ["object-model", "stash", "reset-revert"]),
  p("basics", "branches", "SWITCH", "Branches and HEAD", "switch · branch", "A branch is a pointer that moves when you commit; HEAD says which one you are on.", "Branch commit qilganda siljiydigan pointer; HEAD qaysi birida turganingizni bildiradi.", ["object-model", "merge", "worktree"]),

  // Combining work
  p("integrate", "merge", "MERGE", "Merge", "fast-forward · three-way", "Join two lines of history; fast-forward when possible, a merge commit when not.", "Ikki tarix chizigʻini birlashtiring: iloji boʻlsa fast-forward, boʻlmasa merge commit.", ["rebase", "branches", "workflows"]),
  p("integrate", "rebase", "REBASE", "Rebase", "rebase · pull --rebase · --onto", "Replay your commits on top of another branch for a straight history.", "Toʻgʻri chiziqli tarix uchun commit'laringizni boshqa branch ustiga qayta qoʻying.", ["merge", "interactive-rebase", "remotes"]),
  p("integrate", "interactive-rebase", "FIXUP", "Interactive rebase", "rebase -i · commit --fixup · --autosquash", "Clean up a branch before review: squash, reword, reorder, drop.", "Review'dan oldin branch'ni tozalang: squash, reword, tartibni oʻzgartirish, drop.", ["rebase", "workflows", "reflog"]),
  p("integrate", "cherry-pick", "PICK", "Cherry-pick", undefined, "Copy one commit onto another branch, e.g. a hotfix onto a release.", "Bitta commit'ni boshqa branch'ga nusxalang, masalan hotfix'ni release'ga.", ["rebase", "reset-revert", "workflows"]),

  // Undo and recover
  p("undo", "reset-revert", "RESET", "Reset and revert", "reset --soft/--mixed/--hard · revert", "Move a branch back in your own history, or add an inverse commit to shared history.", "Oʻz tarixingizda branch'ni orqaga suring yoki umumiy tarixga teskari commit qoʻshing.", ["reflog", "three-areas", "cherry-pick"]),
  p("undo", "reflog", "REFLOG", "Reflog", undefined, "Git's local diary of where HEAD has been: the way back from almost any mistake.", "HEAD qayerlarda boʻlganining lokal kundaligi: deyarli har qanday xatodan qaytish yoʻli.", ["reset-revert", "interactive-rebase", "object-model"]),
  p("undo", "stash", "STASH", "Stash", "stash push · pop · apply", "Park uncommitted work, switch tasks, bring it back.", "Commit qilinmagan ishni chetga qoʻying, vazifani almashtiring, keyin qaytaring.", ["three-areas", "worktree", "branches"]),

  // Working in a team
  p("collaborate", "remotes", "PUSH", "Remotes, fetch, pull, push", "push --force-with-lease", "origin/main is your last snapshot of the server; fetch updates it, push moves the server.", "origin/main serverning sizdagi oxirgi surati; fetch uni yangilaydi, push serverni siljitadi.", ["rebase", "workflows", "merge"]),
  p("collaborate", "workflows", "TRUNK", "Branching workflows", "trunk-based · GitHub flow · Git flow", "Short-lived branches into one trunk, protected by reviews and CI.", "Bitta trunk'ga qoʻshiladigan qisqa umrli branch'lar, review va CI bilan himoyalangan.", ["remotes", "interactive-rebase", "hooks"]),

  // Power tools
  p("power", "bisect", "BISECT", "Bisect", undefined, "Binary-search history for the commit that introduced a bug.", "Bug'ni olib kirgan commit'ni tarix boʻyicha binary search bilan toping.", ["reflog", "hooks", "cherry-pick"]),
  p("power", "worktree", "WTREE", "Worktree", undefined, "Check out several branches at once in separate folders, sharing one repository.", "Bitta repository'ni boʻlishib, bir nechta branch'ni alohida papkalarda bir vaqtda oching.", ["stash", "branches", "large-repos"]),
  p("power", "large-repos", "SPARSE", "Large repositories", "partial clone · sparse-checkout · scalar", "Download and check out only what you need from a huge monorepo.", "Ulkan monorepo'dan faqat kerakli qismini yuklab oling va oching.", ["worktree", "object-model", "hooks"]),
  p("power", "hooks", "HOOKS", "Hooks and config", "pre-commit · commit-msg · rerere", "Automate checks before commits land, and the config settings worth turning on.", "Commit tushishidan oldin tekshiruvlarni avtomatlashtiring va yoqishga arziydigan sozlamalar.", ["workflows", "bisect", "large-repos"]),
];

export const gitLib: Library<CategorySlug> = { id: "git", base: "/git", categories, entries: topics };

/** One row of the "I want to…" cheat sheet on /git. */
export interface CheatRow {
  task: Localized;
  cmd: string;
  safety: "safe" | "unsafe" | "local";
  topic: string;
}

const c = (en: string, uz: string, cmd: string, safety: CheatRow["safety"], topic: string): CheatRow => ({ task: { en, uz }, cmd, safety, topic });

export const cheatSheet: { group: Localized; rows: CheatRow[] }[] = [
  {
    group: { en: "Start and save work", uz: "Ishni boshlash va saqlash" },
    rows: [
      c("See what changed and what is staged", "Nima oʻzgargani va nima stage qilinganini koʻrish", "git status -sb", "local", "three-areas"),
      c("Stage only some hunks of a file", "Faylning faqat ayrim qismlarini stage qilish", "git add -p", "local", "three-areas"),
      c("Unstage a file (keep the edits)", "Faylni unstage qilish (oʻzgarishlar qoladi)", "git restore --staged <file>", "local", "three-areas"),
      c("Throw away edits in a file", "Fayldagi oʻzgarishlarni tashlab yuborish", "git restore <file>", "local", "three-areas"),
      c("Fix the last commit (not pushed yet)", "Oxirgi commit'ni tuzatish (hali push qilinmagan)", "git commit --amend", "unsafe", "interactive-rebase"),
    ],
  },
  {
    group: { en: "Branches", uz: "Branch'lar" },
    rows: [
      c("Create a branch and switch to it", "Branch yaratib unga oʻtish", "git switch -c feat/login", "local", "branches"),
      c("Go back to the previous branch", "Oldingi branch'ga qaytish", "git switch -", "local", "branches"),
      c("Delete a merged branch", "Merge boʻlgan branch'ni oʻchirish", "git branch -d feat/login", "local", "branches"),
      c("Update my branch with main (straight history)", "Branch'imni main bilan yangilash (toʻgʻri tarix)", "git fetch && git rebase origin/main", "unsafe", "rebase"),
      c("Update my branch with main (keep history)", "Branch'imni main bilan yangilash (tarix saqlanadi)", "git fetch && git merge origin/main", "safe", "merge"),
    ],
  },
  {
    group: { en: "Clean up before review", uz: "Review oldidan tozalash" },
    rows: [
      c("Make a fix that folds into an earlier commit", "Oldingi commit'ga qoʻshiladigan tuzatish qilish", "git commit --fixup=<sha>", "local", "interactive-rebase"),
      c("Squash the fixups into place", "Fixup'larni joyiga squash qilish", "git rebase -i --autosquash origin/main", "unsafe", "interactive-rebase"),
      c("Push a rewritten branch safely", "Qayta yozilgan branch'ni xavfsiz push qilish", "git push --force-with-lease", "unsafe", "remotes"),
      c("Copy one commit to another branch", "Bitta commit'ni boshqa branch'ga nusxalash", "git cherry-pick -x <sha>", "safe", "cherry-pick"),
    ],
  },
  {
    group: { en: "Undo and recover", uz: "Bekor qilish va tiklash" },
    rows: [
      c("Undo a pushed commit", "Push qilingan commit'ni bekor qilish", "git revert <sha>", "safe", "reset-revert"),
      c("Undo the last local commit, keep changes staged", "Oxirgi lokal commit'ni bekor qilish, oʻzgarishlar staged qoladi", "git reset --soft HEAD~1", "unsafe", "reset-revert"),
      c("Find a commit I lost after reset or rebase", "Reset yoki rebase'dan keyin yoʻqolgan commit'ni topish", "git reflog", "local", "reflog"),
      c("Park my work and switch tasks", "Ishimni chetga qoʻyib vazifani almashtirish", "git stash push -u -m \"wip\"", "local", "stash"),
    ],
  },
  {
    group: { en: "Investigate", uz: "Tekshirish" },
    rows: [
      c("Compact graph of all branches", "Barcha branch'larning ixcham grafi", "git log --oneline --graph --all", "local", "branches"),
      c("Who last changed each line", "Har bir qatorni oxirgi kim oʻzgartirgan", "git blame -w -C <file>", "local", "bisect"),
      c("Find the commit that introduced a bug", "Bug'ni olib kirgan commit'ni topish", "git bisect start <bad> <good>", "local", "bisect"),
      c("Work on a hotfix without stashing", "Stash qilmasdan hotfix ustida ishlash", "git worktree add ../hotfix main", "local", "worktree"),
      c("Clone a huge repo quickly", "Ulkan repo'ni tez clone qilish", "git clone --filter=blob:none <url>", "local", "large-repos"),
    ],
  },
];
