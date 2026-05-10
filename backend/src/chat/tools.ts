import { CategoryService } from "../services/category.service";
import { LeadService } from "../services/lead.service";
import { PostService } from "../services/post.service";
import { ProductService } from "../services/product.service";
import { RepairTicketService } from "../services/repairTicket.service";
import { ShowroomService } from "../services/showroom.service";

export type ToolCall = { name: string; args: Record<string, any>; id?: string };

export type ToolResult =
  | { ok: true; data: unknown }
  | { ok: false; error: string };

const showroomService = new ShowroomService();
const productService = new ProductService();
const categoryService = new CategoryService();
const postService = new PostService();
const repairTicketService = new RepairTicketService();
const leadService = new LeadService();

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
    description: "Tìm bài viết tin tức (public) theo từ khóa. Trả về tiêu đề, slug, tóm tắt. Dùng getPostBySlug để đọc nội dung chi tiết.",
    parameters: {
      type: "object",
      properties: {
        page: { type: "number" },
        limit: { type: "number" },
        search: { type: "string" }
      },
      required: []
    }
  },
  {
    name: "getPostBySlug",
    description: "Đọc nội dung chi tiết một bài viết theo slug. Dùng khi cần trích dẫn kiến thức từ bài viết nội bộ để tư vấn khách hàng.",
    parameters: {
      type: "object",
      properties: { slug: { type: "string", description: "Slug của bài viết" } },
      required: ["slug"]
    }
  }
] as const;

const createRepairTicketDeclaration = {
  name: "createRepairTicket",
  description: "Tạo phiếu sửa chữa mới. Dùng khi admin yêu cầu tạo phiếu từ đoạn text mô tả thông tin khách hàng và hư hỏng.",
  parameters: {
    type: "object",
    properties: {
      customerName: { type: "string", description: "Tên khách hàng" },
      customerPhone: { type: "string", description: "Số điện thoại khách hàng" },
      faultDescription: { type: "string", description: "Mô tả hư hỏng / yêu cầu sửa chữa" },
      productName: { type: "string", description: "Tên sản phẩm (vd: Máy lạnh Midea)" },
      manufacturer: { type: "string", description: "Hãng sản xuất (vd: Midea, Daikin)" },
      modelName: { type: "string", description: "Model máy" },
      serialNumber: { type: "string", description: "Số serial (nếu có)" },
      customerAddress: { type: "string", description: "Địa chỉ khách hàng" },
      area: { type: "string", description: "Khu vực (vd: Q1, Q.Bình Thạnh)" },
      serviceType: { type: "string", description: "Loại dịch vụ: warranty | warranty_repair | service" },
      serviceLocation: { type: "string", description: "Địa điểm: at_station | at_home" },
      isUrgent: { type: "boolean", description: "Có khẩn cấp không" },
      note: { type: "string", description: "Ghi chú thêm" },
      receivedBy: { type: "string", description: "Người tiếp nhận" }
    },
    required: ["customerName", "customerPhone", "faultDescription"]
  }
};

const searchRepairTicketsDeclaration = {
  name: "searchRepairTickets",
  description: "Tìm kiếm phiếu sửa chữa theo từ khóa (tên/SĐT/mã phiếu) hoặc lọc theo trạng thái. Trả về danh sách phiếu.",
  parameters: {
    type: "object",
    properties: {
      search: { type: "string", description: "Từ khóa: tên khách, SĐT, mã phiếu, tên sản phẩm" },
      status: { type: "string", description: "Trạng thái phiếu: new | assigned | quoted | pending_confirm | waiting_parts | parts_ready | repaired | delivered | cancelled | outsourced | customer_rejected | returned" },
      page: { type: "number", description: "Trang (bắt đầu từ 1)" },
      limit: { type: "number", description: "Số lượng mỗi trang (mặc định 10)" }
    },
    required: []
  }
};

const updateRepairTicketStatusDeclaration = {
  name: "updateRepairTicketStatus",
  description: "Cập nhật trạng thái của một phiếu sửa chữa theo id hoặc mã phiếu.",
  parameters: {
    type: "object",
    properties: {
      id: { type: "string", description: "MongoDB _id của phiếu (ưu tiên dùng nếu có)" },
      ticketNumber: { type: "string", description: "Mã phiếu (vd: TK-2025-001), dùng nếu không có id" },
      status: { type: "string", description: "Trạng thái mới: new | assigned | quoted | pending_confirm | waiting_parts | parts_ready | repaired | delivered | cancelled | outsourced | customer_rejected | returned" },
      note: { type: "string", description: "Ghi chú kèm theo khi đổi trạng thái (không bắt buộc)" }
    },
    required: ["status"]
  }
};

