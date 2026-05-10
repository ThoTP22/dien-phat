"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  fetchAdminRepairTickets,
  STATUS_LABELS,
  STATUS_COLORS,
  type RepairTicketStatus,
  type PaginatedRepairTickets,
} from "@/services/repairTicket.service";
import {
  fetchAdminLeads,
  type Lead,
} from "@/services/lead.service";
import { fetchPublicCategories } from "@/services/category.service";
import { fetchAdminProducts } from "@/services/product.service";

interface DashboardStats {
  totalCategories: number;
  totalProducts: number;
  featuredProducts: number;
  newLeads: number;
  recentLeads: Lead[];
  tickets: PaginatedRepairTickets;
  recentTickets: PaginatedRepairTickets["items"];
}

function StatCard({
  title,
  value,
  sub,
  href,
  loading,
}: {
  title: string;
  value: string | number;
  sub?: string;
  href?: string;
  loading: boolean;
}) {
  const inner = (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-zinc-500">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-20" />
        ) : (
          <>
            <p className="text-3xl font-bold text-zinc-900">{value}</p>
            {sub && <p className="text-xs text-zinc-500 mt-1">{sub}</p>}
          </>
        )}
      </CardContent>
    </Card>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

function getLeadBadgeClass(status: Lead["status"]): string {
  if (status === "new") return "border-blue-300 text-blue-700 bg-blue-50";
  if (status === "contacted") return "border-amber-300 text-amber-700 bg-amber-50";
  return "border-green-300 text-green-700 bg-green-50";
}

function getLeadStatusLabel(status: Lead["status"]): string {
  if (status === "new") return "Mới";
  if (status === "contacted") return "Đã liên hệ";
  if (status === "qualified") return "Tiềm năng";
  if (status === "closed") return "Đóng";
  return status;
}

const TICKET_STATUS_GROUPS: { label: string; statuses: RepairTicketStatus[]; color: string }[] = [
  { label: "Đang xử lý", statuses: ["new", "assigned", "quoted", "pending_confirm", "waiting_parts", "parts_ready"], color: "bg-blue-100 text-blue-800" },
  { label: "Hoàn thành", statuses: ["repaired", "delivered"], color: "bg-green-100 text-green-800" },
  { label: "Vấn đề", statuses: ["customer_rejected", "returned", "cancelled", "outsourced"], color: "bg-red-100 text-red-800" },
];

function RecentLeadsContent({ loading, leads }: Readonly<{ loading: boolean; leads?: Lead[] }>) {
  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
      </div>
    );
  }
  if (!leads || leads.length === 0) {
    return <p className="text-xs text-zinc-400">Chưa có lead nào.</p>;
  }
  return (
    <div className="divide-y divide-zinc-100">
      {leads.map((lead) => (
        <div key={lead.id} className="flex items-start justify-between py-2 gap-2">
          <div className="min-w-0">
            <p className="text-sm font-medium text-zinc-800 truncate">{lead.fullName}</p>
            <p className="text-xs text-zinc-500">{lead.phone}</p>
          </div>
          <Badge variant="outline" className={`shrink-0 text-[10px] ${getLeadBadgeClass(lead.status)}`}>
            {getLeadStatusLabel(lead.status)}
          </Badge>
        </div>
      ))}
    </div>
  );
}

