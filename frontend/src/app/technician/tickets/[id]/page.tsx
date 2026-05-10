"use client";
import { useState, useEffect, Fragment, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  fetchMyTicketById,
  updateMyTicketStatus,
  updateMyTicketImages,
  fetchMyTicketLogs,
  type KtvTicket,
  type TicketLogEntry
} from "@/services/ktv.service";
import {
  STATUS_LABELS,
  STATUS_COLORS,
  ALL_STATUSES,
  SERVICE_TYPE_LABELS,
  SERVICE_LOCATION_LABELS,
  type RepairTicketStatus
} from "@/services/repairTicket.service";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUpload } from "@/components/upload/ImageUpload";
import type { UploadedFile } from "@/services/upload.service";

const MAIN_FLOW: RepairTicketStatus[] = [
  "new", "assigned", "quoted", "pending_confirm", "repaired", "delivered"
];

const STATUS_TRANSITIONS: Partial<Record<RepairTicketStatus, RepairTicketStatus[]>> = {
  new: ["assigned"],
  assigned: ["quoted", "waiting_parts", "repaired", "outsourced"],
  quoted: ["pending_confirm"],
  pending_confirm: ["repaired", "waiting_parts", "customer_rejected"],
  waiting_parts: ["parts_ready"],
  parts_ready: ["repaired"],
  customer_rejected: ["returned"],
  repaired: ["delivered"],
};

const BRANCH_NOTES: Partial<Record<RepairTicketStatus, string>> = {
  assigned: "Nhánh: Chờ Linh Kiện → Đã Có Linh Kiện → Sửa Xong",
  pending_confirm: "Nhánh: Chờ LK → Đã Có LK → Sửa Xong | Hỏng Trả Lại → Trả Lại",
};

const STATUS_IMAGE_LABELS: Partial<Record<RepairTicketStatus, string>> = {
  new: "Ảnh tiếp nhận ban đầu",
  assigned: "Ảnh KTV tiếp nhận",
  quoted: "Ảnh báo giá",
  pending_confirm: "Ảnh chờ xác nhận",
  waiting_parts: "Ảnh chờ linh kiện",
  parts_ready: "Ảnh đã có linh kiện",
  repaired: "Ảnh sửa xong",
  customer_rejected: "Ảnh hỏng khách trả lại",
  returned: "Ảnh đã trả lại",
  delivered: "Ảnh đã giao khách",
  outsourced: "Ảnh giao thợ ngoài",
  cancelled: "Ảnh hủy phiếu",
};

function formatDate(d?: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
}

function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="flex gap-2">
      <span className="text-gray-500 min-w-36 shrink-0">{label}:</span>
      <span className="text-gray-800">{value || "—"}</span>
    </div>
  );
}

