"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
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
  fetchAdminLeadDetail,
  updateAdminLeadStatus,
  type Lead,
  type LeadStatus,
} from "@/services/lead.service";

const statusOptions: { value: LeadStatus; label: string }[] = [
  { value: "new", label: "Mới" },
  { value: "contacted", label: "Đã liên hệ" },
  { value: "qualified", label: "Tiềm năng" },
  { value: "closed", label: "Đã đóng" },
  { value: "spam", label: "Spam" },
];

export default function AdminLeadDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const token = useAdminToken();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [lead, setLead] = useState<Lead | null>(null);

  const [status, setStatus] = useState<LeadStatus>("new");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!token || !id) return;
    fetchAdminLeadDetail(id)
      .then((res) => {
        setLead(res);
        setStatus(res.status);
        setNote(res.note || "");
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Không thể tải lead"))
      .finally(() => setLoading(false));
  }, [id, token]);

  const onSave = async () => {
    if (!token || !id) return;
    setSaving(true);
    setError("");
    try {
      const updated = await updateAdminLeadStatus(id, { status, note: note || undefined });
      setLead(updated);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Cập nhật lead thất bại");
    } finally {
      setSaving(false);
    }
  };

  if (!token) return null;

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/leads">Quay lại</Link>
          </Button>
          <h1 className="text-xl font-semibold text-zinc-900">Chi tiết lead</h1>
        </div>
        <Button onClick={onSave} disabled={saving || loading}>
          {saving ? "Đang lưu..." : "Lưu thay đổi"}
        </Button>
      </header>

      {error && (
        <p className="rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">Đang tải...</p>
      ) : !lead ? (
        <p className="text-sm text-muted-foreground">Không tìm thấy lead.</p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Thông tin khách</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-zinc-700">
              <div>
                <span className="text-zinc-500">Họ tên:</span>{" "}
                <span className="font-medium text-zinc-900">{lead.fullName}</span>
              </div>
              <div>
                <span className="text-zinc-500">Điện thoại:</span>{" "}
                <span className="font-medium text-zinc-900">{lead.phone}</span>
              </div>
              {lead.email && (
                <div>
                  <span className="text-zinc-500">Email:</span>{" "}
                  <span className="font-medium text-zinc-900">{lead.email}</span>
                </div>
              )}
              {lead.sourcePage && (
                <div className="truncate">
                  <span className="text-zinc-500">Nguồn:</span>{" "}
                  <span className="font-medium text-zinc-900">{lead.sourcePage}</span>
                </div>
              )}
              {lead.message && (
                <div>
                  <span className="text-zinc-500">Nội dung:</span>
                  <div className="mt-1 whitespace-pre-wrap rounded-lg border border-zinc-200 bg-zinc-50 p-2 text-sm text-zinc-800">
                    {lead.message}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Xử lý lead</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Trạng thái</label>
                <Select value={status} onValueChange={(v) => setStatus(v as LeadStatus)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Ghi chú</label>
                <Textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ví dụ: Đã gọi tư vấn lúc 10:30"
                  rows={6}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

