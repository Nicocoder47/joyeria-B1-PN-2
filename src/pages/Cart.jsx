// Carrito
import { Stack, Typography, Button, Divider, Box, IconButton, Avatar, Snackbar, Alert } from "@mui/material"; // MUI
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';
import { useCart } from "../store/cart"; // Estado
import { Link } from "react-router-dom"; // Router
import { useState } from 'react';

export default function Cart() { // Componente
  const { items, remove, clear, total, setQty, syncToServer, loadFromServer } = useCart(); // Datos
  const [snack, setSnack] = useState({ open: false, severity: 'info', message: '' });

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  async function finalizarCompra() {
    try {
      let cartId = localStorage.getItem('joyas_cart_id');
      if (!cartId) {
        const r = await fetch(`${API_BASE}/carts`, { method: 'POST' });
        if (!r.ok) throw new Error('No se pudo crear el carrito');
        const data = await r.json();
        cartId = data?.payload?.id || data?.id || data;
        if (!cartId) throw new Error('Respuesta inválida al crear carrito');
        localStorage.setItem('joyas_cart_id', cartId);
      }
      // Crear orden en el backend (reduce stock, vacía carrito)
      const orderRes = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartId })
      });
      if (!orderRes.ok) {
        const txt = await orderRes.text().catch(() => '');
        throw new Error(`Order failed${txt ? `: ${txt}` : ''}`);
      }
      const orderData = await orderRes.json();
      const orderId = orderData?.payload?.orderId || orderData?.payload?.orderId || orderData?.orderId || null;
      // limpiar local
      localStorage.removeItem('joyas_cart_v1');
      // abrir confirmación
      if (orderId) window.open(`${API_BASE}/views/orders/${orderId}`, '_blank');
      setSnack({ open: true, severity: 'success', message: 'Pedido creado correctamente.' });
    } catch (e) {
      setSnack({ open: true, severity: 'error', message: `No se pudo finalizar la compra: ${e.message}` });
      console.error(e);
    }
  }

  if (!items.length) // Vacío
    return (
      <Stack alignItems="center" gap={2} mt={4}> {/* Contenedor */}
        <Typography variant="h5">Tu carrito está vacío</Typography> {/* Texto */}
        <Button variant="contained" component={Link} to="/">Ir a la tienda</Button> {/* Botón */}
      </Stack>
    );

  return ( // Render
    <Stack gap={3} mt={3}> {/* Contenedor */}
      <Typography variant="h4">Tu carrito</Typography> {/* Título */}

          {items.map((p, i) => { // Iterar
            const key = p.productId || p.id || `item-${i}`;
            const removeId = p.productId || p.id;
            const thumb = p.image ? (p.image.startsWith('/assets/') ? `${API_BASE}${p.image}` : p.image) : null;
            const lineSubtotal = (Number(p.price || 0) * Number(p.qty || 0));
            return (
              <Box key={key}> {/* Caja */}
                <Stack direction="row" justifyContent="space-between" alignItems="center" gap={2}> {/* Fila */}
                  <Avatar src={thumb} variant="square" sx={{ width: 64, height: 64 }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography>{p.name}</Typography>
                    <Typography variant="body2" color="text.secondary">${p.price.toLocaleString("es-AR")}</Typography>
                  </Box>

                  <Stack direction="row" alignItems="center" spacing={1}>
                    <IconButton size="small" onClick={() => {
                      const newQty = Math.max(1, (Number(p.qty || 1) - 1));
                      setQty(removeId, newQty);
                    }}>
                      <RemoveIcon fontSize="small" />
                    </IconButton>
                    <Typography>{p.qty}</Typography>
                    <IconButton size="small" onClick={() => setQty(removeId, (Number(p.qty || 1) + 1))}>
                      <AddIcon fontSize="small" />
                    </IconButton>
                  </Stack>

                  <Box sx={{ minWidth: 110, textAlign: 'right' }}>
                    <Typography>${lineSubtotal.toLocaleString('es-AR')}</Typography>
                    <IconButton color="error" onClick={() => {
                      if (confirm('¿Eliminar este producto del carrito?')) remove(removeId);
                    }}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Stack>
                <Divider sx={{ my: 1 }} /> {/* Línea */}
              </Box>
            );
          })}

      <Typography variant="h6">Total: ${total().toLocaleString("es-AR")}</Typography> {/* Total */}
      <Stack direction="row" gap={2}> {/* Botones */}
        <Button color="error" onClick={() => { if (confirm('Vaciar todo el carrito?')) clear(); }}>Vaciar</Button> {/* Vaciar */}
        <Button variant="contained" onClick={finalizarCompra}>Finalizar compra</Button> {/* Comprar */}
      </Stack>

      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack(s => ({ ...s, open: false }))}>
        <Alert severity={snack.severity} sx={{ width: '100%' }} onClose={() => setSnack(s => ({ ...s, open: false }))}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Stack>
  );
}
