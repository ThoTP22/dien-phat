import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { ProductModel } from "../models/Product";
import { ProductCategoryModel } from "../models/ProductCategory";
import { LeadModel } from "../models/Lead";
import { PostModel } from "../models/Post";
import { RepairTicketModel } from "../models/RepairTicket";

export const getAnalyticsSummaryHandler = async (_req: AuthRequest, res: Response) => {
  try {
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const [
      totalProducts,
      totalCategories,
      leadStatusCounts,
      ticketStatusCounts,
      postStatusCounts,
      leadTrend,
    ] = await Promise.all([
      ProductModel.countDocuments({ isVisible: true }),
      ProductCategoryModel.countDocuments({}),
      LeadModel.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      RepairTicketModel.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      PostModel.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      // Leads theo ngày trong 7 ngày gần nhất
      LeadModel.aggregate([
        { $match: { createdAt: { $gte: sevenDaysAgo } } },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: "+07:00" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    // Normalise lead status counts
    const leadsBy: Record<string, number> = {};
    for (const { _id, count } of leadStatusCounts) leadsBy[_id] = count;

    // Normalise ticket status counts
    const ticketsBy: Record<string, number> = {};
    for (const { _id, count } of ticketStatusCounts) ticketsBy[_id] = count;

    // Normalise post status counts
    const postsBy: Record<string, number> = {};
    for (const { _id, count } of postStatusCounts) postsBy[_id] = count;

    // Fill in missing days in the lead trend (last 7 days)
    const trendMap: Record<string, number> = {};
    for (const { _id, count } of leadTrend) trendMap[_id] = count;

    const leadTrendFilled: { date: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const key = d.toLocaleDateString("sv-SE", { timeZone: "Asia/Ho_Chi_Minh" }); // "YYYY-MM-DD"
      leadTrendFilled.push({ date: key, count: trendMap[key] ?? 0 });
    }

    return res.json({
      success: true,
      message: "Thống kê tổng quan",
      data: {
        totalProducts,
        totalCategories,
        totalLeads: Object.values(leadsBy).reduce((s, v) => s + v, 0),
        leadsByStatus: leadsBy,
        totalTickets: Object.values(ticketsBy).reduce((s, v) => s + v, 0),
        ticketsByStatus: ticketsBy,
        postsByStatus: postsBy,
        leadTrend: leadTrendFilled,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Không thể tải thống kê",
    });
  }
};
