// ============================================
//  BengkelPro - Sparepart / Stok Page
// ============================================

let sparepartPage = 1;
let sparepartQuery = '';
let sparepartFilterKat = 'all';

function renderSparepart(container) {
    const all = DB.getAll(DB_KEYS.sparepart);
    const lowStock = all.filter(s => s.stok <= s.stok_min).length;
    const totalNilai = all.reduce((s, sp) => s + (sp.stok * sp.harga_beli), 0);
    const kategoriList = [...new Set(all.map(s => s.kategori))].sort();

    container.innerHTML = `
    <div class="page-header">
      <div class="page-header-left">
        <h1>📦 Stok Sparepart</h1>
        <p>Manajemen inventori dan stok suku cadang</p>
      </div>
      <div class="flex gap-8">
        <button class="btn btn-secondary" onclick="exportSparepart()">⬇️ Export</button>
        <button class="btn btn-primary" onclick="openFormSparepart()">+ Tambah Sparepart</button>
      </div>
    </div>

    <div class="stats-grid mb-16">
      <div class="stat-card blue">
        <div class="stat-icon">📦</div>
        <div class="stat-info"><div class="stat-value">${all.length}</div><div class="stat-label">Total Item</div></div>
      </div>
      <div class="stat-card ${lowStock > 0 ? 'red' : 'green'}">
        <div class="stat-icon">⚠️</div>
        <div class="stat-info"><div class="stat-value">${lowStock}</div><div class="stat-label">Stok Menipis</div></div>
      </div>
      <div class="stat-card orange">
        <div class="stat-icon">💰</div>
        <div class="stat-info"><div class="stat-value" style="font-size:1rem">${formatCurrency(totalNilai)}</div><div class="stat-label">Nilai Stok (Beli)</div></div>
      </div>
      <div class="stat-card purple">
        <div class="stat-icon">🏷️</div>
        <div class="stat-info"><div class="stat-value">${kategoriList.length}</div><div class="stat-label">Kategori</div></div>
      </div>
    </div>

    ${lowStock > 0 ? `<div class="info-box danger mb-16">⚠️ <strong>${lowStock} item</strong> memiliki stok di bawah minimum. Segera lakukan restock!</div>` : ''}

    <div class="toolbar">
      <div class="search-box">
        <span class="search-icon">🔍</span>
        <input type="text" placeholder="Cari nama, kode..." oninput="onSearchSP(this.value)">
      </div>
      <select class="filter-select" onchange="onFilterKatSP(this.value)">
        <option value="all">Semua Kategori</option>
        ${kategoriList.map(k => `<option value="${k}">${k}</option>`).join('')}
      </select>
      <select class="filter-select" onchange="onFilterStokSP(this.value)">
        <option value="all">Semua Stok</option>
        <option value="low">Stok Menipis</option>
        <option value="ok">Stok Aman</option>
      </select>
      <span id="sp-count" class="text-muted" style="font-size:0.83rem"></span>
    </div>

    <div class="card" style="padding:0">
      <div class="table-container">
        <table>
          <thead><tr>
            <th>Kode</th><th>Nama Sparepart</th><th>Kategori</th><th>Stok</th>
            <th>Min. Stok</th><th>Harga Beli</th><th>Harga Jual</th><th>Status</th><th>Aksi</th>
          </tr></thead>
          <tbody id="sp-table-body"></tbody>
        </table>
      </div>
      <div id="sp-pagination"></div>
    </div>
  `;

    sparepartPage = 1;
    let spFilterStok = 'all';
    window.onFilterStokSP = (v) => { spFilterStok = v; sparepartPage = 1; renderSPTable(spFilterStok); };
    renderSPTable(spFilterStok);
}

let spStokFilter = 'all';

function getSPFiltered(stokFilter = 'all') {
    let items = DB.getAll(DB_KEYS.sparepart);
    if (sparepartQuery) items = filterItems(items, sparepartQuery, ['nama', 'kode', 'kategori']);
    if (sparepartFilterKat !== 'all') items = items.filter(s => s.kategori === sparepartFilterKat);
    if (stokFilter === 'low') items = items.filter(s => s.stok <= s.stok_min);
    if (stokFilter === 'ok') items = items.filter(s => s.stok > s.stok_min);
    return items;
}

