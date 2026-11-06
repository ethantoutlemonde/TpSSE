import { JsonDB, Config } from "node-json-db";
import { Order, Product, User } from "./types";

const db = new JsonDB(new Config("data/db", true, true, "/"));

export async function initDb() {
  if (await db.exists("/users")) return;

  const users: User[] = [
    { id: 1, name: "Alice Martin", username: "alice", email: "alice@mail.com" },
    { id: 2, name: "Bob Durand", username: "bob", email: "bob@mail.com" },
  ];
  const products: Product[] = [
    { id: 1, name: "Clavier", stock: 10 },
    { id: 2, name: "Souris", stock: 15 },
    { id: 3, name: "Ecran", stock: 5 },
  ];
  const orders: Order[] = [];

  await db.push("/users", users);
  await db.push("/products", products);
  await db.push("/orders", orders);
}

export function getUsers() {
  return db.getObject<User[]>("/users");
}

export function getProducts() {
  return db.getObject<Product[]>("/products");
}

export function getOrders() {
  return db.getObject<Order[]>("/orders");
}

export function saveProducts(products: Product[]) {
  return db.push("/products", products);
}

export function saveOrders(orders: Order[]) {
  return db.push("/orders", orders);
}
