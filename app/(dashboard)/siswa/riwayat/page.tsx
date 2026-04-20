// app/(dashboard)/siswa/riwayat/page.tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { formatTanggal, formatWaktu, hitungPersentase } from '@/lib/utils'
import StatusBadge from '@/components/StatusBadge'
import type { StatusAbsen } from '@/types'
import { startOfMonth, endOfMonth } from 'date-fns'

export default async function RiwayatPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'SISWA') redirect('/login')

  const siswa = await prisma.siswa.findUnique({
    where: { userId: session.user.id },
  })
  if (!siswa) redirect('/login')

  const now = new Date()
  const startDate = startOfMonth(now)
  const endDate = endOfMonth(now)

  const absensiList = await prisma.absensi.findMany({
    where: {
      siswaId: siswa.id,
      tanggal: { gte: startDate, lte: endDate },
      mataPelajaranId: null,
    },
    orderBy: { tanggal: 'desc' },
  })

  const stats = {
    hadir: absensiList.filter(a => a.status === 'HADIR').length,
    sakit: absensiList.filter(a => a.status === 'SAKIT').length,
    izin: absensiList.filter(a => a.status === 'IZIN').length,
    alfa: absensiList.filter(a => a.status === 'ALFA').length,
  }
  const total = absensiList.length
  const persenHadir = hitungPersentase(stats.hadir, total)

  return (
    <div className="max-w-lg mx-auto space-y-5 fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Riwayat Absensi</h1>
        <p className="text-slate-500 text-sm">Bulan ini ({formatTanggal(startDate, 'MMMM yyyy')})</p>
      </div>

      {/* Stats */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-slate-700">Persentase Kehadiran</span>
          <span className={`text-xl font-bold ${persenHadir >= 80 ? 'text-emerald-600' : persenHadir >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
            {persenHadir}%
          </span>
        </div>
        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden mb-4">
          <div
            className={`h-full rounded-full transition-all ${persenHadir >= 80 ? 'bg-emerald-500' : persenHadir >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
            style={{ width: `${persenHadir}%` }}
          />
        </div>
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Hadir', val: stats.hadir, cls: 'text-emerald-600' },
            { label: 'Sakit', val: stats.sakit, cls: 'text-amber-600' },
            { label: 'Izin', val: stats.izin, cls: 'text-blue-600' },
            { label: 'Alfa', val: stats.alfa, cls: 'text-red-600' },
          ].map(s => (
            <div key={s.label} className="text-center">
              <div className={`text-xl font-bold ${s.cls}`}>{s.val}</div>
              <div className="text-xs text-slate-400">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="card divide-y divide-slate-50">
        {absensiList.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-sm">Belum ada data absensi bulan ini</div>
        ) : absensiList.map(a => (
          <div key={a.id} className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="font-medium text-slate-700 text-sm">{formatTanggal(new Date(a.tanggal))}</p>
              <div className="flex items-center gap-2 mt-0.5">
                {a.waktuScan && (
                  <span className="text-xs text-slate-400">{formatWaktu(new Date(a.waktuScan))}</span>
                )}
                {a.keterangan && (
                  <span className="text-xs text-slate-400 truncate max-w-[160px]">{a.keterangan}</span>
                )}
              </div>
            </div>
            <StatusBadge status={a.status as StatusAbsen} showEmoji />
          </div>
        ))}
      </div>
    </div>
  )
}
