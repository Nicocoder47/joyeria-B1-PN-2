// Filtro
import { useMemo, useState } from "react"; // React
import { Box, Stack, TextField, InputAdornment, MenuItem, Slider } from "@mui/material"; // MUI
import SearchIcon from "@mui/icons-material/Search"; // Icono
import { CATEGORIES, METALS } from "../data/products"; // Datos

export default function Filters({ onChange, priceRange = [0, 200000] }) { // Componente
  const [q, setQ] = useState(""); // Búsqueda
  const [cat, setCat] = useState(""); // Categoría
  const [metal, setMetal] = useState(""); // Metal
  const [price, setPrice] = useState(priceRange); // Precio

  const state = useMemo(() => ({ q, cat, metal, price }), [q, cat, metal, price]); // Estado
  useMemo(() => { onChange?.(state); }, [state, onChange]); // Aviso

  return ( // Render
    <Stack direction={{ xs: "column", md: "row" }} gap={2} alignItems="center"> {/* Layout */}
      <TextField
        fullWidth
        placeholder="Buscar joya…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        InputProps={{ startAdornment: (
          <InputAdornment position="start"><SearchIcon /></InputAdornment>
        )}} /* Adorno */
      />
      <TextField select label="Categoría" value={cat} onChange={(e) => setCat(e.target.value)} sx={{ minWidth: 180 }}>
        <MenuItem value="">Todas</MenuItem>
        {CATEGORIES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
      </TextField>
      <TextField select label="Metal" value={metal} onChange={(e) => setMetal(e.target.value)} sx={{ minWidth: 180 }}>
        <MenuItem value="">Todos</MenuItem>
        {METALS.map((m) => <MenuItem key={m} value={m}>{m}</MenuItem>)}
      </TextField>
      <Box sx={{ px: 2, minWidth: 220 }}>
        <Slider value={price} min={0} max={200000} step={5000} onChange={(_, v) => setPrice(v)} valueLabelDisplay="auto" /> {/* Control */}
      </Box>
    </Stack>
  );
}