function renderSPTable(stokFilter = 'all') {
    spStokFilter = stokFilter;
    const all = getSPFiltered(stokFilter);
    const countEl = document.getElementById('sp-count');
    if (countEl) countEl.textContent = `${all.length} item`;

    const paged = paginate(all, sparepartPage, 9);
    const tbody = document.getElementById('sp-table-body');
    if (!tbody) return;

    if (paged.items.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9"><div class="empty-state"><div class="empty-icon">📦</div><div class="empty-title">Tidak ada sparepart ditemukan</div></div></td></tr>`;
        return;
    }

    tbody.innerHTML = paged.items.map(s => {
        const isLow = s.stok <= s.stok_min;
        const pct = Math.min(100, (s.stok / (s.stok_min * 2)) * 100);
        const margin = s.harga_beli > 0 ? Math.round(((s.harga_jual - s.harga_beli) / s.harga_beli) * 100) : 0;
        return `<tr>
      <td><span class="badge badge-secondary" style="font-size:0.7rem">${s.kode}</span></td>
      <td>
        <div class="font-semibold">${s.nama}</div>
        <div class="text-muted" style="font-size:0.75rem">${s.satuan}</div>
      </td>
      <td><span class="badge badge-info" style="font-size:0.7rem">${s.kategori}</span></td>
      <td>
        <div class="flex items-center gap-8">
          <span class="font-bold ${isLow ? 'text-danger' : 'text-success'}">${s.stok}</span>
          <div class="progress-bar" style="width:50px">
            <div class="progress-fill" style="width:${pct}%;background:${isLow ? 'var(--danger)' : 'var(--success)'}"></div>
          </div>
        </div>
      </td>
      <td>${s.stok_min} ${s.satuan}</td>
      <td>${formatCurrency(s.harga_beli)}</td>
      <td>
        <div>${formatCurrency(s.harga_jual)}</div>
        <div class="text-success" style="font-size:0.72rem">+${margin}% margin</div>
      </td>
      <td>${isLow ? '<span class="badge badge-danger">⚠️ Menipis</span>' : '<span class="badge badge-success">✓ Aman</span>'}</td>
      <td>
        <div class="flex gap-6">
          <button class="btn btn-sm btn-info" onclick="restokSparepart('${s.id}')">➕</button>
          <button class="btn btn-sm btn-warning" onclick="openFormSparepart('${s.id}')">✏️</button>
          <button class="btn btn-sm btn-danger" onclick="deleteSP('${s.id}')">🗑️</button>
        </div>
      </td>
    </tr>`;
    }).join('');

    renderPagination('sp-pagination', sparepartPage, paged.totalPages,
        `function(p){ sparepartPage=p; renderSPTable('${spStokFilter}'); }`);
}

function onSearchSP(q) { sparepartQuery = q; sparepartPage = 1; renderSPTable(spStokFilter); }
function onFilterKatSP(f) { sparepartFilterKat = f; sparepartPage = 1; renderSPTable(spStokFilter); }

function openFormSparepart(id = null) {
    const s = id ? DB.findById(DB_KEYS.sparepart, id) : null;
    const title = s ? `Edit Sparepart: ${s.nama}` : 'Tambah Sparepart Baru';
    const body = `
    <form id="form-sp" onsubmit="saveSP(event, '${id || ''}')">
      <div class="form-row">
        <div class="form-group">
          <label>Kode Sparepart *</label>
          <input name="kode" required value="${s?.kode || ''}" placeholder="Contoh: OLI-10W40" style="text-transform:uppercase">
        </div>
        <div class="form-group">
          <label>Kategori *</label>
          <input name="kategori" required value="${s?.kategori || ''}" placeholder="Oli & Cairan, Filter, Rem...">
        </div>
      </div>
      <div class="form-group">
        <label>Nama Sparepart *</label>
        <input name="nama" required value="${s?.nama || ''}" placeholder="Nama lengkap sparepart">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Satuan</label>
          <input name="satuan" value="${s?.satuan || 'Pcs'}" placeholder="Pcs, Liter, Set, dll">
        </div>
        <div class="form-group">
          <label>Stok Awal *</label>
          <input name="stok" type="number" min="0" required value="${s?.stok ?? 0}">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Stok Minimum</label>
          <input name="stok_min" type="number" min="0" value="${s?.stok_min ?? 5}">
        </div>
        <div class="form-group">
          <label>Harga Beli (Rp)</label>
          <input name="harga_beli" type="number" min="0" value="${s?.harga_beli ?? 0}">
        </div>
      </div>
      <div class="form-group">
        <label>Harga Jual (Rp)</label>
        <input name="harga_jual" type="number" min="0" value="${s?.harga_jual ?? 0}">
      </div>
      <div class="modal-footer" style="padding:0;border:none;margin-top:16px">
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Batal</button>
        <button type="submit" class="btn btn-primary">💾 Simpan</button>
      </div>
    </form>`;
    openModal(title, body, 'modal-lg');
}

