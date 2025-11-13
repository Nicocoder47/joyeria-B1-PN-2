import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import dotenv from 'dotenv';
import { connect } from './src/db/mongoose.js';
import fs from 'fs/promises';
import Product from './src/models/Product.js';
import Cart from './src/models/Cart.js';
import Order from './src/models/Order.js';
import { engine } from 'express-handlebars';
import viewsRouter from './src/routes/views.js';
import cors from 'cors';

const app = express();
const server = http.createServer(app);
// allow Vite dev servers and local frontend origins during development
const allowedOrigins = [process.env.VITE_API_URL || 'http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174'];
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST']
  }
});

dotenv.config();

// Configure CORS to accept requests from the dev frontends and the API origin
app.use(cors({ origin: (origin, cb) => {
  if (!origin) return cb(null, true);
  if (allowedOrigins.includes(origin)) return cb(null, true);
  return cb(new Error('CORS not allowed'), false);
}, credentials: true }));
app.use(express.json());

// Static files (public)
app.use(express.static(path.join(process.cwd(), 'public')));

// View engine setup with helpers
app.engine('handlebars', engine({
  helpers: {
    add: (a, b) => (Number(a) || 0) + (Number(b) || 0),
    subtract: (a, b) => (Number(a) || 0) - (Number(b) || 0)
  }
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(process.cwd(), 'views'));

// Connect to Mongo (intentar, pero permitir fallback a archivo local si falla)
let dbConnected = false;
try {
  await connect();
  dbConnected = true;
} catch (err) {
  console.warn('Mongo connection failed, starting server in fallback (file-based) mode. Error:', err.message);
}

// GET /products con paginación, filtros y orden
app.get('/products', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const sort = req.query.sort === 'asc' ? 1 : req.query.sort === 'desc' ? -1 : null;
    const query = req.query.query || null; // puede ser categoría o 'available'

    const filter = {};
    if (query) {
      if (query === 'available') filter.stock = { $gt: 0 };
      else filter.category = query;
    }

    const total = await Product.countDocuments(filter);
    const totalPages = Math.ceil(total / limit) || 1;
    const hasPrevPage = page > 1;
    const hasNextPage = page < totalPages;

    let findQuery = Product.find(filter);
    if (sort) findQuery = findQuery.sort({ price: sort });
    findQuery = findQuery.skip((page - 1) * limit).limit(limit);

  const productsRes = await findQuery.exec();

    const baseUrl = req.protocol + '://' + req.get('host') + req.path;
    const prevLink = hasPrevPage ? `${baseUrl}?page=${page - 1}&limit=${limit}${req.query.sort ? `&sort=${req.query.sort}` : ''}${req.query.query ? `&query=${req.query.query}` : ''}` : null;
    const nextLink = hasNextPage ? `${baseUrl}?page=${page + 1}&limit=${limit}${req.query.sort ? `&sort=${req.query.sort}` : ''}${req.query.query ? `&query=${req.query.query}` : ''}` : null;

    res.json({
      status: 'success',
      payload: productsRes,
      totalPages,
      prevPage: hasPrevPage ? page - 1 : null,
      nextPage: hasNextPage ? page + 1 : null,
      page,
      hasPrevPage,
      hasNextPage,
      prevLink,
      nextLink
    });
  } catch (error) {
    console.error('Error getting products from DB:', error);
    // Si la DB no está disponible, devolver un fallback leyendo products.json en public o raíz
    if (!dbConnected) {
      try {
        const filePath = path.join(process.cwd(), 'products.json');
        const file = await fs.readFile(filePath, 'utf-8');
        const all = JSON.parse(file);
        // Responder con la misma forma esperada por el frontend
        return res.json({ status: 'success', payload: all, totalPages: 1, prevPage: null, nextPage: null, page: 1, hasPrevPage: false, hasNextPage: false, prevLink: null, nextLink: null });
      } catch (fileErr) {
        console.error('Fallback file read error:', fileErr);
        return res.status(500).json({ status: 'error', error: 'Failed to fetch products (db and fallback failed)' });
      }
    }
    res.status(500).json({ status: 'error', error: 'Failed to fetch products' });
  }
});

