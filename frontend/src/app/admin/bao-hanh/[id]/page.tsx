"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
  fetchAdminRepairTicketById,
  updateAdminRepairTicket,
  deleteAdminRepairTicket,
  fetchAdminUsers,
  fetchTicketLogs,
  RepairTicket,
  RepairTicketStatus,
  STATUS_LABELS,
  STATUS_COLORS,
  SERVICE_TYPE_LABELS,
  SERVICE_LOCATION_LABELS,
  ALL_STATUSES,
  type AdminUser,
  type UpdateRepairTicketPayload,
  type TicketLog,
} from "@/services/repairTicket.service";

export default function AdminBaoHanhDetailPage() {
  const token = useAdminToken();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [ticket, setTicket] = useState<RepairTicket | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);

  // Editable fields
  const [status, setStatus] = useState<RepairTicketStatus>("new");
  const [serviceType, setServiceType] = useState("warranty");
  const [serviceLocation, setServiceLocation] = useState("at_station");
  const [isUrgent, setIsUrgent] = useState(false);
  const [technician, setTechnician] = useState<string>("none");
  const [outsourcedTo, setOutsourcedTo] = useState("");
  // "none" | "ktv" | "outsource" — xác định loại phân công đang chọn
  const [assignType, setAssignType] = useState<"none" | "ktv" | "outsource">("none");
  const [receivedBy, setReceivedBy] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [completedDate, setCompletedDate] = useState("");
  const [quotedPrice, setQuotedPrice] = useState("");
  const [internalNote, setInternalNote] = useState("");
  const [note, setNote] = useState("");
  const [faultDescription, setFaultDescription] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [productName, setProductName] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [modelName, setModelName] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [ticketRefNumber, setTicketRefNumber] = useState("");

  // Ảnh theo giai đoạn
  const [intakeImages, setIntakeImages] = useState<string[]>([]);
  const [faultImages, setFaultImages] = useState<string[]>([]);
  const [completedImages, setCompletedImages] = useState<string[]>([]);

  const [logs, setLogs] = useState<TicketLog[]>([]);

  useEffect(() => {
    if (!token || !id) return;
    setLoading(true);
    Promise.all([fetchAdminRepairTicketById(id), fetchAdminUsers()])
      .then(([t, u]) => {
        setTicket(t);
        setUsers(u);
        populateForm(t);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Không thể tải phiếu"))
      .finally(() => setLoading(false));
  }, [token, id]);

  useEffect(() => {
    if (!token || !id) return;
    fetchTicketLogs(id).then(setLogs).catch(() => {});
  }, [token, id]);

  if (!token) return null;

  function populateForm(t: RepairTicket) {
    setStatus(t.status);
    setServiceType(t.serviceType);
    setServiceLocation(t.serviceLocation);
    setIsUrgent(t.isUrgent);
    // Phân công
    if (t.technician?.id) {
      setAssignType("ktv");
      setTechnician(t.technician.id);
      setOutsourcedTo("");
    } else if (t.outsourcedTo) {
      setAssignType("outsource");
      setOutsourcedTo(t.outsourcedTo);
      setTechnician("none");
    } else {
      setAssignType("none");
      setTechnician("none");
      setOutsourcedTo("");
    }
    setReceivedBy(t.receivedBy ?? "");
    setAppointmentDate(t.appointmentDate ? t.appointmentDate.slice(0, 10) : "");
    setCompletedDate(t.completedDate ? t.completedDate.slice(0, 10) : "");
    setQuotedPrice(t.quotedPrice === undefined ? "" : String(t.quotedPrice));
    setInternalNote(t.internalNote ?? "");
    setNote(t.note ?? "");
    setFaultDescription(t.faultDescription);
    setCustomerName(t.customerName);
    setCustomerPhone(t.customerPhone);
    setCustomerAddress(t.customerAddress ?? "");
    setProductName(t.productName ?? "");
    setManufacturer(t.manufacturer ?? "");
    setModelName(t.modelName ?? "");
    setSerialNumber(t.serialNumber ?? "");
    setTicketRefNumber(t.ticketRefNumber ?? "");
    setIntakeImages(t.intakeImages ?? []);
    setFaultImages(t.faultImages ?? []);
    setCompletedImages(t.completedImages ?? []);
  }

  const handleSave = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const payload: UpdateRepairTicketPayload = {
        status,
        serviceType: serviceType as any,
        serviceLocation: serviceLocation as any,
        isUrgent,
        technician: assignType === "ktv" && technician !== "none" ? technician : null,
        outsourcedTo: assignType === "outsource" && outsourcedTo ? outsourcedTo : null,
        receivedBy: receivedBy || undefined,
        appointmentDate: appointmentDate || undefined,
        completedDate: completedDate || undefined,
        quotedPrice: quotedPrice ? Number(quotedPrice) : undefined,
        internalNote: internalNote || undefined,
        note: note || undefined,
        faultDescription: faultDescription || undefined,
        customerName: customerName || undefined,
        customerPhone: customerPhone || undefined,
        customerAddress: customerAddress || undefined,
        productName: productName || undefined,
        manufacturer: manufacturer || undefined,
        modelName: modelName || undefined,
        serialNumber: serialNumber || undefined,
        ticketRefNumber: ticketRefNumber || undefined,
        intakeImages,
        faultImages,
        completedImages,
      };
      const updated = await updateAdminRepairTicket(id, payload);
      setTicket(updated);
      populateForm(updated);
      setSuccess("Đã lưu thay đổi");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lưu thất bại");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Bạn có chắc muốn xóa phiếu này?")) return;
    setDeleting(true);
    try {
      await deleteAdminRepairTicket(id);
      router.push("/admin/bao-hanh");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Xóa thất bại");
      setDeleting(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-muted-foreground py-8 text-center">Đang tải...</p>;
  }

  if (!ticket) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-destructive">{error || "Không tìm thấy phiếu"}</p>
        <Button variant="outline" onClick={() => router.back()}>← Quay lại</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            ← Quay lại
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-mono text-lg font-bold text-zinc-900">{ticket.ticketNumber}</h1>
              {ticket.isUrgent && <span className="text-sm text-red-600 font-semibold">⚡ Gấp</span>}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[ticket.status]}`}>
                {STATUS_LABELS[ticket.status]}
              </span>
              <span className="text-xs text-zinc-500">
                {SERVICE_TYPE_LABELS[ticket.serviceType]} • {SERVICE_LOCATION_LABELS[ticket.serviceLocation]}
              </span>
              {ticket.tatLabel && ticket.tatLabel !== "—" && (
                <span className={`text-xs font-medium ${(ticket.tatMinutes ?? 0) > 4320 ? "text-red-600" : "text-zinc-500"}`}>
                  ⏱ {ticket.tatLabel}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => globalThis.open(`/bao-hanh/in/${id}`, "_blank")}
          >
            In biên nhận
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleting}>
            {deleting ? "Đang xóa..." : "Xóa phiếu"}
          </Button>
        </div>
      </header>

      {error && (
        <p className="rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}
      {success && (
        <p className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
          {success}
        </p>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Trạng thái & điều phối */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Trạng thái & Điều phối</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Trạng thái</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as RepairTicketStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ALL_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Phân công kỹ thuật */}
            <div className="md:col-span-2 space-y-3 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
              <p className="text-sm font-medium text-zinc-700">Phân công kỹ thuật</p>
              <div className="flex gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={() => { setAssignType("none"); setTechnician("none"); setOutsourcedTo(""); }}
                  className={`rounded-md px-3 py-1.5 text-sm border transition-colors ${assignType === "none" ? "bg-zinc-800 text-white border-zinc-800" : "bg-white text-zinc-600 border-zinc-300 hover:border-zinc-500"}`}
                >
                  Chưa phân công
                </button>
                <button
                  type="button"
                  onClick={() => { setAssignType("ktv"); setOutsourcedTo(""); }}
                  className={`rounded-md px-3 py-1.5 text-sm border transition-colors ${assignType === "ktv" ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-zinc-600 border-zinc-300 hover:border-zinc-500"}`}
                >
                  KTV nội bộ
                </button>
                <button
                  type="button"
                  onClick={() => { setAssignType("outsource"); setTechnician("none"); }}
                  className={`rounded-md px-3 py-1.5 text-sm border transition-colors ${assignType === "outsource" ? "bg-purple-600 text-white border-purple-600" : "bg-white text-zinc-600 border-zinc-300 hover:border-zinc-500"}`}
                >
                  Thợ ngoài
                </button>
              </div>

              {assignType === "ktv" && (
                <div className="space-y-1.5">
                  <Label>Kỹ thuật viên nội bộ</Label>
                  <Select value={technician} onValueChange={setTechnician}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn KTV" />
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
                    value={outsourcedTo}
                    onChange={(e) => setOutsourcedTo(e.target.value)}
                    placeholder="Nhập tên thợ / cửa hàng ngoài"
                  />
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>Hình thức BH</Label>
              <Select value={serviceType} onValueChange={setServiceType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="warranty">Bảo hành</SelectItem>
                  <SelectItem value="warranty_repair">BH sửa chữa</SelectItem>
                  <SelectItem value="service">Sửa dịch vụ</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Loại bảo hành</Label>
              <Select value={serviceLocation} onValueChange={setServiceLocation}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="at_station">Tại TTBH</SelectItem>
                  <SelectItem value="at_home">Tại Nhà</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="isUrgentEdit"
                type="checkbox"
                checked={isUrgent}
                onChange={(e) => setIsUrgent(e.target.checked)}
                className="h-4 w-4 rounded border-zinc-300"
              />
              <Label htmlFor="isUrgentEdit" className="cursor-pointer">⚡ Sửa gấp</Label>
            </div>

            <div className="space-y-1.5">
              <Label>Chi phí báo giá (₫)</Label>
              <Input
                type="number"
                value={quotedPrice}
                onChange={(e) => setQuotedPrice(e.target.value)}
                placeholder="0"
                min={0}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Ngày hẹn giao</Label>
              <Input type="date" value={appointmentDate} onChange={(e) => setAppointmentDate(e.target.value)} />
            </div>

            <div className="space-y-1.5">
              <Label>Ngày hoàn thành</Label>
              <Input type="date" value={completedDate} onChange={(e) => setCompletedDate(e.target.value)} />
            </div>

            <div className="space-y-1.5">
              <Label>Người nhận</Label>
              <Input value={receivedBy} onChange={(e) => setReceivedBy(e.target.value)} placeholder="Người tiếp nhận" />
            </div>

            <div className="space-y-1.5">
              <Label>Số phiếu hãng</Label>
              <Input value={ticketRefNumber} onChange={(e) => setTicketRefNumber(e.target.value)} placeholder="Số phiếu của hãng" />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <Label>Ghi chú nội bộ</Label>
              <Textarea
                value={internalNote}
                onChange={(e) => setInternalNote(e.target.value)}
                placeholder="Ghi chú nội bộ (chỉ admin thấy)"
                rows={3}
              />
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
              <Input value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="Tên sản phẩm" />
            </div>
            <div className="space-y-1.5">
              <Label>Nhà sản xuất</Label>
              <Input value={manufacturer} onChange={(e) => setManufacturer(e.target.value)} placeholder="Nhà sản xuất" />
            </div>
            <div className="space-y-1.5">
              <Label>Model</Label>
              <Input value={modelName} onChange={(e) => setModelName(e.target.value)} placeholder="Model" />
            </div>
            <div className="space-y-1.5">
              <Label>Số Serial</Label>
              <Input value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} placeholder="Serial" />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label>Mô tả hư hỏng</Label>
              <Textarea
                value={faultDescription}
                onChange={(e) => setFaultDescription(e.target.value)}
                rows={3}
                placeholder="Mô tả tình trạng hư hỏng"
              />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label>Ghi chú</Label>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                placeholder="Ghi chú thêm"
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
              <Label>Tên khách hàng</Label>
              <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Họ và tên" />
            </div>
            <div className="space-y-1.5">
              <Label>Số điện thoại</Label>
              <Input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="SĐT" />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label>Địa chỉ</Label>
              <Input value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} placeholder="Địa chỉ" />
            </div>
          </CardContent>
        </Card>

        {/* Hình ảnh theo giai đoạn */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Hình ảnh</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Ảnh tiếp nhận */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-zinc-700">📥 Ảnh tiếp nhận</p>
              <p className="text-xs text-zinc-500">Ghi lại tình trạng máy khi nhận</p>
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
                        <img src={img} alt="" className="h-20 w-20 rounded-lg object-cover border border-zinc-200 hover:opacity-80 transition-opacity" />
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
            </div>

            {/* Ảnh hư hỏng / báo giá */}
            <div className="space-y-2 border-t pt-4">
              <p className="text-sm font-medium text-zinc-700">🔍 Ảnh hư hỏng / báo giá</p>
              <p className="text-xs text-zinc-500">Linh kiện hỏng, bo mạch cháy, minh chứng báo giá</p>
              <ImageUpload
                folder="tickets/fault"
                onUploadComplete={(files: UploadedFile[]) =>
                  setFaultImages((prev) => [...prev, ...files.map((f) => f.url)])
                }
              />
              {faultImages.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {faultImages.map((img, i) => (
                    <div key={img} className="relative group">
                      <a href={img} target="_blank" rel="noopener noreferrer">
                        <img src={img} alt="" className="h-20 w-20 rounded-lg object-cover border border-zinc-200 hover:opacity-80 transition-opacity" />
                      </a>
                      <button
                        type="button"
                        onClick={() => setFaultImages((prev) => prev.filter((_, idx) => idx !== i))}
                        className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-red-500 text-white text-xs hidden group-hover:flex items-center justify-center leading-none"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Ảnh sửa xong */}
            <div className="space-y-2 border-t pt-4">
              <p className="text-sm font-medium text-zinc-700">✅ Ảnh sửa xong</p>
              <p className="text-xs text-zinc-500">Máy sau khi hoàn thành sửa chữa</p>
              <ImageUpload
                folder="tickets/completed"
                onUploadComplete={(files: UploadedFile[]) =>
                  setCompletedImages((prev) => [...prev, ...files.map((f) => f.url)])
                }
              />
              {completedImages.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {completedImages.map((img, i) => (
                    <div key={img} className="relative group">
                      <a href={img} target="_blank" rel="noopener noreferrer">
                        <img src={img} alt="" className="h-20 w-20 rounded-lg object-cover border border-zinc-200 hover:opacity-80 transition-opacity" />
                      </a>
                      <button
                        type="button"
                        onClick={() => setCompletedImages((prev) => prev.filter((_, idx) => idx !== i))}
                        className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-red-500 text-white text-xs hidden group-hover:flex items-center justify-center leading-none"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Meta info */}
        <Card>
          <CardContent className="pt-4 grid grid-cols-2 gap-3 text-xs text-zinc-500 md:grid-cols-4">
            <div>
              <div className="font-medium text-zinc-700">Ngày tạo</div>
              <div>{new Date(ticket.createdAt).toLocaleString("vi-VN")}</div>
            </div>
            <div>
              <div className="font-medium text-zinc-700">Cập nhật</div>
              <div>{new Date(ticket.updatedAt).toLocaleString("vi-VN")}</div>
            </div>
            <div>
              <div className="font-medium text-zinc-700">Ngày nhận</div>
              <div>{ticket.receivedDate ? new Date(ticket.receivedDate).toLocaleDateString("vi-VN") : "—"}</div>
            </div>
            <div>
              <div className="font-medium text-zinc-700">Phiếu hãng</div>
              <div>{ticket.ticketRefNumber || "—"}</div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" disabled={saving}>
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
          <Button type="button" variant="outline" onClick={() => populateForm(ticket)}>
            Hoàn tác
          </Button>
        </div>
      </form>

      {/* Lịch sử thay đổi */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Lịch sử thay đổi</CardTitle>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <p className="text-xs text-zinc-400">Chưa có lịch sử</p>
          ) : (
            <ol className="relative border-l border-zinc-200 space-y-4 ml-2">
              {logs.map((log) => (
                <li key={log._id} className="ml-4">
                  <div className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border border-zinc-300 bg-white" />
                  <p className="text-xs text-zinc-500">
                    {new Date(log.createdAt).toLocaleString("vi-VN")}
                    {log.userName ? ` · ${log.userName}` : ""}
                  </p>
                  <p className="text-sm text-zinc-800">{log.action}</p>
                </li>
              ))}
            </ol>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
