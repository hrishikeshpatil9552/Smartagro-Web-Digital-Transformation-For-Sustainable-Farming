// frontend/src/main.tsx
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const container = document.getElementById("root");
if (!container) {
  throw new Error("Root container element with id 'root' not found");
}

const root = createRoot(container);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// 👇 Service worker registration for push notifications
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/service-worker.js", { type: "module" }) // <--- FIX: Added { type: "module" }
    .then((reg) => {
      console.log("SW registered:", reg);
    })
    .catch((err) => {
      console.error("SW registration failed:", err);
    });
}