// CRUD productos usando Mongo
app.post('/products', async (req, res) => {
  const body = req.body;
  // Validación mínima
  if (!body || !body.id || !body.name || typeof body.price !== 'number') {
    return res.status(400).json({ status: 'error', error: 'Invalid product payload. Required: id, name, price (number).' });
  }
  try {
    const created = await Product.create(body);
    io.emit('productAdded', created);
    res.status(201).json({ status: 'success', payload: created });
  } catch (error) {
    console.error('Error creating product in DB:', error.message || error);
    res.status(500).json({ status: 'error', error: 'Failed to create product' });
  }
});

app.put('/products/:id', async (req, res) => {
  const id = req.params.id;
  const body = req.body;
  try {
    // Validación mínima
    if (!body || (body.price && typeof body.price !== 'number')) return res.status(400).json({ status: 'error', error: 'Invalid update payload' });
    const updated = await Product.findOneAndUpdate({ id }, body, { new: true });
    if (!updated) return res.status(404).json({ status: 'error', error: 'Product not found' });
    io.emit('productUpdated', updated);
    res.json({ status: 'success', payload: updated });
  } catch (error) {
    console.error('Error updating product in DB:', error);
    res.status(500).json({ status: 'error', error: 'Failed to update product' });
  }
});

app.delete('/products/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const deleted = await Product.findOneAndDelete({ id });
    if (!deleted) return res.status(404).json({ status: 'error', error: 'Product not found' });
    io.emit('productDeleted', id);
    res.json({ status: 'success', payload: { id } });
  } catch (error) {
    console.error('Error deleting product in DB:', error);
    res.status(500).json({ status: 'error', error: 'Failed to delete product' });
  }
});

