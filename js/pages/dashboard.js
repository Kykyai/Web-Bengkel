// ============================================
//  BengkelPro - Dashboard Page
// ============================================

function renderDashboard(container) {
    const invoices = DB.getAll(DB_KEYS.invoice);
    const workorders = DB.getAll(DB_KEYS.workorder);
    const pelanggan = DB.getAll(DB_KEYS.pelanggan);
    const kendaraan = DB.getAll(DB_KEYS.kendaraan);
    const sparepart = DB.getAll(DB_KEYS.sparepart);

    const today = todayStr();
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();

    // Stats
    const pendapatanBulanIni = invoices
        .filter(i => { const d = new Date(i.tanggal); return d.getMonth() === thisMonth && d.getFullYear() === thisYear && i.status === 'Lunas'; })
        .reduce((s, i) => s + i.total, 0);

    const pendapatanHariIni = invoices
        .filter(i => i.tanggal === today && i.status === 'Lunas')
        .reduce((s, i) => s + i.total, 0);

    const woAktif = workorders.filter(w => w.status === 'Antri' || w.status === 'Dikerjakan').length;
    const woSelesai = workorders.filter(w => w.status === 'Selesai').length;
    const spLow = sparepart.filter(s => s.stok <= s.stok_min).length;
    const antri = workorders.filter(w => w.status === 'Antri');
    const dikerjakan = workorders.filter(w => w.status === 'Dikerjakan');

    // Recent WOs
    const recentWO = [...workorders].sort((a, b) => new Date(b.tanggal_masuk) - new Date(a.tanggal_masuk)).slice(0, 5);

    container.innerHTML = `
    <!-- Stats -->
    <div class="stats-grid">
      <div class="stat-card orange">
        <div class="stat-icon">💰</div>
        <div class="stat-info">
          <div class="stat-value" style="font-size:1.1rem">${formatCurrency(pendapatanBulanIni)}</div>
          <div class="stat-label">Pendapatan Bulan Ini</div>
          <div class="stat-change up">↑ Hari ini: ${formatCurrency(pendapatanHariIni)}</div>
        </div>
      </div>
      <div class="stat-card blue">
        <div class="stat-icon">🔧</div>
        <div class="stat-info">
          <div class="stat-value">${woAktif}</div>
          <div class="stat-label">Work Order Aktif</div>
          <div class="stat-change">${antri.length} Antri · ${dikerjakan.length} Dikerjakan</div>
        </div>
      </div>
      <div class="stat-card green">
        <div class="stat-icon">👥</div>
        <div class="stat-info">
          <div class="stat-value">${pelanggan.length}</div>
          <div class="stat-label">Total Pelanggan</div>
          <div class="stat-change">${kendaraan.length} Kendaraan Terdaftar</div>
        </div>
      </div>
      <div class="stat-card ${spLow > 0 ? 'red' : 'cyan'}">
        <div class="stat-icon">📦</div>
        <div class="stat-info">
          <div class="stat-value">${spLow}</div>
          <div class="stat-label">Stok Menipis</div>
          <div class="stat-change ${spLow > 0 ? 'down' : ''}">${spLow > 0 ? '⚠️ Perlu restock segera' : '✓ Stok aman'}</div>
        </div>
      </div>
      <div class="stat-card purple">
        <div class="stat-icon">✅</div>
        <div class="stat-info">
          <div class="stat-value">${woSelesai}</div>
          <div class="stat-label">Work Order Selesai</div>
          <div class="stat-change up">Total semua waktu</div>
        </div>
      </div>
    </div>

    <!-- Charts Row -->
    <div class="grid-21 mb-24">
      <!-- Revenue Chart -->
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">📈 Grafik Pendapatan</div>
            <div class="card-subtitle">Tahun ${thisYear}</div>
          </div>
          <div class="tabs" style="margin-bottom:0">
            <button class="tab-btn active" id="tab-monthly" onclick="switchRevenueTab('monthly')">Bulanan</button>
            <button class="tab-btn" id="tab-service" onclick="switchRevenueTab('service')">Per Jenis Servis</button>
          </div>
        </div>
        <div class="chart-container" style="height:260px">
          <canvas id="chart-revenue"></canvas>
        </div>
      </div>

      <!-- WO Status Pie -->
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">🍕 Status Work Order</div>
            <div class="card-subtitle">Distribusi saat ini</div>
          </div>
        </div>
        <div class="chart-container" style="height:200px">
          <canvas id="chart-wo-status"></canvas>
        </div>
        <div id="wo-status-legend" style="margin-top:12px"></div>
      </div>
    </div>

    <!-- Bottom Row -->
    <div class="grid-21">
      <!-- Recent Work Orders -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">🔧 Work Order Terbaru</div>
          <button class="btn btn-sm btn-secondary" onclick="navigateTo('workorder')">Lihat Semua →</button>
        </div>
        <div class="table-container">
          <table>
            <thead><tr>
              <th>No. WO</th><th>Kendaraan</th><th>Pelanggan</th><th>Status</th><th>Tanggal</th>
            </tr></thead>
            <tbody id="dashboard-wo-list"></tbody>
          </table>
        </div>
      </div>

      <!-- Right Column -->
      <div class="flex-col gap-16">
        <!-- Low Stock Alert -->
        <div class="card">
          <div class="card-header">
            <div class="card-title">⚠️ Stok Menipis</div>
            <button class="btn btn-sm btn-secondary" onclick="navigateTo('sparepart')">Kelola →</button>
          </div>
          <div id="dashboard-low-stock">
            <div class="spinner"></div>
          </div>
        </div>

        <!-- Antri Hari Ini -->
        <div class="card">
          <div class="card-header">
            <div class="card-title">⏳ Antrian Saat Ini</div>
            <span class="badge badge-warning">${antri.length}</span>
          </div>
          <div id="dashboard-antri"></div>
        </div>
      </div>
    </div>
  `;

    // Render WO List
    const woListEl = document.getElementById('dashboard-wo-list');
    if (recentWO.length === 0) {
        woListEl.innerHTML = `<tr><td colspan="5" class="text-center text-muted" style="padding:20px">Belum ada work order</td></tr>`;
    } else {
        woListEl.innerHTML = recentWO.map(wo => {
            const k = DB.findById(DB_KEYS.kendaraan, wo.kendaraan_id);
            const p = DB.findById(DB_KEYS.pelanggan, wo.pelanggan_id);
            return `<tr>
        <td><span class="font-semibold">${wo.id}</span></td>
        <td>${k ? `${vehicleIcon(k.tipe)} ${k.plat}` : '-'}</td>
        <td>${p ? p.nama : '-'}</td>
        <td>${statusBadge(wo.status)}</td>
        <td class="text-muted">${formatDate(wo.tanggal_masuk)}</td>
      </tr>`;
        }).join('');
    }

    // Render Low Stock
    const lowStock = getSparepartAlerts();
    const lowStockEl = document.getElementById('dashboard-low-stock');
    if (lowStock.length === 0) {
        lowStockEl.innerHTML = `<div class="info-box success">✅ Semua stok dalam kondisi aman</div>`;
    } else {
        lowStockEl.innerHTML = lowStock.map(s => `
      <div class="list-item">
        <div class="stat-icon" style="width:32px;height:32px;font-size:0.9rem;--stat-color:#ef4444">📦</div>
        <div style="flex:1;min-width:0">
          <div class="font-semibold truncate" style="font-size:0.85rem">${s.nama}</div>
          <div class="text-muted" style="font-size:0.75rem">Stok: <span class="text-danger font-bold">${s.stok}</span> / Min: ${s.stok_min} ${s.satuan}</div>
        </div>
        <div class="progress-bar" style="width:60px">
          <div class="progress-fill" style="width:${Math.min(100, (s.stok / s.stok_min) * 100)}%;background:var(--danger)"></div>
        </div>
      </div>`).join('');
    }

    // Render Antri
    const antriEl = document.getElementById('dashboard-antri');
    if (antri.length === 0) {
        antriEl.innerHTML = `<p class="text-muted" style="font-size:0.85rem;text-align:center;padding:12px">Tidak ada antrian</p>`;
    } else {
        antriEl.innerHTML = antri.map(wo => {
            const k = DB.findById(DB_KEYS.kendaraan, wo.kendaraan_id);
            const p = DB.findById(DB_KEYS.pelanggan, wo.pelanggan_id);
            return `<div class="list-item">
        <div class="avatar avatar-sm">${p ? avatarInitial(p.nama) : '?'}</div>
        <div style="flex:1;min-width:0">
          <div class="font-semibold truncate" style="font-size:0.85rem">${p ? p.nama : '-'}</div>
          <div class="text-muted" style="font-size:0.75rem">${k ? `${vehicleIcon(k.tipe)} ${k.plat} · ${k.merk} ${k.model}` : '-'}</div>
        </div>
        <button class="btn btn-sm btn-primary" onclick="navigateTo('workorder')">→</button>
      </div>`;
        }).join('');
    }

    // Charts
    renderRevenueChart('monthly');
    renderWOStatusChart(workorders);
}

