export interface Time {
    secs_since_epoch: number;
    nanos_since_epoch: number;
}

export interface MatchDetail {
    price: number;
    quantity: number;
    timestamp: Time;
}

export interface CreateOrder {
    buy_order: boolean;
    price: number;
    quantity: number;
}

export interface CreateOrderResponse {
    status: string;
    order_id: number;
    filled_quantity: number;
    remaining_quantity: number;
    matches: MatchDetail[];
}

export interface SearchOrder {
    order_id: number;
}

export interface OrderStatusResponse {
    order_id: number;
    status: string;
    current_quantity: number;
    is_buy: boolean;
    price: number;
}

export async function createOrder(order: CreateOrder): Promise<CreateOrderResponse> {
    const res = await fetch("http://localhost:3000/orders", {method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(order)});

    if (!res.ok) {
        throw new Error(`Failed to create order: ${res.statusText}`)
    }

    return res.json();
}

export async function getOrderStatus(orderId: number): Promise<OrderStatusResponse> {
    const res = await fetch(`http://localhost:3000/order/${orderId}`);

    if (!res.ok) {
        throw new Error(`Failed to get order status: ${res.statusText}`)
    }

    return res.json();
}

export async function cancelOrder(order_num: SearchOrder) {
    const res = await fetch("http://localhost:3000/cancel", {method: "POST", headers: { "Content-Type" : "application/json" }, body: JSON.stringify(order_num)})

    if (!res.ok) {
        throw new Error(`Failed to cancel order: ${res.statusText}`)
    }

    return res.json();
}

