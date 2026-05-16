import "server-only";

import { cookies } from "next/headers";
import { COOKIE_KEY, DICT, isLang, translate, type Lang, type TranslateFn } from "./lang-dict";

/**
 * Read the user's locale from the `tabodis_lang` cookie, falling back to "es".
 * Use inside Server Components, Server Actions and Route Handlers.
 */
export async function getServerLang(): Promise<Lang> {
  const store = await cookies();
  const raw = store.get(COOKIE_KEY)?.value;
  return isLang(raw) ? raw : "es";
}

/**
 * Returns a server-side translator bound to a specific locale. Pass the result
 * down to leaf Server Components as a `t` prop so they don't need to be
 * marked `"use client"` just to access translations.
 */
export function getServerT(lang: Lang): TranslateFn {
  return (key) => translate(lang, key);
}

// Re-export commonly used types so call sites import from a single module.
export type { Lang, TranslateFn };
export { DICT };
