import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createAdminPost, fetchAdminPostById, updateAdminPost } from "../../api/posts";
import { uploadImage } from "../../api/images";
import { RichTextRenderer } from "../../components/RichTextRenderer";
import type { PostStatus } from "../../types/post";

const EMPTY_DOC = { type: "doc", content: [{ type: "paragraph" }] };

function EditorToolbarButton({
  onClick,
  active,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-2.5 py-1.5 rounded-sm text-sm border border-ink/15 dark:border-parchment/20 ${
        active
          ? "bg-spruce dark:bg-mustard text-parchment dark:text-spruce"
          : "bg-white/60 dark:bg-parchment/10 dark:text-parchment hover:bg-white dark:hover:bg-parchment/20"
      }`}
    >
      {children}
    </button>
  );
}

export function PostEditorPage() {
  const { id } = useParams();
  const isNew = !id || id === "new";
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [status, setStatus] = useState<PostStatus>("DRAFT");
  const [showPreview, setShowPreview] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { data: existingPost } = useQuery({
    queryKey: ["admin-post", id],
    queryFn: () => fetchAdminPostById(id as string),
    enabled: !isNew,
  });

  const editor = useEditor({
    extensions: [StarterKit, Image, Link.configure({ openOnClick: false })],
    content: EMPTY_DOC,
  });

  // Populate the editor once the existing post loads (edit flow).
  useEffect(() => {
    if (existingPost && editor) {
      editor.commands.setContent(existingPost.content as any);
      setTitle(existingPost.title);
      setExcerpt(existingPost.excerpt ?? "");
      setStatus(existingPost.status);
    }
  }, [existingPost, editor]);

  const saveMutation = useMutation({
    mutationFn: async (nextStatus: PostStatus) => {
      const content = editor?.getJSON() ?? EMPTY_DOC;
      const payload = { title, content, status: nextStatus, excerpt: excerpt || undefined };

      if (isNew) {
        return createAdminPost(payload);
      }
      return updateAdminPost(id as string, payload);
    },
    onSuccess: (post, nextStatus) => {
      queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
      queryClient.invalidateQueries({ queryKey: ["admin-post", post.id] });
      setStatus(post.status);
      setSaveError(null);

      if (nextStatus === "PUBLISHED") {
        // Publishing is a "done for now" action — head back to the dashboard with a flash message.
        navigate("/admin", { state: { flash: `"${post.title}" was published.` } });
        return;
      }

      // Saving a draft keeps you in the editor — just confirm inline and make sure a
      // brand-new post's URL now points at its real id (so the next save is an update, not a create).
      setSuccessMessage("Draft saved.");
      if (isNew) {
        navigate(`/admin/posts/${post.id}`, { replace: true });
      }
    },
    onError: () => setSaveError("Couldn't save the post. Check the fields and try again."),
  });

  // Clear the "Draft saved" confirmation once the person starts editing again.
  useEffect(() => {
    setSuccessMessage(null);
  }, [title, excerpt]);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !editor) return;

    try {
      const uploaded = await uploadImage(file, isNew ? undefined : id);
      editor.chain().focus().setImage({ src: uploaded.url }).run();
    } catch {
      setSaveError("Image upload failed.");
    } finally {
      e.target.value = "";
    }
  }

  if (!isNew && !existingPost) {
    return <div className="text-center py-20 text-ink/50">Loading…</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-semibold">{isNew ? "New post" : "Edit post"}</h1>
        <button onClick={() => setShowPreview((v) => !v)} className="text-sm text-mustard-dim dark:text-mustard">
          {showPreview ? "Back to editing" : "Preview"}
        </button>
      </div>

      {showPreview ? (
        <div>
          <h2 className="font-display text-3xl font-bold mb-6">{title || "Untitled post"}</h2>
          <RichTextRenderer content={(editor?.getJSON() ?? EMPTY_DOC) as any} />
        </div>
      ) : (
        <div className="space-y-4">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Post title"
            className="w-full font-display text-2xl font-semibold border-b border-ink/20 dark:border-parchment/20 pb-2 bg-transparent focus:outline-none focus:border-mustard"
          />

          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Excerpt (optional — auto-generated from content if left blank)"
            rows={2}
            className="w-full text-sm border border-ink/15 dark:border-parchment/20 rounded-sm px-3 py-2 bg-white/60 dark:bg-parchment/10 dark:text-parchment focus:outline-none focus:ring-2 focus:ring-mustard"
          />

          <div className="flex gap-2 flex-wrap">
            <EditorToolbarButton onClick={() => editor?.chain().focus().toggleBold().run()} active={editor?.isActive("bold")}>
              Bold
            </EditorToolbarButton>
            <EditorToolbarButton onClick={() => editor?.chain().focus().toggleItalic().run()} active={editor?.isActive("italic")}>
              Italic
            </EditorToolbarButton>
            <EditorToolbarButton
              onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
              active={editor?.isActive("heading", { level: 2 })}
            >
              Heading
            </EditorToolbarButton>
            <EditorToolbarButton
              onClick={() => editor?.chain().focus().toggleBulletList().run()}
              active={editor?.isActive("bulletList")}
            >
              Bullet list
            </EditorToolbarButton>
            <EditorToolbarButton
              onClick={() => editor?.chain().focus().toggleOrderedList().run()}
              active={editor?.isActive("orderedList")}
            >
              Numbered list
            </EditorToolbarButton>
            <EditorToolbarButton
              onClick={() => {
                const url = window.prompt("Link URL");
                if (url) editor?.chain().focus().setLink({ href: url }).run();
              }}
              active={editor?.isActive("link")}
            >
              Link
            </EditorToolbarButton>
            <EditorToolbarButton onClick={() => fileInputRef.current?.click()}>Insert image</EditorToolbarButton>
            <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleImageUpload} />
          </div>

          <div className="border border-ink/15 dark:border-parchment/20 rounded-sm bg-white/50 dark:bg-parchment/5 min-h-[300px] px-4 py-3">
            <EditorContent editor={editor} className="prose-blog" />
          </div>
        </div>
      )}

      {saveError && <p className="text-sm text-red-700 dark:text-red-400 mt-4">{saveError}</p>}
      {successMessage && <p className="text-sm text-mustard-dim dark:text-mustard mt-4">{successMessage}</p>}

      <div className="flex gap-3 mt-6">
        <button
          onClick={() => saveMutation.mutate("DRAFT")}
          disabled={saveMutation.isPending || !title}
          className="px-4 py-2 rounded-sm border border-ink/20 dark:border-parchment/20 text-sm font-medium hover:bg-white/60 dark:hover:bg-parchment/10 disabled:opacity-50"
        >
          Save draft
        </button>
        <button
          onClick={() => saveMutation.mutate("PUBLISHED")}
          disabled={saveMutation.isPending || !title}
          className="px-4 py-2 rounded-sm bg-spruce dark:bg-mustard text-parchment dark:text-spruce text-sm font-medium hover:bg-spruce-light dark:hover:bg-mustard-dim disabled:opacity-50"
        >
          {status === "PUBLISHED" ? "Update & keep published" : "Publish"}
        </button>
      </div>
    </div>
  );
}