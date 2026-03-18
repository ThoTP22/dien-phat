"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { deletePost, fetchPublicPosts, type Post } from "@/services/post.service";

export default function AdminPostsPage() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Post[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPublicPosts({ page: 1, limit: 10 })
      .then((res) => setItems(res.items))
      .catch((e) => setError(e instanceof Error ? e.message : "Không thể tải bài viết"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-zinc-900">Bài viết</h1>
        <Button asChild>
          <Link href="/admin/posts/new">Thêm bài viết</Link>
        </Button>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Danh sách (public published)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {error && (
            <p className="rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}
          {loading ? (
            <p className="text-muted-foreground">Đang tải...</p>
          ) : items.length === 0 ? (
            <p className="text-muted-foreground">Chưa có bài viết published.</p>
          ) : (
            <div className="space-y-2">
              {items.map((p) => (
                <div key={p.id} className="rounded-lg border border-zinc-200 px-3 py-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-zinc-900">{p.title}</div>
                      <div className="text-xs text-zinc-500">{p.slug}</div>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/posts/${p.id}`}>Sửa</Link>
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={async () => {
                          const ok = window.confirm("Bạn có chắc muốn ẩn bài viết này?");
                          if (!ok) return;
                          setError("");
                          try {
                            await deletePost(p.id);
                            setItems((prev) => prev.filter((x) => x.id !== p.id));
                          } catch (e) {
                            setError(e instanceof Error ? e.message : "Ẩn bài viết thất bại");
                          }
                        }}
                      >
                        Xóa
                      </Button>
                    </div>
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

