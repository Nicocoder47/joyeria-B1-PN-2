// Moneda
import { useMemo } from "react"; // React

export default function useCurrency(value, currency = "ARS") { // Hook
  const formatted = useMemo(() => { // Formato
    return new Intl.NumberFormat("es-AR", { // Local
      style: "currency", // Tipo
      currency, // Moneda
      minimumFractionDigits: 0, // Decimales
    }).format(value || 0); // Valor
  }, [value, currency]); // Dependencias

  return formatted; // Retorno
}
