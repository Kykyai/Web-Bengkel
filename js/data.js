// ============================================
//  BengkelPro - Sample Data & Storage
// ============================================

const DB_KEYS = {
    settings: 'bp_settings',
    pelanggan: 'bp_pelanggan',
    kendaraan: 'bp_kendaraan',
    workorder: 'bp_workorder',
    sparepart: 'bp_sparepart',
    mekanik: 'bp_mekanik',
    invoice: 'bp_invoice',
};

// ---------- Default Settings ----------
const DEFAULT_SETTINGS = {
    namabengkel: 'BengkelPro Motor & Mobil',
    alamat: 'Jl. Raya Otomotif No. 88, Jakarta Selatan',
    telepon: '021-5588-9900',
    email: 'info@bengkelpro.id',
    jam_buka: '08:00',
    jam_tutup: '17:00',
    hari_libur: ['Minggu'],
    tagline: 'Servis Terpercaya, Hasil Memuaskan',
};

// ---------- Sample Mekanik ----------
const SAMPLE_MEKANIK = [
    { id: 'm001', nama: 'Budi Santoso', spesialisasi: 'Mesin & Transmisi', telp: '0812-1111-2222', level: 'Senior', status: 'Aktif', foto: 'B', gaji: 4500000 },
    { id: 'm002', nama: 'Agus Prasetyo', spesialisasi: 'Kelistrikan', telp: '0813-2222-3333', level: 'Senior', status: 'Aktif', foto: 'A', gaji: 4200000 },
    { id: 'm003', nama: 'Rendi Surya', spesialisasi: 'Body & Cat', telp: '0857-3333-4444', level: 'Junior', status: 'Aktif', foto: 'R', gaji: 3200000 },
    { id: 'm004', nama: 'Wahyu Nugroho', spesialisasi: 'AC & Pendingin', telp: '0822-4444-5555', level: 'Madya', status: 'Aktif', foto: 'W', gaji: 3800000 },
    { id: 'm005', nama: 'Deden Kurniawan', spesialisasi: 'Kaki-kaki & Ban', telp: '0817-5555-6666', level: 'Madya', status: 'Libur', foto: 'D', gaji: 3600000 },
];

// ---------- Sample Pelanggan ----------
const SAMPLE_PELANGGAN = [
    { id: 'c001', nama: 'Hendra Susanto', telp: '0811-1234-5678', email: 'hendra@email.com', alamat: 'Jl. Mawar 12, Jakarta', tgl_daftar: '2024-01-15', total_servis: 8 },
    { id: 'c002', nama: 'Rina Marlina', telp: '0822-8765-4321', email: 'rina@email.com', alamat: 'Jl. Melati 5, Depok', tgl_daftar: '2024-02-20', total_servis: 5 },
    { id: 'c003', nama: 'Dani Hidayat', telp: '0833-2222-1111', email: 'dani@email.com', alamat: 'Jl. Anggrek 7, Bekasi', tgl_daftar: '2024-03-10', total_servis: 12 },
    { id: 'c004', nama: 'Siti Rahayu', telp: '0844-3333-2222', email: 'siti@email.com', alamat: 'Jl. Dahlia 9, Tangerang', tgl_daftar: '2024-04-05', total_servis: 3 },
    { id: 'c005', nama: 'Fajar Wibowo', telp: '0855-4444-3333', email: 'fajar@email.com', alamat: 'Jl. Cempaka 3, Bogor', tgl_daftar: '2024-05-12', total_servis: 7 },
    { id: 'c006', nama: 'Lestari Dewi', telp: '0866-5555-4444', email: 'lestari@email.com', alamat: 'Jl. Kenanga 11, Jakarta', tgl_daftar: '2024-06-18', total_servis: 2 },
    { id: 'c007', nama: 'Rizky Firmansyah', telp: '0877-6666-5555', email: 'rizky@email.com', alamat: 'Jl. Sakura 4, Depok', tgl_daftar: '2024-07-22', total_servis: 9 },
    { id: 'c008', nama: 'Mega Putri', telp: '0888-7777-6666', email: 'mega@email.com', alamat: 'Jl. Tulip 6, Bekasi', tgl_daftar: '2024-08-08', total_servis: 4 },
];

