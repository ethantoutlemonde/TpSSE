import { getOrders, saveOrders } from "./db";
import { sendOrder } from "./sse";

const DELIVERY_DELAY = 20000;

export function scheduleDelivery(orderId: number) {
  setTimeout(async () => {
    const orders = await getOrders();
    const order = orders.find((o) => o.id === orderId);
    if (!order || order.status !== "shipped") return;

    order.status = "delivered";
    await saveOrders(orders);
    sendOrder("order-status", order);
  }, DELIVERY_DELAY);
}
