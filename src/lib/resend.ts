import "server-only";

import { Resend } from "resend";
import type { LeadInput } from "./validations";

const FROM_DEFAULT = "onboarding@resend.dev";

function getClient(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

function fmtBudget(k?: number) {
  if (typeof k !== "number") return "—";
  if (k >= 1000) return `€${(k / 1000).toFixed(k % 1000 === 0 ? 0 : 1)}M`;
  return `€${k}k`;
}

export async function sendLeadEmail(lead: LeadInput) {
  const resend = getClient();
  const to = process.env.LEADS_NOTIFY_EMAIL;
  if (!resend || !to) {
    console.warn("[resend] Missing RESEND_API_KEY or LEADS_NOTIFY_EMAIL — skipping notify email");
    return { skipped: true as const };
  }

  const from = process.env.RESEND_FROM_EMAIL ?? FROM_DEFAULT;
  const subject = `Nuevo lead — ${lead.name} (${lead.services.join(", ")})`;

  const html = `
    <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#1c2747">
      <h1 style="font-family:'Instrument Serif',Times New Roman,serif;font-size:32px;line-height:1.05;margin:0 0 8px">Nuevo lead</h1>
      <p style="color:#4b5575;margin:0 0 24px">Tabodis · ${new Date().toLocaleString("es-ES")}</p>

      <table style="width:100%;border-collapse:collapse;font-size:14px">
        <tbody>
          ${row("Nombre", escapeHtml(lead.name))}
          ${row("Email", `<a href="mailto:${escapeHtml(lead.email)}" style="color:#c97644">${escapeHtml(lead.email)}</a>`)}
          ${lead.phone ? row("Teléfono", `<a href="tel:${escapeHtml(lead.phone)}" style="color:#c97644">${escapeHtml(lead.phone)}</a>`) : ""}
          ${row("Servicios", lead.services.map(escapeHtml).join(", "))}
          ${row("Presupuesto", fmtBudget(lead.budget))}
          ${row("Urgencia", escapeHtml(lead.urgency))}
          ${row("Prefiere", lead.contact_methods.map(escapeHtml).join(", "))}
          ${row("Idioma", lead.language.toUpperCase())}
          ${lead.message ? row("Mensaje", `<div style="white-space:pre-wrap">${escapeHtml(lead.message)}</div>`) : ""}
        </tbody>
      </table>

      <p style="margin-top:32px;font-size:12px;color:#8a93ad">
        Enviado desde tabodis-app.vercel.app · responder en 24h.
      </p>
    </div>
  `;

  const text = [
    `Nuevo lead: ${lead.name}`,
    `Email: ${lead.email}`,
    lead.phone ? `Teléfono: ${lead.phone}` : "",
    `Servicios: ${lead.services.join(", ")}`,
    `Presupuesto: ${fmtBudget(lead.budget)}`,
    `Urgencia: ${lead.urgency}`,
    `Prefiere: ${lead.contact_methods.join(", ")}`,
    `Idioma: ${lead.language}`,
    lead.message ? `\nMensaje:\n${lead.message}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const result = await resend.emails.send({
    from: `Tabodis <${from}>`,
    to: [to],
    replyTo: lead.email,
    subject,
    html,
    text,
  });

  if (result.error) {
    console.error("[resend] send failed", result.error);
    return { skipped: false as const, error: result.error.message };
  }
  return { skipped: false as const, id: result.data?.id };
}

function row(label: string, value: string) {
  return `
    <tr>
      <td style="padding:8px 12px 8px 0;color:#4b5575;vertical-align:top;width:130px">${escapeHtml(label)}</td>
      <td style="padding:8px 0;color:#1c2747">${value}</td>
    </tr>
  `;
}

function escapeHtml(s: string) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
