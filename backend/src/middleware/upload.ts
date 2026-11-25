import multer from "multer";

const storage = multer.memoryStorage();

const ALLOWED_IMAGE_MIMES = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);
const ALLOWED_IMAGE_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp"]);

export const uploadImage = multer({
  storage,
  limits: {
    fileSize: 8 * 1024 * 1024, // Maksimal 8 MB per file
  },
  fileFilter: (_req, file, cb) => {
    const ext = file.originalname.toLowerCase().slice(file.originalname.lastIndexOf("."));
    if (ALLOWED_IMAGE_MIMES.has(file.mimetype.toLowerCase()) && ALLOWED_IMAGE_EXTS.has(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Hanya file gambar raster (JPG, PNG, WEBP) yang diperbolehkan! SVG atau format lain ditolak demi keamanan."));
    }
  },
});

export const uploadZip = multer({
  storage,
  limits: {
    fileSize: 25 * 1024 * 1024, // Maksimal 25 MB per zip template
  },
  fileFilter: (_req, file, cb) => {
    const isZip =
      file.mimetype === "application/zip" ||
      file.mimetype === "application/x-zip-compressed" ||
      file.mimetype === "multipart/x-zip" ||
      file.originalname.toLowerCase().endsWith(".zip");
    if (isZip) {
      cb(null, true);
    } else {
      cb(new Error("Hanya file arsip .ZIP yang diperbolehkan!"));
    }
  },
});

