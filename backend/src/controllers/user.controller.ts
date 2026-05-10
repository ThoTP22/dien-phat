import { Response } from "express";
import bcrypt from "bcryptjs";
import { AuthRequest } from "../middlewares/auth.middleware";
import { listUsers, findUserById, createUser, updateUser } from "../repositories/user.repository";
import { UserModel } from "../models/User";

export const listUsersAdminHandler = async (req: AuthRequest, res: Response) => {
  try {
    const { role, isActive } = req.query as Record<string, string>;

    const filter: { role?: string; isActive?: boolean } = {};
    if (role) filter.role = role;
    if (isActive === "true") filter.isActive = true;
    else if (isActive === "false") filter.isActive = false;

    const users = await listUsers(filter);

    return res.json({
      success: true,
      message: "Danh sách người dùng",
      data: users.map((u) => ({
        id: String(u._id),
        fullName: u.fullName,
        email: u.email,
        role: u.role,
        isActive: u.isActive,
        lastLoginAt: u.lastLoginAt ?? null,
        createdAt: u.createdAt
      }))
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Lỗi hệ thống";
    return res.status(500).json({ success: false, message });
  }
};

export const getUserByIdAdminHandler = async (req: AuthRequest, res: Response) => {
  try {
    const user = await findUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "Không tìm thấy người dùng" });
    }

    return res.json({
      success: true,
      data: {
        id: String(user._id),
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        lastLoginAt: user.lastLoginAt ?? null,
        createdAt: user.createdAt
      }
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Lỗi hệ thống";
    return res.status(500).json({ success: false, message });
  }
};

export const createUserAdminHandler = async (req: AuthRequest, res: Response) => {
  try {
    const { fullName, email, password, role } = req.body as {
      fullName: string;
      email: string;
      password: string;
      role: "admin" | "content_staff" | "technician";
    };

    const existing = await UserModel.findOne({ email }).lean().exec();
    if (existing) {
      return res.status(409).json({ success: false, message: "Email đã được sử dụng" });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await createUser({ fullName, email, passwordHash, role });

    return res.status(201).json({
      success: true,
      message: "Tạo tài khoản thành công",
      data: {
        id: String(user._id),
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Lỗi hệ thống";
    return res.status(500).json({ success: false, message });
  }
};

export const updateUserAdminHandler = async (req: AuthRequest, res: Response) => {
  try {
    const { fullName, password, role, isActive } = req.body as {
      fullName?: string;
      password?: string;
      role?: "admin" | "content_staff" | "technician";
      isActive?: boolean;
    };

    const updates: { fullName?: string; passwordHash?: string; role?: string; isActive?: boolean } = {};
    if (fullName !== undefined) updates.fullName = fullName;
    if (role !== undefined) updates.role = role;
    if (isActive !== undefined) updates.isActive = isActive;
    if (password) updates.passwordHash = await bcrypt.hash(password, 12);

    const user = await updateUser(req.params.id, updates);
    if (!user) {
      return res.status(404).json({ success: false, message: "Không tìm thấy người dùng" });
    }

    return res.json({
      success: true,
      message: "Cập nhật thành công",
      data: {
        id: String(user._id),
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Lỗi hệ thống";
    return res.status(500).json({ success: false, message });
  }
};
