'use client'
// components/KeteranganModal.tsx

import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import type { StatusAbsen } from '@/types'
import StatusBadge from './StatusBadge'

interface KeteranganModalProps {
  absensiId: string
  siswaName: string
  currentStatus: StatusAbsen
  currentKeterangan?: string | null
  onClose: () => void
  onSuccess: () => void
}

const statusOptions: StatusAbsen[] = ['HADIR', 'SAKIT', 'IZIN', 'ALFA', 'DISPENSASI']

export default function KeteranganModal({
  absensiId, siswaName, currentStatus, currentKeterangan, onClose, onSuccess
}: KeteranganModalProps) {
  const [status, setStatus] = useState<StatusAbsen>(currentStatus)
  const [keterangan, setKeterangan] = useState(currentKeterangan || '')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/absensi/keterangan', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ absensiId, status, keterangan }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success('Keterangan berhasil diperbarui')
      onSuccess()
      onClose()
    } catch (err: any) {
      toast.error(err.message || 'Gagal memperbarui keterangan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl fade-in">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div>
            <h3 className="font-semibold text-slate-800">Edit Keterangan Absensi</h3>
            <p className="text-sm text-slate-500 mt-0.5">{siswaName}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Status Kehadiran</label>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={`px-3 py-1.5 rounded-xl text-sm font-medium border transition
                    ${status === s ? 'ring-2 ring-offset-1 ring-blue-500' : 'opacity-60 hover:opacity-100'}
                  `}
                >
                  <StatusBadge status={s} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Keterangan <span className="text-slate-400 font-normal">(opsional)</span>
            </label>
            <textarea
              value={keterangan}
              onChange={e => setKeterangan(e.target.value)}
              rows={3}
              placeholder="Misal: Surat dokter terlampir, izin keperluan keluarga, dst..."
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 transition">
              Batal
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition flex items-center justify-center gap-2 disabled:opacity-60">
              {loading ? <><Loader2 size={16} className="animate-spin" /> Menyimpan...</> : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
