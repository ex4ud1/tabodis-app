"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { useLang } from "@/lib/i18n";

export function DeletePropertyButton({
  onDelete,
  title,
}: {
  onDelete: () => Promise<void>;
  title: string;
}) {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => setOpen(false), []);

  // Move focus to "Cancel" on open (safer default), close on Escape.
  useEffect(() => {
    if (!open) return;
    cancelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-danger text-[13px] underline underline-offset-4 hover:no-underline"
      >
        {t("admin.delete.button")}
      </button>

      {open && (
        <div
          onClick={close}
          className="fixed inset-0 z-[60] bg-ink/55 backdrop-blur-sm flex items-center justify-center p-6"
          style={{ animation: "fade-in 0.25s ease" }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-title"
            onClick={(e) => e.stopPropagation()}
            className="bg-paper text-ink rounded-[24px] p-8 max-w-[440px] w-full relative"
            style={{ animation: "slide-up 0.35s cubic-bezier(0.2,0.8,0.2,1)" }}
          >
            <h2
              id="delete-title"
              className="font-serif text-3xl leading-tight tracking-tight mb-3"
            >
              {t("admin.delete.confirm_title")}
            </h2>
            <p className="text-sm text-ink-soft mb-2">
              <span className="font-medium text-ink">{title}</span>
            </p>
            <p className="text-sm text-ink-soft mb-7">{t("admin.delete.confirm_body")}</p>
            <form action={onDelete} className="flex gap-3 justify-end">
              <button
                ref={cancelRef}
                type="button"
                onClick={close}
                className="px-4 py-2 rounded-full bg-transparent text-ink text-[13px] font-medium border border-line hover:border-ink transition-colors"
              >
                {t("admin.delete.cancel")}
              </button>
              <ConfirmSubmit
                label={t("admin.delete.confirm")}
                loadingLabel={t("admin.delete.deleting")}
              />
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function ConfirmSubmit({ label, loadingLabel }: { label: string; loadingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="px-4 py-2 rounded-full bg-danger text-white text-[13px] font-medium border border-danger hover:bg-danger/90 transition-colors disabled:opacity-60"
    >
      {pending ? loadingLabel : label}
    </button>
  );
}
