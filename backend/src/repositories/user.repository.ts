import { UserModel, UserDocument } from "../models/User";

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

