import React from "react";

function FraudAlertCard({ message, type }) {
  const color = type === "warning" ? "orange" : type === "danger" ? "red" : "green";

  return (
    <div style={{ border: `2px solid ${color}`, padding: "10px", margin: "10px 0" }}>
      {message}
    </div>
  );
}

export default FraudAlertCard;
