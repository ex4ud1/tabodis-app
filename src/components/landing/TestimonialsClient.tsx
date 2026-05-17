"use client";

import { useEffect, useRef, useState } from "react";
import { Arrow, ArrowLeft, Close, Plus } from "@/components/icons";
import { useLang } from "@/lib/i18n";
import { CityCombobox } from "@/components/shared/CityCombobox";

export type Testimonial = {
  id: string;
  name: string;
  loc: string;
  initial: string;
  rating: number;
  services: string[];
  quote: string;
};

// Backend stores service tags in Spanish (canonical). The chip labels users
// see in the form are translated via t("contact.svc_*") for each option.
const REVIEW_SERVICE_KEYS: { value: string; labelKey: string }[] = [
  { value: "Inmobiliaria", labelKey: "contact.svc_inmo" },
  { value: "Extranjería", labelKey: "contact.svc_extr" },
  { value: "Gestión", labelKey: "contact.svc_gest" },
];

export function TestimonialsClient({ items }: { items: Testimonial[] }) {
  const { t } = useLang();
  const [idx, setIdx] = useState(0);
  const [exiting, setExiting] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stars, setStars] = useState(0);
  const [starsError, setStarsError] = useState(false);
  const [services, setServices] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [body, setBody] = useState("");
  const [submitError, setSubmitError] = useState("");
  const animRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (animRef.current) clearTimeout(animRef.current);
    },
    [],
  );

  if (items.length === 0) return null;

  const c = items[idx];

  const goTo = (newIdx: number) => {
    if (exiting) return;
    setExiting(true);
    animRef.current = setTimeout(() => {
      setIdx(newIdx);
      setExiting(false);
    }, 320);
  };

  const closeReview = () => {
    setReviewOpen(false);
    setSubmitted(false);
    setStars(0);
    setStarsError(false);
    setServices([]);
    setName("");
    setCity("");
    setBody("");
    setSubmitError("");
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (stars === 0) {
      setStarsError(true);
      return;
    }
    setLoading(true);
    setSubmitError("");
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author_name: name,
          city,
          rating: stars,
          services,
          body,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error ?? t("testi.modal_err_send"));
      }
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : t("testi.modal_err_unknown"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section wrap py-16" id="testimonios">
      <div className="bg-ink text-paper rounded-[32px] p-7 md:p-14 relative overflow-hidden">
        <span
          aria-hidden="true"
          className="absolute -top-8 -right-6 md:-top-12 md:-right-8 font-serif leading-none text-[150px] md:text-[220px] pointer-events-none"
          style={{ color: "rgba(230, 150, 100, 0.18)" }}
        >
          &ldquo;
        </span>
        <div className="flex justify-between items-end mb-10 gap-6 relative z-[2] flex-wrap">
          <h3 className="font-serif text-[clamp(32px,4vw,56px)] leading-[0.95] tracking-tight max-w-[12ch]">
            {t("testi.title_l1")} <em className="italic text-accent">{t("testi.title_em")}</em>
          </h3>
          <div className="flex gap-3 items-center">
            <button
              onClick={() => setReviewOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-accent text-white text-xs font-medium transition-all hover:bg-accent-deep"
            >
              <Plus />
              {t("testi.add")}
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => goTo((idx - 1 + items.length) % items.length)}
                aria-label={t("testi.prev")}
                className="w-11 h-11 rounded-full border border-paper/30 hover:bg-accent hover:border-accent transition-all flex items-center justify-center"
              >
                <ArrowLeft size={16} />
              </button>
              <button
                onClick={() => goTo((idx + 1) % items.length)}
                aria-label={t("testi.next")}
                className="w-11 h-11 rounded-full border border-paper/30 hover:bg-accent hover:border-accent transition-all flex items-center justify-center"
              >
                <Arrow size={16} />
              </button>
            </div>
          </div>
        </div>

        <div
          className={[
            "relative z-[2] transition-all duration-300",
            exiting ? "opacity-0 translate-x-4" : "opacity-100 translate-x-0",
          ].join(" ")}
        >
          <div
            className="flex gap-1 mb-5 text-base"
            aria-label={`${c.rating} / 5`}
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <span key={n} className={n <= c.rating ? "text-accent" : "text-paper/25"}>
                ★
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 mb-6">
            {c.services.map((s) => (
              <span
                key={s}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-paper/25 font-mono text-[10px] tracking-[0.14em] uppercase text-paper/85"
              >
                <span className="w-[5px] h-[5px] rounded-full bg-accent" />
                {s}
              </span>
            ))}
          </div>
          <p className="font-serif text-[clamp(20px,2vw,28px)] leading-[1.35] max-w-[40ch] mb-8 text-pretty">
            &ldquo;{c.quote}&rdquo;
          </p>
          <div className="flex items-center gap-5 pt-6 border-t border-paper/20 flex-wrap">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-accent-deep text-white flex items-center justify-center font-serif text-[20px]">
              {c.initial}
            </div>
            <div>
              <strong className="block font-semibold text-[15px]">{c.name}</strong>
              <span className="font-mono text-[10px] tracking-[0.16em] uppercase text-paper/60">
                {c.loc}
              </span>
            </div>
            <div className="flex gap-1.5 ml-auto">
              {items.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  aria-label={`${t("testi.modal_review")} ${i + 1}`}
                  className={[
                    "h-1.5 rounded-full transition-all",
                    i === idx ? "w-5 bg-accent" : "w-1.5 bg-paper/30",
                  ].join(" ")}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Review modal */}
      {reviewOpen && (
        <div
          onClick={closeReview}
          className="fixed inset-0 z-[60] bg-ink/55 backdrop-blur-sm flex items-center justify-center p-6"
          style={{ animation: "fade-in 0.25s ease" }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-paper text-ink rounded-[28px] p-8 md:p-11 max-w-[520px] w-full max-h-[90vh] overflow-y-auto relative"
            style={{ animation: "slide-up 0.35s cubic-bezier(0.2,0.8,0.2,1)" }}
          >
            <button
              onClick={closeReview}
              aria-label={t("testi.close")}
              className="absolute top-5 right-5 w-9 h-9 rounded-full border border-line text-ink hover:bg-ink hover:text-paper transition-all inline-flex items-center justify-center"
            >
              <Close />
            </button>

            {!submitted ? (
              <>
                <span className="eyebrow text-accent-deep">{t("testi.modal_eyebrow")}</span>
                <h4 className="font-serif text-[44px] leading-none tracking-tight my-3">
                  {t("testi.modal_title_pre")}{" "}
                  <em className="italic text-accent-deep">{t("testi.modal_title_em")}</em>
                </h4>
                <p className="text-sm text-ink-soft mb-7">{t("testi.modal_sub")}</p>
                <form onSubmit={onSubmit} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="font-mono text-[10px] tracking-[0.16em] uppercase text-ink-soft">
                      {t("testi.modal_rating")}
                    </label>
                    <div className={["flex gap-1.5", starsError ? "stars-err" : ""].join(" ")}>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => {
                            setStars(n);
                            setStarsError(false);
                          }}
                          aria-label={`${n} / 5`}
                          className={[
                            "text-[28px] transition-all",
                            n <= stars ? "text-accent" : "text-line",
                            starsError ? "text-danger" : "",
                            "hover:scale-110",
                          ].join(" ")}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                    {starsError && <span className="field-errmsg">{t("testi.modal_rating_err")}</span>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label={t("testi.modal_name")}>
                      <input
                        required
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={t("testi.modal_name_ph")}
                        className="border-0 border-b border-line bg-transparent py-2.5 text-base outline-none focus:border-accent transition-colors"
                      />
                    </Field>
                    <Field label={t("testi.modal_city")}>
                      <CityCombobox
                        value={city}
                        onChange={setCity}
                        required
                        placeholder="Alicante"
                        inputClassName="border-0 border-b border-line bg-transparent py-2.5 text-base outline-none focus:border-accent transition-colors w-full"
                      />
                    </Field>
                  </div>

                  <Field label={t("testi.modal_services")}>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {REVIEW_SERVICE_KEYS.map((s) => {
                        const on = services.includes(s.value);
                        return (
                          <button
                            key={s.value}
                            type="button"
                            onClick={() =>
                              setServices((prev) =>
                                prev.includes(s.value) ? prev.filter((x) => x !== s.value) : [...prev, s.value],
                              )
                            }
                            className={[
                              "inline-flex items-center gap-2 px-3.5 py-2 rounded-full border text-[13px] transition-all",
                              on
                                ? "bg-ink text-paper border-ink chip-on"
                                : "border-line text-ink hover:border-ink",
                            ].join(" ")}
                          >
                            <span
                              className={[
                                "inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] leading-none",
                                on ? "bg-accent text-white" : "bg-current/20",
                              ].join(" ")}
                            >
                              {on ? "✓" : "+"}
                            </span>
                            {t(s.labelKey)}
                          </button>
                        );
                      })}
                    </div>
                  </Field>

                  <Field label={t("testi.modal_review")}>
                    <textarea
                      required
                      rows={4}
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      placeholder={t("testi.modal_review_ph")}
                      minLength={10}
                      className="border-0 border-b border-line bg-transparent py-2.5 text-base outline-none focus:border-accent transition-colors resize-none min-h-[60px]"
                    />
                  </Field>

                  {submitError && <p className="field-errmsg">{submitError}</p>}

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary self-start mt-2"
                  >
                    {loading ? (
                      <>
                        <span className="btn-spinner" /> {t("testi.modal_submitting")}
                      </>
                    ) : (
                      <>
                        {t("testi.modal_submit")} <Arrow size={14} />
                      </>
                    )}
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center py-10 px-5">
                <div
                  className="font-serif text-6xl text-accent-deep leading-none"
                  style={{ animation: "pop 0.5s cubic-bezier(0.5,1.6,0.4,1)" }}
                >
                  ✓
                </div>
                <h4 className="font-serif text-[44px] leading-none tracking-tight mt-4">
                  {t("testi.modal_thanks")}
                </h4>
                <p className="text-sm text-ink-soft mt-2">{t("testi.modal_thanks_sub")}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="font-mono text-[10px] tracking-[0.16em] uppercase text-ink-soft">
        {label}
      </label>
      {children}
    </div>
  );
}
