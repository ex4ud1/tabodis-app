"use client";

import { useEffect, useRef, useState } from "react";
import { Arrow, ArrowLeft } from "@/components/icons";
import {
  METHODS_OPTIONS,
  SERVICES_OPTIONS,
  URGENCY_OPTIONS,
  type LeadInput,
} from "@/lib/validations";
import { useLang } from "@/lib/i18n";
import type { TranslateFn } from "@/lib/lang-dict";

const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const isValidPhone = (v: string) => !v || /^[+]?[\d\s\-().]{7,20}$/.test(v.trim());

// Backend canonical service / urgency / method values live in Spanish. The
// chip labels users see are translated via the keys below; submission still
// posts the canonical value so admins read consistent data.
const SERVICE_LABEL_KEYS: Record<(typeof SERVICES_OPTIONS)[number], string> = {
  Inmobiliaria: "contact.svc_inmo",
  Extranjería: "contact.svc_extr",
  Gestión: "contact.svc_gest",
  "Asesoría legal": "contact.svc_legal",
};

const URGENCY_LABEL_KEYS: Record<(typeof URGENCY_OPTIONS)[number], string> = {
  "Lo antes posible": "contact.urg_asap",
  "Próximos 3 meses": "contact.urg_3m",
  "Próximos 6 meses": "contact.urg_6m",
  "Solo explorando": "contact.urg_explore",
};

const METHOD_LABEL_KEYS: Record<(typeof METHODS_OPTIONS)[number], string> = {
  Email: "contact.m_email",
  Teléfono: "contact.m_phone",
  WhatsApp: "contact.m_wa",
  Telegram: "contact.m_tg",
};

type StepData = {
  services: string[];
  budget: number;
  urgency: string;
  name: string;
  email: string;
  phone: string;
  contact_methods: string[];
  message: string;
};

const INITIAL: StepData = {
  services: [],
  budget: 500,
  urgency: "",
  name: "",
  email: "",
  phone: "",
  contact_methods: ["Email"],
  message: "",
};

