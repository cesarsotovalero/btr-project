/**
 * Page: Audit Trace — full audit log for a case
 */
const AuditTracePage = (() => {

  async function render(container, caseId) {
    container.innerHTML = '<div class="page-loading"><gds-spinner></gds-spinner><p>Loading audit trail…</p></div>';

    try {
      const [caseData, auditData, runsData] = await Promise.all([
        API.getCase(caseId),
        API.getAuditLog(caseId),
        API.getAgentRuns(caseId),
      ]);

      const logs = auditData.audit_logs || [];
      const runs = runsData.agent_runs || [];

      // Merge into a unified timeline
      const allEvents = [];

      logs.forEach(l => {
        allEvents.push({
          time: l.timestamp,
          title: l.event_type,
          actor: l.actor || 'system',
          body: typeof l.payload === 'object' ? JSON.stringify(l.payload) : (l.payload || ''),
          type: 'audit',
          dotClass: 'completed',
        });
      });

      runs.forEach(r => {
        allEvents.push({
          time: r.started_at,
          title: `Agent: ${r.agent_name.replace(/_/g, ' ')}`,
          actor: 'system',
          body: r.error_message ? `Error: ${r.error_message}` : `Status: ${r.status}`,
          type: 'agent',
          dotClass: r.status === 'completed' ? 'completed' : r.status === 'failed' ? 'failed' : 'running',
        });
      });

      // Sort by time descending
      allEvents.sort((a, b) => new Date(b.time) - new Date(a.time));

      container.innerHTML = `
        <div class="breadcrumbs">
          <a href="#/">Cases</a> <span class="sep">/</span>
          <a href="#/cases/${caseId}">${caseData.company_name}</a> <span class="sep">/</span>
          <span>Audit Trace</span>
        </div>
        <div class="page-header">
          <h1>Audit Trace</h1>
          <span class="text-muted">${allEvents.length} events</span>
        </div>

        <!-- Filter -->
        <div class="card mb-16 flex-center">
          <label class="fw-600" style="font-size:.85rem">Filter:</label>
          <button class="btn btn-secondary btn-sm filter-btn active" data-filter="all">All</button>
          <button class="btn btn-secondary btn-sm filter-btn" data-filter="audit">Audit Logs</button>
          <button class="btn btn-secondary btn-sm filter-btn" data-filter="agent">Agent Runs</button>
        </div>

        <div class="card" id="audit-timeline">
          ${allEvents.length === 0 ?
            '<div class="empty-state"><div class="empty-icon"><i class="fa-solid fa-clipboard-list"></i></div><p>No events recorded yet.</p></div>' :
            renderTimeline(allEvents, 'all')
          }
        </div>
      `;

      // Filter buttons
      container.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          container.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const area = document.getElementById('audit-timeline');
          area.innerHTML = renderTimeline(allEvents, btn.dataset.filter);
        });
      });

    } catch (err) {
      container.innerHTML = `<div class="empty-state text-severe">Error: ${err.message}</div>`;
    }
  }

  function renderTimeline(events, filter) {
    let filtered = events;
    if (filter !== 'all') filtered = events.filter(e => e.type === filter);

    if (filtered.length === 0) return '<p class="text-muted" style="padding:20px">No events for this filter.</p>';

    return Components.timeline(filtered.map(e => ({
      title: e.title,
      time: Components.fmtDate(e.time),
      dotClass: e.dotClass,
      body: `<strong>${e.actor}</strong> — ${e.body}`,
    })));
  }

  return { render };
})();
