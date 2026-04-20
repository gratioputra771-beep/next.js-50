'use client'
// app/(dashboard)/guru/pengaturan/page.tsx

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import toast from 'react-hot-toast'
import { Loader2, User, Lock, Info } from 'lucide-react'

export default function PengaturanPage() {
  const { data: session } = useSession()
  const [loadingPw, setLoadingPw] = useState(false)
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' })

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwords.new !== passwords.confirm) {
      toast.error('Password baru tidak cocok')
      return
    }
    if (passwords.new.length < 6) {
      toast.error('Password minimal 6 karakter')
      return
    }
    setLoadingPw(true)
    // Simulate — in real implementation, call /api/user/change-password
    await new Promise(r => setTimeout(r, 1000))
    toast.success('Password berhasil diubah')
    setPasswords({ current: '', new: '', confirm: '' })
    setLoadingPw(false)
  }

  return (
    <div className="max-w-lg space-y-6 fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Pengaturan Akun</h1>
        <p className="text-slate-500 text-sm">Kelola informasi dan keamanan akun Anda</p>
      </div>

      {/* Profil info */}
      <div className="card p-5">
        <div className="flex items-center gap-3 mb-4">
          <User size={18} className="text-blue-600" />
          <h2 className="font-semibold text-slate-700">Informasi Akun</h2>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b border-slate-50">
            <span className="text-sm text-slate-500">Nama</span>
            <span className="text-sm font-medium text-slate-800">{session?.user.nama}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-50">
            <span className="text-sm text-slate-500">Email</span>
            <span className="text-sm text-slate-800">{session?.user.email}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-sm text-slate-500">Role</span>
            <span className="text-sm font-medium text-blue-600 capitalize">{session?.user.role?.toLowerCase()}</span>
          </div>
        </div>
      </div>

      {/* Change password */}
      <div className="card p-5">
        <div className="flex items-center gap-3 mb-4">
          <Lock size={18} className="text-blue-600" />
          <h2 className="font-semibold text-slate-700">Ganti Password</h2>
        </div>
        <form onSubmit={handleChangePassword} className="space-y-3">
          {[
            { name: 'current', label: 'Password Saat Ini' },
            { name: 'new', label: 'Password Baru' },
            { name: 'confirm', label: 'Konfirmasi Password Baru' },
          ].map(f => (
            <div key={f.name}>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">{f.label}</label>
              <input
                type="password"
                value={passwords[f.name as keyof typeof passwords]}
                onChange={e => setPasswords(p => ({...p, [f.name]: e.target.value}))}
                required
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}
          <button type="submit" disabled={loadingPw}
            className="w-full mt-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition flex items-center justify-center gap-2 disabled:opacity-60">
            {loadingPw ? <><Loader2 size={15} className="animate-spin" /> Mengubah...</> : 'Ganti Password'}
          </button>
        </form>
      </div>

      {/* App info */}
      <div className="card p-5 bg-slate-50">
        <div className="flex items-center gap-3 mb-3">
          <Info size={16} className="text-slate-400" />
          <span className="text-sm font-medium text-slate-600">Informasi Aplikasi</span>
        </div>
        <div className="space-y-1 text-xs text-slate-500">
          <p>QR Attendance v1.0.0</p>
          <p>Sistem Absensi Digital Berbasis QR Code</p>
          <p>© 2024 — Dikembangkan untuk sekolah Indonesia</p>
        </div>
      </div>
    </div>
  )
}
