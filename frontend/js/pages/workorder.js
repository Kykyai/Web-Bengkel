// ============================================
//  BengkelPro - Work Order Page
// ============================================

let woPage = 1;
let woQuery = '';
let woFilterStatus = 'all';

function renderWorkOrder(container) {
  const antri = DB.getAll(DB_KEYS.workorder).filter(w => w.status === 'Antri').length;
  const dikerjakan = DB.getAll(DB_KEYS.workorder).filter(w => w.status === 'Dikerjakan').length;

  container.innerHTML = `
    <div class="page-header">
      <div class="page-header-left">
        <h1>🔧 Work Order</h1>
        <p>Kelola pekerjaan servis kendaraan</p>
      </div>
      <button class="btn btn-primary" onclick="openFormWO()">+ Buat Work Order</button>
    </div>

    <div class="stats-grid mb-16" style="grid-template-columns: repeat(4, 1fr)">
      ${['Antri', 'Dikerjakan', 'Selesai', 'Batal'].map((s, i) => {
    const count = DB.getAll(DB_KEYS.workorder).filter(w => w.status === s).length;
    const cls = ['yellow', 'cyan', 'green', 'secondary'][i];
    const icons = ['⏳', '🔧', '✅', '❌'];
    return `<div class="stat-card ${cls}" onclick="onFilterWO('${s}')" style="cursor:pointer">
          <div class="stat-icon">${icons[i]}</div>
          <div class="stat-info"><div class="stat-value">${count}</div><div class="stat-label">${s}</div></div>
        </div>`;
  }).join('')}
    </div>

    <div class="toolbar">
      <div class="search-box">
        <span class="search-icon">🔍</span>
        <input type="text" placeholder="Cari ID, plat, pelanggan..." oninput="onSearchWO(this.value)">
      </div>
      <select class="filter-select" id="wo-status-filter" onchange="onFilterWO(this.value)">
        <option value="all">Semua Status</option>
        <option value="Antri">Antri</option>
        <option value="Dikerjakan">Dikerjakan</option>
        <option value="Selesai">Selesai</option>
        <option value="Batal">Batal</option>
      </select>
      <span id="wo-count" class="text-muted" style="font-size:0.83rem"></span>
    </div>

    <div class="card" style="padding:0">
      <div class="table-container">
        <table>
          <thead><tr>
            <th>No. WO</th><th>Kendaraan</th><th>Pelanggan</th><th>Mekanik</th>
            <th>Keluhan</th><th>Status</th><th>Nilai</th><th>Masuk</th><th>Aksi</th>
          </tr></thead>
          <tbody id="wo-table-body"></tbody>
        </table>
      </div>
      <div id="wo-pagination"></div>
    </div>
  `;
  woPage = 1;
  renderWOTable();
}

function getWOFiltered() {
  let items = DB.getAll(DB_KEYS.workorder);
  if (woFilterStatus !== 'all') items = items.filter(w => w.status === woFilterStatus);
  if (woQuery) {
    const q = woQuery.toLowerCase();
    items = items.filter(w => {
      const k = DB.findById(DB_KEYS.kendaraan, w.kendaraan_id);
      const p = DB.findById(DB_KEYS.pelanggan, w.pelanggan_id);
      return w.id.toLowerCase().includes(q) ||
        (k?.plat || '').toLowerCase().includes(q) ||
        (p?.nama || '').toLowerCase().includes(q);
    });
  }
  return items.sort((a, b) => new Date(b.tanggal_masuk) - new Date(a.tanggal_masuk));
}

