"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-xl font-semibold text-zinc-900">
          Tổng quan hệ thống
        </h1>
        <p className="text-xs text-zinc-600">
          Đây là khung trang admin mẫu để bạn xem bố cục. Dữ liệu thật sẽ được
          kết nối từ API sau.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-sm">
              Danh mục sản phẩm
              <Badge variant="outline" className="text-[10px]">
                Placeholder
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-zinc-700">
            Số lượng danh mục, trạng thái hiển thị sẽ hiển thị ở đây.
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-sm">
              Sản phẩm
              <Badge variant="outline" className="text-[10px]">
                Placeholder
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-zinc-700">
            Thống kê số sản phẩm đang hiển thị, sản phẩm nổi bật.
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-sm">
              Leads mới
              <Badge variant="outline" className="text-[10px]">
                Placeholder
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-zinc-700">
            Số lượng leads chưa xử lý và gần đây sẽ hiển thị tại đây.
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Hoạt động gần đây</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-xs text-zinc-600">
          <p>
            Sau khi kết nối API, phần này có thể hiển thị các hành động như tạo
            sản phẩm mới, cập nhật showroom, xử lý lead.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