export function Contact() {
  const { t, lang } = useLang();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<StepData>(INITIAL);
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const submitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (submitTimer.current) clearTimeout(submitTimer.current);
    },
    [],
  );

  const update = <K extends keyof StepData>(k: K, v: StepData[K]) =>
    setData((d) => ({ ...d, [k]: v }));
  const toggleArr = (k: "services" | "contact_methods", v: string) =>
    setData((d) => ({
      ...d,
      [k]: d[k].includes(v) ? d[k].filter((x) => x !== v) : [...d[k], v],
    }));

  const needsBudget = data.services.includes("Inmobiliaria");
  const phoneRequired = data.contact_methods.some((m) =>
    ["Teléfono", "WhatsApp", "Telegram"].includes(m),
  );
  const stepLabels = [
    t("contact.step_label_service"),
    needsBudget ? t("contact.step_label_plan") : t("contact.step_label_moment"),
    t("contact.step_label_contact"),
    t("contact.step_label_message"),
  ];
  const stepValid = [
    data.services.length > 0,
    !!data.urgency && (!needsBudget || typeof data.budget === "number"),
    !!data.name &&
      isValidEmail(data.email) &&
      data.contact_methods.length > 0 &&
      (!phoneRequired || (!!data.phone && isValidPhone(data.phone))),
    true,
  ];
  const total = 4;
  const isLast = step === total - 1;
  const canNext = stepValid[step];

  const submit = async () => {
    setLoading(true);
    setSubmitError("");
    try {
      const payload: LeadInput = {
        name: data.name,
        email: data.email,
        phone: data.phone || undefined,
        services: data.services as unknown as LeadInput["services"],
        budget: needsBudget ? data.budget : undefined,
        urgency: data.urgency as LeadInput["urgency"],
        contact_methods: data.contact_methods as unknown as LeadInput["contact_methods"],
        message: data.message || undefined,
        language: lang,
      };
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error ?? t("contact.err_send"));
      }
      setStep(total);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : t("contact.err_unknown"));
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep(0);
    setData(INITIAL);
    setEmailError("");
    setPhoneError("");
    setSubmitError("");
  };

  return (
    <section className="wrap" id="contacto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-20 items-center py-20">
        <h3 className="font-serif text-[clamp(40px,7vw,104px)] leading-[0.92] tracking-[-0.03em]">
          {t("contact.title_l1")}
          <br />
          {t("contact.title_l2_pre")}{" "}
          <em className="italic text-accent-deep">{t("contact.title_em")}</em>.
        </h3>

        <div className="flex flex-col gap-7 min-h-[420px]">
          {step < total ? (
            <>
              <div className="flex items-center gap-3.5 font-mono text-[10px] tracking-widest uppercase text-ink-soft">
                <span className="font-serif text-base text-ink">
                  <em className="italic text-accent-deep">0{step + 1}</em> / 0{total}
                </span>
                <div className="flex-1 h-0.5 bg-line rounded-sm overflow-hidden relative">
                  <i
                    className="absolute inset-0 bg-accent origin-left transition-transform duration-[0.6s]"
                    style={{ transform: `scaleX(${(step + 1) / total})` }}
                  />
                </div>
                <span>{stepLabels[step]}</span>
              </div>

              <div
                key={step}
                className="flex flex-col gap-5 flex-1"
                style={{ animation: "slide-up 0.45s cubic-bezier(0.2,0.8,0.2,1)" }}
              >
                {step === 0 && (
                  <Step0
                    t={t}
                    selected={data.services}
                    onToggle={(v) => toggleArr("services", v)}
                  />
                )}
                {step === 1 && (
                  <Step1
                    t={t}
                    budget={data.budget}
                    urgency={data.urgency}
                    showBudget={needsBudget}
                    onBudget={(v) => update("budget", v)}
                    onUrgency={(v) => update("urgency", v)}
                  />
                )}
                {step === 2 && (
                  <Step2
                    t={t}
                    data={data}
                    update={update}
                    toggleMethod={(v) => toggleArr("contact_methods", v)}
                    emailError={emailError}
                    setEmailError={setEmailError}
                    phoneError={phoneError}
                    setPhoneError={setPhoneError}
                    phoneRequired={phoneRequired}
                  />
                )}
                {step === 3 && (
                  <Step3
                    t={t}
                    data={data}
                    update={update}
                  />
                )}
              </div>

              {submitError && <p className="field-errmsg">{submitError}</p>}

              <div className="flex gap-3 items-center pt-3 border-t border-line mt-auto">
                <button
                  className="bg-transparent border-0 text-ink-soft px-4 py-2.5 text-[13px] inline-flex items-center gap-2 hover:text-ink disabled:opacity-30 disabled:cursor-not-allowed"
                  disabled={step === 0 || loading}
                  onClick={() => setStep((s) => Math.max(0, s - 1))}
                >
                  <ArrowLeft size={14} />
                  {t("contact.atras")}
                </button>
                <button
                  className="btn-primary ml-auto"
                  disabled={!canNext || loading}
                  onClick={() => (isLast ? submit() : setStep((s) => s + 1))}
                >
                  {loading ? (
                    <span className="btn-spinner" />
                  ) : (
                    <>
                      {isLast ? t("contact.enviar") : t("contact.siguiente")} <Arrow size={14} />
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-14 px-5 flex flex-col items-center gap-4">
              <div
                className="w-20 h-20 rounded-full bg-accent text-white flex items-center justify-center text-4xl"
                style={{ animation: "pop 0.5s cubic-bezier(0.5,1.6,0.4,1)" }}
              >
                ✓
              </div>
              <h4 className="font-serif text-[clamp(28px,3vw,42px)] leading-[1.05] tracking-tight text-ink">
                {t("contact.success_l1")}{" "}
                <em className="italic text-accent-deep">{t("contact.success_em")}</em>.
              </h4>
              <p className="text-sm text-ink-soft max-w-[360px]">{t("contact.success_sub")}</p>
              <button onClick={reset} className="btn-ghost mt-3">
                {t("contact.success_again")}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function Step0({
  t,
  selected,
  onToggle,
}: {
  t: TranslateFn;
  selected: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <>
      <h4 className="font-serif text-[clamp(28px,3vw,42px)] leading-[1.05] tracking-tight text-ink max-w-[18ch]">
        {t("contact.step0_q_pre")}{" "}
        <em className="italic text-accent-deep">{t("contact.step0_q_em")}</em>
        {t("contact.step0_q_post")}
      </h4>
      <p className="text-sm text-ink-soft -mt-2">{t("contact.step0_hint")}</p>
      <div className="flex flex-wrap gap-2 pt-1">
        {SERVICES_OPTIONS.map((s) => {
          const on = selected.includes(s);
          return (
            <button
              key={s}
              type="button"
              onClick={() => onToggle(s)}
              className={[
                "inline-flex items-center gap-2 px-3.5 py-2 rounded-full border text-[13px] transition-all duration-200",
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
              {t(SERVICE_LABEL_KEYS[s])}
            </button>
          );
        })}
      </div>
    </>
  );
}

function Step1({
  t,
  budget,
  urgency,
  showBudget,
  onBudget,
  onUrgency,
}: {
  t: TranslateFn;
  budget: number;
  urgency: string;
  showBudget: boolean;
  onBudget: (v: number) => void;
  onUrgency: (v: string) => void;
}) {
  const MAX = 3000;
  const pct = (budget / MAX) * 100;
  const fmt = (k: number) =>
    k >= 1000 ? `€${(k / 1000).toFixed(k % 1000 === 0 ? 0 : 1)}M` : `€${k}k`;
  const label =
    budget >= MAX ? t("contact.budget_more") : `${t("contact.budget_upto")} ${fmt(budget)}`;
  const [head, ...rest] = label.split(" ");

  return (
    <>
      <h4 className="font-serif text-[clamp(28px,3vw,42px)] leading-[1.05] tracking-tight text-ink max-w-[18ch]">
        {showBudget ? (
          <>
            {t("contact.step1_q_budget_pre")}{" "}
            <em className="italic text-accent-deep">{t("contact.step1_q_budget_em")}</em>{" "}
            {t("contact.step1_q_budget_post")}
          </>
        ) : (
          <>
            {t("contact.step1_q_only_pre")}{" "}
            <em className="italic text-accent-deep">{t("contact.step1_q_only_em")}</em>{" "}
            {t("contact.step1_q_only_post")}
          </>
        )}
      </h4>

      {showBudget && (
        <div className="flex flex-col gap-2 mt-2">
          <label className="font-mono text-[10px] tracking-[0.16em] uppercase text-ink-soft">
            {t("contact.budget_label")}
          </label>
          <div className="flex flex-col gap-3.5 py-2">
            <div className="flex items-baseline gap-2 font-serif">
              <span className="text-[clamp(40px,5vw,56px)] leading-none tracking-tight">
                <em className="italic text-accent-deep">{head}</em> {rest.join(" ")}
              </span>
            </div>
            <input
              type="range"
              min={50}
              max={MAX}
              step={25}
              value={budget}
              onChange={(e) => onBudget(Number(e.target.value))}
              className="range-track"
              style={{ ["--p" as string]: `${pct}%` }}
              aria-label={t("contact.budget_label")}
            />
            <div className="flex justify-between font-mono text-[10px] tracking-[0.14em] uppercase text-ink-soft">
              <span>€50k</span>
              <span>€3M+</span>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2 mt-3">
        <label className="font-mono text-[10px] tracking-[0.16em] uppercase text-ink-soft">
          {t("contact.urgency_label")}
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {URGENCY_OPTIONS.map((b) => {
            const on = urgency === b;
            return (
              <button
                key={b}
                type="button"
                onClick={() => onUrgency(b)}
                className={[
                  "px-5 py-4 rounded-2xl border text-left text-sm transition-all duration-200 flex items-center gap-3",
                  on
                    ? "bg-ink text-paper border-ink"
                    : "border-line text-ink hover:border-ink",
                ].join(" ")}
              >
                <span className="w-3.5 h-3.5 rounded-full border-[1.5px] border-current relative flex-shrink-0">
                  {on && (
                    <span className="absolute inset-[2px] rounded-full bg-accent" />
                  )}
                </span>
                {t(URGENCY_LABEL_KEYS[b])}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}

function Step2({
  t,
  data,
  update,
  toggleMethod,
  emailError,
  setEmailError,
  phoneError,
  setPhoneError,
  phoneRequired,
}: {
  t: TranslateFn;
  data: StepData;
  update: <K extends keyof StepData>(k: K, v: StepData[K]) => void;
  toggleMethod: (v: string) => void;
  emailError: string;
  setEmailError: (v: string) => void;
  phoneError: string;
  setPhoneError: (v: string) => void;
  phoneRequired: boolean;
}) {
  return (
    <>
      <h4 className="font-serif text-[clamp(28px,3vw,42px)] leading-[1.05] tracking-tight text-ink max-w-[18ch]">
        {t("contact.step2_q_pre")}{" "}
        <em className="italic text-accent-deep">{t("contact.step2_q_em")}</em>
        {t("contact.step2_q_post")}
      </h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label className="font-mono text-[10px] tracking-[0.16em] uppercase text-ink-soft">
            {t("contact.name_label")}
          </label>
          <input
            required
            type="text"
            value={data.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder={t("contact.name_ph")}
            className="border-0 border-b border-line bg-transparent py-2.5 text-base outline-none focus:border-accent transition-colors"
            style={{ fontSize: 16 }}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-mono text-[10px] tracking-[0.16em] uppercase text-ink-soft">
            {t("contact.email_label")}
          </label>
          <input
            required
            type="email"
            value={data.email}
            onChange={(e) => {
              update("email", e.target.value);
              if (emailError) setEmailError("");
            }}
            onBlur={(e) =>
              setEmailError(
                e.target.value && !isValidEmail(e.target.value) ? t("contact.email_err") : "",
              )
            }
            placeholder={t("contact.email_ph")}
            className={[
              "border-0 border-b bg-transparent py-2.5 text-base outline-none transition-colors",
              emailError ? "border-danger" : "border-line focus:border-accent",
            ].join(" ")}
            style={{ fontSize: 16 }}
          />
          {emailError && <span className="field-errmsg">{emailError}</span>}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="font-mono text-[10px] tracking-[0.16em] uppercase text-ink-soft">
          {phoneRequired ? t("contact.phone_label_req") : t("contact.phone_label")}
        </label>
        <input
          type="tel"
          required={phoneRequired}
          value={data.phone}
          onChange={(e) => {
            update("phone", e.target.value);
            if (phoneError) setPhoneError("");
          }}
          onBlur={(e) =>
            setPhoneError(
              e.target.value && !isValidPhone(e.target.value)
                ? t("contact.phone_err_invalid")
                : phoneRequired && !e.target.value
                  ? t("contact.phone_err_required")
                  : "",
            )
          }
          placeholder={t("contact.phone_ph")}
          className={[
            "border-0 border-b bg-transparent py-2.5 text-base outline-none transition-colors",
            phoneError ? "border-danger" : "border-line focus:border-accent",
          ].join(" ")}
          style={{ fontSize: 16 }}
        />
        {phoneError && <span className="field-errmsg">{phoneError}</span>}
      </div>

      <div className="flex flex-col gap-2">
        <label className="font-mono text-[10px] tracking-[0.16em] uppercase text-ink-soft">
          {t("contact.method_label")}
        </label>
        <div className="flex flex-wrap gap-2 pt-1">
          {METHODS_OPTIONS.map((m) => {
            const on = data.contact_methods.includes(m);
            return (
              <button
                key={m}
                type="button"
                onClick={() => toggleMethod(m)}
                className={[
                  "inline-flex items-center gap-2 px-3.5 py-2 rounded-full border text-[13px] transition-all duration-200",
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
                {t(METHOD_LABEL_KEYS[m])}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}

function Step3({
  t,
  data,
  update,
}: {
  t: TranslateFn;
  data: StepData;
  update: <K extends keyof StepData>(k: K, v: StepData[K]) => void;
}) {
  const fmt = (k: number) =>
    k >= 1000 ? `€${(k / 1000).toFixed(k % 1000 === 0 ? 0 : 1)}M` : `€${k}k`;
  const showBudget = data.services.includes("Inmobiliaria");
  return (
    <>
      <h4 className="font-serif text-[clamp(28px,3vw,42px)] leading-[1.05] tracking-tight text-ink max-w-[18ch]">
        {t("contact.step3_q_pre")}{" "}
        <em className="italic text-accent-deep">{t("contact.step3_q_em")}</em>{" "}
        {t("contact.step3_q_post")}
      </h4>
      <p className="text-sm text-ink-soft -mt-2">{t("contact.step3_hint")}</p>
      <div className="rounded-xl bg-bg-2 px-4 py-3 text-[13px] text-ink-soft mb-1">
        <strong className="block mb-1.5 font-mono text-[10px] tracking-[0.14em] uppercase text-ink">
          {t("contact.summary")}
        </strong>
        {data.services.map((s) => t(SERVICE_LABEL_KEYS[s as keyof typeof SERVICE_LABEL_KEYS] ?? "")).filter(Boolean).join(", ")}
        {showBudget && ` · ${t("contact.budget_upto")} ${fmt(data.budget)}`} ·{" "}
        {t(URGENCY_LABEL_KEYS[data.urgency as keyof typeof URGENCY_LABEL_KEYS] ?? "")}
      </div>
      <textarea
        rows={4}
        value={data.message}
        onChange={(e) => update("message", e.target.value)}
        placeholder={t("contact.message_ph")}
        className="border-0 border-b border-line bg-transparent py-2.5 text-base outline-none focus:border-accent transition-colors resize-none"
        style={{ fontSize: 16 }}
      />
    </>
  );
}
