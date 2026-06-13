// gallery.js -- horizontal scroll gallery + coaching panel (index.html)

import { PRINTS, SIZES, thumbUrl, priceForSize } from "./data.js";
import { updateBadge } from "./cart.js";

// ─── Render gallery cards ─────────────────────────────────────────────────────

function renderGallery() {
  const track = document.getElementById("gallery-track");
  if (!track) return;

  PRINTS.forEach(p => {
    const basePrice = priceForSize(p, 0);
    const badgeClass = p.edition === "limited" ? "limited" : "open";
    const badgeText  = p.edition === "limited" ? "Limited Ed." : "Open Edition";

    const card = document.createElement("a");
    card.className  = "print-card";
    card.href       = `product.html?id=${p.id}`;
    card.innerHTML  = `
      <img class="print-card-img"
           src="${thumbUrl(p)}"
           alt="${p.title}"
           loading="lazy"
           draggable="false">
      <div class="print-card-body">
        <span class="edition-badge ${badgeClass}">${badgeText}</span>
        <div class="print-title">${p.title}</div>
        <div class="print-artist">${p.artist}</div>
        <div class="print-price">From <strong>$${basePrice}</strong></div>
      </div>`;
    track.appendChild(card);
  });

  // Update count label
  const countEl = document.getElementById("gallery-count");
  if (countEl) countEl.textContent = `${PRINTS.length} works`;
}

// ─── Scroll controls ──────────────────────────────────────────────────────────

function initScroll() {
  const track = document.getElementById("gallery-track");
  if (!track) return;

  const CARD_W = 256 + 20; // card width + gap

  document.getElementById("btn-prev")?.addEventListener("click", () => {
    track.scrollBy({ left: -CARD_W, behavior: "smooth" });
  });
  document.getElementById("btn-next")?.addEventListener("click", () => {
    track.scrollBy({ left: CARD_W, behavior: "smooth" });
  });

  // Drag to scroll
  let isDragging = false;
  let startX     = 0;
  let scrollLeft = 0;

  track.addEventListener("mousedown", (e) => {
    isDragging = true;
    startX     = e.pageX - track.offsetLeft;
    scrollLeft = track.scrollLeft;
    track.classList.add("dragging");
  });

  window.addEventListener("mouseup", () => {
    isDragging = false;
    track.classList.remove("dragging");
  });

  track.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x    = e.pageX - track.offsetLeft;
    const walk = (x - startX) * 1.5;
    track.scrollLeft = scrollLeft - walk;
  });

  // Remap vertical wheel to horizontal scroll
  track.addEventListener("wheel", (e) => {
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      e.preventDefault();
      track.scrollBy({ left: e.deltaY, behavior: "auto" });
    }
  }, { passive: false });
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

document.addEventListener("DOMContentLoaded", () => {
  renderGallery();
  initScroll();
  initCoachingPanel();
  updateBadge();
});
