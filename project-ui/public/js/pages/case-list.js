/**
 * Page: Case List (home)
 */
const CaseListPage = (() => {

  async function render(container) {
    container.innerHTML = `
      <div class="page-header">
        <h1>Cases</h1>
        <button class="btn-run-analysis" id="btn-new-case">
          <i class="fa-solid fa-plus"></i>
          New Case
        </button>
      </div>
      <div class="card">
        <div id="case-table-area">
          <div class="page-loading"><gds-spinner></gds-spinner><p>Loading cases…</p></div>
        </div>
      </div>`;

    document.getElementById('btn-new-case').addEventListener('click', showNewCaseModal);
    await loadCases();
  }

  async function loadCases() {
    try {
      const data = await API.listCases();
      const cases = data.cases || [];
      if (cases.length === 0) {
        document.getElementById('case-table-area').innerHTML = `
          <div class="empty-state">
            <div class="empty-icon"><i class="fa-regular fa-clipboard"></i></div>
            <p>No cases yet. Create your first case to get started.</p>
          </div>`;
        return;
      }

      const columns = [
        { key: 'case_number', label: 'Case #' },
        { key: 'company_name', label: 'Company' },
        { key: 'sector', label: 'Sector' },
        { key: 'country', label: 'Country' },
        { key: 'status', label: 'Status', render: r => Components.statusChip(r.status) },
        { key: 'created_at', label: 'Created', render: r => Components.fmtDate(r.created_at) },
        { key: '_actions', label: '', render: r =>
          `<button class="btn btn-sm btn-danger delete-case-btn" data-case-id="${r.id}" data-case-name="${r.company_name}" title="Delete case">
            <i class="fa-solid fa-trash-can"></i>
          </button>` },
      ];

      document.getElementById('case-table-area').innerHTML =
        Components.sortableTable('case-list', columns, cases, (row) => {
          window.location.hash = `/cases/${row.id}`;
        });
    } catch (err) {
      document.getElementById('case-table-area').innerHTML =
        `<div class="empty-state text-severe">Error loading cases: ${err.message}</div>`;
    }
  }

  function showNewCaseModal() {
    const body = `
      <div class="form-group">
        <label for="nc-company">Company Name</label>
        <input class="form-control" id="nc-company" placeholder="e.g. Nordic Energy AB"/>
      </div>
      <div class="grid-2">
        <div class="form-group">
          <label for="nc-sector">Sector</label>
          <select class="form-control" id="nc-sector">
            <option value="">Select…</option>
            <option>Energy</option>
            <option>Finance</option>
            <option>Technology</option>
            <option>Healthcare</option>
            <option>Manufacturing</option>
            <option>Real Estate</option>
            <option>Retail</option>
            <option>Other</option>
          </select>
        </div>
        <div class="form-group">
          <label for="nc-country">Country</label>
          <input class="form-control" id="nc-country" placeholder="e.g. Sweden"/>
        </div>
      </div>`;

    const actions = `
      <button class="btn btn-secondary" onclick="Components.closeModal()">Cancel</button>
      <button class="btn btn-primary" id="nc-submit">Create Case</button>`;

    Components.showModal('New Case', body, actions);

    document.getElementById('nc-submit').addEventListener('click', async () => {
      const company = document.getElementById('nc-company').value.trim();
      const sector = document.getElementById('nc-sector').value;
      const country = document.getElementById('nc-country').value.trim();
      if (!company) { Components.toast('Company name is required', 'error'); return; }
      try {
        const c = await API.createCase({ company_name: company, sector, country });
        Components.closeModal();
        Components.toast(`Case ${c.case_number} created`);
        window.location.hash = `/cases/${c.id}`;
      } catch (err) {
        Components.toast(err.message, 'error');
      }
    });
  }

  function confirmDeleteCase(caseId, caseName) {
    const body = `
      <p>Are you sure you want to delete the case for <strong>${caseName}</strong>?</p>
      <p class="text-muted" style="font-size:.85rem">This will permanently remove all documents, findings, assessments, and audit logs associated with this case.</p>`;
    const actions = `
      <button class="btn btn-secondary" onclick="Components.closeModal()">Cancel</button>
      <button class="btn btn-danger" id="confirm-delete-case">Delete Case</button>`;
    Components.showModal('Delete Case', body, actions);

    document.getElementById('confirm-delete-case').addEventListener('click', async () => {
      try {
        await API.deleteCase(caseId);
        Components.closeModal();
        Components.toast('Case deleted');
        await loadCases();
      } catch (err) {
        Components.toast(err.message, 'error');
      }
    });
  }

  // Delegated click handler for delete buttons (survives table re-sorts)
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.delete-case-btn');
    if (btn) {
      e.stopPropagation();
      confirmDeleteCase(btn.dataset.caseId, btn.dataset.caseName);
    }
  });

  return { render };
})();
