import { Router } from "express";
import * as template from "../controller/template.js";
import { uploadZip, uploadImage } from "../middleware/upload.js";
import { authMiddleware, requireAdmin } from "../middleware/auth.js";

export const templateRouter = Router();

templateRouter.get("/", template.daftar); // GET /api/templates (public katalog)
templateRouter.get("/:slug", template.detail); // GET /api/templates/:slug (public detail)

// Endpoint khusus Admin:
templateRouter.get("/admin/semua", authMiddleware, requireAdmin, template.daftarAdmin); // GET /api/templates/admin/semua
templateRouter.post("/upload-zip", authMiddleware, requireAdmin, uploadZip.single("file"), template.uploadZipHandler); // POST /api/templates/upload-zip
templateRouter.post("/upload-cover", authMiddleware, requireAdmin, uploadImage.single("cover"), template.uploadCoverHandler); // POST /api/templates/upload-cover
templateRouter.post("/", authMiddleware, requireAdmin, template.tambah); // POST /api/templates
templateRouter.put("/:id", authMiddleware, requireAdmin, template.ubah); // PUT /api/templates/:id
templateRouter.delete("/:id", authMiddleware, requireAdmin, template.hapus); // DELETE /api/templates/:id

