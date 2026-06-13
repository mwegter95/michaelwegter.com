// checkout.js -- login modal, JWT auth, checkout POST, order confirmation.
// Imported by product.js.

import { getCart, clearCart, updateBadge } from "./cart.js";

const API     = "https://api.michaelwegter.com";
const JWT_KEY = "art_jwt";

// ─── Token helpers ────────────────────────────────────────────────────────────

export function getToken()   { return sessionStorage.getItem(JWT_KEY); }
export function saveToken(t) { sessionStorage.setItem(JWT_KEY, t); }
export function clearToken() { sessionStorage.removeItem(JWT_KEY); }
export function isLoggedIn() { return !!getToken(); }

// ─── Login modal ──────────────────────────────────────────────────────────────

export function showLoginModal(onSuccess) {
  const overlay  = document.getElementById("login-modal-overlay");
  if (!overlay) return;

  overlay.classList.add("open");

  const form     = overlay.querySelector(".login-form");
  const errEl    = overlay.querySelector(".login-error");
  const loginBtn = overlay.querySelector(".login-btn");

  // Reset UI state
  errEl.classList.remove("visible");
  errEl.textContent = "";
  if (form.querySelector("[name=email]"))    form.querySelector("[name=email]").value    = "";
  if (form.querySelector("[name=password]")) form.querySelector("[name=password]").value = "";

  form.onsubmit = async (e) => {
    e.preventDefault();
    const email    = (form.querySelector("[name=email]")?.value || "").trim();
    const password = form.querySelector("[name=password]")?.value || "";
    if (!email || !password) return;

    loginBtn.disabled    = true;
    loginBtn.textContent = "Signing in...";
    errEl.classList.remove("visible");

    try {
      const res  = await fetch(`${API}/art-store/login`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");

      saveToken(data.token);
      overlay.classList.remove("open");
      if (typeof onSuccess === "function") onSuccess();

    } catch (err) {
      errEl.textContent = err.message;
      errEl.classList.add("visible");
    } finally {
      loginBtn.disabled    = false;
      loginBtn.textContent = "Sign In";
    }
  };

  overlay.querySelector(".modal-close-login")?.addEventListener("click", () => {
    overlay.classList.remove("open");
  }, { once: true });
}

// ─── Checkout ─────────────────────────────────────────────────────────────────

export async function doCheckout(onConfirmation) {
  const token = getToken();
  if (!token) {
    showLoginModal(() => doCheckout(onConfirmation));
    return;
  }

  const cart  = getCart();
  const total = cart.reduce((s, i) => s + i.price, 0);

  try {
    const res  = await fetch(`${API}/art-store/checkout`, {
      method:  "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ items: cart, total }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Checkout failed");

    clearCart();
    updateBadge();
    if (typeof onConfirmation === "function") onConfirmation(data);

  } catch (err) {
    // If token expired, clear and re-prompt
    if (err.message.includes("Invalid") || err.message.includes("Unauthorized")) {
      clearToken();
      showLoginModal(() => doCheckout(onConfirmation));
    } else {
      alert("Checkout error: " + err.message);
    }
  }
}

// ─── Order confirmation modal ─────────────────────────────────────────────────

export function showOrderConfirmation(order) {
  const overlay = document.getElementById("confirm-modal-overlay");
  if (!overlay) return;

  const idEl    = overlay.querySelector(".order-id");
  const emailEl = overlay.querySelector(".order-email");
  const shipEl  = overlay.querySelector(".order-ship");

  if (idEl)    idEl.textContent    = `Order ${order.orderId}`;
  if (emailEl) emailEl.textContent = order.email;
  if (shipEl)  shipEl.textContent  = order.shipping || "3 to 5 business days";

  overlay.classList.add("open");

  overlay.querySelector(".order-close-btn")?.addEventListener("click", () => {
    overlay.classList.remove("open");
  }, { once: true });

  overlay.querySelector(".modal-close-confirm")?.addEventListener("click", () => {
    overlay.classList.remove("open");
  }, { once: true });
}
