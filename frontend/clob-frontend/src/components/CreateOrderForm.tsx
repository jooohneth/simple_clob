import { useState } from "react";
import { createOrder, CreateOrderResponse } from "../api";
import "./create-order-form.css"

interface CreateOrderFormProps {
    onOrderCreated?: () => void;
}

export default function CreateOrderForm({ onOrderCreated }: CreateOrderFormProps) {
    const [price, setPrice] = useState("");
    const [quantity, setQuantity] = useState("");
    const [buyOrder, setBuyOrder] = useState(true);
    const [response, setResponse] = useState<CreateOrderResponse | null>(null);
    const [notification, setNotification] = useState<string | null>(null);

    async function handleSubmit(e:React.FormEvent) {
        e.preventDefault();
        const numericPrice = price === "" ? 0 : Number(price);
        const numericQuantity = quantity === "" ? 0 : Number(quantity);

        if (numericPrice <= 0 || numericQuantity <= 0) {
            console.error("Price and quantity must be greater than 0.")
            setNotification("❌ Price and quantity must be greater than 0");
            setTimeout(() => setNotification(null), 3000);
            return;
        }

        try {
            const result = await createOrder({ buy_order: buyOrder, price: numericPrice, quantity: numericQuantity });
            setResponse(result);
            
            // Generate notification based on fill status
            let notifMessage = "";
            if (result.filled_quantity === numericQuantity) {
                notifMessage = `✅ Order #${result.order_id} FULLY FILLED: ${result.filled_quantity}/${numericQuantity} @ $${numericPrice}`;
            } else if (result.filled_quantity > 0) {
                notifMessage = `⚠️ Order #${result.order_id} PARTIALLY FILLED: ${result.filled_quantity}/${numericQuantity} @ avg price, ${result.remaining_quantity} remaining`;
            } else {
                notifMessage = `📝 Order #${result.order_id} OPEN: ${numericQuantity} @ $${numericPrice}`;
            }
            
            setNotification(notifMessage);
            setTimeout(() => setNotification(null), 5000);
            
            // Clear form
            setPrice("");
            setQuantity("");
            
            // Trigger order book refresh
            if (onOrderCreated) {
                onOrderCreated();
            }
        } catch (err) {
            console.error("Failed to create order", err);
            setNotification("❌ Failed to create order");
            setTimeout(() => setNotification(null), 3000);
        }
    }

    return (
        <div className="p-4" style={{ color: "#000" }}>
      {notification && (
        <div
          style={{
            padding: "12px",
            marginBottom: "16px",
            backgroundColor: notification.includes("✅") ? "#d4edda" : notification.includes("⚠️") ? "#fff3cd" : notification.includes("❌") ? "#f8d7da" : "#d1ecf1",
            border: "1px solid",
            borderColor: notification.includes("✅") ? "#c3e6cb" : notification.includes("⚠️") ? "#ffeeba" : notification.includes("❌") ? "#f5c6cb" : "#bee5eb",
            borderRadius: "4px",
            color: "#000",
            fontWeight: "bold",
          }}
        >
          {notification}
        </div>
      )}

      <form style={{ display: "flex", flexDirection: "column", gap: "10px"}} onSubmit={handleSubmit} className="space-y-2">
        <div style={{ display: "flex", width: "100%", gap: "10px"}}>
          <button 
            type="button"
            className="btn" 
            style={{ 
              flex: 1, 
              background: buyOrder ? "green" : "#ccc",
              color: buyOrder ? "white" : "#666"
            }}
            onClick={() => setBuyOrder(true)}>
            Buy
          </button>

          <button 
            type="button"
            className="btn" 
            style={{ 
              flex: 1, 
              background: !buyOrder ? "crimson" : "#ccc",
              color: !buyOrder ? "white" : "#666"
            }}
            onClick={() => setBuyOrder(false)}>
            Sell
          </button>

        </div>

        <label className="buy-field" style={{ color: "#000" }}>
          Price
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Enter Price"
            style={{ color: "#000" }}
          />
        </label>

        <label className="buy-field" style={{ color: "#000" }}>
          Quantity
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="Enter Quantity"
            style={{ color: "#000" }}
          />
        </label>

        <button type="submit" disabled={!price || !quantity}>
          Create {buyOrder ? "Buy" : "Sell"} Order
        </button>
      </form>

      {response && response.matches.length > 0 && (
        <div style={{ marginTop: "16px", padding: "12px", backgroundColor: "#f8f9fa", borderRadius: "4px", color: "#000" }}>
          <h3 style={{ marginBottom: "8px", fontSize: "1rem", fontWeight: "bold", color: "#000" }}>
            Match Details:
          </h3>
          {response.matches.map((match, idx) => (
            <div key={idx} style={{ padding: "4px", fontSize: "0.9rem", color: "#000" }}>
              • {match.quantity} units @ ${match.price}
            </div>
          ))}
          <div style={{ marginTop: "8px", fontWeight: "bold", color: "#000" }}>
            Total Filled: {response.filled_quantity} | Remaining: {response.remaining_quantity}
          </div>
        </div>
      )}
    </div>
    );
}