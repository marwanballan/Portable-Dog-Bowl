// Thumbnail switcher
function setHero(el, src) {
  document.getElementById('hero-main').src = src;
  document.querySelectorAll('.hero-thumb').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
}

// Resolve variant ID — 3-layer fallback
async function resolveVariantId() {
  if (window.__hp && window.__hp.variantId) return String(window.__hp.variantId);
  const input = document.querySelector('.variant-id-input');
  if (input && input.value) return input.value;
  try {
    const handle = (window.__hp && window.__hp.handle) || 'hydropaw-portable-dog-water-bottle';
    const r = await fetch('/products/' + handle + '.js');
    const data = await r.json();
    if (data.variants && data.variants[0]) return String(data.variants[0].id);
  } catch(e) {}
  return null;
}

// Active variant + quantity trackers
let activeVariantId = null;
let activeQty = 1;

// Order state
let orderItems = [];

function syncQtyDisplays() {
  document.querySelectorAll('.qty-val').forEach(v => v.textContent = activeQty);
}

function initQtySelectors() {
  document.querySelectorAll('.qty-selector').forEach(sel => {
    sel.querySelector('.qty-minus').addEventListener('click', () => {
      if (activeQty > 1) { activeQty--; syncQtyDisplays(); }
    });
    sel.querySelector('.qty-plus').addEventListener('click', () => {
      if (activeQty < 99) { activeQty++; syncQtyDisplays(); }
    });
  });
}

// Get price in cents for a variant
function getVariantPrice(variantId) {
  if (window.__hp && window.__hp.variants) {
    const v = window.__hp.variants.find(v => String(v.id) === String(variantId));
    if (v && v.price) return v.price;
  }
  return 3299; // fallback $32.99
}

// Get active variant title from button label
function getActiveVariantTitle() {
  const btn = document.querySelector('.color-btn.active, .buy-color-btn.active');
  return btn ? btn.textContent.trim() : 'HydroPaw';
}

// Add current selection to order
function addToOrder() {
  const variantId = activeVariantId;
  if (!variantId) return;

  const title = getActiveVariantTitle();
  const price = getVariantPrice(variantId);
  const qty = activeQty;

  const existing = orderItems.find(i => i.variantId === variantId);
  if (existing) {
    existing.qty += qty;
  } else {
    orderItems.push({ variantId, title, qty, price });
  }

  renderOrderPanel();

  // Reset qty to 1 after adding
  activeQty = 1;
  syncQtyDisplays();

  // Scroll panel into view
  const panel = document.querySelector('.order-panel-container');
  if (panel) setTimeout(() => panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50);
}

// Remove a line from the order
function removeOrderItem(idx) {
  orderItems.splice(idx, 1);
  renderOrderPanel();
}

// Render the order panel into .order-panel-container
function renderOrderPanel() {
  const container = document.querySelector('.order-panel-container');
  if (!container) return;

  if (orderItems.length === 0) {
    container.innerHTML = '';
    return;
  }

  const totalCents = orderItems.reduce((s, i) => s + i.price * i.qty, 0);
  const totalStr = '$' + (totalCents / 100).toFixed(2);
  const itemCount = orderItems.reduce((s, i) => s + i.qty, 0);

  const lines = orderItems.map((item, idx) => `
    <div class="order-line">
      <span class="order-line-name">${item.title}</span>
      <span class="order-line-qty">× ${item.qty}</span>
      <span class="order-line-price">$${(item.price * item.qty / 100).toFixed(2)}</span>
      <button class="order-line-remove" onclick="removeOrderItem(${idx})">×</button>
    </div>
  `).join('');

  container.innerHTML = `
    <div class="order-panel">
      <div class="order-panel-header">
        <span>Your Order</span>
        <span class="order-count-badge">${itemCount} item${itemCount !== 1 ? 's' : ''}</span>
      </div>
      <div class="order-lines">${lines}</div>
      <div class="order-panel-footer">
        <div class="order-panel-total">Total: <strong>${totalStr}</strong></div>
        <button class="btn-checkout-order" onclick="checkoutOrder()">Checkout — ${totalStr} →</button>
      </div>
    </div>
  `;
}

// Checkout with all order items
function checkoutOrder() {
  if (!orderItems.length) return;
  const items = orderItems.map(i => i.variantId + ':' + i.qty).join(',');
  window.location.href = '/cart/' + items + '?checkout';
}

// Color / variant selection
function initColorButtons() {
  if (window.__hp && window.__hp.variantId) {
    activeVariantId = String(window.__hp.variantId);
    document.querySelectorAll('.variant-id-input').forEach(i => i.value = activeVariantId);
  }

  if (window.__hp && window.__hp.variants && window.__hp.variants.length) {
    const variants = window.__hp.variants;
    document.querySelectorAll('.color-btn, .buy-color-btn').forEach(btn => {
      const title = btn.textContent.trim();
      const match = variants.find(v => v.title === title);
      if (match) btn.dataset.variantId = String(match.id);
    });
  }

  document.querySelectorAll('.color-options').forEach(group => {
    group.querySelectorAll('.color-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        group.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const label = btn.closest('.color-section').querySelector('label');
        if (label) label.innerHTML = 'Color — <strong>' + btn.textContent.trim() + '</strong>';
        if (btn.dataset.variantId) {
          activeVariantId = btn.dataset.variantId;
          document.querySelectorAll('.variant-id-input').forEach(i => i.value = activeVariantId);
        }
      });
    });
  });

  document.querySelectorAll('.buy-color-btns').forEach(group => {
    group.querySelectorAll('.buy-color-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        group.querySelectorAll('.buy-color-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        if (btn.dataset.variantId) {
          activeVariantId = btn.dataset.variantId;
          document.querySelectorAll('.variant-id-input').forEach(i => i.value = activeVariantId);
        }
      });
    });
  });
}

// Add to Order buttons
function initAddToOrderButtons() {
  document.querySelectorAll('.btn-add-order, .buy-btn-add-order').forEach(btn => {
    btn.addEventListener('click', function() {
      addToOrder();
      const original = this.textContent;
      this.textContent = '✓ Added!';
      setTimeout(() => { this.textContent = original; }, 1200);
    });
  });
}

// Buy Now — single item straight to checkout
function initBuyNowButtons() {
  document.querySelectorAll('.btn-buy, .buy-btn-buy').forEach(btn => {
    btn.addEventListener('click', async function(e) {
      e.preventDefault();
      const variantId = activeVariantId || await resolveVariantId();
      if (variantId) {
        window.location.href = '/cart/' + variantId + ':' + activeQty + '?checkout';
      } else {
        window.location.href = '/checkout';
      }
    });
  });
}

// FAQ accordion
function toggleFaq(el) {
  const item = el.parentElement;
  const isOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
  if (!isOpen) item.classList.add('open');
}

// Scroll fade-in
function initFadeIn() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.12 });
  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
}

document.addEventListener('DOMContentLoaded', () => {
  initColorButtons();
  initQtySelectors();
  initAddToOrderButtons();
  initBuyNowButtons();
  initFadeIn();
});

// Splash intro fade-out
window.addEventListener('load', () => {
  const splash = document.getElementById('splash');
  if (!splash) return;
  setTimeout(() => {
    splash.classList.add('fade-out');
    setTimeout(() => { splash.style.display = 'none'; }, 900);
  }, 1600);
});
