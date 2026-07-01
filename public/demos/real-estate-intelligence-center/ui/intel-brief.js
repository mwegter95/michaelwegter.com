// Intel Brief stub  -  6 sections, static demo data, collapsible

const BRIEF_DATA = [
  { section: "What changed", icon: "📈", content: "Authority content cadence increased 3x this month. LinkedIn engagement rate up to 11%." },
  { section: "What is working", icon: "✅", content: "Cold call follow-up sequences converting at 12%. 5-touch cadence outperforming 2-touch by 6x." },
  { section: "What is leaking", icon: "⚠️", content: "Newsletter open rate dropped to 18%. Subject lines need refresh. Last 3 sends underperformed." },
  { section: "What needs action", icon: "🎯", content: "Document new seller objection script before next campaign launch. No KB entry exists yet." },
  { section: "Recommended decisions", icon: "💡", content: "Shift Authority content to LinkedIn short-form for Q3. Reduce newsletter send frequency to 2x/month." },
  { section: "Priority list", icon: "📋", content: "#1 Newsletter subject line refresh\n#2 KB: document objection script\n#3 LinkedIn cadence: 3x/week" }
];

export function renderIntelBrief(container) {
  container.innerHTML = "";

  BRIEF_DATA.forEach((item, idx) => {
    const el = document.createElement("div");
    el.className = "brief-item";
    if (idx === 0) el.classList.add("open"); // first open by default

    el.innerHTML = `
      <div class="brief-item-header">
        <span class="brief-icon">${item.icon}</span>
        <span class="brief-section-name">${item.section}</span>
        <span class="brief-chevron">›</span>
      </div>
      <div class="brief-item-body">
        <p class="brief-item-content">${item.content}</p>
      </div>
    `;

    el.querySelector(".brief-item-header").addEventListener("click", () => {
      el.classList.toggle("open");
    });

    container.appendChild(el);
  });
}
