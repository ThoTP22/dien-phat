import dotenv from "dotenv";
import mongoose from "mongoose";
import { ProductModel } from "../models/Product";
import { ProductCategoryModel } from "../models/ProductCategory";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/gold_shop_midea";

async function getOrCreateAirConditionerCategories() {
  const parentSlug = "dieu-hoa-treo-tuong";
  const monoSlug = "dieu-hoa-treo-tuong-mono-msfq-msfqb";
  const celestSlug = "dieu-hoa-treo-tuong-inverter-celest-msce";

  let parent = await ProductCategoryModel.findOne({ slug: parentSlug }).exec();
  if (!parent) {
    parent = await ProductCategoryModel.create({
      name: "Điều hòa treo tường Midea",
      slug: parentSlug,
      summary: "Danh mục điều hòa treo tường Midea tại showroom Điện Phát.",
      sortOrder: 1,
      isVisible: true
    });
  }

  let mono = await ProductCategoryModel.findOne({ slug: monoSlug }).exec();
  if (!mono) {
    mono = await ProductCategoryModel.create({
      name: "Điều hòa treo tường Mono (MSFQ/MSFQB)",
      slug: monoSlug,
      parentId: parent._id,
      summary: "Dòng điều hòa treo tường mono/non-inverter MSFQ, MSFQB.",
      sortOrder: 10,
      isVisible: true
    });
  }

  let celest = await ProductCategoryModel.findOne({ slug: celestSlug }).exec();
  if (!celest) {
    celest = await ProductCategoryModel.create({
      name: "Điều hòa treo tường Inverter Celest (MSCE)",
      slug: celestSlug,
      parentId: parent._id,
      summary: "Dòng điều hòa treo tường inverter Celest MSCE.",
      sortOrder: 20,
      isVisible: true
    });
  }

  return {
    parentId: parent._id,
    monoId: mono._id,
    celestId: celest._id
  };
}