function renderRevenueChart(type) {
    const canvas = document.getElementById('chart-revenue');
    if (!canvas) return;
    if (currentCharts['revenue']) { currentCharts['revenue'].destroy(); }

    const ctx = canvas.getContext('2d');
    if (type === 'monthly') {
        const data = getMonthlyRevenue();
        currentCharts['revenue'] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: MONTHS_ID,
                datasets: [{
                    label: 'Pendapatan (Rp)',
                    data,
                    backgroundColor: MONTHS_ID.map((_, i) => i === new Date().getMonth() ? '#f97316' : 'rgba(249,115,22,0.3)'),
                    borderColor: '#f97316',
                    borderWidth: 2,
                    borderRadius: 6,
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { ticks: { callback: v => 'Rp' + (v / 1e6).toFixed(1) + 'Jt' }, grid: { color: '#334155' } },
                    x: { grid: { display: false } }
                }
            }
        });
    } else {
        // Service type chart
        const workorders = DB.getAll(DB_KEYS.workorder).filter(w => w.status === 'Selesai');
        const counts = {};
        workorders.forEach(wo => {
            (wo.jasa || []).forEach(j => {
                const name = j.nama.length > 20 ? j.nama.substring(0, 20) + '...' : j.nama;
                counts[name] = (counts[name] || 0) + 1;
            });
        });
        const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 7);
        currentCharts['revenue'] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: sorted.map(x => x[0]),
                datasets: [{
                    label: 'Jumlah Servis',
                    data: sorted.map(x => x[1]),
                    backgroundColor: CHART_COLORS.slice(0, sorted.length).map(c => c + '99'),
                    borderColor: CHART_COLORS.slice(0, sorted.length),
                    borderWidth: 2, borderRadius: 6,
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { ticks: { precision: 0 }, grid: { color: '#334155' } },
                    y: { grid: { display: false } }
                }
            }
        });
    }
}

