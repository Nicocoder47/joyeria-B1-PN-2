import mongoose from '../db/mongoose.js';

const cartProductSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, default: 1 }
});

const cartSchema = new mongoose.Schema({
  products: { type: [cartProductSchema], default: [] }
}, { timestamps: true });

export default mongoose.model('Cart', cartSchema);
