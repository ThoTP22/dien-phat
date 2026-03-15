import dotenv from "dotenv";

dotenv.config();

const getEnv = (key: string, defaultValue?: string): string => {
  const value = process.env[key] ?? defaultValue;
  if (!value) {
    throw new Error(`Missing required env var: ${key}`);
  }
  return value;
};

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 4000,
  mongoUri: getEnv("MONGODB_URI"),
  jwtSecret: getEnv("JWT_SECRET"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1d",
  s3Region: getEnv("S3_REGION"),
  s3BucketName: getEnv("S3_BUCKET_NAME"),
  s3AccessKeyId: getEnv("S3_ACCESS_KEY_ID"),
  s3SecretAccessKey: getEnv("S3_SECRET_ACCESS_KEY")
};

