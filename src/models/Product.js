import mongoose from '../db/mongoose.js';

const productSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String },
  metal: { type: String },
  stones: { type: String },
  images: { type: [String], default: [] },
  stock: { type: Number, default: 0 },
  description: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.model('Product', productSchema);
