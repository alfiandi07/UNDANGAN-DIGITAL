import { Router, type Request, type Response, type NextFunction } from "express";
import * as finance from "../controller/finance.js";
import { authMiddleware, requireAdmin } from "../middleware/auth.js";

export const financeRouter = Router();

// Middleware khusus untuk endpoint pembersih otomatis (bisa dipicu cron job internal atau Admin)
function cronOrAdminAuth(req: Request, res: Response, next: NextFunction): void {
  const cronSecret = process.env.CRON_SECRET || "asm-cron-cleanup-internal-token-2026";
  const reqSecret = req.headers["x-cron-secret"];
  const remoteIp = req.socket.remoteAddress || "";

  // 1. Izinkan jika membawa secret header cron
  if (reqSecret && reqSecret === cronSecret) {
    return next();
  }

  // 2. Izinkan jika request murni dari localhost loopback (cron server)
  if (remoteIp === "127.0.0.1" || remoteIp === "::1" || remoteIp === "::ffff:127.0.0.1") {
    return next();
  }

  // 3. Fallback: Verifikasi token JWT Administrator
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

