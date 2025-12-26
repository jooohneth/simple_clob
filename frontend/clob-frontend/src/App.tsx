import { useState } from "react";
import CreateOrderForm from "./components/CreateOrderForm";
import OrderBookLadder from "./components/OrderBookLadder";
import MatchHistory from "./components/MatchHistory";

function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleOrderCreated = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div style={{ 
      minHeight: "100vh", 
      backgroundColor: "#f5f5f5", 
      padding: "20px",
      color: "#000"
    }}>
      <div style={{ 
        width: "100%",
        maxWidth: "100%"
      }}>
        <h1 style={{ 
          fontSize: "2.5rem", 
          fontWeight: "bold", 
          marginBottom: "30px",
          color: "#000"
        }}>
          CLOB Trading Platform
        </h1>

        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "1fr 2fr",
          gap: "20px",
          marginBottom: "20px"
        }}>
          {/* Left Column - Order Form */}
          <div style={{ 
            border: "1px solid #ddd", 
            padding: "20px", 
            borderRadius: "8px", 
            backgroundColor: "white",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
          }}>
            <h2 style={{ 
              fontSize: "1.5rem", 
              fontWeight: "bold", 
              marginBottom: "16px",
              color: "#000"
            }}>
              Place Order
            </h2>
            <CreateOrderForm onOrderCreated={handleOrderCreated} />
          </div>

          {/* Right Column - Order Book */}
          <div style={{ 
            border: "1px solid #ddd", 
            padding: "20px", 
            borderRadius: "8px", 
            backgroundColor: "white",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
          }}>
            <OrderBookLadder refreshTrigger={refreshTrigger} />
          </div>
        </div>

        {/* Bottom Row - Match History */}
        <div style={{ 
          border: "1px solid #ddd", 
          padding: "20px", 
          borderRadius: "8px", 
          backgroundColor: "white",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
        }}>
          <MatchHistory refreshTrigger={refreshTrigger} limit={20} />
        </div>
      </div>
    </div>
  );
}

export default App;
