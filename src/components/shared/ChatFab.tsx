"use client";

import { Chat } from "@/components/icons";
import { useLang } from "@/lib/i18n";

export function ChatFab({ whatsapp }: { whatsapp?: string }) {
  const { t } = useLang();
  if (!whatsapp) return null;
  const cleaned = whatsapp.replace(/[^\d+]/g, "").replace(/^\+/, "");
  const href = `https://wa.me/${cleaned}?text=${encodeURIComponent(t("common.chat_msg"))}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t("common.chat")}
      className="chat-fab fixed bottom-7 right-7 z-40 w-14 h-14 rounded-full bg-accent text-white flex items-center justify-center shadow-[0_12px_30px_-10px_rgba(230,150,100,0.6)] transition-transform duration-[0.25s] hover:scale-[1.08] max-[480px]:bottom-6 max-[480px]:right-4"
    >
      <Chat />
    </a>
  );
}
