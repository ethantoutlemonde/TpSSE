import { Request, Response } from "express";
import { Order, Product } from "./types";

type Client = {
  res: Response;
  orderId?: number;
};

let clients: Client[] = [];

export function subscribe(req: Request, res: Response, orderId?: number) {
  res.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });
  res.flushHeaders();

  const client: Client = { res, orderId };
  clients.push(client);

  req.on("close", () => {
    clients = clients.filter((c) => c !== client);
  });
}

function send(res: Response, event: string, data: Order | Product) {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

export function sendOrder(event: string, order: Order) {
  for (const client of clients) {
    if (client.orderId === undefined || client.orderId === order.id) {
      send(client.res, event, order);
    }
  }
}

export function sendStock(product: Product) {
  for (const client of clients) {
    if (client.orderId === undefined) {
      send(client.res, "stock", product);
    }
  }
}
