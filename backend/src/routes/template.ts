import { Router } from "express";
import * as template from "../controller/template.js";
import { uploadZip, uploadImage } from "../middleware/upload.js";

export const templateRouter = Router();

templateRouter.get("/", template.daftar); // GET /api/templates (public katalog)
templateRouter.get("/admin/semua", template.daftarAdmin); // GET /api/templates/admin/semua
templateRouter.post("/upload-zip", uploadZip.single("file"), template.uploadZipHandler); // POST /api/templates/upload-zip
templateRouter.post("/upload-cover", uploadImage.single("cover"), template.uploadCoverHandler); // POST /api/templates/upload-cover
templateRouter.get("/:slug", template.detail); // GET /api/templates/:slug
templateRouter.post("/", template.tambah); // POST /api/templates
templateRouter.put("/:id", template.ubah); // PUT /api/templates/:id
templateRouter.delete("/:id", template.hapus); // DELETE /api/templates/:id

