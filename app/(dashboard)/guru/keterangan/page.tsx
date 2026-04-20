'use client'
// app/(dashboard)/guru/keterangan/page.tsx

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { Loader2 } from 'lucide-react'
import type { StatusAbsen } from '@/types'

interface SiswaItem { id: string; nis: string; user: { nama: string }; kelas: { namaKelas: string } }

export default function KeteranganPage() {
  const [siswaList, setSiswaList] = useState<SiswaItem[]>([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    siswaId: '',
    status: 'SAKIT' as StatusAbsen,
    tanggal: new Date().toISOString().split('T')[0],
    keterangan: '',
  })

  useEffect(() => {
    fetch('/api/siswa').then(r => r.json()).then(d => {
      if (d.success) setSiswaList(d.data)
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/absensi/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      toast.success('Absensi manual berhasil dicatat')
      setForm(f => ({ ...f, siswaId: '', keterangan: '' }))
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  const statusOptions: { value: StatusAbsen; label: string; cls: string }[] = [
    { value: 'HADIR', label: '✅ Hadir', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { value: 'SAKIT', label: '🤒 Sakit', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
    { value: 'IZIN', label: '📋 Izin', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
    { value: 'ALFA', label: '❌ Alfa', cls: 'bg-red-50 text-red-700 border-red-200' },
    { value: 'DISPENSASI', label: '🏆 Dispensasi', cls: 'bg-purple-50 text-purple-700 border-purple-200' },
  ]

  return (
    <div className="max-w-lg space-y-5 fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Input Keterangan Manual</h1>
        <p className="text-slate-500 text-sm">Catat absensi siswa tanpa scan QR (untuk kasus sakit, izin, dll)</p>
      </div>

      <form onSubmit={handleSubmit} className="card p-5 space-y-5">
        {/* Pilih siswa */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Siswa *</label>
          <select
            value={form.siswaId}
            onChange={e => setForm(f => ({...f, siswaId: e.target.value}))}
            required
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Pilih Siswa --</option>
            {siswaList.map(s => (
              <option key={s.id} value={s.id}>
                {s.user.nama} — {s.nis} ({s.kelas.namaKelas})
              </option>
            ))}
          </select>
        </div>

        {/* Tanggal */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Tanggal *</label>
          <input
            type="date"
            value={form.tanggal}
            onChange={e => setForm(f => ({...f, tanggal: e.target.value}))}
            required
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Status *</label>
          <div className="flex flex-wrap gap-2">
            {statusOptions.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setForm(f => ({...f, status: opt.value}))}
                className={`px-3 py-2 rounded-xl text-sm font-medium border transition
                  ${form.status === opt.value ? `${opt.cls} ring-2 ring-offset-1 ring-blue-500` : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Keterangan */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Keterangan <span className="text-slate-400 font-normal">(opsional)</span>
          </label>
          <textarea
            value={form.keterangan}
            onChange={e => setForm(f => ({...f, keterangan: e.target.value}))}
            rows={3}
            placeholder="Contoh: Surat dokter terlampir, izin keperluan keluarga, mengikuti lomba OSN..."
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button type="submit" disabled={loading}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2 disabled:opacity-60">
          {loading ? <><Loader2 size={16} className="animate-spin" /> Menyimpan...</> : 'Simpan Absensi'}
        </button>
      </form>
    </div>
  )
}
