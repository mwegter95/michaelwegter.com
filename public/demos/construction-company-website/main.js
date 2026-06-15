/* =====================================================================
   CORNERSTONE CONSTRUCTION CO. | MAIN.JS
   Handles: nav scroll/transparency, hamburger menu, scroll-fade-in,
            stats counter animation, hero video fallback
   ===================================================================== */

(function () {
  'use strict';

  // ─── HERO VIDEO FALLBACK ──────────────────────────────────────────────
  const heroVideo = document.querySelector('.hero-video');
  const heroVideoWrap = document.querySelector('.hero-video-wrap');

  if (heroVideo && heroVideoWrap) {
    heroVideo.addEventListener('error', function () {
      heroVideoWrap.classList.add('poster-fallback');
      heroVideo.remove();
    });

    // Fallback if video doesn't start playing within 4s
    const videoTimeout = setTimeout(function () {
      if (heroVideo.readyState < 2) {
        heroVideoWrap.classList.add('poster-fallback');
        heroVideo.remove();
      }
    }, 4000);

    heroVideo.addEventListener('playing', function () {
      clearTimeout(videoTimeout);
    });
  }

  // ─── STICKY NAV ───────────────────────────────────────────────────────
  const nav = document.querySelector('.site-nav');
  const isHomePage = nav && nav.classList.contains('transparent');

  if (nav) {
    function updateNav() {
      if (isHomePage) {
        if (window.scrollY > 80) {
          nav.classList.add('scrolled');
        } else {
          nav.classList.remove('scrolled');
        }
      }
    }
    window.addEventListener('scroll', updateNav, { passive: true });
    updateNav();
  }

  // ─── HAMBURGER MENU ───────────────────────────────────────────────────
  const hamburger = document.querySelector('.nav-hamburger');
  const drawer = document.querySelector('.nav-drawer');
  const overlay = document.querySelector('.nav-overlay');

  function openDrawer() {
    hamburger.classList.add('open');
    drawer.classList.add('open');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    hamburger.setAttribute('aria-expanded', 'true');
  }

  function closeDrawer() {
    hamburger.classList.remove('open');
    drawer.classList.remove('open');
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    hamburger.setAttribute('aria-expanded', 'false');
  }

  if (hamburger) {
    hamburger.addEventListener('click', function () {
      if (drawer.classList.contains('open')) {
        closeDrawer();
      } else {
        openDrawer();
      }
    });
  }

  if (overlay) {
    overlay.addEventListener('click', closeDrawer);
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && drawer && drawer.classList.contains('open')) {
      closeDrawer();
    }
  });

  // ─── SCROLL FADE-IN ───────────────────────────────────────────────────
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fadeEls = document.querySelectorAll('.fade-in');

  if (prefersReduced) {
    fadeEls.forEach(function (el) {
      el.classList.add('visible');
    });
  } else if ('IntersectionObserver' in window) {
    const fadeObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            fadeObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    fadeEls.forEach(function (el) {
      fadeObserver.observe(el);
    });
  } else {
    // Fallback for no IntersectionObserver
    fadeEls.forEach(function (el) {
      el.classList.add('visible');
    });
  }

  // ─── STATS COUNTER ANIMATION ──────────────────────────────────────────
  const statNumbers = document.querySelectorAll('[data-count]');

  function easeOutQuad(t) {
    return t * (2 - t);
  }

  function animateCounter(el, target, duration) {
    const start = performance.now();
    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix || '';

    function step(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const value = Math.round(easeOutQuad(progress) * target);
      el.textContent = prefix + value + suffix;
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = prefix + target + suffix;
      }
    }
    requestAnimationFrame(step);
  }

  if (statNumbers.length > 0) {
    if (prefersReduced) {
      statNumbers.forEach(function (el) {
        const target = parseInt(el.dataset.count, 10);
        const suffix = el.dataset.suffix || '';
        const prefix = el.dataset.prefix || '';
        el.textContent = prefix + target + suffix;
      });
    } else {
      const statsObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              const el = entry.target;
              const target = parseInt(el.dataset.count, 10);
              animateCounter(el, target, 1500);
              statsObserver.unobserve(el);
            }
          });
        },
        { threshold: 0.5 }
      );
      statNumbers.forEach(function (el) {
        statsObserver.observe(el);
      });
    }
  }

  // ─── FAQ ACCORDION ────────────────────────────────────────────────────
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(function (item) {
    const btn = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');

    if (btn && answer) {
      btn.addEventListener('click', function () {
        const isOpen = item.classList.contains('open');

        // Close all
        faqItems.forEach(function (i) {
          i.classList.remove('open');
          const a = i.querySelector('.faq-answer');
          const b = i.querySelector('.faq-question');
          if (a) { a.style.maxHeight = '0'; a.setAttribute('aria-hidden', 'true'); }
          if (b) b.setAttribute('aria-expanded', 'false');
        });

        // Open clicked if was closed
        if (!isOpen) {
          item.classList.add('open');
          answer.style.maxHeight = answer.scrollHeight + 'px';
          answer.setAttribute('aria-hidden', 'false');
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    }
  });

})();
