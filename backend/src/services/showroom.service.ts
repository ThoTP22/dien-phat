import { getShowroomSettings, upsertShowroomSettings } from "../repositories/showroom.repository";
import { UpsertShowroomRequestDTO } from "../dto/requests/showroom.dto";
import { ShowroomResponseDTO, toShowroomResponse } from "../dto/responses/showroom.dto";

export class ShowroomService {
  async getPublicShowroom(): Promise<ShowroomResponseDTO | null> {
    const doc = await getShowroomSettings();
    if (!doc) {
      return null;
    }
    return toShowroomResponse(doc);
  }

  async getAdminShowroom(): Promise<ShowroomResponseDTO | null> {
    const doc = await getShowroomSettings();
    if (!doc) {
      return null;
    }
    return toShowroomResponse(doc);
  }

  async upsertShowroom(payload: UpsertShowroomRequestDTO, userId?: string) {
    const doc = await upsertShowroomSettings({
      ...payload,
      updatedBy: userId
    } as any);

    return toShowroomResponse(doc);
  }
}

