"use server";

import ts from "typescript";
import { isPuzzleId, PUZZLE_PRELUDE, puzzles } from "@/content/puzzles";

export interface TypecheckResult {
  ok: boolean;
  errors: string[];
}

const MAX_CODE = 4000;
const FILE = "/puzzle.ts";
const options: ts.CompilerOptions = {
  strict: true,
  noEmit: true,
  target: ts.ScriptTarget.ES2022,
  lib: ["lib.es2022.d.ts"],
  types: [],
  noUnusedLocals: false,
  skipLibCheck: true,
};

// Parsed lib files are immutable; parsing them is the slow part, so cache them.
const libCache = new Map<string, ts.SourceFile | undefined>();

/** Type-checks learner code against a puzzle's assertions. The code is never executed. */
export async function typecheckPuzzle(puzzleId: string, code: string): Promise<TypecheckResult> {
  if (!isPuzzleId(puzzleId)) return { ok: false, errors: ["Unknown puzzle."] };
  if (typeof code !== "string" || code.length > MAX_CODE) {
    return { ok: false, errors: [`Code must be a string under ${MAX_CODE} characters.`] };
  }
  const puzzle = puzzles[puzzleId];
  const prefix = `${PUZZLE_PRELUDE}\n`;
  const source = `${prefix}${code}\n\n// ── tests ──\n${puzzle.tests}\n`;
  const userLines = prefix.split("\n").length - 1;

  const host = ts.createCompilerHost(options);
  const defaultGet = host.getSourceFile.bind(host);
  host.getSourceFile = (fileName, languageVersion, onError, shouldCreate) => {
    if (fileName === FILE) return ts.createSourceFile(FILE, source, languageVersion, true);
    if (!libCache.has(fileName)) libCache.set(fileName, defaultGet(fileName, languageVersion, onError, shouldCreate));
    return libCache.get(fileName);
  };
  host.fileExists = (f) => f === FILE || ts.sys.fileExists(f);
  host.readFile = (f) => (f === FILE ? source : ts.sys.readFile(f));
  host.writeFile = () => {};

  const program = ts.createProgram([FILE], options, host);
  const diagnostics = ts.getPreEmitDiagnostics(program).filter((d) => d.file?.fileName === FILE);

  const errors = diagnostics.slice(0, 8).map((d) => {
    const msg = ts.flattenDiagnosticMessageText(d.messageText, "\n");
    if (!d.file || d.start === undefined) return msg;
    const { line } = d.file.getLineAndCharacterOfPosition(d.start);
    const userLine = line - userLines + 1;
    const where = userLine >= 1 && userLine <= code.split("\n").length ? `line ${userLine}` : "tests";
    return `${where}: ${msg}`;
  });
  return { ok: errors.length === 0, errors };
}
