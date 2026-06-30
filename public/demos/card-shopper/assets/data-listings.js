// data-listings.js
// Believable catalog (~36 listings) across sports / Pokemon / MTG, with value-box
// membership, foil flags, and seeds for deterministic placeholder art.
// Also the mock CollX detect fixtures + market-price helper for the upload flow.
// Exposed on window.CS.Data.
(function () {
  "use strict";
  window.CS = window.CS || {};
  const Data = (CS.Data = CS.Data || {});

  // id, shopId, cat, player(title), team, set, year, grade, price, foil, vb(valueBoxId|null)
  function L(id, shopId, cat, player, team, set, year, grade, price, foil, vb) {
    return { id, shopId, cat, player, team, set, year, grade, price, foil: !!foil, vb: vb || null, seed: "cs-" + id };
  }

  Data.listings = [
    // --- Sports: PrizmHouse Breaks (vb-prizm-rookies) ---
    L("sp-mahomes", "s-prizm", "sports", "Patrick Mahomes RC", "Chiefs", "Panini Prizm", "2017", "PSA 10", 2400, false, "vb-prizm-rookies"),
    L("sp-wemby", "s-prizm", "sports", "Victor Wembanyama RC", "Spurs", "Panini Prizm", "2023-24", "PSA 10", 900, false, "vb-prizm-rookies"),
    L("sp-luka", "s-prizm", "sports", "Luka Doncic RC", "Mavericks", "Panini Prizm", "2018-19", "PSA 9", 640, false, "vb-prizm-rookies"),
    L("sp-chase", "s-prizm", "sports", "Ja'Marr Chase RC", "Bengals", "Panini Prizm", "2021", "PSA 9", 120, false, "vb-prizm-rookies"),
    L("sp-caitlin", "s-prizm", "sports", "Caitlin Clark RC", "Fever", "Panini Prizm WNBA", "2024", "PSA 10", 460, false, "vb-prizm-rookies"),
    L("sp-bedard", "s-prizm", "sports", "Connor Bedard RC", "Blackhawks", "Upper Deck Young Guns", "2023-24", "PSA 10", 300, false, "vb-prizm-rookies"),
    // --- Sports: Dugout Cards Co. (vb-dugout-classics) ---
    L("sp-trout", "s-dugout", "sports", "Mike Trout RC", "Angels", "Topps Update", "2011", "BGS 9.5", 1850, false, "vb-dugout-classics"),
    L("sp-ohtani", "s-dugout", "sports", "Shohei Ohtani RC", "Angels", "Topps Chrome", "2018", "PSA 10", 720, false, "vb-dugout-classics"),
    L("sp-acuna", "s-dugout", "sports", "Ronald Acuna Jr RC", "Braves", "Topps Chrome", "2018", "PSA 10", 410, false, "vb-dugout-classics"),
    L("sp-jeter", "s-dugout", "sports", "Derek Jeter RC", "Yankees", "Topps", "1993", "PSA 9", 1200, false, "vb-dugout-classics"),
    L("sp-griffey", "s-dugout", "sports", "Ken Griffey Jr RC", "Mariners", "Upper Deck", "1989", "PSA 9", 560, false, "vb-dugout-classics"),
    // --- Sports standalone ---
    L("sp-burrow", "s-firstpitch", "sports", "Joe Burrow RC", "Bengals", "Panini Prizm", "2020", "PSA 10", 380, false, null),
    L("sp-soto", "s-firstpitch", "sports", "Juan Soto RC", "Nationals", "Topps Chrome", "2018", "PSA 10", 290, false, null),
    L("sp-jefferson", "s-peachtree", "sports", "Justin Jefferson RC", "Vikings", "Panini Prizm", "2020", "PSA 9", 210, false, null),
    L("sp-maye", "s-peachtree", "sports", "Drake Maye RC", "Patriots", "Panini Prizm", "2024", "PSA 10", 95, false, null),

    // --- Pokemon: Holo Vault (vb-holovault-base) ---
    L("p-charizard", "s-holovault", "pokemon", "Charizard Holo #4/102", null, "Base Set", "1999", "PSA 9", 2000, true, "vb-holovault-base"),
    L("p-blastoise", "s-holovault", "pokemon", "Blastoise Holo #2/102", null, "Base Set", "1999", "PSA 8", 400, true, "vb-holovault-base"),
    L("p-mewtwo", "s-holovault", "pokemon", "Mewtwo Holo #10/102", null, "Base Set", "1999", "PSA 9", 300, true, "vb-holovault-base"),
    L("p-pikachu", "s-holovault", "pokemon", "Pikachu #58/102", null, "Base Set", "1999", "PSA 8", 60, false, "vb-holovault-base"),
    L("p-lugia", "s-holovault", "pokemon", "Lugia Holo #9/111", null, "Neo Genesis", "2000", "PSA 8", 700, true, "vb-holovault-base"),
    // --- Pokemon: Route 1 (vb-route1-vault) ---
    L("p-umbreon", "s-route1", "pokemon", "Umbreon VMAX Alt Art", null, "Evolving Skies", "2021", "PSA 10", 550, true, "vb-route1-vault"),
    L("p-rayquaza", "s-route1", "pokemon", "Rayquaza VMAX Alt Art", null, "Evolving Skies", "2021", "PSA 10", 120, true, "vb-route1-vault"),
    L("p-charizardex", "s-route1", "pokemon", "Charizard ex #125", null, "Obsidian Flames", "2023", "PSA 10", 70, true, "vb-route1-vault"),
    L("p-venusaur", "s-route1", "pokemon", "Venusaur Holo #15/102", null, "Base Set", "1999", "PSA 8", 260, true, "vb-route1-vault"),
    // --- Pokemon standalone ---
    L("p-gengar", "s-milehigh", "pokemon", "Gengar Holo #5/64", null, "Fossil", "1999", "PSA 9", 330, true, null),
    L("p-mew", "s-pallet", "pokemon", "Mew Promo #8", null, "Wizards Black Star", "2000", "PSA 9", 180, true, null),

    // --- MTG: Desert Mana Games (vb-desert-power) ---
    L("m-tarmogoyf", "s-desert", "mtg", "Tarmogoyf", null, "Future Sight", "2007", "BGS 9.5", 120, false, "vb-desert-power"),
    L("m-liliana", "s-desert", "mtg", "Liliana of the Veil", null, "Innistrad", "2011", "PSA 10", 150, false, "vb-desert-power"),
    L("m-jace", "s-desert", "mtg", "Jace, the Mind Sculptor", null, "Worldwake", "2010", "PSA 9", 130, false, "vb-desert-power"),
    L("m-ragavan", "s-desert", "mtg", "Ragavan, Nimble Pilferer", null, "Modern Horizons 2", "2021", "PSA 10", 90, false, "vb-desert-power"),
    L("m-fow", "s-desert", "mtg", "Force of Will", null, "Alliances", "1996", "BGS 8.5", 200, false, "vb-desert-power"),
    // --- MTG standalone ---
    L("m-snapcaster", "s-tapout", "mtg", "Snapcaster Mage", null, "Innistrad", "2011", "BGS 9", 60, true, null),
    L("m-onering", "s-topdeck", "mtg", "The One Ring", null, "LOTR Tales of ME", "2023", "PSA 10", 110, true, null),
    L("m-lasthope", "s-topdeck", "mtg", "Liliana, the Last Hope", null, "Eldritch Moon", "2016", "PSA 9", 70, false, null),

    // --- Multi: The Foil Room (vb-foilroom-mixed) ---
    L("mx-charizard", "s-foilroom", "pokemon", "Charizard VMAX Rainbow", null, "Champions Path", "2020", "PSA 10", 240, true, "vb-foilroom-mixed"),
    L("mx-ragavan", "s-foilroom", "mtg", "Ragavan Foil Etched", null, "Modern Horizons 2", "2021", "PSA 10", 130, true, "vb-foilroom-mixed"),
    L("mx-wemby", "s-foilroom", "sports", "Wembanyama Silver", "Spurs", "Panini Prizm", "2023-24", "PSA 9", 520, true, "vb-foilroom-mixed"),
    L("mx-pikavmax", "s-foilroom", "pokemon", "Pikachu VMAX", null, "Vivid Voltage", "2020", "PSA 10", 90, true, "vb-foilroom-mixed"),
  ];

  Data.listingById = function (id) {
    const found = Data.listings.find((l) => l.id === id);
    return found || null;
  };
  Data.listingsByShop = function (shopId) {
    return Data.listings.filter((l) => l.shopId === shopId);
  };

  // mock CollX detect fixtures: cycle through these in the 4-step upload.
  Data.detectFixtures = [
    { player: "Anthony Edwards RC", set: "Panini Prizm", year: "2020-21", cardNumber: "#258", category: "sports", grade: "PSA 9", estValue: 240 },
    { player: "Gengar VMAX Alt Art", set: "Fusion Strike", year: "2021", cardNumber: "#271/264", category: "pokemon", grade: "PSA 10", estValue: 310 },
    { player: "Sheoldred, the Apocalypse", set: "Dominaria United", year: "2022", cardNumber: "#107", category: "mtg", grade: "PSA 10", estValue: 95 },
    { player: "CC Lamelo Ball RC", set: "Panini Prizm", year: "2020-21", cardNumber: "#278", category: "sports", grade: "PSA 9", estValue: 160 },
  ];

  // subscription tiers (mock Stripe products / prices, recurring monthly)
  Data.plans = [
    { id: "booth", name: "Booth", price: 29, blurb: "Everything to run a verified booth.", perks: ["Unlimited listings", "Value boxes and drops", "Zero per-sale fees", "Buyer messaging and offers"] },
    { id: "booth-pro", name: "Booth Pro", price: 49, blurb: "For high-volume founding sellers.", perks: ["Everything in Booth", "Priority map placement", "Klaviyo drop email automation", "Advanced booth analytics", "Zero per-sale fees"] },
  ];
})();
