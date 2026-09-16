// ============================================
//  BengkelPro - Invoice & Kasir Page
// ============================================

let invoicePage = 1;
let invoiceQuery = '';
let invoiceFilterStatus = 'all';

function renderInvoice(container) {
  const invoices = DB.getAll(DB_KEYS.invoice);
  const totalLunas = invoices.filter(i => i.status === 'Lunas').reduce((s, i) => s + i.total, 0);
  const totalHutang = invoices.filter(i => i.status === 'Belum Lunas').reduce((s, i) => s + i.total, 0);

  container.innerHTML = `
    <div class="page-header">
      <div class="page-header-left">
        <h1>🧾 Invoice & Kasir</h1>
        <p>Kelola tagihan dan pembayaran pelanggan</p>
      </div>
      <button class="btn btn-primary" onclick="openFormInvoice()">+ Buat Invoice</button>
    </div>

    <div class="stats-grid mb-16">
      <div class="stat-card green">
        <div class="stat-icon">💰</div>
        <div class="stat-info">
          <div class="stat-value" style="font-size:1rem">${formatCurrency(totalLunas)}</div>
          <div class="stat-label">Total Terbayar (${invoices.filter(i => i.status === 'Lunas').length} inv)</div>
        </div>
      </div>
      <div class="stat-card red">
        <div class="stat-icon">💳</div>
        <div class="stat-info">
          <div class="stat-value" style="font-size:1rem">${formatCurrency(totalHutang)}</div>
          <div class="stat-label">Belum Lunas (${invoices.filter(i => i.status === 'Belum Lunas').length} inv)</div>
        </div>
      </div>
      <div class="stat-card blue">
        <div class="stat-icon">📄</div>
        <div class="stat-info"><div class="stat-value">${invoices.length}</div><div class="stat-label">Total Invoice</div></div>
      </div>
    </div>

    <div class="toolbar">
      <div class="search-box">
        <span class="search-icon">🔍</span>
        <input type="text" placeholder="Cari no. invoice, pelanggan..." oninput="onSearchInvoice(this.value)">
      </div>
      <select class="filter-select" onchange="onFilterInvoice(this.value)">
        <option value="all">Semua Status</option>
        <option value="Lunas">Lunas</option>
        <option value="Belum Lunas">Belum Lunas</option>
      </select>
      <span id="inv-count" class="text-muted" style="font-size:0.83rem"></span>
    </div>

    <div class="card" style="padding:0">
      <div class="table-container">
        <table>
          <thead><tr>
            <th>No. Invoice</th><th>Pelanggan</th><th>Work Order</th>
            <th>Tanggal</th><th>Subtotal</th><th>Diskon</th><th>Total</th>
            <th>Metode</th><th>Status</th><th>Aksi</th>
          </tr></thead>
          <tbody id="invoice-table-body"></tbody>
        </table>
      </div>
      <div id="invoice-pagination"></div>
    </div>
  `;
  invoicePage = 1;
  renderInvoiceTable();
}

function getInvoiceFiltered() {
  let items = DB.getAll(DB_KEYS.invoice);
  if (invoiceFilterStatus !== 'all') items = items.filter(i => i.status === invoiceFilterStatus);
  if (invoiceQuery) {
    const q = invoiceQuery.toLowerCase();
    items = items.filter(i => {
      const p = DB.findById(DB_KEYS.pelanggan, i.pelanggan_id);
      return i.id.toLowerCase().includes(q) || (p?.nama || '').toLowerCase().includes(q);
    });
  }
  return items.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
}

