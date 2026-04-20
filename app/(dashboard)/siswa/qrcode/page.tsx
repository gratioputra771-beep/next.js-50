// app/(dashboard)/siswa/qrcode/page.tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import QRCodeDisplay from '@/components/QRCodeDisplay'
import StatusBadge from '@/components/StatusBadge'
import { formatTanggal, formatWaktu, getNamaHari } from '@/lib/utils'
import type { StatusAbsen } from '@/types'

export default async function SiswaQRPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'SISWA') redirect('/login')

  const siswa = await prisma.siswa.findUnique({
    where: { userId: session.user.id },
    include: {
      user: { select: { nama: true } },
      kelas: { select: { namaKelas: true } },
      absensi: {
        where: {
          tanggal: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
          mataPelajaranId: null,
        },
        take: 1,
      },
    },
  })

  if (!siswa) redirect('/login')

  const today = new Date()
  const absensiHariIni = siswa.absensi[0]

  return (
    <div className="max-w-sm mx-auto space-y-6 fade-in">
      {/* Date */}
      <div className="text-center">
        <p className="text-slate-500 text-sm">{getNamaHari(today)}, {formatTanggal(today)}</p>
        <h1 className="text-xl font-bold text-slate-800 mt-0.5">QR Code Absensi</h1>
      </div>

      {/* Status hari ini */}
      {absensiHariIni ? (
        <div className={`rounded-2xl p-4 text-center border ${
          absensiHariIni.status === 'HADIR'
            ? 'bg-emerald-50 border-emerald-200'
            : 'bg-amber-50 border-amber-200'
        }`}>
          <p className={`text-sm font-medium ${absensiHariIni.status === 'HADIR' ? 'text-emerald-700' : 'text-amber-700'}`}>
            {absensiHariIni.status === 'HADIR' ? '✅ Kamu sudah absen hari ini!' : '⚠️ Status kehadiran hari ini:'}
          </p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <StatusBadge status={absensiHariIni.status as StatusAbsen} showEmoji />
            {absensiHariIni.waktuScan && (
              <span className="text-xs text-slate-500">pukul {formatWaktu(new Date(absensiHariIni.waktuScan))}</span>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-center">
          <p className="text-sm text-blue-700 font-medium">⏳ Belum absen hari ini</p>
          <p className="text-xs text-blue-500 mt-1">Tunjukkan QR Code di bawah ke guru</p>
        </div>
      )}

      {/* QR Code */}
      <QRCodeDisplay
        token={siswa.qrToken}
        siswaName={siswa.user.nama}
        nis={siswa.nis}
        kelas={siswa.kelas.namaKelas}
      />

      {/* Info */}
      <div className="bg-slate-50 rounded-2xl p-4 text-xs text-slate-500 space-y-1">
        <p>• QR Code ini unik dan hanya milik kamu</p>
        <p>• Jangan bagikan QR Code ke orang lain</p>
        <p>• Naikkan kecerahan layar saat di-scan</p>
      </div>
    </div>
  )
}