async function seed() {
  await mongoose.connect(MONGODB_URI);
  const categories = await getOrCreateAirConditionerCategories();

  const now = new Date();

  const baseProducts = [
    {
      segment: "mono" as const,
      name: "Điều hòa Midea Mono 1 chiều 9000BTU 1HP MSFQ-09CRN8",
      slug: "dieu-hoa-midea-mono-1-chieu-9000btu-1hp-msfq-09crn8",
      modelCode: "MSFQ-09CRN8",
      shortDescription:
        "Điều hòa treo tường Midea 1 chiều non-inverter 9000BTU, gas R32, phù hợp phòng nhỏ.",
      description:
        "Model mono tiêu chuẩn của Midea cho nhu cầu làm mát cơ bản, phù hợp phòng ngủ hoặc phòng làm việc nhỏ. Hỗ trợ làm lạnh nhanh, dùng môi chất lạnh R32, xuất xứ Thái Lan.",
      featured: false,
      isVisible: true,
      images: [],
      features: [
        { title: "Làm lạnh nhanh", description: "Hỗ trợ làm mát nhanh cho không gian nhỏ." },
        { title: "Cold Catalyst", description: "Hỗ trợ lọc không khí và khử mùi cơ bản." },
        {
          title: "Silver Shield",
          description: "Lớp phủ chống ăn mòn tăng độ bền dàn trao đổi nhiệt."
        }
      ],
      specifications: [
        { group: "Tổng quan", key: "brand", name: "Thương hiệu", value: "Midea", sortOrder: 1 },
        { group: "Tổng quan", key: "series", name: "Dòng sản phẩm", value: "MSFQ", sortOrder: 2 },
        {
          group: "Tổng quan",
          key: "technology",
          name: "Công nghệ",
          value: "Mono / Non-inverter",
          sortOrder: 3
        },
        { group: "Tổng quan", key: "type", name: "Loại", value: "1 chiều", sortOrder: 4 },
        {
          group: "Hiệu suất",
          key: "capacity_btu",
          name: "Công suất làm lạnh",
          value: "9000",
          unit: "BTU",
          sortOrder: 5
        },
        {
          group: "Hiệu suất",
          key: "capacity_hp",
          name: "Công suất danh định",
          value: "1",
          unit: "HP",
          sortOrder: 6
        },
        { group: "Kỹ thuật", key: "refrigerant", name: "Môi chất lạnh", value: "R32", sortOrder: 7 },
        {
          group: "Khuyến nghị",
          key: "recommended_area",
          name: "Diện tích phù hợp",
          value: "Phòng nhỏ",
          sortOrder: 8
        },
        {
          group: "Bảo hành",
          key: "warranty_unit",
          name: "Bảo hành máy",
          value: "3 năm",
          sortOrder: 9
        },
        {
          group: "Bảo hành",
          key: "warranty_compressor",
          name: "Bảo hành máy nén",
          value: "5 năm",
          sortOrder: 10
        },
        { group: "Xuất xứ", key: "origin", name: "Xuất xứ", value: "Thái Lan", sortOrder: 11 }
      ],
      relatedProductIds: [],
      seo: {
        title: "Điều hòa Midea MSFQ-09CRN8 1HP Mono 9000BTU",
        description:
          "Điều hòa Midea MSFQ-09CRN8 1 chiều 9000BTU, gas R32, phù hợp phòng nhỏ, làm lạnh nhanh.",
        canonicalUrl: "/san-pham/dieu-hoa-midea-mono-1-chieu-9000btu-1hp-msfq-09crn8"
      }
    },
    {
      segment: "mono" as const,
      name: "Điều hòa Midea Mono 1 chiều 12000BTU 1.5HP MSFQ-12CRN8",
      slug: "dieu-hoa-midea-mono-1-chieu-12000btu-1-5hp-msfq-12crn8",
      modelCode: "MSFQ-12CRN8",
      shortDescription:
        "Điều hòa treo tường Midea 1 chiều non-inverter 12000BTU, gas R32, phù hợp phòng dưới 20m².",
      description:
        "Model mono 1.5HP của Midea với thiết kế treo tường, phù hợp phòng ngủ lớn, phòng làm việc hoặc shop nhỏ. Trang bị gas R32, làm lạnh nhanh và các lớp lọc cơ bản.",
      featured: false,
      isVisible: true,
      images: [],
      features: [
        {
          title: "Làm lạnh nhanh",
          description: "Đáp ứng nhu cầu làm mát nhanh trong phòng nhỏ và vừa."
        },
        { title: "Lưới lọc bụi HD", description: "Hỗ trợ lọc bụi cơ bản trong không khí." },
        { title: "Màng lọc diệt khuẩn", description: "Hỗ trợ cải thiện chất lượng không khí đầu vào." },
        { title: "Dàn đồng, chống ăn mòn", description: "Tăng độ bền khi sử dụng lâu dài." }
      ],
      specifications: [
        { group: "Tổng quan", key: "brand", name: "Thương hiệu", value: "Midea", sortOrder: 1 },
        { group: "Tổng quan", key: "series", name: "Dòng sản phẩm", value: "MSFQ", sortOrder: 2 },
        {
          group: "Tổng quan",
          key: "technology",
          name: "Công nghệ",
          value: "Mono / Non-inverter",
          sortOrder: 3
        },
        { group: "Tổng quan", key: "type", name: "Loại", value: "1 chiều", sortOrder: 4 },
        {
          group: "Hiệu suất",
          key: "capacity_btu",
          name: "Công suất làm lạnh",
          value: "12000",
          unit: "BTU",
          sortOrder: 5
        },
        {
          group: "Hiệu suất",
          key: "capacity_hp",
          name: "Công suất danh định",
          value: "1.5",
          unit: "HP",
          sortOrder: 6
        },
        { group: "Kỹ thuật", key: "refrigerant", name: "Môi chất lạnh", value: "R32", sortOrder: 7 },
        {
          group: "Khuyến nghị",
          key: "recommended_area",
          name: "Diện tích phù hợp",
          value: "Dưới 20",
          unit: "m²",
          sortOrder: 8
        },
        {
          group: "Bảo hành",
          key: "warranty_unit",
          name: "Bảo hành máy",
          value: "3 năm",
          sortOrder: 9
        },
        {
          group: "Bảo hành",
          key: "warranty_compressor",
          name: "Bảo hành máy nén",
          value: "5 năm",
          sortOrder: 10
        },
        { group: "Xuất xứ", key: "origin", name: "Xuất xứ", value: "Thái Lan", sortOrder: 11 }
      ],
      relatedProductIds: [],
      seo: {
        title: "Điều hòa Midea MSFQ-12CRN8 1.5HP Mono 12000BTU",
        description:
          "Điều hòa Midea MSFQ-12CRN8 1 chiều 12000BTU, gas R32, phù hợp phòng dưới 20m².",
        canonicalUrl: "/san-pham/dieu-hoa-midea-mono-1-chieu-12000btu-1-5hp-msfq-12crn8"
      }
    },
    {
      segment: "mono" as const,
      name: "Điều hòa Midea Mono 1 chiều 18000BTU 2HP MSFQB-18CRN8",
      slug: "dieu-hoa-midea-mono-1-chieu-18000btu-2hp-msfqb-18crn8",
      modelCode: "MSFQB-18CRN8",
      shortDescription:
        "Điều hòa treo tường Midea 1 chiều non-inverter 18000BTU, gas R32, phù hợp phòng khoảng 20–30m².",
      description:
        "Model mono 2HP của Midea cho phòng khách nhỏ, văn phòng hoặc cửa hàng. Thiết kế có LED hiển thị nhiệt độ trên dàn lạnh, làm lạnh nhanh và dùng gas R32.",
      featured: false,
      isVisible: true,
      images: [],
      features: [
        {
          title: "Làm lạnh nhanh",
          description: "Phù hợp nhu cầu làm mát nhanh cho không gian vừa."
        },
        { title: "LED hiển thị nhiệt độ", description: "Hiển thị trực quan trên dàn lạnh." },
        { title: "Lưới lọc bụi HD", description: "Hỗ trợ lọc bụi cơ bản." }
      ],
      specifications: [
        { group: "Tổng quan", key: "brand", name: "Thương hiệu", value: "Midea", sortOrder: 1 },
        { group: "Tổng quan", key: "series", name: "Dòng sản phẩm", value: "MSFQB", sortOrder: 2 },
        {
          group: "Tổng quan",
          key: "technology",
          name: "Công nghệ",
          value: "Mono / Non-inverter",
          sortOrder: 3
        },
        { group: "Tổng quan", key: "type", name: "Loại", value: "1 chiều", sortOrder: 4 },
        {
          group: "Hiệu suất",
          key: "capacity_btu",
          name: "Công suất làm lạnh",
          value: "18000",
          unit: "BTU",
          sortOrder: 5
        },
        {
          group: "Hiệu suất",
          key: "capacity_hp",
          name: "Công suất danh định",
          value: "2",
          unit: "HP",
          sortOrder: 6
        },
        { group: "Kỹ thuật", key: "refrigerant", name: "Môi chất lạnh", value: "R32", sortOrder: 7 },
        {
          group: "Khuyến nghị",
          key: "recommended_area",
          name: "Diện tích phù hợp",
          value: "20–30",
          unit: "m²",
          sortOrder: 8
        },
        {
          group: "Bảo hành",
          key: "warranty_unit",
          name: "Bảo hành máy",
          value: "3 năm",
          sortOrder: 9
        },
        {
          group: "Bảo hành",
          key: "warranty_compressor",
          name: "Bảo hành máy nén",
          value: "5 năm",
          sortOrder: 10
        },
        { group: "Xuất xứ", key: "origin", name: "Xuất xứ", value: "Thái Lan", sortOrder: 11 }
      ],
      relatedProductIds: [],
      seo: {
        title: "Điều hòa Midea MSFQB-18CRN8 2HP Mono 18000BTU",
        description:
          "Điều hòa Midea MSFQB-18CRN8 1 chiều 18000BTU, gas R32, phù hợp phòng 20–30m².",
        canonicalUrl: "/san-pham/dieu-hoa-midea-mono-1-chieu-18000btu-2hp-msfqb-18crn8"
      }
    },
    {
      segment: "mono" as const,
      name: "Điều hòa Midea Mono 1 chiều 24000BTU 2.5HP MSFQ-24CRN8",
      slug: "dieu-hoa-midea-mono-1-chieu-24000btu-2-5hp-msfq-24crn8",
      modelCode: "MSFQ-24CRN8",
      shortDescription:
        "Điều hòa treo tường Midea 1 chiều non-inverter 24000BTU, gas R32, phù hợp phòng dưới 40m².",
      description:
        "Model mono công suất lớn của Midea cho phòng khách, văn phòng hoặc lớp học nhỏ. Hỗ trợ làm lạnh nhanh và lớp phủ Silver Shield chống ăn mòn.",
      featured: false,
      isVisible: true,
      images: [],
      features: [
        {
          title: "Làm lạnh nhanh",
          description: "Tăng tốc độ làm mát cho không gian lớn hơn."
        },
        {
          title: "Silver Shield",
          description: "Lớp phủ chống ăn mòn tăng độ bền dàn trao đổi nhiệt."
        }
      ],
      specifications: [
        { group: "Tổng quan", key: "brand", name: "Thương hiệu", value: "Midea", sortOrder: 1 },
        { group: "Tổng quan", key: "series", name: "Dòng sản phẩm", value: "MSFQ", sortOrder: 2 },
        {
          group: "Tổng quan",
          key: "technology",
          name: "Công nghệ",
          value: "Mono / Non-inverter",
          sortOrder: 3
        },
        { group: "Tổng quan", key: "type", name: "Loại", value: "1 chiều", sortOrder: 4 },
        {
          group: "Hiệu suất",
          key: "capacity_btu",
          name: "Công suất làm lạnh",
          value: "24000",
          unit: "BTU",
          sortOrder: 5
        },
        {
          group: "Hiệu suất",
          key: "capacity_hp",
          name: "Công suất danh định",
          value: "2.5",
          unit: "HP",
          sortOrder: 6
        },
        { group: "Kỹ thuật", key: "refrigerant", name: "Môi chất lạnh", value: "R32", sortOrder: 7 },
        {
          group: "Khuyến nghị",
          key: "recommended_area",
          name: "Diện tích phù hợp",
          value: "Dưới 40",
          unit: "m²",
          sortOrder: 8
        },
        {
          group: "Bảo hành",
          key: "warranty_unit",
          name: "Bảo hành máy",
          value: "3 năm",
          sortOrder: 9
        },
        {
          group: "Bảo hành",
          key: "warranty_compressor",
          name: "Bảo hành máy nén",
          value: "5 năm",
          sortOrder: 10
        },
        { group: "Xuất xứ", key: "origin", name: "Xuất xứ", value: "Thái Lan", sortOrder: 11 }
      ],
      relatedProductIds: [],
      seo: {
        title: "Điều hòa Midea MSFQ-24CRN8 2.5HP Mono 24000BTU",
        description:
          "Điều hòa Midea MSFQ-24CRN8 1 chiều 24000BTU, gas R32, phù hợp phòng dưới 40m².",
        canonicalUrl: "/san-pham/dieu-hoa-midea-mono-1-chieu-24000btu-2-5hp-msfq-24crn8"
      }
    },
    {
      segment: "celest" as const,
      name: "Điều hòa Midea Inverter Celest 1 chiều 9000BTU 1HP MSCE-10CRFN8",
      slug: "dieu-hoa-midea-inverter-celest-1-chieu-9000btu-1hp-msce-10crfn8",
      modelCode: "MSCE-10CRFN8",
      shortDescription:
        "Điều hòa Midea Celest Inverter 1 chiều 9000BTU, AI ECOMASTER, COOL FLASH, PRIME GUARD, I-CLEAN.",
      description:
        "Điều hòa treo tường Midea Celest inverter 1HP cho phòng nhỏ. Nổi bật với AI ECOMASTER tiết kiệm điện, COOL FLASH làm lạnh nhanh, PRIME GUARD & HYPER GRAPFINS tăng độ bền và I-CLEAN tự làm sạch.",
      featured: true,
      isVisible: true,
      images: [],
      features: [
        { title: "AI ECOMASTER", description: "Tiết kiệm năng lượng thêm 30%." },
        { title: "COOL FLASH", description: "Làm mát nhanh 5°C chỉ trong 10 phút." },
        { title: "PRIME GUARD", description: "Tăng độ bền và tuổi thọ dàn nóng." },
        { title: "I-CLEAN", description: "Tự làm sạch bằng đóng băng trong 42 phút." },
        { title: "HYPER GRAPFINS", description: "Khả năng chống ăn mòn tốt hơn 12.5 lần." }
      ],
      specifications: [
        { group: "Tổng quan", key: "brand", name: "Thương hiệu", value: "Midea", sortOrder: 1 },
        {
          group: "Tổng quan",
          key: "series",
          name: "Dòng sản phẩm",
          value: "Celest / MSCE",
          sortOrder: 2
        },
        { group: "Tổng quan", key: "technology", name: "Công nghệ", value: "Inverter", sortOrder: 3 },
        { group: "Tổng quan", key: "type", name: "Loại", value: "1 chiều", sortOrder: 4 },
        {
          group: "Hiệu suất",
          key: "capacity_hp",
          name: "Công suất danh định",
          value: "1",
          unit: "HP",
          sortOrder: 5
        },
        {
          group: "Hiệu suất",
          key: "capacity_btu",
          name: "Công suất làm lạnh",
          value: "9000",
          unit: "BTU",
          sortOrder: 6
        },
        { group: "Kỹ thuật", key: "refrigerant", name: "Môi chất lạnh", value: "R32", sortOrder: 7 },
        {
          group: "Kích thước",
          key: "indoor_size_mm",
          name: "Kích thước dàn lạnh",
          value: "723x199x286",
          unit: "mm",
          sortOrder: 8
        },
        {
          group: "Kích thước",
          key: "outdoor_size_mm",
          name: "Kích thước dàn nóng",
          value: "668x252x469",
          unit: "mm",
          sortOrder: 9
        },
        {
          group: "Bảo hành",
          key: "warranty_unit",
          name: "Bảo hành máy",
          value: "3 năm",
          sortOrder: 10
        },
        {
          group: "Bảo hành",
          key: "warranty_compressor",
          name: "Bảo hành máy nén",
          value: "5 năm",
          sortOrder: 11
        },
        { group: "Xuất xứ", key: "origin", name: "Xuất xứ", value: "Thái Lan", sortOrder: 12 }
      ],
      relatedProductIds: [],
      seo: {
        title: "Điều hòa Midea MSCE-10CRFN8 Inverter Celest 1HP 9000BTU",
        description:
          "Điều hòa Midea Celest MSCE-10CRFN8 inverter 1 chiều 9000BTU với AI ECOMASTER, COOL FLASH, I-CLEAN.",
        canonicalUrl: "/san-pham/dieu-hoa-midea-inverter-celest-1-chieu-9000btu-1hp-msce-10crfn8"
      }
    },
    {
      segment: "celest" as const,
      name: "Điều hòa Midea Inverter Celest 1 chiều 12000BTU 1.5HP MSCE-13CRFN8",
      slug: "dieu-hoa-midea-inverter-celest-1-chieu-12000btu-1-5hp-msce-13crfn8",
      modelCode: "MSCE-13CRFN8",
      shortDescription:
        "Điều hòa Midea Celest Inverter 1 chiều 12000BTU, AI ECOMASTER, COOL FLASH, PRIME GUARD, I-CLEAN.",
      description:
        "Model inverter 1.5HP thuộc dòng Celest của Midea, phù hợp phòng ngủ lớn hoặc phòng làm việc. Tích hợp AI ECOMASTER, COOL FLASH, PRIME GUARD, I-CLEAN và HYPER GRAPFINS.",
      featured: true,
      isVisible: true,
      images: [],
      features: [
        { title: "AI ECOMASTER", description: "Tiết kiệm năng lượng thêm 30%." },
        { title: "COOL FLASH", description: "Làm mát nhanh 5°C chỉ trong 10 phút." },
        { title: "PRIME GUARD", description: "Tăng độ bền và tuổi thọ dàn nóng." },
        { title: "I-CLEAN", description: "Tự làm sạch bằng đóng băng trong 42 phút." },
        { title: "HYPER GRAPFINS", description: "Khả năng chống ăn mòn tốt hơn 12.5 lần." }
      ],
      specifications: [
        { group: "Tổng quan", key: "brand", name: "Thương hiệu", value: "Midea", sortOrder: 1 },
        {
          group: "Tổng quan",
          key: "series",
          name: "Dòng sản phẩm",
          value: "Celest / MSCE",
          sortOrder: 2
        },
        { group: "Tổng quan", key: "technology", name: "Công nghệ", value: "Inverter", sortOrder: 3 },
        { group: "Tổng quan", key: "type", name: "Loại", value: "1 chiều", sortOrder: 4 },
        {
          group: "Hiệu suất",
          key: "capacity_hp",
          name: "Công suất danh định",
          value: "1.5",
          unit: "HP",
          sortOrder: 5
        },
        {
          group: "Hiệu suất",
          key: "capacity_btu",
          name: "Công suất làm lạnh",
          value: "12000",
          unit: "BTU",
          sortOrder: 6
        },
        { group: "Kỹ thuật", key: "refrigerant", name: "Môi chất lạnh", value: "R32", sortOrder: 7 },
        {
          group: "Kích thước",
          key: "indoor_size_mm",
          name: "Kích thước dàn lạnh",
          value: "813x201x289",
          unit: "mm",
          sortOrder: 8
        },
        {
          group: "Kích thước",
          key: "outdoor_size_mm",
          name: "Kích thước dàn nóng",
          value: "668x252x469",
          unit: "mm",
          sortOrder: 9
        },
        {
          group: "Bảo hành",
          key: "warranty_unit",
          name: "Bảo hành máy",
          value: "3 năm",
          sortOrder: 10
        },
        {
          group: "Bảo hành",
          key: "warranty_compressor",
          name: "Bảo hành máy nén",
          value: "5 năm",
          sortOrder: 11
        },
        { group: "Xuất xứ", key: "origin", name: "Xuất xứ", value: "Thái Lan", sortOrder: 12 }
      ],
      relatedProductIds: [],
      seo: {
        title: "Điều hòa Midea MSCE-13CRFN8 Inverter Celest 1.5HP 12000BTU",
        description:
          "Điều hòa Midea Celest MSCE-13CRFN8 inverter 1 chiều 12000BTU với AI ECOMASTER, COOL FLASH, I-CLEAN.",
        canonicalUrl: "/san-pham/dieu-hoa-midea-inverter-celest-1-chieu-12000btu-1-5hp-msce-13crfn8"
      }
    },
    {
      segment: "celest" as const,
      name: "Điều hòa Midea Inverter Celest 1 chiều 18000BTU 2HP MSCE-19CRFN8",
      slug: "dieu-hoa-midea-inverter-celest-1-chieu-18000btu-2hp-msce-19crfn8",
      modelCode: "MSCE-19CRFN8",
      shortDescription:
        "Điều hòa Midea Celest Inverter 1 chiều 18000BTU, AI ECOMASTER, COOL FLASH, PRIME GUARD, I-CLEAN.",
      description:
        "Model inverter 2HP của dòng Celest, phù hợp phòng khách nhỏ, phòng họp hoặc cửa hàng. Tích hợp các công nghệ tiết kiệm điện, làm lạnh nhanh và tự làm sạch.",
      featured: true,
      isVisible: true,
      images: [],
      features: [
        { title: "AI ECOMASTER", description: "Tiết kiệm năng lượng thêm 30%." },
        { title: "COOL FLASH", description: "Làm mát nhanh 5°C chỉ trong 10 phút." },
        { title: "PRIME GUARD", description: "Tăng độ bền và tuổi thọ dàn nóng." },
        { title: "I-CLEAN", description: "Tự làm sạch bằng đóng băng trong 42 phút." },
        { title: "HYPER GRAPFINS", description: "Khả năng chống ăn mòn tốt hơn 12.5 lần." }
      ],
      specifications: [
        { group: "Tổng quan", key: "brand", name: "Thương hiệu", value: "Midea", sortOrder: 1 },
        {
          group: "Tổng quan",
          key: "series",
          name: "Dòng sản phẩm",
          value: "Celest / MSCE",
          sortOrder: 2
        },
        { group: "Tổng quan", key: "technology", name: "Công nghệ", value: "Inverter", sortOrder: 3 },
        { group: "Tổng quan", key: "type", name: "Loại", value: "1 chiều", sortOrder: 4 },
        {
          group: "Hiệu suất",
          key: "capacity_hp",
          name: "Công suất danh định",
          value: "2",
          unit: "HP",
          sortOrder: 5
        },
        {
          group: "Hiệu suất",
          key: "capacity_btu",
          name: "Công suất làm lạnh",
          value: "18000",
          unit: "BTU",
          sortOrder: 6
        },
        { group: "Kỹ thuật", key: "refrigerant", name: "Môi chất lạnh", value: "R32", sortOrder: 7 },
        {
          group: "Kích thước",
          key: "indoor_size_mm",
          name: "Kích thước dàn lạnh",
          value: "975x218x308",
          unit: "mm",
          sortOrder: 8
        },
        {
          group: "Kích thước",
          key: "outdoor_size_mm",
          name: "Kích thước dàn nóng",
          value: "765x303x555",
          unit: "mm",
          sortOrder: 9
        },
        {
          group: "Bảo hành",
          key: "warranty_unit",
          name: "Bảo hành máy",
          value: "3 năm",
          sortOrder: 10
        },
        {
          group: "Bảo hành",
          key: "warranty_compressor",
          name: "Bảo hành máy nén",
          value: "5 năm",
          sortOrder: 11
        },
        { group: "Xuất xứ", key: "origin", name: "Xuất xứ", value: "Thái Lan", sortOrder: 12 }
      ],
      relatedProductIds: [],
      seo: {
        title: "Điều hòa Midea MSCE-19CRFN8 Inverter Celest 2HP 18000BTU",
        description:
          "Điều hòa Midea Celest MSCE-19CRFN8 inverter 1 chiều 18000BTU với AI ECOMASTER, COOL FLASH, I-CLEAN.",
        canonicalUrl: "/san-pham/dieu-hoa-midea-inverter-celest-1-chieu-18000btu-2hp-msce-19crfn8"
      }
    },
    {
      segment: "celest" as const,
      name: "Điều hòa Midea Inverter Celest 1 chiều 24000BTU 2.5HP MSCE-25CRFN8",
      slug: "dieu-hoa-midea-inverter-celest-1-chieu-24000btu-2-5hp-msce-25crfn8",
      modelCode: "MSCE-25CRFN8",
      shortDescription:
        "Điều hòa Midea Celest Inverter 1 chiều 24000BTU, AI ECOMASTER, COOL FLASH, PRIME GUARD, I-CLEAN.",
      description:
        "Model inverter công suất lớn 2.5HP của dòng Celest cho không gian rộng hơn như phòng khách, văn phòng hoặc lớp học nhỏ. Tích hợp công nghệ tiết kiệm điện, làm lạnh nhanh và chống ăn mòn.",
      featured: true,
      isVisible: true,
      images: [],
      features: [
        { title: "AI ECOMASTER", description: "Tiết kiệm năng lượng thêm 30%." },
        { title: "COOL FLASH", description: "Làm mát nhanh 5°C chỉ trong 10 phút." },
        { title: "PRIME GUARD", description: "Tăng độ bền và tuổi thọ dàn nóng." },
        { title: "I-CLEAN", description: "Tự làm sạch bằng đóng băng trong 42 phút." },
        { title: "HYPER GRAPFINS", description: "Khả năng chống ăn mòn tốt hơn 12.5 lần." }
      ],
      specifications: [
        { group: "Tổng quan", key: "brand", name: "Thương hiệu", value: "Midea", sortOrder: 1 },
        {
          group: "Tổng quan",
          key: "series",
          name: "Dòng sản phẩm",
          value: "Celest / MSCE",
          sortOrder: 2
        },
        { group: "Tổng quan", key: "technology", name: "Công nghệ", value: "Inverter", sortOrder: 3 },
        { group: "Tổng quan", key: "type", name: "Loại", value: "1 chiều", sortOrder: 4 },
        {
          group: "Hiệu suất",
          key: "capacity_hp",
          name: "Công suất danh định",
          value: "2.5",
          unit: "HP",
          sortOrder: 5
        },
        {
          group: "Hiệu suất",
          key: "capacity_btu",
          name: "Công suất làm lạnh",
          value: "24000",
          unit: "BTU",
          sortOrder: 6
        },
        { group: "Kỹ thuật", key: "refrigerant", name: "Môi chất lạnh", value: "R32", sortOrder: 7 },
        {
          group: "Kích thước",
          key: "indoor_size_mm",
          name: "Kích thước dàn lạnh",
          value: "1055x231x330",
          unit: "mm",
          sortOrder: 8
        },
        {
          group: "Kích thước",
          key: "outdoor_size_mm",
          name: "Kích thước dàn nóng",
          value: "805x330x554",
          unit: "mm",
          sortOrder: 9
        },
        {
          group: "Bảo hành",
          key: "warranty_unit",
          name: "Bảo hành máy",
          value: "3 năm",
          sortOrder: 10
        },
        {
          group: "Bảo hành",
          key: "warranty_compressor",
          name: "Bảo hành máy nén",
          value: "5 năm",
          sortOrder: 11
        },
        { group: "Xuất xứ", key: "origin", name: "Xuất xứ", value: "Thái Lan", sortOrder: 12 }
      ],
      relatedProductIds: [],
      seo: {
        title: "Điều hòa Midea MSCE-25CRFN8 Inverter Celest 2.5HP 24000BTU",
        description:
          "Điều hòa Midea Celest MSCE-25CRFN8 inverter 1 chiều 24000BTU với AI ECOMASTER, COOL FLASH, I-CLEAN.",
        canonicalUrl: "/san-pham/dieu-hoa-midea-inverter-celest-1-chieu-24000btu-2-5hp-msce-25crfn8"
      }
    }
  ];

  for (const p of baseProducts) {
    const categoryId = p.segment === "celest" ? categories.celestId : categories.monoId;

    await ProductModel.findOneAndUpdate(
      { slug: p.slug },
      {
        ...p,
        categoryId,
        updatedAt: now,
        ...(p as any).createdAt ? {} : { createdAt: now }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).exec();
    console.log("Đã upsert sản phẩm:", p.name);
  }

  console.log("Hoàn tất seed sản phẩm Midea.");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});

