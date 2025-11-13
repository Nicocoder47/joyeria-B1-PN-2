# Joyas Shop - Entrega Final

Este repositorio contiene la aplicación "Joyas Shop" con persistencia en MongoDB y funcionalidad en tiempo real usando Socket.IO.

Requisitos
- Node.js v16+ (recomendado)
- Una cuenta de MongoDB Atlas (puede usarse el cluster gratuito)

Variables de entorno
- Copiar `.env.example` a `.env` y completar los valores:
```
VITE_API_URL=http://localhost:3000
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/joyasDB?retryWrites=true&w=majority
```

Instalación
```bash
npm install
```

Correr la aplicación (desarrollo)

- Levantar servidor (API + Socket.IO):
```powershell
npm run start-server
```

- Levantar frontend (Vite):
```powershell
npm run dev
```

Nota: el servidor corre por defecto en http://localhost:3000 y Vite en http://localhost:5173. 
Endpoints principales

Productos (API REST JSON)
- GET /products?limit=&page=&sort=&query=
	- limit: número máximo por página (por defecto 10)
	- page: página (por defecto 1)
	- sort: 'asc' o 'desc' para ordenar por precio
	- query: categoría o 'available' para filtrar
	- Respuesta: { status, payload, totalPages, prevPage, nextPage, page, hasPrevPage, hasNextPage, prevLink, nextLink }

- GET /products/:pid  -> obtiene producto por su `_id` o por su campo lógico `id`
- POST /products
- PUT /products/:id
- DELETE /products/:id

Carritos
- POST /carts  -> crea carrito vacío (devuelve { status, payload: { id: <cartId> } })
- GET /carts/:cid  -> devuelve carrito con productos poblados (populate)
- POST /carts/:cid/products/:pid  -> agrega producto (acepta `pid` como _id o campo `id` lógico)
- POST /carts/:cid/sync -> reemplaza productos del carrito con array [{ id, qty }]
- DELETE /carts/:cid/products/:pid  -> elimina producto del carrito
- PUT /carts/:cid  -> reemplaza todos los productos (body: { products: [{ product: <productId>, quantity }] })
- PUT /carts/:cid/products/:pid  -> actualiza sólo la cantidad (body: { quantity })
- DELETE /carts/:cid  -> vacía el carrito


