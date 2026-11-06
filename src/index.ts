import express from "express";
import { initDb } from "./db";
import ordersRouter from "./routes/orders";
import productsRouter from "./routes/products";
import usersRouter from "./routes/users";

const PORT = 3000;

const app = express();

app.use(express.json());

app.use("/users", usersRouter);
app.use("/products", productsRouter);
app.use("/orders", ordersRouter);

initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Serveur lance sur http://localhost:${PORT}`);
  });
});
