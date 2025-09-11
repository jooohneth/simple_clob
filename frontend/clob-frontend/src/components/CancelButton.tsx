import { useState } from "react";
import { cancelOrder } from "../api";

interface Response {
    responseCode: number,
    id: number,
}

export default function CancelButton() {
    const [id, setId] = useState("");
    const [response, setResponse] = useState<Response | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const numericId = Number(id);

        try {
            const result = await cancelOrder({ order_id: numericId });
            setResponse(result);
        } catch {
            console.error("Failed to cancel order");
        }
    }

    return (
        <div>
            <form action="" onSubmit={handleSubmit}>
                <label htmlFor="">
                    Cancel Order
                    <input type="text" name="" id="" onChange={(e) => setId(e.target.value)} placeholder="Enter order ID" />
                </label>
            </form>

            {response && (
                <pre className="mt-4 bg-gray-100 p-2 rounded">
                    {JSON.stringify(response, null, 2)}
                </pre>
            )}
        </div>
    )
}