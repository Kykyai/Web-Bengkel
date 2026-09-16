// ============================================
//  BengkelPro - Pelanggan Page
// ============================================

let pelangganPage = 1;
let pelangganQuery = '';
let pelangganFilter = 'all';

function renderPelanggan(container) {
  container.innerHTML = `
    <div class="page-header">
      <div class="page-header-left">
        <h1>👥 Manajemen Pelanggan</h1>
        <p>Kelola data pelanggan bengkel Anda</p>
      </div>
      <div class="flex gap-8">
        <button class="btn btn-secondary" onclick="exportPelanggan()">⬇️ Export CSV</button>
        <button class="btn btn-primary" onclick="openFormPelanggan()">+ Tambah Pelanggan</button>
      </div>
    </div>

    <div class="toolbar">
      <div class="search-box">
        <span class="search-icon">🔍</span>
        <input type="text" id="search-pelanggan" placeholder="Cari nama, telepon, email..." oninput="onSearchPelanggan(this.value)">
      </div>
      <select class="filter-select" onchange="onFilterPelanggan(this.value)">
        <option value="all">Semua Pelanggan</option>
        <option value="aktif">Pelanggan Aktif (≥5 servis)</option>
        <option value="baru">Pelanggan Baru (< 5 servis)</option>
      </select>
      <span id="pelanggan-count" class="text-muted" style="font-size:0.83rem"></span>
    </div>

    <div class="card" style="padding:0">
      <div class="table-container">
        <table>
          <thead><tr>
            <th>Pelanggan</th><th>Telepon</th><th>Email</th><th>Alamat</th>
            <th>Total Servis</th><th>Terdaftar</th><th>Aksi</th>
          </tr></thead>
          <tbody id="pelanggan-table-body"></tbody>
        </table>
      </div>
      <div id="pelanggan-pagination"></div>
    </div>
  `;
  pelangganPage = 1;
  renderPelangganTable();
}

function getPelangganFiltered() {
  let items = DB.getAll(DB_KEYS.pelanggan);
  if (pelangganQuery) items = filterItems(items, pelangganQuery, ['nama', 'telp', 'email', 'alamat']);
  if (pelangganFilter === 'aktif') items = items.filter(p => p.total_servis >= 5);
  if (pelangganFilter === 'baru') items = items.filter(p => p.total_servis < 5);
  return items;
}

