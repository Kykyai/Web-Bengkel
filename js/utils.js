// ============================================
//  BengkelPro - Utilities
// ============================================

// ---------- ID Generator ----------
function generateId(prefix = 'id') {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
}

function generateWOId() {
    const all = DB.getAll(DB_KEYS.workorder);
    const year = new Date().getFullYear();
    const num = String(all.length + 1).padStart(3, '0');
    return `WO-${year}-${num}`;
}

function generateInvId() {
    const all = DB.getAll(DB_KEYS.invoice);
    const year = new Date().getFullYear();
    const num = String(all.length + 1).padStart(3, '0');
    return `INV-${year}-${num}`;
}

// ---------- Format Helpers ----------
function formatCurrency(val) {
    if (val === null || val === undefined || isNaN(val)) return 'Rp 0';
    return 'Rp ' + Number(val).toLocaleString('id-ID');
}

function formatDate(str) {
    if (!str) return '-';
    const d = new Date(str);
    if (isNaN(d)) return str;
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatDateLong(str) {
    if (!str) return '-';
    const d = new Date(str);
    if (isNaN(d)) return str;
    return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

function formatDateTime(str) {
    if (!str) return '-';
    const d = new Date(str);
    if (isNaN(d)) return str;
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) +
        ' ' + d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

function todayStr() {
    return new Date().toISOString().split('T')[0];
}

function timeAgo(str) {
    if (!str) return '';
    const d = new Date(str);
    const diff = Math.round((Date.now() - d) / 1000);
    if (diff < 60) return `${diff} detik lalu`;
    if (diff < 3600) return `${Math.round(diff / 60)} menit lalu`;
    if (diff < 86400) return `${Math.round(diff / 3600)} jam lalu`;
    return `${Math.round(diff / 86400)} hari lalu`;
}

// ---------- Status Badge ----------
function statusBadge(status) {
    const map = {
        'Antri': { cls: 'badge-warning', icon: '⏳' },
        'Dikerjakan': { cls: 'badge-info', icon: '🔧' },
        'Selesai': { cls: 'badge-success', icon: '✅' },
        'Batal': { cls: 'badge-secondary', icon: '❌' },
        'Lunas': { cls: 'badge-success', icon: '✅' },
        'Belum Lunas': { cls: 'badge-warning', icon: '💳' },
        'Aktif': { cls: 'badge-success', icon: '🟢' },
        'Libur': { cls: 'badge-warning', icon: '🌴' },
        'Tidak Aktif': { cls: 'badge-secondary', icon: '⭕' },
    };
    const s = map[status] || { cls: 'badge-secondary', icon: '•' };
    return `<span class="badge ${s.cls}">${s.icon} ${status}</span>`;
}

// ---------- Tipe Kendaraan Icon ----------
function vehicleIcon(tipe) {
    return tipe === 'Motor' ? '🏍️' : '🚗';
}

// ---------- Avatar Initial ----------
function avatarInitial(nama) {
    if (!nama) return '?';
    const parts = nama.trim().split(' ');
    return (parts[0][0] + (parts[1] ? parts[1][0] : '')).toUpperCase();
}

// ---------- Toast ----------
function showToast(msg, type = 'success') {
    const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<span class="toast-icon">${icons[type] || 'ℹ️'}</span><span class="toast-msg">${msg}</span>`;
    const container = document.getElementById('toast-container');
    container.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateY(10px)'; setTimeout(() => toast.remove(), 300); }, 3000);
}

// ---------- Modal ----------
function openModal(title, bodyHtml, sizeClass = '') {
    const modal = document.getElementById('main-modal');
    const overlay = document.getElementById('modal-overlay');
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = bodyHtml;
    modal.className = 'modal show' + (sizeClass ? ' ' + sizeClass : '');
    overlay.classList.add('show');
    // Focus first input
    setTimeout(() => {
        const inp = modal.querySelector('input, select, textarea');
        if (inp) inp.focus();
    }, 150);
}

function closeModal() {
    document.getElementById('main-modal').classList.remove('show');
    document.getElementById('modal-overlay').classList.remove('show');
}

// ---------- Confirm Dialog ----------
function confirmAction(msg, onConfirm) {
    const body = `
    <div class="text-center" style="padding:8px 0">
      <div style="font-size:2.5rem;margin-bottom:12px;">⚠️</div>
      <p style="margin-bottom:20px;color:var(--text-secondary);">${msg}</p>
      <div class="flex gap-12" style="justify-content:center;">
        <button class="btn btn-secondary" onclick="closeModal()">Batal</button>
        <button class="btn btn-danger" id="confirm-yes-btn">Ya, Hapus</button>
      </div>
    </div>`;
    openModal('Konfirmasi', body);
    document.getElementById('confirm-yes-btn').onclick = () => { closeModal(); onConfirm(); };
}

// ---------- Pagination ----------
function paginate(items, page, perPage = 10) {
    const start = (page - 1) * perPage;
    return { items: items.slice(start, start + perPage), total: items.length, totalPages: Math.ceil(items.length / perPage), page };
}

function renderPagination(containerId, current, total, onChange) {
    const el = document.getElementById(containerId);
    if (!el || total <= 1) { if (el) el.innerHTML = ''; return; }
    let html = `<div class="flex items-center gap-8" style="justify-content:center;margin-top:16px;">`;
    html += `<button class="btn btn-sm btn-secondary" ${current === 1 ? 'disabled' : ''} onclick="(${onChange})(${current - 1})">← Prev</button>`;
    const start = Math.max(1, current - 2);
    const end = Math.min(total, start + 4);
    for (let i = start; i <= end; i++) {
        html += `<button class="btn btn-sm ${i === current ? 'btn-primary' : 'btn-secondary'}" onclick="(${onChange})(${i})">${i}</button>`;
    }
    html += `<button class="btn btn-sm btn-secondary" ${current === total ? 'disabled' : ''} onclick="(${onChange})(${current + 1})">Next →</button>`;
    html += `</div>`;
    el.innerHTML = html;
}

// ---------- Stok Alert Check ----------
function getSparepartAlerts() {
    return DB.getAll(DB_KEYS.sparepart).filter(s => s.stok <= s.stok_min);
}

function getActiveWorkOrders() {
    return DB.getAll(DB_KEYS.workorder).filter(w => w.status === 'Antri' || w.status === 'Dikerjakan');
}

// ---------- Update Sidebar Badges ----------
function updateBadges() {
    const woActive = getActiveWorkOrders();
    const spAlerts = getSparepartAlerts();
    const woEl = document.getElementById('badge-workorder');
    const spEl = document.getElementById('badge-sparepart');
    if (woEl) woEl.textContent = woActive.length > 0 ? woActive.length : '';
    if (spEl) spEl.textContent = spAlerts.length > 0 ? spAlerts.length : '';

    // Notifications dot
    const notifDot = document.getElementById('notif-dot');
    if (notifDot) {
        if (spAlerts.length > 0 || woActive.length > 0) notifDot.classList.add('show');
        else notifDot.classList.remove('show');
    }

    // Notification list
    const notifList = document.getElementById('notif-list');
    if (notifList) {
        let html = '';
        spAlerts.forEach(s => {
            html += `<div class="notif-item"><span class="notif-icon">📦</span>Stok <b>${s.nama}</b> menipis (${s.stok} ${s.satuan})</div>`;
        });
        woActive.filter(w => w.status === 'Antri').slice(0, 3).forEach(w => {
            const k = DB.findById(DB_KEYS.kendaraan, w.kendaraan_id);
            html += `<div class="notif-item"><span class="notif-icon">🔧</span>WO ${w.id} sedang <b>Antri</b> (${k ? k.plat : '-'})</div>`;
        });
        if (!html) html = `<div class="notif-item text-muted">Tidak ada notifikasi</div>`;
        notifList.innerHTML = html;
    }
}

// ---------- Chart Colors ----------
const CHART_COLORS = [
    '#f97316', '#3b82f6', '#22c55e', '#a855f7', '#06b6d4', '#eab308', '#ef4444', '#8b5cf6', '#14b8a6', '#f59e0b'
];

function chartDefaults() {
    Chart.defaults.color = '#94a3b8';
    Chart.defaults.borderColor = '#334155';
    Chart.defaults.font.family = 'Inter, sans-serif';
}

// ---------- Calculate WO Total ----------
function calcWOTotal(wo) {
    const jasaTotal = (wo.jasa || []).reduce((s, j) => s + (j.harga || 0), 0);
    const partTotal = (wo.sparepart || []).reduce((s, p) => s + ((p.harga || 0) * (p.qty || 1)), 0);
    return jasaTotal + partTotal;
}

// ---------- Month Names ----------
const MONTHS_ID = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];
const MONTHS_FULL = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

// ---------- Get revenue by month ----------
function getMonthlyRevenue(year = new Date().getFullYear()) {
    const invoices = DB.getAll(DB_KEYS.invoice);
    const data = Array(12).fill(0);
    invoices.forEach(inv => {
        if (!inv.tanggal) return;
        const d = new Date(inv.tanggal);
        if (d.getFullYear() === year && inv.status === 'Lunas') {
            data[d.getMonth()] += inv.total;
        }
    });
    return data;
}

// ---------- Debounce ----------
function debounce(fn, ms = 300) {
    let t;
    return function (...args) { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

// ---------- Search filter ----------
function filterItems(items, query, fields) {
    if (!query || !query.trim()) return items;
    const q = query.toLowerCase().trim();
    return items.filter(item =>
        fields.some(f => {
            const val = String(item[f] || '').toLowerCase();
            return val.includes(q);
        })
    );
}

// ---------- Export to CSV ----------
function exportCSV(data, filename, columns) {
    const header = columns.map(c => c.label).join(',');
    const rows = data.map(row => columns.map(c => `"${(row[c.key] || '').toString().replace(/"/g, '""')}"`).join(','));
    const csv = [header, ...rows].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename + '.csv';
    a.click();
}

