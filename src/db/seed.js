import mongoose from 'mongoose';
import Product from '../models/Product.js';
import { connect } from './mongoose.js';

// Tus productos confirmados (sin el campo "id" que genera Mongo)
const productsToSeed = [
  {
    id: "anillo-corazon-01",
    name: "Anillo Corazón de Plata",
    price: 25000,
    category: "Anillos",
    metal: "Plata 925",
    images: ["/assets/img/anillo-1.png"],
    stock: 10,
    description: "Un delicado anillo de plata 925 con un corazón central, perfecto para expresar amor y amistad."
  },
  {
    id: "collar-luna-01",
    name: "Collar Luna Brillante",
    price: 35000,
    category: "Collares",
    metal: "Plata 925",
    images: ["/assets/img/collar-1.png"],
    stock: 15,
    description: "Collar con un colgante de luna y pequeñas incrustaciones de circonita que capturan la luz."
  },
  {
    id: "aros-estrella-01",
    name: "Aros Estrella Fugaz",
    price: 18000,
    category: "Aros",
    metal: "Acero Quirúrgico",
    images: ["/assets/img/aros-1.png"],
    stock: 20,
    description: "Par de aros de acero quirúrgico con diseño de estrella fugaz, ideales para uso diario."
  },
  {
    id: "pulsera-infinito-01",
    name: "Pulsera Infinito",
    price: 22000,
    category: "Pulseras",
    metal: "Plata 925",
    images: ["/assets/img/colgante-1.png"],
    stock: 12,
    description: "Elegante pulsera de plata con el símbolo del infinito, un regalo con un significado especial."
  }
];

const seedDatabase = async () => {
  try {
    await connect();
    console.log('Conectado a la base de datos para el seeder.');

    console.log('Limpiando la colección de productos...');
    await Product.deleteMany({});
    console.log('Colección de productos limpiada.');

    if (productsToSeed.length > 0) {
      console.log(`Insertando ${productsToSeed.length} productos nuevos...`);
      await Product.insertMany(productsToSeed);
      console.log('¡Productos insertados exitosamente!');
    } else {
      console.log('No hay productos para insertar.');
    }

  } catch (error) {
    console.error('Error durante el proceso de seed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Desconectado de la base de datos.');
  }
};

seedDatabase();