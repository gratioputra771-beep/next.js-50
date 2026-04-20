'use client'
// app/(dashboard)/guru/siswa/tambah/page.tsx

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface Kelas { id: string; namaKelas: string; tingkat: number }

export default function TambahSiswaPage() {
  const router = useRouter()
  const [kelasList, setKelasList] = useState<Kelas[]>([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    nama: '', email: '', password: 'siswa123', nis: '', nisn: '',
    kelasId: '', jenisKelamin: '', tanggalLahir: '',
    noHpOrtu: '', emailOrtu: '', alamat: '',
  })

  useEffect(() => {
    fetch('/api/kelas').then(r => r.json()).then(d => {
      if (d.success) setKelasList(d.data)
    })
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/siswa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      toast.success('Siswa berhasil ditambahkan!')
      router.push('/guru/siswa')
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-6 fade-in">
      <div className="flex items-center gap-3">
        <Link href="/guru/siswa" className="p-2 hover:bg-slate-100 rounded-xl transition">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Tambah Siswa</h1>
          <p className="text-slate-500 text-sm">Daftarkan siswa baru ke sistem</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Informasi Akun */}
        <div className="card p-5 space-y-4">
          <h2 className="font-semibold text-slate-700 border-b border-slate-100 pb-3">Informasi Akun</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Nama Lengkap *</label>
              <input name="nama" value={form.nama} onChange={handleChange} required
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ahmad Fauzi" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email *</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} required
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="ahmad@sekolah.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password *</label>
              <input name="password" value={form.password} onChange={handleChange} required
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <p className="text-xs text-slate-400 mt-1">Default: siswa123 (siswa wajib ganti)</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">NIS *</label>
              <input name="nis" value={form.nis} onChange={handleChange} required
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="2024001" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">NISN</label>
              <input name="nisn" value={form.nisn} onChange={handleChange}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0012345678" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Kelas *</label>
              <select name="kelasId" value={form.kelasId} onChange={handleChange} required
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">-- Pilih Kelas --</option>
                {kelasList.map(k => (
                  <option key={k.id} value={k.id}>{k.namaKelas}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Informasi Pribadi */}
        <div className="card p-5 space-y-4">
          <h2 className="font-semibold text-slate-700 border-b border-slate-100 pb-3">Informasi Pribadi</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Jenis Kelamin</label>
              <select name="jenisKelamin" value={form.jenisKelamin} onChange={handleChange}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">-- Pilih --</option>
                <option value="LAKI_LAKI">Laki-laki</option>
                <option value="PEREMPUAN">Perempuan</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Tanggal Lahir</label>
              <input name="tanggalLahir" type="date" value={form.tanggalLahir} onChange={handleChange}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">No. HP Orang Tua</label>
              <input name="noHpOrtu" value={form.noHpOrtu} onChange={handleChange}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="08123456789" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Orang Tua</label>
              <input name="emailOrtu" type="email" value={form.emailOrtu} onChange={handleChange}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Alamat</label>
              <textarea name="alamat" value={form.alamat} onChange={handleChange} rows={2}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Jl. Melati No. 10, Kota" />
            </div>
          </div>
        </div>

        {/* Tombol */}
        <div className="flex gap-3">
          <Link href="/guru/siswa"
            className="flex-1 text-center px-4 py-2.5 border border-slate-200 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 transition">
            Batal
          </Link>
          <button type="submit" disabled={loading}
            className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition flex items-center justify-center gap-2 disabled:opacity-60">
            {loading ? <><Loader2 size={16} className="animate-spin" /> Menyimpan...</> : 'Simpan Siswa'}
          </button>
        </div>
      </form>
    </div>
  )
}
