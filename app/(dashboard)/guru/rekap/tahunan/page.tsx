'use client'
// app/(dashboard)/guru/rekap/tahunan/page.tsx

import { useState, useEffect } from 'react'
import { getNamaBulan, hitungPersentase } from '@/lib/utils'
import { Download } from 'lucide-react'

interface BulanStat { bulan: number; hadir: number; sakit: number; izin: number; alfa: number; total: number }

export default function RekapTahunanPage() {
  const [tahun, setTahun] = useState(new Date().getFullYear())
  const [data, setData] = useState<BulanStat[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    setLoading(true)
    try {
      // Build monthly stats from bulanan API for each month
      const results = await Promise.all(
        Array.from({ length: 12 }, (_, i) => i + 1).map(bulan =>
          fetch(`/api/absensi/rekap/bulanan?bulan=${bulan}&tahun=${tahun}`)
            .then(r => r.json())
            .then(json => {
              if (!json.success) return null
              const siswaData: any[] = json.data
              const totals = siswaData.reduce((acc, s) => ({
                hadir: acc.hadir + s.total.hadir,
                sakit: acc.sakit + s.total.sakit,
                izin: acc.izin + s.total.izin,
                alfa: acc.alfa + s.total.alfa,
              }), { hadir: 0, sakit: 0, izin: 0, alfa: 0 })
              const total = totals.hadir + totals.sakit + totals.izin + totals.alfa
              return { bulan, ...totals, total }
            })
            .catch(() => null)
        )
      )
      setData(results.filter(Boolean) as BulanStat[])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [tahun])

  const grandTotal = data.reduce((acc, d) => ({
    hadir: acc.hadir + d.hadir,
    sakit: acc.sakit + d.sakit,
    izin: acc.izin + d.izin,
    alfa: acc.alfa + d.alfa,
    total: acc.total + d.total,
  }), { hadir: 0, sakit: 0, izin: 0, alfa: 0, total: 0 })

  return (
    <div className="space-y-5 fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Rekap Tahunan</h1>
          <p className="text-slate-500 text-sm">Tahun Ajaran {tahun}/{tahun + 1}</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={tahun}
            onChange={e => setTahun(Number(e.target.value))}
            min={2020}
            max={2030}
            className="w-24 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <a
            href={`/api/export/csv?tahun=${tahun}&bulan=1`}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition"
            download
          >
            <Download size={15} /> Export
          </a>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Hadir', val: grandTotal.hadir, cls: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Total Sakit', val: grandTotal.sakit, cls: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Total Izin', val: grandTotal.izin, cls: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Total Alfa', val: grandTotal.alfa, cls: 'text-red-600', bg: 'bg-red-50' },
        ].map(s => (
          <div key={s.label} className={`card p-4 ${s.bg}`}>
            <div className={`text-3xl font-bold ${s.cls}`}>{s.val}</div>
            <div className="text-xs text-slate-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="text-left px-4 py-3 text-slate-500 font-medium">Bulan</th>
              <th className="text-center px-4 py-3 text-emerald-600 font-medium">Hadir</th>
              <th className="text-center px-4 py-3 text-amber-600 font-medium">Sakit</th>
              <th className="text-center px-4 py-3 text-blue-600 font-medium">Izin</th>
              <th className="text-center px-4 py-3 text-red-600 font-medium">Alfa</th>
              <th className="text-center px-4 py-3 text-slate-500 font-medium">% Hadir</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              Array.from({ length: 12 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-4 py-3"><div className="h-4 bg-slate-100 rounded animate-pulse" /></td>
                  ))}
                </tr>
              ))
            ) : data.map(d => {
              const persen = hitungPersentase(d.hadir, d.total)
              return (
                <tr key={d.bulan} className="hover:bg-slate-50/50 transition">
                  <td className="px-4 py-3 font-medium text-slate-700">{getNamaBulan(d.bulan)}</td>
                  <td className="px-4 py-3 text-center font-medium text-emerald-600">{d.hadir}</td>
                  <td className="px-4 py-3 text-center text-amber-600">{d.sakit}</td>
                  <td className="px-4 py-3 text-center text-blue-600">{d.izin}</td>
                  <td className="px-4 py-3 text-center text-red-600">{d.alfa}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`font-bold ${persen >= 80 ? 'text-emerald-600' : persen >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                      {d.total > 0 ? `${persen}%` : '—'}
                    </span>
                  </td>
                </tr>
              )
            })}
            {/* Total row */}
            <tr className="bg-slate-50 font-semibold">
              <td className="px-4 py-3 text-slate-800">TOTAL</td>
              <td className="px-4 py-3 text-center text-emerald-700">{grandTotal.hadir}</td>
              <td className="px-4 py-3 text-center text-amber-700">{grandTotal.sakit}</td>
              <td className="px-4 py-3 text-center text-blue-700">{grandTotal.izin}</td>
              <td className="px-4 py-3 text-center text-red-700">{grandTotal.alfa}</td>
              <td className="px-4 py-3 text-center font-bold text-slate-700">
                {grandTotal.total > 0 ? `${hitungPersentase(grandTotal.hadir, grandTotal.total)}%` : '—'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
