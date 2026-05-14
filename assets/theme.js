// Thumbnail switcher
function setHero(el, src) {
  document.getElementById('hero-main').src = src;
  document.querySelectorAll('.hero-thumb').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
}

// Resolve variant ID — 3-layer fallback
async function resolveVariantId() {
  // 1. Liquid-injected data (most reliable)
  if (window.__hp && window.__hp.variantId) return String(window.__hp.variantId);

  // 2. Hidden input
  const input = document.querySelector('.variant-id-input');
  if (input && input.value) return input.value;

  // 3. AJAX fetch from Shopify product API
  try {
    const handle = (window.__hp && window.__hp.handle) || 'hydropaw-portable-dog-water-bottle';
    const r = await fetch('/products/' + handle + '.js');
    const data = await r.json();
    if (data.variants && data.variants[0]) return String(data.variants[0].id);
  } catch(e) {}

  return null;
}

// Active variant ID tracker
let activeVariantId = null;

// Color / variant selection
function initColorButtons() {
  // Seed from Liquid data
  if (window.__hp && window.__hp.variantId) {
    activeVariantId = String(window.__hp.variantId);
    document.querySelectorAll('.variant-id-input').forEach(i => i.value = activeVariantId);
  }

  // Seed variant IDs onto color buttons from __hp.variants
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

// Shopify AJAX add-to-cart
function initCartButtons() {
  document.querySelectorAll('.btn-cart, .buy-btn-cart').forEach(btn => {
    btn.addEventListener('click', async function(e) {
      e.preventDefault();
      const variantId = activeVariantId || await resolveVariantId();
      if (!variantId) { window.location.href = '/cart'; return; }
      const original = this.textContent;
      this.textContent = 'Adding...';
      this.disabled = true;
      try {
        const r = await fetch('/cart/add.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ id: parseInt(variantId), quantity: 1 })
        });
        const data = await r.json();
        if (data.id) {
          window.location.href = '/cart';
        } else {
          this.textContent = original;
          this.disabled = false;
        }
      } catch(e) {
        this.textContent = original;
        this.disabled = false;
      }
    });
  });
}

// Buy Now — skip cart, go straight to checkout
function initBuyNowButtons() {
  document.querySelectorAll('.btn-buy, .buy-btn-buy').forEach(btn => {
    btn.addEventListener('click', async function(e) {
      e.preventDefault();
      const variantId = activeVariantId || await resolveVariantId();
      if (variantId) {
        window.location.href = '/cart/' + variantId + ':1?checkout';
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
  initCartButtons();
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
