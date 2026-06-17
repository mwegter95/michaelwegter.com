const STORAGE_KEY = "supportai_events";

export function logEvent(type, data = {}) {
  const events = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "[]");
  events.push({ type, ts: Date.now(), ...data });
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

export function getEvents() {
  return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "[]");
}

export function clearEvents() {
  sessionStorage.removeItem(STORAGE_KEY);
}

export function getStats() {
  const events = getEvents();
  const sent = events.filter(e => e.type === "message_sent");
  const responded = events.filter(e => e.type === "bot_responded");
  const orderLookups = events.filter(e => e.type === "order_lookup");
  const escalations = events.filter(e => e.type === "escalation_triggered");
  const submitted = events.filter(e => e.type === "escalation_submitted");
  const sessions = new Set(events.map(e => e.sessionId).filter(Boolean));

  // Top queries
  const queryMap = {};
  sent.forEach(e => {
    if (e.text) {
      const key = e.text.slice(0, 60).toLowerCase();
      queryMap[key] = (queryMap[key] || 0) + 1;
    }
  });
  const topQueries = Object.entries(queryMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([text, count]) => ({ text, count }));

  // Deflection rate = (responded - escalations) / responded
  const deflected = responded.length - escalations.length;
  const deflectionRate = responded.length > 0
    ? Math.round((deflected / responded.length) * 100)
    : 0;

  // Avg messages per session
  const sessionMsgs = {};
  sent.forEach(e => {
    if (e.sessionId) sessionMsgs[e.sessionId] = (sessionMsgs[e.sessionId] || 0) + 1;
  });
  const sessionCounts = Object.values(sessionMsgs);
  const avgMsgs = sessionCounts.length > 0
    ? (sessionCounts.reduce((a, b) => a + b, 0) / sessionCounts.length).toFixed(1)
    : 0;

  return {
    totalMessages: sent.length,
    totalResponses: responded.length,
    orderLookups: orderLookups.length,
    escalationsTriggered: escalations.length,
    escalationsSubmitted: submitted.length,
    deflectionRate,
    avgMsgsPerSession: avgMsgs,
    sessionCount: sessions.size || 1,
    topQueries,
    recentEvents: events.slice(-20).reverse()
  };
}
