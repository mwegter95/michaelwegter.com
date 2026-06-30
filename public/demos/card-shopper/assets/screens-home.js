// screens-home.js
// Map home (pins, drop banners, category tiles, global search) + follower feed.
(function () {
  "use strict";
  window.CS = window.CS || {};
  CS.Screens = CS.Screens || {};
  const { useState, useMemo } = React;
  const html = htm.bind(React.createElement);
  const Data = CS.Data;
  const { Pin, TradingCard, money, fmtDateTime, Empty, Verified } = CS.UI;

  function matchListing(l, q) {
    const hay = [l.player, l.team, l.set, l.year, l.grade, Data.catLabel[l.cat]].join(" ").toLowerCase();
    return hay.includes(q);
  }
  function matchShop(s, q) {
    return [s.name, s.city, s.specialty, Data.catLabel[s.cat]].join(" ").toLowerCase().includes(q);
  }

  function ShopCard({ shop, onOpen }) {
    return html`<button class="shop-card" onClick=${onOpen}>
      <div class="cover" style=${{ background: `linear-gradient(135deg, ${Data.catColor[shop.cat]}, #10131c)` }}></div>
      <div class="body">
        <div class="row between">
          <h3>${shop.name}</h3>
          <span class="cat-dot" data-cat=${shop.cat}></span>
        </div>
        <div class="muted" style=${{ fontSize: "13px" }}>${shop.city}</div>
        <div style=${{ fontSize: "13px", marginTop: "8px" }}>${shop.specialty}</div>
        <div class="row between mt-s" style=${{ fontSize: "12px" }}>
          ${shop.verified ? html`<${Verified} />` : html`<span></span>`}
          <span class="muted">${shop.followers.toLocaleString()} followers</span>
        </div>
      </div>
    </button>`;
  }

  function Home() {
    const { state, allListings, nav } = React.useContext(CS.Ctx);
    const [cat, setCat] = useState("all");
    const q = (state.search || "").trim().toLowerCase();

    const upcomingDrops = useMemo(
      () => [...state.drops].filter((d) => d.scheduled).sort((a, b) => a.date - b.date),
      [state.drops]
    );

    if (q) {
      const shops = Data.shops.filter((s) => matchShop(s, q));
      const listings = allListings.filter((l) => matchListing(l, q));
      return html`<div class="page">
        <div class="eyebrow">Global search</div>
        <h1 class="section-title">Results for "${state.search}"</h1>
        <div class="hairline"></div>
        ${shops.length === 0 && listings.length === 0
          ? html`<${Empty} title="No matches" sub="Try a player, team, or set name." />`
          : null}
        ${shops.length ? html`<h3 class="mb">Shops</h3><div class="shop-row mb">
          ${shops.map((s) => html`<${ShopCard} key=${s.id} shop=${s} onOpen=${() => nav("shop", { shopId: s.id })} />`)}
        </div>` : null}
        ${listings.length ? html`<h3 class="mb">Cards (${listings.length})</h3><div class="card-grid">
          ${listings.map((l) => html`<button key=${l.id} style=${{ background: "none", border: 0, padding: 0 }} onClick=${() => nav("shop", { shopId: l.shopId })}>
            <div class="tilt"><${TradingCard} listing=${l} compact=${true} /></div>
          </button>`)}
        </div>` : null}
      </div>`;
    }

    const shownShops = cat === "all" ? Data.shops : Data.shops.filter((s) => s.cat === cat);
    const cats = ["sports", "pokemon", "mtg", "multi"];

    return html`<div class="page">
      <div class="eyebrow">Verified shops near you</div>
      <h1 class="section-title">Dig the card show, from anywhere</h1>
      <p class="muted mb">Tap a pin to open a vetted shop, then flip through a value box like you are standing at the table.</p>

      ${upcomingDrops.length ? html`<div class="banner-rail mb">
        ${upcomingDrops.map((d) => {
          const shop = Data.shopById(d.shopId) || { name: "Your Booth", cat: "multi" };
          return html`<button key=${d.id} class="banner" onClick=${() => shop.id ? nav("shop", { shopId: shop.id }) : nav("feed")}>
            <span class="glyph" style=${{ background: Data.catColor[shop.cat] }}>${Data.catIcon[shop.cat]}</span>
            <span>
              <small>DROP \u00B7 ${fmtDateTime(d.date)}</small>
              <div style=${{ fontWeight: 600 }}>${d.title}</div>
              <div class="muted" style=${{ fontSize: "12px" }}>${shop.name}</div>
            </span>
          </button>`;
        })}
      </div>` : null}

      <div class="hero-map mb">
        <div class="map-wrap">
          <${CS.UsMap} />
          ${Data.shops.map((s) => {
            const hasDrop = state.drops.some((d) => d.shopId === s.id && d.scheduled);
            return html`<${Pin} key=${s.id} shop=${s} hasDrop=${hasDrop} onClick=${() => nav("shop", { shopId: s.id })} />`;
          })}
        </div>
        <div class="map-legend">
          ${cats.map((c) => html`<span key=${c}><span class="cat-dot" data-cat=${c}></span>${Data.catLabel[c]}</span>`)}
        </div>
      </div>

      <h3 class="mb">Browse by category</h3>
      <div class="tile-rail mb">
        <button class=${"tile" + (cat === "all" ? " on" : "")} onClick=${() => setCat("all")}>
          <div class="ic">\u{1F0CF}</div><h3>All shops</h3><div class="count">${Data.shops.length} verified</div>
        </button>
        ${cats.map((c) => html`<button key=${c} class="tile" style=${cat === c ? { borderColor: Data.catColor[c] } : null} onClick=${() => setCat(c)}>
          <div class="ic">${Data.catIcon[c]}</div>
          <h3>${Data.catLabel[c]}</h3>
          <div class="count">${Data.shops.filter((s) => s.cat === c).length} shops</div>
        </button>`)}
      </div>

      <div class="row between mb">
        <h3>${cat === "all" ? "All shops" : Data.catLabel[cat]}</h3>
        ${cat !== "all" ? html`<button class="btn sm ghost" onClick=${() => setCat("all")}>Clear</button>` : null}
      </div>
      <div class="shop-row">
        ${shownShops.map((s) => html`<${ShopCard} key=${s.id} shop=${s} onOpen=${() => nav("shop", { shopId: s.id })} />`)}
      </div>
    </div>`;
  }

  // ---- follower feed ----
  function Feed() {
    const { state, nav } = React.useContext(CS.Ctx);
    const followed = state.follows;
    const drops = [...state.drops]
      .filter((d) => followed.includes(d.shopId))
      .sort((a, b) => b.date - a.date);
    const shops = Data.shops.filter((s) => followed.includes(s.id));
    return html`<div class="page">
      <div class="eyebrow">From shops you follow</div>
      <h1 class="section-title">Your follower feed</h1>
      <div class="hairline"></div>
      ${followed.length === 0
        ? html`<${Empty} icon="\u2B50" title="You are not following any shops" sub="Open a shop and tap Follow to see its drops here." action=${html`<button class="btn gold mt" onClick=${() => nav("home")}>Browse the map</button>`} />`
        : html`
          <h3 class="mb">Upcoming drops</h3>
          ${drops.length === 0
            ? html`<p class="muted mb">No drops scheduled yet from the shops you follow.</p>`
            : html`<div class="list mb">${drops.map((d) => {
                const shop = Data.shopById(d.shopId);
                return html`<div key=${d.id} class="list-row">
                  <span class="glyph" style=${{ width: "44px", height: "44px", borderRadius: "11px", display: "grid", placeItems: "center", background: Data.catColor[shop.cat], flex: "0 0 auto" }}>${Data.catIcon[shop.cat]}</span>
                  <div class="grow">
                    <h4>${d.title}</h4>
                    <div class="muted" style=${{ fontSize: "13px" }}>${shop.name} \u00B7 ${fmtDateTime(d.date)}</div>
                    <div style=${{ fontSize: "13px", marginTop: "4px" }}>${d.teaser}</div>
                  </div>
                  <button class="btn sm gold" onClick=${() => nav("shop", { shopId: shop.id })}>View</button>
                </div>`;
              })}</div>`}
          <h3 class="mb">Shops you follow</h3>
          <div class="shop-row">
            ${shops.map((s) => html`<${ShopCard} key=${s.id} shop=${s} onOpen=${() => nav("shop", { shopId: s.id })} />`)}
          </div>`}
    </div>`;
  }

  CS.Screens.Home = Home;
  CS.Screens.Feed = Feed;
})();
