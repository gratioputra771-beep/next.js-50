// app/api/absensi/manual/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { absensiManualSchema } from '@/lib/validations'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== 'GURU' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await req.json()
    const parsed = absensiManualSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
    }

    const { siswaId, status, tanggal, keterangan, mataPelajaranId } = parsed.data

    const guru = await prisma.guru.findUnique({ where: { userId: session.user.id } })
    const tanggalDate = new Date(tanggal)
    tanggalDate.setHours(0, 0, 0, 0)

    const absensi = await prisma.absensi.upsert({
      where: {
        siswaId_tanggal_mataPelajaranId: {
          siswaId,
          tanggal: tanggalDate,
          mataPelajaranId: mataPelajaranId || null,
        },
      },
      update: { status: status as any, keterangan, guruId: guru?.id, metode: 'MANUAL' },
      create: {
        siswaId,
        guruId: guru?.id,
        status: status as any,
        metode: 'MANUAL',
        tanggal: tanggalDate,
        keterangan,
        mataPelajaranId: mataPelajaranId || null,
      },
    })

    return NextResponse.json({ success: true, data: absensi })
  } catch (error) {
    console.error('Manual absensi error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
