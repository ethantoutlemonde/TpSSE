import { Router } from "express";
import { getProducts } from "../db";

const router = Router();

router.get("/", async (req, res) => {
  res.json(await getProducts());
});

export default router;
