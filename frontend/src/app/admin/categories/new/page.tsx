"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
import { createCategory, fetchAdminCategories, type Category } from "@/services/category.service";
import Link from "next/link";

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function AdminCategoryNewPage() {
  const router = useRouter();
  const token = useAdminToken();

  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [parentId, setParentId] = useState<string | null>(null);
  const [summary, setSummary] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    fetchAdminCategories(token, { page: 1, limit: 100, includeHidden: true })
      .then((res) => setCategories(res.items))
      .catch(() => setCategories([]));
  }, [token]);

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
      await createCategory(token, {
        name: name.trim(),
        slug: slug.trim(),
        parentId: parentId || undefined,
        summary: summary.trim() || undefined,
        isVisible: true,
        sortOrder: 0,
      });
      router.push("/admin/categories");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Tạo danh mục thất bại");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold text-zinc-900">Tạo danh mục</h1>
          <p className="text-sm text-zinc-600">Thêm danh mục sản phẩm mới cho website.</p>
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
          <form onSubmit={onSubmit} className="space-y-4 max-w-xl">
            <div>
              <label className="mb-1 block text-sm font-medium">Tên *</label>
              <Input
                value={name}
                onChange={(e) => {
                  const v = e.target.value;
                  setName(v);
                  if (!slug) setSlug(slugify(v));
                }}
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
              <p className="mt-1 text-xs text-zinc-500">
                Để trống nếu đây là danh mục cấp 1 (vd: Điều hòa). Chọn danh mục cha nếu đây là danh mục con (vd: Máy lạnh treo tường).
              </p>
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
            <div className="flex gap-2">
              <Button type="submit" disabled={!canSubmit || saving}>
                {saving ? "Đang tạo..." : "Lưu danh mục"}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/admin/categories">Hủy</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

