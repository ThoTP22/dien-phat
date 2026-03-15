/**
 * Script migrate danh mục dạng cây - KHÔNG XÓA, KHÔNG GHI ĐÈ dữ liệu hiện có.
 * Chỉ đảm bảo parentId tồn tại và in báo cáo.
 * Chạy: npx ts-node src/script/ensure-category-tree.ts
 */
import dotenv from "dotenv";
import mongoose from "mongoose";
import { ProductCategoryModel } from "../models/ProductCategory";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/gold_shop_midea";

async function main() {
  await mongoose.connect(MONGODB_URI);

  const all = await ProductCategoryModel.find({}).sort({ sortOrder: 1, name: 1 }).lean().exec();

  const roots = all.filter((c) => !c.parentId);
  const children = all.filter((c) => c.parentId);

  console.log("=== Báo cáo danh mục (không thay đổi dữ liệu) ===\n");
  console.log(`Tổng: ${all.length} danh mục`);
  console.log(`  - Danh mục gốc (parentId null): ${roots.length}`);
  console.log(`  - Danh mục con (có parentId): ${children.length}\n`);

  if (roots.length > 0) {
    console.log("Danh mục gốc:");
    roots.forEach((c) => console.log(`  - ${c.name} (${c.slug})`));
  }

  if (children.length > 0) {
    console.log("\nDanh mục con:");
    children.forEach((c) => {
      const pid = c.parentId ? String(c.parentId) : null;
      const parent = pid ? all.find((p) => String(p._id) === pid) : null;
      console.log(`  - ${c.name} (${c.slug}) <- ${parent?.name || "?"}`);
    });
  }

  console.log("\nHoàn tất. Dữ liệu không bị thay đổi.");
  console.log("Bạn có thể dùng giao diện admin để chỉnh parentId cho từng danh mục.");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
