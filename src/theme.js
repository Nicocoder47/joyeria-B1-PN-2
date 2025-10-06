import { createTheme } from "@mui/material/styles"; // MUI

export default function themeFactory() { // Tema
  return createTheme({ // Config
    palette: { // Colores
      mode: "light", // Modo
      primary: { main: "#6B4E71" }, // Violeta
      secondary: { main: "#D4AF37" }, // Dorado
      background: { default: "#faf7f5", paper: "#fff" }, // Fondo
      text: { primary: "#1f1a24" } // Texto
    },
    shape: { borderRadius: 14 }, // Bordes
    components: { // Componentes
      MuiButton: { styleOverrides: { root: { textTransform: "none", borderRadius: 14 } } }, // Botón
      MuiCard: { styleOverrides: { root: { borderRadius: 18 } } } // Tarjeta
    },
    typography: { // Tipografía
      fontFamily: "Inter, system-ui, Helvetica, Arial, sans-serif", // Fuente
      h4: { fontWeight: 700 }, // Título
      h6: { fontWeight: 600 } // Subtítulo
    }
  });
}
