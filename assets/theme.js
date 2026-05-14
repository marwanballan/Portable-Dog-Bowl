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

// Sync all qty displays
function syncQtyDisplays() {
  document.querySelectorAll('.qty-val').forEach(v => v.textContent = activeQty);
}

// Quantity selectors
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


// Buy Now — skip cart, go straight to checkout with quantity
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