function renderInvoiceTable() {
  const all = getInvoiceFiltered();
  const countEl = document.getElementById('inv-count');
  if (countEl) countEl.textContent = `${all.length} invoice`;

  const paged = paginate(all, invoicePage, 8);
  const tbody = document.getElementById('invoice-table-body');
  if (!tbody) return;

  if (paged.items.length === 0) {
    tbody.innerHTML = `<tr><td colspan="10"><div class="empty-state"><div class="empty-icon">🧾</div><div class="empty-title">Belum ada invoice</div><div class="empty-desc">Invoice akan muncul setelah work order selesai</div></div></td></tr>`;
    return;
  }

  tbody.innerHTML = paged.items.map(inv => {
    const p = DB.findById(DB_KEYS.pelanggan, inv.pelanggan_id);
    return `<tr>
      <td><span class="font-semibold" style="font-size:0.82rem">${inv.id}</span></td>
      <td>
        <div class="flex items-center gap-6">
          <div class="avatar avatar-sm">${p ? avatarInitial(p.nama) : '?'}</div>
          <span style="font-size:0.85rem">${p?.nama || '-'}</span>
        </div>
      </td>
      <td><span class="badge badge-secondary" style="font-size:0.7rem">${inv.workorder_id || '-'}</span></td>
      <td class="text-muted" style="font-size:0.82rem">${formatDate(inv.tanggal)}</td>
      <td style="font-size:0.82rem">${formatCurrency(inv.subtotal)}</td>
      <td style="font-size:0.82rem;color:var(--success)">${inv.diskon > 0 ? '-' + formatCurrency(inv.diskon) : '-'}</td>
      <td class="font-bold" style="color:var(--primary)">${formatCurrency(inv.total)}</td>
      <td>
        <span class="badge badge-secondary" style="font-size:0.7rem">${inv.metode || '-'}</span>
      </td>
      <td>${statusBadge(inv.status)}</td>
      <td>
        <div class="flex gap-6">
          <button class="btn btn-sm btn-secondary" onclick="previewInvoice('${inv.id}')">👁️</button>
          <button class="btn btn-sm btn-primary" onclick="cetakInvoice('${inv.id}')">🖨️</button>
          ${inv.status === 'Belum Lunas' ? `<button class="btn btn-sm btn-success" onclick="lunasiInvoice('${inv.id}')">✅</button>` : ''}
        </div>
      </td>
    </tr>`;
  }).join('');

  renderPagination('invoice-pagination', invoicePage, paged.totalPages,
    `function(p){ invoicePage=p; renderInvoiceTable(); }`);
}

function onSearchInvoice(q) { invoiceQuery = q; invoicePage = 1; renderInvoiceTable(); }
function onFilterInvoice(f) { invoiceFilterStatus = f; invoicePage = 1; renderInvoiceTable(); }

function openFormInvoice(id = null, woId = null) {
  const inv = id ? DB.findById(DB_KEYS.invoice, id) : null;
  const wo = woId ? DB.findById(DB_KEYS.workorder, woId) : null;

  // WOs yang sudah selesai dan belum dibuat invoice
  const availableWOs = DB.getAll(DB_KEYS.workorder).filter(w => w.status === 'Selesai' && !w.invoice_id);
  const settings = DB.get(DB_KEYS.settings) || DEFAULT_SETTINGS;

  const woOpts = availableWOs.map(w => {
    const p = DB.findById(DB_KEYS.pelanggan, w.pelanggan_id);
    const k = DB.findById(DB_KEYS.kendaraan, w.kendaraan_id);
    return `<option value="${w.id}" data-pelanggan="${w.pelanggan_id}" data-total="${calcWOTotal(w)}" ${wo?.id === w.id ? 'selected' : ''}>${w.id} — ${p?.nama || ''} (${k?.plat || ''})</option>`;
  }).join('');

  const body = `
    <form id="form-invoice" onsubmit="saveInvoice(event, '${id || ''}')">
      <div class="form-row">
        <div class="form-group">
          <label>Work Order *</label>
          <select name="workorder_id" required onchange="onWOSelectChange(this)" ${id ? 'disabled' : ''}>
            <option value="">-- Pilih Work Order --</option>
            ${woOpts}
          </select>
        </div>
        <div class="form-group">
          <label>Tanggal Invoice</label>
          <input name="tanggal" type="date" value="${inv?.tanggal || todayStr()}">
        </div>
      </div>

      <div id="inv-summary" class="info-box mb-12" style="display:none"></div>

      <div class="form-row">
        <div class="form-group">
          <label>Subtotal (Rp)</label>
          <input name="subtotal" id="inv-subtotal" type="number" min="0" value="${inv?.subtotal || 0}" readonly>
        </div>
        <div class="form-group">
          <label>Diskon (Rp)</label>
          <input name="diskon" id="inv-diskon" type="number" min="0" value="${inv?.diskon || 0}" oninput="recalcInvoice()">
        </div>
      </div>

      <div class="card" style="padding:14px;margin-bottom:16px">
        <div class="flex justify-between mb-8"><span class="text-muted">Subtotal</span><span id="disp-subtotal">${formatCurrency(inv?.subtotal || 0)}</span></div>
        <div class="flex justify-between mb-8 text-success"><span>Diskon</span><span id="disp-diskon">-${formatCurrency(inv?.diskon || 0)}</span></div>
        <hr class="divider" style="margin:8px 0">
        <div class="flex justify-between"><span class="font-bold" style="font-size:1rem">TOTAL</span><span class="font-bold" style="color:var(--primary);font-size:1.1rem" id="disp-total">${formatCurrency(inv?.total || 0)}</span></div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>Metode Pembayaran</label>
          <select name="metode">
            <option value="Tunai" ${inv?.metode === 'Tunai' ? 'selected' : ''}>💵 Tunai</option>
            <option value="Transfer Bank" ${inv?.metode === 'Transfer Bank' ? 'selected' : ''}>🏦 Transfer Bank</option>
            <option value="QRIS" ${inv?.metode === 'QRIS' ? 'selected' : ''}>📱 QRIS</option>
            <option value="Debit/Kredit" ${inv?.metode === 'Debit/Kredit' ? 'selected' : ''}>💳 Debit/Kredit</option>
          </select>
        </div>
        <div class="form-group">
          <label>Status Pembayaran</label>
          <select name="status">
            <option value="Lunas" ${inv?.status !== 'Belum Lunas' ? 'selected' : ''}>✅ Lunas</option>
            <option value="Belum Lunas" ${inv?.status === 'Belum Lunas' ? 'selected' : ''}>💳 Belum Lunas</option>
          </select>
        </div>
      </div>
      <div class="form-group">
        <label>Catatan Invoice</label>
        <textarea name="catatan" placeholder="Terima kasih atas kepercayaan Anda...">${inv?.catatan || ''}</textarea>
      </div>
      <div class="modal-footer" style="padding:0;border:none;margin-top:8px">
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Batal</button>
        <button type="submit" class="btn btn-primary">💾 Simpan Invoice</button>
      </div>
    </form>`;
  openModal(id ? `Edit Invoice: ${id}` : 'Buat Invoice Baru', body, 'modal-lg');

  // Auto-select if woId provided
  if (woId) {
    setTimeout(() => {
      const sel = document.querySelector('[name="workorder_id"]');
      if (sel) { sel.value = woId; onWOSelectChange(sel); }
    }, 100);
  }
}

