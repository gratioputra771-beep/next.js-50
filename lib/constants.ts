// lib/constants.ts

export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'QR Attendance'
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export const STATUS_ABSEN = {
  HADIR: 'HADIR',
  SAKIT: 'SAKIT',
  IZIN: 'IZIN',
  ALFA: 'ALFA',
  DISPENSASI: 'DISPENSASI',
} as const

export const METODE_ABSEN = {
  QR: 'QR',
  MANUAL: 'MANUAL',
} as const

export const HARI = {
  1: 'Senin',
  2: 'Selasa',
  3: 'Rabu',
  4: 'Kamis',
  5: 'Jumat',
  6: 'Sabtu',
} as const

export const JENIS_KELAMIN = {
  LAKI_LAKI: 'Laki-laki',
  PEREMPUAN: 'Perempuan',
} as const

export const ROLE = {
  ADMIN: 'ADMIN',
  GURU: 'GURU',
  SISWA: 'SISWA',
} as const

export const PESAN = {
  SCAN_BERHASIL: 'Absensi berhasil dicatat',
  SCAN_DUPLIKAT: 'Siswa ini sudah absen hari ini',
  SCAN_TOKEN_INVALID: 'QR Code tidak valid atau sudah kedaluwarsa',
  UNAUTHORIZED: 'Anda tidak memiliki akses ke halaman ini',
  SERVER_ERROR: 'Terjadi kesalahan server, coba beberapa saat lagi',
} as const
