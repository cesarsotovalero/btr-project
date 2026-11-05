/**
 * BTR — Login / Register page
 */
const LoginPage = (() => {
  let _mode = 'login'; // 'login' | 'register'

  function render(container) {
    // If already logged in, redirect to home
    if (Auth.isLoggedIn()) {
      window.location.hash = '#/';
      return;
    }

    container.innerHTML = `
      <div class="login-page">
        <div class="login-card">
          <div class="login-header">
            <svg class="login-logo" viewBox="0 0 32 32" width="48" height="48">
              <circle cx="16" cy="16" r="14" fill="#60cd18"/>
              <text x="16" y="21" text-anchor="middle" fill="#fff" font-size="14" font-weight="700" font-family="SEB SansSerif, Arial, sans-serif">B</text>
            </svg>
            <h1>BTR Risk Assessment</h1>
            <p class="login-subtitle">Skandinaviska Enskilda Banken</p>
          </div>

          <div class="login-tabs">
            <button class="login-tab active" data-tab="login">Sign In</button>
            <button class="login-tab" data-tab="register">Register</button>
          </div>

          <form id="login-form" class="login-form">
            <div class="form-group">
              <label for="login-username">Username</label>
              <input type="text" id="login-username" required autocomplete="username" placeholder="Enter username" />
            </div>
            <div class="form-group register-only" style="display:none">
              <label for="login-email">Email</label>
              <input type="email" id="login-email" autocomplete="email" placeholder="name@seb.se" />
            </div>
            <div class="form-group">
              <label for="login-password">Password</label>
              <input type="password" id="login-password" required autocomplete="current-password" placeholder="Enter password" />
            </div>
            <div class="form-group register-only" style="display:none">
              <label for="login-fullname">Full Name</label>
              <input type="text" id="login-fullname" autocomplete="name" placeholder="Anna Lindqvist" />
            </div>

            <div id="login-error" class="login-error" style="display:none"></div>

            <button id="login-submit" type="submit" class="login-submit-btn">
              Sign In
            </button>
          </form>

          <div class="login-footer">
            <p class="login-hint">Default: <strong>analyst</strong> / <strong>analyst123</strong></p>
          </div>
        </div>
      </div>`;

    // Tab switching
    container.querySelectorAll('.login-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        _mode = tab.dataset.tab;
        container.querySelectorAll('.login-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const registerFields = container.querySelectorAll('.register-only');
        registerFields.forEach(f => f.style.display = _mode === 'register' ? '' : 'none');

        const submitBtn = container.querySelector('#login-submit');
        submitBtn.textContent = _mode === 'register' ? 'Create Account' : 'Sign In';

        // Update email/fullname required state
        container.querySelector('#login-email').required = _mode === 'register';
        container.querySelector('#login-fullname').required = _mode === 'register';
      });
    });

    // Form submit
    container.querySelector('#login-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const errorEl = container.querySelector('#login-error');
      errorEl.style.display = 'none';

      const username = container.querySelector('#login-username').value.trim();
      const password = container.querySelector('#login-password').value;

      const submitBtn = container.querySelector('#login-submit');
      submitBtn.disabled = true;
      submitBtn.textContent = _mode === 'register' ? 'Creating…' : 'Signing in…';

      try {
        if (_mode === 'register') {
          const email = container.querySelector('#login-email').value.trim();
          const fullName = container.querySelector('#login-fullname').value.trim();
          await Auth.register(username, email, password, fullName);
        } else {
          await Auth.login(username, password);
        }
        // Successful — redirect to home
        window.location.hash = '#/';
      } catch (err) {
        errorEl.textContent = err.message;
        errorEl.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.textContent = _mode === 'register' ? 'Create Account' : 'Sign In';
      }
    });
  }

  return { render };
})();
