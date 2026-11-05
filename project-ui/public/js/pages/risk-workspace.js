/**
 * Page: Risk Workspace — full risk assessment view with evidence and charts
 */
const RiskWorkspacePage = (() => {

  const LEVEL_MAP = { low: 1, moderate: 2, elevated: 3, high: 4 };

  async function render(container, caseId) {
    Components.disposeCharts();
    container.innerHTML = '<div class="page-loading"><gds-spinner></gds-spinner><p>Loading risk workspace…</p></div>';

    try {
      const [caseData, findingsData, raData, runsData] = await Promise.all([
        API.getCase(caseId),
        API.getFindings(caseId),
        API.getRiskAssessment(caseId).catch(() => null),
        API.getAgentRuns(caseId),
      ]);

      const findings = findingsData.findings || [];
      const runs = runsData.agent_runs || [];

      // Group findings by type
      const groups = {};
      findings.forEach(f => {
        if (!groups[f.finding_type]) groups[f.finding_type] = [];
        groups[f.finding_type].push(f);
      });

      // Severity counts for donut
      const sevCounts = { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
      findings.forEach(f => { if (sevCounts[f.severity] !== undefined) sevCounts[f.severity]++; });

      // Try to load historical matches
      let historical = [];
      try {
        const hist = await API.searchHistorical({
          sector: caseData.sector || '',
          country: caseData.country || ''
        });
        historical = hist.cases || [];
      } catch (_) {}

      container.innerHTML = `
        <div class="breadcrumbs">
          <a href="#/">Cases</a> <span class="sep">/</span>
          <a href="#/cases/${caseId}">${caseData.company_name}</a> <span class="sep">/</span>
          <span>Risk Workspace</span>
        </div>
        <div class="page-header">
          <h1>Risk Workspace</h1>
          ${raData ? Components.riskBadge(raData.proposed_risk_class) : '<span class="chip chip-info">pending</span>'}
        </div>

        <!-- Agent pipeline -->
        <div class="card mb-16">
          <div class="card-header"><h3>Analysis Pipeline</h3></div>
          ${Components.agentPipeline(runs)}
        </div>

        <!-- Charts row: Findings Donut + Confidence Gauge -->
        ${findings.length > 0 || raData ? `
        <div class="chart-row mb-16">
          ${findings.length > 0 ? `
          <div class="card">
            <div class="card-header"><h3>Findings by Severity</h3></div>
            <div id="chart-severity-donut" class="chart-container"></div>
          </div>` : ''}
          ${raData ? `
          <div class="card">
            <div class="card-header"><h3>Confidence</h3></div>
            <div id="chart-confidence-gauge" class="chart-container"></div>
          </div>` : ''}
        </div>` : ''}

        <div class="grid-2">
          <!-- Risk Assessment -->
          <div class="card">
            <div class="card-header"><h3>Risk Assessment</h3></div>
            ${raData ? `
              <div style="text-align:center;padding:16px 0">
                ${Components.riskBadge(raData.proposed_risk_class)}
              </div>
              ${raData.details?.risk_factors?.length ? `
                <div id="chart-risk-radar" class="chart-container"></div>
              ` : ''}
              <dl class="detail-grid mt-16">
                <dt>Compliance</dt><dd>${raData.compliance_status || '—'}</dd>
                <dt>Confidence</dt><dd>${Components.confidenceBar(raData.confidence)}</dd>
                <dt>Recommendation</dt><dd>${raData.recommendation || '—'}</dd>
              </dl>
              <div class="evidence-panel mt-16">
                <div class="evidence-source">Agent Reasoning</div>
                <div class="evidence-text">${raData.reasoning || 'No reasoning provided.'}</div>
              </div>
              ${raData.details ? renderRiskDetails(raData.details) : ''}
            ` : '<div class="empty-state"><p>No assessment yet. Run analysis first.</p></div>'}
          </div>

          <!-- Findings by category -->
          <div>
            ${Object.keys(groups).length === 0 ?
              '<div class="card"><div class="empty-state"><p>No findings yet.</p></div></div>' :
              Object.entries(groups).map(([type, items]) => `
                <div class="card mb-16">
                  <div class="card-header">
                    <h3>${type.charAt(0).toUpperCase() + type.slice(1)} Findings (${items.length})</h3>
                  </div>
                  ${items.map(f => `
                    <div class="finding-item">
                      <div class="finding-header">
                        <span class="finding-title">${f.title}</span>
                        ${Components.severityChip(f.severity)}
                      </div>
                      <div class="finding-body">${f.description}</div>
                    </div>`).join('')}
                </div>`).join('')
            }
          </div>
        </div>

        <!-- Historical comparisons -->
        ${historical.length > 0 ? `
        <div class="card mt-16">
          <div class="card-header"><h3>Similar Historical Cases</h3></div>
          <table class="data-table">
            <thead><tr>
              <th>Company</th><th>Sector</th><th>Country</th><th>Risk Class</th><th>Outcome</th>
            </tr></thead>
            <tbody>
              ${historical.map(h => `<tr>
                <td>${h.company_name}</td>
                <td>${h.sector}</td>
                <td>${h.country}</td>
                <td>${Components.riskBadge(h.final_risk_class)}</td>
                <td>${h.outcome || '—'}</td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>` : ''}
      `;

      // ── Render charts (after DOM is in place) ──
      renderCharts(raData, sevCounts);

    } catch (err) {
      container.innerHTML = `<div class="empty-state text-severe">Error: ${err.message}</div>`;
    }
  }

  // ── Chart rendering ──
  function renderCharts(raData, sevCounts) {
    // 1. Risk Factor Radar
    if (raData?.details?.risk_factors?.length) {
      const factors = raData.details.risk_factors;
      const indicators = factors.map(f => ({ name: f.factor.replace(' Risk', ''), max: 4 }));
      const values = factors.map(f => LEVEL_MAP[f.level] || 0);

      Components.initChart('chart-risk-radar', {
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
      Components.initChart('chart-severity-donut', {
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
    if (raData?.confidence != null) {
      const pct = Math.round(raData.confidence * 100);
      Components.initChart('chart-confidence-gauge', {
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
          title: {
            offsetCenter: [0, '80%'],
            fontSize: 13,
            color: '#868686',
          },
          data: [{ value: pct, name: 'Assessment Confidence' }],
        }],
      });
    }
  }

  function renderRiskDetails(details) {
    if (!details || typeof details !== 'object') return '';
    let html = '<div class="mt-16">';

    if (details.risk_factors?.length) {
      html += '<h4 class="mb-8 fw-600" style="font-size:.9rem">Risk Factors</h4>';
      details.risk_factors.forEach(f => {
        html += `<div class="finding-item">
          <div class="finding-header">
            <span class="finding-title">${f.factor || f}</span>
            ${f.severity ? Components.severityChip(f.severity) : ''}
          </div>
          ${f.description ? `<div class="finding-body">${f.description}</div>` : ''}
        </div>`;
      });
    }

    if (details.missing_items?.length) {
      html += '<h4 class="mb-8 mt-16 fw-600" style="font-size:.9rem">Missing Items</h4>';
      html += '<ul style="padding-left:20px;font-size:.88rem">';
      details.missing_items.forEach(m => { html += `<li>${m}</li>`; });
      html += '</ul>';
    }

    if (details.next_actions?.length) {
      html += '<h4 class="mb-8 mt-16 fw-600" style="font-size:.9rem">Recommended Next Actions</h4>';
      html += '<ol style="padding-left:20px;font-size:.88rem">';
      details.next_actions.forEach(a => { html += `<li>${a}</li>`; });
      html += '</ol>';
    }

    html += '</div>';
    return html;
  }

  return { render };
})();