// ---------- Print Invoice ----------
function printInvoice(html) {
    const w = window.open('', '_blank', 'width=800,height=700');
    w.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Invoice</title>
    <style>
      body { font-family: Inter, Arial, sans-serif; margin: 0; padding: 24px; background: white; color: #1a1a1a; font-size: 13px; }
      table { width: 100%; border-collapse: collapse; }
      th { background: #f1f5f9; padding: 8px 10px; text-align: left; border: 1px solid #e2e8f0; }
      td { padding: 8px 10px; border: 1px solid #e2e8f0; }
      .total-row { background: #f97316; color: white; font-weight: 700; }
      .text-right { text-align: right; }
      @media print { body { margin: 0; } .no-print { display: none; } }
    </style></head><body>${html}<br>
    <div class="no-print" style="text-align:center;margin-top:20px">
      <button onclick="window.print()" style="padding:10px 24px;background:#f97316;color:white;border:none;border-radius:8px;cursor:pointer;font-size:14px">🖨️ Print</button>
    </div></body></html>`);
    w.document.close();
}

// ---------- Toggle Notification Dropdown ----------
function toggleNotif() {
    document.getElementById('notif-dropdown').classList.toggle('show');
}

// Close notif on outside click
document.addEventListener('click', (e) => {
    if (!e.target.closest('.header-notifications')) {
        const nd = document.getElementById('notif-dropdown');
        if (nd) nd.classList.remove('show');
    }
});
