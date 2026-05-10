"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  fetchAdminRepairTickets,
  exportRepairTicketsCsv,
  RepairTicket,
  RepairTicketStatus,
  STATUS_LABELS,
  STATUS_COLORS,
  SERVICE_TYPE_LABELS,
  ALL_STATUSES,
  type PaginatedRepairTickets
} from "@/services/repairTicket.service";

const PAGE_SIZE = 30;

export default function AdminBaoHanhPage() {
  const token = useAdminToken();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<PaginatedRepairTickets | null>(null);
  const [exporting, setExporting] = useState(false);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<RepairTicketStatus | "all">("all");
  const [page, setPage] = useState(1);

  const query = useMemo(() => {
    const q: { page: number; limit: number; search?: string; status?: string } = {
      page,
      limit: PAGE_SIZE,
    };
    if (search.trim()) q.search = search.trim();
    if (status !== "all") q.status = status;
    return q;
  }, [search, status, page]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetchAdminRepairTickets(query);
      setData(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không thể tải danh sách");
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    if (!token) return;
    load();
  }, [token, load]);

  // Debounce search
  useEffect(() => {
    if (!token) return;
    setPage(1);
  }, [search, status]);

  if (!token) return null;

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const statusCounts = data?.statusCounts ?? {};
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">Phiếu Bảo Hành</h1>
          <p className="text-sm text-zinc-500">{total} phiếu</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={exporting}
            onClick={async () => {
              setExporting(true);
              try { await exportRepairTicketsCsv({ status: status === "all" ? undefined : status, search: search || undefined }); }
              catch { /* ignore */ }
              finally { setExporting(false); }
            }}
          >
            {exporting ? "Đang xuất..." : "Xuất CSV"}
          </Button>
          <Button asChild>
            <Link href="/admin/bao-hanh/new">+ Tạo phiếu mới</Link>
          </Button>
        </div>
      </header>

      {error && (
        <p className="rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      {/* Status count strip */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => { setStatus("all"); setPage(1); }}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            status === "all"
              ? "bg-zinc-800 text-white"
              : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
          }`}
        >
          Tất cả ({total})
        </button>
        {ALL_STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => { setStatus(s); setPage(1); }}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              status === s
                ? "bg-zinc-800 text-white"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            }`}
          >
            {STATUS_LABELS[s]} ({statusCounts[s] ?? 0})
          </button>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="flex flex-col gap-3 pt-4 md:flex-row md:items-center">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo số phiếu / tên KH / SĐT / sản phẩm"
            className="md:max-w-sm"
          />
          <Select value={status} onValueChange={(v) => { setStatus(v as RepairTicketStatus | "all"); setPage(1); }}>
            <SelectTrigger className="w-full md:w-56">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              {ALL_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type="button" variant="secondary" onClick={load} disabled={loading}>
            {loading ? "Đang tải..." : "Tải lại"}
          </Button>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Danh sách phiếu</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground py-4 text-center">Đang tải...</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">Chưa có phiếu nào.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs text-zinc-500">
                    <th className="pb-2 pr-4 font-medium">Số phiếu</th>
                    <th className="pb-2 pr-4 font-medium">Khách hàng</th>
                    <th className="pb-2 pr-4 font-medium">Sản phẩm</th>
                    <th className="pb-2 pr-4 font-medium">HT BH</th>
                    <th className="pb-2 pr-4 font-medium">Kỹ thuật viên</th>
                    <th className="pb-2 pr-4 font-medium">Ngày nhận</th>
                    <th className="pb-2 pr-4 font-medium">Thời gian tồn</th>
                    <th className="pb-2 pr-4 font-medium">Trạng thái</th>
                    <th className="pb-2 font-medium"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {items.map((ticket) => (
                    <TicketRow key={ticket.id} ticket={ticket} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Trước
          </Button>
          <span className="text-sm text-zinc-600">
            Trang {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Sau
          </Button>
        </div>
      )}
    </div>
  );
}

function TicketRow({ ticket }: { ticket: RepairTicket }) {
  const receivedDate = ticket.receivedDate
    ? new Date(ticket.receivedDate).toLocaleDateString("vi-VN")
    : "—";

  const isOverdue = (ticket.tatMinutes ?? 0) > 3 * 24 * 60; // > 3 ngày

  return (
    <tr className="hover:bg-zinc-50 transition-colors">
      <td className="py-2 pr-4">
        <div className="font-mono text-xs font-medium text-zinc-900">{ticket.ticketNumber}</div>
        {ticket.isUrgent && (
          <span className="text-[10px] font-semibold text-red-600">⚡ Gấp</span>
        )}
      </td>
      <td className="py-2 pr-4">
        <div className="font-medium text-zinc-900">{ticket.customerName}</div>
        <div className="text-xs text-zinc-500">{ticket.customerPhone}</div>
      </td>
      <td className="py-2 pr-4">
        <div className="text-zinc-800">{ticket.productName || "—"}</div>
        {ticket.modelName && (
          <div className="text-xs text-zinc-500">{ticket.modelName}</div>
        )}
      </td>
      <td className="py-2 pr-4">
        <span className="text-xs text-zinc-600">
          {SERVICE_TYPE_LABELS[ticket.serviceType]}
        </span>
      </td>
      <td className="py-2 pr-4">
        <span className="text-xs text-zinc-600">
          {ticket.technician ? ticket.technician.fullName : "—"}
        </span>
      </td>
      <td className="py-2 pr-4 text-xs text-zinc-500">{receivedDate}</td>
      <td className="py-2 pr-4">
        <span className={`text-xs font-medium ${isOverdue ? "text-red-600" : "text-zinc-500"}`}>
          {ticket.tatLabel || "—"}
        </span>
      </td>
      <td className="py-2 pr-4">
        <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS_COLORS[ticket.status]}`}>
          {STATUS_LABELS[ticket.status]}
        </span>
      </td>
      <td className="py-2">
        <Button asChild size="sm" variant="outline">
          <Link href={`/admin/bao-hanh/${ticket.id}`}>Xem</Link>
        </Button>
      </td>
    </tr>
  );
}
