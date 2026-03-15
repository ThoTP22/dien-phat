"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdminToken } from "@/lib/use-admin-token";
import {
  fetchAdminShowroom,
  upsertAdminShowroom,
  type Showroom,
} from "@/services/showroom.service";

const emptyShowroom: Showroom = {
  name: "Gold Shop Điện Phát",
  address: {},
  phone: "",
  email: "",
  mapUrl: "",
  intro: "",
  openingHours: [],
  gallery: [],
};

export default function AdminShowroomPage() {
  const token = useAdminToken();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<Showroom>(emptyShowroom);

  useEffect(() => {
    if (!token) return;
    fetchAdminShowroom(token)
      .then((res) => setData(res ?? emptyShowroom))
      .catch((e) => setError(e instanceof Error ? e.message : "Không thể tải showroom"))
      .finally(() => setLoading(false));
  }, [token]);

  const onSave = async () => {
    if (!token) return;
    setSaving(true);
    setError("");
    try {
      const saved = await upsertAdminShowroom(token, data);
      setData(saved);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Cập nhật showroom thất bại");
    } finally {
      setSaving(false);
    }
  };

  if (!token) return null;

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-zinc-900">Showroom</h1>
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
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Thông tin cơ bản</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Tên showroom</label>
                <Input
                  value={data.name}
                  onChange={(e) => setData((p) => ({ ...p, name: e.target.value }))}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Số điện thoại</label>
                <Input
                  value={data.phone ?? ""}
                  onChange={(e) => setData((p) => ({ ...p, phone: e.target.value }))}
                  placeholder="0900 000 000"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Email</label>
                <Input
                  value={data.email ?? ""}
                  onChange={(e) => setData((p) => ({ ...p, email: e.target.value }))}
                  placeholder="contact@example.com"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Link bản đồ</label>
                <Input
                  value={data.mapUrl ?? ""}
                  onChange={(e) => setData((p) => ({ ...p, mapUrl: e.target.value }))}
                  placeholder="https://maps.google.com/..."
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Địa chỉ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Địa chỉ đầy đủ</label>
                <Input
                  value={data.address.fullText ?? ""}
                  onChange={(e) =>
                    setData((p) => ({ ...p, address: { ...p.address, fullText: e.target.value } }))
                  }
                  placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành"
                />
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium">Phường/xã</label>
                  <Input
                    value={data.address.ward ?? ""}
                    onChange={(e) =>
                      setData((p) => ({ ...p, address: { ...p.address, ward: e.target.value } }))
                    }
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Quận/huyện</label>
                  <Input
                    value={data.address.district ?? ""}
                    onChange={(e) =>
                      setData((p) => ({
                        ...p,
                        address: { ...p.address, district: e.target.value },
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Tỉnh/thành</label>
                  <Input
                    value={data.address.province ?? ""}
                    onChange={(e) =>
                      setData((p) => ({
                        ...p,
                        address: { ...p.address, province: e.target.value },
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Đường</label>
                  <Input
                    value={data.address.street ?? ""}
                    onChange={(e) =>
                      setData((p) => ({ ...p, address: { ...p.address, street: e.target.value } }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-sm">Giới thiệu</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={data.intro ?? ""}
                onChange={(e) => setData((p) => ({ ...p, intro: e.target.value }))}
                rows={6}
                placeholder="Giới thiệu ngắn về showroom, dịch vụ, khu vực phục vụ..."
              />
              <p className="mt-2 text-xs text-muted-foreground">
                Ghi chú: Opening hours và gallery sẽ được bổ sung UI chi tiết ở bước tiếp theo.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

