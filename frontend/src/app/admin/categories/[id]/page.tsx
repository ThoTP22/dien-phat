"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAdminToken } from "@/lib/use-admin-token";
import {
  fetchAdminCategoryDetail,
  fetchAdminCategories,
  updateCategory,
  type Category,
} from "@/services/category.service";

export default function AdminCategoryEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const token = useAdminToken();

  const [data, setData] = useState<Category | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [parentId, setParentId] = useState<string | null>(null);
  const [summary, setSummary] = useState("");
  const [isVisible, setIsVisible] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    setError("");
    Promise.all([
      fetchAdminCategoryDetail(token, id),
      fetchAdminCategories(token, { page: 1, limit: 100, includeHidden: true }),
    ])
      .then(([cat, catList]) => {
        setData(cat);
        setName(cat.name);
        setSlug(cat.slug);
        setParentId(cat.parentId ?? null);
        setSummary(cat.summary || "");
        setIsVisible(cat.isVisible);
        setCategories(catList.items.filter((c) => c.id !== id));
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Không thể tải danh mục");
      })
      .finally(() => setLoading(false));
  }, [token, id]);

  if (!token) return null;

  const canSubmit = name.trim().length > 0 && slug.trim().length > 0;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) {
      setError("Tên và slug là bắt buộc");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await updateCategory(token, id, {
        name: name.trim(),
        slug: slug.trim(),
        parentId: parentId ?? undefined,
        summary: summary.trim() || undefined,
        isVisible,
      });
      router.push("/admin/categories");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Cập nhật danh mục thất bại");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold text-zinc-900">Sửa danh mục</h1>
          {data ? (
            <p className="text-sm text-zinc-600">
              Chỉnh sửa thông tin danh mục <span className="font-medium">{data.name}</span>.
            </p>
          ) : null}
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/categories">Quay lại</Link>
        </Button>
      </header>

      {error && (
        <p className="rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Thông tin danh mục</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Đang tải...</p>
          ) : !data ? (
            <p className="text-sm text-destructive">Không tìm thấy danh mục.</p>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4 max-w-xl">
              <div>
                <label className="mb-1 block text-sm font-medium">Tên *</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ví dụ: Máy lạnh treo tường"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Danh mục cha</label>
                <Select
                  value={parentId ?? "__root__"}
                  onValueChange={(v) => setParentId(v === "__root__" ? null : v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Không (danh mục gốc)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__root__">Không (danh mục gốc)</SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Slug *</label>
                <Input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="may-lanh-treo-tuong"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Mô tả ngắn</label>
                <Textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Danh mục máy lạnh treo tường Midea"
                  rows={4}
                />
              </div>
              <div className="flex items-center gap-2 text-sm">
                <input
                  id="isVisible"
                  type="checkbox"
                  checked={isVisible}
                  onChange={(e) => setIsVisible(e.target.checked)}
                  className="h-4 w-4 rounded border-zinc-300"
                />
                <label htmlFor="isVisible">Hiển thị trên web</label>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={!canSubmit || saving}>
                  {saving ? "Đang lưu..." : "Lưu thay đổi"}
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link href="/admin/categories">Hủy</Link>
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

