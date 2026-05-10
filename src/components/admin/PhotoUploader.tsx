"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function PhotoUploader({
  name,
  initial,
}: {
  name: string;
  initial?: string[];
}) {
  const [urls, setUrls] = useState<string[]>(initial ?? []);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setBusy(true);
    setErr("");
    const supa = createClient();
    const next = [...urls];
    for (const f of files) {
      const safe = f.name.replace(/[^a-z0-9.]/gi, "_");
      const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safe}`;
      const { data, error } = await supa.storage
        .from("property-images")
        .upload(path, f, { cacheControl: "3600", upsert: false });
      if (error) {
        setErr(error.message);
        continue;
      }
      const { data: pub } = supa.storage.from("property-images").getPublicUrl(data.path);
      next.push(pub.publicUrl);
    }
    setUrls(next);
    setBusy(false);
    e.target.value = "";
  }

  function remove(u: string) {
    setUrls(urls.filter((x) => x !== u));
  }

  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= urls.length) return;
    const next = [...urls];
    [next[i], next[j]] = [next[j], next[i]];
    setUrls(next);
  }

  return (
    <div className="flex flex-col gap-3">
      <input type="hidden" name={name} value={JSON.stringify(urls)} />
      {urls.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {urls.map((u, i) => (
            <div key={u} className="relative aspect-[4/3] rounded-lg overflow-hidden bg-bg-2 group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={u} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/30 transition-colors flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => move(i, -1)}
                  className="bg-paper text-ink text-xs px-2 py-1 rounded"
                  disabled={i === 0}
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() => move(i, 1)}
                  className="bg-paper text-ink text-xs px-2 py-1 rounded"
                  disabled={i === urls.length - 1}
                >
                  →
                </button>
                <button
                  type="button"
                  onClick={() => remove(u)}
                  className="bg-danger text-white text-xs px-2 py-1 rounded"
                >
                  ×
                </button>
              </div>
              {i === 0 && (
                <span className="absolute top-1 left-1 bg-accent text-white text-[10px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded">
                  Portada
                </span>
              )}
            </div>
          ))}
        </div>
      )}
      <label className="btn-ghost cursor-pointer self-start">
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={onPick}
          className="hidden"
          disabled={busy}
        />
        {busy ? <span className="btn-spinner" /> : urls.length ? "Añadir más fotos" : "Subir fotos"}
      </label>
      {err && <p className="field-errmsg">{err}</p>}
    </div>
  );
}
