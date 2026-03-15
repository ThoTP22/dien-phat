import bcrypt from "bcryptjs";
import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../configs/env";
import { findUserByEmail, updateUserLastLogin } from "../repositories/user.repository";
import { LoginRequestDTO } from "../dto/requests/auth.dto";
import { LoginResponseDTO, toAuthUserResponse } from "../dto/responses/auth.dto";

export class AuthService {
  async login(payload: LoginRequestDTO): Promise<LoginResponseDTO> {
    const user = await findUserByEmail(payload.email);

    if (!user) {
      throw new Error("Email hoặc mật khẩu không đúng");
    }

    if (!user.isActive) {
      throw new Error("Tài khoản đã bị khóa");
    }

    const isMatch = await bcrypt.compare(payload.password, user.passwordHash);
    if (!isMatch) {
      throw new Error("Email hoặc mật khẩu không đúng");
    }

    const token = jwt.sign(
      {
        sub: user._id.toString(),
        role: user.role
      },
      env.jwtSecret,
      { expiresIn: env.jwtExpiresIn } as SignOptions
    );

    await updateUserLastLogin(user._id.toString());

    return {
      accessToken: token,
      user: toAuthUserResponse(user)
    };
  }
}

