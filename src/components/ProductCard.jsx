// Tarjeta
import { Card, CardMedia, CardContent, Typography, CardActions, Button, Stack } from "@mui/material"; // MUI
import { Link } from "react-router-dom"; // Router
import { useCart } from "../store/cart"; // Estado

export default function ProductCard({ p }) { // Componente
  const add = useCart((s) => s.add); // Agregar

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  const rawImg = p?.images?.[0];
  const imgSrc = rawImg
    ? (rawImg.startsWith('/assets/') ? `${API_BASE}${rawImg}` : rawImg)
    : 'https://picsum.photos/600/400?blur=2';

  return ( // Render
    <Card>
      <CardMedia
        component={Link}
        to={`/product/${p.id}`}
        sx={{ height: 220 }}
        image={imgSrc}
      />
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1}>
          <Typography variant="h6" sx={{ fontSize: 15, lineHeight: 1.2 }}>{p.name}</Typography>
          <Typography variant="h6" sx={{ fontSize: 15 }}>${p.price.toLocaleString("es-AR")}</Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
          {p.metal} • {p.category}
        </Typography>
      </CardContent>
      <CardActions sx={{ pt: 0 }}>
        <Button size="small" component={Link} to={`/product/${p.id}`}>Ver</Button>
        <Button size="small" variant="contained" onClick={() => add(p, 1)}>Agregar</Button>
      </CardActions>
    </Card>
  );
}
