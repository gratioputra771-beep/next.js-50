// app/(dashboard)/guru/page.tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { formatTanggal, getNamaHari } from '@/lib/utils'
import { Users, CheckCircle, XCircle, AlertCircle, TrendingUp, QrCode } from 'lucide-react'
import Link from 'next/link'
import GrafikKehadiran from '@/components/GrafikKehadiran'

async function getDashboardData() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const [totalSiswa, absensiHariIni, rekapMinggu] = await Promise.all([
    prisma.siswa.count({ where: { user: { aktif: true } } }),
    prisma.absensi.findMany({
      where: { tanggal: { gte: today, lt: tomorrow }, mataPelajaranId: null },
      include: { siswa: { include: { user: { select: { nama: true } } } } },
    }),
    // Last 7 days stats
    Promise.all(
      Array.from({ length: 7 }, (_, i) => {
        const d = new Date(today)
        d.setDate(d.getDate() - (6 - i))
        const nextD = new Date(d)
        nextD.setDate(nextD.getDate() + 1)
        return prisma.absensi.groupBy({
          by: ['status'],
          where: { tanggal: { gte: d, lt: nextD }, mataPelajaranId: null },
          _count: { status: true },
        }).then(data => ({
          label: ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'][d.getDay()],
          hadir: data.find(d => d.status === 'HADIR')?._count.status || 0,
          sakit: data.find(d => d.status === 'SAKIT')?._count.status || 0,
          izin: data.find(d => d.status === 'IZIN')?._count.status || 0,
          alfa: data.find(d => d.status === 'ALFA')?._count.status || 0,
        }))
      })
    ),
  ])

  const stats = {
    hadir: absensiHariIni.filter(a => a.status === 'HADIR').length,
    sakit: absensiHariIni.filter(a => a.status === 'SAKIT').length,
    izin: absensiHariIni.filter(a => a.status === 'IZIN').length,
    alfa: totalSiswa - absensiHariIni.length,
  }

  return { totalSiswa, stats, rekapMinggu, absensiHariIni }
}

export default async function GuruDashboard() {
  const session = await getServerSession(authOptions)
  const { totalSiswa, stats, rekapMinggu, absensiHariIni } = await getDashboardData()

  const today = new Date()
  const persenHadir = totalSiswa > 0 ? Math.round((stats.hadir / totalSiswa) * 100) : 0

  const statCards = [
    { label: 'Total Siswa', value: totalSiswa, icon: Users, color: 'bg-slate-100 text-slate-600', bg: 'bg-white' },
    { label: 'Hadir Hari Ini', value: stats.hadir, icon: CheckCircle, color: 'bg-emerald-100 text-emerald-600', bg: 'bg-white' },
    { label: 'Sakit / Izin', value: stats.sakit + stats.izin, icon: AlertCircle, color: 'bg-amber-100 text-amber-600', bg: 'bg-white' },
    { label: 'Alfa', value: stats.alfa, icon: XCircle, color: 'bg-red-100 text-red-600', bg: 'bg-white' },
  ]

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {getNamaHari(today)}, {formatTanggal(today)}
          </p>
        </div>
        <Link href="/guru/scan"
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition shadow-lg shadow-blue-200">
          <QrCode size={16} />
          Scan QR
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(card => {
          const Icon = card.icon
          return (
            <div key={card.label} className="card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500">{card.label}</p>
                  <p className="text-3xl font-bold text-slate-800 mt-1">{card.value}</p>
                </div>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.color}`}>
                  <Icon size={20} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Kehadiran bar */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-slate-700">Persentase Kehadiran Hari Ini</span>
          <span className={`text-sm font-bold ${persenHadir >= 80 ? 'text-emerald-600' : persenHadir >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
            {persenHadir}%
          </span>
        </div>
        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${persenHadir >= 80 ? 'bg-emerald-500' : persenHadir >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
            style={{ width: `${persenHadir}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-400 mt-1.5">
          <span>{stats.hadir} hadir</span>
          <span>{totalSiswa} total siswa</span>
        </div>
      </div>

      {/* Grafik */}
      <GrafikKehadiran data={rekapMinggu} title="Rekap Kehadiran 7 Hari Terakhir" />

      {/* Recent absensi */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-700">Absensi Terbaru Hari Ini</h3>
          <Link href="/guru/absensi" className="text-sm text-blue-600 hover:underline">Lihat semua →</Link>
        </div>
        {absensiHariIni.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <QrCode size={32} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm">Belum ada absensi hari ini</p>
          </div>
        ) : (
          <div className="space-y-2">
            {absensiHariIni.slice(0, 8).map(a => (
              <div key={a.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center text-xs font-bold text-blue-600">
                    {a.siswa.user.nama.charAt(0)}
                  </div>
                  <span className="text-sm font-medium text-slate-700">{a.siswa.user.nama}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`badge ${
                    a.status === 'HADIR' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    a.status === 'SAKIT' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                    'bg-blue-50 text-blue-700 border-blue-200'
                  }`}>{a.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
