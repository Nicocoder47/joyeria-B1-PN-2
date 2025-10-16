import { useEffect, useState } from 'react';
import { Stack, TextField, Button, Grid, Card, CardContent, Typography } from '@mui/material';
import socket from '../services/socket';

const API = import.meta.env.VITE_API_URL || '';

export default function Admin() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ id: '', name: '', price: 0, category: '', metal: '', stock: 0, description: '' });
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    fetch((API || '') + '/products')
      .then(r => r.json())
      .then(data => setProducts(data))
      .catch(console.error);

    socket.on('productsUpdated', setProducts);
    socket.on('productAdded', p => setProducts(prev => [...prev, p]));
    socket.on('productDeleted', id => setProducts(prev => prev.filter(p => p.id !== id)));
    socket.on('productUpdated', up => setProducts(prev => prev.map(p => p.id === up.id ? up : p)));

    return () => {
      socket.off('productsUpdated'); socket.off('productAdded'); socket.off('productDeleted'); socket.off('productUpdated');
    };
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const create = async () => {
    try {
      const res = await fetch((API || '') + '/products', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error('Create failed');
      setForm({ id: '', name: '', price: 0, category: '', metal: '', stock: 0, description: '' });
    } catch (e) { console.error(e); }
  };

  const del = async (id) => {
    try {
      await fetch((API || '') + '/products/' + id, { method: 'DELETE' });
    } catch (e) { console.error(e); }
  };

  const startEdit = (p) => { setForm(p); setEditing(true); };

  const saveEdit = async () => {
    try {
      await fetch((API || '') + '/products/' + form.id, { method: 'PUT', headers: { 'Content-Type':'application/json'}, body: JSON.stringify(form) });
      setEditing(false);
      setForm({ id: '', name: '', price: 0, category: '', metal: '', stock: 0, description: '' });
    } catch (e) { console.error(e); }
  };

  return (
    <Stack gap={3}>
      <Typography variant="h4">Admin</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Stack gap={2}>
                <TextField name="id" label="ID" value={form.id} onChange={handleChange} />
                <TextField name="name" label="Nombre" value={form.name} onChange={handleChange} />
                <TextField name="price" label="Precio" type="number" value={form.price} onChange={handleChange} />
                <TextField name="category" label="Categoría" value={form.category} onChange={handleChange} />
                <TextField name="metal" label="Metal" value={form.metal} onChange={handleChange} />
                <TextField name="stock" label="Stock" type="number" value={form.stock} onChange={handleChange} />
                <TextField name="description" label="Descripción" value={form.description} onChange={handleChange} />
                {!editing ? <Button variant="contained" onClick={create}>Crear</Button> : <Button variant="contained" onClick={saveEdit}>Guardar</Button>}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Stack gap={2}>
            {products.map(p => (
              <Card key={p.id}>
                <CardContent style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <Typography variant="h6">{p.name}</Typography>
                    <Typography variant="body2">{p.id} — ${p.price}</Typography>
                  </div>
                  <div>
                    <Button onClick={() => startEdit(p)}>Editar</Button>
                    <Button color="error" onClick={() => del(p.id)}>Eliminar</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </Grid>
      </Grid>
    </Stack>
  );
}