// ---------- Sample Kendaraan ----------
const SAMPLE_KENDARAAN = [
    { id: 'v001', pelanggan_id: 'c001', plat: 'B 1234 ABC', merk: 'Toyota', model: 'Avanza', tahun: 2019, warna: 'Putih', tipe: 'Mobil', km: 45000 },
    { id: 'v002', pelanggan_id: 'c002', plat: 'B 5678 DEF', merk: 'Honda', model: 'Beat', tahun: 2021, warna: 'Merah', tipe: 'Motor', km: 18000 },
    { id: 'v003', pelanggan_id: 'c003', plat: 'D 9012 GHI', merk: 'Suzuki', model: 'Swift', tahun: 2020, warna: 'Biru', tipe: 'Mobil', km: 62000 },
    { id: 'v004', pelanggan_id: 'c004', plat: 'B 3456 JKL', merk: 'Yamaha', model: 'NMAX', tahun: 2022, warna: 'Hitam', tipe: 'Motor', km: 9500 },
    { id: 'v005', pelanggan_id: 'c005', plat: 'F 7890 MNO', merk: 'Honda', model: 'Jazz', tahun: 2018, warna: 'Silver', tipe: 'Mobil', km: 78000 },
    { id: 'v006', pelanggan_id: 'c006', plat: 'B 2345 PQR', merk: 'Kawasaki', model: 'Ninja', tahun: 2023, warna: 'Hijau', tipe: 'Motor', km: 3200 },
    { id: 'v007', pelanggan_id: 'c007', plat: 'B 6789 STU', merk: 'Daihatsu', model: 'Ayla', tahun: 2020, warna: 'Putih', tipe: 'Mobil', km: 35000 },
    { id: 'v008', pelanggan_id: 'c003', plat: 'D 1111 VWX', merk: 'Honda', model: 'Vario', tahun: 2021, warna: 'Merah', tipe: 'Motor', km: 22000 },
    { id: 'v009', pelanggan_id: 'c001', plat: 'B 2222 YZA', merk: 'Mitsubishi', model: 'Xpander', tahun: 2022, warna: 'Hitam', tipe: 'Mobil', km: 28000 },
    { id: 'v010', pelanggan_id: 'c008', plat: 'B 3333 BCD', merk: 'Vespa', model: 'Sprint', tahun: 2022, warna: 'Cream', tipe: 'Motor', km: 7800 },
];

// ---------- Sample Sparepart ----------
const SAMPLE_SPAREPART = [
    { id: 'sp001', kode: 'OLI-10W40', nama: 'Oli Mesin 10W-40 (1L)', kategori: 'Oli & Cairan', satuan: 'Liter', stok: 48, stok_min: 10, harga_beli: 28000, harga_jual: 45000 },
    { id: 'sp002', kode: 'OLI-5W30', nama: 'Oli Mesin 5W-30 (1L)', kategori: 'Oli & Cairan', satuan: 'Liter', stok: 32, stok_min: 10, harga_beli: 35000, harga_jual: 55000 },
    { id: 'sp003', kode: 'FILTER-OLI', nama: 'Filter Oli Universal', kategori: 'Filter', satuan: 'Pcs', stok: 25, stok_min: 5, harga_beli: 18000, harga_jual: 30000 },
    { id: 'sp004', kode: 'FILTER-AC', nama: 'Filter AC Cabin', kategori: 'Filter', satuan: 'Pcs', stok: 12, stok_min: 5, harga_beli: 45000, harga_jual: 80000 },
    { id: 'sp005', kode: 'BUSI-NGK', nama: 'Busi NGK Standard', kategori: 'Pengapian', satuan: 'Pcs', stok: 60, stok_min: 10, harga_beli: 12000, harga_jual: 22000 },
    { id: 'sp006', kode: 'BUSI-IRI', nama: 'Busi Iridium Racing', kategori: 'Pengapian', satuan: 'Pcs', stok: 4, stok_min: 6, harga_beli: 55000, harga_jual: 95000 },
    { id: 'sp007', kode: 'KAMPAS-REM', nama: 'Kampas Rem Depan', kategori: 'Rem', satuan: 'Set', stok: 18, stok_min: 5, harga_beli: 85000, harga_jual: 140000 },
    { id: 'sp008', kode: 'KAMPAS-BLK', nama: 'Kampas Rem Belakang', kategori: 'Rem', satuan: 'Set', stok: 15, stok_min: 5, harga_beli: 70000, harga_jual: 115000 },
    { id: 'sp009', kode: 'BAN-185', nama: 'Ban Mobil 185/65R15', kategori: 'Ban', satuan: 'Pcs', stok: 8, stok_min: 4, harga_beli: 450000, harga_jual: 680000 },
    { id: 'sp010', kode: 'BAN-MTR', nama: 'Ban Motor 90/90-14', kategori: 'Ban', satuan: 'Pcs', stok: 3, stok_min: 6, harga_beli: 150000, harga_jual: 230000 },
    { id: 'sp011', kode: 'AKI-NS40Z', nama: 'Aki Kering NS40Z', kategori: 'Kelistrikan', satuan: 'Pcs', stok: 6, stok_min: 3, harga_beli: 280000, harga_jual: 420000 },
    { id: 'sp012', kode: 'COOLANT', nama: 'Radiator Coolant (1L)', kategori: 'Oli & Cairan', satuan: 'Liter', stok: 20, stok_min: 5, harga_beli: 22000, harga_jual: 38000 },
    { id: 'sp013', kode: 'V-BELT', nama: 'V-Belt Motor Matic', kategori: 'Penggerak', satuan: 'Pcs', stok: 2, stok_min: 5, harga_beli: 55000, harga_jual: 90000 },
    { id: 'sp014', kode: 'AIR-FILTER', nama: 'Filter Udara Motor', kategori: 'Filter', satuan: 'Pcs', stok: 30, stok_min: 8, harga_beli: 20000, harga_jual: 35000 },
    { id: 'sp015', kode: 'WIPER-24', nama: 'Wiper Blade 24"', kategori: 'Aksesoris', satuan: 'Pcs', stok: 14, stok_min: 4, harga_beli: 35000, harga_jual: 65000 },
];

