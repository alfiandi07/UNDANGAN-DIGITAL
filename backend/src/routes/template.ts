import { Router } from "express";
import * as template from "../controller/template.js";

export const templateRouter = Router();

templateRouter.get("/", template.daftar); // GET /api/templates
templateRouter.get("/:slug", template.detail); // GET /api/templates/:slug