function onWOSelectChange(sel) {
  const opt = sel.options[sel.selectedIndex];
  const total = parseInt(opt.dataset.total || 0);
  const pelangganId = opt.dataset.pelanggan;

  const subtotalEl = document.getElementById('inv-subtotal');
  if (subtotalEl) subtotalEl.value = total;

  const summaryEl = document.getElementById('inv-summary');
  if (summaryEl && total > 0) {
    const p = DB.findById(DB_KEYS.pelanggan, pelangganId);
    summaryEl.style.display = 'flex';
    summaryEl.innerHTML = `<span>💰</span><span>Nilai WO: <b>${formatCurrency(total)}</b>${p ? ` — Pelanggan: <b>${p.nama}</b>` : ''}</span>`;
  }
  recalcInvoice();
}

function recalcInvoice() {
  const subtotal = parseInt(document.getElementById('inv-subtotal')?.value || 0);
  const diskon = parseInt(document.getElementById('inv-diskon')?.value || 0);
  const total = Math.max(0, subtotal - diskon);

  const s = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  s('disp-subtotal', formatCurrency(subtotal));
  s('disp-diskon', '-' + formatCurrency(diskon));
  s('disp-total', formatCurrency(total));
}

function saveInvoice(e, id) {
  e.preventDefault();
  const f = new FormData(e.target);
  const data = Object.fromEntries(f.entries());
  const subtotal = parseInt(data.subtotal) || 0;
  const pajak = 0;
  const diskon = parseInt(data.diskon) || 0;
  const total = Math.max(0, subtotal - diskon);

  // Get pelanggan from WO
  const wo = DB.findById(DB_KEYS.workorder, data.workorder_id);

  const invData = {
    workorder_id: data.workorder_id,
    pelanggan_id: wo?.pelanggan_id || '',
    tanggal: data.tanggal,
    subtotal, pajak, diskon, total,
    metode: data.metode,
    status: data.status,
    catatan: data.catatan,
  };

  if (id) {
    DB.update(DB_KEYS.invoice, id, invData);
    showToast('Invoice berhasil diperbarui!', 'success');
  } else {
    invData.id = generateInvId();
    DB.insert(DB_KEYS.invoice, invData);
    // Link invoice to WO
    if (wo) DB.update(DB_KEYS.workorder, wo.id, { invoice_id: invData.id });
    showToast(`Invoice ${invData.id} berhasil dibuat!`, 'success');
  }
  closeModal();
  navigateTo('invoice');
}

