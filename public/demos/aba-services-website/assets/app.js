/* Bright Path ABA, vanilla JS interactions.
   No external libraries. Handles:
   - Services card expand/collapse with aria-expanded
   - FAQ accordion (one open at a time)
   - Intake form validation and success state
*/

(function () {
  'use strict';

  // ---------- Services expand/collapse ----------
  function initServiceCards() {
    var grid = document.getElementById('services-grid');
    if (!grid) return;
    var cards = grid.querySelectorAll('[data-card]');
    cards.forEach(function (card) {
      var head = card.querySelector('.service-head');
      var body = card.querySelector('.service-body');
      if (!head || !body) return;
      head.addEventListener('click', function () {
        var isOpen = card.classList.toggle('is-open');
        head.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        if (isOpen) {
          body.hidden = false;
        } else {
          body.hidden = true;
        }
      });
    });
  }

  // ---------- FAQ accordion ----------
  function initFaq() {
    var list = document.getElementById('faq-list');
    if (!list) return;
    var items = list.querySelectorAll('[data-faq]');
    items.forEach(function (item) {
      var head = item.querySelector('.faq-head');
      var body = item.querySelector('.faq-body');
      if (!head || !body) return;
      head.addEventListener('click', function () {
        var isOpen = item.classList.contains('is-open');
        // Close all
        items.forEach(function (other) {
          other.classList.remove('is-open');
          var h = other.querySelector('.faq-head');
          var b = other.querySelector('.faq-body');
          if (h) h.setAttribute('aria-expanded', 'false');
          if (b) b.hidden = true;
        });
        if (!isOpen) {
          item.classList.add('is-open');
          head.setAttribute('aria-expanded', 'true');
          body.hidden = false;
        }
      });
    });
  }

  // ---------- Intake form validation ----------
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var PHONE_RE = /^[0-9+().\s-]{7,}$/;

  function setError(field, message) {
    field.classList.add('has-error');
    field.setAttribute('aria-invalid', 'true');
    var errEl = document.querySelector('[data-error-for="' + field.id + '"]');
    if (errEl) {
      errEl.textContent = message;
      errEl.hidden = false;
    }
  }

  function clearError(field) {
    field.classList.remove('has-error');
    field.removeAttribute('aria-invalid');
    var errEl = document.querySelector('[data-error-for="' + field.id + '"]');
    if (errEl) {
      errEl.textContent = '';
      errEl.hidden = true;
    }
  }

  function validateField(field) {
    var value = (field.value || '').trim();
    if (field.hasAttribute('required') && !value) {
      setError(field, 'This field is required.');
      return false;
    }
    if (field.type === 'email' && value && !EMAIL_RE.test(value)) {
      setError(field, 'Please enter a valid email address.');
      return false;
    }
    if (field.type === 'tel' && value && !PHONE_RE.test(value)) {
      setError(field, 'Please enter a valid phone number.');
      return false;
    }
    clearError(field);
    return true;
  }

  function initIntakeForm() {
    var form = document.getElementById('intake-form');
    var success = document.getElementById('intake-success');
    var resetBtn = document.getElementById('intake-reset');
    if (!form) return;

    var fields = form.querySelectorAll('input, select, textarea');
    fields.forEach(function (field) {
      field.addEventListener('blur', function () {
        if (field.hasAttribute('required') || field.value) {
          validateField(field);
        }
      });
      field.addEventListener('input', function () {
        if (field.classList.contains('has-error')) {
          validateField(field);
        }
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var allValid = true;
      var firstInvalid = null;
      var requiredFields = form.querySelectorAll('[required]');
      requiredFields.forEach(function (field) {
        var ok = validateField(field);
        if (!ok && !firstInvalid) firstInvalid = field;
        allValid = allValid && ok;
      });

      if (!allValid) {
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      var payload = {};
      fields.forEach(function (field) {
        if (field.name) payload[field.name] = field.value;
      });

      // Demo: log payload, no network call (HIPAA-aware boundary).
      try {
        console.log('[Bright Path ABA demo] intake payload:', payload);
      } catch (err) { /* no-op */ }

      form.hidden = true;
      if (success) {
        success.hidden = false;
        success.scrollIntoView({ behavior: 'smooth', block: 'center' });
        var heading = success.querySelector('h3');
        if (heading) heading.focus && heading.focus();
      }
    });

    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        form.reset();
        fields.forEach(clearError);
        if (success) success.hidden = true;
        form.hidden = false;
        form.scrollIntoView({ behavior: 'smooth', block: 'start' });
        var first = form.querySelector('input, select, textarea');
        if (first) first.focus();
      });
    }
  }

  // ---------- Boot ----------
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  ready(function () {
    initServiceCards();
    initFaq();
    initIntakeForm();
  });
})();
