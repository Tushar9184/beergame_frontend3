import { useState } from "react";
import { sendOrderWS } from "../../services/socket";

export default function Card({ role, roomId, gameState }) {
  const [orderQuantities, setOrderQuantities] = useState(
    gameState?.orderBook || {
      Retailer: 4,
      Wholesaler: 4,
      Distributor: 4,
      Factory: 4,
    }
  );

  const changeOrder = (type) => {
    setOrderQuantities((prev) => {
      const newQty = Math.max(0, prev[role] + (type === "inc" ? 1 : -1));
      sendOrderWS({ roomId, role, quantity: newQty });
      return { ...prev, [role]: newQty };
    });
  };

  return (
    <div className="card-container">
      <div className="card-item">
        <div className="card-top">
          <img src="" alt="" className="card-icon" />
          <h3>{role}</h3>
        </div>

        <div className="card-stats">
          <div>
            <p>Inventory</p>
            <h2>{gameState?.inventory?.[role] ?? 0} units</h2>
          </div>
          <div>
            <p className="backorder-label">Backorder</p>
            <h2 className="backorder-value">
              {gameState?.backlog?.[role] ?? 0} units
            </h2>
          </div>
        </div>

        <div className="card-order">
          <button onClick={() => changeOrder("dec")}>-</button>
          <span>{orderQuantities[role]}</span>
          <button onClick={() => changeOrder("inc")}>+</button>
        </div>

        <p className="card-cost">
          Cost: ${gameState?.costs?.[role]?.toFixed(2) ?? "0.00"}
        </p>
      </div>
    </div>
  );
}
