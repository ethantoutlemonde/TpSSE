import express from "express";
import { initDb } from "./db";
import { subscribe } from "./sse";
import ordersRouter from "./routes/orders";
import productsRouter from "./routes/products";
import usersRouter from "./routes/users";

const PORT = 3000;

const app = express();

app.use(express.json());

app.use("/users", usersRouter);
app.use("/products", productsRouter);
app.use("/orders", ordersRouter);

app.get("/events", (req, res) => {
  subscribe(req, res);
});

initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Serveur lance sur http://localhost:${PORT}`);
  });
});
