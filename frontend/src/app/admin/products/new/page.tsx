"use client";

import { useEffect, useState } from "react";
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
import { fetchAdminCategories } from "@/services/category.service";
import { ImageUpload } from "@/components/upload/ImageUpload";
import { createProduct, fetchAdminProducts, type CreateProductPayload, type Product } from "@/services/product.service";
import type { Category } from "@/services/category.service";
import { RichTextEditor } from "@/components/editor/RichTextEditor";
import { useAdminToken } from "@/lib/use-admin-token";

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function AdminProductsNewPage() {
  const router = useRouter();
  const token = useAdminToken();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [sourceProducts, setSourceProducts] = useState<Product[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [modelCode, setModelCode] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [descriptionHtml, setDescriptionHtml] = useState("");
  const [featured, setFeatured] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [uploadedImages, setUploadedImages] = useState<{ url: string; alt?: string; isPrimary: boolean; sortOrder: number }[]>([]);
  const [specs, setSpecs] = useState<
    { id: string; group?: string; key?: string; name: string; value: string; unit?: string; sortOrder?: number }[]
  >([]);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    Promise.all([
      fetchAdminCategories(token),
      fetchAdminProducts(token, { page: 1, limit: 100 }),
    ])
      .then(([catRes, prodRes]) => {
        setCategories(catRes.items);
        setSourceProducts(prodRes.items);
      })
      .catch(() => {
        setCategories([]);
        setSourceProducts([]);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const handleNameChange = (v: string) => {
    setName(v);
    if (!slug) setSlug(slugify(v));
  };

  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setError("");
    if (!name || !slug || !categoryId) {
      setError("Tên, slug và danh mục là bắt buộc");
      return;
    }
    setSubmitting(true);
    try {
      const normalizedSpecs =
        specs
          .map((s, index) => ({
            group: s.group?.trim() || undefined,
            key: s.key?.trim() || undefined,
            name: s.name.trim(),
            value: s.value.trim(),
            unit: s.unit?.trim() || undefined,
            sortOrder: s.sortOrder ?? index,
          }))
          .filter((s) => s.name && s.value) || [];

      const payload: CreateProductPayload = {
        name,
        slug,
        modelCode: modelCode || undefined,
        categoryId,
        shortDescription: shortDescription || undefined,
        description: descriptionHtml || description || undefined,
        featured,
        isVisible,
        images: uploadedImages.length > 0 ? uploadedImages : undefined,
        specifications: normalizedSpecs.length ? normalizedSpecs : undefined,
        relatedProductIds: [],
      };
      await createProduct(payload);
      router.push("/admin/products");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Tạo sản phẩm thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  if (!token) return null;
  if (loading) {
    return <p className="text-sm text-muted-foreground">Đang tải danh mục...</p>;
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/products">Quay lại</Link>
        </Button>
        <h1 className="text-xl font-semibold text-zinc-900">Thêm sản phẩm</h1>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <p className="rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Thông tin cơ bản</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Tên sản phẩm *</label>
              <Input
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Ví dụ: Máy lạnh Midea Inverter 1.5HP"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Slug *</label>
              <Input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="may-lanh-midea-inverter-1-5hp"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Mã model</label>
              <Input
                value={modelCode}
                onChange={(e) => setModelCode(e.target.value)}
                placeholder="MSAGA-13CRDN8"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Danh mục *</label>
              <Select value={categoryId} onValueChange={setCategoryId} required>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn danh mục" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {categories.length === 0 && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Chưa có danh mục. Tạo danh mục trước tại Admin / Danh mục.
                </p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Mô tả ngắn</label>
              <Textarea
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="Mô tả ngắn hiển thị trên card"
                rows={2}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Mô tả chi tiết</label>
              <RichTextEditor
                folder="products"
                valueHtml={descriptionHtml}
                onChangeHtml={setDescriptionHtml}
                placeholder="Nhập mô tả chi tiết sản phẩm..."
              />
            </div>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="size-4 rounded border-input"
                />
                Sản phẩm nổi bật
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={isVisible}
                  onChange={(e) => setIsVisible(e.target.checked)}
                  className="size-4 rounded border-input"
                />
                Hiển thị trên web
              </label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Thông số kỹ thuật</CardTitle>
            <p className="text-xs text-muted-foreground">
              Thêm các thông số như BTU, công suất HP, gas lạnh, xuất xứ... để hiển thị ở trang sản phẩm.
            </p>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-600">
                <span className="font-medium text-zinc-800">Sao chép từ sản phẩm có sẵn:</span>
                <select
                  className="h-8 rounded border border-zinc-200 bg-white px-2 text-xs outline-none"
                  onChange={(e) => {
                    const id = e.target.value;
                    if (!id) return;
                    const src = sourceProducts.find((p) => p.id === id);
                    if (!src || !Array.isArray(src.specifications)) return;
                    setSpecs(
                      src.specifications.map((s, index) => ({
                        id: crypto.randomUUID(),
                        group: s.group,
                        key: s.key,
                        name: s.name,
                        value: s.value,
                        unit: s.unit,
                        sortOrder: s.sortOrder ?? index,
                      })),
                    );
                  }}
                  defaultValue=""
                >
                  <option value="">Chọn sản phẩm...</option>
                  {sourceProducts
                    .filter((p) => !categoryId || p.categoryId === categoryId)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.modelCode || p.slug})
                      </option>
                    ))}
                </select>
              </div>

              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() =>
                  setSpecs((prev) => [
                    ...prev,
                    { id: crypto.randomUUID(), group: "", key: "", name: "", value: "", unit: "", sortOrder: prev.length },
                  ])
                }
              >
                Thêm thông số
              </Button>
            </div>
            {specs.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                Chưa có thông số nào. Bạn có thể để trống hoặc thêm dần sau khi tạo sản phẩm.
              </p>
            ) : (
              <div className="space-y-2 rounded-md border border-zinc-200 bg-zinc-50 p-2">
                {specs.map((s, idx) => (
                  <div
                    key={s.id}
                    className="grid gap-2 rounded-md bg-white p-2 text-xs md:grid-cols-[1.2fr_0.9fr_1.2fr_1.2fr_0.7fr_auto]"
                  >
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-zinc-700">Nhóm</label>
                      <Input
                        value={s.group || ""}
                        onChange={(e) =>
                          setSpecs((prev) =>
                            prev.map((x) => (x.id === s.id ? { ...x, group: e.target.value } : x)),
                          )
                        }
                        placeholder="Ví dụ: Tổng quan"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-zinc-700">Key</label>
                      <Input
                        value={s.key || ""}
                        onChange={(e) =>
                          setSpecs((prev) =>
                            prev.map((x) => (x.id === s.id ? { ...x, key: e.target.value } : x)),
                          )
                        }
                        placeholder="vd: capacity_btu"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-zinc-700">Tên thông số *</label>
                      <Input
                        value={s.name}
                        onChange={(e) =>
                          setSpecs((prev) =>
                            prev.map((x) => (x.id === s.id ? { ...x, name: e.target.value } : x)),
                          )
                        }
                        placeholder="Công suất làm lạnh"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-zinc-700">Giá trị *</label>
                      <Input
                        value={s.value}
                        onChange={(e) =>
                          setSpecs((prev) =>
                            prev.map((x) => (x.id === s.id ? { ...x, value: e.target.value } : x)),
                          )
                        }
                        placeholder="9000"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-zinc-700">Đơn vị</label>
                      <Input
                        value={s.unit || ""}
                        onChange={(e) =>
                          setSpecs((prev) =>
                            prev.map((x) => (x.id === s.id ? { ...x, unit: e.target.value } : x)),
                          )
                        }
                        placeholder="BTU, HP..."
                      />
                    </div>
                    <div className="flex flex-col justify-between gap-1">
                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-zinc-700">Thứ tự</label>
                        <Input
                          type="number"
                          value={s.sortOrder ?? idx}
                          onChange={(e) =>
                            setSpecs((prev) =>
                              prev.map((x) =>
                                x.id === s.id ? { ...x, sortOrder: Number(e.target.value) || 0 } : x,
                              ),
                            )
                          }
                        />
                      </div>
                      <Button
                        type="button"
                        size="xs"
                        variant="outline"
                        onClick={() => setSpecs((prev) => prev.filter((x) => x.id !== s.id))}
                      >
                        Xóa
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Hình ảnh</CardTitle>
            <p className="text-xs text-muted-foreground">
              Kéo thả ảnh hoặc bấm chọn ảnh để tải lên. Ảnh đầu tiên là ảnh đại diện.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <ImageUpload
              folder="products"
              onUploadComplete={(files) => {
                setUploadedImages((prev) => [
                  ...prev,
                  ...files.map((f, i) => ({
                    url: f.url,
                    alt: f.originalName,
                    isPrimary: prev.length === 0 && i === 0,
                    sortOrder: prev.length + i,
                  })),
                ]);
              }}
              onError={(msg) => setError(msg)}
              multiple
              accept="image/*"
            />
            {uploadedImages.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {uploadedImages.map((img, i) => (
                  <div key={i} className="relative">
                    <img
                      src={img.url}
                      alt={img.alt || ""}
                      className="h-20 w-20 rounded border object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute -right-1 -top-1 rounded-full bg-destructive px-1.5 py-0.5 text-xs text-destructive-foreground"
                    >
                      Xóa
                    </button>
                    {img.isPrimary && (
                      <span className="absolute bottom-0 left-0 right-0 bg-primary/80 py-0.5 text-center text-[10px] text-primary-foreground">
                        Đại diện
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Button type="submit" disabled={submitting}>
            {submitting ? "Đang tạo..." : "Tạo sản phẩm"}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/admin/products">Hủy</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
