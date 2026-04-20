// app/api/absensi/keterangan/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { keteranganSchema } from '@/lib/validations'

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== 'GURU' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await req.json()
    const parsed = keteranganSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
    }

    const { absensiId, status, keterangan } = parsed.data

    const absensi = await prisma.absensi.update({
      where: { id: absensiId },
      data: { status: status as any, keterangan },
    })

    return NextResponse.json({ success: true, data: absensi })
  } catch (error) {
    console.error('Keterangan error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
