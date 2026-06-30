// screens-seller.js
// Seller booth: application gate, live dashboard, 4-step AI upload, listings
// manager, drop builder with email preview, and mock-Stripe subscription.
(function () {
  "use strict";
  window.CS = window.CS || {};
  CS.Screens = CS.Screens || {};
  const { useState } = React;
  const html = htm.bind(React.createElement);
  const Data = CS.Data;
  const MYID = Data.myShop.id;
  const { TradingCard, Modal, money, fmtDateTime, Success, Empty } = CS.UI;

  // ---- application gate ----
  function Application() {
    const { state, actions } = React.useContext(CS.Ctx);
    const [form, setForm] = useState({ name: "", shop: "", cat: "sports", specialty: "" });
    const set = (k) => (e) => setForm(Object.assign({}, form, { [k]: e.target.value }));

    if (state.sellerApp === "pending") {
      return html`<div class="page"><div class="panel pad center" style=${{ maxWidth: "520px", margin: "40px auto" }}>
        <div class="spinner" style=${{ margin: "0 auto 16px" }}></div>
        <h2 class="display">Application under review</h2>
        <p class="muted">Card Shopper manually verifies every seller. This keeps the marketplace curated and trusted, not an open free-for-all. We are reviewing your booth now.</p>
        <span class="pill status-pending mt">Pending verification</span>
        <p class="muted mt" style=${{ fontSize: "13px" }}>This prototype approves in a few seconds so you can explore the booth.</p>
      </div></div>`;
    }

    return html`<div class="page"><div class="panel pad" style=${{ maxWidth: "560px", margin: "20px auto" }}>
      <div class="eyebrow">Become a verified seller</div>
      <h2 class="display mb">Apply to open a booth</h2>
      <p class="muted mb">Sellers are manually verified before listing. Tell us about your shop and we will review it.</p>
      <div class="field"><label>Your name</label><input class="input" value=${form.name} onInput=${set("name")} placeholder="Alex Carter" /></div>
      <div class="field"><label>Shop name</label><input class="input" value=${form.shop} onInput=${set("shop")} placeholder="Your Booth" /></div>
      <div class="field"><label>Primary category</label>
        <select class="select" value=${form.cat} onChange=${set("cat")}>
          <option value="sports">Sports</option><option value="pokemon">Pokemon</option>
          <option value="mtg">Magic: The Gathering</option><option value="multi">Multi-category</option>
        </select></div>
      <div class="field"><label>What do you specialize in?</label><textarea class="input area" value=${form.specialty} onInput=${set("specialty")} placeholder="Vintage holos, graded rookies, sealed product..."></textarea></div>
      <button class="btn gold block" onClick=${() => actions.applySeller(form)}>Submit application for review</button>
    </div></div>`;
  }

  // ---- dashboard ----
  function Dashboard({ stats, go }) {
    const { state } = React.useContext(CS.Ctx);
    const subActive = state.subscription.status === "active";
    return html`<div>
      ${!subActive ? html`<div class="banner mb" style=${{ width: "100%", cursor: "pointer" }} onClick=${() => go("subscription")}>
        <span class="glyph" style=${{ background: "var(--gold)", color: "var(--navy)" }}>\u26A1</span>
        <span><small>ACTION NEEDED</small><div style=${{ fontWeight: 600 }}>Activate your subscription to publish listings and drops</div><div class="muted" style=${{ fontSize: "12px" }}>Flat monthly fee, zero per-sale fees.</div></span>
      </div>` : null}
      <div class="stat-grid mb">
        <div class="stat"><div class="label">Active listings</div><div class="stat-num num">${stats.active}</div><div class="delta">live in your booth</div></div>
        <div class="stat"><div class="label">Monthly sales</div><div class="stat-num num">${money(stats.sales)}</div><div class="delta">${stats.orders} order${stats.orders === 1 ? "" : "s"}</div></div>
        <div class="stat"><div class="label">Open offers</div><div class="stat-num num">${stats.openOffers}</div><div class="delta">awaiting your reply</div></div>
        <div class="stat"><div class="label">Followers</div><div class="stat-num num">${stats.followers.toLocaleString()}</div><div class="delta">+${stats.followerGain} from drops</div></div>
      </div>
      <div class="grid-2">
        <div class="panel pad">
          <h3 class="mb">Zero per-sale fees</h3>
          <p class="muted">You keep 100 percent of every sale. Card Shopper bills one flat monthly subscription, never a cut of your cards. That is the headline reason founding sellers switch.</p>
          <div class="row gap-s mt"><button class="btn gold" onClick=${() => go("upload")}>Upload a card</button><button class="btn" onClick=${() => go("drops")}>Build a drop</button></div>
        </div>
        <div class="panel pad">
          <h3 class="mb">Plan</h3>
          ${state.subscription.status === "active"
            ? html`<div><div class="row between"><span>Current plan</span><b>${state.subscription.plan}</b></div>
                <div class="row between"><span class="muted">Status</span><span class="pill status-active">active</span></div>
                <div class="row between"><span class="muted">Renews</span><span class="num">${fmtDateTime(state.subscription.renewsOn)}</span></div>
                <div class="row between"><span class="muted">Per-sale fees</span><b style=${{ color: "var(--buy)" }}>$0</b></div></div>`
            : html`<p class="muted">No active plan. Subscribe to unlock listing, drops, and your booth on the map.</p><button class="btn gold mt" onClick=${() => go("subscription")}>See plans</button>`}
        </div>
      </div>
    </div>`;
  }

  // ---- 4-step AI upload ----
  function UploadFlow({ blocked, go }) {
    const { state, actions } = React.useContext(CS.Ctx);
    const [step, setStep] = useState(1);
    const [detected, setDetected] = useState(null);
    const [price, setPrice] = useState(0);
    const [accepted, setAccepted] = useState(true);
    const [dest, setDest] = useState("standalone");
    const [done, setDone] = useState(false);

    if (blocked) return html`<${Empty} icon="\u{1F512}" title="Subscription required" sub="Activate a plan to upload and list cards." action=${html`<button class="btn gold mt" onClick=${() => go("subscription")}>See plans</button>`} />`;

    function reset() { setStep(1); setDetected(null); setDone(false); setDest("standalone"); }
    function takePhoto() {
      setStep(2);
      const fx = Data.detectFixtures[state.userListings.length % Data.detectFixtures.length];
      setTimeout(() => {
        setDetected(Object.assign({}, fx));
        setPrice(fx.estValue);
        setAccepted(true);
        setStep(3);
      }, 1800);
    }
    function field(k, label) {
      return html`<div class="field"><label>${label}</label><input class="input" value=${detected[k]} onInput=${(e) => setDetected(Object.assign({}, detected, { [k]: e.target.value }))} /></div>`;
    }
    function publish() {
      actions.publishListing({
        cat: detected.category, player: detected.player, team: null, set: detected.set,
        year: detected.year, grade: detected.grade, price: Number(price), foil: detected.category !== "sports",
        vb: dest === "box" ? "vb-mybooth-showcase" : null,
      });
      setDone(true); setStep(4);
    }

    const steps = ["Photo", "AI detect", "Review and price", "Publish"];
    return html`<div>
      <div class="stepper">
        ${steps.map((s, i) => html`<div key=${s} class=${"step" + (step === i + 1 ? " on" : step > i + 1 ? " done" : "")}><span class="num">${step > i + 1 ? "\u2713" : i + 1}</span>${s}</div>`)}
      </div>

      ${step === 1 ? html`<div class="panel pad">
        <div class="dropzone" tabindex="0" role="button" onClick=${takePhoto} onKeyDown=${(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); takePhoto(); } }}>
          <div style=${{ fontSize: "40px" }}>\u{1F4F7}</div>
          <h3 class="mt-s">Take or upload a photo of your card</h3>
          <p class="muted">Our scanner reads the card and fills in the details for you.</p>
          <button class="btn gold mt">Capture card</button>
        </div>
      </div>` : null}

      ${step === 2 ? html`<div class="panel pad detecting">
        <div class="scanbox"><div class="cardback" style=${{ position: "absolute", inset: 0 }}></div><div class="scanline"></div></div>
        <div class="row gap-s"><div class="spinner"></div><b>AI detecting card...</b></div>
        <p class="muted">Matching against the CollX-style recognition model for player, set, year, and grade.</p>
      </div>` : null}

      ${step === 3 && detected ? html`<div class="grid-2">
        <div class="panel pad">
          <h3 class="mb">Detected details <span class="pill">editable</span></h3>
          ${field("player", "Player or card")}
          ${field("set", "Set")}
          <div class="grid-2">${field("year", "Year")}${field("cardNumber", "Card number")}</div>
          <div class="grid-2">
            <div class="field"><label>Category</label>
              <select class="select" value=${detected.category} onChange=${(e) => setDetected(Object.assign({}, detected, { category: e.target.value }))}>
                <option value="sports">Sports</option><option value="pokemon">Pokemon</option><option value="mtg">Magic: The Gathering</option>
              </select></div>
            ${field("grade", "Grade")}
          </div>
        </div>
        <div class="panel pad">
          <h3 class="mb">Market price</h3>
          <div class="market-suggest mb">
            <span>Suggested market value<br/><b class="num" style=${{ fontSize: "22px", fontFamily: "Fraunces" }}>${money(detected.estValue)}</b></span>
            <div class="row gap-s">
              <button class=${"btn sm" + (accepted ? " gold" : "")} onClick=${() => { setAccepted(true); setPrice(detected.estValue); }}>Accept</button>
              <button class=${"btn sm" + (!accepted ? " gold" : "")} onClick=${() => setAccepted(false)}>Override</button>
            </div>
          </div>
          <div class="field"><label>Your asking price</label>
            <input class="input num" type="number" value=${price} disabled=${accepted} onInput=${(e) => setPrice(Number(e.target.value))} /></div>
          <div class="field"><label>Where to publish</label>
            <div class="row gap-s">
              <button class=${"chip" + (dest === "standalone" ? " on" : "")} onClick=${() => setDest("standalone")}>Standalone listing</button>
              <button class=${"chip" + (dest === "box" ? " on" : "")} onClick=${() => setDest("box")}>Into my value box</button>
            </div>
          </div>
          <button class="btn gold block mt" onClick=${publish}>Publish listing</button>
        </div>
      </div>` : null}

      ${step === 4 && done ? html`<div class="panel pad">
        <${Success} title="Listing published" sub=${dest === "box" ? "Added to your value box. Buyers will flip past it in the bin." : "Live as a standalone listing in your booth."}>
          <div class="row gap-s center mt" style=${{ justifyContent: "center" }}>
            <button class="btn gold" onClick=${reset}>Upload another</button>
            <button class="btn" onClick=${() => go("listings")}>View my listings</button>
          </div>
        </${Success}>
      </div>` : null}
    </div>`;
  }

  // ---- listings manager ----
  function ListingsManager({ blocked, go }) {
    const { state, actions, nav } = React.useContext(CS.Ctx);
    const [editId, setEditId] = useState(null);
    const [val, setVal] = useState(0);
    const mine = state.userListings;
    if (blocked) return html`<${Empty} icon="\u{1F512}" title="Subscription required" sub="Activate a plan to manage listings." action=${html`<button class="btn gold mt" onClick=${() => go("subscription")}>See plans</button>`} />`;
    if (!mine.length) return html`<${Empty} icon="\u{1F4E6}" title="No listings yet" sub="Use the AI upload to add your first card." action=${html`<button class="btn gold mt" onClick=${() => go("upload")}>Upload a card</button>`} />`;
    return html`<div>
      <div class="row between mb"><h3>${mine.length} active listing${mine.length === 1 ? "" : "s"}</h3>
        <button class="btn sm" onClick=${() => nav("shop", { shopId: MYID })}>Preview my booth</button></div>
      <div class="list">${mine.map((l) => html`<div key=${l.id} class="list-row">
        <div class="thumb"><${TradingCard} listing=${l} compact=${true} /></div>
        <div class="grow"><h4>${l.player}</h4><div class="muted" style=${{ fontSize: "13px" }}>${l.set} \u00B7 ${l.year} \u00B7 ${l.grade}${l.vb ? " \u00B7 in value box" : ""}</div>
          ${editId === l.id
            ? html`<div class="row gap-s mt-s"><input class="input num" style=${{ maxWidth: "120px" }} type="number" value=${val} onInput=${(e) => setVal(Number(e.target.value))} />
                <button class="btn sm gold" onClick=${() => { actions.editListing(l.id, { price: val }); setEditId(null); }}>Save</button>
                <button class="btn sm ghost" onClick=${() => setEditId(null)}>Cancel</button></div>`
            : html`<div class="price num mt-s" style=${{ fontFamily: "Fraunces", fontSize: "17px" }}>${money(l.price)}</div>`}
        </div>
        ${editId === l.id ? null : html`<div class="row wrap gap-s">
          <button class="btn sm" onClick=${() => { setEditId(l.id); setVal(l.price); }}>Edit price</button>
          <button class="btn sm ghost danger" onClick=${() => actions.delistListing(l.id)}>Delist</button>
        </div>`}
      </div>`)}</div>
    </div>`;
  }

  // ---- drop builder + email preview ----
  function DropBuilder({ blocked, go }) {
    const { state, actions } = React.useContext(CS.Ctx);
    const [title, setTitle] = useState("Weekend Value Box Drop");
    const [when, setWhen] = useState("");
    const [teaser, setTeaser] = useState("Fresh cards hitting the booth. Follow to get first dibs.");
    const [sent, setSent] = useState(false);
    const followers = Data.myShop.followers + state.drops.filter((d) => d.shopId === MYID).length * 37;
    if (blocked) return html`<${Empty} icon="\u{1F512}" title="Subscription required" sub="Activate a plan to schedule drops." action=${html`<button class="btn gold mt" onClick=${() => go("subscription")}>See plans</button>`} />`;
    const featured = state.userListings.slice(0, 3);
    const dropDate = when ? new Date(when).getTime() : Date.now() + 2 * 86400000;

    function publish() {
      actions.publishDrop({ title, teaser, date: dropDate, featured: featured.map((f) => f.id), followers });
      setSent(true);
    }

    return html`<div class="grid-2">
      <div class="panel pad">
        <h3 class="mb">Drop builder</h3>
        <div class="field"><label>Title</label><input class="input" value=${title} onInput=${(e) => setTitle(e.target.value)} /></div>
        <div class="field"><label>Date and time</label><input class="input" type="datetime-local" value=${when} onInput=${(e) => setWhen(e.target.value)} /></div>
        <div class="field"><label>Teaser</label><textarea class="input area" value=${teaser} onInput=${(e) => setTeaser(e.target.value)}></textarea></div>
        <p class="muted" style=${{ fontSize: "13px" }}>On publish, this fans out to your ${followers.toLocaleString()} followers via in-app notification and a Klaviyo-style email. No real email is sent in this prototype.</p>
        <button class="btn gold block mt" onClick=${publish}>Publish drop</button>
        ${sent ? html`<div class="mt center"><span class="pill status-active">Scheduled and sent to ${followers.toLocaleString()} followers</span>
          <div class="row gap-s mt-s" style=${{ justifyContent: "center" }}><button class="btn sm" onClick=${() => go("dashboard")}>Back to dashboard</button></div></div>` : null}
      </div>
      <div>
        <div class="eyebrow mb">Live email preview</div>
        <div class="email-preview">
          <div class="head"><div style=${{ fontSize: "12px", opacity: 0.7 }}>Card Shopper \u00B7 Your Booth</div><div style=${{ fontFamily: "Fraunces", fontSize: "20px", marginTop: "4px" }}>${title || "Untitled drop"}</div></div>
          <div class="body">
            <div style=${{ fontSize: "13px", color: "#6b6b63" }}>${fmtDateTime(dropDate)}</div>
            <p>${teaser}</p>
            ${featured.length ? html`<div class="cards">${featured.map((f) => html`<div key=${f.id}><${TradingCard} listing=${f} compact=${true} /></div>`)}</div>` : html`<p class="muted" style=${{ fontSize: "13px" }}>Upload cards to feature them in the email.</p>`}
            <div style=${{ textAlign: "center", marginTop: "10px" }}><span style=${{ background: "#0E3B2E", color: "#F5F0E6", padding: "10px 18px", borderRadius: "8px", fontWeight: 600, display: "inline-block" }}>Browse the drop</span></div>
          </div>
        </div>
      </div>
    </div>`;
  }

  // ---- subscription with mock Stripe checkout ----
  function Subscription() {
    const { state, actions } = React.useContext(CS.Ctx);
    const [checkout, setCheckout] = useState(null); // plan being purchased
    const sub = state.subscription;
    const active = sub.status === "active";

    return html`<div>
      ${active ? html`<div class="panel pad mb">
        <div class="row between wrap gap-s">
          <div><div class="eyebrow">Current subscription</div><h3>${sub.plan} \u00B7 <span class="pill status-active">active</span></h3>
            <div class="muted" style=${{ fontSize: "13px" }}>Renews ${fmtDateTime(sub.renewsOn)} \u00B7 zero per-sale fees</div></div>
          <button class="btn danger" onClick=${actions.cancelSub}>Cancel plan</button>
        </div>
      </div>` : null}

      <div class="grid-2">
        ${Data.plans.map((p) => html`<div key=${p.id} class="panel pad">
          <div class="row between"><h3>${p.name}</h3>${active && sub.plan === p.name ? html`<span class="pill status-active">current</span>` : null}</div>
          <div class="num" style=${{ fontFamily: "Fraunces", fontSize: "34px", marginTop: "6px" }}>${money(p.price)}<span class="muted" style=${{ fontSize: "14px", fontFamily: "Inter Tight" }}>/month</span></div>
          <p class="muted">${p.blurb}</p>
          <ul style=${{ listStyle: "none", padding: 0, margin: "12px 0", display: "grid", gap: "8px" }}>
            ${p.perks.map((perk) => html`<li key=${perk} style=${{ display: "flex", gap: "8px" }}><span style=${{ color: "var(--buy)" }}>\u2713</span>${perk}</li>`)}
          </ul>
          <button class="btn gold block" disabled=${active && sub.plan === p.name} onClick=${() => setCheckout(p)}>${active && sub.plan === p.name ? "Active plan" : "Subscribe"}</button>
        </div>`)}
      </div>

      <p class="muted center mt" style=${{ fontSize: "13px" }}>Recurring monthly billing modeled on Stripe subscriptions. Zero fees on individual sales. This prototype simulates checkout, no real charge is made.</p>

      ${checkout ? html`<${Modal} title=${"Subscribe to " + checkout.name} onClose=${() => setCheckout(null)}>
        <div class="market-suggest mb"><span>${checkout.name} plan</span><b class="num" style=${{ fontFamily: "Fraunces", fontSize: "20px" }}>${money(checkout.price)}/mo</b></div>
        <div class="field"><label>Card number</label><input class="input num" value="4242 4242 4242 4242" readOnly /></div>
        <div class="grid-2"><div class="field"><label>Expiry</label><input class="input" value="12 / 28" readOnly /></div><div class="field"><label>CVC</label><input class="input num" value="123" readOnly /></div></div>
        <p class="muted" style=${{ fontSize: "13px" }}>Test card prefilled. No real charge in this prototype.</p>
        <button class="btn gold block mt" onClick=${() => { actions.subscribe(checkout); setCheckout(null); }}>Pay ${money(checkout.price)} and activate</button>
      </${Modal}>` : null}
    </div>`;
  }

  // ---- booth shell (tabs + gating) ----
  function Booth() {
    const { state } = React.useContext(CS.Ctx);
    const [tab, setTab] = useState("dashboard");
    if (state.sellerApp !== "approved") return html`<${Application} />`;

    const subActive = state.subscription.status === "active";
    const mine = state.userListings;
    const sales = state.orders.reduce((s, o) => s + o.price, 0);
    const followerGain = state.drops.filter((d) => d.shopId === MYID).length * 37;
    const stats = {
      active: mine.length,
      sales,
      orders: state.orders.length,
      openOffers: state.offers.filter((o) => o.status === "pending").length,
      followers: Data.myShop.followers + followerGain,
      followerGain,
    };
    const tabs = [["dashboard", "Dashboard"], ["upload", "AI upload"], ["listings", "Listings"], ["drops", "Drops"], ["subscription", "Subscription"]];

    return html`<div class="page">
      <div class="row between wrap gap-s">
        <div><div class="eyebrow">Seller booth</div><h1 class="section-title">${Data.myShop.name}</h1></div>
        <span class="verified">\u2713 Verified seller</span>
      </div>
      <div class="tabs">
        ${tabs.map(([id, label]) => html`<button key=${id} class=${tab === id ? "on" : ""} onClick=${() => setTab(id)}>${label}</button>`)}
      </div>
      ${tab === "dashboard" ? html`<${Dashboard} stats=${stats} go=${setTab} />` : null}
      ${tab === "upload" ? html`<${UploadFlow} blocked=${!subActive} go=${setTab} />` : null}
      ${tab === "listings" ? html`<${ListingsManager} blocked=${!subActive} go=${setTab} />` : null}
      ${tab === "drops" ? html`<${DropBuilder} blocked=${!subActive} go=${setTab} />` : null}
      ${tab === "subscription" ? html`<${Subscription} />` : null}
    </div>`;
  }

  CS.Screens.Booth = Booth;
})();
