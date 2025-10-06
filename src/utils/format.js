// Formato
export function formatPrice(value, currency = "ARS") { // Precio
  return new Intl.NumberFormat("es-AR", { // Local
    style: "currency", // Tipo
    currency, // Moneda
    minimumFractionDigits: 0, // Decimales
  }).format(value || 0); // Valor
}

export function truncateText(text, length = 60) { // Texto
  if (!text) return ""; // Vacío
  return text.length > length ? text.slice(0, length) + "…" : text; // Corte
}

export function capitalize(str = "") { // Capitalizar
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase(); // Letra
}