function previewInvoice(id) {
  const inv = DB.findById(DB_KEYS.invoice, id);
  if (!inv) return;
  const p = DB.findById(DB_KEYS.pelanggan, inv.pelanggan_id);
  const wo = DB.findById(DB_KEYS.workorder, inv.workorder_id);
  const k = wo ? DB.findById(DB_KEYS.kendaraan, wo.kendaraan_id) : null;
  const settings = DB.get(DB_KEYS.settings) || DEFAULT_SETTINGS;

  const jasaRows = (wo?.jasa || []).map(j =>
    `<tr><td>${j.nama}</td><td>1</td><td class="text-right">${formatCurrency(j.harga)}</td><td class="text-right">${formatCurrency(j.harga)}</td></tr>`
  ).join('');
  const partRows = (wo?.sparepart || []).map(sp =>
    `<tr><td>${sp.nama}</td><td>${sp.qty}</td><td class="text-right">${formatCurrency(sp.harga)}</td><td class="text-right">${formatCurrency(sp.harga * sp.qty)}</td></tr>`
  ).join('');

  const body = `
    <div style="background:white;color:#1a1a1a;padding:28px;border-radius:12px;font-size:0.88rem">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px">
        <div>
          <div style="font-size:1.4rem;font-weight:800;color:#f97316">🔧 ${settings.namabengkel}</div>
          <div style="color:#64748b;margin-top:4px">${settings.alamat}</div>
          <div style="color:#64748b">${settings.telepon}</div>
        </div>
        <div style="text-align:right">
          <div style="font-size:0.7rem;color:#94a3b8;text-transform:uppercase;letter-spacing:0.05em">Invoice</div>
          <div style="font-size:1.4rem;font-weight:800;color:#1a1a1a">${inv.id}</div>
          <div style="color:#64748b">${formatDate(inv.tanggal)}</div>
          <div style="margin-top:8px">${statusBadge(inv.status)}</div>
        </div>
      </div>
      ${p ? `<div style="background:#f8fafc;padding:14px;border-radius:8px;margin-bottom:20px">
        <div style="font-size:0.7rem;color:#94a3b8;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px">Tagihan Kepada</div>
        <div style="font-weight:700">${p.nama}</div>
        <div style="color:#64748b">${p.telp}</div>
        ${k ? `<div style="color:#64748b">${vehicleIcon(k.tipe)} ${k.plat} — ${k.merk} ${k.model} ${k.tahun}</div>` : ''}
      </div>` : ''}
      <table style="width:100%;border-collapse:collapse;margin-bottom:16px">
        <thead><tr style="background:#f1f5f9">
          <th style="padding:8px 10px;text-align:left;border:1px solid #e2e8f0">Deskripsi</th>
          <th style="padding:8px 10px;text-align:left;border:1px solid #e2e8f0">Qty</th>
          <th style="padding:8px 10px;text-align:right;border:1px solid #e2e8f0">Harga</th>
          <th style="padding:8px 10px;text-align:right;border:1px solid #e2e8f0">Subtotal</th>
        </tr></thead>
        <tbody>${jasaRows}${partRows}</tbody>
        <tfoot>
          <tr><td colspan="3" style="padding:8px 10px;text-align:right;border:1px solid #e2e8f0">Subtotal</td><td style="padding:8px 10px;text-align:right;border:1px solid #e2e8f0">${formatCurrency(inv.subtotal)}</td></tr>
          ${inv.diskon > 0 ? `<tr><td colspan="3" style="padding:8px 10px;text-align:right;border:1px solid #e2e8f0;color:#22c55e">Diskon</td><td style="padding:8px 10px;text-align:right;border:1px solid #e2e8f0;color:#22c55e">-${formatCurrency(inv.diskon)}</td></tr>` : ''}
          <tr style="background:#f97316;color:white;font-weight:800"><td colspan="3" style="padding:10px;text-align:right;border:1px solid #ea580c">TOTAL</td><td style="padding:10px;text-align:right;border:1px solid #ea580c">${formatCurrency(inv.total)}</td></tr>
        </tfoot>
      </table>
      <div style="color:#64748b;font-size:0.78rem">Metode Pembayaran: <strong>${inv.metode}</strong></div>
      ${inv.catatan ? `<div style="margin-top:12px;padding:10px;background:#f8fafc;border-radius:8px;color:#475569">${inv.catatan}</div>` : ''}
      <div style="margin-top:16px;border-top:1px solid #e2e8f0;padding-top:12px;text-align:center;color:#94a3b8;font-size:0.78rem">
        ${settings.tagline} — ${settings.telepon}
      </div>
    </div>
    <div class="modal-footer" style="padding:0;border:none;margin-top:12px">
      <button class="btn btn-secondary" onclick="closeModal()">Tutup</button>
      <button class="btn btn-primary" onclick="closeModal(); cetakInvoice('${id}')">🖨️ Print</button>
    </div>`;
  openModal('Preview Invoice', body, 'modal-xl');
}

