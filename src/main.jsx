import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import Splash from "./pages/common/Splash.jsx";
import { BrowserRouter as Router } from "react-router-dom";

const Root = () => {
  const [showSplash, setShowSplash] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return showSplash ? (
    <Splash />
  ) : (
    <Router>
      <App />
    </Router>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(<Root />);
