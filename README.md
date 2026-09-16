# 🔧 BengkelPro — Sistem Manajemen Bengkel Otomotif

![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg)
![Express](https://img.shields.io/badge/Express-v4.19-blue.svg)
![JavaScript](https://img.shields.io/badge/Frontend-Vanilla%20JS-yellow.svg)
![License](https://img.shields.io/badge/License-MIT-brightgreen.svg)

**BengkelPro** adalah aplikasi web manajemen bengkel motor dan mobil profesional yang dirancang untuk membantu pemilik bengkel mengelola operasional harian secara efisien dan terintegrasi.

---

## 🌟 Fitur Utama

- 📊 **Dashboard Analitik**: Ringkasan performa bengkel, statistik servis, dan grafik pendapatan.
- 🔧 **Work Order (SPK)**: Pengelolaan Surat Perintah Kerja dari kendaraan masuk hingga selesai.
- 👥 **Manajemen Pelanggan**: Pencatatan riwayat servis dan kontak pelanggan.
- 🏍️ **Manajemen Kendaraan**: Data mobil dan motor pelanggan beserta spesifikasinya.
- 📦 **Stok Sparepart**: Pemantauan stok suku cadang secara real-time dengan notifikasi stok menipis.
- 👷 **Manajemen Mekanik**: Pengelolaan data teknisi, spesialisasi, dan status kerja.
- 🧾 **Kasir & Invoice**: Pembuatan faktur pembayaran, diskon, pajak, dan cetak struk/nota.
- 📈 **Laporan Keuangan**: Laporan pendapatan harian, mingguan, dan bulanan.

---

## 📁 Struktur Project

```text
Web Bengkel/
├── frontend/                  <-- Aplikasi Web (Client-side UI)
│   ├── index.html             <-- Halaman Utama
│   ├── css/                   <-- Styling & Design System
│   └── js/                    <-- Logic & Page Controllers
│       ├── app.js
│       ├── data.js
│       ├── utils.js
│       └── pages/             <-- Modul Halaman (Dashboard, Workorder, dll)
├── backend/                   <-- Server REST API (Node.js & Express)
│   ├── src/
│   │   └── app.js             <-- Entry point server backend
│   ├── .env.example
│   ├── package.json
│   └── README.md
├── .github/                   <-- Konfigurasi & Workflow GitHub
│   └── workflows/
│       └── deploy.yml         <-- Automation Deployment GitHub Pages
└── .gitignore                 <-- Mengabaikan file yang tidak perlu di-commit
```

---

## 🚀 Cara Menjalankan Project

### 1. Menjalankan Backend (Server API)
```bash
cd backend
npm install
npm run dev
```
> Server REST API akan berjalan pada: `http://localhost:5000`

### 2. Menjalankan Frontend (Antarmuka Web)
Akses aplikasi web langsung melalui server backend di browser Anda:
👉 **[http://localhost:5000](http://localhost:5000)**

Atau buka file `frontend/index.html` secara langsung di browser Anda.

---

## 🛠️ Spesifikasi Teknologi (Tech Stack)

- **Frontend**: HTML5, Vanilla CSS3 (Custom Design System), Modern JavaScript (ES6+ SPA)
- **Backend**: Node.js, Express.js, CORS, Dotenv
- **Database**: Browser LocalStorage (Client-side) & Support REST API Database Integration (PostgreSQL / MySQL ready)

---

## 📝 Lisensi

Project ini dilindungi di bawah lisensi [MIT License](LICENSE).
