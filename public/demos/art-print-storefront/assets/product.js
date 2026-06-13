// product.js -- product detail page logic (product.html)

import { getPrintById, SIZES, fullUrl, priceForSize, editionLabel } from "./data.js";
import { addToCart, getCart, cartTotal, updateBadge } from "./cart.js";
import { doCheckout, showOrderConfirmation } from "./checkout.js";

// ─── Parse URL ────────────────────────────────────────────────────────────────

const params  = new URLSearchParams(window.location.search);
const print   = getPrintById(params.get("id") || 1);
let selectedSize = 2; // default: 16x20 (index 2)

// ─── Init ─────────────────────────────────────────────────────────────────────

function init() {
  if (!print) {
    document.body.innerHTML = `
      <div style="padding:3rem;font-family:Inter,sans-serif;color:#f2ede4;background:#121118;min-height:100vh">
        <p>Print not found.</p>
        <a href="index.html" style="color:#e8b820;margin-top:1rem;display:inline-block">Back to gallery</a>
      </div>`;
    return;
  }

  // Editorial image
  const img = document.getElementById("product-img");
  if (img) { img.src = fullUrl(print); img.alt = print.title; }

  // Text fields
  setText("product-title",  print.title);
  setText("product-artist", print.artist);
  setText("meta-medium",    print.medium);
  setText("meta-substrate", print.substrate);
  setText("meta-edition-type", print.edition === "limited" ? "Limited Edition" : "Open Edition");
  setText("meta-edition-num",  print.edition === "limited" ? `${print.editionNum} of ${print.editionSize}` : "No limit");

  // Edition badge
  const editionEl = document.getElementById("product-edition");
  if (editionEl) {
    const badge = document.createElement("span");
    badge.className = "edition-badge " + print.edition;
    badge.textContent = editionLabel(print);
    editionEl.appendChild(badge);
  }

  // Size buttons
  const sizeBtns = document.querySelectorAll(".size-btn");
  sizeBtns.forEach((btn, i) => {
    btn.textContent = SIZES[i].label;
    btn.dataset.si  = i;
    btn.addEventListener("click", () => {
      selectedSize = i;
      sizeBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      updatePrice();
    });
  });
  sizeBtns[selectedSize]?.classList.add("active");
  updatePrice();

  // Add to cart
  document.getElementById("add-to-cart-btn")?.addEventListener("click", onAddToCart);

  // Cart button in header
  document.getElementById("cart-btn")?.addEventListener("click", () => {
    renderCartModal();
    document.getElementById("cart-modal-overlay")?.classList.add("open");
  });

  // Cart modal close (X button)
  document.getElementById("cart-modal-close")?.addEventListener("click", () => {
    document.getElementById("cart-modal-overlay")?.classList.remove("open");
  });

  // Cart modal close (click backdrop)
  document.getElementById("cart-modal-overlay")?.addEventListener("click", (e) => {
    if (e.target === e.currentTarget) e.currentTarget.classList.remove("open");
  });

  // Checkout button inside cart modal
  document.getElementById("checkout-btn")?.addEventListener("click", () => {
    document.getElementById("cart-modal-overlay")?.classList.remove("open");
    doCheckout(order => showOrderConfirmation(order));
  });

  // Login modal backdrop close
  document.getElementById("login-modal-overlay")?.addEventListener("click", (e) => {
    if (e.target === e.currentTarget) e.currentTarget.classList.remove("open");
  });

  // Confirm modal backdrop close
  document.getElementById("confirm-modal-overlay")?.addEventListener("click", (e) => {
    if (e.target === e.currentTarget) e.currentTarget.classList.remove("open");
  });

  // Coaching panel
  initCoachingPanel();

  // Initial badge
  updateBadge();
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function updatePrice() {
  const price = priceForSize(print, selectedSize);
  const el = document.getElementById("price-display");
  if (el) el.textContent = `$${price}`;
}

function onAddToCart() {
  addToCart({
    printId: print.id,
    title:   print.title,
    size:    SIZES[selectedSize].label,
    price:   priceForSize(print, selectedSize),
  });
  updateBadge();
  showToast(`${print.title} added to cart`);
}

function showToast(msg) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add("visible");
  setTimeout(() => toast.classList.remove("visible"), 2800);
}

// ─── Cart modal ───────────────────────────────────────────────────────────────

function renderCartModal() {
  const cart   = getCart();
  const body   = document.getElementById("cart-modal-body");
  const footer = document.getElementById("cart-modal-footer");
  if (!body || !footer) return;

  if (cart.length === 0) {
    body.innerHTML      = `<p class="cart-empty">Your cart is empty.</p>`;
    footer.style.display = "none";
    return;
  }

  footer.style.display = "";
  body.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-info">
        <div class="cart-item-title">${item.title}</div>
        <div class="cart-item-meta">${item.size} print</div>
      </div>
      <div class="cart-item-price">$${item.price}</div>
    </div>`).join("");

  const totalEl = document.getElementById("cart-total-value");
  if (totalEl) totalEl.textContent = `$${cartTotal()}`;
}

// ─── Coaching panel ───────────────────────────────────────────────────────────

function initCoachingPanel() {
  const panel   = document.getElementById("coaching-panel");
  const trigger = document.getElementById("coaching-trigger");
  const close   = document.getElementById("coaching-close");

  trigger?.addEventListener("click", () => panel?.classList.add("open"));
  close?.addEventListener("click",   () => panel?.classList.remove("open"));

  document.querySelectorAll(".coaching-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".coaching-tab").forEach(t => t.classList.remove("active"));
      document.querySelectorAll(".tab-pane").forEach(p => p.classList.remove("active"));
      tab.classList.add("active");
      document.getElementById(tab.dataset.pane)?.classList.add("active");
    });
  });
}

// ─── Boot ─────────────────────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", init);
