// Detalle
import { useParams } from "react-router-dom"; // Router
import { products } from "../data/products"; // Datos
import { Grid, Typography, Stack, Button, Chip, Card, CardMedia, CardContent } from "@mui/material"; // MUI
import { useCart } from "../store/cart"; // Estado

export default function ProductDetail() { // Componente
  const { id } = useParams(); // Parámetro
  const { add } = useCart(); // Acción
  const p = products.find((x) => x.id === id); // Búsqueda

  if (!p) // Vacío
    return <Typography variant="h6" sx={{ mt: 4 }}>Producto no encontrado</Typography>; // Mensaje

  return ( // Render
    <Grid container spacing={4} sx={{ mt: 1 }}> {/* Grilla */}
      <Grid item xs={12} md={6}> {/* Imagen */}
        <Card>
          <CardMedia sx={{ height: 420 }} image={p.images?.[0] || "https://picsum.photos/800/600?blur=2"} />
        </Card>
      </Grid>

      <Grid item xs={12} md={6}> {/* Info */}
        <Stack gap={2}>
          <Typography variant="h4">{p.name}</Typography> {/* Nombre */}
          <Typography variant="h5">${p.price.toLocaleString("es-AR")}</Typography> {/* Precio */}
          <Stack direction="row" gap={1} alignItems="center"> {/* Chips */}
            <Chip label={p.category} />
            <Chip label={p.metal} />
            {p.stones && <Chip label={p.stones} />}
          </Stack>
          <Typography color="text.secondary">{p.description}</Typography> {/* Descripción */}
          <Typography variant="body2">Stock: {p.stock}</Typography> {/* Stock */}
          <Stack direction="row" gap={2}>
            <Button variant="contained" onClick={() => add(p, 1)}>Agregar</Button> {/* Agregar */}
            <Button variant="outlined" href="/">Volver</Button> {/* Volver */}
          </Stack>
        </Stack>
      </Grid>
    </Grid>
  );
}
