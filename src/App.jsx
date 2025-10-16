// Núcleo
import { useMemo } from "react"; // Memo
import { Routes, Route, Link } from "react-router-dom"; // Rutas
import { ThemeProvider, CssBaseline, Container } from "@mui/material"; // UI

import themeFactory from "./theme"; // Tema
import NavBar from "./components/NavBar"; // Barra
import Home from "./pages/Home"; // Inicio
import ProductDetail from "./pages/ProductDetail"; // Detalle
import Cart from "./pages/Cart"; // Carrito
import Admin from "./pages/Admin"; // Admin

export default function App() { // Componente
  const theme = useMemo(() => themeFactory(), []); // Instancia

  return ( // Render
    <ThemeProvider theme={theme}> {/* Proveedor */}
      <CssBaseline /> {/* Base */}
      <NavBar /> {/* Navegación */}
      <Container sx={{ py: 4 }}> {/* Contenedor */}
        <Routes> {/* Enrutador */}
          <Route path="/" element={<Home />} /> {/* Inicio */}
          <Route path="/product/:id" element={<ProductDetail />} /> {/* Detalle */}
          <Route path="/cart" element={<Cart />} /> {/* Carrito */}
          <Route path="/admin" element={<Admin />} /> {/* Admin */}
          <Route
            path="*"
            element={<p>404 — <Link to="/">Volver</Link></p>}
          /> {/* Error */}
        </Routes>
      </Container>
    </ThemeProvider>
  );
}
