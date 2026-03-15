import { Response } from "express";
import { AuthService } from "../services/auth.service";
import { LoginRequestDTO } from "../dto/requests/auth.dto";
import { AuthRequest } from "../middlewares/auth.middleware";

const authService = new AuthService();

export const login = async (req: AuthRequest, res: Response) => {
  const body = req.body as LoginRequestDTO;

  try {
    const result = await authService.login(body);

    return res.json({
      success: true,
      message: "Đăng nhập thành công",
      data: result
    });
  } catch (error: any) {
    return res.status(401).json({
      success: false,
      message: error.message || "Đăng nhập thất bại"
    });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Chưa đăng nhập"
    });
  }

  return res.json({
    success: true,
    message: "Thông tin người dùng hiện tại",
    data: {
      user: req.user
    }
  });
};

export const logout = async (_req: AuthRequest, res: Response) => {
  return res.json({
    success: true,
    message: "Đăng xuất thành công",
    data: {}
  });
};

