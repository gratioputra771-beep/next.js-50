// prisma/seed.ts
import { PrismaClient, Role, StatusAbsen, MetodeAbsen, JenisKelamin } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Hash passwords
  const hashAdmin = await bcrypt.hash('admin123', 10)
  const hashGuru = await bcrypt.hash('guru123', 10)
  const hashSiswa = await bcrypt.hash('siswa123', 10)

  // Create Admin
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@sekolah.com' },
    update: {},
    create: {
      nama: 'Super Admin',
      email: 'admin@sekolah.com',
      password: hashAdmin,
      role: Role.ADMIN,
      admin: { create: {} },
    },
  })
  console.log('✅ Admin created:', adminUser.email)

  // Create Guru
  const guruUser = await prisma.user.upsert({
    where: { email: 'guru@sekolah.com' },
    update: {},
    create: {
      nama: 'Budi Santoso, S.Pd',
      email: 'guru@sekolah.com',
      password: hashGuru,
      role: Role.GURU,
      guru: {
        create: {
          nip: '198501012010011001',
          mapel: 'Matematika',
        },
      },
    },
    include: { guru: true },
  })
  console.log('✅ Guru created:', guruUser.email)

  // Create Kelas
  const kelas = await prisma.kelas.upsert({
    where: { namaKelas_tahunAjaran: { namaKelas: 'X IPA 1', tahunAjaran: '2024/2025' } },
    update: {},
    create: {
      namaKelas: 'X IPA 1',
      tingkat: 10,
      tahunAjaran: '2024/2025',
      guruId: guruUser.guru!.id,
    },
  })
  console.log('✅ Kelas created:', kelas.namaKelas)

  // Create Siswa 1
  const siswaUser1 = await prisma.user.upsert({
    where: { email: 'siswa@sekolah.com' },
    update: {},
    create: {
      nama: 'Ahmad Fauzi',
      email: 'siswa@sekolah.com',
      password: hashSiswa,
      role: Role.SISWA,
      siswa: {
        create: {
          nis: '2024001',
          nisn: '0012345678',
          kelasId: kelas.id,
          jenisKelamin: JenisKelamin.LAKI_LAKI,
          tanggalLahir: new Date('2008-05-15'),
          noHpOrtu: '08123456789',
          alamat: 'Jl. Melati No. 10, Kota',
        },
      },
    },
    include: { siswa: true },
  })
  console.log('✅ Siswa 1 created:', siswaUser1.email)

  // Create Siswa 2
  const siswaUser2 = await prisma.user.upsert({
    where: { email: 'siswa2@sekolah.com' },
    update: {},
    create: {
      nama: 'Siti Rahayu',
      email: 'siswa2@sekolah.com',
      password: hashSiswa,
      role: Role.SISWA,
      siswa: {
        create: {
          nis: '2024002',
          nisn: '0012345679',
          kelasId: kelas.id,
          jenisKelamin: JenisKelamin.PEREMPUAN,
          tanggalLahir: new Date('2008-09-20'),
          noHpOrtu: '08234567890',
          alamat: 'Jl. Mawar No. 5, Kota',
        },
      },
    },
    include: { siswa: true },
  })
  console.log('✅ Siswa 2 created:', siswaUser2.email)

  // Create Mata Pelajaran
  await prisma.mataPelajaran.upsert({
    where: { kode: 'MTK' },
    update: {},
    create: { nama: 'Matematika', kode: 'MTK' },
  })
  await prisma.mataPelajaran.upsert({
    where: { kode: 'B.IND' },
    update: {},
    create: { nama: 'Bahasa Indonesia', kode: 'B.IND' },
  })
  await prisma.mataPelajaran.upsert({
    where: { kode: 'B.ING' },
    update: {},
    create: { nama: 'Bahasa Inggris', kode: 'B.ING' },
  })
  console.log('✅ Mata pelajaran created')

  // Create sample absensi for today
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (siswaUser1.siswa) {
    await prisma.absensi.upsert({
      where: {
        siswaId_tanggal_mataPelajaranId: {
          siswaId: siswaUser1.siswa.id,
          tanggal: today,
          mataPelajaranId: null as any,
        },
      },
      update: {},
      create: {
        siswaId: siswaUser1.siswa.id,
        tanggal: today,
        status: StatusAbsen.HADIR,
        metode: MetodeAbsen.QR,
        waktuScan: new Date(),
      },
    }).catch(() => console.log('Absensi already exists, skipping'))
  }

  console.log('\n🎉 Seeding selesai!')
  console.log('\n📋 Akun Default:')
  console.log('  Admin  : admin@sekolah.com  | admin123')
  console.log('  Guru   : guru@sekolah.com   | guru123')
  console.log('  Siswa  : siswa@sekolah.com  | siswa123')
  console.log('  Siswa  : siswa2@sekolah.com | siswa123')
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
