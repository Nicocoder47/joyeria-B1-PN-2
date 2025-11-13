const API = 'http://localhost:3000';

async function req(path, opts={}){
  const res = await fetch(API+path, {...opts});
  const body = await res.text();
  let json;
  try{ json = JSON.parse(body); }catch(e){ json = body; }
  return {status: res.status, body: json};
}

(async ()=>{
  console.log('=== Cart tests ===');
  // Crear
  let r = await req('/carts', {method:'POST'});
  console.log('/carts', r.status, r.body);
  if(r.status!==201) process.exit(1);
  const cid = r.body.payload?.id || r.body.id || r.body;
  console.log('cart id', cid);

  // Productos
  r = await req('/products');
  console.log('/products', r.status);
  if(r.status!==200) process.exit(1);
  const products = r.body.payload || r.body;
  if(!products.length) { console.error('no products'); process.exit(1); }
  const logicalId = products[0].id;
  const objId = products[0]._id;
  console.log('product ids', logicalId, objId);

  // Logico
  r = await req(`/carts/${cid}/products/${logicalId}`, {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({})});
  console.log('add by logical id', r.status, r.body);
  if(r.status!==200) process.exit(1);

  // Mongo
  r = await req(`/carts/${cid}/products/${objId}`, {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({})});
  console.log('add by _id', r.status, r.body);
  if(r.status!==200) process.exit(1);

  // Carrito
  r = await req(`/carts/${cid}`);
  console.log('get cart', r.status, r.body);
  if(r.status!==200) process.exit(1);

  // Cantidad
  const pid = r.body.payload?.products?.[0]?.product?._id || objId;
  r = await req(`/carts/${cid}/products/${pid}`, {method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({quantity:5})});
  console.log('update qty', r.status, r.body);
  if(r.status!==200) process.exit(1);

  // Borrar
  r = await req(`/carts/${cid}/products/${pid}`, {method:'DELETE'});
  console.log('delete product', r.status, r.body);
  if(r.status!==200) process.exit(1);

  // Vaciar
  r = await req(`/carts/${cid}`, {method:'DELETE'});
  console.log('empty cart', r.status, r.body);
  if(r.status!==200) process.exit(1);

  // Orden
  // Repetir
  r = await req(`/carts/${cid}/products/${logicalId}`, {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({})});
  console.log('add for order', r.status);
  if(r.status!==200) process.exit(1);

  // Crear
  r = await req(`/orders`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ cartId: cid }) });
  console.log('create order', r.status, r.body);
  if (r.status !== 201) process.exit(1);

  // Verificar
  r = await req(`/carts/${cid}`);
  console.log('post-order get cart', r.status, r.body);
  if (r.status !== 200) process.exit(1);
  const cartAfter = r.body.payload || r.body;
  if (cartAfter.products && cartAfter.products.length) {
    console.error('Cart not emptied after order'); process.exit(1);
  }

  console.log('All cart tests passed');
  process.exit(0);
})();
