import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import { PreviewProvider } from "./contexts/PreviewContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <PreviewProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </PreviewProvider>
  </BrowserRouter>
);
