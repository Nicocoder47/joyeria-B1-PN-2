// Encabezado
import { AppBar, Toolbar, Typography, Box, IconButton, Badge, Button } from "@mui/material"; // MUI
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag"; // Carrito
import DiamondIcon from "@mui/icons-material/Diamond"; // Logo
import { Link, useNavigate } from "react-router-dom"; // Router
import { useCart } from "../store/cart"; // Estado

export default function NavBar() { // Componente
  const items = useCart((s) => s.items); // Items
  const navigate = useNavigate(); // Navegador
  const qty = items.reduce((a, b) => a + b.qty, 0); // Cantidad

  return ( // Render
    <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom: "1px solid #eee" }}> {/* Barra */}
      <Toolbar sx={{ gap: 2 }}> {/* Herramientas */}
        <DiamondIcon color="primary" /> {/* Ícono */}
        <Typography
          component={Link}
          to="/"
          variant="h6"
          sx={{ textDecoration: "none", color: "inherit", flexGrow: 1 }}
        >
          Joyas Shop {/* Marca */}
        </Typography>

        <Button onClick={() => navigate("/")} color="primary">Colección</Button> {/* Botón */}
        <IconButton onClick={() => navigate("/cart")} aria-label="cart"> {/* Carrito */}
          <Badge badgeContent={qty} color="secondary">
            <ShoppingBagIcon />
          </Badge>
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}
