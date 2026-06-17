import { logEvent } from "./analytics.js";

export function getETStatus() {
  const now = new Date();
  const etFmt = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", weekday: "short", hour: "numeric", hour12: false });
  const parts = etFmt.formatToParts(now);
  const weekday = parts.find(p => p.type === "weekday")?.value;
  const hour = parseInt(parts.find(p => p.type === "hour")?.value ?? "0");
  const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const isWeekday = weekdays.includes(weekday);
  const isBusinessHours = hour >= 9 && hour < 18;

  if (isWeekday && isBusinessHours) {
    return {
      available: true,
      msg: "Our support team is online right now and will respond within a few minutes."
    };
  } else {
    return {
      available: false,
      msg: "Our team is offline right now (Mon-Fri, 9am-6pm ET). Leave a message and we'll reply when we're back."
    };
  }
}

// Returns HTML for the escalation card
export function buildEscalationCard(sessionId) {
  const { available, msg } = getETStatus();
  logEvent("escalation_triggered", { sessionId, available });

  const statusColor = available ? "var(--teal)" : "var(--amber)";
  const statusIcon = available ? "🟢" : "🟡";

  return `
<div class="escalation-card" id="esc-card">
  <div class="esc-header">
    <span>${statusIcon}</span>
    <span style="color:${statusColor};font-weight:600">${available ? "Team Online" : "Team Offline"}</span>
  </div>
  <p class="esc-msg">${msg}</p>
  <form class="esc-form" id="esc-form">
    <input class="esc-input" type="text" name="name" placeholder="Your name" required />
    <input class="esc-input" type="email" name="email" placeholder="Email address" required />
    <textarea class="esc-input esc-textarea" name="message" placeholder="Describe your issue..." required rows="3"></textarea>
    <button type="submit" class="esc-submit">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
      Send to Support Team
    </button>
  </form>
  <p class="esc-zendesk">Ticket will be created in your help desk <span class="zendesk-badge">Zendesk</span></p>
</div>`;
}

export function attachEscalationFormHandler(sessionId, onSubmit) {
  const form = document.getElementById("esc-form");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    const ticketId = "TKT-" + Math.floor(10000 + Math.random() * 90000);
    logEvent("escalation_submitted", { sessionId, email: data.email, ticketId });
    onSubmit(ticketId, data);
  });
}

export function buildTicketConfirmCard(ticketId, name) {
  return `
<div class="ticket-card">
  <div class="ticket-header">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
    <span>Ticket Created</span>
  </div>
  <p>Hi <strong>${name}</strong>, your ticket <strong>${ticketId}</strong> has been submitted. A support agent will follow up at your email address.</p>
  <p class="ticket-sub">Estimated response: ${getETStatus().available ? "within the hour" : "next business day"}</p>
</div>`;
}
