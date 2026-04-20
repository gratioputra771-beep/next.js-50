// app/api/absensi/harian/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== 'GURU' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const tanggalParam = searchParams.get('tanggal')
    const kelasId = searchParams.get('kelasId')

    const tanggal = tanggalParam ? new Date(tanggalParam) : new Date()
    tanggal.setHours(0, 0, 0, 0)
    const nextDay = new Date(tanggal)
    nextDay.setDate(nextDay.getDate() + 1)

    // Get all siswa in kelas (filter by kelasId if provided)
    const siswaList = await prisma.siswa.findMany({
      where: {
        ...(kelasId ? { kelasId } : {}),
        user: { aktif: true },
      },
      include: {
        user: { select: { nama: true, foto: true } },
        kelas: { select: { namaKelas: true } },
        absensi: {
          where: {
            tanggal: { gte: tanggal, lt: nextDay },
            mataPelajaranId: null,
          },
        },
      },
      orderBy: { user: { nama: 'asc' } },
    })

    const data = siswaList.map(s => ({
      siswa: {
        id: s.id,
        nama: s.user.nama,
        nis: s.nis,
        kelas: s.kelas.namaKelas,
        foto: s.user.foto,
      },
      absensi: s.absensi[0] || null,
    }))

    const stats = {
      total: data.length,
      hadir: data.filter(d => d.absensi?.status === 'HADIR').length,
      sakit: data.filter(d => d.absensi?.status === 'SAKIT').length,
      izin: data.filter(d => d.absensi?.status === 'IZIN').length,
      alfa: data.filter(d => !d.absensi || d.absensi.status === 'ALFA').length,
      dispensasi: data.filter(d => d.absensi?.status === 'DISPENSASI').length,
    }

    return NextResponse.json({ success: true, data, stats, tanggal })
  } catch (error) {
    console.error('Harian error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
