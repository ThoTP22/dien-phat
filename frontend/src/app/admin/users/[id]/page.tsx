"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  fetchAdminUserById,
  updateAdminUser,
  AdminUserDetail,
  UserRole,
  ROLE_LABELS
} from "@/services/user.service";

const ROLES: { value: UserRole; label: string }[] = [
  { value: "technician", label: "Kỹ thuật viên" },
  { value: "content_staff", label: "Nhân viên nội dung" },
  { value: "admin", label: "Quản trị viên" }
];

export default function EditUserPage({ params }: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = use(params);
  const [user, setUser] = useState<AdminUserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    fullName: "",
    role: "technician" as UserRole,
    password: "",
    isActive: true
  });

  useEffect(() => {
    fetchAdminUserById(id)
      .then((u) => {
        setUser(u);
        setForm({ fullName: u.fullName, role: u.role, password: "", isActive: u.isActive });
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      const payload: { fullName?: string; role?: UserRole; password?: string; isActive?: boolean } = {
        fullName: form.fullName,
        role: form.role,
        isActive: form.isActive
      };
      if (form.password.trim()) payload.password = form.password;

      const updated = await updateAdminUser(id, payload);
      setUser(updated);
      setForm((prev) => ({ ...prev, password: "" }));
      setSuccess("Đã lưu thay đổi.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Không thể cập nhật");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async () => {
    if (!user) return;
    const label = user.isActive ? "khoá" : "mở khoá";
    if (!globalThis.confirm(`Bạn có chắc muốn ${label} tài khoản này?`)) return;
    setSaving(true);
    setError("");
    try {
      const updated = await updateAdminUser(id, { isActive: !user.isActive });
      setUser(updated);
      setForm((prev) => ({ ...prev, isActive: updated.isActive }));
      setSuccess(`Đã ${label} tài khoản.`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Thao tác thất bại");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-sm text-muted-foreground">Đang tải...</p>;
  if (!user && error) return <p className="text-sm text-red-500">{error}</p>;

  return (
    <div className="max-w-lg space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/admin/users">
          <Button variant="ghost" size="sm">← Quay lại</Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{user?.fullName}</h1>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Thông tin tài khoản</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Họ tên</Label>
              <Input value={form.fullName} onChange={set("fullName")} />
            </div>

            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input value={user?.email ?? ""} disabled className="bg-gray-50 text-gray-400" />
              <p className="text-xs text-muted-foreground">Email không thể thay đổi</p>
            </div>

            <div className="space-y-1.5">
              <Label>Vai trò</Label>
              <Select value={form.role} onValueChange={(v) => setForm((p) => ({ ...p, role: v as UserRole }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Mật khẩu mới <span className="text-muted-foreground font-normal">(để trống nếu không đổi)</span></Label>
              <Input type="password" value={form.password} onChange={set("password")} placeholder="Ít nhất 6 ký tự" />
            </div>

            {success && <p className="text-sm text-green-600">{success}</p>}
            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={saving}>
                {saving ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={saving}
                onClick={handleToggleActive}
                className={user?.isActive ? "text-red-600 border-red-200 hover:bg-red-50" : "text-green-600 border-green-200 hover:bg-green-50"}
              >
                {user?.isActive ? "Khoá tài khoản" : "Mở khoá tài khoản"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

      {/* Meta info */}
      {user && (
        <Card>
          <CardContent className="pt-4 text-sm text-muted-foreground space-y-1">
            <div className="flex gap-2">
              <span className="w-36 font-medium text-gray-600">Trạng thái:</span>
              <span className={`font-medium ${user.isActive ? "text-green-600" : "text-red-500"}`}>
                {user.isActive ? "Hoạt động" : "Đã khoá"}
              </span>
            </div>
            <div className="flex gap-2">
              <span className="w-36 font-medium text-gray-600">Vai trò hiện tại:</span>
              <span>{ROLE_LABELS[user.role]}</span>
            </div>
            <div className="flex gap-2">
              <span className="w-36 font-medium text-gray-600">Ngày tạo:</span>
              <span>{new Date(user.createdAt).toLocaleDateString("vi-VN")}</span>
            </div>
            <div className="flex gap-2">
              <span className="w-36 font-medium text-gray-600">Đăng nhập cuối:</span>
              <span>{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString("vi-VN") : "Chưa đăng nhập"}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
