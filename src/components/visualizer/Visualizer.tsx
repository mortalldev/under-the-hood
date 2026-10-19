"use client";

import { LayoutGroup, MotionConfig } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import type { Localized, ParseResult, Step } from "@/visualizer/core/types";

export interface Preset {
  label: string;
  input: string;
}

export interface VisualizerProps<I, S> {
  title: Localized;
  /** Code shown next to the stage; may depend on the input (e.g. user code). */
  code: string | ((input: I) => string);
  defaultInput: string;
  parse: (raw: string) => ParseResult<I>;
  /** Must be referentially stable (a module-level function). */
  generate: (input: I) => Step<S>[];
  render: (state: S, input: I) => ReactNode;
  inputLabel?: Localized;
  inputHint?: Localized;
  presets?: Preset[];
  /** Multi-line input (e.g. code). */
  multiline?: boolean;
  /** Hide the input row entirely for fixed demonstrations. */
  hideInput?: boolean;
  /** Stage, controls and code in one column at every width (wide diagrams). */
  stacked?: boolean;
  /** Extra UI under the stage, e.g. a prediction box. */
  footer?: (ctx: { input: I; steps: Step<S>[]; index: number; atEnd: boolean }) => ReactNode;
}

const BASE_DELAY_MS = 1100;
const SPEEDS = [0.5, 1, 1.5, 2, 3] as const;

function initialInput<I>(parse: (raw: string) => ParseResult<I>, raw: string): I {
  const result = parse(raw);
  if (!result.ok) throw new Error(`Invalid default visualizer input: ${result.error.en}`);
  return result.value;
}

