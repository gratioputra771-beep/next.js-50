// app/api/absensi/rekap/bulanan/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getDaysInMonth, startOfMonth, endOfMonth } from 'date-fns'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== 'GURU' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const bulan = parseInt(searchParams.get('bulan') || String(new Date().getMonth() + 1))
    const tahun = parseInt(searchParams.get('tahun') || String(new Date().getFullYear()))
    const kelasId = searchParams.get('kelasId')

    const startDate = startOfMonth(new Date(tahun, bulan - 1, 1))
    const endDate = endOfMonth(new Date(tahun, bulan - 1, 1))
    const daysInMonth = getDaysInMonth(new Date(tahun, bulan - 1, 1))
    const tanggalEfektif = Array.from({ length: daysInMonth }, (_, i) => i + 1)

    const siswaList = await prisma.siswa.findMany({
      where: {
        ...(kelasId ? { kelasId } : {}),
        user: { aktif: true },
      },
      include: {
        user: { select: { nama: true } },
        kelas: { select: { namaKelas: true } },
        absensi: {
          where: {
            tanggal: { gte: startDate, lte: endDate },
            mataPelajaranId: null,
          },
        },
      },
      orderBy: { user: { nama: 'asc' } },
    })

    const data = siswaList.map(s => {
      const absensiMap: Record<number, string> = {}
      s.absensi.forEach(a => {
        const tgl = new Date(a.tanggal).getDate()
        absensiMap[tgl] = a.status
      })

      const hadir = s.absensi.filter(a => a.status === 'HADIR').length
      const sakit = s.absensi.filter(a => a.status === 'SAKIT').length
      const izin = s.absensi.filter(a => a.status === 'IZIN').length
      const alfa = s.absensi.filter(a => a.status === 'ALFA').length
      const dispensasi = s.absensi.filter(a => a.status === 'DISPENSASI').length

      return {
        id: s.id,
        nama: s.user.nama,
        nis: s.nis,
        kelas: s.kelas.namaKelas,
        absensiMap,
        total: { hadir, sakit, izin, alfa, dispensasi },
      }
    })

    return NextResponse.json({ success: true, data, bulan, tahun, tanggalEfektif, daysInMonth })
  } catch (error) {
    console.error('Rekap bulanan error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