export default function MyTicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [ticket, setTicket] = useState<KtvTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [newStatus, setNewStatus] = useState<RepairTicketStatus>("new");
  const [internalNote, setInternalNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  const [statusImages, setStatusImages] = useState<Record<string, string[]>>({});
  const [localImages, setLocalImages] = useState<string[]>([]);
  const [savingImages, setSavingImages] = useState(false);
  const [saveImgMsg, setSaveImgMsg] = useState("");

  const [logs, setLogs] = useState<TicketLogEntry[]>([]);
  const [lightboxImages, setLightboxImages] = useState<string[] | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchMyTicketById(id)
      .then((data) => {
        setTicket(data);
        setNewStatus(data.status);
        setInternalNote(data.internalNote || "");
        const si = data.statusImages ?? {};
        setStatusImages(si);
        setLocalImages(si[data.status] ?? []);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Lỗi tải phiếu");
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id) return;
    fetchMyTicketLogs(id).then(setLogs).catch(() => {});
  }, [id]);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!ticket) return;
    setSaving(true);
    setSaveMsg("");
    try {
      const updated = await updateMyTicketStatus(ticket.id, { status: newStatus, internalNote });
      setTicket(updated);
      setNewStatus(updated.status);
      setInternalNote(updated.internalNote || "");
      const si = updated.statusImages ?? {};
      setStatusImages(si);
      setLocalImages(si[updated.status] ?? []);
      setSaveMsg("✓ Cập nhật thành công");
      fetchMyTicketLogs(id).then(setLogs).catch(() => {});
      setTimeout(() => setSaveMsg(""), 3000);
    } catch (err: unknown) {
      setSaveMsg(err instanceof Error ? `Lỗi: ${err.message}` : "Lỗi cập nhật");
    } finally {
      setSaving(false);
    }
  }

  function removeLocalImage(idx: number) {
    setLocalImages((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleSaveImages() {
    if (!ticket) return;
    setSavingImages(true);
    setSaveImgMsg("");
    try {
      const updated = await updateMyTicketImages(ticket.id, ticket.status, localImages);
      setTicket(updated);
      const si = updated.statusImages ?? {};
      setStatusImages(si);
      setLocalImages(si[updated.status] ?? []);
      setSaveImgMsg("✓ Lưu ảnh thành công");
      fetchMyTicketLogs(id).then(setLogs).catch(() => {});
      setTimeout(() => setSaveImgMsg(""), 3000);
    } catch (err: unknown) {
      setSaveImgMsg(err instanceof Error ? `Lỗi: ${err.message}` : "Lỗi lưu ảnh");
    } finally {
      setSavingImages(false);
    }
  }

  if (loading) {
    return <div className="text-center py-20 text-gray-400">Đang tải...</div>;
  }
  if (error || !ticket) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500 mb-4">{error || "Không tìm thấy phiếu"}</p>
        <Button variant="outline" onClick={() => router.back()}>Quay lại</Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/technician/tickets">
          <Button variant="ghost" size="sm">← Quay lại</Button>
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            Phiếu {ticket.ticketNumber}
            {ticket.isUrgent && <span className="ml-2 text-sm text-red-600">⚡ Gấp</span>}
          </h1>
          {ticket.ticketRefNumber && (
            <p className="text-sm text-gray-500">Ref: {ticket.ticketRefNumber}</p>
          )}
        </div>
        <Badge className={`ml-auto ${STATUS_COLORS[ticket.status]}`}>
          {STATUS_LABELS[ticket.status]}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Thông tin khách hàng */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
              Khách hàng
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5 text-sm">
            <InfoRow label="Họ tên" value={ticket.customerName} />
            <InfoRow label="Điện thoại" value={ticket.customerPhone} />
            <InfoRow label="Địa chỉ" value={ticket.customerAddress} />
          </CardContent>
        </Card>

        {/* Thông tin dịch vụ */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
              Dịch vụ
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5 text-sm">
            <InfoRow
              label="Loại dịch vụ"
              value={SERVICE_TYPE_LABELS[ticket.serviceType as keyof typeof SERVICE_TYPE_LABELS] || ticket.serviceType}
            />
            <InfoRow
              label="Hình thức"
              value={SERVICE_LOCATION_LABELS[ticket.serviceLocation as keyof typeof SERVICE_LOCATION_LABELS] || ticket.serviceLocation}
            />
            <InfoRow label="Ngày nhận" value={formatDate(ticket.receivedDate)} />
            <InfoRow label="Nhận bởi" value={ticket.receivedBy} />
            <InfoRow label="Ngày hẹn" value={formatDate(ticket.appointmentDate)} />
            <InfoRow label="Ngày hoàn thành" value={formatDate(ticket.completedDate)} />
          </CardContent>
        </Card>

        {/* Thông tin sản phẩm */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
              Sản phẩm
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5 text-sm">
            <InfoRow label="Tên sản phẩm" value={ticket.productName} />
            <InfoRow label="Hãng" value={ticket.manufacturer} />
            <InfoRow label="Model" value={ticket.modelName} />
            <InfoRow label="Số serial" value={ticket.serialNumber} />
            <InfoRow label="Ngày mua" value={formatDate(ticket.purchaseDate)} />
            <InfoRow label="Nơi mua" value={ticket.purchasePlace} />
            <InfoRow label="Phụ kiện kèm" value={ticket.accessories} />
          </CardContent>
        </Card>

        {/* Mô tả lỗi */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
              Mô tả lỗi
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <p className="text-gray-800 whitespace-pre-wrap">{ticket.faultDescription || "—"}</p>
            {ticket.note && (
              <div className="mt-3">
                <p className="text-gray-500 mb-1">Ghi chú:</p>
                <p className="text-gray-700 whitespace-pre-wrap">{ticket.note}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Hình ảnh tiếp nhận (read-only) */}
      {ticket.intakeImages && ticket.intakeImages.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
              Ảnh tiếp nhận
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {ticket.intakeImages.map((url) => (
                <a key={url} href={url} target="_blank" rel="noopener noreferrer">
                  <img
                    src={url}
                    alt="Ảnh tiếp nhận"
                    className="h-24 w-24 object-cover rounded-md border border-gray-200 hover:opacity-80"
                  />
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hình ảnh lỗi (read-only) */}
      {ticket.faultImages && ticket.faultImages.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
              Ảnh lỗi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {ticket.faultImages.map((url) => (
                <a key={url} href={url} target="_blank" rel="noopener noreferrer">
                  <img
                    src={url}
                    alt="Ảnh lỗi"
                    className="h-24 w-24 object-cover rounded-md border border-gray-200 hover:opacity-80"
                  />
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ảnh KTV upload theo trạng thái hiện tại */}
      <Card className="border-green-200 bg-green-50/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-green-700 uppercase tracking-wide">
            {STATUS_IMAGE_LABELS[ticket.status] ?? `Ảnh trạng thái: ${STATUS_LABELS[ticket.status]}`}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {localImages.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-2">
              {localImages.map((url, i) => (
                <div key={url} className="relative group">
                  <a href={url} target="_blank" rel="noopener noreferrer">
                    <img
                      src={url}
                      alt="Ảnh"
                      className="h-24 w-24 object-cover rounded-md border border-green-200 hover:opacity-80"
                    />
                  </a>
                  <button
                    type="button"
                    onClick={() => removeLocalImage(i)}
                    className="absolute -top-2 -right-2 hidden group-hover:flex bg-red-500 text-white rounded-full w-5 h-5 items-center justify-center text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="space-y-1.5">
            <p className="text-xs text-gray-500">
              Bấm vào ô bên dưới để chọn <strong>nhiều ảnh cùng lúc</strong> (giữ Ctrl/Shift để chọn nhiều file).
              Có thể bấm thêm nhiều lần để bổ sung ảnh. Sau khi chọn xong nhấn <strong>&ldquo;Lưu ảnh&rdquo;</strong>.
            </p>
            <ImageUpload
              folder="tickets/completed"
              onUploadComplete={(files: UploadedFile[]) => {
                setLocalImages((prev) => [...prev, ...files.map((f) => f.url)]);
              }}
            />
          </div>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleSaveImages}
              disabled={savingImages}
              className="border-green-400 text-green-700 hover:bg-green-50"
            >
              {savingImages ? "Đang lưu..." : "Lưu ảnh"}
            </Button>
            {saveImgMsg && (
              <span className={`text-sm ${saveImgMsg.startsWith("Lỗi") ? "text-red-600" : "text-green-600"}`}>
                {saveImgMsg}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Ảnh các giai đoạn đã qua (read-only) */}
      {ALL_STATUSES.filter((s) => s !== ticket.status && (statusImages[s]?.length ?? 0) > 0).map((s) => (
        <Card key={s}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
              {STATUS_IMAGE_LABELS[s] ?? `Ảnh ${STATUS_LABELS[s]}`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {statusImages[s].map((url) => (
                <a key={url} href={url} target="_blank" rel="noopener noreferrer">
                  <img
                    src={url}
                    alt={STATUS_IMAGE_LABELS[s] ?? STATUS_LABELS[s]}
                    className="h-24 w-24 object-cover rounded-md border border-gray-200 hover:opacity-80"
                  />
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Cập nhật trạng thái */}
      <Card className="border-blue-200 bg-blue-50/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-blue-700 uppercase tracking-wide">
            Cập nhật tiến độ
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Hướng dẫn luồng trạng thái */}
          <div className="mb-5 space-y-3">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Luồng quy trình chính</p>
            <div className="overflow-x-auto pb-1">
              <div className="flex items-center gap-1 min-w-max">
                {MAIN_FLOW.map((s, idx) => (
                  <Fragment key={s}>
                    <span
                      className={`px-2.5 py-1 text-xs rounded-full border font-medium ${
                        ticket.status === s
                          ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                          : "bg-gray-100 text-gray-500 border-gray-200"
                      }`}
                    >
                      {STATUS_LABELS[s]}
                    </span>
                    {idx < MAIN_FLOW.length - 1 && (
                      <span className="text-gray-300 text-sm">→</span>
                    )}
                  </Fragment>
                ))}
              </div>
            </div>
            {BRANCH_NOTES[ticket.status] && (
              <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded px-2.5 py-1.5">
                ⤷ {BRANCH_NOTES[ticket.status]}
              </p>
            )}
            {STATUS_TRANSITIONS[ticket.status] && STATUS_TRANSITIONS[ticket.status]!.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-gray-500 shrink-0">Gợi ý chuyển sang:</span>
                {STATUS_TRANSITIONS[ticket.status]!.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setNewStatus(s)}
                    className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                      newStatus === s
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-blue-700 border-blue-200 hover:bg-blue-50"
                    }`}
                  >
                    {STATUS_LABELS[s]}
                  </button>
                ))}
              </div>
            )}
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Trạng thái</Label>
              <Select value={newStatus} onValueChange={(v) => setNewStatus(v as RepairTicketStatus)}>
                <SelectTrigger className="w-64">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ALL_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Ghi chú nội bộ (chỉ KTV thấy)</Label>
              <Textarea
                value={internalNote}
                onChange={(e) => setInternalNote(e.target.value)}
                placeholder="Nhập ghi chú kỹ thuật, tình trạng sửa chữa..."
                rows={4}
                className="bg-white"
              />
            </div>

            <div className="flex items-center gap-3">
              <Button type="submit" disabled={saving}>
                {saving ? "Đang lưu..." : "Lưu cập nhật"}
              </Button>
              {saveMsg && (
                <span
                  className={`text-sm ${saveMsg.startsWith("Lỗi") ? "text-red-600" : "text-green-600"}`}
                >
                  {saveMsg}
                </span>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Lịch sử thay đổi */}
      {logs.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
              Lịch sử thay đổi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="relative border-l border-gray-200 space-y-4 ml-2">
              {logs.map((log) => {
                const imgs = log.metadata?.images;
                const hasImages = imgs && imgs.length > 0;
                return (
                  <li key={log._id} className="ml-4">
                    <div className="absolute -left-1.5 mt-1 w-3 h-3 rounded-full border border-white bg-blue-400" />
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm text-gray-800">{log.action}</p>
                      {hasImages && (
                        <button
                          type="button"
                          onClick={() => setLightboxImages(imgs)}
                          className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded border border-blue-300 text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                          Xem ảnh ({imgs.length})
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">
                      {log.userName ? `${log.userName} · ` : ""}
                      {new Date(log.createdAt).toLocaleString("vi-VN")}
                    </p>
                  </li>
                );
              })}
            </ol>
          </CardContent>
        </Card>
      )}

      {/* Lightbox modal */}
      {lightboxImages && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Đóng"
            className="absolute inset-0 w-full h-full bg-black/75 cursor-default"
            onClick={() => setLightboxImages(null)}
          />
          {/* Content */}
          <div className="relative z-10 flex items-center justify-center h-full p-4 pointer-events-none">
            <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col pointer-events-auto">
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <span className="text-sm font-semibold text-gray-700">Xem ảnh ({lightboxImages.length})</span>
                <button
                  type="button"
                  onClick={() => setLightboxImages(null)}
                  className="text-gray-400 hover:text-gray-700 text-xl leading-none"
                  aria-label="Đóng"
                >
                  ×
                </button>
              </div>
              <div className="overflow-y-auto p-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {lightboxImages.map((url, i) => (
                    <a key={`${url}-${i}`} href={url} target="_blank" rel="noopener noreferrer" className="block">
                      <img
                        src={url}
                        alt={`Ảnh ${i + 1}`}
                        className="w-full aspect-square object-cover rounded-lg border border-gray-200 hover:opacity-90 transition-opacity"
                      />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
