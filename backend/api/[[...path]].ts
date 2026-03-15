import type { IncomingMessage, ServerResponse } from "http";
import app from "../src/app";
import { connectDatabase } from "../src/configs/database";

let dbConnected = false;

async function ensureDb() {
  if (!dbConnected) {
    try {
      await connectDatabase({ exitOnError: false });
      dbConnected = true;
    } catch (err) {
      console.error("DB connect failed", err);
      throw err;
    }
  }
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const path = (req.url?.split("?")[0] ?? "").replace(/^\/api/, "") || "/";
  if (path === "/ping" || path === "/api/ping") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true, t: Date.now() }));
    return;
  }
  await ensureDb();
  return app(req, res);
}
