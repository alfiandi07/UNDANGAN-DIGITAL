import { Router } from "express";
import * as finance from "../controller/finance.js";

export const financeRouter = Router();

financeRouter.get("/summary", finance.getSummary); // GET /api/finance/summary
financeRouter.post("/expenses", finance.addExpense); // POST /api/finance/expenses
financeRouter.delete("/expenses/:id", finance.deleteExpense); // DELETE /api/finance/expenses/:id
financeRouter.post("/cleanup-now", finance.triggerCleanup); // POST /api/finance/cleanup-now
