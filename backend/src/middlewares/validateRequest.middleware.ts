import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

type Source = "body" | "query" | "params";

const formatZodError = (error: ZodError) => {
  const errors: Record<string, string[]> = {};

  error.issues.forEach((issue) => {
    const path = issue.path[0]?.toString() || "global";
    if (!errors[path]) {
      errors[path] = [];
    }
    errors[path].push(issue.message);
  });

  return errors;
};

export const validateRequest =
  (schema: ZodSchema, source: Source = "body") =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse((req as any)[source]);
      (req as any)[source] = parsed;
      return next();
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(400).json({
          success: false,
          message: "Dữ liệu không hợp lệ",
          errors: formatZodError(err)
        });
      }

      return res.status(400).json({
        success: false,
        message: "Dữ liệu không hợp lệ"
      });
    }
  };

