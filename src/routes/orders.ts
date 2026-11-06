import { Router } from "express";
import { getOrders, getProducts, getUsers, saveOrders, saveProducts } from "../db";
import { scheduleDelivery } from "../delivery";
import { sendOrder, sendStock, subscribe } from "../sse";
import { Order } from "../types";

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

router.get("/:id/events", async (req, res) => {
  const id = Number(req.params.id);
  const orders = await getOrders();
  const order = orders.find((o) => o.id === id);
  if (!order) {
    res.status(404).json({ error: "Commande introuvable" });
    return;
  }
  if (order.status === "delivered" || order.status === "cancelled") {
    res.status(204).end();
    return;
  }
  subscribe(req, res, id);
});

router.post("/", async (req, res) => {
  const { userId, productId, quantity } = req.body ?? {};

  if (!Number.isInteger(userId) || !Number.isInteger(productId) || !Number.isInteger(quantity) || quantity <= 0) {
    res.status(400).json({ error: "userId, productId et quantity sont obligatoires et doivent etre des entiers" });
    return;
  }

  const users = await getUsers();
  if (!users.find((u) => u.id === userId)) {
    res.status(404).json({ error: "Client introuvable" });
    return;
  }

  const products = await getProducts();
  const product = products.find((p) => p.id === productId);
  if (!product) {
    res.status(404).json({ error: "Produit introuvable" });
    return;
  }

  if (product.stock < quantity) {
    res.status(409).json({ error: "Stock insuffisant" });
    return;
  }

  const orders = await getOrders();
  const order: Order = {
    id: orders.length > 0 ? orders[orders.length - 1].id + 1 : 1,
    userId,
    productId,
    quantity,
    status: "preparing",
    createdAt: new Date().toISOString(),
  };

  product.stock -= quantity;
  orders.push(order);
  await saveProducts(products);
  await saveOrders(orders);

  sendOrder("order-created", order);
  sendStock(product);
  res.status(201).json(order);
});

router.patch("/:id", async (req, res) => {
  const { status } = req.body ?? {};

  const orders = await getOrders();
  const order = orders.find((o) => o.id === Number(req.params.id));
  if (!order) {
    res.status(404).json({ error: "Commande introuvable" });
    return;
  }

  if (status !== "shipped" && status !== "cancelled") {
    res.status(400).json({ error: "Statut invalide, valeurs possibles : shipped, cancelled" });
    return;
  }

  if (order.status !== "preparing") {
    res.status(409).json({ error: `La commande est deja ${order.status}` });
    return;
  }

  if (status === "shipped") {
    order.status = "shipped";
    await saveOrders(orders);
    sendOrder("order-status", order);
    scheduleDelivery(order.id);
    res.json(order);
    return;
  }

  const products = await getProducts();
  const product = products.find((p) => p.id === order.productId);
  if (product) {
    product.stock += order.quantity;
    await saveProducts(products);
    sendStock(product);
  }

  order.status = "cancelled";
  await saveOrders(orders);
  sendOrder("order-cancelled", order);
  res.json(order);
});

export default router;
