import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { MotionConfig } from "framer-motion";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { ConfirmProvider } from "./context/ConfirmContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ErrorBoundary } from "./components/ErrorBoundary";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {/* reducedMotion="user": si la persona activo "reducir movimiento" en su sistema,
        Framer Motion omite desplazamientos/escalas y deja solo cambios de opacidad. */}
    <MotionConfig reducedMotion="user">
      <ThemeProvider>
        <BrowserRouter>
          <ToastProvider>
            <ConfirmProvider>
              <AuthProvider>
                <ErrorBoundary>
                  <App />
                </ErrorBoundary>
              </AuthProvider>
            </ConfirmProvider>
          </ToastProvider>
        </BrowserRouter>
      </ThemeProvider>
    </MotionConfig>
  </React.StrictMode>
);
