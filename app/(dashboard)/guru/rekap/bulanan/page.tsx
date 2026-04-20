'use client'
// app/(dashboard)/guru/rekap/bulanan/page.tsx

import { useState, useEffect } from 'react'
import { getNamaBulan, getStatusColor } from '@/lib/utils'
import { Download, ChevronLeft, ChevronRight } from 'lucide-react'
import type { StatusAbsen } from '@/types'

interface RekapRow {
  id: string; nama: string; nis: string; kelas: string
  absensiMap: Record<number, StatusAbsen>
  total: { hadir: number; sakit: number; izin: number; alfa: number; dispensasi: number }
}

const STATUS_ABBR: Record<StatusAbsen, string> = {
  HADIR: 'H', SAKIT: 'S', IZIN: 'I', ALFA: 'A', DISPENSASI: 'D'
}
const STATUS_COLOR: Record<StatusAbsen, string> = {
  HADIR: 'bg-emerald-100 text-emerald-700',
  SAKIT: 'bg-amber-100 text-amber-700',
  IZIN: 'bg-blue-100 text-blue-700',
  ALFA: 'bg-red-100 text-red-700',
  DISPENSASI: 'bg-purple-100 text-purple-700',
}

export default function RekapBulananPage() {
  const now = new Date()
  const [bulan, setBulan] = useState(now.getMonth() + 1)
  const [tahun, setTahun] = useState(now.getFullYear())
  const [data, setData] = useState<RekapRow[]>([])
  const [daysInMonth, setDaysInMonth] = useState(0)
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/absensi/rekap/bulanan?bulan=${bulan}&tahun=${tahun}`)
      const json = await res.json()
      if (json.success) {
        setData(json.data)
        setDaysInMonth(json.daysInMonth)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [bulan, tahun])

  const prevMonth = () => {
    if (bulan === 1) { setBulan(12); setTahun(y => y - 1) }
    else setBulan(b => b - 1)
  }
  const nextMonth = () => {
    if (bulan === 12) { setBulan(1); setTahun(y => y + 1) }
    else setBulan(b => b + 1)
  }

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  return (
    <div className="space-y-5 fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Rekap Bulanan</h1>
          <p className="text-slate-500 text-sm">{getNamaBulan(bulan)} {tahun}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl overflow-hidden">
            <button onClick={prevMonth} className="p-2 hover:bg-slate-50 transition"><ChevronLeft size={16} /></button>
            <span className="px-3 text-sm font-medium">{getNamaBulan(bulan)} {tahun}</span>
            <button onClick={nextMonth} className="p-2 hover:bg-slate-50 transition"><ChevronRight size={16} /></button>
          </div>
          <a
            href={`/api/export/csv?bulan=${bulan}&tahun=${tahun}`}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition"
            download
          >
            <Download size={15} /> Export CSV
          </a>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {(Object.entries(STATUS_ABBR) as [StatusAbsen, string][]).map(([s, abbr]) => (
          <div key={s} className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className={`w-5 h-5 rounded flex items-center justify-center font-bold text-xs ${STATUS_COLOR[s]}`}>{abbr}</span>
            <span>{s.charAt(0) + s.slice(1).toLowerCase()}</span>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left px-3 py-2.5 text-slate-500 font-medium sticky left-0 bg-slate-50 min-w-[160px]">Siswa</th>
                {days.map(d => (
                  <th key={d} className="px-1.5 py-2.5 text-slate-400 font-medium text-center w-8">{d}</th>
                ))}
                <th className="px-2 py-2.5 text-slate-500 font-medium text-center">H</th>
                <th className="px-2 py-2.5 text-slate-500 font-medium text-center">S</th>
                <th className="px-2 py-2.5 text-slate-500 font-medium text-center">I</th>
                <th className="px-2 py-2.5 text-slate-500 font-medium text-center">A</th>
                <th className="px-2 py-2.5 text-slate-500 font-medium text-center">%</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-3 py-2"><div className="h-4 bg-slate-100 rounded animate-pulse w-32" /></td>
                    {days.map(d => <td key={d} className="px-1"><div className="h-5 w-5 bg-slate-100 rounded animate-pulse" /></td>)}
                    {Array.from({ length: 5 }).map((_, j) => <td key={j}><div className="h-4 bg-slate-100 rounded animate-pulse w-6" /></td>)}
                  </tr>
                ))
              ) : data.map(row => {
                const totalHariEfektif = row.total.hadir + row.total.sakit + row.total.izin + row.total.alfa + row.total.dispensasi
                const persen = totalHariEfektif > 0 ? Math.round((row.total.hadir / totalHariEfektif) * 100) : 0
                return (
                  <tr key={row.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-3 py-2 sticky left-0 bg-white">
                      <div className="font-medium text-slate-800 truncate max-w-[140px]">{row.nama}</div>
                      <div className="text-slate-400">{row.nis}</div>
                    </td>
                    {days.map(d => {
                      const status = row.absensiMap[d] as StatusAbsen | undefined
                      return (
                        <td key={d} className="px-0.5 py-2 text-center">
                          {status ? (
                            <span className={`inline-flex items-center justify-center w-6 h-6 rounded font-bold text-xs ${STATUS_COLOR[status]}`}>
                              {STATUS_ABBR[status]}
                            </span>
                          ) : (
                            <span className="text-slate-200">·</span>
                          )}
                        </td>
                      )
                    })}
                    <td className="px-2 py-2 text-center font-medium text-emerald-600">{row.total.hadir}</td>
                    <td className="px-2 py-2 text-center text-amber-600">{row.total.sakit}</td>
                    <td className="px-2 py-2 text-center text-blue-600">{row.total.izin}</td>
                    <td className="px-2 py-2 text-center text-red-600">{row.total.alfa}</td>
                    <td className="px-2 py-2 text-center">
                      <span className={`font-bold ${persen >= 80 ? 'text-emerald-600' : persen >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                        {persen}%
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
