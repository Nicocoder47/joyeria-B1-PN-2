import express from 'express';
import Product from '../models/Product.js';
import Cart from '../models/Cart.js';

const router = express.Router();

// GET /views/products?page=&limit=&sort=&query=
router.get('/products', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) > 0 ? parseInt(req.query.limit) : 10;
    const page = parseInt(req.query.page) > 0 ? parseInt(req.query.page) : 1;
    const sort = req.query.sort === 'asc' ? 1 : req.query.sort === 'desc' ? -1 : null;
    const queryParam = req.query.query || null;

    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.available === 'true') filter.stock = { $gt: 0 };
    if (queryParam) {
      if (queryParam.toLowerCase() === 'available' || queryParam.toLowerCase() === 'disponible') filter.stock = { $gt: 0 };
      else filter.category = queryParam;
    }

    const total = await Product.countDocuments(filter);
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const skip = (page - 1) * limit;

    let q = Product.find(filter).skip(skip).limit(limit);
    if (sort !== null) q = q.sort({ price: sort });
    const products = await q.lean();

    res.render('products/index', {
      products,
      pagination: { totalPages, page, hasPrev: page > 1, hasNext: page < totalPages }
    });
  } catch (error) {
    console.error('Views /products error', error);
    res.status(500).send('Error rendering products');
  }
});

// GET /views/products/:pid
router.get('/products/:pid', async (req, res) => {
  try {
    const p = await Product.findById(req.params.pid).lean();
    if (!p) return res.status(404).send('Product not found');
    res.render('products/detail', { product: p });
  } catch (error) {
    console.error('Views product detail error', error);
    res.status(500).send('Error rendering product detail');
  }
});

// POST /views/products/:pid/add-to-cart -> for HBS form action
router.post('/products/:pid/add-to-cart', async (req, res) => {
  try {
    const pid = req.params.pid;
    // for simplicity, use or create a default cart id stored in session-less demo: create new cart if not present
    // here we create a new cart and add the product
    let cart = new Cart({ products: [{ product: pid, quantity: 1 }] });
    await cart.save();
    res.redirect(`/views/carts/${cart._id}`);
  } catch (error) {
    console.error('Add to cart error', error);
    res.status(500).send('Failed to add to cart');
  }
});

// GET /views/carts/:cid
router.get('/carts/:cid', async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.cid).populate('products.product').lean();
    if (!cart) return res.status(404).send('Cart not found');
    res.render('carts/cart', { cart });
  } catch (error) {
    console.error('Views cart error', error);
    res.status(500).send('Error rendering cart');
  }
});

// GET /views/orders/:oid -> mostrar confirmación de pedido
router.get('/orders/:oid', async (req, res) => {
  try {
    const Order = (await import('../models/Order.js')).default;
    const order = await Order.findById(req.params.oid).populate('products.product').lean();
    if (!order) return res.status(404).send('Order not found');
    res.render('orders/confirmation', { order });
  } catch (error) {
    console.error('Views order error', error);
    res.status(500).send('Error rendering order confirmation');
  }
});

export default router;
