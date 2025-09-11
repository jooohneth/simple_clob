import CancelButton from "./components/CancelButton";
import ClobStats from "./components/ClobStats";
import CreateOrderForm from "./components/CreateOrderForm";

function App() {
  return (
    
    <div style={{ border: "1px solid grey", padding: "10px", borderRadius: "20px", background: "white" }}>
      <div className="p-8">
      <h1 style={{ color: "black"}}>CLOB Frontend</h1>
      <CreateOrderForm />
      {/* <CancelButton /> */}
    </div>
      <h1>CLOB Dashboard</h1>
      <ClobStats />
    </div>
  );
}

export default App;
