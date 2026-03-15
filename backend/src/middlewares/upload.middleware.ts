import multer from "multer";

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_COUNT = 10;

const storage = multer.memoryStorage();

export const uploadImages = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE_MB * 1024 * 1024,
    files: MAX_FILE_COUNT
  },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Chỉ hỗ trợ upload file hình ảnh"));
    }
    cb(null, true);
  }
}).array("files", MAX_FILE_COUNT);

