// Detalle
import { useParams, Link } from "react-router-dom"; // Router
import { useEffect, useState } from "react";
import { Grid, Typography, Stack, Button, Chip, Card, CardMedia } from "@mui/material"; // MUI
import { useCart } from "../store/cart"; // Estado

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function ProductDetail() { // Componente
  const { id } = useParams(); // Parámetro (usa el campo `id` del producto cuando viene de ProductCard)
  const { add } = useCart(); // Acción
  const [p, setP] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await fetch(`${API_BASE}/products/${id}`);
        if (!res.ok) throw new Error('Producto no encontrado');
        const data = await res.json();
        if (mounted) setP(data.payload || data);
      } catch (err) {
        console.error('Error fetching product detail:', err);
        if (mounted) setP(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [id]);

  if (loading) return <Typography variant="h6" sx={{ mt: 4 }}>Cargando producto...</Typography>;
  if (!p) return <Typography variant="h6" sx={{ mt: 4 }}>Producto no encontrado</Typography>;

  const rawImg = p?.images?.[0];
  const imgSrc = rawImg ? (rawImg.startsWith('/assets/') ? `${API_BASE}${rawImg}` : rawImg) : 'https://picsum.photos/800/600?blur=2';

  return (
    <Grid container spacing={4} sx={{ mt: 1 }}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardMedia sx={{ height: 420 }} image={imgSrc} />
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Stack gap={2}>
          <Typography variant="h4">{p.name}</Typography>
          <Typography variant="h5">${p.price?.toLocaleString?.("es-AR")}</Typography>
          <Stack direction="row" gap={1} alignItems="center">
            <Chip label={p.category} />
            <Chip label={p.metal} />
            {p.stones && <Chip label={p.stones} />}
          </Stack>
          {/* La descripción se muestra sólo en esta vista (no en las tarjetas) */}
          <Typography color="text.secondary">{p.description}</Typography>
          <Typography variant="body2">Stock: {p.stock}</Typography>
          <Stack direction="row" gap={2}>
            <Button variant="contained" onClick={() => add(p, 1)}>Agregar</Button>
            <Button variant="outlined" component={Link} to="/">Volver</Button>
          </Stack>
        </Stack>
      </Grid>
    </Grid>
  );
}