const getCustomerHistoryDeclaration = {
  name: "getCustomerHistory",
  description: "Tra cứu toàn bộ lịch sử phiếu sửa chữa và leads của một khách hàng theo số điện thoại.",
  parameters: {
    type: "object",
    properties: {
      phone: { type: "string", description: "Số điện thoại khách hàng" }
    },
    required: ["phone"]
  }
};

const searchLeadsDeclaration = {
  name: "searchLeads",
  description: "Tìm kiếm leads (yêu cầu tư vấn) theo tên/SĐT hoặc lọc theo trạng thái.",
  parameters: {
    type: "object",
    properties: {
      search: { type: "string", description: "Từ khóa: tên, SĐT, email" },
      status: { type: "string", description: "Trạng thái lead: new | contacted | converted | closed" },
      page: { type: "number", description: "Trang (bắt đầu từ 1)" },
      limit: { type: "number", description: "Số lượng mỗi trang (mặc định 10)" }
    },
    required: []
  }
};

const updateLeadStatusDeclaration = {
  name: "updateLeadStatus",
  description: "Cập nhật trạng thái của một lead theo id.",
  parameters: {
    type: "object",
    properties: {
      id: { type: "string", description: "MongoDB _id của lead" },
      status: { type: "string", description: "Trạng thái mới: new | contacted | converted | closed" },
      note: { type: "string", description: "Ghi chú kèm theo" }
    },
    required: ["id", "status"]
  }
};

const getDashboardStatsDeclaration = {
  name: "getDashboardStats",
  description: "Lấy thống kê nhanh: số phiếu sửa chữa theo trạng thái, số lead mới hôm nay.",
  parameters: {
    type: "object",
    properties: {},
    required: []
  }
};

export const adminToolDeclarations = [
  ...toolDeclarations,
  createRepairTicketDeclaration,
  searchRepairTicketsDeclaration,
  updateRepairTicketStatusDeclaration,
  getCustomerHistoryDeclaration,
  searchLeadsDeclaration,
  updateLeadStatusDeclaration,
  getDashboardStatsDeclaration
];

function truncateText(s: string, max = 240) {
  const t = (s || "").toString();
  if (t.length <= max) return t;
  return t.slice(0, max - 1) + "…";
}

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function handleCreateRepairTicket(
  args: Record<string, any>,
  user?: { id: string; role: string }
): Promise<ToolResult> {
  const customerName = String(args.customerName || "").trim();
  const customerPhone = String(args.customerPhone || "").trim();
  const faultDescription = String(args.faultDescription || "").trim();
  if (!customerName) return { ok: false, error: "Thiếu tên khách hàng" };
  if (!customerPhone) return { ok: false, error: "Thiếu số điện thoại" };
  if (!faultDescription) return { ok: false, error: "Thiếu mô tả hư hỏng" };

  const serviceType = ["warranty", "warranty_repair", "service"].includes(args.serviceType)
    ? args.serviceType
    : "service";
  const serviceLocation = ["at_station", "at_home"].includes(args.serviceLocation)
    ? args.serviceLocation
    : "at_station";

  const ticket = await repairTicketService.create(
    {
      customerName,
      customerPhone,
      faultDescription,
      productName: args.productName,
      manufacturer: args.manufacturer,
      modelName: args.modelName,
      serialNumber: args.serialNumber,
      customerAddress: args.customerAddress,
      area: args.area,
      serviceType,
      serviceLocation,
      isUrgent: Boolean(args.isUrgent),
      note: args.note,
      receivedBy: args.receivedBy
    },
    user
  );
  return {
    ok: true,
    data: {
      id: (ticket as any)._id?.toString() ?? "",
      ticketNumber: ticket.ticketNumber,
      status: ticket.status,
      customerName: ticket.customerName,
      customerPhone: ticket.customerPhone,
      faultDescription: ticket.faultDescription
    }
  };
}

