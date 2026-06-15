/* =====================================================================
   CORNERSTONE CONSTRUCTION CO. | CONTACT.JS
   Handles: form validation (blur + submit), success state
   ===================================================================== */

(function () {
  'use strict';

  const form = document.getElementById('contact-form');
  const successPanel = document.querySelector('.contact-success');
  if (!form) return;

  // ─── VALIDATORS ───────────────────────────────────────────────────────
  function isEmail(val) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  }
  function isPhone(val) {
    return val.trim() === '' || /^[\d\s\(\)\+\-\.]{7,20}$/.test(val.trim());
  }

  const rules = {
    'full-name': function (val) {
      if (!val.trim()) return 'Please enter your full name.';
      if (val.trim().length < 2) return 'Name must be at least 2 characters.';
      return '';
    },
    'email': function (val) {
      if (!val.trim()) return 'Please enter your email address.';
      if (!isEmail(val)) return 'Please enter a valid email address.';
      return '';
    },
    'phone': function (val) {
      if (!isPhone(val)) return 'Please enter a valid phone number.';
      return '';
    },
    'service': function (val) {
      if (!val) return 'Please select a service type.';
      return '';
    },
    'description': function (val) {
      if (!val.trim()) return 'Please describe your project briefly.';
      if (val.trim().length < 15) return 'Please provide a bit more detail (at least 15 characters).';
      return '';
    },
  };

  // ─── FIELD VALIDATION UI ──────────────────────────────────────────────
  function getErrorEl(field) {
    return form.querySelector('[data-error-for="' + field.name + '"]');
  }
  function getSuccessEl(field) {
    return form.querySelector('[data-success-for="' + field.name + '"]');
  }

  function validateField(field) {
    const rule = rules[field.name];
    if (!rule) return true;

    const error = rule(field.value);
    const errEl = getErrorEl(field);
    const sucEl = getSuccessEl(field);

    if (error) {
      field.classList.add('error');
      field.classList.remove('valid');
      if (errEl) { errEl.textContent = error; errEl.classList.add('visible'); }
      if (sucEl) sucEl.classList.remove('visible');
      return false;
    } else {
      field.classList.remove('error');
      field.classList.add('valid');
      if (errEl) { errEl.textContent = ''; errEl.classList.remove('visible'); }
      if (sucEl && field.value.trim()) sucEl.classList.add('visible');
      return true;
    }
  }

  // ─── BLUR VALIDATION ──────────────────────────────────────────────────
  const fields = form.querySelectorAll('input, select, textarea');
  fields.forEach(function (field) {
    field.addEventListener('blur', function () {
      if (field.value !== '' || field.classList.contains('error')) {
        validateField(field);
      }
    });
    field.addEventListener('input', function () {
      if (field.classList.contains('error')) {
        validateField(field);
      }
    });
  });

  // ─── SUBMIT VALIDATION ────────────────────────────────────────────────
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    let valid = true;
    const toValidate = ['full-name', 'email', 'phone', 'service', 'description'];

    toValidate.forEach(function (name) {
      const field = form.querySelector('[name="' + name + '"]');
      if (field) {
        const ok = validateField(field);
        if (!ok) valid = false;
      }
    });

    if (!valid) {
      // Scroll to first error
      const firstError = form.querySelector('.error');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstError.focus();
      }
      return;
    }

    // Simulate form submission
    const submitBtn = form.querySelector('.form-submit-btn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;

    const nameVal = (form.querySelector('[name="full-name"]') || {}).value || 'there';
    const firstName = nameVal.trim().split(' ')[0];

    setTimeout(function () {
      // Show success state
      form.style.display = 'none';
      if (successPanel) {
        successPanel.querySelector('.success-name').textContent = firstName + '!';
        successPanel.classList.add('visible');
      }
    }, 900);
  });

})();
