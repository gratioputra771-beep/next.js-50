'use client'
// app/(dashboard)/guru/kelas/page.tsx

import { useState, useEffect } from 'react'
import { Users, GraduationCap, Plus, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface KelasItem {
  id: string
  namaKelas: string
  tingkat: number
  tahunAjaran: string
  guru: { user: { nama: string } }
  _count: { siswa: number }
}

interface GuruItem {
  id: string
  user: { nama: string }
}

export default function KelasPage() {
  const [data, setData] = useState<KelasItem[]>([])
  const [guruList, setGuruList] = useState<GuruItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ namaKelas: '', tingkat: 10, tahunAjaran: '2024/2025', guruId: '' })

  const fetchData = async () => {
    setLoading(true)
    try {
      const [kelasRes] = await Promise.all([fetch('/api/kelas')])
      const kelasJson = await kelasRes.json()
      if (kelasJson.success) setData(kelasJson.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/kelas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, tingkat: Number(form.tingkat) }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      toast.success('Kelas berhasil ditambahkan')
      setShowForm(false)
      setForm({ namaKelas: '', tingkat: 10, tahunAjaran: '2024/2025', guruId: '' })
      fetchData()
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-5 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Data Kelas</h1>
          <p className="text-slate-500 text-sm">{data.length} kelas terdaftar</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition">
          <Plus size={16} /> Tambah Kelas
        </button>
      </div>

      {/* Form tambah kelas */}
      {showForm && (
        <div className="card p-5 border-2 border-blue-100">
          <h2 className="font-semibold text-slate-700 mb-4">Tambah Kelas Baru</h2>
          <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Nama Kelas *</label>
              <input value={form.namaKelas} onChange={e => setForm(f => ({...f, namaKelas: e.target.value}))} required
                placeholder="X IPA 1"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Tingkat *</label>
              <select value={form.tingkat} onChange={e => setForm(f => ({...f, tingkat: Number(e.target.value)}))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value={10}>Kelas 10</option>
                <option value={11}>Kelas 11</option>
                <option value={12}>Kelas 12</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Tahun Ajaran *</label>
              <input value={form.tahunAjaran} onChange={e => setForm(f => ({...f, tahunAjaran: e.target.value}))} required
                placeholder="2024/2025"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="sm:col-span-2 flex gap-3 pt-2">
              <button type="button" onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition">
                Batal
              </button>
              <button type="submit" disabled={saving}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition flex items-center gap-2 disabled:opacity-60">
                {saving ? <><Loader2 size={14} className="animate-spin" /> Menyimpan...</> : 'Simpan'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Kelas grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({length: 6}).map((_, i) => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="h-5 bg-slate-100 rounded w-3/4 mb-3" />
              <div className="h-4 bg-slate-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : data.length === 0 ? (
        <div className="card p-10 text-center text-slate-400">
          <GraduationCap size={32} className="mx-auto mb-2 opacity-40" />
          <p>Belum ada kelas. Tambahkan kelas pertama.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map(k => (
            <div key={k.id} className="card p-5 hover:shadow-md transition">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-800">{k.namaKelas}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{k.tahunAjaran}</p>
                </div>
                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-lg">
                  Kelas {k.tingkat}
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-4 text-sm text-slate-600">
                <Users size={14} className="text-slate-400" />
                <span>{k._count.siswa} siswa</span>
              </div>
              {k.guru && (
                <p className="text-xs text-slate-400 mt-1">Wali: {k.guru.user.nama}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
