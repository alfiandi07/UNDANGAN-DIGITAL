import { Router } from "express";
import * as order from "../controller/order.js";
import { authMiddleware, requireAdmin } from "../middleware/auth.js";

export const orderRouter = Router();

orderRouter.post("/", order.createOrder); // POST /api/orders
orderRouter.post("/payment/webhook", order.midtransWebhook); // POST /api/orders/payment/webhook
orderRouter.post("/:orderId/simulasi-bayar", authMiddleware, requireAdmin, order.simulasiBayar); // POST /api/orders/:orderId/simulasi-bayar (Admin Only)
orderRouter.get("/my-orders", authMiddleware, order.getBuyerOrders); // GET /api/orders/my-orders (Protected)
orderRouter.get("/admin/all", authMiddleware, requireAdmin, order.getAllOrdersAdmin); // GET /api/orders/admin/all (Admin Only)
orderRouter.get("/:orderId", authMiddleware, order.getOrderDetail); // GET /api/orders/:orderId (Protected: Owner or Admin)

