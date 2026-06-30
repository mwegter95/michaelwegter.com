// notifications.js
// Notification center screen with unread counts + mark-read. Exposed on CS.Screens.
(function () {
  "use strict";
  window.CS = window.CS || {};
  CS.Screens = CS.Screens || {};
  const html = htm.bind(React.createElement);
  const { relTime, Empty } = CS.UI;

  const GLYPH = {
    drop: { ic: "\u{1F4E3}", bg: "rgba(212,175,55,0.18)", fg: "#e6c869" },
    offer: { ic: "\u{1F4B0}", bg: "rgba(45,182,125,0.18)", fg: "#6fe0ad" },
    message: { ic: "\u{1F4AC}", bg: "rgba(30,102,255,0.18)", fg: "#7aa6ff" },
    order: { ic: "\u{1F6CD}", bg: "rgba(212,175,55,0.18)", fg: "#e6c869" },
    seller: { ic: "\u2705", bg: "rgba(45,182,125,0.18)", fg: "#6fe0ad" },
    system: { ic: "\u2728", bg: "rgba(245,240,230,0.12)", fg: "#f5f0e6" },
  };

  function Notifications() {
    const { state, actions } = React.useContext(CS.Ctx);
    const items = [...state.notifications].sort((a, b) => b.ts - a.ts);
    const unread = items.filter((n) => !n.read).length;
    return html`
      <div class="page">
        <div class="row between mb wrap gap-s">
          <div>
            <div class="eyebrow">Activity</div>
            <h1 class="section-title">Notifications</h1>
          </div>
          ${unread ? html`<button class="btn sm" onClick=${actions.markAllRead}>Mark all read (${unread})</button>` : null}
        </div>
        <div class="hairline"></div>
        ${items.length === 0
          ? html`<${Empty} icon="\u{1F514}" title="No notifications yet" sub="Follow a shop or make an offer and updates will land here." />`
          : html`<div class="list">
              ${items.map((n) => {
                const g = GLYPH[n.type] || GLYPH.system;
                return html`<button key=${n.id} class=${"notif-row" + (n.read ? "" : " unread")} style=${{ textAlign: "left", width: "100%", cursor: "pointer" }} onClick=${() => actions.markNotifRead(n.id)}>
                  <span class="glyph" style=${{ background: g.bg, color: g.fg }}>${g.ic}</span>
                  <span class="grow">
                    <h4 style=${{ margin: 0, fontSize: "15px" }}>${n.title}</h4>
                    <div class="muted" style=${{ fontSize: "13px" }}>${n.body}</div>
                  </span>
                  <span class="muted" style=${{ fontSize: "12px", whiteSpace: "nowrap" }}>${relTime(n.ts)}</span>
                </button>`;
              })}
            </div>`}
      </div>`;
  }

  CS.Screens.Notifications = Notifications;
})();
