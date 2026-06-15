/**
 * HealthStack Patient Portal
 * React 18 via esm.sh CDN -- no build step required.
 *
 * Views: login | services | slot-picker | checkout | confirmation | patient-dash | admin-dash
 */

import React, { useState, useEffect, useCallback, useRef } from 'https://esm.sh/react@18';
import { createRoot } from 'https://esm.sh/react-dom@18/client';
import {
  login as apiLogin,
  logout as apiLogout,
  getSession,
  getServices,
  bookSlot,
  checkout as apiCheckout,
  getPatientDashboard,
  getAdminDashboard,
  uploadFile,
} from './api.js';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function initials(name) {
  return name
    .split(' ')
    .map(p => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function stars(rating) {
  const full  = Math.floor(rating);
  const half  = rating - full >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
}

// ─── Header ──────────────────────────────────────────────────────────────────

function Header({ role, onLogout, onHome }) {
  return React.createElement('header', { className: 'header' },
    React.createElement('button', {
      className: 'header-logo',
      onClick: onHome,
      style: { background: 'none', border: 'none', cursor: 'pointer' },
    },
      React.createElement('span', { className: 'logo-icon' }, '🏥'),
      React.createElement('span', { className: 'logo-health' }, 'Health'),
      React.createElement('span', { className: 'logo-stack' }, 'Stack'),
    ),
    React.createElement('div', { className: 'header-right' },
      React.createElement('div', { className: 'tls-chip' },
        React.createElement('span', { className: 'tls-dot' }),
        'TLS 1.3',
      ),
      role && React.createElement('span', { className: `role-badge ${role}` }, role),
      role && React.createElement('button', { className: 'btn-logout', onClick: onLogout }, 'Log out'),
    ),
  );
}

// ─── Footer ──────────────────────────────────────────────────────────────────

function Footer() {
  return React.createElement('footer', { className: 'demo-footer' },
    React.createElement('span', { className: 'footer-chip' }, 'Demo: PHI handling follows minimum-necessary principle'),
    React.createElement('span', { className: 'footer-chip' }, 'HIPAA-aware patterns'),
    React.createElement('span', { className: 'footer-chip' }, 'Role-based JWT auth'),
  );
}

// ─── Login ───────────────────────────────────────────────────────────────────

function LoginPage({ onLogin }) {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  function fill(e, p) {
    setEmail(e);
    setPassword(p);
    setError('');
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await apiLogin(email.trim(), password);
      onLogin(data.role, data.name);
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return React.createElement('div', { className: 'login-wrap' },
    React.createElement('div', { className: 'login-card' },

      React.createElement('div', { className: 'login-logo' },
        React.createElement('span', null, '🏥'),
        React.createElement('span', null,
          React.createElement('span', { style: { color: 'var(--mustard)' } }, 'Health'),
          React.createElement('span', null, 'Stack'),
        ),
      ),
      React.createElement('p', { className: 'login-tagline' },
        'Secure patient portal  |  US Healthcare',
      ),

      // Demo credentials panel
      React.createElement('div', { className: 'demo-creds' },
        React.createElement('div', { className: 'demo-creds-label' }, 'Demo credentials (click to fill)'),

        React.createElement('div', { className: 'cred-row' },
          React.createElement('span', { className: 'cred-role-tag patient' }, 'Patient'),
          React.createElement('button', {
            className: 'cred-fill',
            onClick: () => fill('patient@healthstack.demo', 'DemoPatient123!'),
          }, 'patient@healthstack.demo  /  DemoPatient123!'),
        ),

        React.createElement('div', { className: 'cred-row' },
          React.createElement('span', { className: 'cred-role-tag admin' }, 'Admin'),
          React.createElement('button', {
            className: 'cred-fill',
            onClick: () => fill('admin@healthstack.demo', 'DemoAdmin123!'),
          }, 'admin@healthstack.demo  /  DemoAdmin123!'),
        ),
      ),

      React.createElement('form', { onSubmit: handleSubmit },
        React.createElement('div', { className: 'form-group' },
          React.createElement('label', { className: 'form-label', htmlFor: 'email' }, 'Email address'),
          React.createElement('input', {
            id: 'email',
            type: 'email',
            className: 'form-input',
            value: email,
            onChange: e => setEmail(e.target.value),
            placeholder: 'patient@healthstack.demo',
            required: true,
            autoComplete: 'email',
          }),
        ),

        React.createElement('div', { className: 'form-group' },
          React.createElement('label', { className: 'form-label', htmlFor: 'password' }, 'Password'),
          React.createElement('input', {
            id: 'password',
            type: 'password',
            className: 'form-input',
            value: password,
            onChange: e => setPassword(e.target.value),
            placeholder: '••••••••',
            required: true,
            autoComplete: 'current-password',
          }),
        ),

        React.createElement('button', {
          type: 'submit',
          className: 'btn-primary',
          disabled: loading || !email || !password,
        }, loading ? 'Signing in...' : 'Sign in securely'),

        error && React.createElement('div', { className: 'error-msg' }, error),
      ),
    ),
  );
}

// ─── Services browser ─────────────────────────────────────────────────────────

function ServicesPage({ onBook }) {
  const [providers, setProviders] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');

  useEffect(() => {
    getServices()
      .then(data => setProviders(data.providers || []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return React.createElement('div', { className: 'main-content' },
    React.createElement('div', { className: 'loading-wrap' },
      React.createElement('span', { className: 'spinner' }),
      'Loading providers...',
    ),
  );

  if (error) return React.createElement('div', { className: 'main-content' },
    React.createElement('div', { className: 'error-msg' }, error),
  );

  return React.createElement('div', { className: 'main-content' },
    React.createElement('div', { className: 'eyebrow', style: { marginBottom: 6 } }, 'Browse providers'),
    React.createElement('h1', { className: 'page-title' }, 'Find a Doctor'),
    React.createElement('p', { className: 'page-subtitle' },
      'Transparent pricing, instant booking. All providers accept telehealth visits.',
    ),

    React.createElement('div', { className: 'providers-grid' },
      providers.map(p =>
        React.createElement('article', { key: p.id, className: 'provider-card' },
          React.createElement('div', { className: 'provider-avatar' }, initials(p.name)),

          React.createElement('div', { className: 'provider-meta' },
            React.createElement('div', { className: 'provider-name' }, p.name),
            React.createElement('div', { className: 'provider-specialty' }, p.specialty),

            React.createElement('div', { className: 'provider-stats' },
              React.createElement('span', { className: 'price-chip' }, `$${p.price} / visit`),
              React.createElement('span', { className: 'rating-row' },
                React.createElement('span', { className: 'stars' }, stars(p.rating)),
                ` ${p.rating} (${p.reviews})`,
              ),
            ),
          ),

          React.createElement('button', {
            className: 'btn-book',
            onClick: () => onBook(p),
          }, 'Book Appointment'),
        )
      ),
    ),
  );
}

// ─── Slot picker ──────────────────────────────────────────────────────────────

function SlotPickerPage({ provider, onBack, onConfirm }) {
  const [selected, setSelected] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  async function handleConfirm() {
    if (!selected) return;
    setLoading(true);
    setError('');
    try {
      const booking = await bookSlot(provider.id, selected);
      onConfirm(booking);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return React.createElement('div', { className: 'main-content' },
    React.createElement('div', { className: 'slot-picker-wrap' },

      React.createElement('button', { className: 'back-btn', onClick: onBack },
        '← Back to providers',
      ),

      React.createElement('div', { className: 'eyebrow', style: { marginBottom: 6 } }, 'Choose a time'),
      React.createElement('h1', { className: 'page-title' }, 'Book Appointment'),

      React.createElement('div', { className: 'slot-provider-info' },
        React.createElement('div', { className: 'provider-avatar' }, initials(provider.name)),
        React.createElement('div', null,
          React.createElement('div', { className: 'provider-name' }, provider.name),
          React.createElement('div', { className: 'provider-specialty' }, provider.specialty),
          React.createElement('div', { className: 'price-chip', style: { display: 'inline-block', marginTop: 8 } }, `$${provider.price} / visit`),
        ),
      ),

      React.createElement('div', { className: 'eyebrow', style: { marginBottom: 12 } }, 'Available times'),
      React.createElement('div', { className: 'slots-grid' },
        provider.slots.map(slot =>
          React.createElement('button', {
            key: slot,
            className: `slot-btn${selected === slot ? ' selected' : ''}`,
            onClick: () => setSelected(slot),
          }, slot),
        ),
      ),

      error && React.createElement('div', { className: 'error-msg', style: { marginBottom: 16 } }, error),

      React.createElement('button', {
        className: 'btn-confirm',
        disabled: !selected || loading,
        onClick: handleConfirm,
      }, loading ? 'Booking...' : 'Confirm Appointment'),
    ),
  );
}

// ─── Checkout ─────────────────────────────────────────────────────────────────

function CheckoutPage({ booking, onBack, onPaid }) {
  const [cardNum,  setCardNum]  = useState('4242 4242 4242 4242');
  const [expiry,   setExpiry]   = useState('12/28');
  const [cvc,      setCvc]      = useState('123');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  async function handlePay() {
    setLoading(true);
    setError('');
    try {
      const last4  = cardNum.replace(/\s/g, '').slice(-4);
      const result = await apiCheckout(booking.booking_id, last4);
      onPaid(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return React.createElement('div', { className: 'main-content' },
    React.createElement('div', { className: 'checkout-wrap' },

      React.createElement('button', { className: 'back-btn', onClick: onBack },
        '← Change slot',
      ),

      React.createElement('div', { className: 'eyebrow', style: { marginBottom: 6 } }, 'Secure checkout'),
      React.createElement('h1', { className: 'page-title' }, 'Payment'),

      // Order summary
      React.createElement('div', { className: 'checkout-summary' },
        React.createElement('div', { className: 'checkout-summary-row' },
          React.createElement('span', null, 'Provider'),
          React.createElement('strong', null, booking.provider_name),
        ),
        React.createElement('div', { className: 'checkout-summary-row' },
          React.createElement('span', null, 'Appointment'),
          React.createElement('strong', null, booking.slot),
        ),
        React.createElement('div', { className: 'checkout-summary-row' },
          React.createElement('span', null, 'Specialty'),
          React.createElement('strong', null, booking.specialty),
        ),
        React.createElement('div', { className: 'checkout-summary-row' },
          React.createElement('span', null, 'Total'),
          React.createElement('strong', { style: { color: 'var(--mustard)', fontSize: 16 } }, `$${booking.price}.00`),
        ),
      ),

      // Mock card form
      React.createElement('div', { className: 'card-mock' },
        React.createElement('div', { className: 'card-mock-label' }, 'Payment details (Stripe-powered)'),
        React.createElement('div', { className: 'card-fields' },
          React.createElement('input', {
            className: 'form-input',
            value: cardNum,
            onChange: e => setCardNum(e.target.value),
            placeholder: 'Card number',
            maxLength: 19,
          }),
          React.createElement('div', { className: 'card-row' },
            React.createElement('input', {
              className: 'form-input',
              value: expiry,
              onChange: e => setExpiry(e.target.value),
              placeholder: 'MM/YY',
              maxLength: 5,
            }),
            React.createElement('input', {
              className: 'form-input',
              value: cvc,
              onChange: e => setCvc(e.target.value),
              placeholder: 'CVC',
              maxLength: 3,
            }),
          ),
        ),
        React.createElement('div', { className: 'stripe-note' },
          '🔒 Payments processed by Stripe. Card data never touches our servers.',
        ),
      ),

      error && React.createElement('div', { className: 'error-msg', style: { marginBottom: 16 } }, error),

      React.createElement('button', {
        className: 'btn-primary',
        style: { marginTop: 0 },
        disabled: loading,
        onClick: handlePay,
      }, loading ? 'Processing...' : `Pay $${booking.price}.00`),

      React.createElement('p', { className: 'phi-footer', style: { marginTop: 16 } },
        'Demo: PHI handling follows minimum-necessary principle',
      ),
    ),
  );
}

// ─── Confirmation ─────────────────────────────────────────────────────────────

function ConfirmationPage({ payment, onDash, onBrowse }) {
  return React.createElement('div', { className: 'main-content' },
    React.createElement('div', { className: 'confirmation-wrap' },

      React.createElement('div', { className: 'confirm-check' }, '✓'),

      React.createElement('div', { className: 'eyebrow', style: { marginBottom: 6 } }, 'Booking confirmed'),
      React.createElement('h1', { className: 'page-title' }, 'You\'re all set!'),
      React.createElement('p', { className: 'page-subtitle' },
        'A confirmation has been sent to your email. See you at your appointment.',
      ),

      React.createElement('div', { className: 'confirm-card' },
        React.createElement('div', { className: 'confirm-row' },
          React.createElement('span', { className: 'label' }, 'Provider'),
          React.createElement('span', { className: 'value' }, payment.provider_name),
        ),
        React.createElement('div', { className: 'confirm-row' },
          React.createElement('span', { className: 'label' }, 'Appointment'),
          React.createElement('span', { className: 'value' }, payment.slot),
        ),
        React.createElement('div', { className: 'confirm-row' },
          React.createElement('span', { className: 'label' }, 'Amount paid'),
          React.createElement('span', { className: 'value' }, `$${payment.amount}.00`),
        ),
        React.createElement('div', { className: 'confirm-row' },
          React.createElement('span', { className: 'label' }, 'Card'),
          React.createElement('span', { className: 'value' }, `ending ${payment.card_last4}`),
        ),
        React.createElement('div', { className: 'confirm-row' },
          React.createElement('span', { className: 'label' }, 'Payment status'),
          React.createElement('span', { className: 'pi-chip' }, payment.status),
        ),
        React.createElement('div', { className: 'confirm-row' },
          React.createElement('span', { className: 'label' }, 'Payment intent'),
          React.createElement('span', { className: 'value mono', style: { fontFamily: 'var(--font-mono)', fontSize: 12 } }, payment.payment_intent_id),
        ),
      ),

      React.createElement('div', { style: { display: 'flex', gap: 12 } },
        React.createElement('button', { className: 'btn-ghost', onClick: onBrowse }, 'Book another'),
        React.createElement('button', { className: 'btn-primary', style: { flex: 1, marginTop: 0 }, onClick: onDash }, 'View my dashboard'),
      ),
    ),
  );
}

// ─── Patient dashboard ────────────────────────────────────────────────────────

function PatientDashboard({ onBrowse }) {
  const [data,      setData]      = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');
  const [activeTab, setActiveTab] = useState('bookings');
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState('');
  const fileRef = useRef(null);

  useEffect(() => {
    getPatientDashboard()
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleUpload(ev) {
    const file = ev.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadMsg('');
    try {
      const res = await uploadFile(file);
      setUploadMsg(`Uploaded: ${res.filename} (ID: ${res.file_id})`);
    } catch (err) {
      setUploadMsg(`Error: ${err.message}`);
    } finally {
      setUploading(false);
    }
  }

  if (loading) return React.createElement('div', { className: 'main-content' },
    React.createElement('div', { className: 'loading-wrap' },
      React.createElement('span', { className: 'spinner' }),
      'Loading your dashboard...',
    ),
  );

  if (error) return React.createElement('div', { className: 'main-content' },
    React.createElement('div', { className: 'error-msg' }, error),
  );

  const bookings = data?.bookings || [];

  return React.createElement('div', { className: 'main-content' },
    React.createElement('div', { className: 'eyebrow', style: { marginBottom: 6 } }, 'Patient portal'),
    React.createElement('h1', { className: 'page-title' }, 'My Dashboard'),
    React.createElement('p', { className: 'page-subtitle' }, 'Manage your appointments and health records.'),

    // Tabs
    React.createElement('nav', { className: 'dash-nav' },
      React.createElement('button', {
        className: `dash-tab${activeTab === 'bookings' ? ' active' : ''}`,
        onClick: () => setActiveTab('bookings'),
      }, `Appointments (${bookings.length})`),
      React.createElement('button', {
        className: `dash-tab${activeTab === 'upload' ? ' active' : ''}`,
        onClick: () => setActiveTab('upload'),
      }, 'Health Records'),
    ),

    // Bookings tab
    activeTab === 'bookings' && React.createElement('div', null,
      bookings.length === 0
        ? React.createElement('div', { className: 'empty-state' },
            React.createElement('div', { className: 'empty-state-icon' }, '📅'),
            React.createElement('p', null, 'No appointments yet.'),
            React.createElement('button', {
              className: 'btn-primary',
              style: { marginTop: 16, width: 'auto', padding: '10px 24px' },
              onClick: onBrowse,
            }, 'Browse providers'),
          )
        : React.createElement('div', null,
            bookings.map(b =>
              React.createElement('div', { key: b.id, className: 'booking-card' },
                React.createElement('div', { className: 'booking-header' },
                  React.createElement('div', null,
                    React.createElement('div', { className: 'booking-provider' }, b.provider_name),
                    React.createElement('div', { className: 'booking-specialty' }, b.specialty),
                  ),
                  React.createElement('span', {
                    className: `status-chip ${(b.status || '').toLowerCase()}`,
                  }, b.status),
                ),
                React.createElement('div', { className: 'booking-details' },
                  React.createElement('span', null, React.createElement('strong', null, 'Time: '), b.slot),
                  React.createElement('span', null, React.createElement('strong', null, 'Price: '), `$${b.price}`),
                  React.createElement('span', null, React.createElement('strong', null, 'ID: '),
                    React.createElement('span', { style: { fontFamily: 'var(--font-mono)', fontSize: 12 } }, b.id),
                  ),
                ),
              ),
            ),
            React.createElement('button', {
              className: 'btn-primary',
              style: { marginTop: 20, width: 'auto', padding: '10px 24px' },
              onClick: onBrowse,
            }, '+ Book another appointment'),
          ),
    ),

    // Upload tab
    activeTab === 'upload' && React.createElement('div', { className: 'upload-section' },
      React.createElement('div', { className: 'upload-icon' }, '📎'),
      React.createElement('div', { className: 'upload-title' }, 'Upload Health Records'),
      React.createElement('p', { className: 'upload-desc' },
        'Securely upload intake forms, insurance cards, or prior medical records. Files are encrypted at rest and accessible only to your care team.',
      ),
      React.createElement('input', {
        ref: fileRef,
        type: 'file',
        style: { display: 'none' },
        accept: '.pdf,.jpg,.jpeg,.png,.doc,.docx',
        onChange: handleUpload,
      }),
      React.createElement('button', {
        className: 'btn-upload',
        disabled: uploading,
        onClick: () => fileRef.current?.click(),
      }, uploading ? 'Uploading...' : 'Choose file'),

      uploadMsg && React.createElement('div', {
        className: uploadMsg.startsWith('Error') ? 'error-msg' : 'upload-success',
        style: { display: 'block', marginTop: 12 },
      }, uploadMsg.startsWith('Error')
          ? uploadMsg
          : React.createElement('span', { className: 'upload-success' }, `✓ ${uploadMsg}`),
      ),

      React.createElement('p', { className: 'phi-footer', style: { marginTop: 20 } },
        'PHI minimized: only the minimum necessary information is stored.',
      ),
    ),
  );
}

// ─── Admin dashboard ──────────────────────────────────────────────────────────

function AdminDashboard() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    getAdminDashboard()
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return React.createElement('div', { className: 'main-content' },
    React.createElement('div', { className: 'loading-wrap' },
      React.createElement('span', { className: 'spinner' }),
      'Loading admin dashboard...',
    ),
  );

  if (error) return React.createElement('div', { className: 'main-content' },
    React.createElement('div', { className: 'error-msg' }, error),
  );

  const bookings  = data?.bookings   || [];
  const auditLog  = data?.audit_log  || [];
  const patients  = data?.patients   || [];

  return React.createElement('div', { className: 'main-content' },
    React.createElement('div', { className: 'eyebrow', style: { marginBottom: 6 } }, 'Admin console'),
    React.createElement('h1', { className: 'page-title' }, 'Admin Dashboard'),
    React.createElement('p', { className: 'page-subtitle' }, 'All booking activity and audit trail.'),

    // Stats
    React.createElement('div', { className: 'admin-stats' },
      React.createElement('div', { className: 'stat-card' },
        React.createElement('div', { className: 'stat-label' }, 'Total Bookings'),
        React.createElement('div', { className: 'stat-value' }, data?.total_bookings ?? 0),
      ),
      React.createElement('div', { className: 'stat-card' },
        React.createElement('div', { className: 'stat-label' }, 'Unique Patients'),
        React.createElement('div', { className: 'stat-value' }, data?.total_patients ?? 0),
      ),
      React.createElement('div', { className: 'stat-card' },
        React.createElement('div', { className: 'stat-label' }, 'Audit Events'),
        React.createElement('div', { className: 'stat-value' }, auditLog.length),
      ),
    ),

    // Side-by-side panels
    React.createElement('div', { className: 'admin-sections' },

      // Audit log
      React.createElement('div', { className: 'admin-panel' },
        React.createElement('div', { className: 'admin-panel-header' },
          React.createElement('span', { className: 'admin-panel-title' }, 'Audit Log'),
          React.createElement('span', { className: 'phi-badge' }, 'HIPAA-aware'),
        ),
        React.createElement('ul', { className: 'audit-list' },
          auditLog.map((entry, i) =>
            React.createElement('li', { key: i, className: 'audit-item' },
              React.createElement('span', { className: 'audit-ts' }, entry.ts),
              React.createElement('span', { className: 'audit-evt' }, entry.event),
            ),
          ),
        ),
      ),

      // Patient roster (PHI minimized)
      React.createElement('div', { className: 'admin-panel' },
        React.createElement('div', { className: 'admin-panel-header' },
          React.createElement('span', { className: 'admin-panel-title' }, 'Patient Roster'),
          React.createElement('span', { className: 'phi-badge' }, 'PHI Minimized'),
        ),
        React.createElement('table', { className: 'roster-table' },
          React.createElement('thead', null,
            React.createElement('tr', null,
              React.createElement('th', null, 'Initials'),
              React.createElement('th', null, 'Specialty'),
              React.createElement('th', null, 'Last Visit'),
            ),
          ),
          React.createElement('tbody', null,
            patients.map((p, i) =>
              React.createElement('tr', { key: i },
                React.createElement('td', { className: 'initials-cell' }, p.initials),
                React.createElement('td', null, p.specialty),
                React.createElement('td', null, p.last_visit),
              ),
            ),
          ),
        ),
      ),
    ),

    // All bookings table
    React.createElement('div', { className: 'admin-panel bookings-panel' },
      React.createElement('div', { className: 'admin-panel-header' },
        React.createElement('span', { className: 'admin-panel-title' }, `All Bookings (${bookings.length})`),
      ),
      React.createElement('div', { style: { overflowX: 'auto' } },
        React.createElement('table', { className: 'bookings-table' },
          React.createElement('thead', null,
            React.createElement('tr', null,
              React.createElement('th', null, 'ID'),
              React.createElement('th', null, 'Patient'),
              React.createElement('th', null, 'Provider'),
              React.createElement('th', null, 'Slot'),
              React.createElement('th', null, 'Price'),
              React.createElement('th', null, 'Status'),
            ),
          ),
          React.createElement('tbody', null,
            bookings.map(b =>
              React.createElement('tr', { key: b.id },
                React.createElement('td', { className: 'mono-cell' }, b.id),
                React.createElement('td', null, b.patient_email),
                React.createElement('td', null, b.provider_name),
                React.createElement('td', null, b.slot),
                React.createElement('td', null, `$${b.price}`),
                React.createElement('td', null,
                  React.createElement('span', {
                    className: `status-chip ${(b.status || '').toLowerCase()}`,
                  }, b.status),
                ),
              ),
            ),
          ),
        ),
      ),
    ),
  );
}

// ─── Root App ──────────────────────────────────────────────────────────────────

function App() {
  // Restore session on mount
  const session = getSession();

  const [view,      setView]      = useState(session ? (session.role === 'admin' ? 'admin-dash' : 'patient-dash') : 'login');
  const [role,      setRole]      = useState(session?.role  || null);
  const [booking,   setBooking]   = useState(null);  // booking result from /book
  const [payment,   setPayment]   = useState(null);  // payment result from /checkout
  const [provider,  setProvider]  = useState(null);  // selected provider

  function handleLogin(newRole) {
    setRole(newRole);
    setView(newRole === 'admin' ? 'admin-dash' : 'patient-dash');
  }

  function handleLogout() {
    apiLogout();
    setRole(null);
    setView('login');
    setBooking(null);
    setPayment(null);
    setProvider(null);
  }

  function handleSelectProvider(p) {
    setProvider(p);
    setView('slot-picker');
  }

  function handleBookingConfirmed(bookingResult) {
    setBooking(bookingResult);
    setView('checkout');
  }

  function handlePaymentComplete(paymentResult) {
    setPayment(paymentResult);
    setView('confirmation');
  }

  function handleHome() {
    if (!role) return setView('login');
    setView(role === 'admin' ? 'admin-dash' : 'patient-dash');
  }

  return React.createElement('div', { className: 'app-shell' },
    view !== 'login' && React.createElement(Header, { role, onLogout: handleLogout, onHome: handleHome }),

    view === 'login' && React.createElement(LoginPage, { onLogin: handleLogin }),

    view === 'services' && React.createElement(ServicesPage, {
      onBook: handleSelectProvider,
    }),

    view === 'slot-picker' && provider && React.createElement(SlotPickerPage, {
      provider,
      onBack:    () => setView('services'),
      onConfirm: handleBookingConfirmed,
    }),

    view === 'checkout' && booking && React.createElement(CheckoutPage, {
      booking,
      onBack: () => setView('slot-picker'),
      onPaid: handlePaymentComplete,
    }),

    view === 'confirmation' && payment && React.createElement(ConfirmationPage, {
      payment,
      onDash:   () => setView('patient-dash'),
      onBrowse: () => setView('services'),
    }),

    view === 'patient-dash' && React.createElement(PatientDashboard, {
      onBrowse: () => setView('services'),
    }),

    view === 'admin-dash' && React.createElement(AdminDashboard, {}),

    view !== 'login' && React.createElement(Footer),
  );
}

// ─── Mount ────────────────────────────────────────────────────────────────────

const root = createRoot(document.getElementById('root'));
root.render(React.createElement(App));
