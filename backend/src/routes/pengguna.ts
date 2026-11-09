import { Router } from "express";
import * as pengguna from "../controller/pengguna.js";
export const authRouter = Router();
authRouter.post(
  "/login",

  pengguna.login,
); // POST /api/auth/login

authRouter.post(
  "/daftar",

  pengguna.daftar,
); // POST /api/auth/daftar

export const penggunaRouter = Router();
penggunaRouter.get(
  "/",

  pengguna.daftarPengguna,
); // GET /api/pengguna