// ---------- Sample Work Orders ----------
const today = new Date();
const fmt = (d) => d.toISOString().split('T')[0];
const daysAgo = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return fmt(d); };
const daysAhead = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return fmt(d); };

const SAMPLE_WORKORDER = [
    {
        id: 'WO-2026-001', pelanggan_id: 'c001', kendaraan_id: 'v001', mekanik_id: 'm001',
        tanggal_masuk: daysAgo(7), tanggal_selesai: daysAgo(6), status: 'Selesai',
        keluhan: 'Ganti oli mesin dan filter oli, ceking rem depan',
        diagnosa: 'Oli mesin sudah hitam pekat, kampas rem depan masih 60%',
        jasa: [{ nama: 'Ganti Oli Mesin', harga: 50000 }, { nama: 'Ceking Rem', harga: 25000 }],
        sparepart: [
            { sparepart_id: 'sp001', nama: 'Oli Mesin 10W-40', qty: 4, harga: 45000 },
            { sparepart_id: 'sp003', nama: 'Filter Oli', qty: 1, harga: 30000 }
        ],
        catatan: 'Perlu ganti kampas rem maksimal 10.000 km lagi', invoice_id: 'INV-2026-001'
    },
    {
        id: 'WO-2026-002', pelanggan_id: 'c002', kendaraan_id: 'v002', mekanik_id: 'm003',
        tanggal_masuk: daysAgo(4), tanggal_selesai: daysAgo(3), status: 'Selesai',
        keluhan: 'Motor susah starter, tenaga drop',
        diagnosa: 'Busi sudah aus, filter udara kotor',
        jasa: [{ nama: 'Servis Busi', harga: 30000 }, { nama: 'Bersih Karburator', harga: 40000 }],
        sparepart: [
            { sparepart_id: 'sp005', nama: 'Busi NGK', qty: 1, harga: 22000 },
            { sparepart_id: 'sp014', nama: 'Filter Udara', qty: 1, harga: 35000 }
        ],
        catatan: '', invoice_id: 'INV-2026-002'
    },
    {
        id: 'WO-2026-003', pelanggan_id: 'c003', kendaraan_id: 'v003', mekanik_id: 'm002',
        tanggal_masuk: daysAgo(2), tanggal_selesai: null, status: 'Dikerjakan',
        keluhan: 'AC tidak dingin, bunyi aneh di bagian mesin',
        diagnosa: 'Freon AC kurang, perlu diperiksa kompresor',
        jasa: [{ nama: 'Isi Freon AC R134a', harga: 150000 }, { nama: 'Ceking Mesin', harga: 50000 }],
        sparepart: [{ sparepart_id: 'sp004', nama: 'Filter AC', qty: 1, harga: 80000 }],
        catatan: '', invoice_id: null
    },
    {
        id: 'WO-2026-004', pelanggan_id: 'c004', kendaraan_id: 'v004', mekanik_id: 'm004',
        tanggal_masuk: daysAgo(1), tanggal_selesai: null, status: 'Antri',
        keluhan: 'Ganti ban depan belakang, cek tekanan angin',
        diagnosa: '-',
        jasa: [{ nama: 'Pasang Ban', harga: 30000 }, { nama: 'Balancing', harga: 20000 }],
        sparepart: [{ sparepart_id: 'sp010', nama: 'Ban Motor', qty: 2, harga: 230000 }],
        catatan: '', invoice_id: null
    },
    {
        id: 'WO-2026-005', pelanggan_id: 'c005', kendaraan_id: 'v005', mekanik_id: 'm001',
        tanggal_masuk: fmt(today), tanggal_selesai: null, status: 'Antri',
        keluhan: 'Rem blong, bunyi serak saat di rem',
        diagnosa: '-',
        jasa: [{ nama: 'Ganti Kampas Rem Depan', harga: 75000 }, { nama: 'Ganti Kampas Rem Belakang', harga: 65000 }],
        sparepart: [
            { sparepart_id: 'sp007', nama: 'Kampas Rem Depan', qty: 1, harga: 140000 },
            { sparepart_id: 'sp008', nama: 'Kampas Rem Belakang', qty: 1, harga: 115000 }
        ],
        catatan: '', invoice_id: null
    },
    {
        id: 'WO-2026-006', pelanggan_id: 'c007', kendaraan_id: 'v007', mekanik_id: 'm003',
        tanggal_masuk: daysAgo(10), tanggal_selesai: daysAgo(9), status: 'Selesai',
        keluhan: 'Servis berkala 30.000 km',
        diagnosa: 'Ganti oli, filter oli, filter udara, busi, cek seluruh sistem',
        jasa: [{ nama: 'Servis Berkala Major', harga: 200000 }],
        sparepart: [
            { sparepart_id: 'sp001', nama: 'Oli Mesin 10W-40', qty: 3, harga: 45000 },
            { sparepart_id: 'sp003', nama: 'Filter Oli', qty: 1, harga: 30000 },
            { sparepart_id: 'sp005', nama: 'Busi NGK', qty: 4, harga: 22000 },
            { sparepart_id: 'sp014', nama: 'Filter Udara', qty: 1, harga: 35000 }
        ],
        catatan: 'Kondisi kendaraan baik', invoice_id: 'INV-2026-003'
    },
];

