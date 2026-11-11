import { Router } from "express";
import * as order from "../controller/order.js";

export const orderRouter = Router();

orderRouter.post("/", order.createOrder); // POST /api/orders
orderRouter.post("/payment/webhook", order.midtransWebhook); // POST /api/orders/payment/webhook
orderRouter.post("/:orderId/simulasi-bayar", order.simulasiBayar); // POST /api/orders/:orderId/simulasi-bayar
orderRouter.get("/my-orders", order.getBuyerOrders); // GET /api/orders/my-orders?email=...
orderRouter.get("/admin/all", order.getAllOrdersAdmin); // GET /api/orders/admin/all
orderRouter.get("/:orderId", order.getOrderDetail); // GET /api/orders/:orderId
