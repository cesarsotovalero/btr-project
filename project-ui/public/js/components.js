/**
 * BTR — Shared UI components (SEB Green Design System)
 */
const Components = (() => {

  /* ---- Status chip (colored pill) ---- */
  function statusChip(status) {
    const map = {
      created:              'info',
      new:                  'info',
      uploaded:             'info',
      processing:           'notice',
      parsing:              'notice',
      analyzing:            'notice',
      pending:              'notice',
      running:              'notice',
      checkpoint_pending:   'warning',
      checkpoint_rejected:  'danger',
      review_ready:         'success',
      approved:             'success',
      completed:            'success',
      rejected:             'danger',
      failed:               'danger',
      error:                'danger',
    };
    const variant = map[status] || 'info';
    const label = (status || '').replace(/_/g, ' ');
    return `<span class="status-pill status-pill--${variant}">${label}</span>`;
  }

  /* ---- Severity chip (colored pill) ---- */
  function severityChip(severity) {
    const map = {
      critical: 'critical',
      high:     'high',
      medium:   'medium',
      low:      'low',
      info:     'info',
    };
    const variant = map[severity] || 'info';
    const icons = {
      critical: 'fa-circle-exclamation',
      high:     'fa-triangle-exclamation',
      medium:   'fa-circle-minus',
      low:      'fa-circle-check',
      info:     'fa-circle-info',
    };
    const icon = icons[severity] || icons.info;
    return `<span class="severity-pill severity-pill--${variant}"><i class="fa-solid ${icon}"></i> ${severity}</span>`;
  }

  /* ---- Risk class badge ---- */
  function riskBadge(riskClass) {
    if (!riskClass) return '<span class="chip chip-info">pending</span>';
    const map = {
      low:      'risk-low',
      medium:   'risk-medium',
      high:     'risk-high',
      critical: 'risk-critical',
    };
    const cls = map[riskClass] || 'risk-medium';
    return `<span class="risk-badge ${cls}">${riskClass.toUpperCase()}</span>`;
  }

  /* ---- Confidence bar ---- */
  function confidenceBar(value) {
    const pct = Math.round((value || 0) * 100);
    let level = 'high';
    if (pct < 50) level = 'low';
    else if (pct < 75) level = 'medium';
    return `
      <div class="confidence-bar">
        <div class="confidence-track">
          <div class="confidence-fill ${level}" style="width:${pct}%"></div>
        </div>
        <span class="confidence-label">${pct}%</span>
      </div>`;
  }

  /* ---- Evidence panel ---- */
  function evidencePanel(source, text) {
    return `
      <div class="evidence-panel">
        <div class="evidence-source">${source}</div>
        <div class="evidence-text">${text}</div>
      </div>`;
  }

  /* ---- Pipeline visualization ---- */
  function agentPipeline(runs, checkpoints) {
    const order = [
      'intake_agent', 'extraction_agent', '_cp_post_extraction',
      'reconciliation_agent',
      'regulation_agent', 'risk_process_agent', 'esg_agent',
      '_cp_post_regulation',
      'historical_agent', 'decision_agent', '_cp_pre_decision'
    ];
    const names = {
      intake_agent:        'Intake',
      extraction_agent:    'Extraction',
      _cp_post_extraction: '<i class="fa-solid fa-circle-pause"></i> Check',
      reconciliation_agent:'Reconciliation',
      regulation_agent:    'Regulation',
      risk_process_agent:  'Risk Process',
      esg_agent:           'ESG',
      _cp_post_regulation: '<i class="fa-solid fa-circle-pause"></i> Check',
      historical_agent:    'Historical',
      decision_agent:      'Decision',
      _cp_pre_decision:    '<i class="fa-solid fa-circle-pause"></i> Check',
    };
    const cpMap = {
      _cp_post_extraction: 'post_extraction',
      _cp_post_regulation: 'post_regulation',
      _cp_pre_decision:    'pre_decision',
    };
    const runMap = {};
    (runs || []).forEach(r => { runMap[r.agent_name] = r.status; });
    const cpStatusMap = {};
    (checkpoints || []).forEach(c => { cpStatusMap[c.checkpoint_name] = c.status; });

    const steps = order.map((name, i) => {
      const arrow = i < order.length - 1 ? '<span class="pipeline-arrow"><i class="fa-solid fa-chevron-right"></i></span>' : '';
      if (name.startsWith('_cp_')) {
        const cpName = cpMap[name];
        const cpStatus = cpStatusMap[cpName] || 'pending';
        const cls = cpStatus === 'approved' ? 'completed' : cpStatus === 'rejected' ? 'failed' : 'checkpoint';
        return `<span class="pipeline-step ${cls}" title="${cpName}: ${cpStatus}">${names[name]}</span>${arrow}`;
      }
      const status = runMap[name] || 'pending';
      const icon = status === 'running' ? '<i class="fa-solid fa-circle-notch fa-spin"></i> '
                 : status === 'completed' ? '<i class="fa-solid fa-circle-check"></i> '
                 : status === 'failed' ? '<i class="fa-solid fa-circle-xmark"></i> '
                 : '';
      return `<span class="pipeline-step ${status}">${icon}${names[name]}</span>${arrow}`;
    });
    return `<div class="pipeline">${steps.join('')}</div>`;
  }

  /* ---- Timeline ---- */
  function timeline(items) {
    const html = items.map(item => `
      <div class="timeline-item">
        <div class="timeline-dot ${item.dotClass || 'completed'}"></div>
        <div class="timeline-content">
          <div class="flex-between">
            <span class="timeline-title">${item.title}</span>
            <span class="timeline-time">${item.time || ''}</span>
          </div>
          ${item.body ? `<div class="text-muted mt-8" style="font-size:.85rem">${item.body}</div>` : ''}
        </div>
      </div>`).join('');
    return `<div class="timeline">${html}</div>`;
  }

  /* ---- Sortable table ---- */
  function sortableTable(id, columns, rows, onRowClick) {
    const tableId = id || 'tbl-' + Math.random().toString(36).slice(2, 8);
    // Store data on window for sorting
    window.__tables = window.__tables || {};
    window.__tables[tableId] = { columns, rows, sort: { col: null, asc: true }, onRowClick };

    return renderTable(tableId);
  }

  function renderTable(tableId) {
    const t = window.__tables[tableId];
    const { columns, rows, sort } = t;

    // Sort
    let sorted = [...rows];
    if (sort.col !== null) {
      const col = columns[sort.col];
      sorted.sort((a, b) => {
        let va = a[col.key], vb = b[col.key];
        if (va == null) va = '';
        if (vb == null) vb = '';
        if (typeof va === 'string') va = va.toLowerCase();
        if (typeof vb === 'string') vb = vb.toLowerCase();
        if (va < vb) return sort.asc ? -1 : 1;
        if (va > vb) return sort.asc ? 1 : -1;
        return 0;
      });
    }

    const thHtml = columns.map((c, i) => {
      const icon = sort.col === i ? (sort.asc ? '<i class="fa-solid fa-caret-up"></i>' : '<i class="fa-solid fa-caret-down"></i>') : '<i class="fa-solid fa-sort"></i>';
      return `<th data-table="${tableId}" data-col="${i}">${c.label} <span class="sort-icon">${icon}</span></th>`;
    }).join('');

    const trHtml = sorted.map((row, ri) => {
      const tds = columns.map(c => `<td>${c.render ? c.render(row) : (row[c.key] ?? '')}</td>`).join('');
      return `<tr data-table="${tableId}" data-row="${ri}">${tds}</tr>`;
    }).join('');

    return `<table class="data-table" id="${tableId}"><thead><tr>${thHtml}</tr></thead><tbody>${trHtml}</tbody></table>`;
  }

  // Global delegation for sortable tables
  document.addEventListener('click', (e) => {
    const th = e.target.closest('th[data-table]');
    if (th) {
      const tableId = th.dataset.table;
      const col = parseInt(th.dataset.col, 10);
      const t = window.__tables?.[tableId];
      if (t) {
        if (t.sort.col === col) t.sort.asc = !t.sort.asc;
        else { t.sort.col = col; t.sort.asc = true; }
        const el = document.getElementById(tableId);
        if (el) el.outerHTML = renderTable(tableId);
      }
    }
    const tr = e.target.closest('tr[data-table]');
    if (tr && !e.target.closest('button, a, .btn')) {
      const tableId = tr.dataset.table;
      const t = window.__tables?.[tableId];
      if (t?.onRowClick) {
        const ri = parseInt(tr.dataset.row, 10);
        t.onRowClick(t.rows[ri], ri);
      }
    }
  });

  /* ---- Toast (uses gds-badge-style colours) ---- */
  function toast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    el.textContent = message;
    container.appendChild(el);
    setTimeout(() => { el.remove(); }, 4000);
  }

  /* ---- Loading spinner helper ---- */
  function loadingSpinner(text) {
    return `<div class="page-loading"><gds-spinner></gds-spinner><p>${text || 'Loading…'}</p></div>`;
  }

  /* ---- Format date ---- */
  function fmtDate(d) {
    if (!d) return '—';
    return new Date(d).toLocaleString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  /* ---- Modal ---- */
  function showModal(title, bodyHtml, actions) {
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    backdrop.innerHTML = `
      <div class="modal">
        <h2>${title}</h2>
        <div class="modal-body">${bodyHtml}</div>
        <div class="modal-actions mt-16 flex-between">${actions || ''}</div>
      </div>`;
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) backdrop.remove();
    });
    document.body.appendChild(backdrop);
    return backdrop;
  }

  function closeModal() {
    document.querySelector('.modal-backdrop')?.remove();
  }

  /* ---- ECharts helpers ---- */

  /** Active chart instances — tracked for resize & disposal */
  const _charts = new Map();

  /**
   * Register 'seb-dark' ECharts theme at runtime (matches seb but with dark palette).
   * Called once on first dark-mode chart init.
   */
  let _sebDarkRegistered = false;
  function _ensureDarkTheme() {
    if (_sebDarkRegistered || typeof echarts === 'undefined') return;
    echarts.registerTheme('seb-dark', {
      color: [
        '#7ae635', '#41B0EE', '#ffb400', '#f03529',
        '#60cd18', '#a0a0a0', '#45b400', '#5bc0eb',
      ],
      backgroundColor: 'transparent',
      textStyle: {
        fontFamily: 'SEB SansSerif, -apple-system, BlinkMacSystemFont, sans-serif',
        color: '#c8cad0',
      },
      title: {
        textStyle: {
          fontFamily: 'SEB SansSerif, sans-serif',
          fontWeight: 500,
          color: '#e4e6eb',
          fontSize: 14,
        },
        subtextStyle: { color: '#8a8d93', fontSize: 12 },
      },
      legend: {
        textStyle: { color: '#c8cad0', fontSize: 12 },
      },
      tooltip: {
        backgroundColor: '#22262e',
        borderColor: '#3a3f4b',
        borderWidth: 1,
        textStyle: { color: '#e4e6eb', fontSize: 12 },
      },
      radar: {
        shape: 'polygon',
        splitNumber: 4,
        axisName: { color: '#c8cad0', fontSize: 12 },
        splitLine: { lineStyle: { color: '#3a3f4b' } },
        splitArea: { areaStyle: { color: ['#1a1d23', '#22262e'] } },
        axisLine: { lineStyle: { color: '#3a3f4b' } },
      },
    });
    _sebDarkRegistered = true;
  }

  /**
   * Initialise (or re-use) an ECharts instance on a container element.
   * Uses the registered 'seb' theme (or 'seb-dark' in dark mode).
   * Automatically resizes via ResizeObserver.
   * @param {string} id - DOM id of the chart container div
   * @param {object} option - ECharts option object
   * @returns {object|null} The echarts instance, or null if container missing
   */
  function initChart(id, option) {
    const el = document.getElementById(id);
    if (!el || typeof echarts === 'undefined') return null;

    // Dispose previous instance on the same element
    if (_charts.has(id)) {
      _charts.get(id).dispose();
      _charts.delete(id);
    }

    const isDark = typeof ThemeManager !== 'undefined' && ThemeManager.isDark();
    if (isDark) _ensureDarkTheme();
    const theme = isDark ? 'seb-dark' : 'seb';

    const chart = echarts.init(el, theme);
    chart.setOption(option);
    _charts.set(id, chart);

    // Responsive resize
    const ro = new ResizeObserver(() => chart.resize());
    ro.observe(el);

    return chart;
  }

  /** Dispose all tracked chart instances (call on page navigation). */
  function disposeCharts() {
    _charts.forEach(c => c.dispose());
    _charts.clear();
  }

  /* ---- Severity colours (reusable for chart series) ---- */
  const SEVERITY_COLORS = {
    critical: '#f03529',
    high:     '#f03529',
    medium:   '#ffb400',
    low:      '#60cd18',
    info:     '#007ac7',
  };

  /* ---- Analysis timer helpers ---- */

  /** Format seconds as M:SS */
  function formatElapsed(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  }

  /**
   * Start an elapsed-time counter that updates a DOM element every second.
   * @param {string} elementId - id of the <span> to update
   * @returns {number} intervalId — pass to stopTimer()
   */
  function startTimer(elementId) {
    let elapsed = 0;
    const id = setInterval(() => {
      elapsed++;
      const el = document.getElementById(elementId);
      if (el) {
        el.textContent = formatElapsed(elapsed);
      } else {
        clearInterval(id); // element removed from DOM, clean up
      }
    }, 1000);
    return id;
  }

  /** Stop a running timer. */
  function stopTimer(intervalId) {
    if (intervalId) clearInterval(intervalId);
  }

  /* ---- Musical-notes celebration (approve animation) ---- */
  function celebrate() {
    const NOTES = ['♩', '♪', '♫', '♬', '𝅘𝅥𝅮', '𝅗𝅥', '♭', '♯'];
    const COLORS = [
      '#60cd18', '#007ac7', '#f29d00', '#e91e63',
      '#9c27b0', '#ff5722', '#00bcd4', '#8bc34a',
      '#ff9800', '#3f51b5', '#e040fb', '#00e676',
    ];
    const COUNT = 45;
    const DURATION = 3200;

    const canvas = document.createElement('div');
    canvas.className = 'celebrate-canvas';
    document.body.appendChild(canvas);

    for (let i = 0; i < COUNT; i++) {
      const note = document.createElement('span');
      note.className = 'celebrate-note';
      note.textContent = NOTES[Math.floor(Math.random() * NOTES.length)];
      note.style.left = `${Math.random() * 100}vw`;
      note.style.color = COLORS[Math.floor(Math.random() * COLORS.length)];
      note.style.fontSize = `${1.2 + Math.random() * 1.6}rem`;
      note.style.animationDuration = `${1.8 + Math.random() * 1.8}s`;
      note.style.animationDelay = `${Math.random() * 0.8}s`;
      // Random horizontal drift
      note.style.setProperty('--drift', `${-40 + Math.random() * 80}px`);
      note.style.setProperty('--spin', `${-180 + Math.random() * 360}deg`);
      canvas.appendChild(note);
    }

    setTimeout(() => canvas.remove(), DURATION);
  }

  return {
    statusChip, severityChip, riskBadge, confidenceBar,
    evidencePanel, agentPipeline, timeline, sortableTable,
    toast, loadingSpinner, fmtDate, showModal, closeModal,
    initChart, disposeCharts, SEVERITY_COLORS,
    formatElapsed, startTimer, stopTimer, celebrate,
  };
})();
