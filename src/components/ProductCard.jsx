// Tarjeta
import { Card, CardMedia, CardContent, Typography, CardActions, Button, Stack } from "@mui/material"; // MUI
import { Link } from "react-router-dom"; // Router
import { useCart } from "../store/cart"; // Estado

export default function ProductCard({ p }) { // Componente
  const add = useCart((s) => s.add); // Agregar

  return ( // Render
    <Card> {/* Contenedor */}
      <CardMedia
        component={Link} // Enlace
        to={`/product/${p.id}`} // Ruta
        sx={{ height: 220 }} // Altura
        image={p.images?.[0] || "https://picsum.photos/600/400?blur=2"} // Imagen
      />
      <CardContent> {/* Contenido */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1}> {/* Fila */}
          <Typography variant="h6">{p.name}</Typography> {/* Nombre */}
          <Typography variant="h6">${p.price.toLocaleString("es-AR")}</Typography> {/* Precio */}
        </Stack>
        <Typography variant="body2" color="text.secondary"> {/* Detalle */}
          {p.metal} • {p.category}
        </Typography>
      </CardContent>
      <CardActions> {/* Acciones */}
        <Button size="small" component={Link} to={`/product/${p.id}`}>Ver</Button> {/* Ver */}
        <Button size="small" variant="contained" onClick={() => add(p, 1)}>Agregar</Button> {/* Botón */}
      </CardActions>
    </Card>
  );
}
