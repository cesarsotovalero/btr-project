/**
 * BTR — Analyst ChatBot Component
 *
 * Floating chat button (bottom-right) → opens a pinned side-panel.
 * Context-aware: reads current case ID from URL hash.
 * Uses API.chatWithCase() to get AI answers with document sources.
 */
const ChatBot = (() => {
  let _open = false;
  let _caseId = null;
  let _caseName = '';
  let _messages = []; // { role: 'user'|'bot', text, sources?, timestamp }
  let _injected = false;

  /* ---- Helpers ---- */

  /** Parse current case ID from hash, e.g. #/cases/abc123 or #/cases/abc123/risk */
  function _currentCaseId() {
    const m = window.location.hash.match(/^#\/cases\/([^/]+)/);
    return m ? m[1] : null;
  }

  /** Simple markdown-ish rendering: bold, italic, bullet lists, tables, line breaks */
  function _renderMarkdown(text) {
    let html = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Tables (simple pipe tables)
    html = html.replace(
      /^(\|.+\|)\n(\|[-| :]+\|)\n((?:\|.+\|\n?)+)/gm,
      (_, header, sep, body) => {
        const ths = header.split('|').filter(Boolean).map(c => `<th>${c.trim()}</th>`).join('');
        const rows = body.trim().split('\n').map(row => {
          const tds = row.split('|').filter(Boolean).map(c => `<td>${c.trim()}</td>`).join('');
          return `<tr>${tds}</tr>`;
        }).join('');
        return `<table class="chat-table"><thead><tr>${ths}</tr></thead><tbody>${rows}</tbody></table>`;
      }
    );

    // Bold
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    // Italic
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    // Numbered list items
    html = html.replace(/^(\d+)\.\s+/gm, '<span class="chat-list-num">$1.</span> ');
    // Bullet list items
    html = html.replace(/^- (.+)$/gm, '<span class="chat-bullet">•</span> $1');
    // Line breaks
    html = html.replace(/\n/g, '<br>');

    return html;
  }

  /** Format time HH:MM */
  function _fmtTime(d) {
    return new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  /* ---- DOM injection ---- */

  function _inject() {
    if (_injected) return;
    _injected = true;

    // Floating action button
    const fab = document.createElement('button');
    fab.id = 'chat-fab';
    fab.className = 'chat-fab';
    fab.setAttribute('aria-label', 'Open AI Chat Assistant');
    fab.innerHTML = `<i class="fa-solid fa-comments"></i>`;
    fab.addEventListener('click', toggle);
    document.body.appendChild(fab);

    // Chat panel
    const panel = document.createElement('aside');
    panel.id = 'chat-panel';
    panel.className = 'chat-panel';
    panel.innerHTML = `
      <div class="chat-header">
        <div class="chat-header-left">
          <i class="fa-solid fa-comments chat-header-icon"></i>
          <span class="chat-header-title">Risk Analyst Assistant</span>
        </div>
        <div class="chat-header-actions">
          <button class="chat-header-btn" id="chat-clear-btn" title="Clear conversation">
            <i class="fa-solid fa-trash-can"></i>
          </button>
          <button class="chat-header-btn" id="chat-close-btn" title="Close chat">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
      </div>
      <div class="chat-context" id="chat-context"></div>
      <div class="chat-messages" id="chat-messages"></div>
      <form class="chat-input-form" id="chat-form">
        <input type="text" class="chat-input" id="chat-input" placeholder="Ask about this case…" autocomplete="off" />
        <button type="submit" class="chat-send-btn" id="chat-send-btn" title="Send message">
          <i class="fa-solid fa-paper-plane"></i>
        </button>
      </form>`;
    document.body.appendChild(panel);

    // Event listeners
    document.getElementById('chat-close-btn').addEventListener('click', () => toggle(false));
    document.getElementById('chat-clear-btn').addEventListener('click', _clearConversation);
    document.getElementById('chat-form').addEventListener('submit', _handleSubmit);
  }

  /* ---- Open / Close ---- */

  function toggle(forceState) {
    _inject();
    _open = typeof forceState === 'boolean' ? forceState : !_open;

    const panel = document.getElementById('chat-panel');
    const fab = document.getElementById('chat-fab');

    if (_open) {
      panel.classList.add('chat-panel--open');
      fab.classList.add('chat-fab--hidden');
      _syncCase();
      _renderMessages();
      setTimeout(() => document.getElementById('chat-input')?.focus(), 200);
    } else {
      panel.classList.remove('chat-panel--open');
      fab.classList.remove('chat-fab--hidden');
    }
  }

  /* ---- Case context awareness ---- */

  function _syncCase() {
    const id = _currentCaseId();
    if (id !== _caseId) {
      _caseId = id;
      _caseName = '';
      _messages = [];
      // Try to get case name
      if (_caseId) {
        API.getCase(_caseId)
          .then(c => {
            _caseName = c.company_name || '';
            _updateContext();
            _addWelcome();
          })
          .catch(() => _updateContext());
      }
    }
    _updateContext();
    if (_caseId && _messages.length === 0) {
      _addWelcome();
    }
  }

  function _addWelcome() {
    if (_messages.length > 0) return;
    const name = _caseName || 'this case';
    _messages.push({
      role: 'bot',
      text: `Hello! I'm your **Risk Analyst Assistant**. I have access to all documents, findings, and assessments for **${name}**.\n\nYou can ask me about:\n- Risk classification and factors\n- Compliance status and regulatory checks\n- ESG and climate risk assessment\n- Document details and financial figures\n- Findings and identified issues\n- Recommended next actions\n\nHow can I help you?`,
      sources: [],
      timestamp: Date.now(),
    });
    _renderMessages();
  }

  function _updateContext() {
    const el = document.getElementById('chat-context');
    if (!el) return;
    if (_caseId) {
      el.innerHTML = `<span class="chat-context-dot"></span>Connected to: <strong>${_caseName || 'Case'}</strong>`;
      el.classList.add('chat-context--active');
    } else {
      el.innerHTML = '<span class="chat-context-dot chat-context-dot--inactive"></span>No case selected — navigate to a case to start chatting';
      el.classList.remove('chat-context--active');
    }
  }

  /* ---- Message handling ---- */

  function _renderMessages() {
    const container = document.getElementById('chat-messages');
    if (!container) return;

    if (_messages.length === 0) {
      container.innerHTML = '<div class="chat-empty">No messages yet</div>';
      return;
    }

    container.innerHTML = _messages.map(m => {
      const isBot = m.role === 'bot';
      const avatar = isBot
        ? '<div class="chat-avatar chat-avatar--bot"><i class="fa-solid fa-robot"></i></div>'
        : '<div class="chat-avatar chat-avatar--user"><i class="fa-solid fa-user"></i></div>';

      let sourcesHtml = '';
      if (isBot && m.sources && m.sources.length > 0) {
        sourcesHtml = `
          <div class="chat-sources">
            <div class="chat-sources-label">Sources</div>
            ${m.sources.map(s => `
              <div class="chat-source-item">
                <i class="fa-solid fa-file-lines chat-source-icon"></i>
                <span class="chat-source-name">${s.document_name}</span>
                ${s.page ? `<span class="chat-source-page">p. ${s.page}</span>` : ''}
                ${s.relevance ? `<span class="chat-source-relevance">${Math.round(s.relevance * 100)}%</span>` : ''}
              </div>`).join('')}
          </div>`;
      }

      return `
        <div class="chat-msg chat-msg--${m.role}">
          ${avatar}
          <div class="chat-bubble chat-bubble--${m.role}">
            <div class="chat-bubble-text">${isBot ? _renderMarkdown(m.text) : m.text.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
            ${sourcesHtml}
            <div class="chat-bubble-time">${_fmtTime(m.timestamp)}</div>
          </div>
        </div>`;
    }).join('');

    // Scroll to bottom
    container.scrollTop = container.scrollHeight;
  }

  function _addThinking() {
    const container = document.getElementById('chat-messages');
    if (!container) return;
    const div = document.createElement('div');
    div.className = 'chat-msg chat-msg--bot chat-msg--thinking';
    div.id = 'chat-thinking';
    div.innerHTML = `
      <div class="chat-avatar chat-avatar--bot"><i class="fa-solid fa-robot"></i></div>
      <div class="chat-bubble chat-bubble--bot">
        <div class="chat-thinking-dots"><span></span><span></span><span></span></div>
      </div>`;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
  }

  function _removeThinking() {
    document.getElementById('chat-thinking')?.remove();
  }

  async function _handleSubmit(e) {
    e.preventDefault();
    const input = document.getElementById('chat-input');
    const question = input.value.trim();
    if (!question) return;

    if (!_caseId) {
      Components.toast('Navigate to a case first to use the chat assistant.', 'error');
      return;
    }

    // Add user message
    _messages.push({ role: 'user', text: question, timestamp: Date.now() });
    input.value = '';
    _renderMessages();

    // Show thinking indicator
    _addThinking();
    _setInputEnabled(false);

    try {
      const res = await API.chatWithCase(_caseId, question);
      _removeThinking();
      _messages.push({
        role: 'bot',
        text: res.answer,
        sources: res.sources || [],
        timestamp: Date.now(),
      });
      _renderMessages();
    } catch (err) {
      _removeThinking();
      _messages.push({
        role: 'bot',
        text: `I apologise, but I encountered an error processing your question: ${err.message}\n\nPlease try again or rephrase your question.`,
        sources: [],
        timestamp: Date.now(),
      });
      _renderMessages();
    }

    _setInputEnabled(true);
    input.focus();
  }

  function _setInputEnabled(enabled) {
    const input = document.getElementById('chat-input');
    const btn = document.getElementById('chat-send-btn');
    if (input) input.disabled = !enabled;
    if (btn) btn.disabled = !enabled;
  }

  function _clearConversation() {
    _messages = [];
    _renderMessages();
    _addWelcome();
  }

  /* ---- Notify on hash change (case navigation) ---- */

  function onNavigate() {
    _inject();                       // ensure FAB exists (idempotent)
    if (_open) _syncCase();
  }

  /* ---- Public API ---- */

  return { toggle, onNavigate, inject: _inject };
})();
