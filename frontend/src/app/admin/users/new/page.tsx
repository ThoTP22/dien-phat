"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { createAdminUser, UserRole } from "@/services/user.service";

const ROLES: { value: UserRole; label: string }[] = [
  { value: "technician", label: "Kỹ thuật viên" },
  { value: "content_staff", label: "Nhân viên nội dung" },
  { value: "admin", label: "Quản trị viên" }
];

export default function NewUserPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "technician" as UserRole
  });

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.fullName.trim() || !form.email.trim() || !form.password.trim()) {
      setError("Vui lòng điền đầy đủ thông tin bắt buộc.");
      return;
    }
    setSaving(true);
    try {
      const user = await createAdminUser(form);
      router.push(`/admin/users/${user.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Không thể tạo tài khoản");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-lg space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/admin/users">
          <Button variant="ghost" size="sm">← Quay lại</Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Tạo tài khoản</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Thông tin tài khoản</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Họ tên <span className="text-red-500">*</span></Label>
              <Input value={form.fullName} onChange={set("fullName")} placeholder="Nguyễn Văn A" />
            </div>

            <div className="space-y-1.5">
              <Label>Email <span className="text-red-500">*</span></Label>
              <Input type="email" value={form.email} onChange={set("email")} placeholder="nhanvien@dienphat.vn" />
            </div>

            <div className="space-y-1.5">
              <Label>Mật khẩu <span className="text-red-500">*</span></Label>
              <Input type="password" value={form.password} onChange={set("password")} placeholder="Ít nhất 6 ký tự" />
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

            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={saving}>
                {saving ? "Đang lưu..." : "Tạo tài khoản"}
              </Button>
              <Link href="/admin/users">
                <Button type="button" variant="outline">Huỷ</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
