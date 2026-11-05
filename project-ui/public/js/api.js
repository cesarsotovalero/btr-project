/**
 * BTR — API client wrapper with TTL cache
 */
const API = (() => {
  const BASE = '/api';

  /* ---- In-memory GET cache ---- */
  const _cache = new Map();        // key → { data, ts }
  const CACHE_TTL = 30_000;        // 30 seconds

  /** Return cached data if still valid, else undefined. */
  function _cacheGet(key) {
    const entry = _cache.get(key);
    if (entry && Date.now() - entry.ts < CACHE_TTL) return entry.data;
    if (entry) _cache.delete(key);
    return undefined;
  }

  /** Store response data in cache. */
  function _cacheSet(key, data) {
    _cache.set(key, { data, ts: Date.now() });
  }

  /**
   * Invalidate cache entries whose key starts with the given prefix.
   * Called automatically on mutating requests (POST/PUT/PATCH/DELETE).
   */
  function _cacheInvalidate(prefix) {
    for (const key of _cache.keys()) {
      if (key.startsWith(prefix)) _cache.delete(key);
    }
  }

  /** Public: force-clear the entire cache (e.g. after login/logout). */
  function invalidateCache(prefix) {
    if (prefix) {
      _cacheInvalidate(prefix);
    } else {
      _cache.clear();
    }
  }

  async function request(method, path, body, isFormData = false) {
    const isGet = method === 'GET';

    // Serve from cache for GET requests
    if (isGet) {
      const cached = _cacheGet(path);
      if (cached !== undefined) return cached;
    }

    const opts = { method, headers: {} };

    // Attach JWT token if available
    const token = Auth.getToken();
    if (token) opts.headers['Authorization'] = `Bearer ${token}`;

    if (body && !isFormData) {
      opts.headers['Content-Type'] = 'application/json';
      opts.body = JSON.stringify(body);
    } else if (body && isFormData) {
      opts.body = body; // FormData — browser sets boundary
    }
    const res = await fetch(`${BASE}${path}`, opts);

    // 401 → redirect to login
    if (res.status === 401) {
      Auth.logout();
      return;
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || JSON.stringify(err));
    }
    if (res.status === 204) return null;
    const data = await res.json();

    // Cache GET responses
    if (isGet) _cacheSet(path, data);

    // Invalidate related cache entries on mutations
    if (!isGet) {
      // Extract the resource prefix, e.g. /cases/abc-123 from /cases/abc-123/analyze
      const segments = path.split('/').filter(Boolean);
      if (segments.length >= 2) {
        _cacheInvalidate(`/${segments[0]}/${segments[1]}`);
      }
      // Also invalidate the collection (e.g. /cases for listCases)
      if (segments.length >= 1) {
        _cacheInvalidate(`/${segments[0]}`);
      }
    }

    return data;
  }

  return {
    // Cases
    listCases:       ()              => request('GET', '/cases'),
    getCase:         (id)            => request('GET', `/cases/${id}`),
    createCase:      (data)          => request('POST', '/cases', data),
    updateCase:      (id, data)      => request('PATCH', `/cases/${id}`, data),
    deleteCase:      (id)            => request('DELETE', `/cases/${id}`),

    // Documents
    listDocuments:   (caseId)        => request('GET', `/cases/${caseId}/documents`),
    uploadDocument:  (caseId, form)  => request('POST', `/cases/${caseId}/documents`, form, true),
    parseDocument:   (docId)         => request('POST', `/documents/${docId}/parse`),
    getExtraction:   (docId)         => request('GET', `/documents/${docId}/extraction`),
    deleteDocument:  (docId)         => request('DELETE', `/documents/${docId}`),
    downloadDocumentUrl: (docId)     => `${BASE}/documents/${docId}/download`,

    // Analysis
    triggerAnalysis: (caseId, data)  => request('POST', `/cases/${caseId}/analyze`, data),
    getFindings:     (caseId)        => request('GET', `/cases/${caseId}/findings`),
    explainFinding:  (caseId, findingId) => request('POST', `/cases/${caseId}/findings/${findingId}/explain`),
    getRiskAssessment: (caseId)      => request('GET', `/cases/${caseId}/risk-assessment`),
    getAgentRuns:    (caseId)        => request('GET', `/cases/${caseId}/agent-runs`),
    getEsgAssessment:(caseId)        => request('GET', `/cases/${caseId}/esg-assessment`),

    // Checkpoints
    getCheckpoints:  (caseId)        => request('GET', `/cases/${caseId}/checkpoints`),
    approveCheckpoint:(caseId, cpId, data) => request('POST', `/cases/${caseId}/checkpoints/${cpId}/approve`, data),
    rejectCheckpoint:(caseId, cpId, data)  => request('POST', `/cases/${caseId}/checkpoints/${cpId}/reject`, data),

    // Reviews
    submitReview:    (caseId, data)  => request('POST', `/cases/${caseId}/review`, data),
    getAuditLog:     (caseId)        => request('GET', `/cases/${caseId}/audit-log`),

    // References — Regulations
    listRegulations: (activeOnly = false) =>
      request('GET', `/regulations?active_only=${activeOnly}`),
    createRegulation: (data) => request('POST', '/regulations', data),
    createRegulationWithPdf: (form) =>
      request('POST', '/regulations/upload', form, true),
    toggleRegulation: (id, active) =>
      request('PATCH', `/regulations/${id}/toggle`, { active }),
    deleteRegulation: (id) => request('DELETE', `/regulations/${id}`),

    // References — Historical Cases
    listHistoricalCases: (activeOnly = false) =>
      request('GET', `/historical-cases?active_only=${activeOnly}`),
    createHistoricalCase: (data) => request('POST', '/historical-cases', data),
    toggleHistoricalCase: (id, active) =>
      request('PATCH', `/historical-cases/${id}/toggle`, { active }),
    deleteHistoricalCase: (id) => request('DELETE', `/historical-cases/${id}`),
    searchHistorical: (params) => {
      const qs = new URLSearchParams(params).toString();
      return request('GET', `/historical-cases/search?${qs}`);
    },

    // Chat
    chatWithCase:    (caseId, question) => request('POST', `/cases/${caseId}/chat`, { question }),

    // Cache control
    invalidateCache,
  };
})();
