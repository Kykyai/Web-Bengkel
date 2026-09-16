// ============================================
//  BengkelPro - Mekanik Page
// ============================================

let mekanikPage = 1;
let mekanikQuery = '';

function renderMekanik(container) {
    container.innerHTML = `
    <div class="page-header">
      <div class="page-header-left">
        <h1>👷 Manajemen Mekanik</h1>
        <p>Data mekanik dan karyawan bengkel</p>
      </div>
      <button class="btn btn-primary" onclick="openFormMekanik()">+ Tambah Mekanik</button>
    </div>

    <div class="toolbar">
      <div class="search-box">
        <span class="search-icon">🔍</span>
        <input type="text" placeholder="Cari nama, spesialisasi..." oninput="onSearchMekanik(this.value)">
      </div>
      <select class="filter-select" onchange="onFilterMekanik(this.value)" id="mekanik-filter">
        <option value="all">Semua Status</option>
        <option value="Aktif">Aktif</option>
        <option value="Libur">Libur</option>
        <option value="Tidak Aktif">Tidak Aktif</option>
      </select>
      <span id="mekanik-count" class="text-muted" style="font-size:0.83rem"></span>
    </div>

    <div id="mekanik-grid" class="grid-3"></div>
    <div id="mekanik-pagination"></div>
  `;
    mekanikPage = 1;
    let filterStatus = 'all';
    window.onFilterMekanik = (v) => { filterStatus = v; mekanikPage = 1; renderMekanikGrid(filterStatus); };
    renderMekanikGrid(filterStatus);
}

let mekanikFilterStatus = 'all';

function getMekanikFiltered(statusFilter = 'all') {
    let items = DB.getAll(DB_KEYS.mekanik);
    if (mekanikQuery) items = filterItems(items, mekanikQuery, ['nama', 'spesialisasi', 'level']);
    if (statusFilter !== 'all') items = items.filter(m => m.status === statusFilter);
    return items;
}

