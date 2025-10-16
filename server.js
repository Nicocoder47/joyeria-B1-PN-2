import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import fs from 'fs/promises';
import path from 'path';
import cors from 'cors';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

const productsPath = path.resolve('./products.json');

async function readProductsFromFile() {
  try {
    const data = await fs.readFile(productsPath, 'utf8');
    if (!data) return [];
    return JSON.parse(data);
  } catch (error) {
    // si no existe, devolvemos array vacío
    console.error('Error reading products.json:', error.message || error);
    return [];
  }
}

async function writeProductsToFile(products) {
  try {
    await fs.writeFile(productsPath, JSON.stringify(products, null, 2), 'utf8');
    io.emit('productsUpdated', products);
  } catch (error) {
    console.error('Error writing products.json:', error.message || error);
  }
}

let products = [];

async function initializeProducts() {
  try {
    products = await readProductsFromFile();
  } catch (e) {
    console.error('Failed to initialize products:', e.message || e);
    try {
      await fs.writeFile(productsPath, JSON.stringify([], null, 2), 'utf8');
      products = [];
    } catch (ee) {
      console.error('Failed to create products.json:', ee.message || ee);
    }
  }
}

await initializeProducts();

app.get('/products', async (req, res) => {
  try {
    const data = await readProductsFromFile();
    res.json(data);
  } catch (error) {
    console.error('Error getting products:', error.message || error);
    res.status(500).json({ error: 'Failed to read products' });
  }
});

// Endpoints REST para CRUD
app.post('/products', async (req, res) => {
  const product = req.body;
  if (!product || !product.id) return res.status(400).json({ error: 'Invalid product' });
  try {
    products.push(product);
    await writeProductsToFile(products);
    io.emit('productAdded', product);
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error.message || error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

app.put('/products/:id', async (req, res) => {
  const id = req.params.id;
  const updated = req.body;
  if (!updated || updated.id !== id) return res.status(400).json({ error: 'Invalid product' });
  try {
    products = products.map(p => p.id === id ? updated : p);
    await writeProductsToFile(products);
    io.emit('productUpdated', updated);
    res.json(updated);
  } catch (error) {
    console.error('Error updating product:', error.message || error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

app.delete('/products/:id', async (req, res) => {
  const id = req.params.id;
  try {
    products = products.filter(p => p.id !== id);
    await writeProductsToFile(products);
    io.emit('productDeleted', id);
    res.json({ id });
  } catch (error) {
    console.error('Error deleting product:', error.message || error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

io.on('connection', (socket) => {
  console.log('Client connected', socket.id);

  // enviar estado inicial
  socket.emit('productsUpdated', products);

  socket.on('addProduct', async (product) => {
    try {
      if (!product || !product.id) {
        socket.emit('productError', 'Invalid product');
        return;
      }
      products.push(product);
      await writeProductsToFile(products);
      io.emit('productAdded', product);
    } catch (error) {
      console.error('Error adding product:', error.message || error);
      socket.emit('productError', 'Failed to add product');
    }
  });

  socket.on('deleteProduct', async (productId) => {
    try {
      products = products.filter(p => p.id !== productId);
      await writeProductsToFile(products);
      io.emit('productDeleted', productId);
    } catch (error) {
      console.error('Error deleting product:', error.message || error);
      socket.emit('productError', 'Failed to delete product');
    }
  });

  socket.on('updateProduct', async (updatedProduct) => {
    try {
      products = products.map(p => p.id === updatedProduct.id ? updatedProduct : p);
      await writeProductsToFile(products);
      io.emit('productUpdated', updatedProduct);
    } catch (error) {
      console.error('Error updating product:', error.message || error);
      socket.emit('productError', 'Failed to update product');
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected', socket.id);
  });
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});