function cetakInvoice(id) {
  const inv = DB.findById(DB_KEYS.invoice, id);
  if (!inv) return;
  const p = DB.findById(DB_KEYS.pelanggan, inv.pelanggan_id);
  const wo = DB.findById(DB_KEYS.workorder, inv.workorder_id);
  const k = wo ? DB.findById(DB_KEYS.kendaraan, wo.kendaraan_id) : null;
  const settings = DB.get(DB_KEYS.settings) || DEFAULT_SETTINGS;

  const jasaRows = (wo?.jasa || []).map(j =>
    `<tr><td>${j.nama}</td><td>1</td><td class="text-right">${formatCurrency(j.harga)}</td><td class="text-right">${formatCurrency(j.harga)}</td></tr>`).join('');
  const partRows = (wo?.sparepart || []).map(sp =>
    `<tr><td>${sp.nama}</td><td>${sp.qty}</td><td class="text-right">${formatCurrency(sp.harga)}</td><td class="text-right">${formatCurrency(sp.harga * sp.qty)}</td></tr>`).join('');

  const html = `
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px">
      <div>
        <div style="font-size:1.4rem;font-weight:800;color:#f97316">🔧 ${settings.namabengkel}</div>
        <div style="color:#64748b">${settings.alamat}</div>
        <div style="color:#64748b">${settings.telepon}</div>
      </div>
      <div style="text-align:right">
        <div style="font-size:1.3rem;font-weight:800">${inv.id}</div>
        <div style="color:#64748b">${formatDate(inv.tanggal)}</div>
        <div style="padding:3px 10px;border-radius:20px;background:${inv.status === 'Lunas' ? '#dcfce7' : '#fef9c3'};color:${inv.status === 'Lunas' ? '#16a34a' : '#a16207'};font-weight:700;display:inline-block;font-size:0.8rem;margin-top:6px">${inv.status}</div>
      </div>
    </div>
    ${p ? `<div style="background:#f8fafc;padding:14px;border-radius:8px;margin-bottom:20px">
      <strong>Tagihan Kepada:</strong> ${p.nama} — ${p.telp}
      ${k ? `<br>${vehicleIcon(k.tipe)} ${k.plat} — ${k.merk} ${k.model} ${k.tahun}` : ''}
    </div>` : ''}
    <table>
      <thead><tr><th>Deskripsi</th><th>Qty</th><th class="text-right">Harga</th><th class="text-right">Subtotal</th></tr></thead>
      <tbody>${jasaRows}${partRows}</tbody>
      <tfoot>
        <tr><td colspan="3" class="text-right">Subtotal</td><td class="text-right">${formatCurrency(inv.subtotal)}</td></tr>
        ${inv.diskon > 0 ? `<tr><td colspan="3" class="text-right" style="color:#22c55e">Diskon</td><td class="text-right" style="color:#22c55e">-${formatCurrency(inv.diskon)}</td></tr>` : ''}
        <tr class="total-row"><td colspan="3" class="text-right">TOTAL</td><td class="text-right">${formatCurrency(inv.total)}</td></tr>
      </tfoot>
    </table>
    <p style="margin-top:12px;color:#64748b">Metode: <strong>${inv.metode}</strong></p>
    ${inv.catatan ? `<p style="color:#64748b">${inv.catatan}</p>` : ''}
    <div style="margin-top:16px;border-top:1px solid #e2e8f0;padding-top:12px;text-align:center;color:#94a3b8;font-size:0.78rem">
      ${settings.tagline} — ${settings.telepon}
    </div>`;

  printInvoice(html);
}

function lunasiInvoice(id) {
  DB.update(DB_KEYS.invoice, id, { status: 'Lunas' });
  showToast('Invoice telah dilunasi!', 'success');
  renderInvoiceTable();
}