function switchRevenueTab(type) {
    document.getElementById('tab-monthly').classList.toggle('active', type === 'monthly');
    document.getElementById('tab-service').classList.toggle('active', type === 'service');
    renderRevenueChart(type);
}

function renderWOStatusChart(workorders) {
    const canvas = document.getElementById('chart-wo-status');
    if (!canvas) return;
    if (currentCharts['wo-status']) currentCharts['wo-status'].destroy();

    const statusCount = { 'Antri': 0, 'Dikerjakan': 0, 'Selesai': 0, 'Batal': 0 };
    workorders.forEach(w => { if (statusCount[w.status] !== undefined) statusCount[w.status]++; });

    const labels = Object.keys(statusCount);
    const data = Object.values(statusCount);
    const colors = ['#eab308', '#06b6d4', '#22c55e', '#94a3b8'];

    currentCharts['wo-status'] = new Chart(canvas.getContext('2d'), {
        type: 'doughnut',
        data: { labels, datasets: [{ data, backgroundColor: colors, borderColor: '#1e293b', borderWidth: 3 }] },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: { callbacks: { label: (c) => ` ${c.label}: ${c.raw}` } }
            },
            cutout: '68%'
        }
    });

    const legendEl = document.getElementById('wo-status-legend');
    if (legendEl) {
        legendEl.innerHTML = labels.map((l, i) => `
      <div class="flex items-center gap-8" style="margin-bottom:5px;">
        <div style="width:10px;height:10px;border-radius:50%;background:${colors[i]};flex-shrink:0"></div>
        <span style="font-size:0.8rem;color:var(--text-secondary)">${l}</span>
        <span style="margin-left:auto;font-size:0.8rem;font-weight:700;color:var(--text-primary)">${data[i]}</span>
      </div>`).join('');
    }
}
