// Inicio
import { useMemo, useState, useEffect } from "react"; // React
import { Grid, Stack, Typography } from "@mui/material"; // MUI
import ProductCard from "../components/ProductCard"; // Tarjeta
import Filters from "../components/Filters"; // Filtros
import socket from "../services/socket"; // Socket

// inicialmente vacio; se cargará desde el servidor

export default function Home() { // Componente
  const [filters, setFilters] = useState({ q: "", cat: "", metal: "", price: [0, 200000] }); // Estado

  const [DATA, setDATA] = useState([]);

  useEffect(() => {
    let mounted = true;
    // fetch inicial
    fetch(import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/products` : '/products')
      .then((r) => r.json())
      .then((data) => { if (mounted) setDATA(data); })
      .catch((e) => console.error('Failed to fetch products', e));

    socket.on('productsUpdated', (productos) => setDATA(productos));
    socket.on('productAdded', (producto) => setDATA((prev) => [...prev, producto]));
    socket.on('productDeleted', (id) => setDATA((prev) => prev.filter(p => p.id !== id)));
    socket.on('productUpdated', (updated) => setDATA((prev) => prev.map(p => p.id === updated.id ? updated : p)));

    return () => { mounted = false; socket.off('productsUpdated'); socket.off('productAdded'); socket.off('productDeleted'); socket.off('productUpdated'); };
  }, []);

  const list = useMemo(() => { // Lista
    return DATA.filter((p) => { // Filtro
      const okQ = filters.q ? (p.name + " " + p.description).toLowerCase().includes(filters.q.toLowerCase()) : true; // Búsqueda
      const okC = filters.cat ? p.category === filters.cat : true; // Categoría
      const okM = filters.metal ? p.metal === filters.metal : true; // Metal
      const okP = p.price >= filters.price[0] && p.price <= filters.price[1]; // Precio
      return okQ && okC && okM && okP; // Retorno
    });
  }, [filters, DATA]); // Dependencias

  return ( // Render
    <Stack gap={3}> {/* Contenedor */}
      <Typography variant="h4">Colección destacada</Typography> {/* Título */}
      <Filters onChange={setFilters} /> {/* Filtros */}
      <Grid container spacing={3}> {/* Grilla */}
        {list.map((p) => ( // Iterar
          <Grid key={p.id} item xs={12} sm={6} md={4} lg={3}> {/* Item */}
            <ProductCard p={p} /> {/* Tarjeta */}
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
}