function RecentTicketsContent({
  loading,
  tickets,
}: Readonly<{
  loading: boolean;
  tickets?: PaginatedRepairTickets["items"];
}>) {
  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
      </div>
    );
  }
  if (!tickets || tickets.length === 0) {
    return <p className="text-xs text-zinc-400">Chưa có phiếu nào.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-zinc-400 border-b border-zinc-100">
            <th className="pb-2 pr-4 font-medium">Mã phiếu</th>
            <th className="pb-2 pr-4 font-medium">Khách hàng</th>
            <th className="pb-2 pr-4 font-medium">Sản phẩm</th>
            <th className="pb-2 font-medium">Trạng thái</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-50">
          {tickets.map((t) => (
            <tr key={t.id}>
              <td className="py-2 pr-4 font-mono text-xs text-zinc-600">{t.ticketNumber}</td>
              <td className="py-2 pr-4">
                <p className="font-medium text-zinc-800">{t.customerName}</p>
                <p className="text-xs text-zinc-400">{t.customerPhone}</p>
              </td>
              <td className="py-2 pr-4 text-xs text-zinc-600 max-w-[160px] truncate">
                {t.productName ?? "–"}
              </td>
              <td className="py-2">
                <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium ${STATUS_COLORS[t.status]}`}>
                  {STATUS_LABELS[t.status]}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [catRes, prodRes, leadsNewRes, leadsRecentRes, ticketsRes, recentTicketsRes] =
          await Promise.all([
            fetchPublicCategories({ limit: 1 }),
            fetchAdminProducts("", { limit: 1 }),
            fetchAdminLeads({ limit: 1, status: "new" }),
            fetchAdminLeads({ limit: 5 }),
            fetchAdminRepairTickets({ limit: 1 }),
            fetchAdminRepairTickets({ limit: 5 }),
          ]);

        setStats({
          totalCategories: catRes.total,
          totalProducts: prodRes.total,
          featuredProducts: 0,
          newLeads: leadsNewRes.total,
          recentLeads: leadsRecentRes.items,
          tickets: ticketsRes,
          recentTickets: recentTicketsRes.items,
        });
      } catch (e) {
        setError(e instanceof Error ? e.message : "Không thể tải dữ liệu");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const statusCounts = stats?.tickets.statusCounts ?? {};
  const totalTickets = stats?.tickets.total ?? 0;

  const inProgressCount = TICKET_STATUS_GROUPS[0].statuses.reduce(
    (s, st) => s + (statusCounts[st] ?? 0),
    0
  );
  const doneCount = TICKET_STATUS_GROUPS[1].statuses.reduce(
    (s, st) => s + (statusCounts[st] ?? 0),
    0
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-zinc-900">Tổng quan hệ thống</h1>
        <p className="text-xs text-zinc-500">Cập nhật theo thời gian thực từ dữ liệu hệ thống</p>
      </header>

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Row 1: Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Danh mục sản phẩm"
          value={stats?.totalCategories ?? "–"}
          sub="Tổng số danh mục"
          href="/admin/danh-muc"
          loading={loading}
        />
        <StatCard
          title="Sản phẩm"
          value={stats?.totalProducts ?? "–"}
          sub="Tổng số sản phẩm"
          href="/admin/san-pham"
          loading={loading}
        />
        <StatCard
          title="Leads mới"
          value={stats?.newLeads ?? "–"}
          sub='Chưa liên hệ (status: new)'
          href="/admin/leads"
          loading={loading}
        />
        <StatCard
          title="Phiếu sửa chữa"
          value={totalTickets}
          sub={`${inProgressCount} đang xử lý · ${doneCount} hoàn thành`}
          href="/admin/bao-hanh"
          loading={loading}
        />
      </div>

      {/* Row 2: Ticket status breakdown + Recent leads */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Ticket status breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Phiếu sửa chữa theo trạng thái</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-6 w-full" />)}
              </div>
            ) : (
              <div className="space-y-1">
                {(Object.keys(STATUS_LABELS) as RepairTicketStatus[]).map((st) => {
                  const count = statusCounts[st] ?? 0;
                  if (count === 0) return null;
                  return (
                    <div key={st} className="flex items-center justify-between text-sm py-0.5">
                      <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium ${STATUS_COLORS[st]}`}>
                        {STATUS_LABELS[st]}
                      </span>
                      <span className="font-semibold text-zinc-700">{count}</span>
                    </div>
                  );
                })}
                {Object.values(statusCounts).every((v) => !v) && (
                  <p className="text-xs text-zinc-400">Chưa có phiếu nào.</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent leads */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold">Leads gần đây</CardTitle>
            <Link href="/admin/leads" className="text-xs text-blue-600 hover:underline">
              Xem tất cả →
            </Link>
          </CardHeader>
          <CardContent>
            <RecentLeadsContent loading={loading} leads={stats?.recentLeads} />
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Recent tickets */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold">Phiếu sửa chữa gần đây</CardTitle>
          <Link href="/admin/bao-hanh" className="text-xs text-blue-600 hover:underline">
            Xem tất cả →
          </Link>
        </CardHeader>
        <CardContent>
          <RecentTicketsContent loading={loading} tickets={stats?.recentTickets} />
        </CardContent>
      </Card>
    </div>
  );
}

