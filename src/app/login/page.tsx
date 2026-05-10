"use client";

import { useState } from "react";
import { signInWithOtp } from "./actions";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("sending");
    setError("");
    const res = await signInWithOtp(email);
    if (res.error) {
      setState("error");
      setError(res.error);
    } else {
      setState("sent");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md bg-paper border border-line rounded-3xl p-9">
        <h1 className="font-serif text-5xl tracking-tight text-ink mb-2">
          Tabo<em className="italic text-accent">·</em>dis admin
        </h1>
        <p className="text-sm text-ink-soft mb-8">
          Te enviamos un enlace de acceso a tu email.
        </p>

        {state === "sent" ? (
          <div className="rounded-xl bg-accent/10 border border-accent/30 p-4 text-sm text-ink">
            Revisa <strong>{email}</strong> y haz clic en el enlace para entrar.
          </div>
        ) : (
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <label className="font-mono text-[10px] tracking-[0.16em] uppercase text-ink-soft">
              Email
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tatiana@example.com"
                className="mt-2 w-full border-0 border-b border-line bg-transparent py-2.5 text-base outline-none focus:border-accent transition-colors"
                style={{ fontSize: 16 }}
              />
            </label>
            {error && <p className="field-errmsg">{error}</p>}
            <button type="submit" disabled={state === "sending"} className="btn-primary self-start mt-2">
              {state === "sending" ? <span className="btn-spinner" /> : "Enviar enlace"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
