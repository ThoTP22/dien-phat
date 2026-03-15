import { FilterQuery } from "mongoose";
import { LeadDocument, LeadModel } from "../models/Lead";

export const createLead = async (payload: Partial<LeadDocument>): Promise<LeadDocument> => {
  const doc = new LeadModel(payload);
  return doc.save();
};

export const findLeadById = async (id: string): Promise<LeadDocument | null> => {
  return LeadModel.findById(id).exec();
};

export const listLeads = async (filter: {
  query: FilterQuery<LeadDocument>;
  page: number;
  limit: number;
  sort?: any;
}): Promise<{ items: LeadDocument[]; total: number }> => {
  const { query, page, limit, sort } = filter;
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    LeadModel.find(query).sort(sort).skip(skip).limit(limit).exec(),
    LeadModel.countDocuments(query).exec()
  ]);

  return { items, total };
};

export const updateLead = async (
  id: string,
  payload: Partial<LeadDocument>
): Promise<LeadDocument | null> => {
  return LeadModel.findByIdAndUpdate(id, payload, { new: true }).exec();
};

