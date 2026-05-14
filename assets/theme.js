// Thumbnail switcher
function setHero(el, src) {
  document.getElementById('hero-main').src = src;
  document.querySelectorAll('.hero-thumb').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
}

// Color / variant selection
function initColorButtons() {
  document.querySelectorAll('.color-options').forEach(group => {
    group.querySelectorAll('.color-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        group.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const label = btn.closest('.color-section').querySelector('label');
        if (label) label.innerHTML = 'Color — <strong>' + btn.textContent + '</strong>';
        // Sync Shopify variant ID across both forms
        const variantId = btn.dataset.variantId;
        if (variantId) {
          document.querySelectorAll('.variant-id-input').forEach(input => {
            input.value = variantId;
          });
        }
      });
    });
  });

  document.querySelectorAll('.buy-color-btns').forEach(group => {
    group.querySelectorAll('.buy-color-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        group.querySelectorAll('.buy-color-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const variantId = btn.dataset.variantId;
        if (variantId) {
          document.querySelectorAll('.variant-id-input').forEach(input => {
            input.value = variantId;
          });
        }
      });
    });
  });
}

// Shopify AJAX add-to-cart
function initCartButtons() {
  document.querySelectorAll('.btn-cart, .buy-btn-cart').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      const variantId = document.querySelector('.variant-id-input')?.value;
      if (!variantId) { window.location.href = '/cart'; return; }
      const original = this.textContent;
      this.textContent = 'Adding...';
      this.disabled = true;
      fetch('/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ id: variantId, quantity: 1 })
      })
      .then(r => r.json())
      .then(() => { window.location.href = '/cart'; })
      .catch(() => { this.textContent = original; this.disabled = false; });
    });
  });
}

// Buy Now — skip cart, go straight to checkout
function initBuyNowButtons() {
  document.querySelectorAll('.btn-buy, .buy-btn-buy').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      const variantId = document.querySelector('.variant-id-input')?.value;
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