export function Visualizer<I, S>({
  title,
  code,
  defaultInput,
  parse,
  generate,
  render,
  inputLabel,
  inputHint,
  presets,
  multiline = false,
  hideInput = false,
  stacked = false,
  footer,
}: VisualizerProps<I, S>) {
  const t = useTranslations("Visualizer");
  const locale = useLocale();
  const groupId = useId();
  const inputId = useId();

  const [raw, setRaw] = useState(defaultInput);
  const [input, setInput] = useState<I>(() => initialInput(parse, defaultInput));
  const [error, setError] = useState<Localized | null>(null);
  const steps = useMemo(() => generate(input), [generate, input]);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<number>(1);
  const pointerStart = useRef<number | null>(null);

  const last = steps.length - 1;
  const current = Math.min(index, last);
  const step = steps[current];
  const atEnd = current >= last;
  const isPlaying = playing && !atEnd;
  const codeText = typeof code === "function" ? code(input) : code;
  const codeLines = useMemo(() => codeText.split("\n"), [codeText]);

  useEffect(() => {
    if (!isPlaying) return;
    const id = window.setTimeout(
      () => setIndex((i) => Math.min(i + 1, last)),
      BASE_DELAY_MS / speed,
    );
    return () => window.clearTimeout(id);
  }, [isPlaying, current, last, speed]);

  const go = (next: number) => {
    setPlaying(false);
    setIndex(Math.max(0, Math.min(next, last)));
  };

  const togglePlay = () => {
    if (isPlaying) {
      setPlaying(false);
      return;
    }
    if (atEnd) setIndex(0);
    setPlaying(true);
  };

  const run = (value: string) => {
    const result = parse(value);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setError(null);
    setInput(result.value);
    setIndex(0);
    setPlaying(false);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest("input, textarea, select")) return;
    if (e.key === "ArrowRight") go(current + 1);
    else if (e.key === "ArrowLeft") go(current - 1);
    else if (e.key === "Home") go(0);
    else if (e.key === "End") go(last);
    else if (e.key === " " && target.tagName !== "BUTTON") togglePlay();
    else return;
    e.preventDefault();
  };

  // Horizontal swipe on the stage steps forward/back on touch screens.
  const onPointerDown = (e: PointerEvent) => {
    pointerStart.current = e.clientX;
  };
  const onPointerUp = (e: PointerEvent) => {
    if (pointerStart.current === null) return;
    const dx = e.clientX - pointerStart.current;
    pointerStart.current = null;
    if (Math.abs(dx) > 40) go(current + (dx < 0 ? 1 : -1));
  };

  return (
    <section
      aria-label={title[locale]}
      onKeyDown={onKeyDown}
      data-wide=""
      className="not-prose -mx-4 my-10 overflow-hidden border-y border-border bg-surface-1 text-fg sm:mx-0 sm:rounded-2xl sm:border sm:shadow-soft"
    >
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-3 py-3.5 sm:px-5">
        <h3 className="flex items-center gap-2.5 text-[0.95rem] font-semibold">
          <span aria-hidden="true" className="grid size-7 place-items-center rounded-lg bg-accent-soft text-accent">
            <svg viewBox="0 0 24 24" className="size-3.5" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
          </span>
          {title[locale]}
        </h3>
        <span className="hidden font-mono text-xs text-fg-muted sm:inline" aria-hidden="true">
          {t("keyboardHint")}
        </span>
      </header>

      {!hideInput && (
        <form
          className="flex flex-col gap-2 border-b border-border px-3 py-3.5 sm:px-5"
          onSubmit={(e) => {
            e.preventDefault();
            run(raw);
          }}
        >
          <label htmlFor={inputId} className="text-xs font-medium text-fg-muted">
            {(inputLabel ?? { en: "Input", uz: "Input" })[locale]}
          </label>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
            {multiline ? (
              <textarea
                id={inputId}
                value={raw}
                onChange={(e) => setRaw(e.target.value)}
                rows={Math.min(12, Math.max(4, raw.split("\n").length + 1))}
                spellCheck={false}
                aria-invalid={error ? true : undefined}
                aria-describedby={`${inputId}-hint`}
                className="min-w-0 flex-1 rounded-lg border border-border bg-bg px-3 py-2 font-mono text-base leading-relaxed outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent-soft sm:text-sm"
              />
            ) : (
              <input
                id={inputId}
                value={raw}
                onChange={(e) => setRaw(e.target.value)}
                spellCheck={false}
                autoComplete="off"
                aria-invalid={error ? true : undefined}
                aria-describedby={`${inputId}-hint`}
                className="min-h-11 min-w-0 flex-1 rounded-lg border border-border bg-bg px-3 py-2 font-mono text-base outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent-soft sm:min-h-0 sm:text-sm"
              />
            )}
            <button
              type="submit"
              className="min-h-11 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-fg transition-opacity hover:opacity-90 sm:min-h-0"
            >
              {t("run")}
            </button>
          </div>
          <p id={`${inputId}-hint`} className={`text-xs ${error ? "text-rose-600 dark:text-rose-400" : "text-fg-muted"}`}>
            {error ? error[locale] : inputHint?.[locale]}
          </p>
          {presets && presets.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-fg-muted">{t("presets")}:</span>
              {presets.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => {
                    setRaw(p.input);
                    run(p.input);
                  }}
                  className="min-h-9 rounded-full border border-border bg-bg px-3 py-1 transition-colors hover:border-accent hover:text-accent sm:min-h-0 sm:px-2.5"
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}
        </form>
      )}

      {/* Below xl: stage → explanation + controls → code, so the controls sit
          right under the animation. xl+: stage and controls on the left, the
          whole program on the right, both visible while it plays. The code is
          never clipped: no inner scrollbar, long lines wrap with a hanging indent. */}
      <div className={`grid grid-cols-1 ${stacked ? "" : "xl:grid-cols-2"}`}>
        <div
          className={`order-1 min-h-48 touch-pan-y overflow-x-auto overscroll-x-contain p-3 sm:min-h-56 sm:p-5 ${stacked ? "" : "xl:col-start-1 xl:row-start-1"}`}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
        >
          <MotionConfig reducedMotion="user" transition={{ duration: 0.35, ease: "easeOut" }}>
            <LayoutGroup id={groupId}>{render(step.state, input)}</LayoutGroup>
          </MotionConfig>
        </div>
        <div className={`order-3 border-t border-border bg-code-bg ${stacked ? "" : "xl:col-start-2 xl:row-span-2 xl:row-start-1 xl:border-l xl:border-t-0"}`}>
          <p className="flex items-center justify-between px-4 pt-3 text-[0.7rem] font-medium uppercase tracking-wider text-fg-subtle">
            {t("code")}
            <span className="font-mono normal-case tracking-normal">
              {step.line ? `${t("line")} ${step.line}` : ""}
            </span>
          </p>
          <pre className="px-0 py-3 font-mono text-[0.8125rem] leading-[1.65]">
            {codeLines.map((line, i) => {
              const active = step.line === i + 1;
              const indent = line.length - line.trimStart().length;
              return (
                <div
                  key={i}
                  aria-current={active ? "step" : undefined}
                  className={`flex border-l-2 pr-4 transition-colors duration-200 ${active ? "border-accent bg-accent-soft text-fg" : "border-transparent text-fg-muted"}`}
                >
                  <span aria-hidden="true" className="w-10 shrink-0 select-none pr-3 text-right text-fg-subtle">
                    {i + 1}
                  </span>
                  <span className="min-w-0 whitespace-pre-wrap break-words" style={{ paddingLeft: `${indent}ch`, textIndent: 0 }}>
                    {line.trimStart() || " "}
                  </span>
                </div>
              );
            })}
          </pre>
        </div>

        <div className={`order-2 border-t border-border px-3 py-4 sm:px-5 ${stacked ? "" : "xl:col-start-1 xl:row-start-2"}`}>
          <p className="min-h-12 text-[0.95rem] leading-relaxed" aria-live={isPlaying ? "off" : "polite"} aria-atomic="true">
            <span className="mr-2 font-mono text-xs text-fg-subtle">
              {t("stepOf", { current: current + 1, total: steps.length })}
            </span>
            {step.note[locale]}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <ControlButton label={t("reset")} onClick={() => go(0)} disabled={current === 0}>
              <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
              <path d="M3 3v5h5" />
            </ControlButton>
            <ControlButton label={t("stepBack")} onClick={() => go(current - 1)} disabled={current === 0}>
              <path d="m15 18-6-6 6-6" />
            </ControlButton>
            <button
              type="button"
              onClick={togglePlay}
              aria-label={isPlaying ? t("pause") : t("play")}
              className="inline-flex h-10 min-w-28 items-center justify-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-accent-fg transition-opacity hover:opacity-90"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4" fill="currentColor">
                {isPlaying ? <path d="M6 4h4v16H6zM14 4h4v16h-4z" /> : <path d="M7 4v16l13-8z" />}
              </svg>
              {isPlaying ? t("pause") : t("play")}
            </button>
            <ControlButton label={t("stepForward")} onClick={() => go(current + 1)} disabled={atEnd}>
              <path d="m9 18 6-6-6-6" />
            </ControlButton>
            <ControlButton label={t("end")} onClick={() => go(last)} disabled={atEnd}>
              <path d="m6 18 6-6-6-6M18 6v12" />
            </ControlButton>

            <label className="ml-auto flex items-center gap-2 text-xs text-fg-muted">
              {t("speed")}
              <select
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="h-10 rounded-md border border-border bg-bg px-2 text-base text-fg sm:text-xs"
              >
                {SPEEDS.map((s) => (
                  <option key={s} value={s}>
                    {s}×
                  </option>
                ))}
              </select>
            </label>
          </div>

          <input
            type="range"
            min={0}
            max={last}
            value={current}
            onChange={(e) => go(Number(e.target.value))}
            aria-label={t("timeline")}
            aria-valuetext={t("stepOf", { current: current + 1, total: steps.length })}
            className="mt-3 h-8 w-full cursor-pointer accent-[var(--accent)]"
          />

          {footer?.({ input, steps, index: current, atEnd })}

          <details className="mt-3 text-sm">
            <summary className="inline-flex min-h-10 cursor-pointer items-center text-xs font-medium text-fg-muted hover:text-fg">
              {t("allSteps")}
            </summary>
            <ol className="mt-2 max-h-64 list-decimal space-y-1 overflow-auto pl-6 text-fg-muted">
              {steps.map((s, i) => (
                <li key={i} className={i === current ? "font-medium text-fg" : undefined}>
                  <button type="button" onClick={() => go(i)} className="py-1.5 text-left hover:underline">
                    {s.note[locale]}
                  </button>
                </li>
              ))}
            </ol>
          </details>
        </div>
      </div>
    </section>
  );
}

function ControlButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="inline-flex size-10 items-center justify-center rounded-lg border border-border bg-bg transition-colors hover:bg-surface-2 disabled:opacity-40"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="size-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {children}
      </svg>
    </button>
  );
}
