// src/data/products.js
import anillo1 from "../assets/img/anillo-1.png";
import collar1 from "../assets/img/collar-1.png";
import aros1 from "../assets/img/aros-1.png";
import colgante1 from "../assets/img/colgante-1.png";

export const CATEGORIES = ["Anillos", "Collares", "Aros", "Pulseras"];
export const METALS = ["Oro 18k", "Plata 925", "Acero Quirúrgico"];

export const products = [
  {
    id: "anillo-aurora",
    name: "Anillo Aurora",
    price: 85000,
    category: "Anillos",
    metal: "Oro 18k",
    stones: "Circonias",
    images: [anillo1],
    stock: 12,
    description: "Anillo minimalista en oro 18k con circonias corte brillante."
  },
  {
    id: "collar-stella",
    name: "Collar Stella",
    price: 120000,
    category: "Collares",
    metal: "Plata 925",
    stones: "Topacio",
    images: [collar1],
    stock: 7,
    description: "Collar en plata 925 con dije estrella y piedra topacio azul."
  },
  {
    id: "aros-luna",
    name: "Aros Luna",
    price: 62000,
    category: "Aros",
    metal: "Acero Quirúrgico",
    stones: "—",
    images: [aros1],
    stock: 20,
    description: "Aros huggies de acero quirúrgico con terminación espejo."
  },
  {
    id: "pulsera-eden",
    name: "Pulsera Edén",
    price: 98000,
    category: "Pulseras",
    metal: "Oro 18k",
    stones: "Esmeralda sintética",
    images: [colgante1],
    stock: 5,
    description: "Pulsera de eslabón fino con toque esmeralda, elegancia atemporal."
  }
];
