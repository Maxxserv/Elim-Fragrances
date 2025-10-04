
const PRODUCTS_URL = '/products.json';
let products = [];
let cart = JSON.parse(localStorage.getItem('cart_v3')||'{}');

const productsWomenEl = document.getElementById('productsWomen');
const productsMenEl = document.getElementById('productsMen');
const productTemplate = document.getElementById('productTemplate');
const cartBtn = document.getElementById('cartBtn');
const cartPanel = document.getElementById('cartPanel');
const cartItemsEl = document.getElementById('cartItems');
const cartCountEl = document.getElementById('cartCount');
const cartTotalEl = document.getElementById('cartTotal');
const checkoutBtn = document.getElementById('checkoutBtn');
const closeCart = document.getElementById('closeCart');
const searchInput = document.getElementById('search');

function updateCartUI(){
  const entries = Object.entries(cart);
  cartCountEl.textContent = entries.reduce((s,[id,q])=>s+q,0);
  cartItemsEl.innerHTML = '';
  let total = 0;
  entries.forEach(([id,q])=>{
    const p = products.find(x=>x.id==id);
    if(!p) return;
    const row = document.createElement('div');
    row.className = 'cart-row';
    row.style.marginBottom = '8px';
    row.innerHTML = `<div><strong>${p.title}</strong><div>${q} × ${p.price.toFixed(2)} د.إ</div></div>`;
    const remove = document.createElement('button'); remove.textContent='حذف'; remove.className='btn';
    remove.onclick = ()=>{ delete cart[id]; saveCart(); updateCartUI(); }
    row.appendChild(remove);
    cartItemsEl.appendChild(row);
    total += q * p.price;
  });
  cartTotalEl.textContent = total.toFixed(2);
}

function saveCart(){ localStorage.setItem('cart_v3', JSON.stringify(cart)); }

async function fetchProducts(){
  try{
    const res = await fetch(PRODUCTS_URL);
    products = await res.json();
    renderProducts(products);
    updateCartUI();
  }catch(e){
    console.error(e);
  }
}

function renderProducts(items){
  productsWomenEl.innerHTML = '';
  productsMenEl.innerHTML = '';
  items.forEach((p, idx)=>{
    const tpl = productTemplate.content.cloneNode(true);
    const img = tpl.querySelector('.product-img'); img.src = p.image || '/images/placeholder.jpg'; img.alt = p.title;
    tpl.querySelector('.product-title').textContent = p.title;
    tpl.querySelector('.product-desc').textContent = p.description;
    tpl.querySelector('.price').textContent = p.price.toFixed(2) + ' د.إ';
    tpl.querySelector('.stock').textContent = p.stock>0? `متوفر (${p.stock})` : 'غير متوفر';
    const qty = tpl.querySelector('.qty'); if(p.stock==0) qty.disabled=true;
    const addBtn = tpl.querySelector('.add');
    addBtn.onclick = ()=>{
      const q = Math.max(1,Number(qty.value)||1);
      if(p.stock === 0){ alert('غير متوفر'); return; }
      if((cart[p.id]||0)+q > p.stock){ alert('الكمية المطلوبة تتجاوز المخزون'); return; }
      cart[p.id] = (cart[p.id]||0)+q; saveCart(); updateCartUI();
    }
    if(p.category === 'Women') productsWomenEl.appendChild(tpl);
    else if(p.category === 'Men') productsMenEl.appendChild(tpl);
    else productsWomenEl.appendChild(tpl);
  });
}

cartBtn.onclick = ()=>{ cartPanel.classList.toggle('hidden'); cartPanel.setAttribute('aria-hidden', cartPanel.classList.contains('hidden')); }
closeCart.onclick = ()=>{ cartPanel.classList.add('hidden'); }
checkoutBtn.onclick = async ()=>{
  const order = {items: Object.entries(cart).map(([id,quantity])=>({id,quantity})), total: Number(document.getElementById('cartTotal').textContent)};
  try{
    const res = await fetch('/checkout', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(order)});
    if(res.ok){
      const data = await res.json();
      alert('تم إرسال الطلب! رقم الطلب: ' + (data.orderId || '—'));
      cart = {}; saveCart(); updateCartUI(); cartPanel.classList.add('hidden');
    } else alert('فشل إتمام الطلب');
  } catch(e){ console.error(e); alert('خطأ في الشبكة'); }
}

searchInput.addEventListener('input', ()=>{
  const q = searchInput.value.trim().toLowerCase();
  if(!q) renderProducts(products);
  else renderProducts(products.filter(p=> (p.title+ ' ' + p.description).toLowerCase().includes(q)));
});

fetchProducts();
