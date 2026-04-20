'use client'
// app/(dashboard)/guru/absensi/page.tsx

import { useState, useEffect, useCallback } from 'react'
import { formatTanggal, formatWaktu } from '@/lib/utils'
import { Search, Filter, Download, Edit2, Plus } from 'lucide-react'
import StatusBadge from '@/components/StatusBadge'
import KeteranganModal from '@/components/KeteranganModal'
import type { StatusAbsen } from '@/types'
import toast from 'react-hot-toast'

interface SiswaAbsensi {
  siswa: { id: string; nama: string; nis: string; kelas: string; foto: string | null }
  absensi: {
    id: string; status: StatusAbsen; metode: string;
    keterangan: string | null; waktuScan: string | null
  } | null
}

export default function AbsensiPage() {
  const [tanggal, setTanggal] = useState(() => new Date().toISOString().split('T')[0])
  const [data, setData] = useState<SiswaAbsensi[]>([])
  const [stats, setStats] = useState({ total: 0, hadir: 0, sakit: 0, izin: 0, alfa: 0, dispensasi: 0 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editModal, setEditModal] = useState<{ absensiId: string; siswaName: string; status: StatusAbsen; keterangan?: string | null } | null>(null)
  const [manualModal, setManualModal] = useState<{ siswaId: string; siswaName: string } | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/absensi/harian?tanggal=${tanggal}`)
      const json = await res.json()
      if (json.success) {
        setData(json.data)
        setStats(json.stats)
      }
    } catch {
      toast.error('Gagal memuat data absensi')
    } finally {
      setLoading(false)
    }
  }, [tanggal])

  useEffect(() => { fetchData() }, [fetchData])

  const filtered = data.filter(d =>
    d.siswa.nama.toLowerCase().includes(search.toLowerCase()) ||
    d.siswa.nis.includes(search)
  )

  const handleManualAbsen = async (siswaId: string, status: StatusAbsen) => {
    try {
      const res = await fetch('/api/absensi/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siswaId, status, tanggal }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      toast.success('Absensi berhasil dicatat')
      fetchData()
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  const downloadCSV = () => {
    const bulan = new Date(tanggal).getMonth() + 1
    const tahun = new Date(tanggal).getFullYear()
    window.open(`/api/export/csv?bulan=${bulan}&tahun=${tahun}`, '_blank')
  }

  return (
    <div className="space-y-5 fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Absensi Harian</h1>
          <p className="text-slate-500 text-sm">{formatTanggal(tanggal)}</p>
        </div>
        <div className="flex gap-2">
          <input
            type="date"
            value={tanggal}
            onChange={e => setTanggal(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button onClick={downloadCSV}
            className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition">
            <Download size={15} /> CSV
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {[
          { label: 'Total', val: stats.total, cls: 'text-slate-700' },
          { label: 'Hadir', val: stats.hadir, cls: 'text-emerald-600' },
          { label: 'Sakit', val: stats.sakit, cls: 'text-amber-600' },
          { label: 'Izin', val: stats.izin, cls: 'text-blue-600' },
          { label: 'Alfa', val: stats.alfa, cls: 'text-red-600' },
          { label: 'Dispensasi', val: stats.dispensasi, cls: 'text-purple-600' },
        ].map(s => (
          <div key={s.label} className="card p-3 text-center">
            <div className={`text-2xl font-bold ${s.cls}`}>{s.val}</div>
            <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Cari nama atau NIS siswa..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left px-4 py-3 text-slate-500 font-medium">Siswa</th>
                <th className="text-left px-4 py-3 text-slate-500 font-medium">Kelas</th>
                <th className="text-left px-4 py-3 text-slate-500 font-medium">Status</th>
                <th className="text-left px-4 py-3 text-slate-500 font-medium">Waktu</th>
                <th className="text-left px-4 py-3 text-slate-500 font-medium">Keterangan</th>
                <th className="text-right px-4 py-3 text-slate-500 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-slate-100 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400">
                    Tidak ada data ditemukan
                  </td>
                </tr>
              ) : filtered.map(d => (
                <tr key={d.siswa.id} className="hover:bg-slate-50/50 transition">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center text-xs font-bold text-blue-600 shrink-0">
                        {d.siswa.nama.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{d.siswa.nama}</p>
                        <p className="text-xs text-slate-400">{d.siswa.nis}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{d.siswa.kelas}</td>
                  <td className="px-4 py-3">
                    {d.absensi
                      ? <StatusBadge status={d.absensi.status} />
                      : <span className="badge bg-red-50 text-red-700 border-red-200">Belum Absen</span>
                    }
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs">
                    {d.absensi?.waktuScan ? formatWaktu(new Date(d.absensi.waktuScan)) : '—'}
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs max-w-[140px] truncate">
                    {d.absensi?.keterangan || '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {d.absensi ? (
                      <button
                        onClick={() => setEditModal({
                          absensiId: d.absensi!.id,
                          siswaName: d.siswa.nama,
                          status: d.absensi!.status,
                          keterangan: d.absensi!.keterangan,
                        })}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Edit keterangan"
                      >
                        <Edit2 size={14} />
                      </button>
                    ) : (
                      <div className="flex items-center justify-end gap-1">
                        {(['HADIR','SAKIT','IZIN','ALFA'] as StatusAbsen[]).map(s => (
                          <button
                            key={s}
                            onClick={() => handleManualAbsen(d.siswa.id, s)}
                            className={`px-2 py-0.5 rounded text-xs font-medium transition
                              ${s === 'HADIR' ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' :
                                s === 'SAKIT' ? 'bg-amber-50 text-amber-700 hover:bg-amber-100' :
                                s === 'IZIN' ? 'bg-blue-50 text-blue-700 hover:bg-blue-100' :
                                'bg-red-50 text-red-700 hover:bg-red-100'}`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit modal */}
      {editModal && (
        <KeteranganModal
          absensiId={editModal.absensiId}
          siswaName={editModal.siswaName}
          currentStatus={editModal.status}
          currentKeterangan={editModal.keterangan}
          onClose={() => setEditModal(null)}
          onSuccess={fetchData}
        />
      )}
    </div>
  )
}
