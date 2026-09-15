"use client";

import { useState } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";

const COLORS = ["#1f2933", "#1f6fb2", "#f4a72c", "#dc2626", "#16a34a"];

function Toolbar({ editor }: { editor: Editor }) {
  const btn = (active: boolean) =>
    `rounded-lg px-2.5 py-1.5 text-sm font-bold transition-colors ${
      active ? "bg-brand text-white" : "text-foreground/70 hover:bg-brand-soft"
    }`;

  return (
    <div className="flex flex-wrap items-center gap-1 rounded-t-xl border border-b-0 border-brand-soft bg-brand-soft/30 p-2">
      <button type="button" className={btn(editor.isActive("bold"))} onClick={() => editor.chain().focus().toggleBold().run()} title="Negrito">
        B
      </button>
      <button type="button" className={`${btn(editor.isActive("italic"))} italic`} onClick={() => editor.chain().focus().toggleItalic().run()} title="Itálico">
        I
      </button>
      <button type="button" className={`${btn(editor.isActive("underline"))} underline`} onClick={() => editor.chain().focus().toggleUnderline().run()} title="Sublinhado">
        U
      </button>
      <button type="button" className={`${btn(editor.isActive("strike"))} line-through`} onClick={() => editor.chain().focus().toggleStrike().run()} title="Tachado">
        S
      </button>

      <span className="mx-1 h-5 w-px bg-brand-soft" />

      <button type="button" className={btn(editor.isActive("paragraph"))} onClick={() => editor.chain().focus().setParagraph().run()} title="Texto normal">
        P
      </button>
      <button type="button" className={btn(editor.isActive("heading", { level: 2 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="Título grande">
        H2
      </button>
      <button type="button" className={btn(editor.isActive("heading", { level: 3 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} title="Título médio">
        H3
      </button>

      <span className="mx-1 h-5 w-px bg-brand-soft" />

      <button type="button" className={btn(editor.isActive("bulletList"))} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Lista">
        •—
      </button>
      <button type="button" className={btn(editor.isActive("orderedList"))} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Lista numerada">
        1.
      </button>

      <span className="mx-1 h-5 w-px bg-brand-soft" />

      <button
        type="button"
        className={btn(editor.isActive("link"))}
        title="Link"
        onClick={() => {
          if (editor.isActive("link")) {
            editor.chain().focus().unsetLink().run();
            return;
          }
          const url = window.prompt("URL do link:");
          if (url) editor.chain().focus().setLink({ href: url }).run();
        }}
      >
        🔗
      </button>

      <span className="mx-1 h-5 w-px bg-brand-soft" />

      {COLORS.map((c) => (
        <button
          key={c}
          type="button"
          className="h-6 w-6 rounded-full ring-1 ring-black/10"
          style={{ backgroundColor: c }}
          title={c}
          onClick={() => editor.chain().focus().setColor(c).run()}
        />
      ))}
      <button
        type="button"
        className="rounded-lg px-2 py-1.5 text-xs font-semibold text-foreground/60 hover:bg-brand-soft"
        title="Limpar formatação"
        onClick={() => editor.chain().focus().unsetColor().clearNodes().unsetAllMarks().run()}
      >
        Limpar
      </button>
    </div>
  );
}

export default function RichTextEditor({
  name,
  label,
  hint,
  defaultValue,
}: {
  name: string;
  label: string;
  hint?: string;
  defaultValue?: string | null;
}) {
  const [html, setHtml] = useState(defaultValue || "");

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      Link.configure({ openOnClick: false, autolink: true }),
    ],
    content: defaultValue || "<p></p>",
    editorProps: {
      attributes: {
        class:
          "prose-body min-h-[220px] rounded-b-xl border border-brand-soft bg-white px-4 py-3 outline-none focus:border-brand",
      },
    },
    onUpdate: ({ editor }) => setHtml(editor.getHTML()),
  });

  if (!editor) {
    return (
      <div>
        <label className="block text-sm font-semibold mb-1">{label}</label>
        <div className="min-h-[260px] animate-pulse rounded-xl border border-brand-soft bg-brand-soft/20" />
      </div>
    );
  }

  return (
    <div>
      <label className="block text-sm font-semibold mb-1">{label}</label>
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
      <input type="hidden" name={name} value={html} readOnly />
      {hint && <p className="text-xs text-foreground/50 mt-1">{hint}</p>}
    </div>
  );
}
