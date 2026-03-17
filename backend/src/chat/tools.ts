import { CategoryService } from "../services/category.service";
import { PostService } from "../services/post.service";
import { ProductService } from "../services/product.service";
import { ShowroomService } from "../services/showroom.service";

export type ToolCall = { name: string; args: Record<string, any>; id?: string };

export type ToolResult =
  | { ok: true; data: unknown }
  | { ok: false; error: string };

const showroomService = new ShowroomService();
const productService = new ProductService();
const categoryService = new CategoryService();
const postService = new PostService();

export const toolDeclarations = [
  {
    name: "getShowroom",
    description: "Lấy thông tin showroom (địa chỉ, số điện thoại, giờ mở cửa, email nếu có).",
    parameters: { type: "object", properties: {}, required: [] }
  },
  {
    name: "searchProducts",
    description:
      "Tìm sản phẩm theo từ khóa và bộ lọc. Trả danh sách sản phẩm (tên, slug, mô tả ngắn) + phân trang.",
    parameters: {
      type: "object",
      properties: {
        search: { type: "string", description: "Từ khóa tên sản phẩm" },
        page: { type: "number", description: "Trang, bắt đầu từ 1" },
        limit: { type: "number", description: "Số lượng mỗi trang" },
        segment: { type: "string", description: "Dòng sản phẩm (series/segment)" },
        capacityBtu: { type: "string", description: "Công suất BTU, ví dụ 9000/12000/18000/24000" },
        technology: { type: "string", description: "Công nghệ, ví dụ inverter" },
        origin: { type: "string", description: "Xuất xứ" },
        type: { type: "string", description: "Loại (treo tường, âm trần... nếu có)" },
        featured: { type: "boolean", description: "Sản phẩm nổi bật" },
        sort: { type: "string", description: "Sắp xếp (nếu có), ví dụ name_asc" }
      },
      required: []
    }
  },
  {
    name: "getProductBySlug",
    description: "Lấy chi tiết sản phẩm theo slug.",
    parameters: {
      type: "object",
      properties: { slug: { type: "string" } },
      required: ["slug"]
    }
  },
  {
    name: "listCategories",
    description: "Lấy danh sách danh mục sản phẩm (public).",
    parameters: {
      type: "object",
      properties: {
        page: { type: "number" },
        limit: { type: "number" },
        search: { type: "string" },
        rootOnly: { type: "boolean" }
      },
      required: []
    }
  },
  {
    name: "searchPosts",
    description: "Tìm bài viết tin tức (public) theo từ khóa.",
    parameters: {
      type: "object",
      properties: {
        page: { type: "number" },
        limit: { type: "number" },
        search: { type: "string" }
      },
      required: []
    }
  }
] as const;

function truncateText(s: string, max = 240) {
  const t = (s || "").toString();
  if (t.length <= max) return t;
  return t.slice(0, max - 1) + "…";
}

export async function executeTool(call: ToolCall): Promise<ToolResult> {
  try {
    switch (call.name) {
      case "getShowroom": {
        const data = await showroomService.getPublicShowroom();
        return { ok: true, data };
      }
      case "searchProducts": {
        const result = await productService.list({
          page: call.args.page,
          limit: call.args.limit ?? 10,
          search: call.args.search,
          segment: call.args.segment,
          capacityBtu: call.args.capacityBtu,
          technology: call.args.technology,
          origin: call.args.origin,
          type: call.args.type,
          featured: call.args.featured,
          sort: call.args.sort
        } as any);

        return {
          ok: true,
          data: {
            page: result.page,
            limit: result.limit,
            total: result.total,
            items: (result.items || []).map((p: any) => ({
              id: p.id,
              name: p.name,
              slug: p.slug,
              modelCode: p.modelCode,
              shortDescription: p.shortDescription ? truncateText(p.shortDescription) : undefined,
              featured: p.featured,
              isVisible: p.isVisible
            }))
          }
        };
      }
      case "getProductBySlug": {
        const slug = String(call.args.slug || "").trim();
        if (!slug) return { ok: false, error: "Thiếu slug" };
        const data = await productService.getBySlug(slug);
        return { ok: true, data };
      }
      case "listCategories": {
        const result = await categoryService.list({
          page: call.args.page,
          limit: call.args.limit ?? 50,
          search: call.args.search,
          rootOnly: call.args.rootOnly
        } as any);
        return { ok: true, data: result };
      }
      case "searchPosts": {
        const result = await postService.listPublic({
          page: call.args.page,
          limit: call.args.limit ?? 10,
          search: call.args.search
        } as any);
        return {
          ok: true,
          data: {
            page: result.page,
            limit: result.limit,
            total: result.total,
            items: (result.items || []).map((p: any) => ({
              id: p.id,
              title: p.title,
              slug: p.slug,
              summary: p.summary ? truncateText(p.summary) : undefined,
              publishedAt: p.publishedAt
            }))
          }
        };
      }
      default:
        return { ok: false, error: `Tool không hỗ trợ: ${call.name}` };
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: msg };
  }
}

