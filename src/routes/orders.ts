import { Router } from "express";
import { getOrders } from "../db";

const router = Router();

router.get("/", async (req, res) => {
  res.json(await getOrders());
});

router.get("/:id", async (req, res) => {
  const orders = await getOrders();
  const order = orders.find((o) => o.id === Number(req.params.id));
  if (!order) {
    res.status(404).json({ error: "Commande introuvable" });
    return;
  }
  res.json(order);
});

export default router;
