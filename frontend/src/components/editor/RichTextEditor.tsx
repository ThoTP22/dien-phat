"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { Button } from "@/components/ui/button";
import { uploadImages } from "@/services/upload.service";

type Props = {
  folder: string;
  valueHtml: string;
  onChangeHtml: (html: string) => void;
  placeholder?: string;
};

export function RichTextEditor({
  folder,
  valueHtml,
  onChangeHtml,
  placeholder = "Nhập nội dung...",
}: Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
      }),
      Image,
      Placeholder.configure({ placeholder }),
    ],
    content: valueHtml || "",
    onUpdate: ({ editor }) => {
      onChangeHtml(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "min-h-40 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
      },
    },
  });

  // Đồng bộ khi valueHtml thay đổi từ ngoài (ví dụ load data)
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (valueHtml !== current) {
      editor.commands.setContent(valueHtml || "", { emitUpdate: false });
    }
  }, [editor, valueHtml]);

  const can = useMemo(() => {
    if (!editor) return {};
    return {
      bold: editor.isActive("bold"),
      italic: editor.isActive("italic"),
      underline: editor.isActive("underline"),
      strike: editor.isActive("strike"),
      bulletList: editor.isActive("bulletList"),
      orderedList: editor.isActive("orderedList"),
      link: editor.isActive("link"),
      h2: editor.isActive("heading", { level: 2 }),
      h3: editor.isActive("heading", { level: 3 }),
    };
  }, [editor, editor?.state]);

  const promptLink = () => {
    if (!editor) return;
    const prevUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Nhập URL", prevUrl || "");
    if (url === null) return;
    if (url.trim() === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
  };

  const onPickImage = () => {
    fileInputRef.current?.click();
  };

  const onFilesSelected = async (files: FileList | null) => {
    if (!editor || !files || files.length === 0) return;
    setUploading(true);
    try {
      const uploaded = await uploadImages(Array.from(files), folder);
      uploaded.forEach((f) => {
        editor.chain().focus().setImage({ src: f.url, alt: f.originalName }).run();
      });
    } catch (e) {
      // giữ thông báo tối giản, không làm vỡ editor
      console.error(e);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (!editor) {
    return <div className="text-sm text-muted-foreground">Đang tải editor...</div>;
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant={can.bold ? "secondary" : "outline"}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          Đậm
        </Button>
        <Button
          type="button"
          size="sm"
          variant={can.italic ? "secondary" : "outline"}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          Nghiêng
        </Button>
        <Button
          type="button"
          size="sm"
          variant={can.underline ? "secondary" : "outline"}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          Gạch chân
        </Button>
        <Button
          type="button"
          size="sm"
          variant={can.strike ? "secondary" : "outline"}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          Gạch ngang
        </Button>

        <span className="mx-1 h-8 w-px bg-border" />

        <Button
          type="button"
          size="sm"
          variant={can.h2 ? "secondary" : "outline"}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          H2
        </Button>
        <Button
          type="button"
          size="sm"
          variant={can.h3 ? "secondary" : "outline"}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          H3
        </Button>
        <Button
          type="button"
          size="sm"
          variant={can.bulletList ? "secondary" : "outline"}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          Danh sách
        </Button>
        <Button
          type="button"
          size="sm"
          variant={can.orderedList ? "secondary" : "outline"}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          Số thứ tự
        </Button>

        <span className="mx-1 h-8 w-px bg-border" />

        <Button
          type="button"
          size="sm"
          variant={can.link ? "secondary" : "outline"}
          onClick={promptLink}
        >
          Link
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => editor.chain().focus().unsetLink().run()}
          disabled={!can.link}
        >
          Bỏ link
        </Button>

        <span className="mx-1 h-8 w-px bg-border" />

        <Button type="button" size="sm" variant="outline" onClick={onPickImage} disabled={uploading}>
          {uploading ? "Đang upload..." : "Chèn ảnh"}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => onFilesSelected(e.target.files)}
        />
      </div>

      <EditorContent editor={editor} />
      <p className="text-[11px] text-muted-foreground">
        Nội dung được lưu dạng HTML. Hình ảnh sẽ được upload lên S3 rồi chèn URL.
      </p>
    </div>
  );
}

