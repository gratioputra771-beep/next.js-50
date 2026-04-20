'use client'
// app/(dashboard)/guru/siswa/page.tsx

import { useState, useEffect } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { Search, Plus, RefreshCw, Trash2, Eye } from 'lucide-react'
import ConfirmDialog from '@/components/ConfirmDialog'

interface SiswaItem {
  id: string
  nis: string
  qrToken: string
  user: { nama: string; email: string; aktif: boolean }
  kelas: { namaKelas: string }
}

export default function SiswaListPage() {
  const [data, setData] = useState<SiswaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [confirm, setConfirm] = useState<{ type: 'delete' | 'resetqr'; siswa: SiswaItem } | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/siswa${search ? `?search=${search}` : ''}`)
      const json = await res.json()
      if (json.success) setData(json.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchData()
  }

  const handleDelete = async () => {
    if (!confirm || confirm.type !== 'delete') return
    setActionLoading(true)
    try {
      const res = await fetch(`/api/siswa/${confirm.siswa.id}`, { method: 'DELETE' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      toast.success('Siswa berhasil dinonaktifkan')
      setConfirm(null)
      fetchData()
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setActionLoading(false)
    }
  }

  const handleResetQR = async () => {
    if (!confirm || confirm.type !== 'resetqr') return
    setActionLoading(true)
    try {
      const res = await fetch('/api/qrcode/regenerate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siswaId: confirm.siswa.id }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      toast.success('QR Code berhasil direset')
      setConfirm(null)
      fetchData()
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="space-y-5 fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Data Siswa</h1>
          <p className="text-slate-500 text-sm">{data.length} siswa aktif</p>
        </div>
        <Link href="/guru/siswa/tambah"
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition">
          <Plus size={16} /> Tambah Siswa
        </Link>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama atau NIS..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button type="submit" className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition">
          Cari
        </button>
      </form>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left px-4 py-3 text-slate-500 font-medium">Siswa</th>
                <th className="text-left px-4 py-3 text-slate-500 font-medium">NIS</th>
                <th className="text-left px-4 py-3 text-slate-500 font-medium">Kelas</th>
                <th className="text-left px-4 py-3 text-slate-500 font-medium">Email</th>
                <th className="text-right px-4 py-3 text-slate-500 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 bg-slate-100 rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : data.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-10 text-slate-400">Tidak ada data siswa</td></tr>
              ) : data.map(s => (
                <tr key={s.id} className="hover:bg-slate-50/50 transition">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center text-xs font-bold text-blue-600">
                        {s.user.nama.charAt(0)}
                      </div>
                      <span className="font-medium text-slate-800">{s.user.nama}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600 font-mono text-xs">{s.nis}</td>
                  <td className="px-4 py-3 text-slate-600">{s.kelas.namaKelas}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{s.user.email}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/guru/siswa/${s.id}`}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Lihat detail">
                        <Eye size={15} />
                      </Link>
                      <button
                        onClick={() => setConfirm({ type: 'resetqr', siswa: s })}
                        className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition" title="Reset QR Code">
                        <RefreshCw size={15} />
                      </button>
                      <button
                        onClick={() => setConfirm({ type: 'delete', siswa: s })}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Nonaktifkan">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {confirm && (
        <ConfirmDialog
          title={confirm.type === 'delete' ? 'Nonaktifkan Siswa?' : 'Reset QR Code?'}
          message={confirm.type === 'delete'
            ? `Siswa "${confirm.siswa.user.nama}" akan dinonaktifkan. Data absensi tetap tersimpan.`
            : `QR Code "${confirm.siswa.user.nama}" akan direset. QR lama tidak bisa digunakan lagi.`
          }
          variant={confirm.type === 'delete' ? 'danger' : 'warning'}
          confirmLabel={confirm.type === 'delete' ? 'Nonaktifkan' : 'Reset QR'}
          loading={actionLoading}
          onConfirm={confirm.type === 'delete' ? handleDelete : handleResetQR}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  )
}
