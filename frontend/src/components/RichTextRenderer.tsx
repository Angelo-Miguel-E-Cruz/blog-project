import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import type { RichTextContent } from "../types/post";

/**
 * Renders Tiptap JSON as read-only HTML — used on both the public post page
 * and the admin preview, so preview genuinely matches production (design §3.3/FR-016).
 */
export function RichTextRenderer({ content }: { content: RichTextContent }) {
  const editor = useEditor({
    editable: false,
    content: content as any,
    extensions: [StarterKit, Image, Link.configure({ openOnClick: true })],
  });

  return (
    <div className="prose-blog">
      <EditorContent editor={editor} />
    </div>
  );
}
