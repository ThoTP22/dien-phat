import { UserModel, UserDocument, UserRole } from "../models/User";

export const findUserByEmail = async (email: string): Promise<UserDocument | null> => {
  return UserModel.findOne({ email }).exec();
};

export const updateUserLastLogin = async (userId: string): Promise<void> => {
  await UserModel.findByIdAndUpdate(
    userId,
    { $set: { lastLoginAt: new Date() } },
    { new: false }
  ).exec();
};

export const listUsers = async (filter: { role?: string; isActive?: boolean } = {}) => {
  const query: Record<string, unknown> = {};
  if (filter.role) query.role = filter.role;
  if (filter.isActive !== undefined) query.isActive = filter.isActive;
  return UserModel.find(query).sort({ createdAt: -1 }).lean().exec();
};

export const findUserById = async (id: string) => {
  return UserModel.findById(id).lean().exec();
};

export const createUser = async (data: {
  fullName: string;
  email: string;
  passwordHash: string;
  role: UserRole;
}) => {
  const user = new UserModel(data);
  return user.save();
};

export const updateUser = async (
  id: string,
  data: Partial<{ fullName: string; passwordHash: string; role: UserRole; isActive: boolean }>
) => {
  return UserModel.findByIdAndUpdate(id, { $set: data }, { new: true }).lean().exec();
};

