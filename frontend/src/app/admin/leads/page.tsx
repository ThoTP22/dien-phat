"use client";

import { useEffect, useMemo, useState } from "react";
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
import { fetchAdminLeads, type LeadStatus, type Lead } from "@/services/lead.service";

const statusOptions: { value: LeadStatus | "all"; label: string }[] = [
  { value: "all", label: "Tất cả" },
  { value: "new", label: "Mới" },
  { value: "contacted", label: "Đã liên hệ" },
  { value: "qualified", label: "Tiềm năng" },
  { value: "closed", label: "Đã đóng" },
  { value: "spam", label: "Spam" },
];

export default function AdminLeadsPage() {
  const token = useAdminToken();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [items, setItems] = useState<Lead[]>([]);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<LeadStatus | "all">("all");

  const query = useMemo(() => {
    const q: { page: number; limit: number; search?: string; status?: LeadStatus } = { page: 1, limit: 30 };
    if (search.trim()) q.search = search.trim();
    if (status !== "all") q.status = status;
    return q;
  }, [search, status]);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetchAdminLeads(query);
      setItems(res.items);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không thể tải leads");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    load();
  }, [token]);

  useEffect(() => {
    if (!token) return;
    const id = setTimeout(() => load(), 250);
    return () => clearTimeout(id);
  }, [token, query]);

  if (!token) return null;

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-zinc-900">Leads</h1>
      </header>

      {error && (
        <p className="rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Bộ lọc</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 md:flex-row md:items-center">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên / số điện thoại / email"
            className="md:max-w-sm"
          />
          <Select value={status} onValueChange={(v) => setStatus(v as LeadStatus | "all")}>
            <SelectTrigger className="w-full md:w-56">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type="button" variant="secondary" onClick={() => load()} disabled={loading}>
            {loading ? "Đang tải..." : "Tải lại"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Danh sách</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {loading ? (
            <p className="text-sm text-muted-foreground">Đang tải...</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-muted-foreground">Chưa có lead.</p>
          ) : (
            <div className="space-y-2">
              {items.map((lead) => (
                <div
                  key={lead.id}
                  className="flex flex-col gap-2 rounded-lg border border-zinc-200 p-3 md:flex-row md:items-center md:justify-between"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-zinc-900">
                      {lead.fullName}
                    </div>
                    <div className="truncate text-xs text-zinc-600">
                      {lead.phone}
                      {lead.email ? ` • ${lead.email}` : ""}
                      {lead.sourcePage ? ` • ${lead.sourcePage}` : ""}
                    </div>
                    <div className="text-[11px] text-zinc-500">
                      Trạng thái: {lead.status}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/admin/leads/${lead.id}`}>Xem</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

