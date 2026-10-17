import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function NotFound() {
  const t = useTranslations("NotFound");

  return (
    <main className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="font-mono text-sm text-accent">404</p>
      <h1 className="mt-2 text-[1.6rem] font-semibold tracking-tight sm:text-[2rem]">{t("title")}</h1>
      <p className="mt-3 text-fg-muted">{t("body")}</p>
      <Link
        href="/"
        className="mt-8 inline-block rounded-md bg-accent px-4 py-2.5 text-sm font-semibold text-accent-fg"
      >
        {t("home")}
      </Link>
    </main>
  );
}