function renderMekanikGrid(statusFilter = 'all') {
    mekanikFilterStatus = statusFilter;
    const all = getMekanikFiltered(statusFilter);
    const countEl = document.getElementById('mekanik-count');
    if (countEl) countEl.textContent = `${all.length} mekanik`;

    const paged = paginate(all, mekanikPage, 9);
    const grid = document.getElementById('mekanik-grid');
    if (!grid) return;

    if (paged.items.length === 0) {
        grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="empty-icon">👷</div><div class="empty-title">Tidak ada mekanik</div><div class="empty-desc">Tambah mekanik untuk memulai</div></div>`;
        return;
    }

    grid.innerHTML = paged.items.map(m => {
        const woCount = DB.getAll(DB_KEYS.workorder).filter(w => w.mekanik_id === m.id).length;
        const activeWO = DB.getAll(DB_KEYS.workorder).filter(w => w.mekanik_id === m.id && (w.status === 'Antri' || w.status === 'Dikerjakan')).length;
        const levelColors = { 'Senior': 'badge-primary', 'Madya': 'badge-info', 'Junior': 'badge-secondary' };
        return `<div class="card" style="text-align:center">
      <div style="position:relative;display:inline-block;margin-bottom:12px">
        <div class="avatar avatar-lg" style="width:60px;height:60px;font-size:1.5rem;margin:0 auto">${m.foto || avatarInitial(m.nama)}</div>
        <div style="position:absolute;bottom:0;right:0;width:14px;height:14px;border-radius:50%;background:${m.status === 'Aktif' ? 'var(--success)' : m.status === 'Libur' ? 'var(--warning)' : 'var(--text-muted)'};border:2px solid var(--bg-card)"></div>
      </div>
      <div class="font-bold" style="font-size:1rem">${m.nama}</div>
      <div class="text-muted" style="font-size:0.8rem;margin:4px 0 10px">${m.spesialisasi}</div>
      <div class="flex gap-6" style="justify-content:center;flex-wrap:wrap;margin-bottom:12px">
        <span class="badge ${levelColors[m.level] || 'badge-secondary'}">${m.level}</span>
        ${statusBadge(m.status)}
      </div>
      <div class="grid-2 mb-12" style="gap:8px">
        <div style="background:var(--bg-elevated);border-radius:8px;padding:8px">
          <div class="font-bold" style="font-size:1.1rem">${woCount}</div>
          <div class="text-muted" style="font-size:0.72rem">Total WO</div>
        </div>
        <div style="background:var(--bg-elevated);border-radius:8px;padding:8px">
          <div class="font-bold" style="font-size:1.1rem;color:${activeWO > 0 ? 'var(--warning)' : 'var(--success)'}">${activeWO}</div>
          <div class="text-muted" style="font-size:0.72rem">WO Aktif</div>
        </div>
      </div>
      <div class="text-muted" style="font-size:0.78rem;margin-bottom:12px">📞 ${m.telp}</div>
      <div class="flex gap-8" style="justify-content:center">
        <button class="btn btn-sm btn-warning" onclick="openFormMekanik('${m.id}')">✏️ Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deleteMekanik('${m.id}')">🗑️</button>
      </div>
    </div>`;
    }).join('');

    renderPagination('mekanik-pagination', mekanikPage, paged.totalPages,
        `function(p){ mekanikPage=p; renderMekanikGrid('${mekanikFilterStatus}'); }`);
}

function onSearchMekanik(q) { mekanikQuery = q; mekanikPage = 1; renderMekanikGrid(mekanikFilterStatus); }

function openFormMekanik(id = null) {
    const m = id ? DB.findById(DB_KEYS.mekanik, id) : null;
    const title = m ? `Edit Mekanik: ${m.nama}` : 'Tambah Mekanik Baru';
    const body = `
    <form id="form-mekanik" onsubmit="saveMekanik(event, '${id || ''}')">
      <div class="form-row">
        <div class="form-group">
          <label>Nama Lengkap *</label>
          <input name="nama" required value="${m?.nama || ''}" placeholder="Nama lengkap mekanik">
        </div>
        <div class="form-group">
          <label>No. Telepon</label>
          <input name="telp" value="${m?.telp || ''}" placeholder="08xx-xxxx-xxxx">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Spesialisasi *</label>
          <input name="spesialisasi" required value="${m?.spesialisasi || ''}" placeholder="Mesin, Kelistrikan, Body...">
        </div>
        <div class="form-group">
          <label>Level</label>
          <select name="level">
            <option value="Junior" ${m?.level === 'Junior' ? 'selected' : ''}>Junior</option>
            <option value="Madya" ${m?.level === 'Madya' ? 'selected' : ''}>Madya</option>
            <option value="Senior" ${m?.level === 'Senior' ? 'selected' : ''}>Senior</option>
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Status</label>
          <select name="status">
            <option value="Aktif" ${m?.status === 'Aktif' ? 'selected' : ''}>✅ Aktif</option>
            <option value="Libur" ${m?.status === 'Libur' ? 'selected' : ''}>🌴 Libur</option>
            <option value="Tidak Aktif" ${m?.status === 'Tidak Aktif' ? 'selected' : ''}>⭕ Tidak Aktif</option>
          </select>
        </div>
        <div class="form-group">
          <label>Gaji (Rp)</label>
          <input name="gaji" type="number" min="0" value="${m?.gaji || 0}">
        </div>
      </div>
      <div class="modal-footer" style="padding:0;border:none;margin-top:16px">
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Batal</button>
        <button type="submit" class="btn btn-primary">💾 Simpan</button>
      </div>
    </form>`;
    openModal(title, body, 'modal-lg');
}

function saveMekanik(e, id) {
    e.preventDefault();
    const f = new FormData(e.target);
    const data = Object.fromEntries(f.entries());
    data.gaji = parseInt(data.gaji) || 0;
    data.foto = avatarInitial(data.nama);

    if (id) {
        DB.update(DB_KEYS.mekanik, id, data);
        showToast('Data mekanik berhasil diperbarui!', 'success');
    } else {
        data.id = generateId('m');
        DB.insert(DB_KEYS.mekanik, data);
        showToast('Mekanik baru berhasil ditambahkan!', 'success');
    }
    closeModal();
    renderMekanikGrid(mekanikFilterStatus);
}

function deleteMekanik(id) {
    const m = DB.findById(DB_KEYS.mekanik, id);
    confirmAction(`Hapus mekanik <b>${m?.nama}</b>?`, () => {
        DB.delete(DB_KEYS.mekanik, id);
        showToast('Mekanik dihapus!', 'success');
        renderMekanikGrid(mekanikFilterStatus);
    });
}
