import { ShowroomSettingsDocument, ShowroomSettingsModel } from "../models/ShowroomSettings";

export const getShowroomSettings = async (): Promise<ShowroomSettingsDocument | null> => {
  return ShowroomSettingsModel.findOne().exec();
};

export const upsertShowroomSettings = async (
  payload: Partial<ShowroomSettingsDocument>
): Promise<ShowroomSettingsDocument> => {
  const existing = await ShowroomSettingsModel.findOne().exec();

  if (existing) {
    Object.assign(existing, payload);
    return existing.save();
  }

  const doc = new ShowroomSettingsModel(payload);
  return doc.save();
};

