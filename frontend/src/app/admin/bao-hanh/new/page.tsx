"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAdminToken } from "@/lib/use-admin-token";
import { ImageUpload } from "@/components/upload/ImageUpload";
import type { UploadedFile } from "@/services/upload.service";
import {
  createAdminRepairTicket,
  fetchAdminUsers,
  type CreateRepairTicketPayload,
  type AdminUser,
} from "@/services/repairTicket.service";

export default function AdminBaoHanhNewPage() {
  const token = useAdminToken();
  const router = useRouter();

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [users, setUsers] = useState<AdminUser[]>([]);

  const [form, setForm] = useState<CreateRepairTicketPayload>({
    serviceType: "warranty",
    serviceLocation: "at_station",
    isUrgent: false,
    faultDescription: "",
    customerName: "",
    customerPhone: "",
  });

  // Phân công: "none" | "ktv" | "outsource"
  const [assignType, setAssignType] = useState<"none" | "ktv" | "outsource">("none");

  // Ảnh tiếp nhận
  const [intakeImages, setIntakeImages] = useState<string[]>([]);

  useEffect(() => {
    if (!token) return;
    fetchAdminUsers()
      .then(setUsers)
      .catch(() => {});
  }, [token]);

  if (!token) return null;

  const set = (field: keyof CreateRepairTicketPayload, value: unknown) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const created = await createAdminRepairTicket({
        ...form,
        intakeImages: intakeImages.length > 0 ? intakeImages : undefined,
      });
      router.push(`/admin/bao-hanh/${created.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Tạo phiếu thất bại");
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <header className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          ← Quay lại
        </Button>
        <h1 className="text-xl font-semibold text-zinc-900">Tạo phiếu bảo hành mới</h1>
      </header>

      {error && (
        <p className="rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Thông tin phiếu */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Thông tin phiếu</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Số phiếu hãng</Label>
              <Input
                value={form.ticketRefNumber ?? ""}
                onChange={(e) => set("ticketRefNumber", e.target.value || undefined)}
                placeholder="Nhập số phiếu của hãng (nếu có)"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Khu vực</Label>
              <Input
                value={form.area ?? ""}
                onChange={(e) => set("area", e.target.value || undefined)}
                placeholder="Khu vực"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Hình thức BH</Label>
              <Select
                value={form.serviceType}
                onValueChange={(v) => set("serviceType", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="warranty">Bảo hành</SelectItem>
                  <SelectItem value="warranty_repair">BH sửa chữa</SelectItem>
                  <SelectItem value="service">Sửa dịch vụ</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Loại bảo hành</Label>
              <Select
                value={form.serviceLocation}
                onValueChange={(v) => set("serviceLocation", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="at_station">Tại TTBH</SelectItem>
                  <SelectItem value="at_home">Tại Nhà</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2 md:col-span-2">
              <input
                id="isUrgent"
                type="checkbox"
                checked={form.isUrgent}
                onChange={(e) => set("isUrgent", e.target.checked)}
                className="h-4 w-4 rounded border-zinc-300"
              />
              <Label htmlFor="isUrgent" className="cursor-pointer">
                ⚡ Sửa gấp (Urgent)
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Thông tin sản phẩm */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Thông tin sản phẩm</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Sản phẩm</Label>
              <Input
                value={form.productName ?? ""}
                onChange={(e) => set("productName", e.target.value || undefined)}
                placeholder="Tên sản phẩm"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Nhà sản xuất</Label>
              <Input
                value={form.manufacturer ?? ""}
                onChange={(e) => set("manufacturer", e.target.value || undefined)}
                placeholder="VD: Midea, Daikin..."
              />
            </div>
            <div className="space-y-1.5">
              <Label>Model</Label>
              <Input
                value={form.modelName ?? ""}
                onChange={(e) => set("modelName", e.target.value || undefined)}
                placeholder="Tên model"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Số Serial</Label>
              <Input
                value={form.serialNumber ?? ""}
                onChange={(e) => set("serialNumber", e.target.value || undefined)}
                placeholder="Số serial"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Ngày mua</Label>
              <Input
                type="date"
                value={form.purchaseDate ?? ""}
                onChange={(e) => set("purchaseDate", e.target.value || undefined)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Nơi mua</Label>
              <Input
                value={form.purchasePlace ?? ""}
                onChange={(e) => set("purchasePlace", e.target.value || undefined)}
                placeholder="Nơi mua"
              />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label>
                Mô tả hư hỏng <span className="text-red-500">*</span>
              </Label>
              <Textarea
                required
                value={form.faultDescription}
                onChange={(e) => set("faultDescription", e.target.value)}
                placeholder="Mô tả chi tiết tình trạng hư hỏng"
                rows={3}
              />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label>Phụ kiện kèm theo</Label>
              <Input
                value={form.accessories ?? ""}
                onChange={(e) => set("accessories", e.target.value || undefined)}
                placeholder="VD: remote, dây nguồn, hộp đựng..."
              />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label>Ghi chú</Label>
              <Textarea
                value={form.note ?? ""}
                onChange={(e) => set("note", e.target.value || undefined)}
                placeholder="Ghi chú thêm"
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Thông tin khách hàng */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Thông tin khách hàng</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label>
                Tên khách hàng <span className="text-red-500">*</span>
              </Label>
              <Input
                required
                value={form.customerName}
                onChange={(e) => set("customerName", e.target.value)}
                placeholder="Họ và tên"
              />
            </div>
            <div className="space-y-1.5">
              <Label>
                Số điện thoại <span className="text-red-500">*</span>
              </Label>
              <Input
                required
                value={form.customerPhone}
                onChange={(e) => set("customerPhone", e.target.value)}
                placeholder="0909..."
              />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label>Địa chỉ</Label>
              <Input
                value={form.customerAddress ?? ""}
                onChange={(e) => set("customerAddress", e.target.value || undefined)}
                placeholder="Địa chỉ khách hàng"
              />
            </div>
          </CardContent>
        </Card>

        {/* Thông tin nhận */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Thông tin nhận máy</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Ngày hẹn giao</Label>
              <Input
                type="date"
                value={form.appointmentDate ?? ""}
                onChange={(e) => set("appointmentDate", e.target.value || undefined)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Người nhận</Label>
              <Input
                value={form.receivedBy ?? ""}
                onChange={(e) => set("receivedBy", e.target.value || undefined)}
                placeholder="Người tiếp nhận"
              />
            </div>

            {/* Phân công kỹ thuật */}
            <div className="md:col-span-2 space-y-3 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
              <p className="text-sm font-medium text-zinc-700">Phân công kỹ thuật</p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setAssignType("none"); set("technician", undefined); set("outsourcedTo", undefined); }}
                  className={`rounded-md px-3 py-1.5 text-sm border transition-colors ${assignType === "none" ? "bg-zinc-800 text-white border-zinc-800" : "bg-white text-zinc-600 border-zinc-300 hover:border-zinc-500"}`}
                >
                  Chưa phân công
                </button>
                <button
                  type="button"
                  onClick={() => { setAssignType("ktv"); set("outsourcedTo", undefined); }}
                  className={`rounded-md px-3 py-1.5 text-sm border transition-colors ${assignType === "ktv" ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-zinc-600 border-zinc-300 hover:border-zinc-500"}`}
                >
                  KTV nội bộ
                </button>
                <button
                  type="button"
                  onClick={() => { setAssignType("outsource"); set("technician", undefined); }}
                  className={`rounded-md px-3 py-1.5 text-sm border transition-colors ${assignType === "outsource" ? "bg-purple-600 text-white border-purple-600" : "bg-white text-zinc-600 border-zinc-300 hover:border-zinc-500"}`}
                >
                  Thợ ngoài
                </button>
              </div>

              {assignType === "ktv" && (
                <div className="space-y-1.5">
                  <Label>Chọn kỹ thuật viên</Label>
                  <Select
                    value={form.technician ?? "none"}
                    onValueChange={(v) => set("technician", v === "none" ? undefined : v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn kỹ thuật viên" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">— Chưa chọn —</SelectItem>
                      {users.map((u) => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.fullName} ({u.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {assignType === "outsource" && (
                <div className="space-y-1.5">
                  <Label>Tên thợ ngoài</Label>
                  <Input
                    value={form.outsourcedTo ?? ""}
                    onChange={(e) => set("outsourcedTo", e.target.value || undefined)}
                    placeholder="Nhập tên thợ / cửa hàng ngoài"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Ảnh tiếp nhận */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Ảnh tiếp nhận máy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-zinc-500">Ghi lại tình trạng máy khi nhận (tùy chọn)</p>
            <ImageUpload
              folder="tickets/intake"
              onUploadComplete={(files: UploadedFile[]) =>
                setIntakeImages((prev) => [...prev, ...files.map((f) => f.url)])
              }
            />
            {intakeImages.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {intakeImages.map((img, i) => (
                  <div key={img} className="relative group">
                    <a href={img} target="_blank" rel="noopener noreferrer">
                      <img
                        src={img}
                        alt=""
                        className="h-20 w-20 rounded-lg object-cover border border-zinc-200 hover:opacity-80 transition-opacity"
                      />
                    </a>
                    <button
                      type="button"
                      onClick={() => setIntakeImages((prev) => prev.filter((_, idx) => idx !== i))}
                      className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-red-500 text-white text-xs hidden group-hover:flex items-center justify-center leading-none"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" disabled={saving}>
            {saving ? "Đang tạo..." : "Tạo phiếu"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Hủy
          </Button>
        </div>
      </form>
    </div>
  );
}
