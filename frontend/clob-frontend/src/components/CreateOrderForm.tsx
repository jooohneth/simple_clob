import { useState } from "react";
import { createOrder } from "../api";
import "./create-order-form.css"

interface Response {
    responseCode: number,
    id: number,
}

export default function CreateOrderForm() {
    const [price, setPrice] = useState("");
    const [quantity, setQuantity] = useState("");
    const [buyOrder, setBuyOrder] = useState(true);
    const [response, setResponse] = useState<Response | null>(null);

    async function handleSubmit(e:React.FormEvent) { // give a pop up that generates as order submitted
        e.preventDefault();
        const numericPrice = price === "" ? 0 : Number(price);
        const numericQuantity = quantity === "" ? 0 : Number(quantity);

        if (numericPrice <= 0 || numericQuantity <= 0) {
            console.error("Price and quantity must be greater than 0.")
            return;
        }

        try {
            const result = await createOrder({ buy_order: buyOrder, price: numericPrice, quantity: numericQuantity });
            setResponse(result);
        } catch (err) {
            console.error("Failed to create order", err);
        }
    }

    return (
        <div className="p-4">
      <form style={{ display: "flex", flexDirection: "column", gap: "10px"}} onSubmit={handleSubmit} className="space-y-2">
        <div style={{ display: "flex", width: "100%", gap: "10px"}}>
          <button className="btn" style={{ flex: 1, background: "green" }}
            onClick={() => setBuyOrder(true)}>
            Buy
          </button>

          <button className="btn" style={{ flex: 1, background: "crimson" }}
            onClick={() => setBuyOrder(false)}>
            Sell
          </button>

        </div>

        <label className="buy-field">
          Price
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Enter Price"
          />
        </label>

        <label className="buy-field">
          Quantity
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="Enter Quantity"
          />
        </label>

        <button type="submit" disabled={!price || !quantity}>Create Order</button>
      </form>

      {response && (
        <pre className="mt-4 bg-gray-100 p-2 rounded">
          {JSON.stringify(response, null, 2)}
        </pre>
      )}
    </div>
    );
}