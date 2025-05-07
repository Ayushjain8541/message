import React from "react";
import OrderCard from "./ordercard";

const OrderList = ({ messages, handleDelete, handleDriverChange, getDriverName }) => {
  return (
    <div className="messages-container" style={{ display: "flex", flexDirection: "column", gap: "0.75rem", maxHeight: "400px", overflowY: "auto", paddingRight: "0.5rem" }}>
      {messages.map((msg, index) => (
        <OrderCard
          key={msg.id || index}
          msg={msg}
          handleDelete={handleDelete}
          handleDriverChange={handleDriverChange}
          getDriverName={getDriverName}
        />
      ))}
    </div>
  );
};

export default OrderList;
