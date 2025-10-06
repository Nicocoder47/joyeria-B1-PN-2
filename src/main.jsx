import React from "react"; // React
import ReactDOM from "react-dom/client"; // DOM
import { BrowserRouter } from "react-router-dom"; // Router
import App from "./App"; // Núcleo

ReactDOM.createRoot(document.getElementById("root")).render( // Raíz
  <React.StrictMode> {/* Modo */}
    <BrowserRouter> {/* Navegación */}
      <App /> {/* App */}
    </BrowserRouter>
  </React.StrictMode>
);