export async function executeAdminTool(
  call: ToolCall,
  user?: { id: string; role: string }
): Promise<ToolResult> {
  if (call.name === "createRepairTicket") {
    try {
      return await handleCreateRepairTicket(call.args, user);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return { ok: false, error: msg };
    }
  }

  if (call.name === "searchRepairTickets") {
    try {
      const result = await repairTicketService.list({
        page: call.args.page ?? 1,
        limit: call.args.limit ?? 10,
        status: call.args.status,
        search: call.args.search
      });
      return {
        ok: true,
        data: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          statusCounts: result.statusCounts,
          items: result.items.map((t: any) => ({
            id: t.id,
            ticketNumber: t.ticketNumber,
            status: t.status,
            customerName: t.customerName,
            customerPhone: t.customerPhone,
            productName: t.productName,
            modelName: t.modelName,
            faultDescription: truncateText(t.faultDescription, 120),
            isUrgent: t.isUrgent,
            receivedDate: t.receivedDate,
            tatLabel: t.tatLabel
          }))
        }
      };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
  }

  if (call.name === "updateRepairTicketStatus") {
    try {
      const status = String(call.args.status || "").trim();
      if (!status) return { ok: false, error: "Thiếu trạng thái mới" };

      let ticketId = String(call.args.id || "").trim();

      // Nếu không có id, tìm theo ticketNumber
      if (!ticketId && call.args.ticketNumber) {
        const res = await repairTicketService.list({ search: String(call.args.ticketNumber), limit: 1 });
        const found = res.items[0];
        if (!found) return { ok: false, error: `Không tìm thấy phiếu ${call.args.ticketNumber}` };
        ticketId = found.id;
      }
      if (!ticketId) return { ok: false, error: "Cần cung cấp id hoặc ticketNumber" };

      const updated = await repairTicketService.update(
        ticketId,
        { status: status as any, ...(call.args.note ? { internalNote: String(call.args.note) } : {}) },
        user
      );
      return {
        ok: true,
        data: {
          id: updated.id,
          ticketNumber: updated.ticketNumber,
          status: updated.status,
          customerName: updated.customerName
        }
      };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
  }

  if (call.name === "getCustomerHistory") {
    try {
      const phone = String(call.args.phone || "").trim();
      if (!phone) return { ok: false, error: "Thiếu số điện thoại" };

      const [ticketsRes, leadsRes] = await Promise.all([
        repairTicketService.list({ search: phone, limit: 20 }),
        leadService.list({ search: phone, limit: 20 })
      ]);

      return {
        ok: true,
        data: {
          phone,
          tickets: ticketsRes.items.map((t: any) => ({
            id: t.id,
            ticketNumber: t.ticketNumber,
            status: t.status,
            productName: t.productName,
            faultDescription: truncateText(t.faultDescription, 120),
            receivedDate: t.receivedDate,
            tatLabel: t.tatLabel
          })),
          leads: leadsRes.items.map((l: any) => ({
            id: l.id,
            fullName: l.fullName,
            status: l.status,
            intent: l.intent,
            message: truncateText(l.message ?? "", 120),
            createdAt: l.createdAt
          }))
        }
      };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
  }

  if (call.name === "searchLeads") {
    try {
      const result = await leadService.list({
        page: call.args.page ?? 1,
        limit: call.args.limit ?? 10,
        status: call.args.status,
        search: call.args.search
      });
      return {
        ok: true,
        data: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          items: result.items.map((l: any) => ({
            id: l.id,
            fullName: l.fullName,
            phone: l.phone,
            email: l.email,
            status: l.status,
            intent: l.intent,
            message: truncateText(l.message ?? "", 120),
            createdAt: l.createdAt
          }))
        }
      };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
  }

  if (call.name === "updateLeadStatus") {
    try {
      const id = String(call.args.id || "").trim();
      const status = String(call.args.status || "").trim();
      if (!id) return { ok: false, error: "Thiếu id của lead" };
      if (!status) return { ok: false, error: "Thiếu trạng thái mới" };

      const updated = await leadService.updateStatus(id, {
        status: status as any,
        ...(call.args.note ? { note: String(call.args.note) } : {})
      });
      return {
        ok: true,
        data: { id: updated.id, fullName: updated.fullName, status: updated.status }
      };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
  }

  if (call.name === "getDashboardStats") {
    try {
      const [ticketsRes, leadsRes] = await Promise.all([
        repairTicketService.list({ page: 1, limit: 1 }),
        leadService.list({ page: 1, limit: 1, status: "new" })
      ]);

      return {
        ok: true,
        data: {
          repairTickets: {
            total: ticketsRes.total,
            byStatus: ticketsRes.statusCounts
          },
          leads: {
            newCount: leadsRes.total
          }
        }
      };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
  }

  return executeTool(call);
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
              imageUrl: p.images?.find((x: any) => x.isPrimary)?.url || p.images?.[0]?.url,
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
      case "getPostBySlug": {
        const slug = String(call.args.slug || "").trim();
        if (!slug) return { ok: false, error: "Thieu slug" };
        const post = await postService.getPublicBySlug(slug);
        const plainContent = stripHtml(post.content || "");
        return {
          ok: true,
          data: {
            title: post.title,
            slug: post.slug,
            summary: post.summary,
            content: truncateText(plainContent, 3000),
            publishedAt: post.publishedAt
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

