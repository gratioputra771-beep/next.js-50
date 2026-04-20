// app/api/absensi/scan/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PESAN } from '@/lib/constants'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== 'GURU' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: PESAN.UNAUTHORIZED }, { status: 403 })
    }

    const { qrToken } = await req.json()
    if (!qrToken) {
      return NextResponse.json({ error: 'QR Token wajib diisi' }, { status: 400 })
    }

    // Find siswa by QR token
    const siswa = await prisma.siswa.findUnique({
      where: { qrToken },
      include: {
        user: { select: { nama: true, foto: true, aktif: true } },
        kelas: { select: { namaKelas: true } },
      },
    })

    if (!siswa) {
      return NextResponse.json({ error: PESAN.SCAN_TOKEN_INVALID }, { status: 404 })
    }

    if (!siswa.user.aktif) {
      return NextResponse.json({ error: 'Akun siswa ini telah dinonaktifkan' }, { status: 403 })
    }

    // Check if already scanned today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const existingAbsensi = await prisma.absensi.findFirst({
      where: {
        siswaId: siswa.id,
        tanggal: { gte: today, lt: tomorrow },
        mataPelajaranId: null,
      },
    })

    if (existingAbsensi) {
      return NextResponse.json({
        success: false,
        message: PESAN.SCAN_DUPLIKAT,
        data: {
          siswa: {
            id: siswa.id,
            nama: siswa.user.nama,
            nis: siswa.nis,
            kelas: siswa.kelas.namaKelas,
            foto: siswa.user.foto,
          },
          absensi: existingAbsensi,
          isDuplicate: true,
        },
      }, { status: 200 })
    }

    // Get guru id
    const guru = await prisma.guru.findUnique({
      where: { userId: session.user.id },
    })

    // Create absensi
    const absensi = await prisma.absensi.create({
      data: {
        siswaId: siswa.id,
        guruId: guru?.id,
        status: 'HADIR',
        metode: 'QR',
        tanggal: today,
        waktuScan: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      message: PESAN.SCAN_BERHASIL,
      data: {
        siswa: {
          id: siswa.id,
          nama: siswa.user.nama,
          nis: siswa.nis,
          kelas: siswa.kelas.namaKelas,
          foto: siswa.user.foto,
        },
        absensi: {
          id: absensi.id,
          status: absensi.status,
          waktuScan: absensi.waktuScan,
        },
        isDuplicate: false,
      },
    })
  } catch (error) {
    console.error('Scan error:', error)
    return NextResponse.json({ error: PESAN.SERVER_ERROR }, { status: 500 })
  }
}
