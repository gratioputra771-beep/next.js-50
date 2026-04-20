'use client'
// app/(dashboard)/guru/scan/page.tsx

import { useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import { CheckCircle, AlertCircle, User, Clock } from 'lucide-react'
import QRScanner from '@/components/QRScanner'
import { formatWaktu } from '@/lib/utils'
import type { ScanResult } from '@/types'

interface ScanLog {
  id: string
  nama: string
  nis: string
  kelas: string
  status: string
  waktu: Date
  isDuplicate: boolean
}

export default function ScanPage() {
  const [processing, setProcessing] = useState(false)
  const [lastResult, setLastResult] = useState<ScanResult | null>(null)
  const [scanLog, setScanLog] = useState<ScanLog[]>([])

  const handleScan = useCallback(async (token: string) => {
    if (processing) return
    setProcessing(true)

    try {
      const res = await fetch('/api/absensi/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrToken: token }),
      })
      const data: ScanResult = await res.json()
      setLastResult(data)

      if (data.success) {
        toast.success(`✅ ${data.data?.siswa.nama} — Absensi tercatat!`)
        if (data.data) {
          setScanLog(prev => [{
            id: data.data!.absensi.id,
            nama: data.data!.siswa.nama,
            nis: data.data!.siswa.nis,
            kelas: data.data!.siswa.kelas,
            status: data.data!.absensi.status,
            waktu: new Date(),
            isDuplicate: false,
          }, ...prev.slice(0, 19)])
        }
      } else if ((data as any).data?.isDuplicate) {
        toast(`⚠️ ${(data as any).data.siswa.nama} sudah absen hari ini`, { icon: '⚠️' })
        const d = (data as any).data
        setScanLog(prev => [{
          id: Date.now().toString(),
          nama: d.siswa.nama,
          nis: d.siswa.nis,
          kelas: d.siswa.kelas,
          status: 'DUPLIKAT',
          waktu: new Date(),
          isDuplicate: true,
        }, ...prev.slice(0, 19)])
      } else {
        toast.error(data.error || 'QR Code tidak valid')
      }
    } catch {
      toast.error('Gagal memproses QR Code')
    } finally {
      // Add small delay before allowing next scan
      setTimeout(() => setProcessing(false), 1500)
    }
  }, [processing])

  return (
    <div className="space-y-6 fade-in max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Scan QR Code</h1>
        <p className="text-slate-500 text-sm mt-0.5">Arahkan kamera ke QR Code siswa untuk mencatat absensi</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Scanner */}
        <div className="card p-6">
          <h2 className="font-semibold text-slate-700 mb-4">Kamera Scan</h2>
          <QRScanner onScan={handleScan} isProcessing={processing} />
        </div>

        {/* Result + Konfirmasi */}
        <div className="space-y-4">
          {/* Hasil scan terakhir */}
          {lastResult && (lastResult.success || (lastResult as any).data) && (
            <div className={`card p-5 border-2 ${
              lastResult.success
                ? 'border-emerald-200 bg-emerald-50'
                : 'border-amber-200 bg-amber-50'
            }`}>
              <div className="flex items-start gap-3">
                {lastResult.success
                  ? <CheckCircle className="text-emerald-600 mt-0.5 shrink-0" size={20} />
                  : <AlertCircle className="text-amber-600 mt-0.5 shrink-0" size={20} />
                }
                <div>
                  <p className={`font-semibold text-sm ${lastResult.success ? 'text-emerald-800' : 'text-amber-800'}`}>
                    {lastResult.success ? 'Absensi Berhasil' : 'Sudah Absen Hari Ini'}
                  </p>
                  {lastResult.data && (
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-slate-200">
                          {lastResult.data.siswa.foto
                            ? <img src={lastResult.data.siswa.foto} className="w-10 h-10 rounded-full object-cover" alt="" />
                            : <User size={20} className="text-slate-400" />
                          }
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{lastResult.data.siswa.nama}</p>
                          <p className="text-xs text-slate-500">NIS: {lastResult.data.siswa.nis} — {lastResult.data.siswa.kelas}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                        <Clock size={12} />
                        <span>{formatWaktu(new Date())}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Log scan hari ini */}
          <div className="card p-5">
            <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
              Log Scan
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{scanLog.length}</span>
            </h3>
            {scanLog.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6">Belum ada scan di sesi ini</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {scanLog.map((log, i) => (
                  <div key={`${log.id}-${i}`} className={`flex items-center justify-between p-2.5 rounded-xl text-sm
                    ${log.isDuplicate ? 'bg-amber-50' : 'bg-emerald-50'}`}>
                    <div>
                      <p className="font-medium text-slate-700">{log.nama}</p>
                      <p className="text-xs text-slate-400">{log.nis} — {log.kelas}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`badge text-xs ${
                        log.isDuplicate
                          ? 'bg-amber-100 text-amber-700 border-amber-200'
                          : 'bg-emerald-100 text-emerald-700 border-emerald-200'
                      }`}>
                        {log.isDuplicate ? 'Duplikat' : log.status}
                      </span>
                      <p className="text-xs text-slate-400 mt-0.5">{formatWaktu(log.waktu)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
