import dotenv from 'dotenv';
import { connect } from '../src/db/mongoose.js';
import Cart from '../src/models/Cart.js';
import Product from '../src/models/Product.js';

dotenv.config();

const cid = process.argv[2];
const pid = process.argv[3];
if (!cid || !pid) {
	console.error('Usage: node scripts/test-add-cart.mjs <cartId> <productId or logical id>');
	process.exit(1);
}

async function main() {
	await connect();
	const cart = await Cart.findById(cid);
	if (!cart) {
		console.error('Cart not found');
		return;
	}
	let productDoc = null;
	if (/^[0-9a-fA-F]{24}$/.test(pid)) {
		productDoc = await Product.findById(pid);
	}
	if (!productDoc) {
		productDoc = await Product.findOne({ id: pid });
	}
	if (!productDoc) {
		console.error('Product not found');
		return;
	}
	const quantity = 1;
	const existing = cart.products.find(item => String(item.product) === String(productDoc._id));
	if (existing) existing.quantity += quantity;
	else cart.products.push({ product: productDoc._id, quantity });
	await cart.save();
		await cart.populate('products.product');
		console.log('Cart updated:', JSON.stringify(cart.toObject(), null, 2));
}

main().then(() => process.exit(0)).catch(err => {
	console.error('Script error', err);
	process.exit(1);
});
import '../src/db/mongoose.js';
