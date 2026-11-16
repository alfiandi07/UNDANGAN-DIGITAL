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

authRouter.post(
  "/verify-otp",
  pengguna.verifikasiOtpHandler,
); // POST /api/auth/verify-otp

authRouter.post(
  "/resend-otp",
  pengguna.kirimUlangOtpHandler,
); // POST /api/auth/resend-otp

export const penggunaRouter = Router();
penggunaRouter.get(
  "/",
  pengguna.daftarPengguna,
); // GET /api/pengguna

penggunaRouter.delete(
  "/:id",
  pengguna.hapusPenggunaHandler,
); // DELETE /api/pengguna/:id
