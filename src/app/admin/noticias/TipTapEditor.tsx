"use client";

import { useCallback, useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";

interface Props {
  content: string;
  onChange: (html: string) => void;
}

const TOOLBAR = [
  { cmd: "bold", label: "B", style: "font-bold" },
  { cmd: "italic", label: "I", style: "italic" },
  { cmd: "strike", label: "S", style: "line-through" },
  { cmd: "h2", label: "H2", style: "font-bold text-sm" },
  { cmd: "h3", label: "H3", style: "font-bold text-xs" },
  { cmd: "bulletList", label: "• Lista", style: "" },
  { cmd: "orderedList", label: "1. Lista", style: "" },
  { cmd: "blockquote", label: "❝", style: "" },
  { cmd: "hr", label: "—", style: "" },
];

export default function TipTapEditor({ content, onChange }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Image.configure({ HTMLAttributes: { class: "rounded-xl max-w-full" } }),
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: "Escribe el cuerpo de la noticia…" }),
    ],
    content,
    onUpdate: ({ editor: e }) => onChange(e.getHTML()),
  });

  const insertImage = useCallback(
    async (file: File) => {
      if (!editor) return;
      const fd = new FormData();
      fd.set("file", file);
      try {
        const res = await fetch("/api/admin/news/upload", { method: "POST", body: fd });
        if (!res.ok) return;
        const { url } = await res.json();
        editor.chain().focus().setImage({ src: url }).run();
      } catch {
        /* noop */
      }
    },
    [editor]
  );

  // Pegar imagen del portapapeles
  useEffect(() => {
    if (!editor) return;
    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of Array.from(items)) {
        if (item.type.startsWith("image/")) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) await insertImage(file);
          return;
        }
      }
    };
    const el = editor.view.dom;
    el.addEventListener("paste", handlePaste);
    return () => el.removeEventListener("paste", handlePaste);
  }, [editor, insertImage]);

  if (!editor) return null;

  const run = (cmd: string) => {
    switch (cmd) {
      case "bold": return editor.chain().focus().toggleBold().run();
      case "italic": return editor.chain().focus().toggleItalic().run();
      case "strike": return editor.chain().focus().toggleStrike().run();
      case "h2": return editor.chain().focus().toggleHeading({ level: 2 }).run();
      case "h3": return editor.chain().focus().toggleHeading({ level: 3 }).run();
      case "bulletList": return editor.chain().focus().toggleBulletList().run();
      case "orderedList": return editor.chain().focus().toggleOrderedList().run();
      case "blockquote": return editor.chain().focus().toggleBlockquote().run();
      case "hr": return editor.chain().focus().setHorizontalRule().run();
    }
  };

  const isActive = (cmd: string) => {
    switch (cmd) {
      case "bold": return editor.isActive("bold");
      case "italic": return editor.isActive("italic");
      case "strike": return editor.isActive("strike");
      case "h2": return editor.isActive("heading", { level: 2 });
      case "h3": return editor.isActive("heading", { level: 3 });
      case "bulletList": return editor.isActive("bulletList");
      case "orderedList": return editor.isActive("orderedList");
      case "blockquote": return editor.isActive("blockquote");
      default: return false;
    }
  };

  return (
    <div className="rounded-lg border border-[var(--line-strong)] bg-[var(--ink-950)]">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b border-[var(--line)] px-2 py-1.5">
        {TOOLBAR.map((btn) => (
          <button
            key={btn.cmd}
            type="button"
            onClick={() => run(btn.cmd)}
            className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
              isActive(btn.cmd)
                ? "bg-[#4C8DFF]/20 text-[#4C8DFF]"
                : "text-[var(--text-dim)] hover:bg-white/5 hover:text-white"
            } ${btn.style}`}
          >
            {btn.label}
          </button>
        ))}
        <div className="mx-1 h-4 w-px bg-[var(--line)]" />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="rounded-md px-2.5 py-1 text-xs font-semibold text-[var(--text-dim)] transition-colors hover:bg-white/5 hover:text-white"
        >
          Imagen
        </button>
        <button
          type="button"
          onClick={() => {
            const url = prompt("URL del link:");
            if (url) editor.chain().focus().setLink({ href: url }).run();
          }}
          className="rounded-md px-2.5 py-1 text-xs font-semibold text-[var(--text-dim)] transition-colors hover:bg-white/5 hover:text-white"
        >
          Link
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) insertImage(f);
            e.target.value = "";
          }}
        />
      </div>

      {/* Contenido */}
      <EditorContent
        editor={editor}
        className="prose prose-invert max-w-none px-4 py-3 text-sm leading-relaxed [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-extrabold [&_h2]:uppercase [&_h2]:tracking-tight [&_h2]:text-white [&_h3]:font-display [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-white [&_p]:text-[var(--text)] [&_strong]:text-white [&_a]:text-[#4C8DFF] [&_blockquote]:border-l-2 [&_blockquote]:border-[#4C8DFF] [&_blockquote]:pl-4 [&_blockquote]:text-[var(--text-dim)] [&_img]:rounded-xl"
      />

      {/* Pegar imagen hint */}
      <p className="border-t border-[var(--line)] px-3 py-1.5 text-[10px] text-[var(--text-dim)]">
        Puedes pegar imágenes directamente con Ctrl+V
      </p>
    </div>
  );
}
