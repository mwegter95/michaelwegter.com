/* main.js — CivicQ landing page interactivity.
   Sticky-nav scroll spy, scroll-reveal, mobile nav toggle, hero video
   affordance, lightweight analytics stub (Plausible/Fathom placeholder),
   and the email-capture form wired to mw-backend's civicq_blueprint. */

(function () {
  "use strict";

  var API_BASE = "https://api.michaelwegter.com/api/civicq";
  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ── Analytics stub ───────────────────────────────────────────────────────
  // Placeholder for Plausible/Fathom. Drop in the real <script data-domain=
  // "civicq.org" src="https://plausible.io/js/script.js"> tag at launch and
  // this same track() call becomes a real pageview/event hit.
  function track(eventName, props) {
    if (window.plausible) { window.plausible(eventName, { props: props }); }
    // eslint-disable-next-line no-console
    console.log("[analytics:civicq]", eventName, props || {});
  }
  window.civicqTrack = track;
  track("pageview", { path: location.pathname });

  document.addEventListener("DOMContentLoaded", function () {
    initMobileNav();
    initScrollSpy();
    initReveal();
    initHeroVideo();
    initFeedbackDismiss();
    initEmailForm();
  });

  // ── Mobile nav toggle ────────────────────────────────────────────────────
  function initMobileNav() {
    var nav = document.querySelector(".site-nav");
    var toggle = document.querySelector(".nav-toggle");
    if (!nav || !toggle) return;
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.querySelectorAll(".nav-links a").forEach(function (a) {
      a.addEventListener("click", function () { nav.classList.remove("is-open"); });
    });
  }

  // ── Scroll-spy active nav state ─────────────────────────────────────────
  function initScrollSpy() {
    var links = Array.prototype.slice.call(document.querySelectorAll(".nav-links a[href^='#']"));
    if (!links.length || !("IntersectionObserver" in window)) return;
    var sections = links
      .map(function (a) { return document.querySelector(a.getAttribute("href")); })
      .filter(Boolean);

    var byId = {};
    links.forEach(function (a) { byId[a.getAttribute("href").slice(1)] = a; });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var link = byId[entry.target.id];
        if (!link) return;
        if (entry.isIntersecting) {
          links.forEach(function (a) { a.classList.remove("is-active"); });
          link.classList.add("is-active");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });

    sections.forEach(function (s) { observer.observe(s); });
  }

  // ── Reveal-on-scroll + chart draw-in ─────────────────────────────────────
  function initReveal() {
    var revealEls = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
    if (!revealEls.length) return;

    if (reduced || !("IntersectionObserver" in window)) {
      revealEls.forEach(function (el) { el.classList.add("is-visible"); });
      mountCharts();
      return;
    }

    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          if (entry.target.hasAttribute("data-mount-charts")) {
            mountCharts();
          }
          if (entry.target.id === "scoring" && window.__civicqScoringSvg) {
            window.CivicQCharts.animateScoringChart(window.__civicqScoringSvg);
          }
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    revealEls.forEach(function (el) { observer.observe(el); });

    // mount charts immediately too (so they render even if already in view)
    mountCharts();
  }

  var chartsMounted = false;
  function mountCharts() {
    if (chartsMounted || !window.CivicQCharts) return;
    chartsMounted = true;

    var scoringMount = document.getElementById("scoring-chart");
    if (scoringMount) {
      window.__civicqScoringSvg = window.CivicQCharts.renderScoringChart(scoringMount);
      if (reduced) window.CivicQCharts.animateScoringChart(window.__civicqScoringSvg);
    }

    var fundsBar = document.getElementById("funds-bar");
    if (fundsBar) {
      window.CivicQCharts.renderFundsChart(
        fundsBar,
        document.getElementById("funds-legend"),
        document.getElementById("funds-table")
      );
    }
  }

  // ── Hero video placeholder ──────────────────────────────────────────────
  function initHeroVideo() {
    var btn = document.querySelector(".video-thumb");
    var note = document.querySelector(".video-note");
    if (!btn || !note) return;
    btn.addEventListener("click", function () {
      note.hidden = !note.hidden;
      track("hero_video_click");
    });
  }

  // ── Feedback banner dismiss ──────────────────────────────────────────────
  function initFeedbackDismiss() {
    var banner = document.querySelector(".feedback-banner");
    var dismiss = document.querySelector(".feedback-dismiss");
    if (!banner || !dismiss) return;
    dismiss.addEventListener("click", function () {
      banner.style.display = "none";
      track("feedback_banner_dismiss");
    });
  }

  // ── Email capture form ───────────────────────────────────────────────────
  function initEmailForm() {
    var form = document.getElementById("email-capture-form");
    if (!form) return;
    var input = form.querySelector("input[type='email']");
    var msg = form.querySelector(".email-form-msg");
    var submitBtn = form.querySelector("button[type='submit']");

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var email = (input.value || "").trim();
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setMsg("Enter a valid email address.", "error");
        input.focus();
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = "Submitting…";
      track("org_hub_subscribe_attempt");

      fetch(API_BASE + "/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email })
      })
        .then(function (res) { return res.json().catch(function () { return {}; }).then(function (body) { return { ok: res.ok, body: body }; }); })
        .then(function (result) {
          if (result.ok && result.body && result.body.status === "duplicate") {
            setMsg("You're already on the list for Organization Hub updates.", "success");
            track("org_hub_subscribe_duplicate");
          } else if (result.ok) {
            setMsg("Thanks. We'll email you when Organization Hub access opens.", "success");
            form.reset();
            track("org_hub_subscribe_success");
          } else {
            setMsg("That didn't go through. Check the address and try again.", "error");
            track("org_hub_subscribe_error");
          }
        })
        .catch(function () {
          // Backend unreachable (e.g. local preview before deploy). Fail
          // quietly in the console and tell the visitor plainly.
          setMsg("Signups are temporarily unavailable. Please try again shortly.", "error");
          track("org_hub_subscribe_network_error");
        })
        .finally(function () {
          submitBtn.disabled = false;
          submitBtn.textContent = "Notify Me";
        });
    });

    function setMsg(text, kind) {
      msg.textContent = text;
      msg.classList.remove("is-success", "is-error");
      msg.classList.add(kind === "success" ? "is-success" : "is-error");
    }
  }
})();
