import React from "react";
import ReactDOM from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css";
import "./i18n";
import App from "./App";
import { registerSW } from "virtual:pwa-register";
import { APP_VERSION } from "./version";

window.addEventListener("pageshow", () => {
  const navEntries = performance.getEntriesByType("navigation");
  if (navEntries.length > 0 && navEntries[0].type === "back_forward") {
    window.location.reload();
  }
});

const storedVersion = localStorage.getItem("app_version");

if (storedVersion !== APP_VERSION) {
  localStorage.setItem("app_version", APP_VERSION);
  window.location.reload();
}

registerSW({ immediate: true });

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);