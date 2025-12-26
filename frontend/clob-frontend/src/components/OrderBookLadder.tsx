import { useEffect, useState } from "react";

interface Time {
  secs_since_epoch: number;
  nanos_since_epoch: number;
}

interface Order {
  buy_order: boolean;
  price: number;
  quantity: number;
  id: number;
  time_created: Time;
}

interface OrderBook {
  total_orders: number;
  buy_orders: Record<string, Order[]>;
  sell_orders: Record<string, Order[]>;
  transactions: any[];
}

interface PriceLevel {
  price: number;
  totalQuantity: number;
  orderCount: number;
  orders: Order[];
}

interface OrderBookLadderProps {
  refreshTrigger?: number;
}

export default function OrderBookLadder({ refreshTrigger }: OrderBookLadderProps) {
  const [data, setData] = useState<OrderBook | null>(null);
  const [expandedPrices, setExpandedPrices] = useState<Set<string>>(new Set());

  const fetchData = async () => {
    try {
      const res = await fetch("http://localhost:3000/clob-stats");
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Failed to fetch order book:", err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 2000); // Auto-refresh every 2 seconds
    return () => clearInterval(interval);
  }, [refreshTrigger]);

  const toggleExpand = (priceKey: string) => {
    setExpandedPrices((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(priceKey)) {
        newSet.delete(priceKey);
      } else {
        newSet.add(priceKey);
      }
      return newSet;
    });
  };

  if (!data) {
    return <div className="text-center p-4">Loading order book...</div>;
  }

  // Aggregate sell orders by price (ascending order for asks)
  const sellLevels: PriceLevel[] = Object.entries(data.sell_orders)
    .map(([price, orders]) => ({
      price: Number(price),
      totalQuantity: orders.reduce((sum, o) => sum + o.quantity, 0),
      orderCount: orders.length,
      orders,
    }))
    .sort((a, b) => b.price - a.price); // Display highest sell first (closest to spread)

  // Aggregate buy orders by price (descending order for bids)
  const buyLevels: PriceLevel[] = Object.entries(data.buy_orders)
    .map(([price, orders]) => ({
      price: Number(price),
      totalQuantity: orders.reduce((sum, o) => sum + o.quantity, 0),
      orderCount: orders.length,
      orders,
    }))
    .sort((a, b) => b.price - a.price); // Highest bid first

  // Calculate spread
  const bestBid = buyLevels.length > 0 ? buyLevels[0].price : 0;
  const bestAsk = sellLevels.length > 0 ? sellLevels[sellLevels.length - 1].price : 0;
  const spread = bestAsk && bestBid ? bestAsk - bestBid : 0;

  return (
    <div style={{ padding: "20px", fontFamily: "monospace", color: "#000" }}>
      <h2 style={{ marginBottom: "20px", fontSize: "1.5rem", fontWeight: "bold", color: "#000" }}>
        Order Book
      </h2>

      {/* ASKS (Sell Orders) */}
      <div style={{ marginBottom: "10px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            fontWeight: "bold",
            padding: "8px",
            backgroundColor: "#fee",
            borderRadius: "4px",
            color: "#000"
          }}
        >
          <div>Price</div>
          <div>Quantity</div>
          <div>Orders</div>
        </div>
        {sellLevels.length === 0 ? (
          <div style={{ padding: "8px", color: "#888" }}>No sell orders</div>
        ) : (
          sellLevels.map((level) => (
            <div key={`sell-${level.price}`}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  padding: "8px",
                  cursor: "pointer",
                  backgroundColor: "#ffeded",
                  borderBottom: "1px solid #ddd",
                }}
                onClick={() => toggleExpand(`sell-${level.price}`)}
              >
                <div style={{ color: "#c00" }}>${level.price}</div>
                <div style={{ color: "#000" }}>{level.totalQuantity}</div>
                <div style={{ color: "#000" }}>
                  {level.orderCount} order{level.orderCount > 1 ? "s" : ""}{" "}
                  {expandedPrices.has(`sell-${level.price}`) ? "▲" : "▼"}
                </div>
              </div>
              {expandedPrices.has(`sell-${level.price}`) && (
                <div style={{ paddingLeft: "20px", backgroundColor: "#fff5f5", color: "#000" }}>
                  {level.orders.map((order) => (
                    <div
                      key={order.id}
                      style={{
                        padding: "4px",
                        fontSize: "0.9rem",
                        borderBottom: "1px solid #eee",
                        color: "#000"
                      }}
                    >
                      Order #{order.id}: {order.quantity} @ ${order.price}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* SPREAD */}
      <div
        style={{
          textAlign: "center",
          padding: "12px",
          backgroundColor: "#f0f0f0",
          fontWeight: "bold",
          margin: "10px 0",
          borderRadius: "4px",
          color: "#000"
        }}
      >
        SPREAD: ${spread.toFixed(2)} {bestBid > 0 && bestAsk > 0 && `(${bestBid} ↔ ${bestAsk})`}
      </div>

      {/* BIDS (Buy Orders) */}
      <div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            fontWeight: "bold",
            padding: "8px",
            backgroundColor: "#efe",
            borderRadius: "4px",
            color: "#000"
          }}
        >
          <div>Price</div>
          <div>Quantity</div>
          <div>Orders</div>
        </div>
        {buyLevels.length === 0 ? (
          <div style={{ padding: "8px", color: "#888" }}>No buy orders</div>
        ) : (
          buyLevels.map((level) => (
            <div key={`buy-${level.price}`}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  padding: "8px",
                  cursor: "pointer",
                  backgroundColor: "#edfded",
                  borderBottom: "1px solid #ddd",
                }}
                onClick={() => toggleExpand(`buy-${level.price}`)}
              >
                <div style={{ color: "#0a0" }}>${level.price}</div>
                <div style={{ color: "#000" }}>{level.totalQuantity}</div>
                <div style={{ color: "#000" }}>
                  {level.orderCount} order{level.orderCount > 1 ? "s" : ""}{" "}
                  {expandedPrices.has(`buy-${level.price}`) ? "▲" : "▼"}
                </div>
              </div>
              {expandedPrices.has(`buy-${level.price}`) && (
                <div style={{ paddingLeft: "20px", backgroundColor: "#f5fff5", color: "#000" }}>
                  {level.orders.map((order) => (
                    <div
                      key={order.id}
                      style={{
                        padding: "4px",
                        fontSize: "0.9rem",
                        borderBottom: "1px solid #eee",
                        color: "#000"
                      }}
                    >
                      Order #{order.id}: {order.quantity} @ ${order.price}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

