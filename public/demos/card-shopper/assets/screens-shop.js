// screens-shop.js
// Shop profile: the HERO value-box flip bin, grid view, per-shop search,
// multi-facet filters, sort, follow, and per-card actions (watch/offer/buy/message).
(function () {
  "use strict";
  window.CS = window.CS || {};
  CS.Screens = CS.Screens || {};
  const { useState, useMemo, useEffect } = React;
  const html = htm.bind(React.createElement);
  const Data = CS.Data;
  const { TradingCard, CardBack, GradePill, Verified, Modal, money, fmtDateTime, relTime, Empty, Success } = CS.UI;

  // ---- per-card action buttons (shared by flip reveal + grid) ----
  function CardActions({ listing, small }) {
    const { state, actions, openModal } = React.useContext(CS.Ctx);
    const watched = state.watchlist.includes(listing.id);
    const cls = "btn" + (small ? " sm" : "");
    return html`
      <button class=${cls + (watched ? " gold" : "")} onClick=${() => actions.toggleWatch(listing.id)} aria-pressed=${watched}>
        ${watched ? "\u2605 Saved" : "\u2606 Watch"}
      </button>
      <button class=${cls + " buy"} onClick=${() => openModal({ type: "buy", listing })}>Buy ${money(listing.price)}</button>
      <button class=${cls} onClick=${() => openModal({ type: "offer", listing })}>Offer</button>
      <button class=${cls} onClick=${() => openModal({ type: "message", listing })}>Message</button>`;
  }

  // ---- the flip bin (hero) ----
  function FlipBin({ cards }) {
    const [idx, setIdx] = useState(0);
    const [flipped, setFlipped] = useState(false);
    useEffect(() => { setIdx(0); setFlipped(false); }, [cards.map((c) => c.id).join(",")]);

    if (!cards.length) {
      return html`<div class="flipbin"><div class="bin-empty">No cards match these filters. Loosen a filter to refill the bin.</div></div>`;
    }
    const done = idx >= cards.length;
    const top = cards[idx];
    const fan = cards.slice(idx + 1, idx + 5); // a few face-down cards behind

    function next() { setFlipped(false); setIdx((i) => i + 1); }
    function onTopKey(e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setFlipped((f) => !f); } }

    return html`<div class="flipbin">
      ${done
        ? html`<div class="center">
            <${Success} title="You dug through the whole bin" sub=${"That is all " + cards.length + " cards in this box."} />
            <button class="btn gold mt" onClick=${() => { setIdx(0); setFlipped(false); }}>Restart the bin</button>
          </div>`
        : html`
          <div class="bin-stage">
            ${fan.map((c, i) => html`<div key=${c.id} class="flipcard" style=${{
                transform: `rotate(${(i + 1) * 2.4}deg) translate(${(i + 1) * 7}px, ${(i + 1) * 5}px) scale(${1 - (i + 1) * 0.02})`,
                zIndex: 5 - i, opacity: 1 - i * 0.12, transition: "transform .4s",
              }}>
              <div class="side back"><${CardBack} /></div>
            </div>`)}
            <div class=${"flipcard" + (flipped ? " flipped" : "")} style=${{ zIndex: 10 }}
              role="button" tabindex="0" aria-label=${flipped ? top.player : "Face-down card, activate to flip"}
              onClick=${() => setFlipped((f) => !f)} onKeyDown=${onTopKey}>
              <div class="side back"><${CardBack} /></div>
              <div class="side front"><${TradingCard} listing=${top} /></div>
            </div>
          </div>
          <div class="bin-controls">
            <button class="btn sm ghost" onClick=${() => { setFlipped(false); setIdx((i) => Math.max(0, i - 1)); }} disabled=${idx === 0}>\u2039 Prev</button>
            <span class="bin-progress">${idx + 1} / ${cards.length}</span>
            <button class="btn sm gold" onClick=${next}>Next card \u203A</button>
          </div>
          ${flipped
            ? html`<div class="reveal-actions"><${CardActions} listing=${top} small=${true} /></div>`
            : html`<div class="bin-hint">Tap the card to flip it, like digging through a bin at the show</div>`}
        `}
    </div>`;
  }

  function Shop({ params }) {
    const { state, allListings, actions, nav } = React.useContext(CS.Ctx);
    const shop = Data.shopById(params.shopId);
    const [view, setView] = useState("flip");
    const [boxId, setBoxId] = useState(null);
    const [q, setQ] = useState("");
    const [priceMax, setPriceMax] = useState(2500);
    const [grade, setGrade] = useState("all");
    const [fcat, setFcat] = useState("all");
    const [sort, setSort] = useState("featured");

    const boxes = useMemo(() => Data.valueBoxes.filter((b) => b.shopId === shop.id), [shop.id]);
    useEffect(() => { setBoxId(boxes.length ? boxes[0].id : null); }, [shop.id]);

    const shopListings = useMemo(() => allListings.filter((l) => l.shopId === shop.id), [allListings, shop.id]);
    const grades = useMemo(() => ["all", ...Array.from(new Set(shopListings.map((l) => l.grade)))], [shopListings]);
    const cats = useMemo(() => Array.from(new Set(shopListings.map((l) => l.cat))), [shopListings]);

    function applyFilters(list) {
      const qq = q.trim().toLowerCase();
      let out = list.filter((l) => {
        if (qq && ![l.player, l.team, l.set, l.year].join(" ").toLowerCase().includes(qq)) return false;
        if (l.price > priceMax) return false;
        if (grade !== "all" && l.grade !== grade) return false;
        if (fcat !== "all" && l.cat !== fcat) return false;
        return true;
      });
      if (sort === "price-asc") out = [...out].sort((a, b) => a.price - b.price);
      else if (sort === "price-desc") out = [...out].sort((a, b) => b.price - a.price);
      else if (sort === "grade") out = [...out].sort((a, b) => b.grade.localeCompare(a.grade));
      else if (sort === "newest") out = [...out].sort((a, b) => Number(b.year.slice(0, 4)) - Number(a.year.slice(0, 4)));
      return out;
    }

    const gridCards = applyFilters(shopListings);
    const boxCards = applyFilters(boxId ? shopListings.filter((l) => l.vb === boxId) : shopListings);

    const isFollowing = state.follows.includes(shop.id);
    const drops = state.drops.filter((d) => d.shopId === shop.id && d.scheduled);

    return html`<div class="page">
      <button class="btn sm ghost mb" onClick=${() => nav("home")}>\u2039 Back to map</button>

      <div class="shop-header">
        <div class="shop-avatar" style=${{ background: `linear-gradient(135deg, ${Data.catColor[shop.cat]}, #10131c)` }}>${Data.catIcon[shop.cat]}</div>
        <div class="grow" style=${{ flex: 1, minWidth: "200px" }}>
          <h1 class="section-title">${shop.name}</h1>
          <div class="row gap-s wrap" style=${{ fontSize: "13px" }}>
            ${shop.verified ? html`<${Verified} />` : null}
            <span class="muted">\u{1F4CD} ${shop.city}</span>
            <span class="muted">${shop.followers.toLocaleString()} followers</span>
          </div>
          <div class="muted" style=${{ marginTop: "6px" }}>${shop.specialty}</div>
        </div>
        <button class=${"btn" + (isFollowing ? "" : " gold")} onClick=${() => actions.toggleFollow(shop.id)}>
          ${isFollowing ? "\u2713 Following" : "+ Follow shop"}
        </button>
      </div>

      ${drops.length ? html`<div class="banner mb" style=${{ display: "inline-flex" }}>
        <span class="glyph" style=${{ background: Data.catColor[shop.cat] }}>\u{1F4E3}</span>
        <span><small>UPCOMING DROP \u00B7 ${fmtDateTime(drops[0].date)}</small><div style=${{ fontWeight: 600 }}>${drops[0].title}</div></span>
      </div>` : null}

      <div class="row between wrap gap-s mb">
        <div class="seg" role="tablist" aria-label="Inventory view">
          <button class=${view === "flip" ? "on" : ""} onClick=${() => setView("flip")} role="tab" aria-selected=${view === "flip"}>\u{1F0CF} Value box flip</button>
          <button class=${view === "grid" ? "on" : ""} onClick=${() => setView("grid")} role="tab" aria-selected=${view === "grid"}>\u2637 Grid</button>
        </div>
        <input class="input" style=${{ maxWidth: "260px" }} placeholder="Search this shop by player, team, set" value=${q} onInput=${(e) => setQ(e.target.value)} aria-label="Search this shop" />
      </div>

      ${view === "flip" && boxes.length ? html`<div class="row wrap gap-s mb">
        ${boxes.map((b) => html`<button key=${b.id} class=${"chip" + (boxId === b.id ? " on" : "")} onClick=${() => setBoxId(b.id)}>${b.title}</button>`)}
      </div>` : null}
      ${view === "flip" && boxId ? html`<p class="muted mb">${(boxes.find((b) => b.id === boxId) || {}).note}</p>` : null}

      <div class="shop-layout">
        <aside class="panel pad filter-rail">
          <div class="filter-group">
            <label>Max price</label>
            <input class="range" type="range" min="50" max="2500" step="10" value=${priceMax} onInput=${(e) => setPriceMax(Number(e.target.value))} aria-label="Maximum price" />
            <div class="range-vals"><span>$50</span><span class="num">up to ${money(priceMax)}</span></div>
          </div>
          ${cats.length > 1 ? html`<div class="filter-group">
            <label>Category</label>
            <div class="row wrap gap-s">
              <button class=${"chip" + (fcat === "all" ? " on" : "")} onClick=${() => setFcat("all")}>All</button>
              ${cats.map((c) => html`<button key=${c} class=${"chip" + (fcat === c ? " on" : "")} data-cat=${c} onClick=${() => setFcat(c)}><span class="dot" style=${{ background: Data.catColor[c] }}></span>${Data.catLabel[c]}</button>`)}
            </div>
          </div>` : null}
          <div class="filter-group">
            <label>Grade</label>
            <select class="select" value=${grade} onChange=${(e) => setGrade(e.target.value)}>
              ${grades.map((g) => html`<option key=${g} value=${g}>${g === "all" ? "Any grade" : g}</option>`)}
            </select>
          </div>
          <div class="filter-group">
            <label>Sort</label>
            <select class="select" value=${sort} onChange=${(e) => setSort(e.target.value)}>
              <option value="featured">Featured</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
              <option value="newest">Newest year</option>
              <option value="grade">Grade</option>
            </select>
          </div>
          <button class="btn sm ghost" onClick=${() => { setQ(""); setPriceMax(2500); setGrade("all"); setFcat("all"); setSort("featured"); }}>Reset filters</button>
        </aside>

        <section>
          ${view === "flip"
            ? html`<${FlipBin} cards=${boxCards} />`
            : (gridCards.length
              ? html`<div class="card-grid">
                  ${gridCards.map((l) => html`<div key=${l.id} class="grid-item">
                    <div class="tilt"><${TradingCard} listing=${l} /></div>
                    <div class="quick"><${CardActions} listing=${l} small=${true} /></div>
                  </div>`)}
                </div>`
              : html`<${Empty} title="No cards match" sub="Adjust price, grade, or category to see more." />`)}
        </section>
      </div>
    </div>`;
  }

  // ---- action modals (mounted by the app shell) ----
  function ActionModal() {
    const { modal, closeModal, state, actions, nav } = React.useContext(CS.Ctx);
    const [amount, setAmount] = useState(0);
    const [draft, setDraft] = useState("");
    const [bought, setBought] = useState(null);
    useEffect(() => {
      if (modal && modal.type === "offer") setAmount(Math.round(modal.listing.price * 0.85));
      setDraft(""); setBought(null);
    }, [modal]);
    if (!modal) return null;
    const l = modal.listing;
    const shop = Data.shopById(l.shopId) || { name: "Your Booth" };

    if (modal.type === "buy") {
      return html`<${Modal} title=${bought ? "Order confirmed" : "Buy now"} onClose=${closeModal}>
        ${bought
          ? html`<${Success} title="You bought it" sub=${l.player}>
              <div class="panel pad mt" style=${{ textAlign: "left" }}>
                <div class="row between"><span class="muted">Order</span><span class="num">${bought}</span></div>
                <div class="row between"><span class="muted">Total</span><span class="num">${money(l.price)}</span></div>
                <div class="row between"><span class="muted">Shop</span><span>${shop.name}</span></div>
              </div>
              <button class="btn gold block mt" onClick=${() => { closeModal(); nav("orders"); }}>View my orders</button>
            </${Success}>`
          : html`
            <div class="row gap-s mb"><div style=${{ width: "90px" }}><${TradingCard} listing=${l} compact=${true} /></div>
              <div><h4 style=${{ margin: "0 0 4px" }}>${l.player}</h4><div class="muted" style=${{ fontSize: "13px" }}>${l.set} \u00B7 ${l.year}</div><div class="price num mt-s" style=${{ fontSize: "22px", fontFamily: "Fraunces" }}>${money(l.price)}</div></div>
            </div>
            <p class="muted">Instant buy at the asking price from ${shop.name}. This is a prototype, no real charge is made.</p>
            <button class="btn buy block mt" onClick=${() => setBought(actions.buyNow(l))}>Confirm purchase ${money(l.price)}</button>`}
      </${Modal}>`;
    }

    if (modal.type === "offer") {
      const myOffer = [...state.offers].reverse().find((o) => o.listingId === l.id);
      return html`<${Modal} title="Make an offer" onClose=${closeModal}>
        <div class="row gap-s mb"><div style=${{ width: "76px" }}><${TradingCard} listing=${l} compact=${true} /></div>
          <div><h4 style=${{ margin: "0 0 4px" }}>${l.player}</h4><div class="muted" style=${{ fontSize: "13px" }}>Asking ${money(l.price)}</div></div></div>
        ${myOffer ? html`<div class=${"market-suggest mb"}>
            <span>Your last offer: <b class="num">${money(myOffer.amount)}</b></span>
            <span class=${"pill status-" + myOffer.status}>${myOffer.status}</span>
          </div>` : null}
        <div class="field"><label>Your offer</label>
          <input class="input num" type="number" min="1" value=${amount} onInput=${(e) => setAmount(Number(e.target.value))} aria-label="Offer amount" />
        </div>
        <p class="muted" style=${{ fontSize: "13px" }}>The seller will respond in a moment. Offers at or above 85 percent of asking are usually accepted.</p>
        <button class="btn gold block mt" disabled=${!amount} onClick=${() => { actions.makeOffer(l, amount); closeModal(); nav("offers"); }}>Send offer</button>
      </${Modal}>`;
    }

    // message thread
    const thread = state.threads[l.id] || [];
    return html`<${Modal} title=${"Message " + shop.name} onClose=${closeModal}>
      <div class="muted mb" style=${{ fontSize: "13px" }}>About: ${l.player} \u00B7 ${money(l.price)}</div>
      <div class="thread">
        ${thread.length === 0 ? html`<p class="muted center">Start the conversation. Sellers usually reply fast.</p>` : null}
        ${thread.map((m, i) => html`<div key=${i} class=${"msg " + m.from}>${m.body}<span class="ts">${relTime(m.ts)}</span></div>`)}
      </div>
      <div class="composer">
        <input class="input" placeholder="Ask about condition, shipping, a bundle..." value=${draft} onInput=${(e) => setDraft(e.target.value)}
          onKeyDown=${(e) => { if (e.key === "Enter" && draft.trim()) { actions.sendMessage(l, draft.trim()); setDraft(""); } }} aria-label="Message" />
        <button class="btn gold" disabled=${!draft.trim()} onClick=${() => { actions.sendMessage(l, draft.trim()); setDraft(""); }}>Send</button>
      </div>
    </${Modal}>`;
  }

  CS.Screens.Shop = Shop;
  CS.Screens.ActionModal = ActionModal;
})();
