"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiEndpoints } from "@/lib/api";
import { fetchPublicCategories } from "@/services/category.service";
import { fetchPublicCategoryDetail } from "@/services/category.service";
import type { Category } from "@/services/category.service";

type ProductSegment = { value: string; count: number };

export function ProductSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [roots, setRoots] = useState<Category[]>([]);
  const [childrenMap, setChildrenMap] = useState<Record<string, Category[]>>({});
  const [activeValue, setActiveValue] = useState<string>("all");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [segments, setSegments] = useState<ProductSegment[]>([]);

  const q = (searchParams.get("q") ?? "").trim();
  const segment = (searchParams.get("segment") ?? "").trim();
  const capacityBtu = (searchParams.get("capacityBtu") ?? "").trim();

  useEffect(() => {
    Promise.all([
      fetchPublicCategories({ rootOnly: true, limit: 20 }),
      fetchPublicCategories({ limit: 100 })
    ])
      .then(([rootsRes, allRes]) => {
        const rootsList = rootsRes.items;
        const all = allRes.items;
        const map: Record<string, Category[]> = {};
        rootsList.forEach((r) => {
          map[r.id] = all.filter((c) => c.parentId === r.id);
        });
        setRoots(rootsList);
        setChildrenMap(map);
      })
      .catch(() => {
        setRoots([]);
        setChildrenMap({});
      });
  }, []);

  useEffect(() => {
    fetch(apiEndpoints.products.segments)
      .then((res) => res.json())
      .then((json) => {
        if (json?.success && Array.isArray(json.data)) {
          setSegments(json.data as ProductSegment[]);
        }
      })
      .catch(() => {
        setSegments([]);
      });
  }, []);

  useEffect(() => {
    if (pathname === "/san-pham") {
      setActiveValue("all");
      return;
    }
    const match = pathname.match(/^\/san-pham\/danh-muc\/([^/]+)/);
    if (!match) {
      setActiveValue("all");
      return;
    }
    const slug = match[1];
    const rootMatch = roots.find((r) => r.slug === slug);
    if (rootMatch) {
      setActiveValue(rootMatch.id);
      setExpandedIds((prev) => new Set(prev).add(rootMatch.id));
      return;
    }
    fetchPublicCategoryDetail(slug)
      .then((cat) => {
        const pid = cat.parentId ?? cat.id;
        setActiveValue(cat.id);
        setExpandedIds((prev) => new Set(prev).add(pid));
      })
      .catch(() => setActiveValue("all"));
  }, [pathname, roots]);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <aside className="sticky top-20 hidden max-h-[calc(100vh-5rem)] w-72 shrink-0 flex-col overflow-x-hidden overflow-y-auto border-r border-zinc-200 bg-white py-6 pl-4 pr-3 text-sm text-zinc-700 md:flex">
      <Tabs value={activeValue} orientation="vertical" className="flex-1">
        <TabsList variant="line" className="w-full flex-col items-stretch gap-0">
          <TabsTrigger value="all" className="w-full min-w-0 justify-start whitespace-normal" asChild>
            <Link href="/san-pham" className="block break-words leading-snug">Tất cả sản phẩm</Link>
          </TabsTrigger>
          {roots.map((r) => {
            const children = childrenMap[r.id] ?? [];
            const hasChildren = children.length > 0;
            const isExpanded = expandedIds.has(r.id);

            if (hasChildren) {
              return (
                <div key={r.id} className="flex min-w-0 flex-col">
                  <div className="flex min-w-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleExpand(r.id)}
                      className="shrink-0 cursor-pointer py-1.5 text-left text-sm font-medium outline-none hover:text-zinc-900"
                      aria-expanded={isExpanded}
                    >
                      {isExpanded ? "-" : "+"}
                    </button>
                    <TabsTrigger value={r.id} className="min-w-0 flex-1 justify-start whitespace-normal" asChild>
                      <Link href={`/san-pham/danh-muc/${r.slug}`} className="block break-words leading-snug">
                        {r.name}
                      </Link>
                    </TabsTrigger>
                  </div>
                  {isExpanded && (
                    <div className="ml-4 flex min-w-0 flex-col border-l border-zinc-200 pl-3">
                      {children.map((c) => (
                        <TabsTrigger key={c.id} value={c.id} className="w-full min-w-0 justify-start whitespace-normal py-1.5" asChild>
                          <Link
                            href={`/san-pham/danh-muc/${c.slug}`}
                            className="block break-words text-xs leading-snug"
                            title={c.name}
                          >
                            {c.name}
                          </Link>
                        </TabsTrigger>
                      ))}
                    </div>
                  )}
                </div>
              );
            }
            return (
              <TabsTrigger key={r.id} value={r.id} className="w-full min-w-0 justify-start whitespace-normal" asChild>
                <Link href={`/san-pham/danh-muc/${r.slug}`} className="block break-words leading-snug">{r.name}</Link>
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>

      <div className="mt-4 border-t border-zinc-200 pt-4">
        <details
          className="group rounded-lg border border-zinc-200 bg-white"
          open={Boolean(q || segment || capacityBtu)}
        >
          <summary className="flex cursor-pointer list-none items-center justify-between px-3 py-2">
            <div>
              <p className="text-sm font-semibold text-zinc-900">Lọc sản phẩm</p>
              <p className="text-[11px] text-zinc-600">Nhấn để mở bộ lọc khi cần.</p>
            </div>
            <span className="ml-3 text-xs text-zinc-500 transition-transform group-open:rotate-180">
              ▼
            </span>
          </summary>
          <div className="border-t border-zinc-200 px-3 pb-3 pt-2">
            <form className="space-y-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-zinc-700" htmlFor="sidebar-q">
                  Tìm theo tên sản phẩm
                </label>
                <input
                  id="sidebar-q"
                  name="q"
                  defaultValue={q}
                  placeholder="Nhập tên sản phẩm..."
                  className="w-full rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-xs outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-zinc-700" htmlFor="sidebar-segment">
                  Dòng sản phẩm
                </label>
                <select
                  id="sidebar-segment"
                  name="segment"
                  defaultValue={segment}
                  className="w-full rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-xs outline-none focus:border-primary"
                >
                  <option value="">Tất cả dòng</option>
                  {segments.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.value} ({s.count})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-zinc-700" htmlFor="sidebar-capacityBtu">
                  Công suất (BTU)
                </label>
                <select
                  id="sidebar-capacityBtu"
                  name="capacityBtu"
                  defaultValue={capacityBtu}
                  className="w-full rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-xs outline-none focus:border-primary"
                >
                  <option value="">Tất cả</option>
                  <option value="9000">9000 BTU</option>
                  <option value="12000">12000 BTU</option>
                  <option value="18000">18000 BTU</option>
                  <option value="24000">24000 BTU</option>
                </select>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  className="flex-1 rounded-md bg-primary px-2.5 py-1.5 text-xs font-semibold text-white hover:opacity-90"
                >
                  Lọc
                </button>
                <Link
                  href="/san-pham"
                  className="flex-1 rounded-md border border-zinc-200 px-2.5 py-1.5 text-center text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
                >
                  Xóa lọc
                </Link>
              </div>
            </form>
          </div>
        </details>
      </div>
    </aside>
  );
}
