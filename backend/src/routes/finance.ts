import { Router, type Request, type Response, type NextFunction } from "express";
import crypto from "crypto";
import * as finance from "../controller/finance.js";
import { authMiddleware, requireAdmin } from "../middleware/auth.js";

export const financeRouter = Router();

// Middleware khusus untuk endpoint pembersih otomatis (bisa dipicu cron job internal via X-Cron-Secret atau Admin)
function cronOrAdminAuth(req: Request, res: Response, next: NextFunction): void {
  const cronSecret = process.env.CRON_SECRET;
  const reqSecret = req.headers["x-cron-secret"];

  // 1. Verifikasi X-Cron-Secret jika CRON_SECRET dikonfigurasi di .env (Timing-Safe)
  if (cronSecret && typeof reqSecret === "string") {
    const secBuf = Buffer.from(cronSecret);
    const reqBuf = Buffer.from(reqSecret);
    if (secBuf.length === reqBuf.length && crypto.timingSafeEqual(secBuf, reqBuf)) {
      return next();
    }
  }

  // 2. Fallback: Wajib autentikasi token JWT Administrator
  authMiddleware(req as any, res, () => {
    requireAdmin(req as any, res, next);
  });
}

// Endpoint pembersih server otomatis
financeRouter.post("/cleanup-now", cronOrAdminAuth, finance.triggerCleanup); // POST /api/finance/cleanup-now

// Seluruh endpoint keuangan lainnya WAJIB autentikasi Administrator
financeRouter.use(authMiddleware, requireAdmin);

financeRouter.get("/summary", finance.getSummary); // GET /api/finance/summary
financeRouter.post("/expenses", finance.addExpense); // POST /api/finance/expenses
financeRouter.delete("/expenses/:id", finance.deleteExpense); // DELETE /api/finance/expenses/:id

