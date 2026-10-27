
import multer from "multer";
import path from "node:path";
import { mkdirSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";

const currentDir = path.dirname(fileURLToPath(import.meta.url));

// Save images in server/uploads/clients
const uploadDir = path.resolve(currentDir, "../../uploads/clients");

mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, uploadDir);
  },

  filename: (_req, file, callback) => {
    const extensions = {
      "image/jpeg": ".jpg",
      "image/png": ".png",
      "image/webp": ".webp",
      "image/gif": ".gif",
    };

    const extension = extensions[file.mimetype];

    callback(null, `${randomUUID()}${extension}`);
  },
});

const fileFilter = (_req, file, callback) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
  ];

  if (!allowedTypes.includes(file.mimetype)) {
    return callback(
      new Error("Only JPG, PNG, WEBP, and GIF images are allowed.")
    );
  }

  callback(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB maximum
    files: 1,
  },
});

export default upload;