function renderWOTable() {
  const all = getWOFiltered();
  const countEl = document.getElementById('wo-count');
  if (countEl) countEl.textContent = `${all.length} work order`;

  const paged = paginate(all, woPage, 8);
  const tbody = document.getElementById('wo-table-body');
  if (!tbody) return;

  if (paged.items.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9"><div class="empty-state"><div class="empty-icon">🔧</div><div class="empty-title">Tidak ada work order</div><div class="empty-desc">Klik "Buat Work Order" untuk menambahkan</div></div></td></tr>`;
    return;
  }

  tbody.innerHTML = paged.items.map(wo => {
    const k = DB.findById(DB_KEYS.kendaraan, wo.kendaraan_id);
    const p = DB.findById(DB_KEYS.pelanggan, wo.pelanggan_id);
    const m = DB.findById(DB_KEYS.mekanik, wo.mekanik_id);
    const total = calcWOTotal(wo);
    return `<tr>
      <td><span class="font-semibold" style="font-size:0.82rem">${wo.id}</span></td>
      <td>${k ? `<span class="badge badge-primary" style="font-size:0.72rem">${k.plat}</span> <span class="text-muted" style="font-size:0.78rem">${k.merk} ${k.model}</span>` : '-'}</td>
      <td>${p ? `<div class="flex items-center gap-6"><div class="avatar avatar-sm">${avatarInitial(p.nama)}</div><span style="font-size:0.85rem">${p.nama}</span></div>` : '-'}</td>
      <td>${m ? `<span style="font-size:0.82rem">👷 ${m.nama}</span>` : '<span class="text-muted">-</span>'}</td>
      <td class="truncate" style="max-width:140px;font-size:0.82rem">${wo.keluhan || '-'}</td>
      <td>${statusBadge(wo.status)}</td>
      <td class="font-semibold" style="font-size:0.82rem">${formatCurrency(total)}</td>
      <td class="text-muted" style="font-size:0.82rem">${formatDate(wo.tanggal_masuk)}</td>
      <td>
        <div class="flex gap-6">
          <button class="btn btn-sm btn-secondary" onclick="viewDetailWO('${wo.id}')">👁️</button>
          <button class="btn btn-sm btn-warning" onclick="openFormWO('${wo.id}')">✏️</button>
          ${wo.status === 'Antri' ? `<button class="btn btn-sm btn-info" onclick="kerjakanWO('${wo.id}')" title="Mulai Dikerjakan">▶️ Kerjakan</button>` : ''}
          ${wo.status === 'Dikerjakan' ? `<button class="btn btn-sm btn-success" onclick="selesaikanWO('${wo.id}')" title="Selesaikan">✅ Selesai</button>` : ''}
          ${(wo.status === 'Antri' || wo.status === 'Dikerjakan') ? `<button class="btn btn-sm btn-danger" onclick="batalWO('${wo.id}')" title="Batalkan WO">❌</button>` : ''}
          ${wo.status === 'Selesai' && !wo.invoice_id ? `<button class="btn btn-sm btn-primary" title="Proses Pembayaran" onclick="openKasir('${wo.id}')">💳 Bayar</button>` : ''}
          ${wo.invoice_id ? `<span class="badge badge-success" style="font-size:0.7rem">✅ Lunas</span>` : ''}
          <button class="btn btn-sm btn-danger" onclick="hapusWO('${wo.id}')" title="Hapus WO" style="opacity:0.7">🗑️</button>
        </div>
      </td>
    </tr>`;
  }).join('');

  renderPagination('wo-pagination', woPage, paged.totalPages, `function(p){ woPage=p; renderWOTable(); }`);
}

function onSearchWO(q) { woQuery = q; woPage = 1; renderWOTable(); }
function onFilterWO(f) {
  woFilterStatus = f;
  woPage = 1;
  const sel = document.getElementById('wo-status-filter');
  if (sel) sel.value = f === 'all' ? 'all' : f;
  renderWOTable();
}

