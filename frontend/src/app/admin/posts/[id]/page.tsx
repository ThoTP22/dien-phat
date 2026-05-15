"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RichTextEditor } from "@/components/editor/RichTextEditor";
import { uploadImages } from "@/services/upload.service";
import { fetchAdminPostDetail, updatePost, type PostStatus } from "@/services/post.service";

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function AdminPostsEditPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [summary, setSummary] = useState("");
  const [contentHtml, setContentHtml] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [status, setStatus] = useState<PostStatus>("draft");
  const [publishedAt, setPublishedAt] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const canSubmit = useMemo(
    () => title.trim() && slug.trim() && contentHtml.trim(),
    [title, slug, contentHtml]
  );

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError("");
        const post = await fetchAdminPostDetail(id);
        if (cancelled) return;
        setTitle(post.title || "");
        setSlug(post.slug || "");
        setSummary(post.summary || "");
        setContentHtml(post.content || "");
        setCoverImageUrl(post.coverImageUrl || "");
        setStatus((post.status as PostStatus) || "draft");
        setPublishedAt(
          post.publishedAt
            ? new Date(post.publishedAt).toISOString().slice(0, 16)
            : ""
        );
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Không thể tải bài viết");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const onUploadCover = async () => {
    if (!coverFile) return;
    setUploading(true);
    setError("");
    try {
      const files = await uploadImages([coverFile], "posts");
      setCoverImageUrl(files[0]?.url || "");
      setCoverFile(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload ảnh bìa thất bại");
    } finally {
      setUploading(false);
    }
  };

  const onSave = async (overrideStatus?: PostStatus) => {
    if (!id) return;
    const finalStatus = overrideStatus ?? status;
    if (!canSubmit) {
      setError("Tiêu đề, slug và nội dung là bắt buộc");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await updatePost(id, {
        title: title.trim(),
        slug: slug.trim(),
        summary: summary.trim() || undefined,
        content: contentHtml,
        coverImageUrl: coverImageUrl || undefined,
        status: finalStatus,
        publishedAt:
          finalStatus === "published"
            ? publishedAt || new Date().toISOString()
            : null,
      });
      router.push("/admin/posts");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Cập nhật bài viết thất bại");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <header className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/posts">Quay lại</Link>
          </Button>
          <h1 className="text-xl font-semibold text-zinc-900">Sửa bài viết</h1>
        </header>
        <Card>
          <CardContent className="py-6 text-sm text-zinc-600">Đang tải dữ liệu...</CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/posts">Quay lại</Link>
        </Button>
        <h1 className="text-xl font-semibold text-zinc-900">Sửa bài viết</h1>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" onClick={() => onSave("draft")} disabled={saving}>
            {saving ? "Đang lưu..." : "Lưu nháp"}
          </Button>
          <Button onClick={() => onSave("published")} disabled={saving}>
            {saving ? "Đang lưu..." : "Xuất bản"}
          </Button>
        </div>
      </header>

      {error && (
        <p className="rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Thông tin</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Tiêu đề *</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Slug *</label>
            <div className="flex gap-2">
              <Input value={slug} onChange={(e) => setSlug(e.target.value)} />
              <Button type="button" variant="outline" onClick={() => setSlug(slugify(title))}>
                Tạo lại slug
              </Button>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Tóm tắt</label>
            <Textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={3}
              placeholder="Tóm tắt ngắn để hiển thị ở danh sách bài viết"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium">Ảnh bìa</label>
            <div className="flex flex-wrap items-center gap-2">
              <Input
                type="file"
                accept="image/*"
                className="max-w-xs"
                onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
              />
              <Button type="button" variant="secondary" onClick={onUploadCover} disabled={!coverFile || uploading}>
                {uploading ? "Đang upload..." : "Upload ảnh bìa"}
              </Button>
            </div>
            {coverImageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={coverImageUrl} alt="Ảnh bìa" className="h-24 w-40 rounded border object-cover" />
            )}
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[160px]">
              <label className="mb-1 block text-sm font-medium">Trạng thái</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as PostStatus)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="draft">🖊 Nháp</option>
                <option value="published">✅ Xuất bản</option>
                <option value="hidden">🚫 Ẩn</option>
              </select>
            </div>
            {status === "published" && (
              <div className="flex-1 min-w-[200px]">
                <label className="mb-1 block text-sm font-medium">Ngày xuất bản</label>
                <Input
                  type="datetime-local"
                  value={publishedAt}
                  onChange={(e) => setPublishedAt(e.target.value)}
                />
                <p className="text-[11px] text-muted-foreground mt-1">Để trống = xuất bản ngay lập tức</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Nội dung *</CardTitle>
        </CardHeader>
        <CardContent>
          <RichTextEditor folder="posts" valueHtml={contentHtml} onChangeHtml={setContentHtml} />
        </CardContent>
      </Card>
    </div>
  );
}
