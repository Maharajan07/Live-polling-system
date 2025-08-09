// src/components/KickedOut.jsx
import React from "react";
import "./KickedOut.css";

export default function KickedOut() {
  return (
    <div className="kicked-container">
      <button className="logo-btn">✦ Intervue Poll</button>
      <h1>You’ve been Kicked out !</h1>
      <p>
        Looks like the teacher has removed you from the poll system. Please try again sometime.
      </p>
    </div>
  );
}
