import React, { useEffect, useState } from "react";
import { sendOrderWS } from "../../services/socket";

/**
 * Card component displays a player's panel and sends order updates via WS.
 * Props:
 *  - role: string (e.g. "RETAILER" or "Retailer")
 *  - roomId: string
 *  - gameState: object (inventory, backlog, orderBook, costs etc)
 */
export default function Card({ role = "RETAILER", roomId, gameState = {} }) {
  // normalize role keys: store uppercase internal key, display nicer label
  const roleKey = role?.toString().toUpperCase();
  const displayRole = roleKey.charAt(0) + roleKey.slice(1).toLowerCase();

  // default orderBook shape (upper-case keys)
  const defaultOrderBook = {
    RETAILER: 4,
    WHOLESALER: 4,
    DISTRIBUTOR: 4,
    MANUFACTURER: 4,
  };

  // derive initial order quantities from gameState.orderBook (if present)
  const initialOrderBook = (() => {
    const book = gameState?.orderBook || {};
    // make sure keys are uppercase
    const normalized = {
      RETAILER: book?.RETAILER ?? book?.Retailer ?? book?.retailer ?? defaultOrderBook.RETAILER,
      WHOLESALER: book?.WHOLESALER ?? book?.Wholesaler ?? book?.wholesaler ?? defaultOrderBook.WHOLESALER,
      DISTRIBUTOR: book?.DISTRIBUTOR ?? book?.Distributor ?? book?.distributor ?? defaultOrderBook.DISTRIBUTOR,
      MANUFACTURER: book?.MANUFACTURER ?? book?.Factory ?? book?.manufacturer ?? defaultOrderBook.MANUFACTURER,
    };
    return normalized;
  })();

  const [orderQuantities, setOrderQuantities] = useState(initialOrderBook);

  // When gameState.orderBook updates, sync local state
  useEffect(() => {
    if (gameState?.orderBook) {
      setOrderQuantities((prev) => ({
        ...prev,
        ...initialOrderBook,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(gameState?.orderBook)]);

  const changeOrder = (type) => {
    setOrderQuantities((prev) => {
      const prevValue = prev[roleKey] ?? 0;
      const newQty = Math.max(0, prevValue + (type === "inc" ? 1 : -1));

      // publish via websocket
      sendOrderWS({ roomId, role: roleKey, quantity: newQty });

      return { ...prev, [roleKey]: newQty };
    });
  };

  // helpers to read gameState values using uppercase keys or fallback to display-key
  const getByRole = (obj) => {
    if (!obj) return undefined;
    return obj[roleKey] ?? obj[displayRole] ?? obj[roleKey.toLowerCase()];
  };

  const inventory = getByRole(gameState.inventory) ?? 0;
  const backlog = getByRole(gameState.backlog) ?? 0;
  const cost = getByRole(gameState.costs) ?? 0;

  return (
    <div className="card-container">
      <div className="card-item">
        <div className="card-top">
          <img src="" alt="" className="card-icon" />
          <h3>{displayRole}</h3>
        </div>

        <div className="card-stats">
          <div>
            <p>Inventory</p>
            <h2>{inventory} units</h2>
          </div>
          <div>
            <p className="backorder-label">Backorder</p>
            <h2 className="backorder-value">{backlog} units</h2>
          </div>
        </div>

        <div className="card-order">
          <button onClick={() => changeOrder("dec")}>-</button>
          <span>{orderQuantities[roleKey]}</span>
          <button onClick={() => changeOrder("inc")}>+</button>
        </div>

        <p className="card-cost">
          Cost: ${Number(cost).toFixed(2)}
        </p>
      </div>
    </div>
  );
}
