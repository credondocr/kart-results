"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface MediaItem {
  pathname: string;
  url: string;
  size: number;
  uploadedAt: string;
  name: string;
}

export default function AdminMediaPage() {
  const router = useRouter();
  const [images, setImages] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/media");
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      setImages(data.images ?? []);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  const upload = async (file: File) => {
    setUploading(true);
    setMessage(null);
    try {
      const fd = new FormData();
      fd.set("file", file);
      const res = await fetch("/api/admin/media", { method: "POST", body: fd });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setMessage(`Error: ${data.error ?? res.status}`);
        return;
      }
      setMessage("Subida ✓");
      await load();
    } finally {
      setUploading(false);
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(`${window.location.origin}${url}`);
    setCopied(url);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--text-dim)]">
            Panel de administración
          </p>
          <h1 className="mt-1 font-display text-3xl font-black uppercase tracking-tight text-white">
            Media
          </h1>
        </div>
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="rounded-lg bg-[#4C8DFF] px-4 py-2.5 text-xs font-bold uppercase tracking-[0.12em] text-white hover:bg-[#3a7cf0] disabled:opacity-50"
        >
          {uploading ? "Subiendo…" : "+ Subir imagen"}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []);
            files.forEach(upload);
            e.target.value = "";
          }}
        />
      </div>

      {message ? (
        <p className={`mt-4 text-sm ${message.startsWith("Error") ? "text-red-400" : "text-emerald-400"}`}>
          {message}
        </p>
      ) : null}

      <p className="mt-4 max-w-2xl text-xs text-[var(--text-dim)]">
        Todas las imágenes subidas desde el editor de noticias o desde acá viven
        en esta biblioteca. Copia la URL para usarla donde quieras.
      </p>

      {loading ? (
        <p className="mt-10 text-center text-sm text-[var(--text-dim)]">Cargando…</p>
      ) : images.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-[var(--line-strong)] bg-[var(--surface-2)]/30 p-10 text-center">
          <p className="font-display text-lg font-extrabold uppercase tracking-tight text-white">
            Sin imágenes
          </p>
          <p className="mt-2 text-sm text-[var(--text-dim)]">
            Sube tu primera imagen o agrégala desde el editor de noticias.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {images.map((img) => (
            <div key={img.pathname} className="group overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface-2)]/40">
              <div className="relative aspect-square bg-[var(--ink-950)]">
                <Image
                  src={img.url}
                  alt={img.name}
                  fill
                  sizes="200px"
                  className="object-contain"
                  unoptimized
                />
              </div>
              <div className="p-2">
                <p className="truncate font-mono text-[10px] text-[var(--text-dim)]" title={img.name}>
                  {img.name}
                </p>
                <p className="mt-0.5 text-[10px] text-[var(--text-dim)]">
                  {(img.size / 1024).toFixed(0)} KB · {new Date(img.uploadedAt).toLocaleDateString("es-CR")}
                </p>
                <button
                  onClick={() => copyUrl(img.url)}
                  className="mt-1.5 w-full rounded-md bg-[#4C8DFF]/10 py-1 text-[10px] font-bold uppercase tracking-wide text-[#4C8DFF] transition-colors hover:bg-[#4C8DFF]/20"
                >
                  {copied === img.url ? "Copiado ✓" : "Copiar URL"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
