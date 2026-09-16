// ============================================
//  BengkelPro - Laporan & Analitik Page
// ============================================

function renderLaporan(container) {
    const thisYear = new Date().getFullYear();
    const thisMonth = new Date().getMonth();

    container.innerHTML = `
    <div class="page-header">
      <div class="page-header-left">
        <h1>📈 Laporan & Analitik</h1>
        <p>Analisis performa dan keuangan bengkel</p>
      </div>
      <div class="flex gap-8">
        <select class="filter-select" id="lap-year" onchange="refreshLaporan()">
          ${[thisYear, thisYear - 1, thisYear - 2].map(y => `<option value="${y}" ${y === thisYear ? 'selected' : ''}>${y}</option>`).join('')}
        </select>
        <button class="btn btn-secondary" onclick="exportLaporan()">⬇️ Export</button>
      </div>
    </div>

    <!-- Summary Cards -->
    <div id="lap-summary" class="stats-grid mb-24"></div>

    <!-- Charts Row 1 -->
    <div class="grid-2 mb-24">
      <div class="card">
        <div class="card-header">
          <div class="card-title">💰 Pendapatan Bulanan</div>
        </div>
        <div class="chart-container" style="height:240px">
          <canvas id="chart-lap-revenue"></canvas>
        </div>
      </div>
      <div class="card">
        <div class="card-header">
          <div class="card-title">🔧 Work Order per Bulan</div>
        </div>
        <div class="chart-container" style="height:240px">
          <canvas id="chart-lap-wo"></canvas>
        </div>
      </div>
    </div>

    <!-- Charts Row 2 -->
    <div class="grid-2 mb-24">
      <div class="card">
        <div class="card-header">
          <div class="card-title">📦 Sparepart Terlaris</div>
        </div>
        <div class="chart-container" style="height:240px">
          <canvas id="chart-lap-sp"></canvas>
        </div>
      </div>
      <div class="card">
        <div class="card-header">
          <div class="card-title">👷 WO per Mekanik</div>
        </div>
        <div class="chart-container" style="height:240px">
          <canvas id="chart-lap-mek"></canvas>
        </div>
      </div>
    </div>

    <!-- Detail Table -->
    <div class="card">
      <div class="card-header">
        <div class="card-title">📋 Detail Transaksi Bulan Ini</div>
        <select class="filter-select" id="lap-month-sel" onchange="refreshLaporanTable()" style="width:auto">
          ${MONTHS_FULL.map((m, i) => `<option value="${i}" ${i === thisMonth ? 'selected' : ''}>${m}</option>`).join('')}
        </select>
      </div>
      <div class="table-container">
        <table>
          <thead><tr><th>No. Invoice</th><th>Tanggal</th><th>Pelanggan</th><th>Work Order</th><th>Metode</th><th>Total</th><th>Status</th></tr></thead>
          <tbody id="lap-table-body"></tbody>
        </table>
      </div>
      <div class="flex justify-between items-center" style="padding:12px 14px;border-top:1px solid var(--border)">
        <span class="text-muted" style="font-size:0.83rem" id="lap-table-summary"></span>
      </div>
    </div>
  `;

    refreshLaporan();
}

