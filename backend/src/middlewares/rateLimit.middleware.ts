import type { Request, Response, NextFunction } from "express";

type Bucket = { resetAt: number; count: number };

const buckets = new Map<string, Bucket>();

function getIp(req: Request) {
  const xf = (req.headers["x-forwarded-for"] || "").toString();
  const ip = xf.split(",")[0]?.trim() || req.socket.remoteAddress || "unknown";
  return ip;
}

export function rateLimit(options: { windowMs: number; max: number; keyPrefix?: string }) {
  const windowMs = options.windowMs;
  const max = options.max;
  const keyPrefix = options.keyPrefix || "rl";

  return (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now();
    const key = `${keyPrefix}:${getIp(req)}`;

    const b = buckets.get(key);
    if (!b || now > b.resetAt) {
      buckets.set(key, { resetAt: now + windowMs, count: 1 });
      return next();
    }

    b.count += 1;
    if (b.count > max) {
      const retryAfter = Math.max(1, Math.ceil((b.resetAt - now) / 1000));
      res.setHeader("Retry-After", String(retryAfter));
      return res.status(429).json({
        success: false,
        message: "Bạn thao tác quá nhanh, vui lòng thử lại sau."
      });
    }

    return next();
  };
}

