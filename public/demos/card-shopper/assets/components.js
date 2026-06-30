// components.js
// Shared presentational components + small helpers. Exposed on window.CS.UI.
(function () {
  "use strict";
  window.CS = window.CS || {};
  const { useState, useEffect, useRef } = React;
  const html = htm.bind(React.createElement);
  const Data = CS.Data;

  // ---- helpers ----
  const money = (n) => "$" + Number(n || 0).toLocaleString("en-US");
  function fmtDate(ts) {
    return new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
  function fmtDateTime(ts) {
    return new Date(ts).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
  }
  function relTime(ts) {
    const s = Math.round((Date.now() - ts) / 1000);
    if (s < 60) return "just now";
    const m = Math.round(s / 60); if (m < 60) return m + "m ago";
    const h = Math.round(m / 60); if (h < 24) return h + "h ago";
    const d = Math.round(h / 24); return d + "d ago";
  }

  // ---- small atoms ----
  function CatDot({ cat }) { return html`<span class="cat-dot" data-cat=${cat}></span>`; }
  function GradePill({ grade }) { return html`<span class="pill grade num">${grade}</span>`; }
  function Verified() {
    return html`<span class="verified"><span class="seal">\u2713</span>Verified shop</span>`;
  }
  function Chip({ active, cat, onClick, children }) {
    return html`<button class=${"chip" + (active ? " on" : "")} data-cat=${cat || null} onClick=${onClick}>
      ${cat ? html`<span class="dot" style=${{ background: Data.catColor[cat] }}></span>` : null}${children}
    </button>`;
  }

  // ---- card face (fully CSS-drawn, zero-network, no mismatched stock art) ----
  function TradingCard({ listing: l, compact }) {
    const frame = Data.catColor[l.cat];
    const mono = (l.player || "?").trim().charAt(0).toUpperCase();
    return html`
      <div class=${"tcard" + (l.foil ? " foil" : "")} style=${{ "--frame": frame }}>
        <div class="catbar"></div>
        <div class="art">
          <div class="cardart" aria-hidden="true">
            <div class="cardart-emblem">${Data.catIcon[l.cat]}</div>
            <div class="cardart-mono">${mono}</div>
            <div class="cardart-name">${l.player}</div>
            ${l.set ? html`<div class="cardart-set">${l.set}</div>` : null}
          </div>
          <div class="overlay"></div>
          <div class="grade"><${GradePill} grade=${l.grade} /></div>
        </div>
        <div class="meta">
          <div class="player">${l.player}</div>
          <div class="sub">${[l.set, l.year].filter(Boolean).join(" \u00B7 ")}${l.team ? " \u00B7 " + l.team : ""}</div>
          <div class="row">
            <span class="price num">${money(l.price)}</span>
            ${l.foil ? html`<span class="pill">Foil</span>` : (compact ? null : html`<span class="muted" style=${{ fontSize: "11px" }}>${Data.catLabel[l.cat]}</span>`)}
          </div>
        </div>
      </div>`;
  }

  function CardBack() {
    return html`<div class="cardback"><div class="crest">CS</div></div>`;
  }

  // ---- map pin ----
  function Pin({ shop, hasDrop, onClick }) {
    const color = Data.catColor[shop.cat];
    return html`
      <button class=${"pin" + (hasDrop ? " drop" : "")} style=${{ left: shop.left + "%", top: shop.top + "%", color }}
        onClick=${onClick} aria-label=${shop.name + ", " + shop.city + ", " + Data.catLabel[shop.cat]}>
        <span class="ring"></span>
        <span class="head" style=${{ background: color }}></span>
        ${hasDrop ? html`<span class="drop-dot"></span>` : null}
        <span class="tip">${shop.name}</span>
      </button>`;
  }

  // ---- modal ----
  function Modal({ title, onClose, children, footer }) {
    useEffect(() => {
      function onKey(e) { if (e.key === "Escape") onClose(); }
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);
    return html`
      <div class="modal-scrim" onMouseDown=${(e) => { if (e.target === e.currentTarget) onClose(); }}>
        <div class="modal panel pad" role="dialog" aria-modal="true" aria-label=${title}>
          <div class="modal-head">
            <h3>${title}</h3>
            <button class="iconbtn" style=${{ color: "var(--ink)", borderColor: "var(--line-ink)" }} onClick=${onClose} aria-label="Close">\u2715</button>
          </div>
          ${children}
          ${footer ? html`<div class="row mt" style=${{ justifyContent: "flex-end", gap: "10px" }}>${footer}</div>` : null}
        </div>
      </div>`;
  }

  // ---- states ----
  function Empty({ icon, title, sub, action }) {
    return html`<div class="empty">
      <div class="ic">${icon || "\u{1F50D}"}</div>
      <h3 class="mt-s">${title}</h3>
      ${sub ? html`<p class="muted">${sub}</p>` : null}
      ${action || null}
    </div>`;
  }
  function Loading({ label }) {
    return html`<div class="detecting"><div class="spinner"></div><div class="muted">${label || "Loading"}</div></div>`;
  }
  function Success({ title, sub, children }) {
    return html`<div class="center">
      <div class="success-tick">\u2713</div>
      <h3>${title}</h3>
      ${sub ? html`<p class="muted">${sub}</p>` : null}
      ${children || null}
    </div>`;
  }

  CS.UI = {
    money, fmtDate, fmtDateTime, relTime,
    CatDot, GradePill, Verified, Chip, TradingCard, CardBack, Pin, Modal, Empty, Loading, Success,
  };
})();
