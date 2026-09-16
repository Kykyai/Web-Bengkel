// ============================================
//  BengkelPro - Authentication Manager
// ============================================

const DEFAULT_USERS = [
    { id: 'usr_1', username: 'admin', password: 'admin123', name: 'Budi Santoso', role: 'Administrator', avatar: '👑' },
    { id: 'usr_2', username: 'kasir', password: 'kasir123', name: 'Siti Rahayu', role: 'Kasir', avatar: '🧾' },
    { id: 'usr_3', username: 'mekanik', password: 'mekanik123', name: 'Agus Prasetyo', role: 'Mekanik', avatar: '👷' }
];

const AUTH_KEY = 'bp_session_user';

const AUTH = {
    getUser() {
        try {
            const raw = localStorage.getItem(AUTH_KEY) || sessionStorage.getItem(AUTH_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch { return null; }
    },

    setUser(user, remember = true) {
        const data = JSON.stringify(user);
        if (remember) {
            localStorage.setItem(AUTH_KEY, data);
        } else {
            sessionStorage.setItem(AUTH_KEY, data);
        }
    },

    clearUser() {
        localStorage.removeItem(AUTH_KEY);
        sessionStorage.removeItem(AUTH_KEY);
    },

    async login(username, password, remember = true) {
        // Try backend API first
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.user) {
                    this.setUser(data.user, remember);
                    return { success: true, message: data.message, user: data.user };
                }
            }
        } catch (e) {
            console.log('Backend API unavailable, falling back to local auth');
        }

        // Fallback local check (offline / GitHub Pages mode)
        const user = DEFAULT_USERS.find(u => u.username === username && u.password === password);
        if (user) {
            const { password: _, ...userWithoutPassword } = user;
            this.setUser(userWithoutPassword, remember);
            return { success: true, message: `Selamat datang kembali, ${user.name}!`, user: userWithoutPassword };
        }

        return { success: false, message: 'Username atau password tidak valid!' };
    },

    logout() {
        this.clearUser();
        showToast('Anda telah berhasil keluar (Logged out)', 'info');
        renderLoginOverlay();
    },

    applyRolePermissions(user) {
        if (!user) return;

        // Update User info in sidebar
        const avatarEl = document.getElementById('sidebar-user-avatar');
        const nameEl = document.getElementById('sidebar-owner-name');
        const roleEl = document.getElementById('sidebar-user-role');

        if (avatarEl) avatarEl.textContent = user.avatar || user.name.charAt(0);
        if (nameEl) nameEl.textContent = user.name;
        if (roleEl) roleEl.textContent = user.role;

        // Role-based navigation visibility
        const role = user.role;
        document.querySelectorAll('.nav-item').forEach(el => {
            const page = el.dataset.page;
            if (role === 'Mekanik') {
                const allowed = ['dashboard', 'workorder', 'kendaraan', 'sparepart', 'mekanik'];
                el.style.display = allowed.includes(page) ? 'flex' : 'none';
            } else if (role === 'Kasir') {
                const allowed = ['dashboard', 'workorder', 'pelanggan', 'sparepart', 'invoice'];
                el.style.display = allowed.includes(page) ? 'flex' : 'none';
            } else {
                // Administrator / Owner sees everything
                el.style.display = 'flex';
            }
        });
    }
};

// ---- Render Glassmorphic Login Overlay ----
function renderLoginOverlay() {
    let overlay = document.getElementById('login-modal-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'login-modal-overlay';
        overlay.className = 'login-overlay';
        document.body.appendChild(overlay);
    }

    overlay.innerHTML = `
      <div class="login-card">
        <div class="login-header">
          <div class="login-brand-icon">🔧</div>
          <h2>BengkelPro</h2>
          <p>Sistem Manajemen Bengkel Otomotif</p>
        </div>

        <form id="login-form" onsubmit="handleLoginSubmit(event)">
          <div class="form-group">
            <label for="login-username">Username</label>
            <input type="text" id="login-username" class="form-control" placeholder="Masukkan username" required autofocus value="admin" />
          </div>

          <div class="form-group">
            <label for="login-password">Password</label>
            <input type="password" id="login-password" class="form-control" placeholder="Masukkan password" required value="admin123" />
          </div>

          <div class="login-options">
            <label class="checkbox-label">
              <input type="checkbox" id="login-remember" checked /> Ingat Saya
            </label>
          </div>

          <button type="submit" class="btn btn-primary btn-block" id="login-btn">
            Masuk ke Sistem 🚀
          </button>
        </form>

        <div class="login-presets">
          <p class="presets-title">Atau Pilih Akun Demo Fast-Login:</p>
          <div class="preset-buttons">
            <button class="preset-btn" onclick="quickLogin('admin', 'admin123')">
              <span>👑</span> Admin / Owner
            </button>
            <button class="preset-btn" onclick="quickLogin('kasir', 'kasir123')">
              <span>🧾</span> Kasir
            </button>
            <button class="preset-btn" onclick="quickLogin('mekanik', 'mekanik123')">
              <span>👷</span> Mekanik
            </button>
          </div>
        </div>

        <div class="login-footer">
          © 2026 BengkelPro Management System
        </div>
      </div>
    `;

    overlay.classList.add('active');
}

async function handleLoginSubmit(e) {
    e.preventDefault();
    const userEl = document.getElementById('login-username');
    const passEl = document.getElementById('login-password');
    const rememberEl = document.getElementById('login-remember');
    const btn = document.getElementById('login-btn');

    btn.disabled = true;
    btn.innerHTML = 'Memproses... ⏳';

    const result = await AUTH.login(userEl.value.trim(), passEl.value.trim(), rememberEl.checked);

    btn.disabled = false;
    btn.innerHTML = 'Masuk ke Sistem 🚀';

    if (result.success) {
        showToast(result.message, 'success');
        document.getElementById('login-modal-overlay').classList.remove('active');
        AUTH.applyRolePermissions(result.user);
        if (typeof navigateTo === 'function') navigateTo('dashboard');
    } else {
        showToast(result.message, 'danger');
    }
}

async function quickLogin(username, password) {
    document.getElementById('login-username').value = username;
    document.getElementById('login-password').value = password;
    const result = await AUTH.login(username, password, true);
    if (result.success) {
        showToast(result.message, 'success');
        document.getElementById('login-modal-overlay').classList.remove('active');
        AUTH.applyRolePermissions(result.user);
        if (typeof navigateTo === 'function') navigateTo('dashboard');
    }
}
