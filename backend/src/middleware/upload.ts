import multer from "multer";

const storage = multer.memoryStorage();

export const uploadImage = multer({
  storage,
  limits: {
    fileSize: 8 * 1024 * 1024, // Maksimal 8 MB per file
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Hanya file gambar (JPG, PNG, WEBP) yang diperbolehkan!"));
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

