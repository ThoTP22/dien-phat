"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { fetchAdminUsers, AdminUserDetail, ROLE_LABELS, UserRole } from "@/services/user.service";

const ROLE_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "Tất cả vai trò" },
  { value: "admin", label: "Quản trị viên" },
  { value: "content_staff", label: "Nhân viên nội dung" },
  { value: "technician", label: "Kỹ thuật viên" }
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  useEffect(() => {
    setLoading(true);
    const params: { role?: string; isActive?: boolean } = {};
    if (roleFilter !== "all") params.role = roleFilter;
    fetchAdminUsers(params)
      .then(setUsers)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [roleFilter]);

  const filtered = users.filter((u) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nhân viên</h1>
          <p className="text-sm text-muted-foreground mt-1">Quản lý tài khoản nhân viên và kỹ thuật viên</p>
        </div>
        <Link href="/admin/users/new">
          <Button>+ Tạo tài khoản</Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <Input
          placeholder="Tìm theo tên, email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ROLE_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Error */}
      {error && <p className="text-sm text-red-500">{error}</p>}

      {/* Table */}
      {loading ? (
        <p className="text-sm text-muted-foreground">Đang tải...</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">Không có nhân viên nào.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Họ tên</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Email</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Vai trò</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Trạng thái</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Đăng nhập gần nhất</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{u.fullName}</td>
                  <td className="px-4 py-3 text-gray-600">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      u.role === "admin"
                        ? "bg-purple-100 text-purple-700"
                        : u.role === "technician"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-700"
                    }`}>
                      {ROLE_LABELS[u.role as UserRole]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      u.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
                    }`}>
                      {u.isActive ? "Hoạt động" : "Đã khoá"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {u.lastLoginAt
                      ? new Date(u.lastLoginAt).toLocaleDateString("vi-VN")
                      : <span className="italic text-gray-400">Chưa đăng nhập</span>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/users/${u.id}`}>
                      <Button variant="outline" size="sm">Sửa</Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