function openFormWO(id = null) {
  const wo = id ? DB.findById(DB_KEYS.workorder, id) : null;
  const pelangganList = DB.getAll(DB_KEYS.pelanggan);
  const mekanikList = DB.getAll(DB_KEYS.mekanik).filter(m => m.status === 'Aktif');
  const kendaraanList = DB.getAll(DB_KEYS.kendaraan);
  const sparepartList = DB.getAll(DB_KEYS.sparepart);
  const title = wo ? `Edit Work Order: ${wo.id}` : 'Buat Work Order Baru';

  const jasaDefault = (wo?.jasa || [{ nama: '', harga: 0 }]);
  const sparepartDefault = (wo?.sparepart || []);

  const body = `
    <form id="form-wo" onsubmit="saveWO(event, '${id || ''}')">
      <div class="form-row">
        <div class="form-group">
          <label>Pelanggan *</label>
          <select name="pelanggan_id" required onchange="updateKendaraanOpts(this.value, '${wo?.kendaraan_id || ''}')">
            <option value="">-- Pilih Pelanggan --</option>
            ${pelangganList.map(p => `<option value="${p.id}" ${wo?.pelanggan_id === p.id ? 'selected' : ''}>${p.nama}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label>Kendaraan *</label>
          <select name="kendaraan_id" id="kendaraan-opts" required>
            <option value="">-- Pilih Kendaraan --</option>
            ${wo?.pelanggan_id ? kendaraanList.filter(k => k.pelanggan_id === wo.pelanggan_id).map(k =>
    `<option value="${k.id}" ${k.id === wo.kendaraan_id ? 'selected' : ''}>${vehicleIcon(k.tipe)} ${k.plat} - ${k.merk} ${k.model}</option>`).join('') : ''}
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Mekanik *</label>
          <select name="mekanik_id" required>
            <option value="">-- Pilih Mekanik --</option>
            ${mekanikList.map(m => `<option value="${m.id}" ${wo?.mekanik_id === m.id ? 'selected' : ''}>${m.nama} (${m.spesialisasi})</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label>Tanggal Masuk</label>
          <input name="tanggal_masuk" type="date" value="${wo?.tanggal_masuk || todayStr()}">
        </div>
      </div>
      <div class="form-group">
        <label>Keluhan Pelanggan *</label>
        <textarea name="keluhan" required placeholder="Deskripsikan keluhan pelanggan...">${wo?.keluhan || ''}</textarea>
      </div>
      <div class="form-group">
        <label>Diagnosa Mekanik</label>
        <textarea name="diagnosa" placeholder="Hasil diagnosa/pemeriksaan...">${wo?.diagnosa || ''}</textarea>
      </div>

      <hr class="divider">
      <div class="card-title mb-8">🔨 Jasa Servis</div>
      <div id="jasa-list">
        ${jasaDefault.map((j, i) => renderJasaRow(i, j)).join('')}
      </div>
      <button type="button" class="btn btn-sm btn-secondary mb-16" onclick="addJasaRow()">+ Tambah Jasa</button>

      <hr class="divider">
      <div class="card-title mb-8">📦 Sparepart</div>
      <div id="sparepart-list">
        ${sparepartDefault.map((s, i) => renderSparepartRow(i, s, sparepartList)).join('')}
      </div>
      <button type="button" class="btn btn-sm btn-secondary mb-16" onclick="addSparepartRow()">+ Tambah Sparepart</button>

      <div class="form-group">
        <label>Catatan Tambahan</label>
        <textarea name="catatan" placeholder="Catatan untuk pelanggan...">${wo?.catatan || ''}</textarea>
      </div>

      <div class="modal-footer" style="padding:0;border:none;margin-top:8px">
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Batal</button>
        <button type="submit" class="btn btn-primary">💾 Simpan Work Order</button>
      </div>
    </form>`;
  openModal(title, body, 'modal-xl');
}

function renderJasaRow(i, j = {}) {
  return `<div class="form-row" id="jasa-row-${i}" style="margin-bottom:8px">
    <div class="form-group" style="margin-bottom:0">
      <input name="jasa_nama_${i}" placeholder="Nama pekerjaan/jasa" value="${j.nama || ''}">
    </div>
    <div class="form-group" style="margin-bottom:0;display:flex;gap:6px">
      <input name="jasa_harga_${i}" type="number" min="0" placeholder="Harga" value="${j.harga || 0}" style="flex:1">
      <button type="button" class="btn btn-sm btn-danger btn-icon" onclick="document.getElementById('jasa-row-${i}').remove()">✕</button>
    </div>
  </div>`;
}

let jasaCount = 1;
function addJasaRow() {
  const el = document.createElement('div');
  el.innerHTML = renderJasaRow(Date.now());
  document.getElementById('jasa-list').appendChild(el.firstChild);
}

function renderSparepartRow(i, s = {}, sparepartList = []) {
  const opts = sparepartList.map(sp =>
    `<option value="${sp.id}" data-harga="${sp.harga_jual}" data-nama="${sp.nama}" ${s.sparepart_id === sp.id ? 'selected' : ''}>${sp.nama} (Stok: ${sp.stok})</option>`
  ).join('');
  return `<div class="form-row" id="sp-row-${i}" style="margin-bottom:8px">
    <div class="form-group" style="margin-bottom:0">
      <select name="sp_id_${i}" onchange="onSparepartChange(this, ${i})">
        <option value="">-- Pilih Sparepart --</option>
        ${opts}
      </select>
    </div>
    <div class="form-group" style="margin-bottom:0;display:flex;gap:6px;align-items:flex-end">
      <div style="flex:1;display:flex;gap:6px">
        <input name="sp_qty_${i}" type="number" min="1" placeholder="Qty" value="${s.qty || 1}" style="width:70px">
        <input name="sp_harga_${i}" type="number" min="0" placeholder="Harga/pcs" value="${s.harga || 0}" style="flex:1">
      </div>
      <button type="button" class="btn btn-sm btn-danger btn-icon" onclick="document.getElementById('sp-row-${i}').remove()">✕</button>
    </div>
  </div>`;
}

function onSparepartChange(sel, i) {
  const opt = sel.options[sel.selectedIndex];
  const harga = opt.dataset.harga || 0;
  const hargaInput = document.querySelector(`[name="sp_harga_${i}"]`);
  if (hargaInput) hargaInput.value = harga;
}

function addSparepartRow() {
  const sparepartList = DB.getAll(DB_KEYS.sparepart);
  const id = Date.now();
  const el = document.createElement('div');
  el.innerHTML = renderSparepartRow(id, {}, sparepartList);
  document.getElementById('sparepart-list').appendChild(el.firstChild);
}

function updateKendaraanOpts(pelangganId, selectedId = '') {
  const kendaraanList = DB.getAll(DB_KEYS.kendaraan).filter(k => k.pelanggan_id === pelangganId);
  const sel = document.getElementById('kendaraan-opts');
  if (!sel) return;
  sel.innerHTML = `<option value="">-- Pilih Kendaraan --</option>` +
    kendaraanList.map(k => `<option value="${k.id}" ${k.id === selectedId ? 'selected' : ''}>${vehicleIcon(k.tipe)} ${k.plat} - ${k.merk} ${k.model}</option>`).join('');
}

function saveWO(e, id) {
  e.preventDefault();
  const f = new FormData(e.target);
  const data = Object.fromEntries(f.entries());

  // Parse jasa
  const jasa = [];
  document.querySelectorAll('[name^="jasa_nama_"]').forEach(inp => {
    const suffix = inp.name.replace('jasa_nama_', '');
    const hargaEl = document.querySelector(`[name="jasa_harga_${suffix}"]`);
    if (inp.value.trim()) {
      jasa.push({ nama: inp.value.trim(), harga: parseInt(hargaEl?.value || 0) });
    }
  });

  // Parse sparepart
  const sparepart = [];
  document.querySelectorAll('[name^="sp_id_"]').forEach(sel => {
    const suffix = sel.name.replace('sp_id_', '');
    const qtyEl = document.querySelector(`[name="sp_qty_${suffix}"]`);
    const hargaEl = document.querySelector(`[name="sp_harga_${suffix}"]`);
    if (sel.value) {
      const sp = DB.findById(DB_KEYS.sparepart, sel.value);
      sparepart.push({
        sparepart_id: sel.value,
        nama: sp?.nama || '',
        qty: parseInt(qtyEl?.value || 1),
        harga: parseInt(hargaEl?.value || 0)
      });
    }
  });

  const woData = {
    pelanggan_id: data.pelanggan_id,
    kendaraan_id: data.kendaraan_id,
    mekanik_id: data.mekanik_id,
    tanggal_masuk: data.tanggal_masuk,
    keluhan: data.keluhan,
    diagnosa: data.diagnosa,
    catatan: data.catatan,
    jasa, sparepart,
  };

  if (id) {
    DB.update(DB_KEYS.workorder, id, woData);
    showToast('Work Order berhasil diperbarui!', 'success');
  } else {
    woData.id = generateWOId();
    woData.status = 'Antri';
    woData.tanggal_selesai = null;
    woData.invoice_id = null;
    DB.insert(DB_KEYS.workorder, woData);

    // Update total servis pelanggan
    const p = DB.findById(DB_KEYS.pelanggan, woData.pelanggan_id);
    if (p) DB.update(DB_KEYS.pelanggan, p.id, { total_servis: (p.total_servis || 0) + 1 });

    showToast(`Work Order ${woData.id} berhasil dibuat!`, 'success');
  }
  closeModal();
  renderWOTable();
  updateBadges();
}

function kerjakanWO(id) {
  const wo = DB.findById(DB_KEYS.workorder, id);
  if (!wo) return;
  DB.update(DB_KEYS.workorder, id, { status: 'Dikerjakan' });
  showToast(`Work Order ${id} sekarang sedang Dikerjakan!`, 'success');
  renderWOTable();
  updateBadges();
}

function selesaikanWO(id) {
  const wo = DB.findById(DB_KEYS.workorder, id);
  if (!wo) return;
  if (wo.status !== 'Dikerjakan') {
    showToast('Kerjakan WO terlebih dahulu sebelum diselesaikan!', 'warning');
    return;
  }

  // Kurangi stok sparepart
  (wo.sparepart || []).forEach(sp => {
    const s = DB.findById(DB_KEYS.sparepart, sp.sparepart_id);
    if (s) {
      const newStok = Math.max(0, s.stok - sp.qty);
      DB.update(DB_KEYS.sparepart, sp.sparepart_id, { stok: newStok });
    }
  });

  DB.update(DB_KEYS.workorder, id, { status: 'Selesai', tanggal_selesai: todayStr() });
  showToast(`Work Order ${id} selesai! Siap untuk pembayaran. 💳`, 'success');
  renderWOTable();
  updateBadges();
}

function batalWO(id) {
  const wo = DB.findById(DB_KEYS.workorder, id);
  if (!wo) return;
  if (wo.status === 'Selesai' || wo.status === 'Batal') {
    showToast('WO yang sudah selesai atau sudah dibatal tidak bisa dibatalkan.', 'warning');
    return;
  }
  confirmAction(`Batalkan Work Order ${id}? Status akan diubah menjadi Batal.`, () => {
    DB.update(DB_KEYS.workorder, id, { status: 'Batal' });
    showToast(`Work Order ${id} telah dibatalkan.`, 'warning');
    renderWOTable();
    updateBadges();
  });
}

function hapusWO(id) {
  const wo = DB.findById(DB_KEYS.workorder, id);
  if (!wo) return;
  const msg = wo.invoice_id
    ? `Hapus Work Order ${id}? ⚠️ WO ini sudah memiliki invoice terkait. Invoice TIDAK akan ikut terhapus.`
    : `Hapus Work Order ${id} secara permanen? Tindakan ini tidak bisa dibatalkan.`;
  confirmAction(msg, () => {
    DB.delete(DB_KEYS.workorder, id);
    showToast(`Work Order ${id} berhasil dihapus.`, 'success');
    renderWOTable();
    updateBadges();
  });
}

function viewDetailWO(id) {
  const wo = DB.findById(DB_KEYS.workorder, id);
  if (!wo) return;
  const k = DB.findById(DB_KEYS.kendaraan, wo.kendaraan_id);
  const p = DB.findById(DB_KEYS.pelanggan, wo.pelanggan_id);
  const m = DB.findById(DB_KEYS.mekanik, wo.mekanik_id);
  const total = calcWOTotal(wo);
  const jasaTotal = (wo.jasa || []).reduce((s, j) => s + j.harga, 0);
  const partTotal = (wo.sparepart || []).reduce((s, sp) => s + (sp.harga * sp.qty), 0);

  const body = `
    <div class="grid-2 mb-16">
      <div>
        <div class="text-muted mb-8" style="font-size:0.78rem;text-transform:uppercase;letter-spacing:0.05em">Work Order</div>
        <div class="font-bold" style="font-size:1.1rem">${wo.id}</div>
        <div class="mt-8">${statusBadge(wo.status)}</div>
      </div>
      <div>
        <div class="text-muted" style="font-size:0.78rem">Tanggal Masuk</div>
        <div class="font-semibold">${formatDate(wo.tanggal_masuk)}</div>
        ${wo.tanggal_selesai ? `<div class="text-muted" style="font-size:0.78rem;margin-top:4px">Tanggal Selesai</div><div class="font-semibold">${formatDate(wo.tanggal_selesai)}</div>` : ''}
      </div>
    </div>
    <div class="grid-2 mb-16">
      <div class="card" style="padding:12px">
        <div class="text-muted" style="font-size:0.75rem">Pelanggan</div>
        <div class="font-semibold mt-8">${p?.nama || '-'}</div>
        <div class="text-muted" style="font-size:0.8rem">${p?.telp || ''}</div>
      </div>
      <div class="card" style="padding:12px">
        <div class="text-muted" style="font-size:0.75rem">Kendaraan</div>
        <div class="font-semibold mt-8">${k ? `${vehicleIcon(k.tipe)} ${k.plat}` : '-'}</div>
        <div class="text-muted" style="font-size:0.8rem">${k ? `${k.merk} ${k.model} ${k.tahun}` : ''}</div>
      </div>
    </div>
    <div class="info-box mb-8"><span>👷</span><span>Mekanik: <b>${m?.nama || '-'}</b> (${m?.spesialisasi || ''})</span></div>
    <div class="info-box warning mb-8"><span>⚠️</span><span>Keluhan: ${wo.keluhan}</span></div>
    ${wo.diagnosa ? `<div class="info-box mb-16"><span>🔍</span><span>Diagnosa: ${wo.diagnosa}</span></div>` : ''}

    <div class="card-title mb-8">🔨 Jasa Servis</div>
    <div class="table-container mb-12">
      <table>
        <thead><tr><th>Jasa</th><th class="text-right">Harga</th></tr></thead>
        <tbody>
          ${(wo.jasa || []).map(j => `<tr><td>${j.nama}</td><td class="text-right">${formatCurrency(j.harga)}</td></tr>`).join('')}
          ${wo.jasa?.length === 0 ? '<tr><td colspan="2" class="text-center text-muted">Tidak ada jasa</td></tr>' : ''}
        </tbody>
      </table>
    </div>

    <div class="card-title mb-8">📦 Sparepart</div>
    <div class="table-container mb-12">
      <table>
        <thead><tr><th>Sparepart</th><th>Qty</th><th class="text-right">Harga/pcs</th><th class="text-right">Subtotal</th></tr></thead>
        <tbody>
          ${(wo.sparepart || []).map(sp => `<tr>
            <td>${sp.nama}</td>
            <td>${sp.qty}</td>
            <td class="text-right">${formatCurrency(sp.harga)}</td>
            <td class="text-right font-semibold">${formatCurrency(sp.harga * sp.qty)}</td>
          </tr>`).join('')}
          ${wo.sparepart?.length === 0 ? '<tr><td colspan="4" class="text-center text-muted">Tidak ada sparepart</td></tr>' : ''}
        </tbody>
      </table>
    </div>

    <div class="card" style="padding:14px">
      <div class="flex justify-between mb-8"><span class="text-muted">Total Jasa</span><span>${formatCurrency(jasaTotal)}</span></div>
      <div class="flex justify-between mb-8"><span class="text-muted">Total Sparepart</span><span>${formatCurrency(partTotal)}</span></div>
      <hr class="divider" style="margin:8px 0">
      <div class="flex justify-between"><span class="font-bold">TOTAL</span><span class="font-bold" style="color:var(--primary)">${formatCurrency(total)}</span></div>
    </div>

    ${wo.catatan ? `<div class="info-box mt-12"><span>📝</span><span>${wo.catatan}</span></div>` : ''}

    <div class="modal-footer" style="padding:0;border:none;margin-top:16px">
      <button class="btn btn-secondary" onclick="closeModal()">Tutup</button>
      ${wo.status === 'Antri' ? `<button class="btn btn-info" onclick="closeModal(); kerjakanWO('${wo.id}')">▶️ Kerjakan</button>` : ''}
      ${wo.status === 'Dikerjakan' ? `<button class="btn btn-success" onclick="closeModal(); selesaikanWO('${wo.id}')">✅ Selesaikan</button>` : ''}
      ${(wo.status === 'Antri' || wo.status === 'Dikerjakan') ? `<button class="btn btn-danger" onclick="closeModal(); batalWO('${wo.id}')">❌ Batalkan</button>` : ''}
      ${wo.status === 'Selesai' && !wo.invoice_id ? `<button class="btn btn-primary" onclick="closeModal(); openKasir('${wo.id}')">💳 Bayar</button>` : ''}
    </div>`;
  openModal(`Detail Work Order`, body, 'modal-xl');
}

function buatInvoiceFromWO(woId) {
  navigateTo('invoice');
  setTimeout(() => openFormInvoice(null, woId), 200);
}

// ============================================
//  KASIR - Proses Pembayaran Lengkap
// ============================================

function openKasir(woId) {
  const wo = DB.findById(DB_KEYS.workorder, woId);
  if (!wo) return;
  const k = DB.findById(DB_KEYS.kendaraan, wo.kendaraan_id);
  const p = DB.findById(DB_KEYS.pelanggan, wo.pelanggan_id);
  const m = DB.findById(DB_KEYS.mekanik, wo.mekanik_id);
  const settings = DB.get(DB_KEYS.settings) || DEFAULT_SETTINGS;
  const subtotal = calcWOTotal(wo);
  const total = subtotal;

  const jasaRows = (wo.jasa || []).map(j =>
    `<tr><td>${j.nama}</td><td class="text-right">${formatCurrency(j.harga)}</td></tr>`
  ).join('');
  const partRows = (wo.sparepart || []).map(sp =>
    `<tr><td>${sp.nama} x${sp.qty}</td><td class="text-right">${formatCurrency(sp.harga * sp.qty)}</td></tr>`
  ).join('');

  const body = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">

      <!-- Kiri: Rincian Tagihan -->
      <div>
        <div class="card-title mb-12">🧾 Rincian Tagihan</div>
        
        <!-- Info Pelanggan & Kendaraan -->
        <div class="card" style="padding:12px;margin-bottom:12px">
          <div class="flex items-center gap-8 mb-8">
            <div class="avatar avatar-sm">${p ? avatarInitial(p.nama) : '?'}</div>
            <div>
              <div class="font-semibold" style="font-size:0.9rem">${p?.nama || '-'}</div>
              <div class="text-muted" style="font-size:0.78rem">${p?.telp || ''}</div>
            </div>
          </div>
          <div class="text-muted" style="font-size:0.82rem">${k ? `${vehicleIcon(k.tipe)} ${k.plat} — ${k.merk} ${k.model} ${k.tahun}` : '-'}</div>
          <div class="text-muted" style="font-size:0.78rem;margin-top:4px">👷 ${m?.nama || '-'} | WO: <b>${wo.id}</b></div>
        </div>

        <!-- Tabel Item -->
        <table style="width:100%;font-size:0.82rem;border-collapse:collapse;margin-bottom:10px">
          <thead><tr style="border-bottom:1px solid var(--border)">
            <th style="text-align:left;padding:6px 4px;color:var(--text-muted)">Item</th>
            <th style="text-align:right;padding:6px 4px;color:var(--text-muted)">Harga</th>
          </tr></thead>
          <tbody>
            ${jasaRows || '<tr><td colspan="2" class="text-muted" style="padding:4px;font-size:0.78rem">-</td></tr>'}
            ${partRows || ''}
          </tbody>
        </table>

        <!-- Kalkulasi Total -->
        <div class="card" style="padding:12px">
          <div class="flex justify-between mb-6" style="font-size:0.85rem">
            <span class="text-muted">Subtotal</span>
            <span>${formatCurrency(subtotal)}</span>
          </div>

          <div class="flex justify-between mb-6" style="font-size:0.85rem">
            <span class="text-muted">Diskon</span>
            <span class="text-success">- <input type="number" id="kasir-diskon" min="0" value="0" 
              style="width:90px;background:var(--bg-elevated);border:1px solid var(--border);border-radius:6px;padding:2px 6px;color:var(--text-primary);font-size:0.82rem"
              oninput="recalcKasir(${subtotal})"></span>
          </div>
          <hr class="divider" style="margin:8px 0">
          <div class="flex justify-between" style="font-size:1.05rem">
            <span class="font-bold">TOTAL</span>
            <span class="font-bold" style="color:var(--primary)" id="kasir-total-disp">${formatCurrency(total)}</span>
          </div>
          <input type="hidden" id="kasir-total-val" value="${total}">
        </div>
      </div>

      <!-- Kanan: Input Pembayaran -->
      <div>
        <div class="card-title mb-12">💳 Pembayaran</div>

        <div class="form-group">
          <label>Metode Pembayaran</label>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:6px">
            ${[['💵', 'Tunai'], ['📱', 'QRIS'], ['🏦', 'Transfer Bank'], ['💳', 'Debit/Kredit']].map(([icon, label]) => `
              <label style="display:flex;align-items:center;gap:8px;padding:10px 12px;background:var(--bg-elevated);border:2px solid var(--border);border-radius:10px;cursor:pointer;transition:all 0.2s"
                onclick="setMetode(this, '${label}')">
                <input type="radio" name="kasir-metode" value="${label}" ${label === 'Tunai' ? 'checked' : ''} style="display:none">
                <span style="font-size:1.1rem">${icon}</span>
                <span style="font-size:0.83rem;font-weight:500">${label}</span>
              </label>`).join('')}
          </div>
        </div>

        <div id="tunai-section" class="form-group" style="margin-top:12px">
          <label>Uang Diterima (Rp)</label>
          <input type="number" id="kasir-bayar" min="0" value="${total}"
            style="font-size:1.1rem;font-weight:700;text-align:right"
            oninput="recalcKembalian()" placeholder="Masukkan jumlah uang">
          
          <!-- Tombol cepat -->
          <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px" id="quick-cash-btns">
            ${[50000, 100000, 150000, 200000].map(n =>
    `<button type="button" class="btn btn-sm btn-secondary" onclick="setCashAmount(${n})">${formatCurrency(n).replace('Rp', '')}</button>`
  ).join('')}
            <button type="button" class="btn btn-sm btn-secondary" onclick="setCashAmount(document.getElementById('kasir-total-val').value*1)">Pas</button>
          </div>
        </div>

        <!-- Kembalian -->
        <div class="card" style="padding:14px;margin-top:12px;background:linear-gradient(135deg,rgba(34,197,94,0.12),rgba(16,185,129,0.08));border-color:rgba(34,197,94,0.3)">
          <div class="text-muted mb-4" style="font-size:0.78rem;text-transform:uppercase;letter-spacing:0.05em">Kembalian</div>
          <div id="kasir-kembalian" style="font-size:1.8rem;font-weight:800;color:var(--success)">Rp 0</div>
        </div>

        <div class="form-group" style="margin-top:12px">
          <label>Catatan (opsional)</label>
          <input type="text" id="kasir-catatan" placeholder="Terima kasih telah berkunjung...">
        </div>

        <!-- Tombol Aksi -->
        <div style="display:flex;flex-direction:column;gap:8px;margin-top:16px">
          <button class="btn btn-primary" style="width:100%;padding:14px;font-size:1rem" 
            onclick="prosesKasir('${woId}', ${subtotal})">
            ✅ Proses Pembayaran & Cetak Struk
          </button>
          <button class="btn btn-secondary" style="width:100%"
            onclick="closeModal(); buatInvoiceFromWO('${woId}')">
            🧾 Buat Invoice Dulu
          </button>
          <button class="btn btn-secondary" onclick="closeModal()">Batal</button>
        </div>
      </div>
    </div>`;

  openModal('💳 Kasir — Proses Pembayaran', body, 'modal-xl');

  // Highlight metode terpilih
  setTimeout(() => {
    const tunaiLabel = document.querySelector('[name="kasir-metode"][value="Tunai"]')?.closest('label');
    if (tunaiLabel) tunaiLabel.style.borderColor = 'var(--primary)';
    recalcKembalian();
  }, 100);
}

function setMetode(labelEl, metode) {
  // Reset semua
  document.querySelectorAll('[name="kasir-metode"]').forEach(r => {
    r.closest('label').style.borderColor = 'var(--border)';
  });
  labelEl.style.borderColor = 'var(--primary)';
  // Sembunyikan/tampilkan input tunai
  const tunaiSection = document.getElementById('tunai-section');
  if (tunaiSection) tunaiSection.style.display = metode === 'Tunai' ? 'block' : 'none';
  if (metode !== 'Tunai') {
    const kembalianEl = document.getElementById('kasir-kembalian');
    if (kembalianEl) kembalianEl.textContent = '-';
  }
}

function setCashAmount(amount) {
  const el = document.getElementById('kasir-bayar');
  if (el) { el.value = amount; recalcKembalian(); }
}

function recalcKasir(subtotal) {
  const diskon = parseInt(document.getElementById('kasir-diskon')?.value || 0);
  const total = Math.max(0, subtotal - diskon);
  const totalEl = document.getElementById('kasir-total-disp');
  const totalValEl = document.getElementById('kasir-total-val');
  if (totalEl) totalEl.textContent = formatCurrency(total);
  if (totalValEl) totalValEl.value = total;
  const bayarEl = document.getElementById('kasir-bayar');
  if (bayarEl && parseInt(bayarEl.value) < total) bayarEl.value = total;
  recalcKembalian();
}

function recalcKembalian() {
  const total = parseInt(document.getElementById('kasir-total-val')?.value || 0);
  const bayar = parseInt(document.getElementById('kasir-bayar')?.value || 0);
  const kembalian = bayar - total;
  const el = document.getElementById('kasir-kembalian');
  if (!el) return;
  if (kembalian < 0) {
    el.textContent = '⚠️ Kurang ' + formatCurrency(Math.abs(kembalian));
    el.style.color = 'var(--danger)';
  } else {
    el.textContent = formatCurrency(kembalian);
    el.style.color = 'var(--success)';
  }
}

function prosesKasir(woId, subtotal) {
  const total = parseInt(document.getElementById('kasir-total-val')?.value || 0);
  const bayar = parseInt(document.getElementById('kasir-bayar')?.value || 0);
  const diskon = parseInt(document.getElementById('kasir-diskon')?.value || 0);
  const metodeEl = document.querySelector('[name="kasir-metode"]:checked');
  const metode = metodeEl?.value || 'Tunai';
  const catatan = document.getElementById('kasir-catatan')?.value || '';
  const kembalian = bayar - total;

  if (metode === 'Tunai' && kembalian < 0) {
    showToast('Uang pembayaran kurang!', 'danger');
    return;
  }

  // Buat invoice otomatis
  const wo = DB.findById(DB_KEYS.workorder, woId);
  const invData = {
    id: generateInvId(),
    workorder_id: woId,
    pelanggan_id: wo?.pelanggan_id || '',
    tanggal: todayStr(),
    subtotal, pajak: 0, diskon, total,
    metode, status: 'Lunas',
    catatan: catatan || 'Dibayar melalui kasir',
    uang_bayar: bayar,
    kembalian: Math.max(0, kembalian),
  };
  DB.insert(DB_KEYS.invoice, invData);
  DB.update(DB_KEYS.workorder, woId, { invoice_id: invData.id });

  closeModal();
  showToast(`✅ Pembayaran berhasil! Kembalian: ${formatCurrency(Math.max(0, kembalian))}`, 'success');
  renderWOTable();
  updateBadges();

  // Cetak struk otomatis
  setTimeout(() => cetakStrukMini(invData.id), 400);
}

function cetakStrukMini(invId) {
  const inv = DB.findById(DB_KEYS.invoice, invId);
  if (!inv) return;
  const wo = DB.findById(DB_KEYS.workorder, inv.workorder_id);
  const p = DB.findById(DB_KEYS.pelanggan, inv.pelanggan_id);
  const k = wo ? DB.findById(DB_KEYS.kendaraan, wo.kendaraan_id) : null;
  const settings = DB.get(DB_KEYS.settings) || DEFAULT_SETTINGS;

  const garis = '================================';
  const itemRows = [
    ...(wo?.jasa || []).map(j => `
          <tr><td style="padding:2px 0">${j.nama}</td><td style="text-align:right;padding:2px 0">${formatCurrency(j.harga)}</td></tr>`),
    ...(wo?.sparepart || []).map(sp => `
          <tr><td style="padding:2px 0">${sp.nama} x${sp.qty}</td><td style="text-align:right;padding:2px 0">${formatCurrency(sp.harga * sp.qty)}</td></tr>`),
  ].join('');

  const html = `
    <div style="font-family:'Courier New',monospace;font-size:12px;max-width:300px;margin:0 auto;color:#1a1a1a">
      <div style="text-align:center;margin-bottom:8px">
        <div style="font-size:15px;font-weight:800">🔧 ${settings.namabengkel}</div>
        <div style="font-size:10px;color:#555">${settings.alamat}</div>
        <div style="font-size:10px;color:#555">${settings.telepon}</div>
      </div>
      <div style="border-top:1px dashed #999;border-bottom:1px dashed #999;padding:6px 0;margin-bottom:8px;text-align:center;font-size:10px">
        No: ${inv.id} | ${formatDate(inv.tanggal)}
      </div>
      ${p ? `<div style="font-size:10px;margin-bottom:6px">Pelanggan: <b>${p.nama}</b></div>` : ''}
      ${k ? `<div style="font-size:10px;margin-bottom:8px">Kendaraan: ${k.plat} — ${k.merk} ${k.model}</div>` : ''}
      <table style="width:100%;font-size:11px;border-collapse:collapse">
        <tbody>${itemRows}</tbody>
      </table>
      <div style="border-top:1px dashed #999;margin:8px 0"></div>
      ${inv.diskon > 0 ? `<div style="display:flex;justify-content:space-between;font-size:11px"><span>Diskon</span><span style="color:#16a34a">- ${formatCurrency(inv.diskon)}</span></div>` : ''}
      <div style="display:flex;justify-content:space-between;font-size:11px"><span>Pajak</span><span>${formatCurrency(inv.pajak)}</span></div>
      <div style="border-top:1px dashed #999;margin:8px 0"></div>
      <div style="display:flex;justify-content:space-between;font-size:14px;font-weight:800"><span>TOTAL</span><span>${formatCurrency(inv.total)}</span></div>
      <div style="display:flex;justify-content:space-between;font-size:11px;margin-top:4px"><span>Bayar (${inv.metode})</span><span>${formatCurrency(inv.uang_bayar || inv.total)}</span></div>
      ${(inv.kembalian || 0) > 0 ? `<div style="display:flex;justify-content:space-between;font-size:12px;font-weight:700;color:#16a34a"><span>Kembalian</span><span>${formatCurrency(inv.kembalian)}</span></div>` : ''}
      <div style="border-top:1px dashed #999;margin:10px 0"></div>
      <div style="text-align:center;font-size:10px;color:#555">
        Terima kasih, ${p?.nama || 'Pelanggan'}!<br>
        ${settings.tagline}
      </div>
    </div>`;

  printInvoice(html);
}
