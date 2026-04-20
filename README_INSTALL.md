# QR Attendance — Panduan Instalasi & Penggunaan

Sistem absensi digital berbasis QR Code untuk sekolah, dibangun dengan **Next.js 15**, **Prisma ORM**, **PostgreSQL**, dan **Tailwind CSS**.

---

## 📁 Struktur Proyek

```
qr-attendance/
├── app/
│   ├── (auth)/login/          # Halaman login
│   ├── (dashboard)/
│   │   ├── guru/              # Dashboard guru/admin
│   │   │   ├── page.tsx       # Dashboard utama
│   │   │   ├── scan/          # Scan QR Code
│   │   │   ├── absensi/       # Absensi harian
│   │   │   ├── keterangan/    # Input manual
│   │   │   ├── rekap/bulanan/ # Rekap bulanan
│   │   │   ├── rekap/tahunan/ # Rekap tahunan
│   │   │   ├── siswa/         # Manajemen siswa
│   │   │   ├── kelas/         # Manajemen kelas
│   │   │   └── pengaturan/    # Pengaturan akun
│   │   └── siswa/             # Dashboard siswa
│   │       ├── qrcode/        # Tampilkan QR Code
│   │       ├── riwayat/       # Riwayat absensi
│   │       └── profil/        # Profil siswa
│   └── api/                   # API Routes
│       ├── auth/[...nextauth]/ # Autentikasi
│       ├── absensi/scan/       # Proses scan QR
│       ├── absensi/manual/     # Input manual
│       ├── absensi/keterangan/ # Update keterangan
│       ├── absensi/harian/     # Data harian
│       ├── absensi/rekap/bulanan/ # Rekap bulanan
│       ├── siswa/              # CRUD siswa
│       ├── kelas/              # CRUD kelas
│       ├── qrcode/regenerate/  # Reset QR
│       └── export/csv/         # Export CSV
├── components/
│   ├── layout/Navbar.tsx
│   ├── layout/Sidebar.tsx
│   ├── QRScanner.tsx          # Komponen kamera scan
│   ├── QRCodeDisplay.tsx      # Tampilan QR Code siswa
│   ├── StatusBadge.tsx        # Badge status absensi
│   ├── KeteranganModal.tsx    # Modal edit keterangan
│   ├── ConfirmDialog.tsx      # Dialog konfirmasi
│   └── GrafikKehadiran.tsx    # Grafik recharts
├── lib/
│   ├── auth.ts                # NextAuth config
│   ├── prisma.ts              # Prisma singleton
│   ├── utils.ts               # Helper functions
│   ├── constants.ts           # Konstanta app
│   └── validations.ts         # Zod schemas
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Data awal
└── types/
    ├── index.ts               # TypeScript types
    └── next-auth.d.ts         # NextAuth augmentation
```

---

## 🚀 Cara Instalasi

### 1. Prasyarat
- Node.js 18+
- PostgreSQL (lokal atau Railway/Supabase/Neon)

### 2. Clone & Install

```bash
# Ekstrak ZIP, masuk ke folder
cd qr-attendance

# Install dependencies
npm install
```

### 3. Setup Environment

```bash
# Salin file .env.example
cp .env.example .env

# Edit .env dengan nilai yang benar:
# DATABASE_URL=postgresql://...
# NEXTAUTH_SECRET=... (minimal 32 karakter acak)
# NEXTAUTH_URL=http://localhost:3000
```

Generate `NEXTAUTH_SECRET`:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Setup Database

```bash
# Buat tabel di database
npx prisma db push

# (Opsional) Isi data awal / akun demo
npx prisma db seed
```

### 5. Jalankan Aplikasi

```bash
npm run dev
```

Buka `http://localhost:3000`

---

## 👤 Akun Demo (setelah seed)

| Role  | Email                | Password  |
|-------|----------------------|-----------|
| Admin | admin@sekolah.com    | admin123  |
| Guru  | guru@sekolah.com     | guru123   |
| Siswa | siswa@sekolah.com    | siswa123  |
| Siswa | siswa2@sekolah.com   | siswa123  |

---

## 🎯 Fitur Utama

### Role: Guru / Admin
- **Dashboard** — statistik kehadiran harian & grafik 7 hari
- **Scan QR** — scan QR Code siswa lewat kamera (real-time)
- **Absensi Harian** — tabel absensi dengan filter tanggal, edit status, input manual
- **Input Keterangan** — catat sakit/izin tanpa scan QR
- **Rekap Bulanan** — tabel grid per tanggal dengan kode huruf (H/S/I/A/D)
- **Rekap Tahunan** — ringkasan per bulan dalam satu tahun
- **Data Siswa** — tambah, lihat detail, reset QR, nonaktifkan
- **Data Kelas** — tambah dan kelola kelas
- **Export CSV** — unduh rekap absensi format CSV

### Role: Siswa
- **QR Code** — tampilkan QR Code pribadi (bisa diunduh/cetak)
- **Riwayat** — histori absensi bulan ini + statistik kehadiran
- **Profil** — informasi data diri lengkap

---

## 🗄️ Database Schema

Model utama:
- `User` — akun login (guru/siswa/admin)
- `Siswa` — data lengkap siswa + QR token unik
- `Guru` — data guru + mata pelajaran
- `Kelas` — data kelas + wali kelas
- `Absensi` — catatan kehadiran (status, metode, waktu scan)
- `MataPelajaran` — daftar mata pelajaran
- `HariLibur` — hari libur nasional

---

## 🔌 API Endpoints

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/api/auth/[...nextauth]` | Login/logout |
| POST | `/api/absensi/scan` | Proses scan QR |
| POST | `/api/absensi/manual` | Input absensi manual |
| PATCH | `/api/absensi/keterangan` | Update status/keterangan |
| GET | `/api/absensi/harian` | Data absensi harian |
| GET | `/api/absensi/rekap/bulanan` | Rekap per bulan |
| GET | `/api/siswa` | Daftar siswa |
| POST | `/api/siswa` | Tambah siswa |
| GET/PATCH/DELETE | `/api/siswa/[id]` | Detail/edit/nonaktifkan |
| GET | `/api/kelas` | Daftar kelas |
| POST | `/api/kelas` | Tambah kelas |
| POST | `/api/qrcode/regenerate` | Reset QR token |
| GET | `/api/export/csv` | Export CSV |

---

## 🚢 Deploy ke Railway

1. Push kode ke GitHub
2. Buat proyek baru di Railway
3. Tambahkan service PostgreSQL
4. Set environment variables:
   - `DATABASE_URL` (salin dari Railway PostgreSQL)
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` (URL Railway kamu)
5. Deploy otomatis — Railway akan menjalankan `npm run build`

---

## 🛠️ Teknologi

| Teknologi | Versi | Kegunaan |
|-----------|-------|----------|
| Next.js | 15 | Framework fullstack |
| TypeScript | 5 | Type safety |
| Prisma | 5 | ORM database |
| PostgreSQL | — | Database utama |
| NextAuth.js | 4 | Autentikasi |
| Tailwind CSS | 3 | Styling |
| qrcode.react | 3 | Generate QR Code |
| html5-qrcode | 2 | Scan QR lewat kamera |
| Recharts | 2 | Grafik kehadiran |
| Zod | 3 | Validasi input |
| date-fns | 3 | Manipulasi tanggal |
| react-hot-toast | 2 | Notifikasi |
