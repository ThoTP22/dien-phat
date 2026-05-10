import { FilterQuery } from "mongoose";
import { RepairTicketDocument, RepairTicketModel } from "../models/RepairTicket";

export const generateTicketNumber = async (): Promise<string> => {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD
  const prefix = `PSC-${dateStr}-`;

  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

  const count = await RepairTicketModel.countDocuments({
    createdAt: { $gte: todayStart, $lt: todayEnd }
  }).exec();

  const seq = String(count + 1).padStart(2, "0");
  return `${prefix}${seq}`;
};

export const createRepairTicket = async (
  payload: Partial<RepairTicketDocument>
): Promise<RepairTicketDocument> => {
  const ticketNumber = await generateTicketNumber();
  const doc = new RepairTicketModel({ ...payload, ticketNumber });
  return doc.save();
};

export const findRepairTicketById = async (id: string): Promise<RepairTicketDocument | null> => {
  return RepairTicketModel.findById(id).populate("technician", "fullName email").exec();
};

export const listRepairTickets = async (filter: {
  query: FilterQuery<RepairTicketDocument>;
  page: number;
  limit: number;
  sort?: any;
}): Promise<{ items: RepairTicketDocument[]; total: number }> => {
  const { query, page, limit, sort } = filter;
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    RepairTicketModel.find(query)
      .populate("technician", "fullName email")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .exec(),
    RepairTicketModel.countDocuments(query).exec()
  ]);

  return { items, total };
};

export const countByStatus = async (): Promise<Record<string, number>> => {
  const result = await RepairTicketModel.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } }
  ]).exec();

  const map: Record<string, number> = {};
  for (const r of result) {
    map[r._id] = r.count;
  }
  return map;
};

export const updateRepairTicket = async (
  id: string,
  payload: Partial<RepairTicketDocument>
): Promise<RepairTicketDocument | null> => {
  return RepairTicketModel.findByIdAndUpdate(id, payload, { new: true })
    .populate("technician", "fullName email")
    .exec();
};

export const deleteRepairTicket = async (id: string): Promise<boolean> => {
  const result = await RepairTicketModel.findByIdAndDelete(id).exec();
  return result !== null;
};

export const updateTicketStatusImages = async (
  id: string,
  status: string,
  images: string[]
): Promise<RepairTicketDocument | null> => {
  return RepairTicketModel.findByIdAndUpdate(
    id,
    { $set: { [`statusImages.${status}`]: images } },
    { new: true }
  ).populate("technician", "fullName email").exec();
};
