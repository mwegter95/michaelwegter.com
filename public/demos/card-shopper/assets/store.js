// store.js
// localStorage persistence for Card Shopper. Hydrates on load, persists a
// defined slice on every change, seeds fixtures on first run, and supports a
// full "Reset demo". Exposed on window.CS.Store.
(function () {
  "use strict";
  window.CS = window.CS || {};
  const KEY = "cardshopper:v1";

  // the durable slice (everything that should survive a reload)
  const SLICE = [
    "role", "sellerApp", "subscription", "watchlist", "follows", "offers",
    "threads", "orders", "userListings", "drops", "notifications", "tourDone",
  ];

  function seedState() {
    const now = Date.now();
    return {
      role: "buyer",
      sellerApp: "none", // none | pending | approved
      subscription: { plan: null, status: "inactive", renewsOn: null },
      watchlist: [],
      follows: ["s-prizm"], // pre-follow one shop so the feed and banner are populated
      offers: [],
      threads: {}, // { listingId: [{from, body, ts}] }
      orders: [],
      userListings: [], // seller-uploaded listings appended to the live catalog
      drops: CS.Data.seedDrops.map((d) => Object.assign({}, d, { scheduled: true })),
      notifications: [
        { id: "n-seed-1", type: "drop", title: "PrizmHouse Breaks scheduled a drop", body: "Rookie Heaters Bin Refill goes live tomorrow.", read: false, ts: now - 3600000 },
        { id: "n-seed-2", type: "system", title: "Welcome to Card Shopper", body: "Tap a pin on the map to open a verified shop.", read: false, ts: now - 7200000 },
      ],
      tourDone: false,
    };
  }

  function load() {
    let saved = null;
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) saved = JSON.parse(raw);
    } catch (e) { saved = null; }
    const base = seedState();
    if (!saved) return base;
    // shallow-merge saved slice over a fresh seed so new fields always exist
    const merged = Object.assign({}, base);
    SLICE.forEach((k) => { if (saved[k] !== undefined) merged[k] = saved[k]; });
    return merged;
  }

  function save(state) {
    try {
      const slice = {};
      SLICE.forEach((k) => { slice[k] = state[k]; });
      localStorage.setItem(KEY, JSON.stringify(slice));
    } catch (e) { /* storage unavailable, run in-memory */ }
  }

  function reset() {
    try { localStorage.removeItem(KEY); } catch (e) {}
    return seedState();
  }

  CS.Store = { KEY, seedState, load, save, reset };
})();
