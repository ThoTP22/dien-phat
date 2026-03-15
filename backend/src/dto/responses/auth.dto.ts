import { UserDocument } from "../../models/User";

export interface AuthUserResponseDTO {
  id: string;
  fullName: string;
  email: string;
  role: string;
}

export interface LoginResponseDTO {
  accessToken: string;
  user: AuthUserResponseDTO;
}

export const toAuthUserResponse = (user: UserDocument): AuthUserResponseDTO => ({
  id: user._id.toString(),
  fullName: user.fullName,
  email: user.email,
  role: user.role
});