function refreshLaporan() {
    const year = parseInt(document.getElementById('lap-year')?.value || new Date().getFullYear());
    const invoices = DB.getAll(DB_KEYS.invoice);
    const workorders = DB.getAll(DB_KEYS.workorder);

    // Summary
    const yearInvoices = invoices.filter(i => new Date(i.tanggal).getFullYear() === year && i.status === 'Lunas');
    const totalPendapatan = yearInvoices.reduce((s, i) => s + i.total, 0);
    const totalWO = workorders.filter(w => new Date(w.tanggal_masuk).getFullYear() === year).length;
    const rataWO = totalWO > 0 ? Math.round(totalPendapatan / totalWO) : 0;
    const bulanTerbaik = (() => {
        const monthly = getMonthlyRevenue(year);
        const maxIdx = monthly.indexOf(Math.max(...monthly));
        return MONTHS_ID[maxIdx];
    })();

    const summaryEl = document.getElementById('lap-summary');
    if (summaryEl) {
        summaryEl.innerHTML = `
      <div class="stat-card green">
        <div class="stat-icon">💰</div>
        <div class="stat-info"><div class="stat-value" style="font-size:1rem">${formatCurrency(totalPendapatan)}</div><div class="stat-label">Total Pendapatan ${year}</div></div>
      </div>
      <div class="stat-card blue">
        <div class="stat-icon">🔧</div>
        <div class="stat-info"><div class="stat-value">${totalWO}</div><div class="stat-label">Total Work Order ${year}</div></div>
      </div>
      <div class="stat-card orange">
        <div class="stat-icon">📊</div>
        <div class="stat-info"><div class="stat-value" style="font-size:1rem">${formatCurrency(rataWO)}</div><div class="stat-label">Rata-rata per WO</div></div>
      </div>
      <div class="stat-card purple">
        <div class="stat-icon">🏆</div>
        <div class="stat-info"><div class="stat-value">${bulanTerbaik}</div><div class="stat-label">Bulan Terbaik ${year}</div></div>
      </div>
    `;
    }

    // Chart 1: Monthly Revenue
    if (currentCharts['lap-revenue']) currentCharts['lap-revenue'].destroy();
    const cvRev = document.getElementById('chart-lap-revenue');
    if (cvRev) {
        const monthlyData = getMonthlyRevenue(year);
        currentCharts['lap-revenue'] = new Chart(cvRev.getContext('2d'), {
            type: 'line',
            data: {
                labels: MONTHS_ID,
                datasets: [{
                    label: 'Pendapatan',
                    data: monthlyData,
                    fill: true,
                    borderColor: '#f97316',
                    backgroundColor: 'rgba(249,115,22,0.1)',
                    pointBackgroundColor: '#f97316',
                    tension: 0.4,
                    borderWidth: 2,
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
    }

    // Chart 2: WO per Month
    if (currentCharts['lap-wo']) currentCharts['lap-wo'].destroy();
    const cvWO = document.getElementById('chart-lap-wo');
    if (cvWO) {
        const woData = Array(12).fill(0);
        workorders.forEach(w => {
            const d = new Date(w.tanggal_masuk);
            if (d.getFullYear() === year) woData[d.getMonth()]++;
        });
        currentCharts['lap-wo'] = new Chart(cvWO.getContext('2d'), {
            type: 'bar',
            data: {
                labels: MONTHS_ID,
                datasets: [{
                    label: 'Work Order',
                    data: woData,
                    backgroundColor: 'rgba(59,130,246,0.7)',
                    borderColor: '#3b82f6',
                    borderWidth: 2,
                    borderRadius: 6,
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { ticks: { precision: 0 }, grid: { color: '#334155' } },
                    x: { grid: { display: false } }
                }
            }
        });
    }

    // Chart 3: Top Sparepart
    if (currentCharts['lap-sp']) currentCharts['lap-sp'].destroy();
    const cvSP = document.getElementById('chart-lap-sp');
    if (cvSP) {
        const spCount = {};
        workorders.filter(w => w.status === 'Selesai').forEach(w => {
            (w.sparepart || []).forEach(s => {
                spCount[s.nama] = (spCount[s.nama] || 0) + s.qty;
            });
        });
        const sorted = Object.entries(spCount).sort((a, b) => b[1] - a[1]).slice(0, 7);
        currentCharts['lap-sp'] = new Chart(cvSP.getContext('2d'), {
            type: 'bar',
            data: {
                labels: sorted.map(x => x[0].length > 18 ? x[0].substring(0, 18) + '...' : x[0]),
                datasets: [{
                    label: 'Qty Dipakai',
                    data: sorted.map(x => x[1]),
                    backgroundColor: CHART_COLORS.slice(0, sorted.length).map(c => c + 'bb'),
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

    // Chart 4: WO per Mekanik
    if (currentCharts['lap-mek']) currentCharts['lap-mek'].destroy();
    const cvMek = document.getElementById('chart-lap-mek');
    if (cvMek) {
        const mekanikList = DB.getAll(DB_KEYS.mekanik);
        const mekData = mekanikList.map(m => ({
            nama: m.nama.split(' ')[0],
            count: workorders.filter(w => w.mekanik_id === m.id).length
        })).filter(x => x.count > 0).sort((a, b) => b.count - a.count);

        currentCharts['lap-mek'] = new Chart(cvMek.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: mekData.map(x => x.nama),
                datasets: [{
                    data: mekData.map(x => x.count),
                    backgroundColor: CHART_COLORS.slice(0, mekData.length),
                    borderColor: '#1e293b', borderWidth: 3
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { position: 'right', labels: { font: { size: 11 }, color: '#94a3b8', padding: 10 } } },
                cutout: '55%'
            }
        });
    }

    refreshLaporanTable();
}

function refreshLaporanTable() {
    const year = parseInt(document.getElementById('lap-year')?.value || new Date().getFullYear());
    const month = parseInt(document.getElementById('lap-month-sel')?.value ?? new Date().getMonth());
    const invoices = DB.getAll(DB_KEYS.invoice).filter(i => {
        const d = new Date(i.tanggal);
        return d.getFullYear() === year && d.getMonth() === month;
    });
    const tbody = document.getElementById('lap-table-body');
    const summaryEl = document.getElementById('lap-table-summary');
    if (!tbody) return;

    const totalBulan = invoices.filter(i => i.status === 'Lunas').reduce((s, i) => s + i.total, 0);
    if (summaryEl) summaryEl.textContent = `${invoices.length} transaksi — Total: ${formatCurrency(totalBulan)}`;

    if (invoices.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted" style="padding:20px">Tidak ada transaksi pada bulan ini</td></tr>`;
        return;
    }
    tbody.innerHTML = invoices.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal)).map(inv => {
        const p = DB.findById(DB_KEYS.pelanggan, inv.pelanggan_id);
        return `<tr>
      <td class="font-semibold" style="font-size:0.82rem">${inv.id}</td>
      <td class="text-muted" style="font-size:0.82rem">${formatDate(inv.tanggal)}</td>
      <td style="font-size:0.85rem">${p?.nama || '-'}</td>
      <td><span class="badge badge-secondary" style="font-size:0.7rem">${inv.workorder_id || '-'}</span></td>
      <td><span class="badge badge-secondary" style="font-size:0.7rem">${inv.metode}</span></td>
      <td class="font-bold" style="color:var(--primary)">${formatCurrency(inv.total)}</td>
      <td>${statusBadge(inv.status)}</td>
    </tr>`;
    }).join('');
}

function exportLaporan() {
    const year = parseInt(document.getElementById('lap-year')?.value || new Date().getFullYear());
    const invoices = DB.getAll(DB_KEYS.invoice).filter(i => new Date(i.tanggal).getFullYear() === year);
    exportCSV(invoices.map(i => {
        const p = DB.findById(DB_KEYS.pelanggan, i.pelanggan_id);
        return { ...i, pelanggan: p?.nama || '-' };
    }), `laporan-${year}`, [
        { key: 'id', label: 'No Invoice' },
        { key: 'tanggal', label: 'Tanggal' },
        { key: 'pelanggan', label: 'Pelanggan' },
        { key: 'workorder_id', label: 'Work Order' },
        { key: 'subtotal', label: 'Subtotal' },
        { key: 'pajak', label: 'Pajak' },
        { key: 'diskon', label: 'Diskon' },
        { key: 'total', label: 'Total' },
        { key: 'metode', label: 'Metode Bayar' },
        { key: 'status', label: 'Status' },
    ]);
    showToast('Laporan berhasil diekspor!', 'success');
}
