// types/index.ts

export type Role = 'ADMIN' | 'GURU' | 'SISWA'
export type StatusAbsen = 'HADIR' | 'SAKIT' | 'IZIN' | 'ALFA' | 'DISPENSASI'
export type MetodeAbsen = 'QR' | 'MANUAL'
export type JenisKelamin = 'LAKI_LAKI' | 'PEREMPUAN'

export interface User {
  id: string
  nama: string
  email: string
  role: Role
  foto?: string | null
  aktif: boolean
  createdAt: Date
}

export interface Guru {
  id: string
  userId: string
  nip?: string | null
  mapel?: string | null
  user: User
}

export interface Siswa {
  id: string
  userId: string
  nis: string
  nisn?: string | null
  kelasId: string
  jenisKelamin?: JenisKelamin | null
  tanggalLahir?: Date | null
  noHpOrtu?: string | null
  emailOrtu?: string | null
  alamat?: string | null
  qrToken: string
  user: User
  kelas?: Kelas
}

export interface Kelas {
  id: string
  namaKelas: string
  tingkat: number
  tahunAjaran: string
  guruId: string
  guru?: Guru
  siswa?: Siswa[]
  _count?: { siswa: number }
}

export interface MataPelajaran {
  id: string
  nama: string
  kode: string
}

export interface Absensi {
  id: string
  siswaId: string
  guruId?: string | null
  mataPelajaranId?: string | null
  tanggal: Date
  status: StatusAbsen
  metode: MetodeAbsen
  keterangan?: string | null
  waktuScan?: Date | null
  siswa?: Siswa
  guru?: Guru | null
  mataPelajaran?: MataPelajaran | null
}

export interface ScanResult {
  success: boolean
  message: string
  data?: {
    siswa: {
      id: string
      nama: string
      nis: string
      kelas: string
      foto?: string | null
    }
    absensi: {
      id: string
      status: StatusAbsen
      waktuScan: Date
    }
  }
  error?: string
}

export interface RekapHarian {
  tanggal: Date
  totalSiswa: number
  hadir: number
  sakit: number
  izin: number
  alfa: number
  dispensasi: number
  daftarAbsensi: Absensi[]
}

export interface RekapBulanan {
  bulan: number
  tahun: number
  kelas: Kelas
  siswa: {
    id: string
    nama: string
    nis: string
    absensi: Record<string, StatusAbsen>
    total: {
      hadir: number
      sakit: number
      izin: number
      alfa: number
      dispensasi: number
      persentase: number
    }
  }[]
  tanggalEfektif: number[]
}

export interface SessionUser {
  id: string
  nama: string
  email: string
  role: Role
  foto?: string | null
  siswaId?: string
  guruId?: string
}
