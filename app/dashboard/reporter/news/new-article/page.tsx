"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";

const Tiptap = () => {
  const editor = useEditor({
    extensions: [StarterKit, Link, Image],
    content: "<p>Hello World! 🌎️</p>",
    immediatelyRender: false,
  });

  if (!editor) return null;

  return (
    <div className="mx-auto max-w-2xl p-4">
      {/* Toolbar */}
      <div className="mb-2 flex flex-wrap gap-2">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive("bold") ? "font-bold text-blue-600" : ""}
        >
          Bold
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive("italic") ? "text-blue-600 italic" : ""}
        >
          Italic
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={
            editor.isActive("strike") ? "text-blue-600 line-through" : ""
          }
        >
          Strike
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={
            editor.isActive("underline") ? "text-blue-600 underline" : ""
          }
        >
          Underline
        </button>

        {/* Headings */}
        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          className={
            editor.isActive("heading", { level: 1 }) ? "text-blue-600" : ""
          }
        >
          H1
        </button>
        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={
            editor.isActive("heading", { level: 2 }) ? "text-blue-600" : ""
          }
        >
          H2
        </button>
        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          className={
            editor.isActive("heading", { level: 3 }) ? "text-blue-600" : ""
          }
        >
          H3
        </button>

        {/* Lists & blockquote */}
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive("bulletList") ? "text-blue-600" : ""}
        >
          • List
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive("orderedList") ? "text-blue-600" : ""}
        >
          1. List
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive("blockquote") ? "text-blue-600" : ""}
        >
          “Blockquote
        </button>

        {/* Link */}
        <button
          onClick={() => {
            const url = prompt("Enter URL");
            if (url)
              editor
                .chain()
                .focus()
                .extendMarkRange("link")
                .setLink({ href: url })
                .run();
          }}
          className={editor.isActive("link") ? "text-blue-600" : ""}
        >
          Link
        </button>

        {/* Image */}
        <button
          onClick={() => {
            const url = prompt("Enter image URL");
            if (url) editor.chain().focus().setImage({ src: url }).run();
          }}
        >
          Image
        </button>

        {/* Clear formatting */}
        <button
          onClick={() =>
            editor.chain().focus().clearNodes().unsetAllMarks().run()
          }
        >
          Clear
        </button>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} className="min-h-[200px] border p-4" />
    </div>
  );
};

export default Tiptap;
