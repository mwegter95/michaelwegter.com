let orders = null;

async function loadOrders() {
  if (!orders) {
    orders = await fetch("./orders.json").then(r => r.json());
  }
}

export async function lookupOrder(query) {
  await loadOrders();
  const q = query.trim().toUpperCase();
  const match = orders.find(
    o => o.id.toUpperCase() === q || o.email.toLowerCase() === query.trim().toLowerCase()
  );
  if (!match) return null;

  const lines = [`**Order ${match.id}** — ${match.item}`, `Status: **${match.status}**`];
  if (match.carrier && match.trackingNumber) {
    lines.push(`Tracking: \`${match.trackingNumber}\` via ${match.carrier}`);
  }
  if (match.estimatedDelivery) {
    lines.push(`Estimated delivery: ${match.estimatedDelivery}`);
  }
  if (match.orderDate) {
    lines.push(`Order placed: ${match.orderDate}`);
  }
  return lines.join("\n");
}

// Detect order number or email in a user message
export function extractOrderQuery(text) {
  // Order ID pattern: ORD-XXXXX or bare numbers 5+ digits
  const ordMatch = text.match(/\b(ORD-\d{4,6}|\d{5,6})\b/i);
  if (ordMatch) {
    let id = ordMatch[1];
    if (!id.toUpperCase().startsWith("ORD-")) id = "ORD-" + id;
    return id.toUpperCase();
  }
  // Email pattern
  const emailMatch = text.match(/\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/);
  if (emailMatch) return emailMatch[0];
  return null;
}