io.on('connection', async (socket) => {
  console.log('Client connected', socket.id);
  try {
    const all = await Product.find().lean();
    socket.emit('productsUpdated', all);
  } catch (e) {
    console.error('Socket init error:', e);
  }

  socket.on('addProduct', async (product) => {
    try {
      const created = await Product.create(product);
      io.emit('productAdded', created);
    } catch (error) {
      console.error('Error adding product via socket:', error);
      socket.emit('productError', 'Failed to add product');
    }
  });

  socket.on('deleteProduct', async (productId) => {
    try {
      let deleted = null;
      if (/^[0-9a-fA-F]{24}$/.test(productId)) {
        deleted = await Product.findByIdAndDelete(productId);
      }
      if (!deleted) {
        deleted = await Product.findOneAndDelete({ id: productId });
      }
      if (deleted) io.emit('productDeleted', deleted._id || productId);
    } catch (error) {
      console.error('Error deleting product via socket:', error);
      socket.emit('productError', 'Failed to delete product');
    }
  });

  socket.on('updateProduct', async (updatedProduct) => {
    try {
      let updated = null;
      if (updatedProduct._id && /^[0-9a-fA-F]{24}$/.test(updatedProduct._id)) {
        updated = await Product.findByIdAndUpdate(updatedProduct._id, updatedProduct, { new: true });
      }
      if (!updated && updatedProduct.id) {
        updated = await Product.findOneAndUpdate({ id: updatedProduct.id }, updatedProduct, { new: true });
      }
      if (updated) io.emit('productUpdated', updated);
    } catch (error) {
      console.error('Error updating product via socket:', error);
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

// Mount views router at /views (products and carts HBS)
app.use('/views', viewsRouter);

// Carts endpoints
app.get('/carts/:cid', async (req, res) => {
  try {
    if (!dbConnected) return res.status(503).json({ error: 'DB not connected' });
    const cart = await Cart.findById(req.params.cid).populate('products.product').exec();
    if (!cart) return res.status(404).json({ error: 'Cart not found' });
    res.json({ status: 'success', payload: cart });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ status: 'error', error: 'Failed to fetch cart' });
  }
});

// POST api/carts -> crear carrito vacío
app.post('/carts', async (req, res) => {
  try {
    if (!dbConnected) return res.status(503).json({ error: 'DB not connected' });
    const cart = await Cart.create({ products: [] });
    res.status(201).json({ status: 'success', payload: { id: cart._id } });
  } catch (error) {
    console.error('Error creating cart:', error);
    res.status(500).json({ status: 'error', error: 'Failed to create cart' });
  }
});

// POST api/carts/:cid/products/:pid -> agregar producto por id "lógico" (campo id del Product)
app.post('/carts/:cid/products/:pid', async (req, res) => {
  try {
    if (!dbConnected) return res.status(503).json({ error: 'DB not connected' });
    const { cid, pid } = { cid: req.params.cid, pid: req.params.pid };
    const quantity = Number(req.body?.quantity || 1);
    const cart = await Cart.findById(cid);
    if (!cart) return res.status(404).json({ error: 'Cart not found' });
    // Evitar CastError validando si pid es ObjectId
    let productDoc = null;
    if (/^[0-9a-fA-F]{24}$/.test(pid)) productDoc = await Product.findById(pid);
    if (!productDoc) productDoc = await Product.findOne({ id: pid });
    if (!productDoc) return res.status(404).json({ error: 'Product not found' });
    const existing = cart.products.find(item => String(item.product) === String(productDoc._id));
    if (existing) existing.quantity += quantity;
    else cart.products.push({ product: productDoc._id, quantity });
    await cart.save();
    await cart.populate('products.product');
    res.status(200).json({ status: 'success', payload: cart });
  } catch (error) {
    console.error('Error adding product to cart:', error);
    res.status(500).json({ status: 'error', error: 'Failed to add product to cart' });
  }
});

// POST api/carts/:cid/sync -> reemplazar carrito con items [{ id, qty }]
app.post('/carts/:cid/sync', async (req, res) => {
  try {
    if (!dbConnected) return res.status(503).json({ error: 'DB not connected' });
    const cid = req.params.cid;
    const items = Array.isArray(req.body?.items) ? req.body.items : [];
    const cart = await Cart.findById(cid);
    if (!cart) return res.status(404).json({ error: 'Cart not found' });

    // Buscar todos los productos por su campo lógico "id"
    const ids = items.map(i => i.id);
    const products = await Product.find({ id: { $in: ids } }, { _id: 1, id: 1 }).lean();
    const map = new Map(products.map(p => [p.id, p._id]));

    cart.products = items
      .filter(i => map.has(i.id))
      .map(i => ({ product: map.get(i.id), quantity: Math.max(1, Number(i.qty || i.quantity || 1)) }));
    await cart.save();
    await cart.populate('products.product');
    res.json({ status: 'success', payload: cart });
  } catch (error) {
    console.error('Error syncing cart:', error);
    res.status(500).json({ status: 'error', error: 'Failed to sync cart' });
  }
});

// DELETE api/carts/:cid/products/:pid
app.delete('/carts/:cid/products/:pid', async (req, res) => {
  try {
    if (!dbConnected) return res.status(503).json({ error: 'DB not connected' });
    const { cid, pid } = { cid: req.params.cid, pid: req.params.pid };
    const cart = await Cart.findById(cid);
    if (!cart) return res.status(404).json({ error: 'Cart not found' });
    cart.products = cart.products.filter(item => String(item.product) !== String(pid));
    await cart.save();
    res.json({ status: 'success', payload: cart });
  } catch (error) {
    console.error('Error deleting product from cart:', error);
    res.status(500).json({ status: 'error', error: 'Failed to delete product from cart' });
  }
});

// PUT api/carts/:cid -> reemplazar arreglo de productos
app.put('/carts/:cid', async (req, res) => {
  try {
    if (!dbConnected) return res.status(503).json({ error: 'DB not connected' });
    const cid = req.params.cid;
    const productsArray = req.body.products; // [{ product: productId, quantity }]
    const cart = await Cart.findById(cid);
    if (!cart) return res.status(404).json({ error: 'Cart not found' });
    cart.products = productsArray.map(p => ({ product: p.product, quantity: p.quantity }));
    await cart.save();
    res.json({ status: 'success', payload: cart });
  } catch (error) {
    console.error('Error replacing cart products:', error);
    res.status(500).json({ status: 'error', error: 'Failed to replace cart products' });
  }
});

// PUT api/carts/:cid/products/:pid -> actualizar sólo cantidad
app.put('/carts/:cid/products/:pid', async (req, res) => {
  try {
    if (!dbConnected) return res.status(503).json({ error: 'DB not connected' });
    const { cid, pid } = { cid: req.params.cid, pid: req.params.pid };
    const { quantity } = req.body;
    const cart = await Cart.findById(cid);
    if (!cart) return res.status(404).json({ error: 'Cart not found' });
    const item = cart.products.find(item => String(item.product) === String(pid));
    if (!item) return res.status(404).json({ error: 'Product not in cart' });
    item.quantity = quantity;
    await cart.save();
    res.json({ status: 'success', payload: cart });
  } catch (error) {
    console.error('Error updating product quantity in cart:', error);
    res.status(500).json({ status: 'error', error: 'Failed to update quantity' });
  }
});

// DELETE api/carts/:cid -> eliminar todos los productos del carrito
app.delete('/carts/:cid', async (req, res) => {
  try {
    if (!dbConnected) return res.status(503).json({ error: 'DB not connected' });
    const cid = req.params.cid;
    const cart = await Cart.findById(cid);
    if (!cart) return res.status(404).json({ error: 'Cart not found' });
    cart.products = [];
    await cart.save();
    res.json({ status: 'success', payload: cart });
  } catch (error) {
    console.error('Error emptying cart:', error);
    res.status(500).json({ status: 'error', error: 'Failed to empty cart' });
  }
});

// GET /products/:id -> devuelve un producto por su campo `id` o por _id
app.get('/products/:pid', async (req, res) => {
  try {
    const pid = req.params.pid;
    let product = null;
    // Si parece un ObjectId, usar findById, si no buscar por campo `id`
    if (/^[0-9a-fA-F]{24}$/.test(pid)) {
      product = await Product.findById(pid).lean();
    }
    if (!product) {
      product = await Product.findOne({ id: pid }).lean();
    }
    if (!product) return res.status(404).json({ status: 'error', error: 'Product not found' });
    res.json({ status: 'success', payload: product });
  } catch (error) {
    console.error('Error getting product by id:', error.message || error);
    res.status(500).json({ status: 'error', error: 'Failed to fetch product' });
  }
});

// POST /orders -> finalizar compra: recibe { cartId }
app.post('/orders', async (req, res) => {
  const { cartId } = req.body || {};
  if (!cartId) return res.status(400).json({ status: 'error', error: 'cartId required' });
  if (!dbConnected) return res.status(503).json({ status: 'error', error: 'DB not connected' });
  const session = await (await import('mongoose')).startSession();
  try {
    session.startTransaction();
    const cart = await Cart.findById(cartId).populate('products.product').session(session);
    if (!cart) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ status: 'error', error: 'Cart not found' });
    }
    if (!cart.products.length) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ status: 'error', error: 'Cart is empty' });
    }

    // Verify stock and compute total
    let total = 0;
    for (const item of cart.products) {
      const prod = item.product;
      const qty = Number(item.quantity || 0);
      if (!prod) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ status: 'error', error: 'Invalid product in cart' });
      }
      if (prod.stock < qty) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ status: 'error', error: `Insufficient stock for ${prod.name}` });
      }
      total += Number(prod.price || 0) * qty;
    }

    // Reduce stock
    for (const item of cart.products) {
      const prod = item.product;
      const qty = Number(item.quantity || 0);
      prod.stock = Math.max(0, prod.stock - qty);
      await prod.save({ session });
    }

    // Create order
    const orderData = {
      products: cart.products.map(i => ({ product: i.product._id, quantity: i.quantity, price: Number(i.product.price || 0) })),
      total
    };
    const order = await Order.create([orderData], { session }).then(docs => docs[0]);

    // Empty cart
    cart.products = [];
    await cart.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ status: 'success', payload: { orderId: order._id, total } });
  } catch (error) {
    try { await session.abortTransaction(); session.endSession(); } catch(e){}
    console.error('Error creating order:', error);
    res.status(500).json({ status: 'error', error: 'Failed to create order' });
  }
});