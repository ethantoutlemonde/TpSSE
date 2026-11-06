import express from "express";
import path from "path";
import { initDb } from "./db";
import { subscribe } from "./sse";
import ordersRouter from "./routes/orders";
import productsRouter from "./routes/products";
import usersRouter from "./routes/users";

const PORT = 3000;

const app = express();

app.use(express.json());

app.get(["/", "/index.html"], (req, res) => {
  res.redirect("/suivi.html");
});

app.use(express.static(path.join(__dirname, "..", "public")));

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
