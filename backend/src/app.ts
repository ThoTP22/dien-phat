import express from "express";
import cors from "cors";
import morgan from "morgan";
import { login, getMe, logout } from "./controllers/auth.controller";
import { requireAuth } from "./middlewares/auth.middleware";
import {
  listCategoriesHandler,
  getCategoryBySlugHandler,
  getAdminCategoryByIdHandler,
  createCategoryHandler,
  updateCategoryHandler,
  deleteCategoryHandler
} from "./controllers/category.controller";
import {
  listProductsHandler,
  getProductBySlugHandler,
  getAdminProductByIdHandler,
  createProductHandler,
  updateProductHandler,
  deleteProductHandler,
  listProductSegmentsHandler
} from "./controllers/product.controller";
import { validateRequest } from "./middlewares/validateRequest.middleware";
import { loginSchema } from "./validators/auth.validator";
import {
  createCategorySchema,
  listCategoriesQuerySchema,
  updateCategorySchema
} from "./validators/category.validator";
import {
  createProductSchema,
  listProductsQuerySchema,
  updateProductSchema
} from "./validators/product.validator";
import { upsertShowroomSchema } from "./validators/showroom.validator";
import {
  getAdminShowroomHandler,
  getPublicShowroomHandler,
  upsertShowroomHandler
} from "./controllers/showroom.controller";
import {
  createLeadHandler,
  getLeadByIdHandler,
  listLeadsHandler,
  updateLeadStatusHandler
} from "./controllers/lead.controller";
import {
  createLeadSchema,
  listLeadsQuerySchema,
  updateLeadStatusSchema
} from "./validators/lead.validator";
import { uploadImages } from "./middlewares/upload.middleware";
import { uploadImagesHandler } from "./controllers/upload.controller";
import {
  createPostHandler,
  deletePostHandler,
  getAdminPostByIdHandler,
  getPublicPostBySlugHandler,
  listPublicPostsHandler,
  updatePostHandler
} from "./controllers/post.controller";
import { createPostSchema, listPostsQuerySchema, updatePostSchema } from "./validators/post.validator";

const app = express();

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((s) => s.trim())
  : ["http://localhost:3000", "http://127.0.0.1:3000"];

const corsOptions = {
  origin: (origin: string | undefined, cb: (err: Error | null, allow?: boolean) => void) => {
    if (!origin) return cb(null, true);
    const allowed = allowedOrigins.some((o) => {
      if (o.startsWith("*.")) {
        const pattern = "^https?://" + o.replace(/\./g, "\\.").replace("*", "[a-zA-Z0-9-]+") + "$";
        return new RegExp(pattern).test(origin);
      }
      return origin === o;
    });
    cb(null, allowed);
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan("dev"));

// Vercel serverless: req.url có thể thiếu prefix /api (vd: /v1/showroom thay vì /api/v1/showroom)
app.use((req, _res, next) => {
  const u = req.url?.split("?")[0] ?? "";
  if (u && !u.startsWith("/api")) {
    (req as { url?: string }).url = "/api" + (u.startsWith("/") ? u : "/" + u) + (req.url?.includes("?") ? "?" + req.url.split("?")[1] : "");
  }
  next();
});

app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "API khỏe",
    data: { uptime: process.uptime() }
  });
});

// Auth routes theo api-spec.md
app.post("/api/v1/auth/login", validateRequest(loginSchema, "body"), login);
app.get("/api/v1/auth/me", requireAuth, getMe);
app.post("/api/v1/auth/logout", requireAuth, logout);

// Category routes theo api-spec.md
app.get(
  "/api/v1/categories",
  validateRequest(listCategoriesQuerySchema, "query"),
  listCategoriesHandler
);
app.get("/api/v1/categories/:slug", getCategoryBySlugHandler);

app.get("/api/v1/admin/categories/:id", requireAuth, getAdminCategoryByIdHandler);
app.post(
  "/api/v1/admin/categories",
  requireAuth,
  validateRequest(createCategorySchema, "body"),
  createCategoryHandler
);
app.patch(
  "/api/v1/admin/categories/:id",
  requireAuth,
  validateRequest(updateCategorySchema, "body"),
  updateCategoryHandler
);
app.delete("/api/v1/admin/categories/:id", requireAuth, deleteCategoryHandler);

// Product routes theo api-spec.md
app.get(
  "/api/v1/products",
  validateRequest(listProductsQuerySchema, "query"),
  listProductsHandler
);
app.get("/api/v1/products/segments", listProductSegmentsHandler);
app.get("/api/v1/products/:slug", getProductBySlugHandler);

app.get(
  "/api/v1/admin/products",
  requireAuth,
  validateRequest(listProductsQuerySchema, "query"),
  listProductsHandler
);
app.get("/api/v1/admin/products/:id", requireAuth, getAdminProductByIdHandler);
app.post(
  "/api/v1/admin/products",
  requireAuth,
  validateRequest(createProductSchema, "body"),
  createProductHandler
);
app.patch(
  "/api/v1/admin/products/:id",
  requireAuth,
  validateRequest(updateProductSchema, "body"),
  updateProductHandler
);
app.delete("/api/v1/admin/products/:id", requireAuth, deleteProductHandler);

// Showroom routes theo api-spec.md
app.get("/api/v1/showroom", getPublicShowroomHandler);
app.get("/api/v1/admin/showroom", requireAuth, getAdminShowroomHandler);
app.put(
  "/api/v1/admin/showroom",
  requireAuth,
  validateRequest(upsertShowroomSchema, "body"),
  upsertShowroomHandler
);

// Lead routes theo api-spec.md
app.post("/api/v1/leads", validateRequest(createLeadSchema, "body"), createLeadHandler);
app.get(
  "/api/v1/admin/leads",
  requireAuth,
  validateRequest(listLeadsQuerySchema, "query"),
  listLeadsHandler
);
app.get("/api/v1/admin/leads/:id", requireAuth, getLeadByIdHandler);
app.patch(
  "/api/v1/admin/leads/:id",
  requireAuth,
  validateRequest(updateLeadStatusSchema, "body"),
  updateLeadStatusHandler
);

// Upload routes theo api-spec.md
app.post(
  "/api/v1/uploads/images",
  requireAuth,
  uploadImages,
  uploadImagesHandler
);

// Posts routes theo api-spec.md
app.get("/api/v1/posts", validateRequest(listPostsQuerySchema, "query"), listPublicPostsHandler);
app.get("/api/v1/posts/:slug", getPublicPostBySlugHandler);

app.get("/api/v1/admin/posts/:id", requireAuth, getAdminPostByIdHandler);
app.post("/api/v1/admin/posts", requireAuth, validateRequest(createPostSchema, "body"), createPostHandler);
app.patch("/api/v1/admin/posts/:id", requireAuth, validateRequest(updatePostSchema, "body"), updatePostHandler);
app.delete("/api/v1/admin/posts/:id", requireAuth, deletePostHandler);

export default app;

