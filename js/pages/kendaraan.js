// ============================================
//  BengkelPro - Kendaraan Page
// ============================================

let kendaraanPage = 1;
let kendaraanQuery = '';
let kendaraanFilterTipe = 'all';

function renderKendaraan(container) {
  container.innerHTML = `
    <div class="page-header">
      <div class="page-header-left">
        <h1>🏍️ Manajemen Kendaraan</h1>
        <p>Kelola data armada pelanggan di sini</p>
      </div>
      <button class="btn btn-primary" onclick="openFormKendaraan()">+ Tambah Kendaraan</button>
    </div>

    <div class="toolbar">
      <div class="search-box">
        <span class="search-icon">🔍</span>
        <input type="text" placeholder="Cari plat, merk, model..." oninput="onSearchKendaraan(this.value)">
      </div>
      <select class="filter-select" onchange="onFilterKendaraan(this.value)">
        <option value="all">Semua Tipe</option>
        <option value="Mobil">Mobil</option>
        <option value="Motor">Motor</option>
      </select>
      <span id="kendaraan-count" class="text-muted" style="font-size:0.83rem"></span>
    </div>

    <div class="card" style="padding:0">
      <div class="table-container">
        <table>
          <thead><tr>
            <th>Tipe</th><th>Plat Nomor</th><th>Kendaraan</th><th>Tahun</th><th>Warna</th><th>KM</th><th>Pelanggan</th><th>Aksi</th>
          </tr></thead>
          <tbody id="kendaraan-table-body"></tbody>
        </table>
      </div>
      <div id="kendaraan-pagination"></div>
    </div>
  `;
  kendaraanPage = 1;
  renderKendaraanTable();
}

function getKendaraanFiltered() {
  let items = DB.getAll(DB_KEYS.kendaraan);
  if (kendaraanQuery) items = filterItems(items, kendaraanQuery, ['plat', 'merk', 'model', 'warna']);
  if (kendaraanFilterTipe !== 'all') items = items.filter(k => k.tipe === kendaraanFilterTipe);
  return items;
}

function renderKendaraanTable() {
  const all = getKendaraanFiltered();
  const countEl = document.getElementById('kendaraan-count');
  if (countEl) countEl.textContent = `${all.length} kendaraan`;

  const paged = paginate(all, kendaraanPage, 9);
  const tbody = document.getElementById('kendaraan-table-body');
  if (!tbody) return;

  if (paged.items.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8"><div class="empty-state"><div class="empty-icon">🏍️</div><div class="empty-title">Belum ada kendaraan</div><div class="empty-desc">Tambah kendaraan pelanggan untuk memulai</div></div></td></tr>`;
    return;
  }

  tbody.innerHTML = paged.items.map(k => {
    const p = DB.findById(DB_KEYS.pelanggan, k.pelanggan_id);
    return `<tr>
      <td><span style="font-size:1.4rem">${vehicleIcon(k.tipe)}</span></td>
      <td><span class="badge badge-primary" style="font-size:0.78rem;letter-spacing:0.05em">${k.plat}</span></td>
      <td>
        <div class="font-semibold">${k.merk} ${k.model}</div>
        <div class="text-muted" style="font-size:0.75rem">${k.id}</div>
      </td>
      <td>${k.tahun}</td>
      <td>
        <span class="badge badge-secondary">${k.warna}</span>
      </td>
      <td>${(k.km || 0).toLocaleString('id-ID')} km</td>
      <td>
        ${p ? `<div class="flex items-center gap-8"><div class="avatar avatar-sm">${avatarInitial(p.nama)}</div><span style="font-size:0.85rem">${p.nama}</span></div>` : '<span class="text-muted">-</span>'}
      </td>
      <td>
        <div class="flex gap-8">
          <button class="btn btn-sm btn-warning" onclick="openFormKendaraan('${k.id}')">✏️</button>
          <button class="btn btn-sm btn-danger" onclick="deleteKendaraan('${k.id}')">🗑️</button>
        </div>
      </td>
    </tr>`;
  }).join('');

  renderPagination('kendaraan-pagination', kendaraanPage, paged.totalPages,
    `function(p){ kendaraanPage=p; renderKendaraanTable(); }`);
}

