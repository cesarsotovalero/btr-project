/**
 * BTR — Theme Manager (dark / light mode)
 */
const ThemeManager = (() => {
  const STORAGE_KEY = 'btr-theme';

  function getPreferred() {
    // If user is logged in, use their server-side preference
    const user = Auth.getUser();
    if (user && user.theme_preference) return user.theme_preference;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'dark' || stored === 'light') return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function apply(mode) {
    document.documentElement.setAttribute('data-theme', mode);
    const gdsTheme = document.querySelector('gds-theme');
    if (gdsTheme) gdsTheme.setAttribute('color-scheme', mode);
  }

  function setMode(mode) {
    localStorage.setItem(STORAGE_KEY, mode);
    apply(mode);
    // Persist to server if logged in
    if (Auth.isLoggedIn()) {
      Auth.updateProfile({ theme_preference: mode }).catch(() => {});
    }
    // Re-render current page so charts pick up the new theme
    refreshCharts();
    // Update the dropdown toggle text
    UserMenu.updateThemeUI();
  }

  function toggle() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    setMode(next);
  }

  function refreshCharts() {
    if (typeof App !== 'undefined' && App.navigate) {
      App.navigate();
    }
  }

  function isDark() {
    return document.documentElement.getAttribute('data-theme') === 'dark';
  }

  function init() {
    const mode = getPreferred();
    apply(mode);

    // Listen for system preference changes (only if no stored preference)
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem(STORAGE_KEY)) {
        apply(e.matches ? 'dark' : 'light');
      }
    });
  }

  return { init, toggle, isDark, setMode };
})();

/**
 * BTR — User Menu (top-right dropdown)
 */
const UserMenu = (() => {
  function inject() {
    const container = document.getElementById('user-menu-container');
    if (!container) return;

    if (!Auth.isLoggedIn()) {
      container.innerHTML = '';
      return;
    }

    const user = Auth.getUser();
    const name = user?.full_name || user?.username || 'User';
    const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    const isDark = ThemeManager.isDark();

    container.innerHTML = `
      <div class="user-menu">
        <button class="user-menu-btn" id="user-menu-btn" aria-haspopup="true" aria-expanded="false">
          <span class="user-avatar">${initials}</span>
          <span class="user-name">${name}</span>
          <span class="user-caret"><i class="fa-solid fa-chevron-down"></i></span>
        </button>
        <div class="user-dropdown" id="user-dropdown">
          <div class="dropdown-header">
            <span class="dropdown-user-name">${name}</span>
            <span class="dropdown-user-email">${user?.email || ''}</span>
          </div>
          <div class="dropdown-divider"></div>
          <button class="dropdown-item" id="theme-toggle-dropdown">
            <span class="dropdown-icon">${isDark ? '<i class="fa-solid fa-moon"></i>' : '<i class="fa-solid fa-sun"></i>'}</span>
            <span>Theme: <strong id="theme-mode-label">${isDark ? 'Dark' : 'Light'}</strong></span>
          </button>
          <div class="dropdown-divider"></div>
          <button class="dropdown-item dropdown-item-danger" id="logout-btn">
            <span class="dropdown-icon"><i class="fa-solid fa-right-from-bracket"></i></span>
            <span>Sign Out</span>
          </button>
        </div>
      </div>`;

    // Toggle dropdown
    const btn = container.querySelector('#user-menu-btn');
    const dropdown = container.querySelector('#user-dropdown');

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = dropdown.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(open));
    });

    // Close on click outside — use a single handler, remove old one first
    if (UserMenu._closeHandler) {
      document.removeEventListener('click', UserMenu._closeHandler);
    }
    UserMenu._closeHandler = () => {
      dropdown.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    };
    document.addEventListener('click', UserMenu._closeHandler);

    // Theme toggle
    container.querySelector('#theme-toggle-dropdown').addEventListener('click', (e) => {
      e.stopPropagation();
      ThemeManager.toggle();
    });

    // Logout
    container.querySelector('#logout-btn').addEventListener('click', () => {
      Auth.logout();
    });
  }

  function updateThemeUI() {
    const label = document.getElementById('theme-mode-label');
    const icon = document.querySelector('#theme-toggle-dropdown .dropdown-icon');
    if (label) label.textContent = ThemeManager.isDark() ? 'Dark' : 'Light';
    if (icon) icon.innerHTML = ThemeManager.isDark() ? '<i class="fa-solid fa-moon"></i>' : '<i class="fa-solid fa-sun"></i>';
  }

  return { inject, updateThemeUI };
})();

