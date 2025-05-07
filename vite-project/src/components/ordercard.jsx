import React from "react";

const OrderCard = ({ msg, handleDelete, handleDriverChange, getDriverName }) => {
  return (
    <div className="message-card">
      <div style={{ display: "flex", alignItems: "flex-start" }}>
        <div style={{
          background: "linear-gradient(to bottom right, #60a5fa, #6366f1)",
          width: "2rem", height: "2rem", borderRadius: "9999px",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "white", fontWeight: "bold", textTransform: "uppercase",
          fontSize: "0.875rem", marginRight: "0.75rem", flexShrink: 0
        }}>
           {msg?.text?.[0] || "?"} 
        </div>

        <div style={{ flexGrow: 1 }}>
          <p style={{ wordWrap: "break-word", overflowWrap: "break-word", whiteSpace: "pre-wrap" }}>{msg.text}</p>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.5rem" }}>
            <span style={{ fontSize: "0.75rem", color: "rgba(255, 255, 255, 0.6)" }}>
              {new Date().toLocaleDateString()}
            </span>

            <button
              onClick={() => handleDelete(msg.id)}
              style={{
                fontSize: "0.75rem", color: "rgba(255, 255, 255, 0.6)",
                display: "flex", alignItems: "center", background: "none",
                border: "none", cursor: "pointer", padding: 0
              }}
              onMouseOver={(e) => e.currentTarget.style.color = "#fca5a5"}
            >
              <svg xmlns="http://www.w3.org/2000/svg" style={{ height: "0.75rem", width: "0.75rem", marginRight: "0.25rem" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
          </div>

          <div style={{ marginTop: "0.5rem" }}>
            <select
              onChange={(e) => handleDriverChange(msg.id, e.target.value)}
              value={msg.driver_id || ""}
              style={{
                padding: "0.5rem", borderRadius: "0.25rem", border: "1px solid #ccc",
                background: "#1f2937", color: "white"
              }}
            >
              <option value="">Assign driver</option>
              {getDriverName && getDriverName().map(driver => (
                <option key={driver.id} value={driver.id}>
                  {driver.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderCard;
