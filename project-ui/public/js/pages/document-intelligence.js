/**
 * Page: Document Intelligence — deep-dive into parsed documents
 */
const DocumentIntelligencePage = (() => {

  async function render(container, caseId, docId) {
    container.innerHTML = '<div class="page-loading"><gds-spinner></gds-spinner><p>Loading document…</p></div>';

    try {
      const [caseData, docsData] = await Promise.all([
        API.getCase(caseId),
        API.listDocuments(caseId),
      ]);
      const doc = (docsData.documents || []).find(d => d.id === docId);
      if (!doc) throw new Error('Document not found');

      let extraction = null;
      if (doc.parsed_status === 'completed') {
        try { extraction = await API.getExtraction(docId); } catch (_) {}
      }

      container.innerHTML = `
        <div class="breadcrumbs">
          <a href="#/">Cases</a> <span class="sep">/</span>
          <a href="#/cases/${caseId}">${caseData.company_name}</a> <span class="sep">/</span>
          <span>${doc.filename}</span>
        </div>
        <div class="page-header">
          <h1>${doc.filename}</h1>
          ${Components.statusChip(doc.parsed_status)}
        </div>

        <div class="grid-2">
          <div class="card">
            <div class="card-header"><h3>File Details</h3></div>
            <dl class="detail-grid">
              <dt>Type</dt><dd>${doc.file_type}</dd>
              <dt>Size</dt><dd>${formatBytes(doc.file_size)}</dd>
              <dt>Uploaded</dt><dd>${Components.fmtDate(doc.uploaded_at)}</dd>
              <dt>Parse Status</dt><dd>${Components.statusChip(doc.parsed_status)}</dd>
              <dt>OCR Used</dt><dd>${doc.ocr_used ? 'Yes' : 'No'}</dd>
            </dl>
            ${doc.parsed_status !== 'completed' ?
              `<button class="btn btn-primary btn-sm mt-16" id="btn-parse-doc">Parse Document</button>` : ''}
          </div>

          <div class="card">
            <div class="card-header"><h3>Extraction Confidence</h3></div>
            ${extraction ? `
              <div class="mt-8">${Components.confidenceBar(extraction.confidence)}</div>
              <p class="text-muted mt-8">Overall confidence of text/data extraction accuracy.</p>
            ` : '<p class="text-muted">Not parsed yet.</p>'}
          </div>
        </div>

        ${extraction ? `
        <div class="card mt-16">
          <div class="card-header"><h3>Extracted Text</h3></div>
          <div class="evidence-panel" style="max-height:400px;overflow:auto">
            <div class="evidence-text" style="white-space:pre-wrap;font-size:.85rem">${escapeHtml(extraction.extracted_text || '')}</div>
          </div>
        </div>

        ${extraction.extracted_json ? `
        <div class="card mt-16">
          <div class="card-header"><h3>Structured Data</h3></div>
          <div class="json-view" style="max-height:500px;overflow:auto;margin:16px">${syntaxHighlightJson(JSON.stringify(extraction.extracted_json, null, 2))}</div>
        </div>
        ` : ''}
        ` : ''}
      `;

      const parseBtn = document.getElementById('btn-parse-doc');
      if (parseBtn) {
        parseBtn.addEventListener('click', async () => {
          try {
            await API.parseDocument(docId);
            Components.toast('Parsing started');
            setTimeout(() => render(container, caseId, docId), 2000);
          } catch (err) { Components.toast(err.message, 'error'); }
        });
      }

    } catch (err) {
      container.innerHTML = `<div class="empty-state text-severe">Error: ${err.message}</div>`;
    }
  }

  function formatBytes(b) {
    if (!b) return '—';
    if (b < 1024) return b + ' B';
    if (b < 1048576) return (b / 1024).toFixed(1) + ' KB';
    return (b / 1048576).toFixed(1) + ' MB';
  }

  function escapeHtml(s) {
    const div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  function syntaxHighlightJson(json) {
    return escapeHtml(json).replace(
      /("(\\u[a-fA-F0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?|\bnull\b|[{}\[\],])/g,
      (match) => {
        let cls = 'json-number';
        if (/^"/.test(match)) {
          cls = /:$/.test(match) ? 'json-key' : 'json-string';
          if (cls === 'json-key') return `<span class="${cls}">${match.slice(0, -1)}</span>:`;
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

  return { render };
})();
