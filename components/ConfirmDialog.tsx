'use client'
// components/ConfirmDialog.tsx

import { AlertTriangle, X, Loader2 } from 'lucide-react'

interface ConfirmDialogProps {
  title: string
  message: string
  confirmLabel?: string
  variant?: 'danger' | 'warning'
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({
  title, message, confirmLabel = 'Konfirmasi', variant = 'danger',
  loading = false, onConfirm, onCancel
}: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl fade-in">
        <div className="p-6">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4
            ${variant === 'danger' ? 'bg-red-50' : 'bg-amber-50'}`}>
            <AlertTriangle size={24} className={variant === 'danger' ? 'text-red-500' : 'text-amber-500'} />
          </div>
          <h3 className="font-semibold text-slate-800 text-lg">{title}</h3>
          <p className="text-sm text-slate-600 mt-2">{message}</p>
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <button onClick={onCancel}
            className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 transition">
            Batal
          </button>
          <button onClick={onConfirm} disabled={loading}
            className={`flex-1 px-4 py-2.5 text-white rounded-xl text-sm font-medium transition flex items-center justify-center gap-2 disabled:opacity-60
              ${variant === 'danger' ? 'bg-red-500 hover:bg-red-600' : 'bg-amber-500 hover:bg-amber-600'}`}>
            {loading ? <><Loader2 size={16} className="animate-spin" /> Memproses...</> : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