/**
 * BTR — SPA Router & App Bootstrap
 */
const App = (() => {
  const appEl = () => document.getElementById('app');

  /* ---- Routes ---- */
  const routes = [
    { pattern: /^#\/login$/,                                    handler: () => LoginPage.render(appEl()), public: true },
    { pattern: /^#?\/?$/,                                       handler: () => CaseListPage.render(appEl()) },
    { pattern: /^#\/cases\/([^/]+)\/documents\/([^/]+)$/,       handler: (m) => DocumentIntelligencePage.render(appEl(), m[1], m[2]) },
    { pattern: /^#\/cases\/([^/]+)\/compliance$/,               handler: (m) => ComplianceDashboardPage.render(appEl(), m[1]) },
    { pattern: /^#\/cases\/([^/]+)\/risk$/,                     handler: (m) => RiskWorkspacePage.render(appEl(), m[1]) },
    { pattern: /^#\/cases\/([^/]+)\/audit$/,                    handler: (m) => AuditTracePage.render(appEl(), m[1]) },
    { pattern: /^#\/cases\/([^/]+)$/,                           handler: (m) => CaseDetailPage.render(appEl(), m[1]) },
    { pattern: /^#\/references$/,                               handler: () => renderReferencesPage() },
  ];

  function navigate() {
    const hash = window.location.hash || '#/';

    // Find matching route
    let matchedRoute = null;
    let matchResult = null;
    for (const route of routes) {
      const m = hash.match(route.pattern);
      if (m) { matchedRoute = route; matchResult = m; break; }
    }

    // Auth guard — redirect to login if not authenticated (skip public routes)
    if (!matchedRoute?.public && !Auth.isLoggedIn()) {
      window.location.hash = '#/login';
      return;
    }

    // Update chrome
    updateActiveNav(hash);
    updateTopbar();
    Components.disposeCharts();
    ChatBot.onNavigate();

    if (matchedRoute) {
      matchedRoute.handler(matchResult);
      return;
    }

    // 404
    appEl().innerHTML = `
      <div class="empty-state">
        <div class="empty-icon"><i class="fa-solid fa-link-slash"></i></div>
        <p>Page not found.</p>
        <a href="#/" class="mt-16" style="display:inline-block"><button class="btn btn-primary">Go to Cases</button></a>
      </div>`;
  }

  function updateTopbar() {
    const topbar = document.querySelector('.topbar');
    const nav = document.getElementById('main-nav');
    if (Auth.isLoggedIn()) {
      if (topbar) topbar.style.display = '';
      if (nav) nav.style.display = '';
      UserMenu.inject();
    } else {
      if (nav) nav.style.display = 'none';
      const userContainer = document.getElementById('user-menu-container');
      if (userContainer) userContainer.innerHTML = '';
    }
  }

  function updateActiveNav(hash) {
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('active');
      const href = link.getAttribute('href');
      if (href === '#/') {
        // Cases link: active on home and all /cases/* routes
        if (hash === '#/' || hash.startsWith('#/cases')) link.classList.add('active');
      } else if (hash.startsWith(href)) {
        link.classList.add('active');
      }
    });
  }

  /* ---- References page (CRUD + toggle) ---- */

  // Shared state for loaded reference data
  let _refsState = { regulations: [], historicalCases: [], activeTab: 'regulations' };

  async function renderReferencesPage() {
    const el = appEl();
    el.innerHTML = '<div class="page-loading"><gds-spinner></gds-spinner><p>Loading references…</p></div>';
    await _refreshReferences(el);
  }

  async function _refreshReferences(el) {
    el = el || appEl();
    try {
      const [regsData, hcData] = await Promise.all([
        API.listRegulations(),
        API.listHistoricalCases(),
      ]);
      _refsState.regulations = regsData.regulations || [];
      _refsState.historicalCases = hcData.cases || [];

      el.innerHTML = `
        <div class="page-header">
          <h1>Reference Data</h1>
        </div>

        <div class="tabs" id="ref-tabs">
          <button class="tab ${_refsState.activeTab === 'regulations' ? 'active' : ''}" data-tab="regulations">
            Regulations (${_refsState.regulations.length})
          </button>
          <button class="tab ${_refsState.activeTab === 'historical' ? 'active' : ''}" data-tab="historical">
            Historical Cases (${_refsState.historicalCases.length})
          </button>
        </div>

        <div id="ref-content"></div>`;

      const tabs = el.querySelectorAll('.tab');
      tabs.forEach(tab => tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        _refsState.activeTab = tab.dataset.tab;
        _renderRefTab();
      }));

      _renderRefTab();
    } catch (err) {
      el.innerHTML = `<div class="empty-state text-severe">Error: ${err.message}</div>`;
    }
  }

  function _renderRefTab() {
    const el = document.getElementById('ref-content');
    const tab = _refsState.activeTab;

    if (tab === 'regulations') {
      const regs = _refsState.regulations;
      el.innerHTML = `
        <div class="card" style="margin-top: 1rem;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
            <h3 style="margin:0;">Regulation Sources</h3>
            <button class="btn btn-primary btn-sm" id="btn-add-reg">
              <i class="fa-solid fa-plus" style="margin-right:6px;"></i> Add Regulation
            </button>
          </div>

          ${regs.length === 0 ? '<div class="empty-state"><p>No regulations loaded. Add one or run seed data.</p></div>' : `
          <table class="data-table">
            <thead><tr><th>Name</th><th>Type</th><th>Version</th><th>PDF</th><th>Status</th><th style="width:140px;">Actions</th></tr></thead>
            <tbody>
              ${regs.map(r => `<tr>
                <td class="fw-600">${_esc(r.source_name)}</td>
                <td>${_esc(r.source_type)}</td>
                <td class="mono">${r.version || '—'}</td>
                <td>${r.pdf_path
                  ? '<i class="fa-solid fa-file-pdf" style="color:var(--gds-sys-color-error, #f03529);" title="PDF attached"></i>'
                  : '<span class="text-muted">—</span>'}</td>
                <td>${r.active
                  ? '<span class="chip chip-ok">active</span>'
                  : '<span class="chip chip-error">inactive</span>'}</td>
                <td>
                  <button class="btn btn-sm btn-toggle-reg" data-id="${r.id}" data-active="${r.active}" style="background:transparent;color:var(--text-secondary);" title="${r.active ? 'Deactivate' : 'Activate'}">
                    <i class="fa-solid ${r.active ? 'fa-toggle-on' : 'fa-toggle-off'}"></i>
                  </button>
                  <button class="btn btn-sm btn-del-reg" data-id="${r.id}" style="background:transparent;color:var(--gds-sys-color-error, #f03529);">
                    <i class="fa-solid fa-trash-can"></i>
                  </button>
                </td>
              </tr>`).join('')}
            </tbody>
          </table>`}
        </div>`;

      document.getElementById('btn-add-reg')?.addEventListener('click', () => _showAddRegulationModal());
      el.querySelectorAll('.btn-toggle-reg').forEach(btn => btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        const newActive = btn.dataset.active === 'true' ? false : true;
        await API.toggleRegulation(id, newActive);
        await _refreshReferences();
      }));
      el.querySelectorAll('.btn-del-reg').forEach(btn => btn.addEventListener('click', async () => {
        if (!confirm('Delete this regulation?')) return;
        await API.deleteRegulation(btn.dataset.id);
        await _refreshReferences();
      }));
    }

    if (tab === 'historical') {
      const cases = _refsState.historicalCases;
      el.innerHTML = `
        <div class="card" style="margin-top: 1rem;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
            <h3 style="margin:0;">Historical Cases</h3>
            <button class="btn btn-primary btn-sm" id="btn-add-hc">
              <i class="fa-solid fa-plus" style="margin-right:6px;"></i> Add Historical Case
            </button>
          </div>

          ${cases.length === 0 ? '<div class="empty-state"><p>No historical cases. Add one or run seed data.</p></div>' : `
          <table class="data-table">
            <thead><tr><th>Company</th><th>Sector</th><th>Country</th><th>Risk Class</th><th>Outcome</th><th>Status</th><th style="width:140px;">Actions</th></tr></thead>
            <tbody>
              ${cases.map(c => `<tr>
                <td class="fw-600">${_esc(c.company_name)}</td>
                <td>${_esc(c.sector || '—')}</td>
                <td>${_esc(c.country || '—')}</td>
                <td>${c.final_risk_class ? Components.riskBadge(c.final_risk_class) : '—'}</td>
                <td>${_esc(c.outcome || '—')}</td>
                <td>${c.active
                  ? '<span class="chip chip-ok">active</span>'
                  : '<span class="chip chip-error">inactive</span>'}</td>
                <td>
                  <button class="btn btn-sm btn-toggle-hc" data-id="${c.id}" data-active="${c.active}" style="background:transparent;color:var(--text-secondary);" title="${c.active ? 'Deactivate' : 'Activate'}">
                    <i class="fa-solid ${c.active ? 'fa-toggle-on' : 'fa-toggle-off'}"></i>
                  </button>
                  <button class="btn btn-sm btn-del-hc" data-id="${c.id}" style="background:transparent;color:var(--gds-sys-color-error, #f03529);">
                    <i class="fa-solid fa-trash-can"></i>
                  </button>
                </td>
              </tr>`).join('')}
            </tbody>
          </table>`}
        </div>`;

      document.getElementById('btn-add-hc')?.addEventListener('click', () => _showAddHistoricalModal());
      el.querySelectorAll('.btn-toggle-hc').forEach(btn => btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        const newActive = btn.dataset.active === 'true' ? false : true;
        await API.toggleHistoricalCase(id, newActive);
        await _refreshReferences();
      }));
      el.querySelectorAll('.btn-del-hc').forEach(btn => btn.addEventListener('click', async () => {
        if (!confirm('Delete this historical case?')) return;
        await API.deleteHistoricalCase(btn.dataset.id);
        await _refreshReferences();
      }));
    }
  }

  /** Simple HTML-escape */
  function _esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

  function _showAddRegulationModal() {
    _removeModal();
    const overlay = document.createElement('div');
    overlay.id = 'ref-modal-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:9000;display:flex;align-items:center;justify-content:center;';
    overlay.innerHTML = `
      <div style="background:var(--bg-card);border-radius:12px;padding:2rem;width:480px;max-width:95vw;box-shadow:0 8px 32px rgba(0,0,0,.2);">
        <h2 style="margin-top:0;">Add Regulation</h2>
        <form id="form-add-reg" style="display:flex;flex-direction:column;gap:.75rem;">
          <label>Name *<input type="text" name="source_name" required class="form-input" /></label>
          <label>Type *
            <select name="source_type" required class="form-input">
              <option value="regulation">Regulation</option>
              <option value="directive">Directive</option>
              <option value="guideline">Guideline</option>
              <option value="standard">Standard</option>
            </select>
          </label>
          <label>Version<input type="text" name="version" class="form-input" /></label>
          <label>Reference URL<input type="text" name="content_reference" class="form-input" /></label>
          <label>Content / Description<textarea name="content_text" rows="3" class="form-input"></textarea></label>
          <label>
            <span style="display:flex;align-items:center;gap:6px;">
              <i class="fa-solid fa-file-pdf" style="color:var(--gds-sys-color-error, #f03529);"></i>
              Upload PDF <span class="text-muted" style="font-weight:normal;">(optional)</span>
            </span>
            <input type="file" name="pdf_file" accept=".pdf" class="form-input" style="padding:6px;" />
          </label>
          <div style="display:flex;gap:.5rem;justify-content:flex-end;margin-top:.5rem;">
            <button class="btn btn-secondary" type="button" id="cancel-reg-modal">Cancel</button>
            <button class="btn btn-primary" type="submit">Create</button>
          </div>
        </form>
      </div>`;
    document.body.appendChild(overlay);

    overlay.addEventListener('click', e => { if (e.target === overlay) _removeModal(); });
    document.getElementById('cancel-reg-modal').addEventListener('click', _removeModal);
    document.getElementById('form-add-reg').addEventListener('submit', async e => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const pdfFile = fd.get('pdf_file');
      if (pdfFile && pdfFile.size > 0) {
        // Use multipart upload endpoint
        const uploadForm = new FormData();
        uploadForm.append('source_name', fd.get('source_name'));
        uploadForm.append('source_type', fd.get('source_type'));
        if (fd.get('version')) uploadForm.append('version', fd.get('version'));
        if (fd.get('content_reference')) uploadForm.append('content_reference', fd.get('content_reference'));
        if (fd.get('content_text')) uploadForm.append('content_text', fd.get('content_text'));
        uploadForm.append('file', pdfFile);
        await API.createRegulationWithPdf(uploadForm);
      } else {
        await API.createRegulation({
          source_name: fd.get('source_name'),
          source_type: fd.get('source_type'),
          version: fd.get('version') || null,
          content_reference: fd.get('content_reference') || null,
          content_text: fd.get('content_text') || null,
        });
      }
      _removeModal();
      await _refreshReferences();
    });
  }

  function _showAddHistoricalModal() {
    _removeModal();
    const overlay = document.createElement('div');
    overlay.id = 'ref-modal-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:9000;display:flex;align-items:center;justify-content:center;';
    overlay.innerHTML = `
      <div style="background:var(--bg-card);border-radius:12px;padding:2rem;width:520px;max-width:95vw;box-shadow:0 8px 32px rgba(0,0,0,.2);">
        <h2 style="margin-top:0;">Add Historical Case</h2>
        <form id="form-add-hc" style="display:flex;flex-direction:column;gap:.75rem;">
          <label>Company Name *<input type="text" name="company_name" required class="form-input" /></label>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:.75rem;">
            <label>Sector<input type="text" name="sector" class="form-input" /></label>
            <label>Country<input type="text" name="country" class="form-input" /></label>
            <label>Revenue Band
              <select name="revenue_band" class="form-input">
                <option value="">—</option>
                <option value="<10M">&lt;10M</option>
                <option value="10-50M">10-50M</option>
                <option value="50-200M">50-200M</option>
                <option value="200M-1B">200M-1B</option>
                <option value=">1B">&gt;1B</option>
              </select>
            </label>
            <label>Debt Profile
              <select name="debt_profile" class="form-input">
                <option value="">—</option>
                <option value="low">Low</option>
                <option value="moderate">Moderate</option>
                <option value="high">High</option>
                <option value="very_high">Very High</option>
              </select>
            </label>
            <label>Risk Class
              <select name="final_risk_class" class="form-input">
                <option value="">—</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </label>
            <label>Outcome
              <select name="outcome" class="form-input">
                <option value="">—</option>
                <option value="approved">Approved</option>
                <option value="declined">Declined</option>
                <option value="conditional_approval">Conditional Approval</option>
                <option value="restructured">Restructured</option>
              </select>
            </label>
          </div>
          <label>Decision Notes<textarea name="decision_notes" rows="3" class="form-input"></textarea></label>
          <div style="display:flex;gap:.5rem;justify-content:flex-end;margin-top:.5rem;">
            <button class="btn btn-secondary" type="button" id="cancel-hc-modal">Cancel</button>
            <button class="btn btn-primary" type="submit">Create</button>
          </div>
        </form>
      </div>`;
    document.body.appendChild(overlay);

    overlay.addEventListener('click', e => { if (e.target === overlay) _removeModal(); });
    document.getElementById('cancel-hc-modal').addEventListener('click', _removeModal);
    document.getElementById('form-add-hc').addEventListener('submit', async e => {
      e.preventDefault();
      const fd = new FormData(e.target);
      await API.createHistoricalCase({
        company_name: fd.get('company_name'),
        sector: fd.get('sector') || null,
        country: fd.get('country') || null,
        revenue_band: fd.get('revenue_band') || null,
        debt_profile: fd.get('debt_profile') || null,
        outcome: fd.get('outcome') || null,
        final_risk_class: fd.get('final_risk_class') || null,
        decision_notes: fd.get('decision_notes') || null,
      });
      _removeModal();
      await _refreshReferences();
    });
  }

  function _removeModal() {
    document.getElementById('ref-modal-overlay')?.remove();
  }

  /* ---- Init ---- */
  function init() {
    ThemeManager.init();
    ChatBot.inject();
    window.addEventListener('hashchange', navigate);
    navigate();  // auth guard inside will handle redirect if needed
  }

  // Boot
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return { navigate };
})();