// ---------- Sample Invoices ----------
const SAMPLE_INVOICE = [
    {
        id: 'INV-2026-001', workorder_id: 'WO-2026-001', pelanggan_id: 'c001',
        tanggal: daysAgo(6), subtotal: 300000, pajak: 0, diskon: 0,
        total: 300000, status: 'Lunas', metode: 'Transfer Bank', catatan: ''
    },
    {
        id: 'INV-2026-002', workorder_id: 'WO-2026-002', pelanggan_id: 'c002',
        tanggal: daysAgo(3), subtotal: 127000, pajak: 0, diskon: 10000,
        total: 117000, status: 'Lunas', metode: 'Tunai', catatan: ''
    },
    {
        id: 'INV-2026-003', workorder_id: 'WO-2026-006', pelanggan_id: 'c007',
        tanggal: daysAgo(9), subtotal: 558000, pajak: 0, diskon: 50000,
        total: 508000, status: 'Lunas', metode: 'QRIS', catatan: 'Diskon pelanggan setia'
    },
];

// ============================================
//  Database Manager (localStorage wrapper)
// ============================================
const DB = {
    get(key) {
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : null;
        } catch { return null; }
    },
    set(key, val) {
        try { localStorage.setItem(key, JSON.stringify(val)); return true; }
        catch { return false; }
    },
    init() {
        if (!this.get(DB_KEYS.settings)) this.set(DB_KEYS.settings, DEFAULT_SETTINGS);
        if (!this.get(DB_KEYS.mekanik)) this.set(DB_KEYS.mekanik, SAMPLE_MEKANIK);
        if (!this.get(DB_KEYS.pelanggan)) this.set(DB_KEYS.pelanggan, SAMPLE_PELANGGAN);
        if (!this.get(DB_KEYS.kendaraan)) this.set(DB_KEYS.kendaraan, SAMPLE_KENDARAAN);
        if (!this.get(DB_KEYS.workorder)) this.set(DB_KEYS.workorder, SAMPLE_WORKORDER);
        if (!this.get(DB_KEYS.sparepart)) this.set(DB_KEYS.sparepart, SAMPLE_SPAREPART);
        if (!this.get(DB_KEYS.invoice)) this.set(DB_KEYS.invoice, SAMPLE_INVOICE);
    },
    // CRUD helpers
    getAll(key) { return this.get(key) || []; },
    saveAll(key, arr) { return this.set(key, arr); },
    findById(key, id) { return this.getAll(key).find(x => x.id === id) || null; },
    insert(key, item) {
        const arr = this.getAll(key);
        arr.push(item);
        return this.set(key, arr);
    },
    update(key, id, updates) {
        const arr = this.getAll(key).map(x => x.id === id ? { ...x, ...updates } : x);
        return this.set(key, arr);
    },
    delete(key, id) {
        const arr = this.getAll(key).filter(x => x.id !== id);
        return this.set(key, arr);
    }
};
