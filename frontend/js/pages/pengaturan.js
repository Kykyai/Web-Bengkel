// ============================================
//  BengkelPro - Pengaturan Page
// ============================================

function renderPengaturan(container) {
  const s = DB.get(DB_KEYS.settings) || DEFAULT_SETTINGS;

  container.innerHTML = `
    <div class="page-header">
      <div class="page-header-left">
        <h1>⚙️ Pengaturan Bengkel</h1>
        <p>Konfigurasi profil dan preferensi aplikasi</p>
      </div>
    </div>

    <div class="grid-12">
      <!-- Left: Forms -->
      <div class="flex-col gap-16">
        <!-- Profil Bengkel -->
        <div class="card">
          <div class="card-header">
            <div class="card-title">🏪 Profil Bengkel</div>
          </div>
          <form id="form-settings" onsubmit="saveSettings(event)">
            <div class="form-group">
              <label>Nama Bengkel *</label>
              <input name="namabengkel" required value="${s.namabengkel}" placeholder="Nama bengkel Anda">
            </div>
            <div class="form-group">
              <label>Tagline / Slogan</label>
              <input name="tagline" value="${s.tagline}" placeholder="Servis terpercaya...">
            </div>
            <div class="form-group">
              <label>Alamat Lengkap</label>
              <textarea name="alamat">${s.alamat}</textarea>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>No. Telepon</label>
                <input name="telepon" value="${s.telepon}" placeholder="021-xxx-xxxx">
              </div>
              <div class="form-group">
                <label>Email</label>
                <input name="email" type="email" value="${s.email}" placeholder="info@bengkel.com">
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Jam Buka</label>
                <input name="jam_buka" type="time" value="${s.jam_buka}">
              </div>
              <div class="form-group">
                <label>Jam Tutup</label>
                <input name="jam_tutup" type="time" value="${s.jam_tutup}">
              </div>
            </div>

            <div class="form-group">
              <label>Hari Libur</label>
              <div class="flex gap-8" style="flex-wrap:wrap;margin-top:4px">
                ${['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'].map(h => `
                  <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-weight:400">
                    <input type="checkbox" name="hari_libur" value="${h}" ${(s.hari_libur || []).includes(h) ? 'checked' : ''} style="width:auto">
                    ${h}
                  </label>`).join('')}
              </div>
            </div>
            <button type="submit" class="btn btn-primary w-full" style="margin-top:8px">💾 Simpan Pengaturan</button>
          </form>
        </div>

        <!-- Reset Data -->
        <div class="card" style="border-color:rgba(239,68,68,0.3)">
          <div class="card-header">
            <div class="card-title" style="color:var(--danger)">⚠️ Zona Bahaya</div>
          </div>
          <div class="info-box danger mb-12">
            <span>🔴</span><span>Tindakan berikut bersifat permanen dan tidak dapat dibatalkan!</span>
          </div>
          <div class="flex gap-8 flex-wrap">
            <button class="btn btn-secondary" onclick="resetDataSample()">🔄 Muat Ulang Data Contoh</button>
            <button class="btn btn-danger" onclick="hapusSemuaData()">🗑️ Hapus Semua Data</button>
          </div>
        </div>
      </div>

      <!-- Right: Preview & Info -->
      <div class="flex-col gap-16">
        <!-- Preview Card -->
        <div class="card">
          <div class="card-header">
            <div class="card-title">👁️ Preview Profil</div>
          </div>
          <div id="settings-preview">
            ${renderSettingsPreview(s)}
          </div>
        </div>

        <!-- App Info -->
        <div class="card">
          <div class="card-header">
            <div class="card-title">ℹ️ Informasi Aplikasi</div>
          </div>
          <div class="list-item">
            <span class="text-muted" style="font-size:0.82rem;width:100px">Versi</span>
            <span class="font-semibold">BengkelPro v1.0.0</span>
          </div>
          <div class="list-item">
            <span class="text-muted" style="font-size:0.82rem;width:100px">Penyimpanan</span>
            <span class="font-semibold">localStorage</span>
          </div>
          <div class="list-item">
            <span class="text-muted" style="font-size:0.82rem;width:100px">Pelanggan</span>
            <span class="font-semibold">${DB.getAll(DB_KEYS.pelanggan).length} data</span>
          </div>
          <div class="list-item">
            <span class="text-muted" style="font-size:0.82rem;width:100px">Kendaraan</span>
            <span class="font-semibold">${DB.getAll(DB_KEYS.kendaraan).length} data</span>
          </div>
          <div class="list-item">
            <span class="text-muted" style="font-size:0.82rem;width:100px">Work Order</span>
            <span class="font-semibold">${DB.getAll(DB_KEYS.workorder).length} data</span>
          </div>
          <div class="list-item">
            <span class="text-muted" style="font-size:0.82rem;width:100px">Sparepart</span>
            <span class="font-semibold">${DB.getAll(DB_KEYS.sparepart).length} item</span>
          </div>
          <div class="list-item">
            <span class="text-muted" style="font-size:0.82rem;width:100px">Invoice</span>
            <span class="font-semibold">${DB.getAll(DB_KEYS.invoice).length} data</span>
          </div>
        </div>

        <!-- Quick Guide -->
        <div class="card">
          <div class="card-header">
            <div class="card-title">📖 Panduan Singkat</div>
          </div>
          <div class="flex-col gap-8" style="font-size:0.83rem;color:var(--text-secondary)">
            <div>1. 🏠 <b>Dashboard</b> — Lihat ringkasan bisnis hari ini</div>
            <div>2. 🔧 <b>Work Order</b> — Buat & kelola pekerjaan servis</div>
            <div>3. 👥 <b>Pelanggan</b> — Manajemen data pelanggan</div>
            <div>4. 📦 <b>Sparepart</b> — Cek & update stok suku cadang</div>
            <div>5. 🧾 <b>Invoice</b> — Generate & print tagihan</div>
            <div>6. 📈 <b>Laporan</b> — Analisis performa bengkel</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderSettingsPreview(s) {
  const days = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
  const fullDays = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
  return `
    <div style="background:linear-gradient(135deg,rgba(249,115,22,0.1),rgba(59,130,246,0.1));border-radius:var(--radius);padding:16px;border:1px solid var(--border)">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
        <div style="width:40px;height:40px;background:linear-gradient(135deg,var(--primary),var(--primary-dark));border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:1.2rem">🔧</div>
        <div>
          <div class="font-bold" style="font-size:1rem">${s.namabengkel}</div>
          <div class="text-muted" style="font-size:0.75rem">${s.tagline}</div>
        </div>
      </div>
      <div class="flex-col gap-6" style="font-size:0.8rem;color:var(--text-secondary)">
        <div>📍 ${s.alamat}</div>
        <div>📞 ${s.telepon}</div>
        <div>✉️ ${s.email}</div>
        <div>⏰ ${s.jam_buka} – ${s.jam_tutup}</div>

        <div>🗓️ Libur: ${(s.hari_libur || []).join(', ') || '-'}</div>
      </div>
    </div>`;
}

function saveSettings(e) {
  e.preventDefault();
  const f = new FormData(e.target);
  const data = Object.fromEntries(f.entries());

  data.hari_libur = f.getAll('hari_libur');

  DB.set(DB_KEYS.settings, data);
  showToast('Pengaturan berhasil disimpan!', 'success');

  // Update preview & header
  const previewEl = document.getElementById('settings-preview');
  if (previewEl) previewEl.innerHTML = renderSettingsPreview(data);
  updateShopInfo();
}

function resetDataSample() {
  confirmAction('Reset semua data ke data contoh? Data yang sudah diinput akan hilang.', () => {
    Object.values(DB_KEYS).forEach(k => localStorage.removeItem(k));
    DB.init();
    showToast('Data berhasil direset ke data contoh!', 'success');
    navigateTo('dashboard');
  });
}

function hapusSemuaData() {
  confirmAction('Hapus SEMUA data termasuk data bengkel? Tindakan ini tidak bisa dibatalkan!', () => {
    Object.values(DB_KEYS).forEach(k => localStorage.removeItem(k));
    DB.set(DB_KEYS.settings, DEFAULT_SETTINGS);
    showToast('Semua data telah dihapus!', 'warning');
    navigateTo('dashboard');
    updateShopInfo();
  });
}