function renderPelangganTable() {
  const all = getPelangganFiltered();
  const countEl = document.getElementById('pelanggan-count');
  if (countEl) countEl.textContent = `${all.length} pelanggan`;

  const paged = paginate(all, pelangganPage, 8);
  const tbody = document.getElementById('pelanggan-table-body');
  if (!tbody) return;

  if (paged.items.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><div class="empty-icon">👥</div><div class="empty-title">Belum ada pelanggan</div><div class="empty-desc">Klik tombol "Tambah Pelanggan" untuk menambahkan</div></div></td></tr>`;
    return;
  }

  tbody.innerHTML = paged.items.map(p => {
    const badge = p.total_servis >= 5 ? '<span class="badge badge-primary" style="font-size:0.65rem">⭐ Setia</span>' : '';
    return `<tr>
      <td>
        <div class="flex items-center gap-8">
          <div class="avatar avatar-sm">${avatarInitial(p.nama)}</div>
          <div>
            <div class="font-semibold">${p.nama} ${badge}</div>
            <div class="text-muted" style="font-size:0.75rem">${p.id}</div>
          </div>
        </div>
      </td>
      <td>${p.telp}</td>
      <td class="text-muted">${p.email || '-'}</td>
      <td class="text-muted truncate" style="max-width:160px">${p.alamat || '-'}</td>
      <td><span class="badge badge-info">${p.total_servis} servis</span></td>
      <td class="text-muted">${formatDate(p.tgl_daftar)}</td>
      <td>
        <div class="flex gap-8">
          <button class="btn btn-sm btn-secondary" onclick="viewDetailPelanggan('${p.id}')">👁️</button>
          <button class="btn btn-sm btn-warning" onclick="openFormPelanggan('${p.id}')">✏️</button>
          <button class="btn btn-sm btn-danger" onclick="deletePelanggan('${p.id}')">🗑️</button>
        </div>
      </td>
    </tr>`;
  }).join('');

  renderPagination('pelanggan-pagination', pelangganPage, paged.totalPages,
    `function(p){ pelangganPage=p; renderPelangganTable(); }`);
}

function onSearchPelanggan(q) { pelangganQuery = q; pelangganPage = 1; renderPelangganTable(); }
function onFilterPelanggan(f) { pelangganFilter = f; pelangganPage = 1; renderPelangganTable(); }

function openFormPelanggan(id = null) {
  const p = id ? DB.findById(DB_KEYS.pelanggan, id) : null;
  const title = p ? `Edit Pelanggan: ${p.nama}` : 'Tambah Pelanggan Baru';
  const body = `
    <form id="form-pelanggan" onsubmit="savePelanggan(event, '${id || ''}')">
      <div class="form-row">
        <div class="form-group">
          <label>Nama Lengkap *</label>
          <input name="nama" required value="${p?.nama || ''}" placeholder="Nama lengkap pelanggan">
        </div>
        <div class="form-group">
          <label>No. Telepon *</label>
          <input name="telp" required value="${p?.telp || ''}" placeholder="08xx-xxxx-xxxx">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Email</label>
          <input name="email" type="email" value="${p?.email || ''}" placeholder="email@contoh.com">
        </div>
        <div class="form-group">
          <label>Tanggal Daftar</label>
          <input name="tgl_daftar" type="date" value="${p?.tgl_daftar || todayStr()}">
        </div>
      </div>
      <div class="form-group">
        <label>Alamat</label>
        <textarea name="alamat" placeholder="Alamat lengkap">${p?.alamat || ''}</textarea>
      </div>
      <div class="modal-footer" style="padding:0;border:none;margin-top:16px">
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Batal</button>
        <button type="submit" class="btn btn-primary">💾 Simpan</button>
      </div>
    </form>`;
  openModal(title, body);
}

function savePelanggan(e, id) {
  e.preventDefault();
  const f = new FormData(e.target);
  const data = Object.fromEntries(f.entries());
  if (id) {
    DB.update(DB_KEYS.pelanggan, id, data);
    showToast('Data pelanggan berhasil diperbarui!', 'success');
  } else {
    const kendaraan = DB.getAll(DB_KEYS.kendaraan);
    data.id = generateId('c');
    data.total_servis = 0;
    DB.insert(DB_KEYS.pelanggan, data);
    showToast('Pelanggan baru berhasil ditambahkan!', 'success');
  }
  closeModal();
  renderPelangganTable();
}

function deletePelanggan(id) {
  const p = DB.findById(DB_KEYS.pelanggan, id);
  confirmAction(`Hapus pelanggan <b>${p?.nama}</b>? Data tidak dapat dikembalikan.`, () => {
    DB.delete(DB_KEYS.pelanggan, id);
    showToast('Pelanggan dihapus!', 'success');
    renderPelangganTable();
    updateBadges();
  });
}

function viewDetailPelanggan(id) {
  const p = DB.findById(DB_KEYS.pelanggan, id);
  if (!p) return;
  const kendaraan = DB.getAll(DB_KEYS.kendaraan).filter(k => k.pelanggan_id === id);
  const wos = DB.getAll(DB_KEYS.workorder).filter(w => w.pelanggan_id === id);
  const totalBayar = DB.getAll(DB_KEYS.invoice).filter(i => i.pelanggan_id === id && i.status === 'Lunas').reduce((s, i) => s + i.total, 0);

  const body = `
    <div class="flex items-center gap-12 mb-16">
      <div class="avatar avatar-lg">${avatarInitial(p.nama)}</div>
      <div>
        <div class="font-bold" style="font-size:1.2rem">${p.nama}</div>
        <div class="text-muted">${p.email || 'Tidak ada email'}</div>
      </div>
    </div>
    <div class="grid-2 mb-16">
      <div class="info-box"><span>📞</span><span>${p.telp}</span></div>
      <div class="info-box"><span>📅</span><span>Daftar: ${formatDate(p.tgl_daftar)}</span></div>
    </div>
    <div class="info-box mb-16"><span>📍</span><span>${p.alamat || '-'}</span></div>
    <div class="grid-3 mb-16" style="text-align:center">
      <div class="card"><div class="stat-value">${p.total_servis}</div><div class="stat-label">Total Servis</div></div>
      <div class="card"><div class="stat-value">${kendaraan.length}</div><div class="stat-label">Kendaraan</div></div>
      <div class="card"><div class="stat-value" style="font-size:1rem">${formatCurrency(totalBayar)}</div><div class="stat-label">Total Bayar</div></div>
    </div>
    <div class="card-title mb-8">🏍️ Kendaraan</div>
    ${kendaraan.length === 0 ? '<p class="text-muted" style="font-size:0.85rem">Belum ada kendaraan terdaftar</p>' :
      kendaraan.map(k => `<div class="list-item"><span>${vehicleIcon(k.tipe)}</span><span class="font-semibold">${k.plat}</span><span class="text-muted">${k.merk} ${k.model} ${k.tahun}</span></div>`).join('')}
    <div class="modal-footer" style="padding:0;border:none;margin-top:16px">
      <button class="btn btn-secondary" onclick="closeModal()">Tutup</button>
      <button class="btn btn-primary" onclick="closeModal(); navigateTo('workorder')">Lihat Work Order</button>
    </div>`;
  openModal(`Detail Pelanggan`, body, 'modal-lg');
}

function exportPelanggan() {
  const data = getPelangganFiltered();
  exportCSV(data, 'pelanggan-' + todayStr(), [
    { key: 'id', label: 'ID' },
    { key: 'nama', label: 'Nama' },
    { key: 'telp', label: 'Telepon' },
    { key: 'email', label: 'Email' },
    { key: 'alamat', label: 'Alamat' },
    { key: 'total_servis', label: 'Total Servis' },
    { key: 'tgl_daftar', label: 'Tgl Daftar' },
  ]);
  showToast('Data pelanggan berhasil diekspor!', 'success');
}
