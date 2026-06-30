// us-map.js
// Self-contained, license-clear stylized continental US silhouette on the
// standard 959x593 viewBox so percentage-positioned pins land on the landmass.
// Reads as a dark felt table, not a literal political map. Exposed on CS.USMap.
(function () {
  "use strict";
  window.CS = window.CS || {};
  const html = htm.bind(React.createElement);

  // clockwise outline of the lower-48 (approximate, demo-grade) + Florida.
  const MAINLAND = [
    [95, 70], [160, 62], [300, 58], [450, 62], [600, 72], [720, 82], [810, 108], [872, 150],
    [898, 182], [884, 214], [862, 250], [842, 296], [822, 344], [812, 388],
    [806, 420], [800, 470], [782, 528], [762, 476], [745, 432],
    [690, 430], [610, 452], [540, 470], [478, 498], [452, 470], [388, 462],
    [300, 452], [214, 432], [150, 420], [110, 402],
    [78, 360], [50, 300], [42, 240], [52, 176], [74, 120],
  ].map((p) => p.join(",")).join(" ");

  // a few faint interior seams to suggest regions without real state geometry
  const SEAMS = [
    "M 250 70 L 250 440",
    "M 430 60 L 430 480",
    "M 600 72 L 600 452",
    "M 740 84 L 740 420",
    "M 60 250 L 880 250",
    "M 80 360 L 800 360",
  ];

  function UsMap() {
    return html`
      <svg viewBox="0 0 959 593" role="img" aria-label="Map of the United States with verified card shops">
        <defs>
          <radialGradient id="feltGlow" cx="55%" cy="20%" r="80%">
            <stop offset="0%" stop-color="#16553f" />
            <stop offset="100%" stop-color="#0f3d2d" />
          </radialGradient>
          <clipPath id="usClip"><polygon points=${MAINLAND} /></clipPath>
        </defs>
        <polygon points=${MAINLAND} fill="url(#feltGlow)" stroke="rgba(245,240,230,0.22)" stroke-width="1.4" stroke-linejoin="round" />
        <g stroke="rgba(245,240,230,0.10)" stroke-width="1" fill="none" clip-path="url(#usClip)">
          ${SEAMS.map((d, i) => html`<path key=${i} d=${d} />`)}
        </g>
      </svg>
    `;
  }

  CS.UsMap = UsMap;
})();
