import { Router } from "express";
import { getUsers } from "../db";

const router = Router();

router.get("/", async (req, res) => {
  res.json(await getUsers());
});

export default router;
