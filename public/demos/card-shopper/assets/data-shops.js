// data-shops.js
// Fictional, trademark-safe shops mapped to US map pins, plus seed drops.
// Exposed on window.CS.Data.
(function () {
  "use strict";
  window.CS = window.CS || {};
  const Data = (CS.Data = CS.Data || {});

  // category color lookup (mirrors styles.css)
  Data.catColor = {
    sports: "#1E66FF",
    pokemon: "#FFCB05",
    mtg: "#7B3FA0",
    multi: "#2DB67D",
  };
  Data.catLabel = {
    sports: "Sports",
    pokemon: "Pokemon",
    mtg: "Magic: The Gathering",
    multi: "Multi-category",
  };
  Data.catIcon = { sports: "\u26BE", pokemon: "\u26A1", mtg: "\u2728", multi: "\u{1F0CF}" };

  // pin left/top are percentages on the 959x593 US viewBox (see research coord table)
  Data.shops = [
    { id: "s-route1", name: "Route 1 Pokemon", city: "Seattle, WA", cat: "pokemon", left: 11, top: 14, specialty: "Vintage WOTC holos and modern alt arts", followers: 1840, verified: true },
    { id: "s-foilroom", name: "The Foil Room", city: "San Francisco, CA", cat: "multi", left: 6, top: 49, specialty: "High-grade foils across every game", followers: 2210, verified: true },
    { id: "s-prizm", name: "PrizmHouse Breaks", city: "Los Angeles, CA", cat: "sports", left: 9, top: 62, specialty: "Modern basketball and football rookies", followers: 3120, verified: true },
    { id: "s-desert", name: "Desert Mana Games", city: "Phoenix, AZ", cat: "mtg", left: 19, top: 67, specialty: "Reserved List and Modern staples", followers: 1290, verified: true },
    { id: "s-milehigh", name: "Mile High Holos", city: "Denver, CO", cat: "pokemon", left: 34, top: 47, specialty: "Graded Pokemon singles and slabs", followers: 980, verified: true },
    { id: "s-firstpitch", name: "First Pitch Collectibles", city: "Dallas, TX", cat: "sports", left: 49, top: 73, specialty: "Baseball rookies and vintage", followers: 1560, verified: true },
    { id: "s-tapout", name: "Tap Out Games", city: "Austin, TX", cat: "mtg", left: 47, top: 78, specialty: "Commander and competitive foils", followers: 870, verified: true },
    { id: "s-northstar", name: "North Star Cards", city: "Minneapolis, MN", cat: "multi", left: 56, top: 26, specialty: "A little of everything, all vetted", followers: 1410, verified: true },
    { id: "s-holovault", name: "Holo Vault", city: "Chicago, IL", cat: "pokemon", left: 63, top: 38, specialty: "Base Set and WOTC era specialists", followers: 2640, verified: true },
    { id: "s-peachtree", name: "Peachtree Prospects", city: "Atlanta, GA", cat: "sports", left: 74, top: 66, specialty: "Football and basketball prospects", followers: 1120, verified: true },
    { id: "s-pallet", name: "Pallet Town Trading", city: "Orlando, FL", cat: "pokemon", left: 80, top: 86, specialty: "Sealed and singles, family run", followers: 760, verified: true },
    { id: "s-dugout", name: "Dugout Cards Co.", city: "New York, NY", cat: "sports", left: 87, top: 33, specialty: "Vintage baseball and Hall of Famers", followers: 1990, verified: true },
    { id: "s-topdeck", name: "Topdeck Emporium", city: "Boston, MA", cat: "mtg", left: 91, top: 28, specialty: "Old border and Legacy power", followers: 1330, verified: true },
  ];

  // the seller's own virtual booth (not on the map). userListings + your drops live here.
  Data.myShop = { id: "s-mybooth", name: "Your Booth", city: "Your City", cat: "multi", left: -99, top: -99, specialty: "Your verified booth on Card Shopper", followers: 128, verified: true, mine: true };

  Data.shopById = function (id) {
    if (id === Data.myShop.id) return Data.myShop;
    return Data.shops.find((s) => s.id === id);
  };
  Data.valueBoxes = [
    { id: "vb-prizm-rookies", shopId: "s-prizm", title: "Rookie Heaters Bin", note: "Fresh rookie hits, dig in" },
    { id: "vb-route1-vault", shopId: "s-route1", title: "WOTC Vault Box", note: "Vintage holos, one at a time" },
    { id: "vb-desert-power", shopId: "s-desert", title: "Power Nine Dig", note: "Old border heat" },
    { id: "vb-holovault-base", shopId: "s-holovault", title: "Base Set Bin", note: "1999 unlimited and shadowless" },
    { id: "vb-dugout-classics", shopId: "s-dugout", title: "Cooperstown Crate", note: "Vintage HOF rookies" },
    { id: "vb-foilroom-mixed", shopId: "s-foilroom", title: "Cross-Game Foils", note: "Best foils we pulled this week" },
    { id: "vb-mybooth-showcase", shopId: "s-mybooth", title: "My Showcase Box", note: "Cards you published into your value box" },
  ];

  // seed drops (scheduled announcements). dates relative to now for realism.
  const now = Date.now();
  const day = 86400000;
  Data.seedDrops = [
    { id: "d-route1-1", shopId: "s-route1", title: "Evolving Skies Alt-Art Restock", teaser: "Eight fresh PSA 10 alt arts hit the vault Friday night.", date: now + 2 * day, featured: ["p-umbreon", "p-rayquaza"] },
    { id: "d-prizm-1", shopId: "s-prizm", title: "Rookie Heaters Bin Refill", teaser: "New Prizm rookie bin, Mahomes and Wembanyama included.", date: now + 1 * day, featured: ["sp-mahomes", "sp-wemby"] },
    { id: "d-dugout-1", shopId: "s-dugout", title: "Cooperstown Crate Drop", teaser: "Vintage Trout and Ohtani rookies, graded and ready.", date: now + 3 * day, featured: ["sp-trout", "sp-ohtani"] },
  ];
})();
