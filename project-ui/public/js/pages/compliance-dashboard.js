/**
 * Page: Compliance Dashboard — regulation findings, compliance status, and charts
 */
const ComplianceDashboardPage = (() => {

  async function render(container, caseId) {
    Components.disposeCharts();
    container.innerHTML = '<div class="page-loading"><gds-spinner></gds-spinner><p>Loading compliance data…</p></div>';

    try {
      const [caseData, findingsData, raData, regsData] = await Promise.all([
        API.getCase(caseId),
        API.getFindings(caseId),
        API.getRiskAssessment(caseId).catch(() => null),
        API.listRegulations(),
      ]);

      const findings = (findingsData.findings || []);
      const compFindings = findings.filter(f => f.finding_type === 'compliance');
      const regs = regsData.regulations || [];

      const severityCounts = { critical: 0, high: 0, medium: 0, low: 0 };
      compFindings.forEach(f => { if (severityCounts[f.severity] !== undefined) severityCounts[f.severity]++; });

      // Compliance status from risk assessment details (assess_compliance output)
      const compDetails = raData?.details || {};
      const compCompliant = compDetails.compliant_count ?? 0;
      const compNonCompliant = compDetails.non_compliant_count ?? 0;
      const compUnknown = compDetails.unknown_count ?? 0;
      const hasCompStatus = compCompliant + compNonCompliant + compUnknown > 0;

      // Build all-findings severity for chart (across all types, not just compliance)
      const allSevCounts = { critical: 0, high: 0, medium: 0, low: 0 };
      findings.forEach(f => { if (allSevCounts[f.severity] !== undefined) allSevCounts[f.severity]++; });

      container.innerHTML = `
        <div class="breadcrumbs">
          <a href="#/">Cases</a> <span class="sep">/</span>
          <a href="#/cases/${caseId}">${caseData.company_name}</a> <span class="sep">/</span>
          <span>Compliance</span>
        </div>
        <div class="page-header">
          <h1>Compliance Dashboard</h1>
          ${raData ? Components.statusChip(raData.compliance_status || 'pending') : ''}
        </div>

        <!-- Summary stats -->
        <div class="grid-4 mb-24">
          <div class="stat-card">
            <div class="stat-value text-severe">${severityCounts.critical}</div>
            <div class="stat-label">Critical</div>
          </div>
          <div class="stat-card">
            <div class="stat-value text-severe">${severityCounts.high}</div>
            <div class="stat-label">High</div>
          </div>
          <div class="stat-card">
            <div class="stat-value text-caution">${severityCounts.medium}</div>
            <div class="stat-label">Medium</div>
          </div>
          <div class="stat-card">
            <div class="stat-value text-ok">${severityCounts.low}</div>
            <div class="stat-label">Low</div>
          </div>
        </div>

        <!-- Charts row -->
        ${(compFindings.length > 0 || hasCompStatus) ? `
        <div class="chart-row mb-16">
          ${compFindings.length > 0 ? `
          <div class="card">
            <div class="card-header"><h3>Findings Severity</h3></div>
            <div id="chart-comp-severity" class="chart-container"></div>
          </div>` : ''}
          ${hasCompStatus ? `
          <div class="card">
            <div class="card-header"><h3>Compliance Status</h3></div>
            <div id="chart-comp-status" class="chart-container"></div>
          </div>` : ''}
        </div>` : ''}

        <!-- Findings -->
        <div class="card mb-16">
          <div class="card-header"><h3>Compliance Findings (${compFindings.length})</h3></div>
          ${compFindings.length === 0 ?
            '<p class="text-muted">No compliance findings yet.</p>' :
            compFindings.map(f => `
              <div class="finding-item">
                <div class="finding-header">
                  <span class="finding-title">${f.title}</span>
                  ${Components.severityChip(f.severity)}
                </div>
                <div class="finding-body">${f.description}</div>
                ${f.source_refs ? `
                  <div class="evidence-panel mt-8">
                    <div class="evidence-source">Source References</div>
                    <div class="evidence-text">${JSON.stringify(f.source_refs)}</div>
                  </div>` : ''}
              </div>`).join('')
          }
        </div>

        <!-- Active Regulations -->
        <div class="card">
          <div class="card-header"><h3>Active Regulation Sources (${regs.length})</h3></div>
          ${regs.length === 0 ?
            '<p class="text-muted">No regulations loaded.</p>' :
            `<table class="data-table">
              <thead><tr><th>Name</th><th>Type</th><th>Version</th><th>Status</th></tr></thead>
              <tbody>
                ${regs.map(r => `<tr>
                  <td>${r.source_name}</td>
                  <td>${r.source_type}</td>
                  <td class="mono">${r.version || '—'}</td>
                  <td>${r.active ? Components.statusChip('approved') : Components.statusChip('rejected')}</td>
                </tr>`).join('')}
              </tbody>
            </table>`
          }
        </div>
      `;

      // ── Render charts ──
      renderCharts(severityCounts, compCompliant, compNonCompliant, compUnknown);

    } catch (err) {
      container.innerHTML = `<div class="empty-state text-severe">Error: ${err.message}</div>`;
    }
  }

  function renderCharts(sevCounts, compliant, nonCompliant, unknown) {
    // 1. Severity Donut
    const sevData = Object.entries(sevCounts)
      .filter(([, v]) => v > 0)
      .map(([k, v]) => ({ name: k.charAt(0).toUpperCase() + k.slice(1), value: v }));

    if (sevData.length > 0) {
      const colors = sevData.map(d => Components.SEVERITY_COLORS[d.name.toLowerCase()] || '#868686');
      Components.initChart('chart-comp-severity', {
        tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
        legend: { bottom: 0, left: 'center' },
        series: [{
          type: 'pie',
          radius: ['40%', '65%'],
          center: ['50%', '45%'],
          avoidLabelOverlap: true,
          itemStyle: { borderRadius: 4, borderColor: '#fff', borderWidth: 2 },
          label: { show: true, formatter: '{b}\n{c}', fontSize: 12 },
          data: sevData.map((d, i) => ({ ...d, itemStyle: { color: colors[i] } })),
        }],
      });
    }

    // 2. Compliance Status Donut
    const total = compliant + nonCompliant + unknown;
    if (total > 0) {
      Components.initChart('chart-comp-status', {
        tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
        legend: { bottom: 0, left: 'center' },
        series: [{
          type: 'pie',
          radius: ['40%', '65%'],
          center: ['50%', '45%'],
          avoidLabelOverlap: true,
          itemStyle: { borderRadius: 4, borderColor: '#fff', borderWidth: 2 },
          label: { show: true, formatter: '{b}\n{c}', fontSize: 12 },
          data: [
            { name: 'Compliant',     value: compliant,     itemStyle: { color: '#60cd18' } },
            { name: 'Non-compliant', value: nonCompliant,  itemStyle: { color: '#f03529' } },
            { name: 'Unknown',       value: unknown,       itemStyle: { color: '#868686' } },
          ].filter(d => d.value > 0),
        }],
      });
    }
  }

  return { render };
})();
