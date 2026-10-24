import { architectureLib } from "./architecture/registry";
import { gitLib } from "./git/registry";
import { principlesLib } from "./principles/registry";
import { tools } from "./tools/registry";

/**
 * The reference sections next to the course, in menu order. Header, mobile
 * menu, footer and home page all read this list, so a new section is one row.
 */
export const handbook = [
  { key: "principles", href: "/principles", count: principlesLib.entries.length, icon: "M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7zM9 12l2 2 4-4" },
  { key: "architecture", href: "/architecture", count: architectureLib.entries.length, icon: "M12 2 2 7l10 5 10-5zM2 17l10 5 10-5M2 12l10 5 10-5" },
  { key: "tools", href: "/tools", count: tools.length, icon: "M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z" },
  { key: "git", href: "/git", count: gitLib.entries.length, icon: "M6 3v12M18 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM18 9a9 9 0 0 1-9 9" },
] as const;
