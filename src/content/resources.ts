import data from "../../resources.json";

export type ResourceKind = "docs" | "course" | "book" | "article" | "video" | "tool";
export type ResourceAccess = "free" | "paid" | "freemium";
export type ResourceLevel = "beginner" | "intermediate" | "advanced";

export interface Resource {
  id: string;
  title: string;
  url: string;
  kind: ResourceKind;
  access: ResourceAccess;
  level: ResourceLevel;
  language: string;
  author?: string;
  /** "section" or "section/lesson". */
  topics: string[];
  lastVerified: string;
}

export const resources = data.resources as Resource[];

/** Resources for a lesson first, then for its whole section. */
export function resourcesFor(topic: string): Resource[] {
  const [section] = topic.split("/");
  const exact = resources.filter((r) => r.topics.includes(topic));
  const general = topic.includes("/") ? resources.filter((r) => r.topics.includes(section) && !exact.includes(r)) : [];
  return [...exact, ...general];
}
