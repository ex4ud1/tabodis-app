import "server-only";

/**
 * Logs Supabase / generic errors without leaking the full object to Vercel
 * stdout. We only emit `code`, `message`, `details.hint` — enough for triage,
 * not enough for an exfiltration scenario via log aggregation.
 */
type SupabaseErrorShape = {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
};

export function logSupabaseError(scope: string, err: unknown): void {
  if (err && typeof err === "object") {
    const e = err as SupabaseErrorShape;
    console.error(`[${scope}]`, {
      code: e.code,
      message: e.message,
      hint: e.hint,
    });
    return;
  }
  console.error(`[${scope}]`, String(err));
}