function saveSP(e, id) {
    e.preventDefault();
    const f = new FormData(e.target);
    const data = Object.fromEntries(f.entries());
    data.kode = data.kode.toUpperCase();
    data.stok = parseInt(data.stok) || 0;
    data.stok_min = parseInt(data.stok_min) || 0;
    data.harga_beli = parseInt(data.harga_beli) || 0;
    data.harga_jual = parseInt(data.harga_jual) || 0;

    if (id) {
        DB.update(DB_KEYS.sparepart, id, data);
        showToast('Sparepart berhasil diperbarui!', 'success');
    } else {
        data.id = generateId('sp');
        DB.insert(DB_KEYS.sparepart, data);
        showToast('Sparepart baru ditambahkan!', 'success');
    }
    closeModal();
    renderSPTable();
    updateBadges();
}

function restokSparepart(id) {
    const s = DB.findById(DB_KEYS.sparepart, id);
    if (!s) return;
    const body = `
    <form onsubmit="doRestok(event, '${id}')">
      <div class="info-box mb-16"><span>📦</span><span><b>${s.nama}</b> — Stok saat ini: <b>${s.stok} ${s.satuan}</b></span></div>
      <div class="form-group">
        <label>Jumlah Tambah *</label>
        <input name="tambah" type="number" min="1" required value="10" autofocus>
      </div>
      <div class="form-group">
        <label>Catatan</label>
        <input name="catatan" placeholder="Supplier, tanggal beli, dll">
      </div>
      <div class="modal-footer" style="padding:0;border:none;margin-top:16px">
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Batal</button>
        <button type="submit" class="btn btn-success">➕ Tambah Stok</button>
      </div>
    </form>`;
    openModal(`Restok: ${s.nama}`, body);
}

function doRestok(e, id) {
    e.preventDefault();
    const tambah = parseInt(e.target.tambah.value) || 0;
    if (tambah <= 0) { showToast('Jumlah harus lebih dari 0!', 'error'); return; }
    const s = DB.findById(DB_KEYS.sparepart, id);
    DB.update(DB_KEYS.sparepart, id, { stok: s.stok + tambah });
    showToast(`Stok ${s.nama} bertambah ${tambah} ${s.satuan}!`, 'success');
    closeModal();
    renderSPTable(spStokFilter);
    updateBadges();
}

function deleteSP(id) {
    const s = DB.findById(DB_KEYS.sparepart, id);
    confirmAction(`Hapus sparepart <b>${s?.nama}</b>?`, () => {
        DB.delete(DB_KEYS.sparepart, id);
        showToast('Sparepart dihapus!', 'success');
        renderSPTable(spStokFilter);
        updateBadges();
    });
}

function exportSparepart() {
    const data = getSPFiltered(spStokFilter);
    exportCSV(data, 'sparepart-' + todayStr(), [
        { key: 'kode', label: 'Kode' },
        { key: 'nama', label: 'Nama' },
        { key: 'kategori', label: 'Kategori' },
        { key: 'satuan', label: 'Satuan' },
        { key: 'stok', label: 'Stok' },
        { key: 'stok_min', label: 'Stok Min' },
        { key: 'harga_beli', label: 'Harga Beli' },
        { key: 'harga_jual', label: 'Harga Jual' },
    ]);
    showToast('Data sparepart diekspor!', 'success');
}
