"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { fetchMyTickets, type KtvTicket } from "@/services/ktv.service";
import {
  STATUS_LABELS,
  STATUS_COLORS,
  ALL_STATUSES,
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
import { Badge } from "@/components/ui/badge";

function formatDate(dateStr?: string) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
}

export default function MyTicketsPage() {
  const [tickets, setTickets] = useState<KtvTicket[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchMyTickets({ status: statusFilter, page });
      setTickets(data.items);
      setTotal(data.total);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Lỗi tải danh sách");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page]);

  useEffect(() => {
    load();
  }, [load]);

  const totalPages = Math.ceil(total / 30) || 1;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Phiếu của tôi</h1>
        <span className="text-sm text-gray-500">{total} phiếu</span>
      </div>

      {/* Filter */}
      <div className="flex gap-3">
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-52">
            <SelectValue placeholder="Lọc trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            {ALL_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {STATUS_LABELS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {(() => {
        if (loading) return <div className="text-center py-12 text-gray-400">Đang tải...</div>;
        if (error) return <div className="text-center py-12 text-red-500">{error}</div>;
        if (tickets.length === 0) return <div className="text-center py-12 text-gray-400">Chưa có phiếu nào được giao cho bạn.</div>;
        return (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Số phiếu</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Khách hàng</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Sản phẩm</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Trạng thái</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Ngày nhận</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Hẹn trả</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tickets.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono font-semibold text-gray-900">
                    {t.ticketNumber}
                    {t.isUrgent && (
                      <span className="ml-1 text-xs text-red-600 font-normal">⚡</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    <div>{t.customerName || "—"}</div>
                    <div className="text-gray-400 text-xs">{t.customerPhone}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    <div>{t.productName || "—"}</div>
                    {t.modelName && <div className="text-gray-400 text-xs">{t.modelName}</div>}
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={STATUS_COLORS[t.status as RepairTicketStatus]}>
                      {STATUS_LABELS[t.status as RepairTicketStatus] || t.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(t.receivedDate)}</td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(t.appointmentDate)}</td>
                  <td className="px-4 py-3">
                    <Link href={`/technician/tickets/${t.id}`}>
                      <Button size="sm" variant="outline">Xem</Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        );
      })()}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            Trước
          </Button>
          <span className="text-sm text-gray-500 self-center">
            {page} / {totalPages}
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
          >
            Sau
          </Button>
        </div>
      )}
    </div>
  );
}
