// ============================================
//  BengkelPro - App Router & Core
// ============================================

let currentPage = 'dashboard';
let currentCharts = {};

// ---- Page Registry ----
const PAGES = {
    dashboard: { title: 'Dashboard', render: renderDashboard },
    workorder: { title: 'Work Order', render: renderWorkOrder },
    pelanggan: { title: 'Pelanggan', render: renderPelanggan },
    kendaraan: { title: 'Kendaraan', render: renderKendaraan },
    sparepart: { title: 'Stok Sparepart', render: renderSparepart },
    mekanik: { title: 'Mekanik', render: renderMekanik },
    invoice: { title: 'Invoice & Kasir', render: renderInvoice },
    laporan: { title: 'Laporan & Analitik', render: renderLaporan },
    pengaturan: { title: 'Pengaturan', render: renderPengaturan },
};

function navigateTo(page) {
    if (!PAGES[page]) return;

    // Destroy existing charts
    Object.values(currentCharts).forEach(c => { try { c.destroy(); } catch { } });
    currentCharts = {};

    // Update sidebar active
    document.querySelectorAll('.nav-item').forEach(el => {
        el.classList.toggle('active', el.dataset.page === page);
    });

    // Update header
    const pageEl = document.getElementById('page-title');
    if (pageEl) pageEl.textContent = PAGES[page].title;

    // Render content
    const content = document.getElementById('content-area');
    content.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.className = 'page-enter';
    content.appendChild(wrapper);

    currentPage = page;
    PAGES[page].render(wrapper);

    // Close sidebar on mobile
    if (window.innerWidth <= 900) {
        document.getElementById('sidebar').classList.remove('open');
        const overlay = document.querySelector('.sidebar-overlay');
        if (overlay) overlay.classList.remove('show');
    }

    updateBadges();
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('open');
    let overlay = document.querySelector('.sidebar-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        overlay.onclick = () => { sidebar.classList.remove('open'); overlay.classList.remove('show'); };
        document.body.appendChild(overlay);
    }
    overlay.classList.toggle('show', sidebar.classList.contains('open'));
}

// ---- Update header date & time ----
function updateClock() {
    const el = document.getElementById('header-date');
    if (!el) return;
    const now = new Date();
    el.textContent = now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

// ---- Update shop name in header ----
function updateShopInfo() {
    const settings = DB.get(DB_KEYS.settings) || DEFAULT_SETTINGS;
    const el = document.getElementById('header-shop-name');
    const ownerEl = document.getElementById('sidebar-owner-name');
    if (el) el.textContent = settings.namabengkel || 'BengkelPro';
    if (ownerEl) ownerEl.textContent = settings.namabengkel ? settings.namabengkel.split(' ')[0] : 'Admin';
}

// ---- App Init ----
function initApp() {
    DB.init();
    chartDefaults();
    updateClock();
    setInterval(updateClock, 60000);
    updateShopInfo();
    updateBadges();
    navigateTo('dashboard');
}

// Start app when DOM is ready
document.addEventListener('DOMContentLoaded', initApp);
