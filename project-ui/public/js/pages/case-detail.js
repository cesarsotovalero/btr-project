/**
 * Page: Case Detail — overview + document upload + trigger analysis
 */
const CaseDetailPage = (() => {
  let _container = null;   // stored so checkpoint handlers can trigger full re-render

  async function render(container, caseId) {
    _container = container;
    container.innerHTML = '<div class="page-loading"><gds-spinner></gds-spinner><p>Loading case…</p></div>';

    try {
      // Avoid stale status decisions (e.g., cached "analyzing" after a run has paused/failed)
      API.invalidateCache(`/cases/${caseId}`);

      const [caseData, docsData, findingsData] = await Promise.all([
        API.getCase(caseId),
        API.listDocuments(caseId),
        API.getFindings(caseId).catch(() => ({ findings: [] })),
      ]);
      const c = caseData;
      const docs = docsData.documents || [];
      const findings = findingsData.findings || [];

      container.innerHTML = `
        <div class="breadcrumbs">
          <a href="#/">Cases</a> <span class="sep">/</span> <span>${c.company_name}</span>
        </div>

        <div class="page-header">
          <div>
            <h1>${c.company_name} <span class="subtitle">${c.case_number}</span></h1>
          </div>
          <div class="header-actions">
            ${Components.statusChip(c.status)}
            <button class="btn-run-analysis" id="btn-analyze"
              ${['created','new','uploaded','review_ready','approved','rejected','checkpoint_rejected','failed'].includes(c.status) ? '' : 'disabled'}>
              <i class="fa-solid fa-play"></i>
              Run Analysis
            </button>
          </div>
        </div>

        <!-- Analysis status section (visible during analysis) -->
        <div id="analysis-status-section" class="analysis-status-section" style="display:none"></div>

        <!-- Tabs -->
        <div class="tabs" id="case-tabs">
          <button class="tab active" data-tab="overview">Overview</button>
          <button class="tab" data-tab="documents">Documents (${docs.length})</button>
          <button class="tab" data-tab="findings">Findings</button>
          <button class="tab" data-tab="risk">Risk Assessment</button>
          <button class="tab" data-tab="esg">ESG</button>
          <button class="tab" data-tab="pipeline">Agent Pipeline</button>
          <button class="tab" data-tab="review">Review &amp; Audit</button>
        </div>
        <div id="tab-content"></div>`;

      // Tab logic
      const tabs = container.querySelectorAll('.tab');
      tabs.forEach(tab => tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        renderTab(tab.dataset.tab, caseId, c, docs, findings);
      }));

      // Analyze button — animated loading state with timer and live status
      const btnAnalyze = document.getElementById('btn-analyze');
      const btnOriginalHTML = btnAnalyze.innerHTML;
      const statusSection = document.getElementById('analysis-status-section');
      let analysisTimerId = null;
      let analysisPollId = null;

      // If the case is currently analyzing, resume polling
      // (checkpoint_pending is a paused state and should not keep polling)
      if (c.status === 'analyzing') {
        _enterAnalyzingState(btnAnalyze, statusSection, caseId, container, docs, findings);
      } else if (c.status === 'checkpoint_pending') {
        statusSection.style.display = 'block';
        statusSection.innerHTML = `
          <div class="analysis-status-inner">
            <div class="analysis-status-header">
              <i class="fa-solid fa-circle-pause"></i>
              <span>Paused — awaiting checkpoint approval</span>
            </div>
            <div id="analysis-agent-steps" class="analysis-agent-steps">
              <div class="text-muted">Open the Agent Pipeline tab to approve or reject the checkpoint.</div>
            </div>
          </div>`;
      }

      btnAnalyze.addEventListener('click', async () => {
        // Immediately disable button and enter analyzing state
        btnAnalyze.disabled = true;
        btnAnalyze.classList.add('btn-analyzing');
        btnAnalyze.innerHTML = `
          <i class="fa-solid fa-spinner fa-spin"></i>
          Analyzing… <span id="analysis-timer" class="analysis-timer">0:00</span>`;

        try {
          await API.triggerAnalysis(caseId, {});
          Components.toast('Analysis started');
          _startAnalysisPoll(btnAnalyze, btnOriginalHTML, statusSection, caseId, container, docs, findings);
        } catch (err) {
          // Restore button on error
          btnAnalyze.classList.remove('btn-analyzing');
          btnAnalyze.innerHTML = btnOriginalHTML;
          btnAnalyze.disabled = false;
          statusSection.style.display = 'none';
          Components.toast(err.message, 'error');
        }
      });

      // Initial tab
      renderTab('overview', caseId, c, docs, findings);

    } catch (err) {
      container.innerHTML = `<div class="empty-state text-severe">Error: ${err.message}</div>`;
    }
  }

  async function renderTab(tab, caseId, c, docs, findings) {
    Components.disposeCharts();
    const el = document.getElementById('tab-content');
    switch (tab) {
      case 'overview':   return renderOverview(el, c, docs, findings);
      case 'documents':  return renderDocuments(el, caseId, docs);
      case 'findings':   return renderFindingsTab(el, caseId);
      case 'risk':       return renderRiskTab(el, caseId);
      case 'esg':        return renderEsgTab(el, caseId);
      case 'pipeline':   return renderPipelineTab(el, caseId);
      case 'review':     return renderReviewTab(el, caseId, c);
    }
  }

  /* ---- Overview ---- */
  function renderOverview(el, c, docs, findings) {
    el.innerHTML = `
      <div class="grid-2">
        <div class="card">
          <div class="card-header"><h3>Case Details</h3></div>
          <dl class="detail-grid">
            <dt>Company</dt><dd>${c.company_name}</dd>
            <dt>Case #</dt><dd class="mono">${c.case_number}</dd>
            <dt>Sector</dt><dd>${c.sector || '—'}</dd>
            <dt>Country</dt><dd>${c.country || '—'}</dd>
            <dt>ESG Relevant</dt><dd>${c.esg_relevant ? '<span class="chip chip-ok">Yes</span>' : 'No'}</dd>
            <dt>Status</dt><dd>${Components.statusChip(c.status)}</dd>
            <dt>Created</dt><dd>${Components.fmtDate(c.created_at)}</dd>
            <dt>Updated</dt><dd>${Components.fmtDate(c.updated_at)}</dd>
          </dl>
        </div>
        <div class="card">
          <div class="card-header"><h3>Quick Stats</h3></div>
          <div class="grid-2 mt-8">
            <div class="stat-card"><div class="stat-value">${docs.length}</div><div class="stat-label">Documents</div></div>
            <div class="stat-card"><div class="stat-value">${findings.length}</div><div class="stat-label">Findings</div></div>
          </div>
        </div>
      </div>`;
  }

  /* ---- Documents ---- */
  function renderDocuments(el, caseId, docs) {
    el.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h3>Uploaded Documents</h3>
        </div>
        <div class="upload-area" id="upload-area">
          <div class="upload-icon"><i class="fa-solid fa-cloud-arrow-up"></i></div>
          <p>Drag &amp; drop files or click to upload</p>
          <p class="text-muted" style="font-size:.78rem">PDF, Excel (.xlsx), PowerPoint (.pptx) — max 50 MB</p>
          <input type="file" id="file-input" multiple accept=".pdf,.xlsx,.pptx" style="display:none"/>
        </div>
        <div id="doc-list" class="mt-16"></div>
      </div>`;

    const area = document.getElementById('upload-area');
    const input = document.getElementById('file-input');

    area.addEventListener('click', () => input.click());
    area.addEventListener('dragover', e => { e.preventDefault(); area.classList.add('drag-over'); });
    area.addEventListener('dragleave', () => area.classList.remove('drag-over'));
    area.addEventListener('drop', e => {
      e.preventDefault();
      area.classList.remove('drag-over');
      uploadFiles(caseId, e.dataTransfer.files);
    });
    input.addEventListener('change', () => uploadFiles(caseId, input.files));

    renderDocList(caseId, docs);
  }

  function renderDocList(caseId, docs) {
    const el = document.getElementById('doc-list');
    if (!docs.length) { el.innerHTML = '<p class="text-muted">No documents uploaded yet.</p>'; return; }

    const columns = [
      { key: 'filename', label: 'File' },
      { key: 'file_type', label: 'Type' },
      { key: 'file_size', label: 'Size', render: r => formatBytes(r.file_size) },
      { key: 'parsed_status', label: 'Parsed', render: r => Components.statusChip(r.parsed_status) },
      { key: 'created_at', label: 'Uploaded', render: r => Components.fmtDate(r.created_at) },
      { key: '_actions', label: 'Actions', render: r => {
        const parts = [];
        // Parse / View extraction button
        if (r.parsed_status === 'pending' || r.parsed_status === 'uploaded')
          parts.push(`<button class="btn btn-secondary btn-sm btn-parse" data-id="${r.id}" title="Parse document"><i class="fa-solid fa-gears"></i></button>`);
        if (r.parsed_status === 'completed')
          parts.push(`<button class="btn btn-secondary btn-sm btn-view-ext" data-id="${r.id}" title="View extraction"><i class="fa-solid fa-eye"></i></button>`);
        // Download button
        parts.push(`<button class="btn btn-secondary btn-sm btn-download" data-id="${r.id}" title="Download file"><i class="fa-solid fa-download"></i></button>`);
        // Delete button
        parts.push(`<button class="btn btn-secondary btn-sm btn-delete-doc" data-id="${r.id}" data-name="${(r.filename || '').replace(/"/g, '&quot;')}" title="Delete document"><i class="fa-solid fa-trash-can"></i></button>`);
        return `<span class="doc-actions">${parts.join('')}</span>`;
      }},
    ];
    el.innerHTML = Components.sortableTable('doc-table', columns, docs);

    // Parse
    el.querySelectorAll('.btn-parse').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const docId = btn.dataset.id;
        const row = btn.closest('tr');
        // Show scanning animation on the row
        if (row) {
          row.classList.add('doc-parsing');
          // Replace the Parsed status cell with a spinner label
          const parsedCell = row.querySelector('td:nth-child(4)');
          if (parsedCell) parsedCell.innerHTML = '<span class="doc-parse-status"><i class="fa-solid fa-spinner"></i> Parsing…</span>';
          // Disable the parse button
          btn.disabled = true;
          btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
        }
        try {
          await API.parseDocument(docId);
          // Flash success, then refresh the list
          if (row) {
            row.classList.remove('doc-parsing');
            row.classList.add('doc-parsed');
          }
          Components.toast('Document parsed');
          // Short delay to let the success flash play, then refresh
          await new Promise(r => setTimeout(r, 600));
          const docsData = await API.listDocuments(caseId);
          renderDocList(caseId, docsData.documents || []);
        } catch (err) {
          if (row) row.classList.remove('doc-parsing');
          Components.toast(err.message, 'error');
          // Restore button
          btn.disabled = false;
          btn.innerHTML = '<i class="fa-solid fa-gears"></i>';
        }
      });
    });

    // View extraction
    el.querySelectorAll('.btn-view-ext').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        try {
          const ext = await API.getExtraction(btn.dataset.id);
          Components.showModal('Extraction Result',
            renderExtractionView(ext),
            '<button class="btn btn-secondary" onclick="Components.closeModal()">Close</button>');
        } catch (err) { Components.toast(err.message, 'error'); }
      });
    });

    // Download
    el.querySelectorAll('.btn-download').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const url = API.downloadDocumentUrl(btn.dataset.id);
        const a = document.createElement('a');
        a.href = url;
        a.setAttribute('download', '');
        // Attach JWT as query param for the raw download request
        const token = Auth.getToken();
        if (token) a.href += `?token=${encodeURIComponent(token)}`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      });
    });

    // Delete
    el.querySelectorAll('.btn-delete-doc').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const name = btn.dataset.name || 'this document';
        if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
        try {
          await API.deleteDocument(btn.dataset.id);
          Components.toast(`${name} deleted`);
          // Refresh document list
          const docsData = await API.listDocuments(caseId);
          renderDocList(caseId, docsData.documents || []);
        } catch (err) { Components.toast(err.message, 'error'); }
      });
    });
  }

  async function uploadFiles(caseId, files) {
    const uploaded = [];
    for (const file of files) {
      const form = new FormData();
      form.append('file', file);
      try {
        const doc = await API.uploadDocument(caseId, form);
        Components.toast(`${file.name} uploaded`);
        uploaded.push(doc);
      } catch (err) {
        Components.toast(`Upload error: ${err.message}`, 'error');
      }
    }
    // Refresh docs to show uploaded files
    const docsData = await API.listDocuments(caseId);
    const docs = docsData.documents || [];
    renderDocList(caseId, docs);

    // Auto-parse newly uploaded documents with animation
    for (const doc of uploaded) {
      const docId = doc.id || doc.document_id;
      if (!docId) continue;
      const row = document.querySelector(`.btn-parse[data-id="${docId}"]`)?.closest('tr');
      if (row) {
        row.classList.add('doc-parsing');
        const parsedCell = row.querySelector('td:nth-child(4)');
        if (parsedCell) parsedCell.innerHTML = '<span class="doc-parse-status"><i class="fa-solid fa-spinner"></i> Parsing…</span>';
        const parseBtn = row.querySelector('.btn-parse');
        if (parseBtn) { parseBtn.disabled = true; parseBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>'; }
      }
      try {
        await API.parseDocument(docId);
        if (row) { row.classList.remove('doc-parsing'); row.classList.add('doc-parsed'); }
      } catch (err) {
        if (row) row.classList.remove('doc-parsing');
        Components.toast(`Parse error: ${err.message}`, 'error');
      }
    }
    // Final refresh to reflect parsed status
    if (uploaded.length) {
      await new Promise(r => setTimeout(r, 600));
      const finalDocs = await API.listDocuments(caseId);
      renderDocList(caseId, finalDocs.documents || []);
    }
  }

  /* ---- Findings ---- */
  async function renderFindingsTab(el, caseId) {
    el.innerHTML = '<div class="page-loading"><gds-spinner></gds-spinner></div>';
    try {
      const data = await API.getFindings(caseId);
      const findings = data.findings || [];
      if (!findings.length) {
        el.innerHTML = '<div class="empty-state"><div class="empty-icon"><i class="fa-solid fa-magnifying-glass"></i></div><p>No findings yet. Run analysis first.</p></div>';
        return;
      }

      // ── Deduplicate by title + finding_type ──
      const seen = new Set();
      const unique = findings.filter(f => {
        const key = `${f.finding_type}::${f.title}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      // ── Group by agent ──
      const AGENT_META = {
        decision_agent:        { label: 'Decision Agent',        icon: 'fa-solid fa-gavel',          color: '#6366f1' },
        reconciliation_agent:  { label: 'Reconciliation Agent',  icon: 'fa-solid fa-scale-balanced',  color: '#f59e0b' },
        esg_agent:             { label: 'ESG Agent',             icon: 'fa-solid fa-leaf',            color: '#10b981' },
        deterministic_checks:  { label: 'Deterministic Checks',  icon: 'fa-solid fa-clipboard-check', color: '#ef4444' },
      };
      const groups = {};
      unique.forEach(f => {
        const agent = f.created_by_agent || 'unknown';
        if (!groups[agent]) groups[agent] = [];
        groups[agent].push(f);
      });

      // Explanation cache to avoid re-fetching
      const explainCache = new Map();

      // ── Summary chips ──
      const critCount = unique.filter(f => f.severity === 'critical').length;
      const highCount = unique.filter(f => f.severity === 'high').length;
      const warnCount = unique.filter(f => f.severity === 'warning').length;
      const infoCount = unique.filter(f => f.severity === 'info').length;

      let summaryHTML = '<div class="findings-summary">';
      summaryHTML += `<span class="findings-count">${unique.length} finding${unique.length !== 1 ? 's' : ''}</span>`;
      if (critCount) summaryHTML += `<span class="findings-chip findings-chip--critical"><i class="fa-solid fa-circle-xmark"></i> ${critCount} Critical</span>`;
      if (highCount) summaryHTML += `<span class="findings-chip findings-chip--high"><i class="fa-solid fa-triangle-exclamation"></i> ${highCount} High</span>`;
      if (warnCount) summaryHTML += `<span class="findings-chip findings-chip--warning"><i class="fa-solid fa-circle-exclamation"></i> ${warnCount} Warning</span>`;
      if (infoCount) summaryHTML += `<span class="findings-chip findings-chip--info"><i class="fa-solid fa-circle-info"></i> ${infoCount} Info</span>`;
      summaryHTML += '</div>';

      // ── Render agent groups ──
      let groupsHTML = '';
      const agentOrder = ['decision_agent', 'reconciliation_agent', 'esg_agent', 'deterministic_checks'];
      // Include agents in a defined order, then any remaining
      const sortedAgents = [...agentOrder.filter(a => groups[a]), ...Object.keys(groups).filter(a => !agentOrder.includes(a))];

      sortedAgents.forEach(agent => {
        const items = groups[agent];
        const meta = AGENT_META[agent] || { label: agent.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), icon: 'fa-solid fa-robot', color: '#6b7280' };

        groupsHTML += `
        <div class="findings-group" data-agent="${agent}">
          <button class="findings-group-header" data-agent="${agent}">
            <div class="findings-group-left">
              <i class="${meta.icon}" style="color:${meta.color}"></i>
              <span class="findings-group-label">${meta.label}</span>
              <span class="findings-group-count">${items.length}</span>
            </div>
            <i class="fa-solid fa-chevron-down findings-group-chevron"></i>
          </button>
          <div class="findings-group-body">
            ${items.map(f => {
              const sev = f.severity || 'info';
              return `
              <div class="finding-item finding-severity--${sev}" data-finding-id="${f.id}" role="button" tabindex="0">
                <div class="finding-header">
                  <span class="finding-title">${f.title}</span>
                  <div class="finding-header-right">
                    ${Components.severityChip(f.severity)}
                    <i class="fa-solid fa-chevron-right finding-chevron"></i>
                  </div>
                </div>
                <div class="finding-body">${f.description || ''}</div>
                <div class="finding-meta">
                  <span><i class="fa-solid fa-tag"></i> ${f.finding_type.replace(/_/g, ' ')}</span>
                </div>
                <div class="finding-explanation" id="explanation-${f.id}"></div>
              </div>`;
            }).join('')}
          </div>
        </div>`;
      });

      el.innerHTML = `${summaryHTML}<div class="findings-groups">${groupsHTML}</div>`;

      // ── Group collapse/expand ──
      el.querySelectorAll('.findings-group-header').forEach(btn => {
        btn.addEventListener('click', () => {
          const group = btn.closest('.findings-group');
          group.classList.toggle('collapsed');
        });
      });

      // ── Finding card click → inline explain ──
      el.querySelectorAll('.finding-item[data-finding-id]').forEach(card => {
        card.addEventListener('click', async (e) => {
          // Don't trigger if clicking inside an already-open explanation link
          if (e.target.closest('a')) return;

          const fid = card.dataset.findingId;
          const explDiv = card.querySelector('.finding-explanation');
          const chevron = card.querySelector('.finding-chevron');

          // Toggle off if already expanded
          if (card.classList.contains('expanded')) {
            card.classList.remove('expanded');
            explDiv.innerHTML = '';
            return;
          }

          // Collapse any other expanded card in same group
          card.closest('.findings-group-body').querySelectorAll('.finding-item.expanded').forEach(other => {
            other.classList.remove('expanded');
            other.querySelector('.finding-explanation').innerHTML = '';
          });

          card.classList.add('expanded');

          // Check cache
          if (explainCache.has(fid)) {
            _renderExplanation(explDiv, explainCache.get(fid));
            return;
          }

          // Show spinner
          explDiv.innerHTML = '<div class="finding-explain-loading"><gds-spinner size="small"></gds-spinner><span>Generating explanation…</span></div>';

          try {
            const result = await API.explainFinding(caseId, fid);
            explainCache.set(fid, result);
            _renderExplanation(explDiv, result);
          } catch (err) {
            explDiv.innerHTML = `<div class="finding-explain-error"><i class="fa-solid fa-circle-exclamation"></i> ${err.message}</div>`;
          }
        });

        // Keyboard accessibility
        card.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            card.click();
          }
        });
      });

    } catch (err) {
      el.innerHTML = `<p class="text-severe">Error: ${err.message}</p>`;
    }
  }

  /** Render the LLM explanation inside a finding card */
  function _renderExplanation(container, data) {
    const explanation = data.explanation || 'No explanation available.';
    const refs = data.document_references || [];

    let html = `<div class="finding-explain-content">`;
    html += `<div class="finding-explain-text">${_simpleMarkdown(explanation)}</div>`;

    if (refs.length) {
      html += `<div class="finding-explain-refs">`;
      html += `<span class="finding-explain-refs-label"><i class="fa-solid fa-file-lines"></i> Referenced Documents</span>`;
      refs.forEach(ref => {
        html += `
          <div class="finding-doc-ref">
            <span class="finding-doc-name">${ref.document_name || 'Unknown document'}</span>
            ${ref.page ? `<span class="finding-doc-page">p. ${ref.page}</span>` : ''}
            ${ref.excerpt ? `<span class="finding-doc-excerpt">${ref.excerpt}</span>` : ''}
          </div>`;
      });
      html += `</div>`;
    }

    if (data.confidence) {
      html += `<div class="finding-explain-confidence">Confidence: ${Math.round(data.confidence * 100)}%</div>`;
    }

    html += `</div>`;
    container.innerHTML = html;
  }

  /** Minimal markdown → HTML (bold, italic, line breaks) */
  function _simpleMarkdown(text) {
    return text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');
  }

  /* ---- Risk assessment ---- */
  const _RISK_LEVEL_MAP = { low: 1, moderate: 2, elevated: 3, high: 4, critical: 5 };

  async function renderRiskTab(el, caseId) {
    el.innerHTML = '<div class="page-loading"><gds-spinner></gds-spinner></div>';
    try {
      const [ra, findingsData] = await Promise.all([
        API.getRiskAssessment(caseId),
        API.getFindings(caseId).catch(() => ({ findings: [] })),
      ]);

      if (!ra || !ra.proposed_risk_class) {
        el.innerHTML = '<div class="empty-state"><div class="empty-icon"><i class="fa-solid fa-chart-column"></i></div><p>No risk assessment yet.</p></div>';
        return;
      }

      const d = ra.details || {};
      const riskFactors = d.risk_factors || [];
      const missingItems = d.missing_items || [];
      const nextActions = d.next_actions || [];
      const deterministicChecks = d.deterministic_checks || {};
      const allFindings = findingsData.findings || [];

      // Severity counts for donut
      const sevCounts = { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
      allFindings.forEach(f => { if (sevCounts[f.severity] !== undefined) sevCounts[f.severity]++; });
      const hasSevData = Object.values(sevCounts).some(v => v > 0);

      // Risk factor level colors
      const levelColor = { low: 'success', moderate: 'warning', elevated: 'danger', high: 'danger', critical: 'danger' };

      el.innerHTML = `
        <!-- Charts row -->
        ${(riskFactors.length > 0 || hasSevData || ra.confidence != null) ? `
        <div class="chart-row mb-16">
          ${riskFactors.length > 0 ? `
          <div class="card">
            <div class="card-header"><h3><i class="fa-solid fa-diagram-project" style="margin-right:6px;opacity:.6"></i>Risk Profile</h3></div>
            <div id="risk-tab-radar" class="chart-container"></div>
          </div>` : ''}
          ${hasSevData ? `
          <div class="card">
            <div class="card-header"><h3><i class="fa-solid fa-chart-pie" style="margin-right:6px;opacity:.6"></i>Findings by Severity</h3></div>
            <div id="risk-tab-donut" class="chart-container"></div>
          </div>` : ''}
          ${(!riskFactors.length || !hasSevData) && ra.confidence != null ? `
          <div class="card">
            <div class="card-header"><h3><i class="fa-solid fa-bullseye" style="margin-right:6px;opacity:.6"></i>Confidence</h3></div>
            <div id="risk-tab-gauge" class="chart-container"></div>
          </div>` : ''}
        </div>` : ''}

        <div class="grid-2">
          <!-- LEFT column: Classification + Reasoning -->
          <div>
            <div class="card">
              <div class="card-header"><h3><i class="fa-solid fa-gauge-high"></i> Risk Classification</h3></div>
              <div style="text-align:center;padding:20px 0">
                ${Components.riskBadge(ra.proposed_risk_class)}
              </div>
              <dl class="detail-grid mt-16">
                <dt>Compliance</dt><dd>${Components.statusChip(ra.compliance_status || 'unknown')}</dd>
                <dt>Confidence</dt><dd>${Components.confidenceBar(ra.confidence)}</dd>
                <dt>Recommendation</dt><dd>${ra.recommendation || '—'}</dd>
              </dl>
            </div>
            <div class="card">
              <div class="card-header"><h3><i class="fa-solid fa-brain"></i> Reasoning</h3></div>
              <div class="risk-reasoning">${_formatReasoning(ra.reasoning || 'No reasoning provided.')}</div>
            </div>
          </div>

          <!-- RIGHT column: Risk Factors + Missing Items + Next Actions -->
          <div>
            ${riskFactors.length ? `
            <div class="card">
              <div class="card-header"><h3><i class="fa-solid fa-list-check"></i> Risk Factors</h3></div>
              <div class="risk-factors-list">
                ${riskFactors.map(rf => `
                  <div class="risk-factor-item">
                    <div class="risk-factor-header">
                      <span class="risk-factor-name">${rf.factor}</span>
                      <span class="status-pill status-pill--${levelColor[rf.level] || 'info'}">${rf.level}</span>
                    </div>
                    <div class="risk-factor-detail">${rf.detail}</div>
                  </div>`).join('')}
              </div>
            </div>` : ''}

            ${missingItems.length ? `
            <div class="card">
              <div class="card-header"><h3><i class="fa-solid fa-circle-exclamation"></i> Missing Items</h3></div>
              <ul class="risk-checklist risk-checklist--missing">
                ${missingItems.map(m => `<li><i class="fa-solid fa-xmark"></i> ${m}</li>`).join('')}
              </ul>
            </div>` : ''}

            ${nextActions.length ? `
            <div class="card">
              <div class="card-header"><h3><i class="fa-solid fa-forward"></i> Next Actions</h3></div>
              <ol class="risk-actions-list">
                ${nextActions.map(a => `<li>${a}</li>`).join('')}
              </ol>
            </div>` : ''}

            ${deterministicChecks.critical_issues?.length ? `
            <div class="card">
              <div class="card-header"><h3><i class="fa-solid fa-triangle-exclamation"></i> Critical Issues</h3></div>
              <ul class="risk-checklist risk-checklist--critical">
                ${deterministicChecks.critical_issues.map(i => `<li><i class="fa-solid fa-bolt"></i> ${i}</li>`).join('')}
              </ul>
            </div>` : ''}
          </div>
        </div>

        <!-- Links to full workspace pages -->
        <div class="risk-tab-links mt-16">
          <a href="#/cases/${caseId}/risk" class="btn btn-secondary btn-sm">
            <i class="fa-solid fa-arrow-up-right-from-square" style="margin-right:6px"></i>Full Risk Workspace
          </a>
          <a href="#/cases/${caseId}/compliance" class="btn btn-secondary btn-sm">
            <i class="fa-solid fa-arrow-up-right-from-square" style="margin-right:6px"></i>Compliance Dashboard
          </a>
        </div>`;

      // ── Render charts (after DOM is in place) ──
      _renderRiskTabCharts(ra, riskFactors, sevCounts);

    } catch (err) {
      if (err.message && err.message.includes('No risk assessment')) {
        el.innerHTML = '<div class="empty-state"><div class="empty-icon"><i class="fa-solid fa-chart-column"></i></div><p>No risk assessment yet. Run analysis first.</p></div>';
      } else {
        el.innerHTML = `<p class="text-severe">Error: ${err.message}</p>`;
      }
    }
  }

  /** Render ECharts for the Risk tab */
  function _renderRiskTabCharts(ra, riskFactors, sevCounts) {
    // 1. Risk Factor Radar
    if (riskFactors.length > 0) {
      const indicators = riskFactors.map(f => ({ name: f.factor.replace(/ Risk$/i, ''), max: 5 }));
      const values = riskFactors.map(f => _RISK_LEVEL_MAP[f.level] || 0);
      Components.initChart('risk-tab-radar', {
        tooltip: { trigger: 'item' },
        radar: { indicator: indicators },
        series: [{
          type: 'radar',
          data: [{
            value: values,
            name: 'Risk Profile',
            areaStyle: { color: 'rgba(96, 205, 24, 0.25)' },
            lineStyle: { color: '#60cd18', width: 2 },
            itemStyle: { color: '#60cd18' },
            symbol: 'circle',
            symbolSize: 6,
          }],
        }],
      });
    }

    // 2. Findings Severity Donut
    const sevData = Object.entries(sevCounts)
      .filter(([, v]) => v > 0)
      .map(([k, v]) => ({ name: k.charAt(0).toUpperCase() + k.slice(1), value: v }));
    if (sevData.length > 0) {
      const sevColors = sevData.map(d => Components.SEVERITY_COLORS[d.name.toLowerCase()] || '#868686');
      Components.initChart('risk-tab-donut', {
        tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
        legend: { bottom: 0, left: 'center' },
        series: [{
          type: 'pie',
          radius: ['40%', '65%'],
          center: ['50%', '45%'],
          avoidLabelOverlap: true,
          itemStyle: { borderRadius: 4, borderColor: '#fff', borderWidth: 2 },
          label: { show: true, formatter: '{b}\n{c}', fontSize: 12 },
          data: sevData.map((d, i) => ({ ...d, itemStyle: { color: sevColors[i] } })),
        }],
      });
    }

    // 3. Confidence Gauge
    if (ra.confidence != null) {
      const pct = Math.round(ra.confidence * 100);
      Components.initChart('risk-tab-gauge', {
        series: [{
          type: 'gauge',
          startAngle: 200,
          endAngle: -20,
          min: 0,
          max: 100,
          pointer: { show: true, length: '60%', width: 5, itemStyle: { color: '#333' } },
          progress: { show: true, width: 14, roundCap: true },
          axisLine: { lineStyle: { width: 14, color: [[0.5, '#f03529'], [0.75, '#ffb400'], [1, '#60cd18']] } },
          axisTick: { show: false },
          splitLine: { show: false },
          axisLabel: { show: true, distance: 20, fontSize: 11, color: '#868686' },
          detail: {
            valueAnimation: true,
            formatter: '{value}%',
            fontSize: 28,
            fontWeight: 500,
            fontFamily: 'SEB SansSerif, sans-serif',
            color: '#333',
            offsetCenter: [0, '60%'],
          },
          title: { offsetCenter: [0, '80%'], fontSize: 13, color: '#868686' },
          data: [{ value: pct, name: 'Assessment Confidence' }],
        }],
      });
    }
  }

  /** Convert markdown-ish reasoning text into styled HTML. */
  function _formatReasoning(text) {
    return text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/gs, '<ul class="risk-reasoning-list">$1</ul>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>')
      .replace(/^/, '<p>').replace(/$/, '</p>');
  }

  /* ---- ESG Assessment ---- */
  async function renderEsgTab(el, caseId) {
    el.innerHTML = '<div class="page-loading"><gds-spinner></gds-spinner></div>';
    try {
      const esg = await API.getEsgAssessment(caseId);
      if (!esg) {
        el.innerHTML = '<div class="empty-state"><div class="empty-icon"><i class="fa-solid fa-leaf"></i></div><p>No ESG assessment yet.</p></div>';
        return;
      }

      /** Render a flag item — handles both objects {flag,severity,detail} and plain strings */
      const renderFlag = (f) => {
        if (typeof f === 'string') return `<li>${escapeHtml(f)}</li>`;
        if (typeof f === 'object' && f !== null) {
          const name = f.flag || f.name || f.title || JSON.stringify(f);
          const sev = f.severity || '';
          const detail = f.detail || f.description || '';
          const sevChip = sev ? `<span class="chip chip-${sevToChipClass(sev)}" style="margin-left:8px">${escapeHtml(sev)}</span>` : '';
          return `<li>
            <div style="display:flex;align-items:center;gap:4px">
              <strong>${escapeHtml(name)}</strong>${sevChip}
            </div>
            ${detail ? `<div class="text-muted" style="font-size:.82rem;margin-top:2px">${escapeHtml(detail)}</div>` : ''}
          </li>`;
        }
        return `<li>${String(f)}</li>`;
      };

      const envFlags = (esg.environmental_flags || []).map(renderFlag).join('') || '<li class="text-muted">None</li>';
      const socFlags = (esg.social_flags || []).map(renderFlag).join('') || '<li class="text-muted">None</li>';
      const govFlags = (esg.governance_flags || []).map(renderFlag).join('') || '<li class="text-muted">None</li>';
      const missing = (esg.missing_esg_data || []).map(m =>
        `<li>${escapeHtml(typeof m === 'string' ? m : (m.item || m.name || JSON.stringify(m)))}</li>`
      ).join('') || '<li class="text-muted">None</li>';

      const alignment = esg.taxonomy_alignment || {};
      const alignRows = Object.entries(alignment).map(([k, v]) => {
        const label = k.replace(/_/g, ' ');
        const val = typeof v === 'string' ? v.replace(/_/g, ' ') : String(v);
        return `<tr>
          <td style="padding:8px 12px 8px 0;font-size:.88rem;text-transform:uppercase;font-weight:500;letter-spacing:.02em;color:var(--text-secondary);vertical-align:middle">${escapeHtml(label)}</td>
          <td style="padding:8px 0">${taxonomyChip(val)}</td>
        </tr>`;
      }).join('');

      el.innerHTML = `
        <div class="grid-2">
          <div class="card">
            <div class="card-header"><h3><i class="fa-solid fa-temperature-half" style="margin-right:6px;color:var(--color-severe)"></i>Climate Risk</h3></div>
            <div style="text-align:center;padding:20px 0">
              ${Components.riskBadge(esg.climate_risk_rating)}
            </div>
            <dl class="detail-grid mt-16">
              <dt>Confidence</dt><dd>${Components.confidenceBar(esg.confidence)}</dd>
              <dt>Risk Horizon</dt><dd>${esg.esg_risk_horizon ? escapeHtml(esg.esg_risk_horizon.replace(/_/g, ' ')) : '—'}</dd>
            </dl>
          </div>
          <div class="card">
            <div class="card-header"><h3><i class="fa-solid fa-scale-balanced" style="margin-right:6px;color:var(--green-primary)"></i>EU Taxonomy Alignment</h3></div>
            ${alignRows
              ? `<table style="width:100%;border-collapse:collapse;margin-top:8px"><tbody>${alignRows}</tbody></table>`
              : '<p class="text-muted" style="padding:16px">No taxonomy data available.</p>'}
          </div>
        </div>
        <div class="grid-3 mt-16">
          <div class="card">
            <div class="card-header"><h3><i class="fa-solid fa-seedling" style="margin-right:6px;color:#10b981"></i>Environmental</h3></div>
            <ul class="flag-list">${envFlags}</ul>
          </div>
          <div class="card">
            <div class="card-header"><h3><i class="fa-solid fa-people-group" style="margin-right:6px;color:#3b82f6"></i>Social</h3></div>
            <ul class="flag-list">${socFlags}</ul>
          </div>
          <div class="card">
            <div class="card-header"><h3><i class="fa-solid fa-building-columns" style="margin-right:6px;color:#8b5cf6"></i>Governance</h3></div>
            <ul class="flag-list">${govFlags}</ul>
          </div>
        </div>
        ${(esg.missing_esg_data || []).length ? `
        <div class="card mt-16">
          <div class="card-header"><h3><i class="fa-solid fa-circle-exclamation" style="margin-right:6px;color:var(--color-warning)"></i>Missing ESG Data</h3></div>
          <ul class="flag-list">${missing}</ul>
        </div>` : ''}`;
    } catch (err) {
      if (err.message && err.message.includes('No ESG assessment')) {
        el.innerHTML = '<div class="empty-state"><div class="empty-icon"><i class="fa-solid fa-leaf"></i></div><p>No ESG assessment yet. Run analysis first.</p></div>';
      } else {
        el.innerHTML = `<p class="text-severe">Error: ${err.message}</p>`;
      }
    }
  }

  /** Map severity string to chip CSS class */
  function sevToChipClass(sev) {
    const s = (sev || '').toLowerCase();
    if (s === 'high' || s === 'critical') return 'error';
    if (s === 'moderate' || s === 'warning' || s === 'medium') return 'caution';
    return 'ok';
  }

  /** Render a taxonomy alignment status chip */
  function taxonomyChip(val) {
    const v = (val || '').toLowerCase().trim();
    if (v === 'aligned' || v === 'full') return '<span class="chip chip-ok"><i class="fa-solid fa-circle-check" style="margin-right:4px"></i>Aligned</span>';
    if (v === 'partial') return '<span class="chip chip-caution"><i class="fa-solid fa-circle-half-stroke" style="margin-right:4px"></i>Partial</span>';
    if (v === 'not aligned' || v === 'none') return '<span class="chip chip-error"><i class="fa-solid fa-circle-xmark" style="margin-right:4px"></i>Not Aligned</span>';
    if (v === 'not assessed') return '<span class="chip" style="background:var(--gds-sys-color-base-200,#e9ecef);color:var(--text-secondary)"><i class="fa-solid fa-minus" style="margin-right:4px"></i>Not Assessed</span>';
    if (v === 'unknown') return '<span class="chip" style="background:var(--gds-sys-color-base-200,#e9ecef);color:var(--text-secondary)"><i class="fa-solid fa-question" style="margin-right:4px"></i>Unknown</span>';
    return `<span class="chip">${escapeHtml(val)}</span>`;
  }

  /* ---- Pipeline ---- */
  async function renderPipelineTab(el, caseId) {
    el.innerHTML = '<div class="page-loading"><gds-spinner></gds-spinner></div>';
    try {
      // Always invalidate cache so we show fresh agent statuses
      API.invalidateCache(`/cases/${caseId}`);
      const [data, cpData] = await Promise.all([
        API.getAgentRuns(caseId),
        API.getCheckpoints(caseId),
      ]);
      const runs = data.agent_runs || [];
      const checkpoints = cpData.checkpoints || [];
      if (!runs.length && !checkpoints.length) {
        el.innerHTML = '<div class="empty-state"><div class="empty-icon"><i class="fa-solid fa-robot"></i></div><p>No agent runs yet.</p></div>';
        return;
      }

      const pendingCps = checkpoints.filter(cp => cp.status === 'pending');
      const checkpointBanner = pendingCps.length > 0 ? `
        <div class="card mb-16" style="border-left:4px solid var(--warning)">
          <div class="card-header"><h3><i class="fa-solid fa-circle-pause"></i> Checkpoint — Action Required</h3></div>
          ${pendingCps.map(cp => `
            <div class="finding-item" style="border-bottom:1px solid var(--border)">
              <div class="finding-header">
                <span class="finding-title">${cp.checkpoint_name.replace(/_/g, ' ')}</span>
                <span class="chip chip-caution">pending</span>
              </div>
              <div class="mt-8">
                <div class="form-group" style="margin-bottom:8px">
                  <input class="form-control" id="cp-name-${cp.id}" placeholder="Your name" style="max-width:200px;display:inline-block"/>
                  <input class="form-control" id="cp-comment-${cp.id}" placeholder="Comment (optional)" style="max-width:300px;display:inline-block;margin-left:8px"/>
                </div>
                <button class="btn btn-primary btn-sm btn-cp-approve" data-cpid="${cp.id}">Approve</button>
                <button class="btn btn-secondary btn-sm btn-cp-reject" data-cpid="${cp.id}" style="margin-left:8px">Reject</button>
              </div>
            </div>
          `).join('')}
        </div>` : '';

      el.innerHTML = `
        ${checkpointBanner}
        <div class="card mb-16">
          <div class="card-header"><h3>Agent Pipeline</h3></div>
          ${Components.agentPipeline(runs, checkpoints)}
        </div>
        <div class="card">
          <div class="card-header"><h3>Run Details</h3></div>
          ${Components.timeline(runs.map(r => ({
            title: r.agent_name.replace(/_/g, ' '),
            time: Components.fmtDate(r.started_at),
            dotClass: r.status,
            body: r.error_message ? `<span class="text-severe">${r.error_message}</span>` :
                  (r.status === 'completed' ? 'Completed successfully' : r.status),
          })))}
        </div>`;

      // Checkpoint action handlers
      el.querySelectorAll('.btn-cp-approve').forEach(btn => {
        btn.addEventListener('click', async () => {
          const cpId = btn.dataset.cpid;
          const reviewer_name = document.getElementById(`cp-name-${cpId}`)?.value?.trim();
          const comment = document.getElementById(`cp-comment-${cpId}`)?.value?.trim() || '';
          if (!reviewer_name) { Components.toast('Name is required', 'error'); return; }
          try {
            await API.approveCheckpoint(caseId, cpId, { reviewer_name, comment });
            Components.toast('Checkpoint approved — workflow resuming');
            // Full re-render picks up new "analyzing" status and re-enters polling
            setTimeout(() => render(_container, caseId), 2000);
          } catch (err) { Components.toast(err.message, 'error'); }
        });
      });
      el.querySelectorAll('.btn-cp-reject').forEach(btn => {
        btn.addEventListener('click', async () => {
          const cpId = btn.dataset.cpid;
          const reviewer_name = document.getElementById(`cp-name-${cpId}`)?.value?.trim();
          const comment = document.getElementById(`cp-comment-${cpId}`)?.value?.trim() || '';
          if (!reviewer_name) { Components.toast('Name is required', 'error'); return; }
          try {
            await API.rejectCheckpoint(caseId, cpId, { reviewer_name, comment });
            Components.toast('Checkpoint rejected — workflow stopped');
            // Full re-render picks up new status
            setTimeout(() => render(_container, caseId), 1500);
          } catch (err) { Components.toast(err.message, 'error'); }
        });
      });
    } catch (err) {
      el.innerHTML = `<p class="text-severe">Error: ${err.message}</p>`;
    }
  }

  /* ---- Review & Audit ---- */

  /* Audit-log event type → display metadata */
  const AUDIT_EVENT_META = {
    case_created:         { icon: 'fa-folder-plus',      label: 'Case Created',          dot: 'completed' },
    case_updated:         { icon: 'fa-pen-to-square',    label: 'Case Updated',           dot: 'completed' },
    document_uploaded:    { icon: 'fa-cloud-arrow-up',   label: 'Document Uploaded',      dot: 'completed' },
    document_parsed:      { icon: 'fa-file-lines',       label: 'Document Parsed',        dot: 'completed' },
    document_deleted:     { icon: 'fa-trash-can',        label: 'Document Deleted',       dot: 'failed' },
    analysis_triggered:   { icon: 'fa-play',             label: 'Analysis Triggered',     dot: 'running' },
    checkpoint_approved:  { icon: 'fa-circle-check',     label: 'Checkpoint Approved',    dot: 'completed' },
    checkpoint_rejected:  { icon: 'fa-circle-xmark',     label: 'Checkpoint Rejected',    dot: 'failed' },
    analyst_review:       { icon: 'fa-user-check',       label: 'Analyst Review',         dot: 'completed' },
  };

  function auditEventLabel(eventType) {
    const meta = AUDIT_EVENT_META[eventType];
    if (meta) return `<i class="fa-solid ${meta.icon}" style="margin-right:6px;opacity:.7"></i>${meta.label}`;
    // Fallback: humanise snake_case
    const label = eventType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    return `<i class="fa-solid fa-clock-rotate-left" style="margin-right:6px;opacity:.7"></i>${label}`;
  }

  function auditDotClass(eventType) {
    return (AUDIT_EVENT_META[eventType] || {}).dot || 'pending';
  }

  /** Render payload as readable detail chips/lines instead of raw JSON */
  function renderAuditPayload(eventType, payload) {
    if (!payload || typeof payload !== 'object' || !Object.keys(payload).length) return '';

    const parts = [];

    // Special handling by event type
    if (eventType === 'analyst_review' || eventType === 'checkpoint_approved' || eventType === 'checkpoint_rejected') {
      if (payload.action) {
        const actionMap = {
          approve: { cls: 'chip-ok', label: 'Approved', icon: 'fa-check' },
          reject:  { cls: 'chip-error', label: 'Rejected', icon: 'fa-xmark' },
          request_info: { cls: 'chip-caution', label: 'More Info Requested', icon: 'fa-circle-question' },
        };
        const a = actionMap[payload.action] || { cls: '', label: payload.action, icon: 'fa-circle' };
        parts.push(`<span class="chip ${a.cls}"><i class="fa-solid ${a.icon}"></i> ${a.label}</span>`);
      }
      if (payload.new_status) {
        parts.push(`<span class="audit-detail-label">Status →</span> <span class="chip chip-info">${payload.new_status.replace(/_/g, ' ')}</span>`);
      }
      if (payload.checkpoint_name) {
        parts.push(`<span class="audit-detail-label">Gate:</span> ${payload.checkpoint_name.replace(/_/g, ' ')}`);
      }
      if (payload.comment) {
        parts.push(`<span class="audit-comment"><i class="fa-solid fa-quote-left" style="opacity:.4;margin-right:4px"></i>${escapeHtml(payload.comment)}</span>`);
      }
      return `<div class="audit-payload-details">${parts.join('')}</div>`;
    }

    if (eventType === 'document_uploaded' || eventType === 'document_parsed' || eventType === 'document_deleted') {
      if (payload.filename) parts.push(`<span class="audit-detail-label"><i class="fa-solid fa-file" style="opacity:.5;margin-right:4px"></i></span><span class="audit-detail-value">${escapeHtml(payload.filename)}</span>`);
      if (payload.document_type) parts.push(`<span class="chip chip-info">${payload.document_type}</span>`);
      if (payload.pages != null) parts.push(`<span class="audit-detail-value">${payload.pages} pages</span>`);
      if (parts.length) return `<div class="audit-payload-details">${parts.join('')}</div>`;
    }

    if (eventType === 'analysis_triggered') {
      if (payload.agents) parts.push(`<span class="audit-detail-label">Agents:</span> <span class="audit-detail-value">${Array.isArray(payload.agents) ? payload.agents.join(', ') : payload.agents}</span>`);
      if (payload.status) parts.push(`<span class="chip chip-info">${payload.status}</span>`);
      if (parts.length) return `<div class="audit-payload-details">${parts.join('')}</div>`;
    }

    // Generic fallback: render each key/value pair neatly
    for (const [k, v] of Object.entries(payload)) {
      if (v == null || v === '') continue;
      const key = k.replace(/_/g, ' ');
      const val = typeof v === 'object' ? JSON.stringify(v) : String(v);
      parts.push(`<span class="audit-detail-label">${key}:</span> <span class="audit-detail-value">${escapeHtml(val)}</span>`);
    }
    return parts.length ? `<div class="audit-payload-details">${parts.join('')}</div>` : '';
  }

  async function renderReviewTab(el, caseId, c) {
    el.innerHTML = `
      <div class="grid-2">
        <div class="card review-form-card">
          <div class="card-header"><h3><i class="fa-solid fa-clipboard-check" style="margin-right:8px;opacity:.7"></i>Submit Review</h3></div>
          <div class="form-group">
            <label><i class="fa-solid fa-user" style="margin-right:6px;opacity:.5"></i>Reviewer Name</label>
            <input class="form-control" id="rev-name" placeholder="Your name"/>
          </div>
          <div class="form-group">
            <label><i class="fa-solid fa-gavel" style="margin-right:6px;opacity:.5"></i>Decision</label>
            <select class="form-control" id="rev-action">
              <option value="approve">✓  Approve</option>
              <option value="reject">✗  Reject</option>
              <option value="request_info">?  Request More Info</option>
            </select>
          </div>
          <div class="form-group">
            <label><i class="fa-solid fa-comment" style="margin-right:6px;opacity:.5"></i>Comment</label>
            <textarea class="form-control" id="rev-comment" rows="3" placeholder="Optional comment…"></textarea>
          </div>
          <button class="btn btn-primary" id="btn-submit-review" style="width:100%">
            <i class="fa-solid fa-paper-plane" style="margin-right:6px"></i>Submit Review
          </button>
        </div>
        <div class="card audit-log-card" id="audit-log-area">
          <div class="card-header"><h3><i class="fa-solid fa-clock-rotate-left" style="margin-right:8px;opacity:.7"></i>Audit Log</h3></div>
          <div class="page-loading"><gds-spinner></gds-spinner></div>
        </div>
      </div>`;

    document.getElementById('btn-submit-review').addEventListener('click', async () => {
      const reviewer_name = document.getElementById('rev-name').value.trim();
      const action = document.getElementById('rev-action').value;
      const comment = document.getElementById('rev-comment').value.trim();
      if (!reviewer_name) { Components.toast('Name is required', 'error'); return; }
      try {
        await API.submitReview(caseId, { reviewer_name, action, comment });
        Components.toast('Review submitted');
        if (action === 'approve') Components.celebrate();
        loadAuditLog(caseId);
      } catch (err) { Components.toast(err.message, 'error'); }
    });

    loadAuditLog(caseId);
  }

  async function loadAuditLog(caseId) {
    const area = document.getElementById('audit-log-area');
    const header = '<div class="card-header"><h3><i class="fa-solid fa-clock-rotate-left" style="margin-right:8px;opacity:.7"></i>Audit Log</h3></div>';
    try {
      const data = await API.getAuditLog(caseId);
      const logs = data.audit_logs || [];
      if (!logs.length) {
        area.innerHTML = `${header}<div style="padding:24px;text-align:center">
          <i class="fa-regular fa-folder-open" style="font-size:2rem;opacity:.25;margin-bottom:8px;display:block"></i>
          <p class="text-muted" style="margin:0">No audit entries yet.</p>
        </div>`;
        return;
      }
      area.innerHTML = `
        ${header}
        <div class="audit-log-count text-muted">${logs.length} event${logs.length !== 1 ? 's' : ''}</div>
        <div class="audit-log-scroll">
        ${Components.timeline(logs.map(l => ({
          title: auditEventLabel(l.event_type),
          dotClass: auditDotClass(l.event_type),
          time: Components.fmtDate(l.timestamp),
          body: `<span class="audit-actor"><i class="fa-solid fa-user-circle" style="margin-right:4px;opacity:.5"></i>${escapeHtml(l.actor || 'system')}</span>${renderAuditPayload(l.event_type, l.payload)}`,
        })))}
        </div>`;
    } catch (err) {
      area.innerHTML = `${header}<p class="text-severe" style="padding:16px">Error loading log.</p>`;
    }
  }

  /* ---- Extraction structured view ---- */
  function renderExtractionView(ext) {
    const parts = [];

    // Confidence
    if (ext.confidence != null) {
      parts.push(`<div style="margin-bottom:12px">${Components.confidenceBar(ext.confidence)}</div>`);
    }

    // Extracted text preview
    if (ext.extracted_text) {
      const preview = ext.extracted_text.length > 600
        ? ext.extracted_text.slice(0, 600) + '…'
        : ext.extracted_text;
      parts.push(`
        <div style="margin-bottom:16px">
          <h4 style="font-size:.85rem;font-weight:600;margin-bottom:6px;color:var(--text-secondary)">
            <i class="fa-solid fa-file-lines" style="margin-right:6px;opacity:.6"></i>Extracted Text
          </h4>
          <div style="max-height:200px;overflow:auto;font-size:.82rem;white-space:pre-wrap;background:var(--bg-main,#f5f5f5);padding:12px;border-radius:8px;border:1px solid var(--border-color);line-height:1.6">${escapeHtml(preview)}</div>
        </div>`);
    }

    // Structured JSON — render as key-value table with syntax-highlighted nested JSON
    if (ext.extracted_json && typeof ext.extracted_json === 'object') {
      const json = ext.extracted_json;
      const renderValue = (val) => {
        if (val == null) return '<span class="text-muted">—</span>';
        if (Array.isArray(val)) {
          if (!val.length) return '<span class="text-muted">—</span>';
          if (val.every(v => typeof v !== 'object')) return escapeHtml(val.join(', '));
          return `<div class="json-view">${syntaxHighlightJson(JSON.stringify(val, null, 2))}</div>`;
        }
        if (typeof val === 'object') return `<div class="json-view">${syntaxHighlightJson(JSON.stringify(val, null, 2))}</div>`;
        if (typeof val === 'boolean') return val ? '<span style="color:var(--green-primary)">Yes</span>' : '<span class="text-muted">No</span>';
        if (typeof val === 'number') return `<span style="font-family:monospace;font-weight:600">${val}</span>`;
        return escapeHtml(String(val));
      };

      const rows = Object.entries(json)
        .filter(([k]) => k !== 'full_text')
        .map(([k, v]) => `<tr><td class="ext-key">${escapeHtml(k.replace(/_/g, ' '))}</td><td class="ext-val">${renderValue(v)}</td></tr>`)
        .join('');

      if (rows) {
        parts.push(`
          <div>
            <h4 style="font-size:.85rem;font-weight:600;margin-bottom:6px;color:var(--text-secondary)">
              <i class="fa-solid fa-code" style="margin-right:6px;opacity:.6"></i>Extracted Data
            </h4>
            <table class="extraction-table"><tbody>${rows}</tbody></table>
          </div>`);
      }

      // Full JSON view toggle
      parts.push(`
        <div style="margin-top:16px">
          <button class="btn btn-secondary btn-sm" id="btn-toggle-raw-json" style="font-size:.78rem">
            <i class="fa-solid fa-code"></i> Show Raw JSON
          </button>
          <div id="raw-json-container" style="display:none;margin-top:8px">
            <div class="json-view" style="max-height:350px">${syntaxHighlightJson(JSON.stringify(json, null, 2))}</div>
          </div>
        </div>`);
    }

    if (!parts.length) {
      parts.push('<p class="text-muted">No extraction data available.</p>');
    }

    // After rendering, wire up the toggle button
    setTimeout(() => {
      const togBtn = document.getElementById('btn-toggle-raw-json');
      const container = document.getElementById('raw-json-container');
      if (togBtn && container) {
        togBtn.addEventListener('click', () => {
          const showing = container.style.display !== 'none';
          container.style.display = showing ? 'none' : 'block';
          togBtn.innerHTML = showing
            ? '<i class="fa-solid fa-code"></i> Show Raw JSON'
            : '<i class="fa-solid fa-code"></i> Hide Raw JSON';
        });
      }
    }, 0);

    return `<div style="max-height:500px;overflow:auto">${parts.join('')}</div>`;
  }

  /** Syntax-highlight a JSON string with span classes */
  function syntaxHighlightJson(json) {
    return escapeHtml(json).replace(
      /("(\\u[a-fA-F0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?|\bnull\b|[{}\[\],])/g,
      (match) => {
        let cls = 'json-number';
        if (/^"/.test(match)) {
          cls = /:$/.test(match) ? 'json-key' : 'json-string';
          // Strip the colon from key for cleaner display and re-add it
          if (cls === 'json-key') {
            return `<span class="${cls}">${match.slice(0, -1)}</span>:`;
          }
        } else if (/true|false/.test(match)) {
          cls = 'json-bool';
        } else if (/null/.test(match)) {
          cls = 'json-null';
        } else if (/[{}\[\]]/.test(match)) {
          cls = 'json-brace';
        }
        return `<span class="${cls}">${match}</span>`;
      }
    );
  }

  function escapeHtml(str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  /* ---- Helpers ---- */
  function formatBytes(b) {
    if (!b) return '—';
    if (b < 1024) return b + ' B';
    if (b < 1048576) return (b / 1024).toFixed(1) + ' KB';
    return (b / 1048576).toFixed(1) + ' MB';
  }

  /* ---- Analysis polling & live status ---- */

  // Agent display names
  const AGENT_LABELS = {
    intake_agent:          'Intake',
    extraction_agent:      'Extraction',
    reconciliation_agent:  'Reconciliation',
    regulation_agent:      'Regulation',
    risk_process_agent:    'Risk Process',
    esg_agent:             'ESG',
    historical_agent:      'Historical',
    decision_agent:        'Decision',
  };

  // Terminal statuses where analysis is truly done (NOT pre-analysis statuses like created/new/uploaded)
  const TERMINAL_STATUSES = ['review_ready', 'approved', 'rejected', 'checkpoint_rejected', 'failed'];
  // Poll should also stop when workflow is paused at a human checkpoint.
  const POLL_STOP_STATUSES = [...TERMINAL_STATUSES, 'checkpoint_pending'];

  /**
   * Enter the analyzing visual state — disable button, show spinner, start polling.
   * Called both on fresh click and when re-rendering a page that's mid-analysis.
   */
  function _enterAnalyzingState(btnAnalyze, statusSection, caseId, container, docs, findings) {
    const btnOriginalHTML = '<i class="fa-solid fa-play"></i> Run Analysis';
    btnAnalyze.disabled = true;
    btnAnalyze.classList.add('btn-analyzing');
    btnAnalyze.innerHTML = `
      <i class="fa-solid fa-spinner fa-spin"></i>
      Analyzing… <span id="analysis-timer" class="analysis-timer">0:00</span>`;
    _startAnalysisPoll(btnAnalyze, btnOriginalHTML, statusSection, caseId, container, docs, findings);
  }

  /**
   * Start polling agent-runs every 2s to update the live status section.
   * Uses sequential setTimeout to avoid request pileup when backend is slow.
   * Only stops when the case reaches a true terminal status.
   */
  function _startAnalysisPoll(btnAnalyze, btnOriginalHTML, statusSection, caseId, container, docs, findings) {
    // Start the timer
    const timerId = Components.startTimer('analysis-timer');
    statusSection.style.display = 'block';
    statusSection.innerHTML = `
      <div class="analysis-status-inner">
        <div class="analysis-status-header">
          <i class="fa-solid fa-gear fa-spin"></i>
          <span>Analysis in progress…</span>
        </div>
        <div id="analysis-agent-steps" class="analysis-agent-steps">
          <div class="text-muted">Starting pipeline…</div>
        </div>
      </div>`;

    let pollActive = true;

    async function pollOnce() {
      if (!pollActive) return;

      // Defensive guard: if UI already shows a paused/failed state, stop polling.
      const statusText = (container.querySelector('.header-actions')?.textContent || '')
        .toLowerCase();
      if (statusText.includes('checkpoint pending') || statusText.includes('failed')) {
        Components.stopTimer(timerId);
        pollActive = false;
        return;
      }

      // Check if our DOM elements are still in the page (guard against navigation)
      if (!document.getElementById('analysis-status-section')) {
        Components.stopTimer(timerId);
        pollActive = false;
        return;
      }

      try {
        // Invalidate cache so we always get fresh data during polling
        API.invalidateCache(`/cases/${caseId}`);

        const [freshCase, runsData] = await Promise.all([
          API.getCase(caseId),
          API.getAgentRuns(caseId),
        ]);
        const runs = runsData.agent_runs || [];

        // Checkpoint pause is handled by the general POLL_STOP_STATUSES block
        // below, which does a full re-render to show fresh agent statuses and
        // the checkpoint approval UI in the pipeline tab.

        // Update live status display
        _renderAnalysisProgress(runs, freshCase.status);

        // Update pipeline tab if it's the active tab
        const activeTab = container.querySelector('.tab.active');
        if (activeTab?.dataset.tab === 'pipeline') {
          renderTab('pipeline', caseId, freshCase, docs, findings);
        }

        // Stop polling when analysis is done OR paused at checkpoint
        if (POLL_STOP_STATUSES.includes(freshCase.status)) {
          Components.stopTimer(timerId);
          pollActive = false;

          const isFailed = freshCase.status === 'failed';
          const isCheckpointPending = freshCase.status === 'checkpoint_pending';

          // Update UI in-place to avoid jarring full-page reload
          btnAnalyze.classList.remove('btn-analyzing');
          btnAnalyze.innerHTML = btnOriginalHTML;
          btnAnalyze.disabled = false;

          // Update status chip in-place
          const chipEl = container.querySelector('.header-actions .status-chip, .header-actions gds-badge');
          if (chipEl) chipEl.outerHTML = Components.statusChip(freshCase.status);

          // Show completion/pause message in the progress section
          const stepsEl = document.getElementById('analysis-agent-steps');
          const headerEl = statusSection.querySelector('.analysis-status-header');
          if (headerEl) {
            if (isCheckpointPending) {
              headerEl.innerHTML = `<i class="fa-solid fa-circle-pause"></i> <span>Paused — awaiting checkpoint approval</span>`;
              if (stepsEl) stepsEl.innerHTML = `<div class="text-muted">Open the Agent Pipeline tab to approve or reject the checkpoint.</div>`;
            } else if (isFailed) {
              headerEl.innerHTML = `<i class="fa-solid fa-circle-xmark" style="color:var(--gds-sys-color-container-negative)"></i> <span>Analysis failed — check agent pipeline for details</span>`;
            } else {
              headerEl.innerHTML = `<i class="fa-solid fa-circle-check"></i> <span>Analysis complete</span>`;
            }
          }

          // Pre-fetch data into cache, then do a smooth re-render
          API.invalidateCache(`/cases/${caseId}`);
          try {
            await Promise.all([
              API.getCase(caseId),
              API.listDocuments(caseId),
              API.getFindings(caseId).catch(() => {}),
            ]);
          } catch (_) { /* ignore */ }
          render(container, caseId);
          return;
        }
      } catch (_) { /* ignore polling errors */ }

      // Schedule next poll only after current one completes
      if (pollActive) setTimeout(pollOnce, 2000);
    }

    // Start first poll after a short delay
    setTimeout(pollOnce, 2000);
  }

  /**
   * Render the progress steps inside the status section.
   */
  function _renderAnalysisProgress(runs, caseStatus) {
    const el = document.getElementById('analysis-agent-steps');
    if (!el) return;

    const stepOrder = [
      'intake_agent', 'extraction_agent',
      'reconciliation_agent',
      'regulation_agent', 'risk_process_agent', 'esg_agent',
      'historical_agent', 'decision_agent',
    ];

    const runMap = {};
    runs.forEach(r => { runMap[r.agent_name] = r; });

    // Find current running agent for the header
    const runningAgent = runs.find(r => r.status === 'running');
    const headerEl = el.parentElement?.querySelector('.analysis-status-header span');
    if (headerEl) {
      if (caseStatus === 'checkpoint_pending') {
        headerEl.textContent = 'Paused — awaiting checkpoint approval';
        const iconEl = el.parentElement?.querySelector('.analysis-status-header i');
        if (iconEl) { iconEl.className = 'fa-solid fa-circle-pause'; }
      } else if (runningAgent) {
        headerEl.textContent = `Running: ${AGENT_LABELS[runningAgent.agent_name] || runningAgent.agent_name} agent…`;
      } else {
        headerEl.textContent = 'Analysis in progress…';
      }
    }

    // Checkpoints inserted after certain agents
    const checkpointsAfter = {
      extraction_agent: 'Post-Extraction',
      esg_agent: 'Post-Regulation',
      decision_agent: 'Pre-Decision',
    };

    let html = '';
    for (const name of stepOrder) {
      const run = runMap[name];
      const label = AGENT_LABELS[name] || name;
      let icon = 'fa-solid fa-circle text-muted';
      let statusText = 'Pending';
      let stepClass = 'pending';

      if (run) {
        switch (run.status) {
          case 'running':
            icon = 'fa-solid fa-spinner fa-spin';
            statusText = 'Running…';
            stepClass = 'running';
            break;
          case 'completed':
            icon = 'fa-solid fa-circle-check';
            statusText = 'Completed';
            stepClass = 'completed';
            break;
          case 'failed':
            icon = 'fa-solid fa-circle-xmark';
            statusText = 'Failed';
            stepClass = 'failed';
            break;
          default:
            icon = 'fa-solid fa-circle text-muted';
            statusText = 'Pending';
            stepClass = 'pending';
        }
      }

      html += `
        <div class="analysis-step analysis-step--${stepClass}">
          <i class="${icon}"></i>
          <span class="analysis-step-label">${label}</span>
          <span class="analysis-step-status">${statusText}</span>
        </div>`;

      // Add checkpoint marker after relevant agents
      if (checkpointsAfter[name]) {
        const cpLabel = checkpointsAfter[name];
        // Check if all agents up to this point are completed
        const agentsBeforeCp = stepOrder.slice(0, stepOrder.indexOf(name) + 1);
        const allDone = agentsBeforeCp.every(a => runMap[a]?.status === 'completed');
        const cpClass = allDone ? (caseStatus === 'checkpoint_pending' ? 'waiting' : 'completed') : 'pending';
        html += `
          <div class="analysis-step analysis-step--checkpoint analysis-step--${cpClass}">
            <i class="fa-solid fa-shield-halved"></i>
            <span class="analysis-step-label">${cpLabel} Review</span>
            <span class="analysis-step-status">${cpClass === 'waiting' ? 'Awaiting approval' : cpClass === 'completed' ? 'Approved' : ''}</span>
          </div>`;
      }
    }

    el.innerHTML = html;
  }

  return { render };
})();
