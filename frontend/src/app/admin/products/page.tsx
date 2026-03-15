"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAdminToken } from "@/lib/use-admin-token";
import { deleteProduct, fetchAdminProducts, updateProduct, type Product, type ProductImage } from "@/services/product.service";
import { fetchAdminCategories, type Category } from "@/services/category.service";
import { ImageUpload } from "@/components/upload/ImageUpload";

function getErrorMessage(e: unknown, fallback: string) {
  if (e instanceof Error) return e.message || fallback;
  if (typeof e === "string") return e || fallback;
  return fallback;
}

export default function AdminProductsPage() {
  const token = useAdminToken();
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [includeHidden, setIncludeHidden] = useState(true);
  const [editing, setEditing] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editImages, setEditImages] = useState<ProductImage[]>([]);
  const [editSpecs, setEditSpecs] = useState<
    { group?: string; key?: string; name: string; value: string; unit?: string; sortOrder?: number }[]
  >([]);

  const query = useMemo(() => {
    return {
      page: 1,
      limit: 50,
      search: search.trim() || undefined,
      includeHidden
    };
  }, [includeHidden, search]);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchAdminProducts(token, query);
        if (!cancelled) setItems(data.items);
      } catch (e: unknown) {
        if (!cancelled) setError(getErrorMessage(e, "Không thể tải danh sách sản phẩm"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [query, token]);

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const data = await fetchAdminCategories(token, { page: 1, limit: 100, includeHidden: true });
        setCategories(data.items);
      } catch {
        // bỏ qua, modal vẫn dùng được nhưng không đổi danh mục
      }
    })();
  }, [token]);

  useEffect(() => {
    if (editing) {
      setEditImages(
        (editing.images || []).slice().sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      );
      setEditSpecs(
        (editing.specifications || [])
          .slice()
          .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
          .map((s) => ({ ...s })),
      );
    } else {
      setEditImages([]);
      setEditSpecs([]);
    }
  }, [editing]);

  if (!token) return null;

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <h1 className="text-xl font-semibold text-zinc-900">Sản phẩm</h1>
        <Button asChild>
          <Link href="/admin/products/new">Thêm sản phẩm</Link>
        </Button>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Danh sách sản phẩm</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-2 md:flex-row md:items-center">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm theo tên sản phẩm..."
                className="md:w-[320px]"
              />
              <label className="flex items-center gap-2 text-sm text-zinc-700">
                <input
                  type="checkbox"
                  checked={includeHidden}
                  onChange={(e) => setIncludeHidden(e.target.checked)}
                />
                Hiển thị cả sản phẩm đang ẩn
              </label>
            </div>
            <div className="text-sm text-muted-foreground">
              {loading ? "Đang tải..." : `${items.length} sản phẩm`}
            </div>
          </div>

          {error ? (
            <p className="mt-4 text-sm text-red-600">{error}</p>
          ) : null}

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-zinc-600">
                <tr className="border-b">
                  <th className="py-2 pr-4">Tên</th>
                  <th className="py-2 pr-4">Slug</th>
                  <th className="py-2 pr-4">Trạng thái</th>
                  <th className="py-2 pr-4">Liên kết</th>
                  <th className="py-2 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {items.map((p) => (
                  <tr key={p.id} className="border-b last:border-0">
                    <td className="py-3 pr-4">
                      <div className="font-medium text-zinc-900">{p.name}</div>
                      {p.modelCode ? (
                        <div className="text-xs text-muted-foreground">Model: {p.modelCode}</div>
                      ) : null}
                    </td>
                    <td className="py-3 pr-4 text-zinc-700">{p.slug}</td>
                    <td className="py-3 pr-4">
                      <span className={p.isVisible ? "text-emerald-700" : "text-zinc-500"}>
                        {p.isVisible ? "Đang hiển thị" : "Đang ẩn"}
                      </span>
                      {p.featured ? <span className="ml-2 text-amber-700">(Nổi bật)</span> : null}
                    </td>
                    <td className="py-3 pr-4">
                      <Link className="text-primary underline-offset-4 hover:underline" href={`/san-pham/${p.slug}`}>
                        Xem trang public
                      </Link>
                    </td>
                    <td className="flex gap-2 py-3 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={loading}
                        onClick={() => setEditing(p)}
                      >
                        Sửa
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={!p.isVisible || loading}
                        onClick={async () => {
                          try {
                            await deleteProduct(token, p.id);
                            setItems((prev) => prev.map((x) => (x.id === p.id ? { ...x, isVisible: false } : x)));
                          } catch (e: unknown) {
                            setError(getErrorMessage(e, "Ẩn sản phẩm thất bại"));
                          }
                        }}
                      >
                        Ẩn
                      </Button>
                    </td>
                  </tr>
                ))}
                {!loading && items.length === 0 ? (
                  <tr>
                    <td className="py-6 text-center text-muted-foreground" colSpan={5}>
                      Chưa có sản phẩm nào.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {editing && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="max-h-[90vh] w-[70vw] max-w-[70vw] overflow-y-auto rounded-xl bg-white p-5 shadow-lg">
            <h2 className="mb-4 text-base font-semibold text-zinc-900">Sửa sản phẩm</h2>
            <form
              className="space-y-3"
              onSubmit={async (e) => {
                e.preventDefault();
                if (!editing) return;
                try {
                  setSaving(true);
                  setError(null);
                  const formData = new FormData(e.currentTarget as HTMLFormElement);
                  const name = String(formData.get("name") || "").trim();
                  const slug = String(formData.get("slug") || "").trim();
                  const modelCode = String(formData.get("modelCode") || "").trim();
                  const categoryId = String(formData.get("categoryId") || "").trim();
                  const shortDescription = String(formData.get("shortDescription") || "").trim();
                  const description = String(formData.get("description") || "").trim();
                  const featured = formData.get("featured") === "on";
                  const isVisible = formData.get("isVisible") === "on";

                  const normalizedImages =
                    editImages
                      .filter((img) => img.url && img.url.trim().length > 0)
                      .map((img, index) => ({
                        url: img.url.trim(),
                        alt: img.alt?.trim() || undefined,
                        isPrimary: img.isPrimary ?? false,
                        sortOrder: index,
                      })) || [];

                  const normalizedSpecs =
                    editSpecs
                      .map((s, index) => ({
                        group: s.group?.trim() || undefined,
                        key: s.key?.trim() || undefined,
                        name: s.name.trim(),
                        value: s.value.trim(),
                        unit: s.unit?.trim() || undefined,
                        sortOrder: s.sortOrder ?? index,
                      }))
                      .filter((s) => s.name && s.value) || [];

                  const updated = await updateProduct(editing.id, {
                    name: name || undefined,
                    slug: slug || undefined,
                    modelCode: modelCode || undefined,
                    categoryId: categoryId || undefined,
                    shortDescription: shortDescription || undefined,
                    description: description || undefined,
                    featured,
                    isVisible,
                    images: normalizedImages.length ? normalizedImages : undefined,
                    specifications: normalizedSpecs.length ? normalizedSpecs : undefined,
                  });

                  setItems((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
                  setEditing(null);
                } catch (e: unknown) {
                  setError(getErrorMessage(e, "Cập nhật sản phẩm thất bại"));
                } finally {
                  setSaving(false);
                }
              }}
            >
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-700" htmlFor="name">
                  Tên sản phẩm
                </label>
                <Input id="name" name="name" defaultValue={editing.name} />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-700" htmlFor="slug">
                  Slug
                </label>
                <Input id="slug" name="slug" defaultValue={editing.slug} />
              </div>

              <div className="flex flex-col gap-3 md:flex-row">
                <div className="flex-1 space-y-1">
                  <label className="text-xs font-medium text-zinc-700" htmlFor="modelCode">
                    Model code
                  </label>
                  <Input id="modelCode" name="modelCode" defaultValue={editing.modelCode || ""} />
                </div>
                <div className="flex-1 space-y-1">
                  <label className="text-xs font-medium text-zinc-700" htmlFor="categoryId">
                    Danh mục
                  </label>
                  <select
                    id="categoryId"
                    name="categoryId"
                    defaultValue={editing.categoryId}
                    className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    <option value={editing.categoryId}>Giữ nguyên danh mục hiện tại</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-700" htmlFor="shortDescription">
                  Mô tả ngắn
                </label>
                <Textarea
                  id="shortDescription"
                  name="shortDescription"
                  defaultValue={editing.shortDescription || ""}
                  rows={2}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-700" htmlFor="description">
                  Mô tả chi tiết (HTML)
                </label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={editing.description || ""}
                  rows={5}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-zinc-700">Hình ảnh</span>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setEditImages((prev) => [
                        ...prev,
                        {
                          url: "",
                          alt: "",
                          isPrimary: prev.length === 0,
                          sortOrder: prev.length
                        }
                      ])
                    }
                  >
                    Thêm hình
                  </Button>
                </div>

                <ImageUpload
                  folder="products"
                  onUploadComplete={(files) => {
                    setEditImages((prev) => [
                      ...prev,
                      ...files.map((f, i) => ({
                        url: f.url,
                        alt: f.originalName,
                        isPrimary: prev.length === 0 && i === 0,
                        sortOrder: prev.length + i
                      }))
                    ]);
                  }}
                  onError={(msg) => setError(msg)}
                  multiple
                  accept="image/*"
                />

                {editImages.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    Chưa có hình nào. Bạn có thể upload ảnh mới hoặc dán URL hình đã upload lên S3 để hiển thị ở trang sản phẩm.
                  </p>
                ) : (
                  <div className="space-y-2 rounded-md border border-zinc-200 bg-zinc-50 p-2">
                    {editImages.map((img, index) => (
                      <div
                        key={index}
                        className="flex flex-col gap-2 rounded-md bg-white p-2 text-xs md:flex-row md:items-center"
                      >
                        <div className="flex-1 space-y-1">
                          <label className="text-[11px] font-medium text-zinc-700">
                            URL hình
                          </label>
                          <Input
                            value={img.url}
                            onChange={(e) =>
                              setEditImages((prev) =>
                                prev.map((x, i) => (i === index ? { ...x, url: e.target.value } : x))
                              )
                            }
                            placeholder="https://..."
                          />
                        </div>
                        <div className="flex-1 space-y-1">
                          <label className="text-[11px] font-medium text-zinc-700">
                            Alt (mô tả)
                          </label>
                          <Input
                            value={img.alt || ""}
                            onChange={(e) =>
                              setEditImages((prev) =>
                                prev.map((x, i) => (i === index ? { ...x, alt: e.target.value } : x))
                              )
                            }
                            placeholder="Mô tả ngắn cho hình"
                          />
                        </div>
                        <div className="flex flex-col gap-1 md:w-40">
                          <label className="flex items-center gap-1.5">
                            <input
                              type="radio"
                              name="primaryImage"
                              checked={!!img.isPrimary}
                              onChange={() =>
                                setEditImages((prev) =>
                                  prev.map((x, i) => ({ ...x, isPrimary: i === index }))
                                )
                              }
                            />
                            <span>Hình chính</span>
                          </label>
                          <Button
                            type="button"
                            variant="outline"
                            size="xs"
                            onClick={() =>
                              setEditImages((prev) => prev.filter((_, i) => i !== index))
                            }
                          >
                            Xóa
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-zinc-700">Thông số kỹ thuật</span>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setEditSpecs((prev) => [
                        ...prev,
                        { group: "", key: "", name: "", value: "", unit: "", sortOrder: prev.length },
                      ])
                    }
                  >
                    Thêm thông số
                  </Button>
                </div>

                {editSpecs.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    Chưa có thông số nào. Bạn có thể thêm dần các thông số như BTU, công suất, gas lạnh...
                  </p>
                ) : (
                  <div className="space-y-2 rounded-md border border-zinc-200 bg-zinc-50 p-2">
                    {editSpecs.map((s, index) => (
                      <div
                        key={`${s.key || s.name || "spec"}-${index}`}
                        className="grid gap-2 rounded-md bg-white p-2 text-xs md:grid-cols-[1.2fr_0.9fr_1.2fr_1.2fr_0.7fr_auto]"
                      >
                        <div className="space-y-1">
                          <label className="text-[11px] font-medium text-zinc-700">Nhóm</label>
                          <Input
                            value={s.group || ""}
                            onChange={(e) =>
                              setEditSpecs((prev) =>
                                prev.map((x, i) => (i === index ? { ...x, group: e.target.value } : x)),
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
                              setEditSpecs((prev) =>
                                prev.map((x, i) => (i === index ? { ...x, key: e.target.value } : x)),
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
                              setEditSpecs((prev) =>
                                prev.map((x, i) => (i === index ? { ...x, name: e.target.value } : x)),
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
                              setEditSpecs((prev) =>
                                prev.map((x, i) => (i === index ? { ...x, value: e.target.value } : x)),
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
                              setEditSpecs((prev) =>
                                prev.map((x, i) => (i === index ? { ...x, unit: e.target.value } : x)),
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
                              value={s.sortOrder ?? index}
                              onChange={(e) =>
                                setEditSpecs((prev) =>
                                  prev.map((x, i) =>
                                    i === index
                                      ? { ...x, sortOrder: Number(e.target.value) || 0 }
                                      : x,
                                  ),
                                )
                              }
                            />
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="xs"
                            onClick={() =>
                              setEditSpecs((prev) => prev.filter((_, i) => i !== index))
                            }
                          >
                            Xóa
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-4 text-sm text-zinc-700">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="featured"
                    defaultChecked={editing.featured}
                  />
                  Nổi bật
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="isVisible"
                    defaultChecked={editing.isVisible}
                  />
                  Đang hiển thị
                </label>
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={saving}
                  onClick={() => setEditing(null)}
                >
                  Hủy
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? "Đang lưu..." : "Lưu thay đổi"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
