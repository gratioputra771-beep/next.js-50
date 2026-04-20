// lib/validations.ts
import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
})

export const tambahSiswaSchema = z.object({
  nama: z.string().min(2, 'Nama minimal 2 karakter'),
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  nis: z.string().min(3, 'NIS minimal 3 karakter'),
  nisn: z.string().optional(),
  kelasId: z.string().min(1, 'Kelas wajib dipilih'),
  jenisKelamin: z.enum(['LAKI_LAKI', 'PEREMPUAN']).optional(),
  tanggalLahir: z.string().optional(),
  noHpOrtu: z.string().optional(),
  emailOrtu: z.string().email().optional().or(z.literal('')),
  alamat: z.string().optional(),
})

export const absensiManualSchema = z.object({
  siswaId: z.string().min(1, 'Siswa wajib dipilih'),
  status: z.enum(['HADIR', 'SAKIT', 'IZIN', 'ALFA', 'DISPENSASI']),
  tanggal: z.string().min(1, 'Tanggal wajib diisi'),
  keterangan: z.string().optional(),
  mataPelajaranId: z.string().optional(),
})

export const keteranganSchema = z.object({
  absensiId: z.string().min(1),
  status: z.enum(['HADIR', 'SAKIT', 'IZIN', 'ALFA', 'DISPENSASI']),
  keterangan: z.string().optional(),
})

export const kelasSchema = z.object({
  namaKelas: z.string().min(2, 'Nama kelas minimal 2 karakter'),
  tingkat: z.number().int().min(10).max(12),
  tahunAjaran: z.string().regex(/^\d{4}\/\d{4}$/, 'Format tahun ajaran: 2024/2025'),
  guruId: z.string().min(1, 'Wali kelas wajib dipilih'),
})

export type LoginInput = z.infer<typeof loginSchema>
export type TambahSiswaInput = z.infer<typeof tambahSiswaSchema>
export type AbsensiManualInput = z.infer<typeof absensiManualSchema>
export type KeteranganInput = z.infer<typeof keteranganSchema>
export type KelasInput = z.infer<typeof kelasSchema>
