// Art Print catalog -- 12 prints backed by Picsum Photos (CC0)
// Thumbnails: 450x560    Full editorial: 800x1000

export const PRINTS = [
  { id:1,  title:"Morning Fog",        artist:"A. Chen",     seed:"art1",  edition:"limited", editionSize:25,   editionNum:3,   medium:"Fine Art Inkjet", substrate:"Hahnemuhle Photo Rag 308gsm",       basePrice:180 },
  { id:2,  title:"Silver Forest",      artist:"M. Okafor",   seed:"art2",  edition:"open",    editionSize:null, editionNum:null, medium:"C-Type Print",    substrate:"Fuji Crystal Archive Lustre",       basePrice:120 },
  { id:3,  title:"Coastal Light",      artist:"S. Reyes",    seed:"art3",  edition:"limited", editionSize:15,   editionNum:7,   medium:"Pigment Print",   substrate:"Canson Platine Fibre Rag 310gsm",   basePrice:220 },
  { id:4,  title:"Brutalist Form",     artist:"T. Nakamura", seed:"art4",  edition:"limited", editionSize:20,   editionNum:1,   medium:"Fine Art Inkjet", substrate:"Epson Ultra Premium Matte",         basePrice:200 },
  { id:5,  title:"Tide Pool",          artist:"A. Chen",     seed:"art5",  edition:"open",    editionSize:null, editionNum:null, medium:"C-Type Print",    substrate:"Fuji Crystal Archive Lustre",       basePrice:110 },
  { id:6,  title:"Golden Hour",        artist:"L. Fontaine", seed:"art6",  edition:"limited", editionSize:30,   editionNum:12,  medium:"Pigment Print",   substrate:"Hahnemuhle German Etching 310gsm",  basePrice:160 },
  { id:7,  title:"Urban Geometry",     artist:"T. Nakamura", seed:"art7",  edition:"limited", editionSize:10,   editionNum:5,   medium:"Fine Art Inkjet", substrate:"Canson Rag Photographique 310gsm",  basePrice:280 },
  { id:8,  title:"Salt Flats",         artist:"S. Reyes",    seed:"art8",  edition:"open",    editionSize:null, editionNum:null, medium:"C-Type Print",    substrate:"Fuji Crystal Archive Metallic",     basePrice:140 },
  { id:9,  title:"Rain Study No. 4",   artist:"M. Okafor",   seed:"art9",  edition:"limited", editionSize:12,   editionNum:9,   medium:"Fine Art Inkjet", substrate:"Hahnemuhle Photo Rag 308gsm",       basePrice:190 },
  { id:10, title:"Winter Bloom",       artist:"L. Fontaine", seed:"art10", edition:"limited", editionSize:20,   editionNum:4,   medium:"Pigment Print",   substrate:"Epson Ultra Premium Matte",         basePrice:175 },
  { id:11, title:"Dusk Over Mesa",     artist:"A. Chen",     seed:"art11", edition:"open",    editionSize:null, editionNum:null, medium:"C-Type Print",    substrate:"Fuji Crystal Archive Lustre",       basePrice:130 },
  { id:12, title:"Shoreline Abstract", artist:"M. Okafor",   seed:"art12", edition:"limited", editionSize:8,    editionNum:2,   medium:"Fine Art Inkjet", substrate:"Canson Platine Fibre Rag 310gsm",   basePrice:320 },
];

export const SIZES = [
  { label:"8 x 10",  multiplier:1.0 },
  { label:"12 x 16", multiplier:1.8 },
  { label:"16 x 20", multiplier:2.8 },
  { label:"24 x 30", multiplier:4.5 },
];

export function thumbUrl(p) {
  return `https://picsum.photos/seed/${p.seed}/450/560`;
}

export function fullUrl(p) {
  return `https://picsum.photos/seed/${p.seed}/800/1000`;
}

export function priceForSize(p, si) {
  const raw = p.basePrice * SIZES[si].multiplier;
  return Math.round(raw / 5) * 5;
}

export function editionLabel(p) {
  return p.edition === "limited"
    ? `Limited Edition ${p.editionNum} of ${p.editionSize}`
    : "Open Edition";
}

export function getPrintById(id) {
  return PRINTS.find(p => p.id === Number(id)) || null;
}
