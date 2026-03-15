"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdminToken } from "@/lib/use-admin-token";
import {
  deleteCategory,
  fetchAdminCategories,
  type Category,
} from "@/services/category.service";
import Link from "next/link";

interface CategoryTreeNode extends Category {
  children: CategoryTreeNode[];
  depth: number;
}

function buildTree(items: Category[]): CategoryTreeNode[] {
  const map = new Map<string, CategoryTreeNode>();
  items.forEach((c) => {
    map.set(c.id, { ...c, children: [], depth: 0 });
  });

  const roots: CategoryTreeNode[] = [];
  items.forEach((c) => {
    const node = map.get(c.id)!;
    if (!c.parentId) {
      roots.push(node);
    } else {
      const parent = map.get(c.parentId);
      if (parent) {
        node.depth = parent.depth + 1;
        parent.children.push(node);
      } else {
        roots.push(node);
      }
    }
  });

  roots.sort((a, b) => a.sortOrder - b.sortOrder);
  const sortChildren = (nodes: CategoryTreeNode[]) => {
    nodes.sort((a, b) => a.sortOrder - b.sortOrder);
    nodes.forEach((n) => sortChildren(n.children));
  };
  sortChildren(roots);

  return roots;
}

function flattenTree(nodes: CategoryTreeNode[]): CategoryTreeNode[] {
  const out: CategoryTreeNode[] = [];
  const traverse = (list: CategoryTreeNode[]) => {
    list.forEach((n) => {
      out.push(n);
      traverse(n.children);
    });
  };
  traverse(nodes);
  return out;
}

export default function AdminCategoriesPage() {
  const token = useAdminToken();
  const [items, setItems] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async (t: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetchAdminCategories(t, { page: 1, limit: 200, includeHidden: true });
      setItems(res.items);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không thể tải danh mục");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    load(token);
  }, [token]);

  const onHide = async (id: string) => {
    if (!token) return;
    setError("");
    try {
      await deleteCategory(token, id);
      await load(token);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ẩn danh mục thất bại");
    }
  };

  const tree = buildTree(items);
  const flatList = flattenTree(tree);

  if (!token) return null;

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-zinc-900">Danh mục</h1>
        <Button asChild size="sm">
          <Link href="/admin/categories/new">Tạo danh mục</Link>
        </Button>
      </header>

      {error && (
        <p className="rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Danh sách danh mục</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {loading ? (
            <p className="text-sm text-muted-foreground">Đang tải...</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-muted-foreground">Chưa có danh mục.</p>
          ) : (
            <div className="space-y-2">
              {flatList.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between rounded-lg border border-zinc-200 px-3 py-2"
                  style={{ paddingLeft: `${12 + c.depth * 20}px` }}
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-zinc-900">
                      {c.depth > 0 ? (
                        <span className="mr-1 text-zinc-400">-</span>
                      ) : null}
                      {c.name}{" "}
                      {!c.isVisible && (
                        <span className="ml-2 text-xs text-zinc-500">(đang ẩn)</span>
                      )}
                    </div>
                    <div className="truncate text-xs text-zinc-500">{c.slug}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <Link href={`/admin/categories/${c.id}`}>Sửa</Link>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => onHide(c.id)}
                      disabled={!c.isVisible}
                    >
                      Ẩn
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

