// app.js
// App shell: state + persistence, action layer (with simulated async responses),
// router, top bar, mobile bottom nav, toasts, action modal, and the guided tour.
(function () {
  "use strict";
  const { useState, useEffect, useMemo, useCallback } = React;
  const html = htm.bind(React.createElement);
  const Data = CS.Data;
  const MYID = Data.myShop.id;
  const S = CS.Screens;

  CS.Ctx = React.createContext(null);

  const uid = (p) => p + Math.random().toString(36).slice(2, 9);
  const notif = (type, title, body) => ({ id: uid("n-"), type, title, body, read: false, ts: Date.now() });

  const SELLER_REPLIES = [
    "Thanks for reaching out. The card is in hand and ships same day.",
    "Happy to bundle if you are eyeing a few. Centering is strong on this one.",
    "Good eye, that one is a personal favorite. Let me know if you have questions.",
    "It is a clean copy, no surface issues. I can send extra photos if you like.",
  ];

  function App() {
    const [state, setState] = useState(() => Object.assign({ search: "" }, CS.Store.load()));
    const [route, setRoute] = useState({ name: "home", params: {} });
    const [modal, setModal] = useState(null);
    const [toasts, setToasts] = useState([]);
    const [menuOpen, setMenuOpen] = useState(false);
    const [tourOpen, setTourOpen] = useState(!state.tourDone);

    useEffect(() => { CS.Store.save(state); }, [state]);
    useEffect(() => { window.scrollTo(0, 0); }, [route]);

    const toast = useCallback((msg) => {
      const id = uid("t-");
      setToasts((t) => [...t, { id, msg }]);
      setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2600);
    }, []);

    const nav = useCallback((name, params) => { setRoute({ name, params: params || {} }); setMenuOpen(false); }, []);
    const openModal = useCallback((m) => setModal(m), []);
    const closeModal = useCallback(() => setModal(null), []);

    const allListings = useMemo(() => Data.listings.concat(state.userListings), [state.userListings]);

    const actions = useMemo(() => ({
      setRole(role) {
        setState((s) => Object.assign({}, s, { role }));
        if (role === "seller") nav("booth"); else nav("home");
        toast(role === "seller" ? "Switched to seller" : "Switched to buyer");
      },
      setSearch(v) { setState((s) => Object.assign({}, s, { search: v })); },
      toggleWatch(id) {
        setState((s) => {
          const on = s.watchlist.includes(id);
          return Object.assign({}, s, { watchlist: on ? s.watchlist.filter((x) => x !== id) : [...s.watchlist, id] });
        });
        toast("Watchlist updated");
      },
      toggleFollow(shopId) {
        setState((s) => {
          const on = s.follows.includes(shopId);
          const follows = on ? s.follows.filter((x) => x !== shopId) : [...s.follows, shopId];
          const shop = Data.shopById(shopId);
          const ns = Object.assign({}, s, { follows });
          if (!on) ns.notifications = [notif("system", "Following " + shop.name, "Their drops will show in your feed."), ...s.notifications];
          return ns;
        });
        toast("Follow updated");
      },
      makeOffer(listing, amount) {
        const id = uid("o-");
        setState((s) => Object.assign({}, s, {
          offers: [{ id, listingId: listing.id, amount, status: "pending", createdAt: Date.now(), shopId: listing.shopId }, ...s.offers],
          notifications: [notif("offer", "Offer sent", `You offered ${CS.UI.money(amount)} on ${listing.player}.`), ...s.notifications],
        }));
        toast("Offer sent");
        setTimeout(() => {
          const accepted = amount >= listing.price * 0.85;
          setState((s) => Object.assign({}, s, {
            offers: s.offers.map((o) => o.id === id ? Object.assign({}, o, { status: accepted ? "accepted" : "declined" }) : o),
            notifications: [notif("offer", accepted ? "Offer accepted" : "Offer declined",
              accepted ? `The seller accepted ${CS.UI.money(amount)} for ${listing.player}. Buy now to lock it in.` : `The seller declined ${CS.UI.money(amount)} on ${listing.player}. Try a higher offer.`), ...s.notifications],
          }));
          toast(accepted ? "Offer accepted" : "Offer declined");
        }, 5200);
      },
      sendMessage(listing, body) {
        setState((s) => {
          const thread = s.threads[listing.id] || [];
          return Object.assign({}, s, { threads: Object.assign({}, s.threads, { [listing.id]: [...thread, { from: "buyer", body, ts: Date.now() }] }) });
        });
        setTimeout(() => {
          const reply = SELLER_REPLIES[Math.floor(Math.random() * SELLER_REPLIES.length)];
          setState((s) => {
            const thread = s.threads[listing.id] || [];
            const shop = Data.shopById(listing.shopId) || { name: "Seller" };
            return Object.assign({}, s, {
              threads: Object.assign({}, s.threads, { [listing.id]: [...thread, { from: "seller", body: reply, ts: Date.now() }] }),
              notifications: [notif("message", "Reply from " + shop.name, reply), ...s.notifications],
            });
          });
        }, 2200);
      },
      buyNow(listing) {
        const id = "ORD-" + Math.floor(100000 + Math.random() * 899999);
        setState((s) => Object.assign({}, s, {
          orders: [{ id, listingId: listing.id, price: listing.price, status: "confirmed", createdAt: Date.now(), shopId: listing.shopId, snapshot: listing }, ...s.orders],
          watchlist: s.watchlist.filter((x) => x !== listing.id),
          notifications: [notif("order", "Order confirmed", `${listing.player} for ${CS.UI.money(listing.price)}. Order ${id}.`), ...s.notifications],
        }));
        toast("Purchase confirmed");
        return id;
      },
      applySeller(form) {
        if (form && form.shop) Data.myShop.name = form.shop;
        if (form && form.cat) Data.myShop.cat = form.cat;
        if (form && form.specialty) Data.myShop.specialty = form.specialty;
        setState((s) => Object.assign({}, s, { sellerApp: "pending" }));
        toast("Application submitted");
        setTimeout(() => {
          setState((s) => Object.assign({}, s, {
            sellerApp: "approved",
            notifications: [notif("seller", "You are verified", "Your booth is approved. Subscribe to start listing."), ...s.notifications],
          }));
          toast("Application approved");
        }, 3200);
      },
      subscribe(plan) {
        setState((s) => Object.assign({}, s, {
          subscription: { plan: plan.name, status: "active", renewsOn: Date.now() + 30 * 86400000, price: plan.price },
          notifications: [notif("system", "Subscription active", `${plan.name} plan is live. Zero per-sale fees.`), ...s.notifications],
        }));
        toast("Subscription active");
      },
      cancelSub() {
        setState((s) => Object.assign({}, s, { subscription: Object.assign({}, s.subscription, { status: "canceled" }) }));
        toast("Subscription canceled");
      },
      publishListing(obj) {
        const id = uid("u-");
        setState((s) => Object.assign({}, s, {
          userListings: [Object.assign({ id, shopId: MYID, team: null, seed: "cs-" + id }, obj), ...s.userListings],
        }));
        toast("Listing published");
      },
      editListing(id, patch) {
        setState((s) => Object.assign({}, s, { userListings: s.userListings.map((l) => l.id === id ? Object.assign({}, l, patch) : l) }));
        toast("Listing updated");
      },
      delistListing(id) {
        setState((s) => Object.assign({}, s, { userListings: s.userListings.filter((l) => l.id !== id) }));
        toast("Listing delisted");
      },
      publishDrop(obj) {
        const id = uid("d-");
        setState((s) => Object.assign({}, s, {
          drops: [Object.assign({ id, shopId: MYID, scheduled: true }, obj), ...s.drops],
          notifications: [notif("drop", "Drop scheduled", `${obj.title} sent to ${(obj.followers || 0).toLocaleString()} followers.`), ...s.notifications],
        }));
        toast("Drop published");
      },
      markNotifRead(id) { setState((s) => Object.assign({}, s, { notifications: s.notifications.map((n) => n.id === id ? Object.assign({}, n, { read: true }) : n) })); },
      markAllRead() { setState((s) => Object.assign({}, s, { notifications: s.notifications.map((n) => Object.assign({}, n, { read: true })) })); },
      finishTour() { setState((s) => Object.assign({}, s, { tourDone: true })); setTourOpen(false); },
      resetDemo() { setState(Object.assign({ search: "" }, CS.Store.reset())); nav("home"); setTourOpen(false); toast("Demo reset"); },
    }), [nav, toast]);

    const unread = state.notifications.filter((n) => !n.read).length;
    const ctx = { state, actions, nav, allListings, modal, openModal, closeModal };

    // route table
    function renderRoute() {
      switch (route.name) {
        case "shop": return html`<${S.Shop} params=${route.params} />`;
        case "feed": return html`<${S.Feed} />`;
        case "watchlist": return html`<${S.Watchlist} />`;
        case "offers": return html`<${S.Offers} />`;
        case "messages": return html`<${S.Messages} />`;
        case "orders": return html`<${S.Orders} />`;
        case "notifications": return html`<${S.Notifications} />`;
        case "booth": return html`<${S.Booth} />`;
        default: return html`<${S.Home} />`;
      }
    }

    const navItems = state.role === "seller"
      ? [["booth", "\u{1F3EA}", "Booth"], ["home", "\u{1F5FA}", "Map"], ["notifications", "\u{1F514}", "Alerts"]]
      : [["home", "\u{1F5FA}", "Map"], ["watchlist", "\u2606", "Watchlist"], ["offers", "\u{1F4B0}", "Offers"], ["notifications", "\u{1F514}", "Alerts"]];

    return html`<${CS.Ctx.Provider} value=${ctx}>
      <div class="app">
        <header class="topbar">
          <div class="brand" onClick=${() => nav("home")} role="button" tabindex="0" onKeyDown=${(e) => { if (e.key === "Enter") nav("home"); }}>
            <span class="mark">\u{1F0CF}</span>
            <span class="word">Card Shopper<small>Curated card show</small></span>
          </div>
          <div class="search">
            <span class="ic">\u{1F50D}</span>
            <input value=${state.search} placeholder="Search players, teams, sets, shops"
              onFocus=${() => { if (route.name !== "home") nav("home"); }}
              onInput=${(e) => { actions.setSearch(e.target.value); if (route.name !== "home") nav("home"); }} aria-label="Global search" />
          </div>
          <div class="spacer"></div>
          <div class="roletoggle" role="group" aria-label="Role">
            <button class=${state.role === "buyer" ? "on" : ""} onClick=${() => actions.setRole("buyer")}>Buyer</button>
            <button class=${state.role === "seller" ? "on" : ""} onClick=${() => actions.setRole("seller")}>Seller</button>
          </div>
          <button class="iconbtn" onClick=${() => nav("watchlist")} aria-label="Watchlist">\u2606${state.watchlist.length ? html`<span class="badge-count">${state.watchlist.length}</span>` : null}</button>
          <button class="iconbtn" onClick=${() => nav("notifications")} aria-label=${"Notifications, " + unread + " unread"}>\u{1F514}${unread ? html`<span class="badge-count danger">${unread}</span>` : null}</button>
          <div style=${{ position: "relative" }}>
            <button class="iconbtn" onClick=${() => setMenuOpen((o) => !o)} aria-label="Menu" aria-expanded=${menuOpen}>\u22EF</button>
            ${menuOpen ? html`<div class="menu panel">
              <button onClick=${() => { setTourOpen(true); setMenuOpen(false); }}>\u{1F9ED} Take the tour</button>
              <button onClick=${() => { nav("orders"); }}>\u{1F6CD} My orders</button>
              <button onClick=${() => { nav("messages"); }}>\u{1F4AC} Messages</button>
              <button onClick=${() => { nav("feed"); }}>\u2B50 Follower feed</button>
              <button onClick=${() => { actions.resetDemo(); }}>\u267B Reset demo</button>
            </div>` : null}
          </div>
        </header>

        <main onClick=${() => menuOpen && setMenuOpen(false)}>${renderRoute()}</main>

        <nav class="bottomnav">
          ${navItems.map(([name, gl, label]) => html`<button key=${name} class=${route.name === name ? "on" : ""} onClick=${() => nav(name)}>
            <span class="gl">${gl}</span>${label}
            ${name === "notifications" && unread ? html`<span class="badge-count danger">${unread}</span>` : null}
            ${name === "watchlist" && state.watchlist.length ? html`<span class="badge-count">${state.watchlist.length}</span>` : null}
          </button>`)}
        </nav>

        ${modal ? html`<${S.ActionModal} />` : null}

        ${toasts.length ? html`<div class="toast-wrap">${toasts.map((t) => html`<div key=${t.id} class="toast">${t.msg}</div>`)}</div>` : null}

        ${tourOpen ? html`<${Tour} onClose=${actions.finishTour} nav=${nav} />` : null}
      </div>
    </${CS.Ctx.Provider}>`;
  }

  // ---- guided tour ----
  function Tour({ onClose, nav }) {
    const [i, setI] = useState(0);
    const steps = [
      { ic: "\u{1F5FA}", title: "Browse the card show on a map", body: "Verified shops appear as color-coded pins by category. Tap any pin to open the booth.", go: () => nav("home") },
      { ic: "\u{1F0CF}", title: "Dig through a value box", body: "Inside a shop, flip face-down cards one at a time, just like digging a bin at a real show. Try PrizmHouse Breaks.", go: () => nav("shop", { shopId: "s-prizm" }) },
      { ic: "\u{1F4B0}", title: "Watch, offer, buy, or message", body: "Every card lets you save it, make an offer with a real accept or decline, message the seller, or buy instantly." },
      { ic: "\u{1F3EA}", title: "Run a zero-fee seller booth", body: "Switch to Seller to apply, get verified, upload cards with AI detection, build drops, and subscribe with zero per-sale fees." },
    ];
    const step = steps[i];
    function go() {
      if (step.go) step.go();
      if (i < steps.length - 1) setI(i + 1); else onClose();
    }
    return html`<div class="tour-scrim">
      <div class="panel pad tour-card">
        <div style=${{ fontSize: "44px" }}>${step.ic}</div>
        <h2 class="display mt-s">${step.title}</h2>
        <p class="muted">${step.body}</p>
        <div class="tour-dots">${steps.map((_, k) => html`<i key=${k} class=${k === i ? "on" : ""}></i>`)}</div>
        <div class="row between">
          <button class="btn ghost sm" onClick=${onClose}>Skip tour</button>
          <button class="btn gold" onClick=${go}>${i < steps.length - 1 ? "Next" : "Start exploring"}</button>
        </div>
      </div>
    </div>`;
  }

  const root = ReactDOM.createRoot(document.getElementById("root"));
  root.render(html`<${App} />`);
})();
