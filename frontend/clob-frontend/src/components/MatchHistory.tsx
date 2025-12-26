import { useEffect, useState } from "react";

interface Time {
  secs_since_epoch: number;
  nanos_since_epoch: number;
}

interface Transaction {
  price: number;
  quantity: number;
  time: Time;
}

interface OrderBook {
  total_orders: number;
  buy_orders: Record<string, any[]>;
  sell_orders: Record<string, any[]>;
  transactions: Transaction[];
}

interface MatchHistoryProps {
  refreshTrigger?: number;
  limit?: number;
}

export default function MatchHistory({ refreshTrigger, limit = 15 }: MatchHistoryProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const fetchData = async () => {
    try {
      const res = await fetch("http://localhost:3000/clob-stats");
      const data: OrderBook = await res.json();
      
      // Get most recent transactions (reverse order)
      const recentTx = [...data.transactions].reverse().slice(0, limit);
      setTransactions(recentTx);
    } catch (err) {
      console.error("Failed to fetch transactions:", err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 2000); // Auto-refresh every 2 seconds
    return () => clearInterval(interval);
  }, [refreshTrigger, limit]);

  const formatTime = (time: Time) => {
    const date = new Date(time.secs_since_epoch * 1000);
    return date.toLocaleTimeString();
  };

  return (
    <div style={{ padding: "20px", fontFamily: "monospace", color: "#000" }}>
      <h2 style={{ marginBottom: "16px", fontSize: "1.5rem", fontWeight: "bold", color: "#000" }}>
        Recent Trades
      </h2>

      {transactions.length === 0 ? (
        <div style={{ color: "#888", padding: "20px", textAlign: "center" }}>
          No transactions yet
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#f0f0f0", borderBottom: "2px solid #ddd", color: "#000" }}>
                <th style={{ padding: "12px", textAlign: "left", color: "#000" }}>Time</th>
                <th style={{ padding: "12px", textAlign: "right", color: "#000" }}>Price</th>
                <th style={{ padding: "12px", textAlign: "right", color: "#000" }}>Quantity</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx, idx) => (
                <tr
                  key={idx}
                  style={{
                    borderBottom: "1px solid #eee",
                    backgroundColor: idx % 2 === 0 ? "#fafafa" : "white",
                    color: "#000"
                  }}
                >
                  <td style={{ padding: "8px", fontSize: "0.9rem", color: "#000" }}>
                    {formatTime(tx.time)}
                  </td>
                  <td
                    style={{
                      padding: "8px",
                      textAlign: "right",
                      fontWeight: "bold",
                      color: "#2563eb",
                    }}
                  >
                    ${tx.price}
                  </td>
                  <td style={{ padding: "8px", textAlign: "right", color: "#000" }}>
                    {tx.quantity}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ marginTop: "12px", fontSize: "0.85rem", color: "#666" }}>
        Showing {transactions.length} most recent trade{transactions.length !== 1 ? "s" : ""}
      </div>
    </div>
  );
}

