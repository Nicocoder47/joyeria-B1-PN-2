// Inicio
import { useMemo, useState } from "react"; // React
import { Grid, Stack, Typography } from "@mui/material"; // MUI
import { products as DATA } from "../data/products"; // Datos
import ProductCard from "../components/ProductCard"; // Tarjeta
import Filters from "../components/Filters"; // Filtros

export default function Home() { // Componente
  const [filters, setFilters] = useState({ q: "", cat: "", metal: "", price: [0, 200000] }); // Estado

  const list = useMemo(() => { // Lista
    return DATA.filter((p) => { // Filtro
      const okQ = filters.q ? (p.name + " " + p.description).toLowerCase().includes(filters.q.toLowerCase()) : true; // Búsqueda
      const okC = filters.cat ? p.category === filters.cat : true; // Categoría
      const okM = filters.metal ? p.metal === filters.metal : true; // Metal
      const okP = p.price >= filters.price[0] && p.price <= filters.price[1]; // Precio
      return okQ && okC && okM && okP; // Retorno
    });
  }, [filters]); // Dependencias

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
