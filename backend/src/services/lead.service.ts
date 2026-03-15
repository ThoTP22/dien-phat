import {
  createLead,
  findLeadById,
  listLeads,
  updateLead
} from "../repositories/lead.repository";
import {
  CreateLeadRequestDTO,
  UpdateLeadStatusRequestDTO
} from "../dto/requests/lead.dto";
import { PaginatedLeadsResponseDTO, toLeadResponse } from "../dto/responses/lead.dto";

export class LeadService {
  async create(payload: CreateLeadRequestDTO) {
    const doc = await createLead({
      ...payload,
      status: "new"
    } as any);
    return toLeadResponse(doc);
  }

  async list(params: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    intent?: string;
  }): Promise<PaginatedLeadsResponseDTO> {
    const page = Number(params.page) > 0 ? Number(params.page) : 1;
    const limit = Number(params.limit) > 0 ? Number(params.limit) : 20;

    const query: any = {};

    if (params.status) {
      query.status = params.status;
    }

    if (params.intent) {
      query.intent = params.intent;
    }

    if (params.search) {
      query.$or = [
        { fullName: { $regex: params.search, $options: "i" } },
        { phone: { $regex: params.search, $options: "i" } },
        { email: { $regex: params.search, $options: "i" } }
      ];
    }

    const sort: any = { createdAt: -1 };

    const { items, total } = await listLeads({ query, page, limit, sort });

    return {
      items: items.map(toLeadResponse),
      total,
      page,
      limit
    };
  }

  async getById(id: string) {
    const doc = await findLeadById(id);
    if (!doc) {
      throw new Error("Không tìm thấy lead");
    }
    return toLeadResponse(doc);
  }

  async updateStatus(id: string, payload: UpdateLeadStatusRequestDTO) {
    const doc = await updateLead(id, payload as any);
    if (!doc) {
      throw new Error("Không tìm thấy lead");
    }
    return toLeadResponse(doc);
  }
}

