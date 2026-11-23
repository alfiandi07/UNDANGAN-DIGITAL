import { Router } from "express";
import * as pengguna from "../controller/pengguna.js";
import { authMiddleware, requireAdmin } from "../middleware/auth.js";
import { loginRateLimiter, otpRateLimiter } from "../middleware/rateLimiter.js";

export const authRouter = Router();

authRouter.post(
  "/login",
  loginRateLimiter,
  pengguna.login,
); // POST /api/auth/login

authRouter.post(
  "/daftar",
  pengguna.daftar,
); // POST /api/auth/daftar

authRouter.post(
  "/verify-otp",
  otpRateLimiter,
  pengguna.verifikasiOtpHandler,
); // POST /api/auth/verify-otp

authRouter.post(
  "/resend-otp",
  otpRateLimiter,
  pengguna.kirimUlangOtpHandler,
); // POST /api/auth/resend-otp

authRouter.post(
  "/forgot-password",
  otpRateLimiter,
  pengguna.lupaPasswordHandler,
); // POST /api/auth/forgot-password

authRouter.post(
  "/reset-password",
  otpRateLimiter,
  pengguna.resetPasswordHandler,
); // POST /api/auth/reset-password

export const penggunaRouter = Router();
penggunaRouter.get(
  "/",
  authMiddleware,
  requireAdmin,
  pengguna.daftarPengguna,
); // GET /api/pengguna (Admin Only)

penggunaRouter.put(
  "/:id",
  authMiddleware,
  pengguna.ubahPenggunaHandler,
); // PUT /api/pengguna/:id (Self or Admin)

penggunaRouter.delete(
  "/:id",
  authMiddleware,
  requireAdmin,
  pengguna.hapusPenggunaHandler,
); // DELETE /api/pengguna/:id (Admin Only)
