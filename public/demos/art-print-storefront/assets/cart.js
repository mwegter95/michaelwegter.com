// Shared cart helpers -- persisted in localStorage under "art_cart".

const CART_KEY = "art_cart";

export function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

// item: { printId, title, size, price }
export function addToCart(item) {
  const cart = getCart();
  cart.push({ ...item, addedAt: Date.now() });
  saveCart(cart);
  return cart;
}

export function clearCart() {
  localStorage.removeItem(CART_KEY);
}

export function cartCount() {
  return getCart().length;
}

export function cartTotal() {
  return getCart().reduce((sum, item) => sum + item.price, 0);
}

// Update every .cart-badge element on the page
export function updateBadge() {
  const count = cartCount();
  document.querySelectorAll(".cart-badge").forEach(el => {
    el.textContent = count;
    el.classList.toggle("visible", count > 0);
  });
}
