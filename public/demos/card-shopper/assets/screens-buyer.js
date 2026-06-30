// screens-buyer.js
// Watchlist page, offers inbox (state machine), messages list, and orders.
(function () {
  "use strict";
  window.CS = window.CS || {};
  CS.Screens = CS.Screens || {};
  const html = htm.bind(React.createElement);
  const Data = CS.Data;
  const { TradingCard, money, fmtDateTime, relTime, Empty } = CS.UI;

  function thumb(l) { return html`<div class="thumb"><${TradingCard} listing=${l} compact=${true} /></div>`; }

  function Watchlist() {
    const { state, allListings, actions, openModal, nav } = React.useContext(CS.Ctx);
    const items = state.watchlist.map((id) => allListings.find((l) => l.id === id)).filter(Boolean);
    return html`<div class="page">
      <div class="eyebrow">Saved cards</div>
      <h1 class="section-title">Your watchlist</h1>
      <div class="hairline"></div>
      ${items.length === 0
        ? html`<${Empty} icon="\u2606" title="Your watchlist is empty" sub="Tap the star on any card to save it here." action=${html`<button class="btn gold mt" onClick=${() => nav("home")}>Find cards</button>`} />`
        : html`<div class="list">${items.map((l) => {
            const shop = Data.shopById(l.shopId) || { name: "Your Booth" };
            return html`<div key=${l.id} class="list-row">
              ${thumb(l)}
              <div class="grow"><h4>${l.player}</h4><div class="muted" style=${{ fontSize: "13px" }}>${l.set} \u00B7 ${l.year} \u00B7 ${shop.name}</div><div class="price num mt-s" style=${{ fontFamily: "Fraunces", fontSize: "17px" }}>${money(l.price)}</div></div>
              <div class="row wrap gap-s">
                <button class="btn sm buy" onClick=${() => openModal({ type: "buy", listing: l })}>Buy</button>
                <button class="btn sm" onClick=${() => openModal({ type: "offer", listing: l })}>Offer</button>
                <button class="btn sm ghost danger" onClick=${() => actions.toggleWatch(l.id)}>Remove</button>
              </div>
            </div>`;
          })}</div>`}
    </div>`;
  }

  function Offers() {
    const { state, allListings, openModal, nav } = React.useContext(CS.Ctx);
    const offers = [...state.offers].sort((a, b) => b.createdAt - a.createdAt);
    return html`<div class="page">
      <div class="eyebrow">Negotiations</div>
      <h1 class="section-title">Your offers</h1>
      <div class="hairline"></div>
      ${offers.length === 0
        ? html`<${Empty} icon="\u{1F4B0}" title="No offers yet" sub="Open a card and tap Offer to start a negotiation." action=${html`<button class="btn gold mt" onClick=${() => nav("home")}>Browse shops</button>`} />`
        : html`<div class="list">${offers.map((o) => {
            const l = allListings.find((x) => x.id === o.listingId);
            if (!l) return null;
            const shop = Data.shopById(l.shopId) || { name: "Your Booth" };
            return html`<div key=${o.id} class="list-row">
              ${thumb(l)}
              <div class="grow">
                <h4>${l.player}</h4>
                <div class="muted" style=${{ fontSize: "13px" }}>${shop.name} \u00B7 asking ${money(l.price)}</div>
                <div class="mt-s">Your offer <b class="num">${money(o.amount)}</b> <span class=${"pill status-" + o.status}>${o.status}</span></div>
              </div>
              <div class="row wrap gap-s">
                ${o.status === "accepted" ? html`<button class="btn sm buy" onClick=${() => openModal({ type: "buy", listing: Object.assign({}, l, { price: o.amount }) })}>Buy at ${money(o.amount)}</button>` : null}
                ${o.status === "pending" ? html`<span class="muted" style=${{ fontSize: "13px" }}>Awaiting seller...</span>` : null}
                <button class="btn sm" onClick=${() => openModal({ type: "message", listing: l })}>Message</button>
              </div>
            </div>`;
          })}</div>`}
    </div>`;
  }

  function Messages() {
    const { state, allListings, openModal, nav } = React.useContext(CS.Ctx);
    const ids = Object.keys(state.threads);
    return html`<div class="page">
      <div class="eyebrow">Conversations</div>
      <h1 class="section-title">Messages</h1>
      <div class="hairline"></div>
      ${ids.length === 0
        ? html`<${Empty} icon="\u{1F4AC}" title="No messages yet" sub="Message a seller from any card to start a thread." action=${html`<button class="btn gold mt" onClick=${() => nav("home")}>Browse shops</button>`} />`
        : html`<div class="list">${ids.map((id) => {
            const l = allListings.find((x) => x.id === id);
            if (!l) return null;
            const shop = Data.shopById(l.shopId) || { name: "Your Booth" };
            const thread = state.threads[id];
            const last = thread[thread.length - 1];
            return html`<button key=${id} class="list-row" style=${{ textAlign: "left", cursor: "pointer", width: "100%" }} onClick=${() => openModal({ type: "message", listing: l })}>
              ${thumb(l)}
              <div class="grow"><h4>${shop.name}</h4><div class="muted" style=${{ fontSize: "13px" }}>${l.player}</div><div class="mt-s" style=${{ fontSize: "13px" }}><b>${last.from === "buyer" ? "You" : shop.name}:</b> ${last.body}</div></div>
              <span class="muted" style=${{ fontSize: "12px" }}>${relTime(last.ts)}</span>
            </button>`;
          })}</div>`}
    </div>`;
  }

  function Orders() {
    const { state, allListings, nav } = React.useContext(CS.Ctx);
    const orders = [...state.orders].sort((a, b) => b.createdAt - a.createdAt);
    return html`<div class="page">
      <div class="eyebrow">Purchases</div>
      <h1 class="section-title">Your orders</h1>
      <div class="hairline"></div>
      ${orders.length === 0
        ? html`<${Empty} icon="\u{1F6CD}" title="No orders yet" sub="Buy a card instantly and it will show up here." action=${html`<button class="btn gold mt" onClick=${() => nav("home")}>Start shopping</button>`} />`
        : html`<div class="list">${orders.map((o) => {
            const l = allListings.find((x) => x.id === o.listingId) || o.snapshot;
            const shop = Data.shopById(o.shopId) || { name: "Your Booth" };
            return html`<div key=${o.id} class="list-row">
              ${l ? thumb(l) : null}
              <div class="grow">
                <h4>${(l && l.player) || "Card"}</h4>
                <div class="muted" style=${{ fontSize: "13px" }}>${o.id} \u00B7 ${shop.name} \u00B7 ${fmtDateTime(o.createdAt)}</div>
              </div>
              <div class="center">
                <div class="price num" style=${{ fontFamily: "Fraunces", fontSize: "17px" }}>${money(o.price)}</div>
                <span class="pill status-active">${o.status}</span>
              </div>
            </div>`;
          })}</div>`}
    </div>`;
  }

  Object.assign(CS.Screens, { Watchlist, Offers, Messages, Orders });
})();