function onSearchKendaraan(q) { kendaraanQuery = q; kendaraanPage = 1; renderKendaraanTable(); }
function onFilterKendaraan(f) { kendaraanFilterTipe = f; kendaraanPage = 1; renderKendaraanTable(); }

function openFormKendaraan(id = null) {
  const k = id ? DB.findById(DB_KEYS.kendaraan, id) : null;
  const pelangganList = DB.getAll(DB_KEYS.pelanggan);
  const title = k ? `Edit Kendaraan: ${k.plat}` : 'Tambah Kendaraan Baru';

  const pelangganOpts = pelangganList.map(p =>
    `<option value="${p.id}" ${k?.pelanggan_id === p.id ? 'selected' : ''}>${p.nama} (${p.telp})</option>`).join('');

  const body = `
    <form id="form-kendaraan" onsubmit="saveKendaraan(event, '${id || ''}')">
      <div class="form-row">
        <div class="form-group">
          <label>Plat Nomor *</label>
          <input name="plat" required value="${k?.plat || ''}" placeholder="B 1234 ABC" style="text-transform:uppercase">
        </div>
        <div class="form-group">
          <label>Tipe Kendaraan *</label>
          <select name="tipe" required>
            <option value="Mobil" ${k?.tipe === 'Mobil' ? 'selected' : ''}>🏍️ Mobil</option>
            <option value="Motor" ${k?.tipe === 'Motor' ? 'selected' : ''}>🏍️ Motor</option>
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Merk *</label>
          <input name="merk" required value="${k?.merk || ''}" placeholder="Toyota, Honda, dll">
        </div>
        <div class="form-group">
          <label>Model *</label>
          <input name="model" required value="${k?.model || ''}" placeholder="Avanza, Beat, dll">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Tahun</label>
          <input name="tahun" type="number" min="1990" max="2030" value="${k?.tahun || new Date().getFullYear()}">
        </div>
        <div class="form-group">
          <label>Warna</label>
          <input name="warna" value="${k?.warna || ''}" placeholder="Putih, Hitam...">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>KM Terakhir</label>
          <input name="km" type="number" min="0" value="${k?.km || 0}" placeholder="0">
        </div>
        <div class="form-group">
          <label>Pelanggan *</label>
          <select name="pelanggan_id" required>
            <option value="">-- Pilih Pelanggan --</option>
            ${pelangganOpts}
          </select>
        </div>
      </div>
      <div class="modal-footer" style="padding:0;border:none;margin-top:16px">
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Batal</button>
        <button type="submit" class="btn btn-primary">💾 Simpan</button>
      </div>
    </form>`;
  openModal(title, body, 'modal-lg');
}

function saveKendaraan(e, id) {
  e.preventDefault();
  const f = new FormData(e.target);
  const data = Object.fromEntries(f.entries());
  data.tahun = parseInt(data.tahun);
  data.km = parseInt(data.km) || 0;
  data.plat = data.plat.toUpperCase();

  if (id) {
    DB.update(DB_KEYS.kendaraan, id, data);
    showToast('Data kendaraan berhasil diperbarui!', 'success');
  } else {
    data.id = generateId('v');
    DB.insert(DB_KEYS.kendaraan, data);
    showToast('Kendaraan berhasil ditambahkan!', 'success');
  }
  closeModal();
  renderKendaraanTable();
}

function deleteKendaraan(id) {
  const k = DB.findById(DB_KEYS.kendaraan, id);
  confirmAction(`Hapus kendaraan <b>${k?.plat}</b>? Data tidak dapat dikembalikan.`, () => {
    DB.delete(DB_KEYS.kendaraan, id);
    showToast('Kendaraan dihapus!', 'success');
    renderKendaraanTable();
  });
}
