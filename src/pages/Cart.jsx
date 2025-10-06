// Carrito
import { Stack, Typography, Button, Divider, Box } from "@mui/material"; // MUI
import { useCart } from "../store/cart"; // Estado
import { Link } from "react-router-dom"; // Router

export default function Cart() { // Componente
  const { items, remove, clear, total } = useCart(); // Datos

  if (!items.length) // Vacío
    return (
      <Stack alignItems="center" gap={2} mt={4}> {/* Contenedor */}
        <Typography variant="h5">Tu carrito está vacío</Typography> {/* Texto */}
        <Button variant="contained" component={Link} to="/">Ir a la tienda</Button> {/* Botón */}
      </Stack>
    );

  return ( // Render
    <Stack gap={3} mt={3}> {/* Contenedor */}
      <Typography variant="h4">Tu carrito</Typography> {/* Título */}

      {items.map((p) => ( // Iterar
        <Box key={p.id}> {/* Caja */}
          <Stack direction="row" justifyContent="space-between" alignItems="center"> {/* Fila */}
            <Typography>{p.name}</Typography> {/* Nombre */}
            <Typography>${p.price.toLocaleString("es-AR")}</Typography> {/* Precio */}
            <Typography>x{p.qty}</Typography> {/* Cantidad */}
            <Button color="error" onClick={() => remove(p.id)}>Eliminar</Button> {/* Botón */}
          </Stack>
          <Divider sx={{ my: 1 }} /> {/* Línea */}
        </Box>
      ))}

      <Typography variant="h6">Total: ${total().toLocaleString("es-AR")}</Typography> {/* Total */}
      <Stack direction="row" gap={2}> {/* Botones */}
        <Button color="error" onClick={clear}>Vaciar</Button> {/* Vaciar */}
        <Button variant="contained">Finalizar compra</Button> {/* Comprar */}
      </Stack>
    </Stack>
  );
}
