import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import Splash from "./pages/common/Splash.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Splash />
  </StrictMode>,
);
