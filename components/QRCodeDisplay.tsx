'use client'
// components/QRCodeDisplay.tsx

import { QRCodeSVG } from 'qrcode.react'
import { Download, RefreshCw } from 'lucide-react'
import { APP_URL } from '@/lib/constants'

interface QRCodeDisplayProps {
  token: string
  siswaName: string
  nis: string
  kelas?: string
}

export default function QRCodeDisplay({ token, siswaName, nis, kelas }: QRCodeDisplayProps) {
  const qrValue = `${APP_URL}/api/absensi/scan?token=${token}`

  const handleDownload = () => {
    const svg = document.querySelector('#qr-svg svg') as SVGElement
    if (!svg) return
    const svgData = new XMLSerializer().serializeToString(svg)
    const blob = new Blob([svgData], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `qr-${nis}.svg`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {/* QR Card */}
      <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 qr-pulse">
        {/* Header */}
        <div className="text-center mb-5">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">QR Absensi</div>
          <div className="font-bold text-slate-800 text-lg">{siswaName}</div>
          <div className="text-sm text-slate-500">NIS: {nis}</div>
          {kelas && <div className="text-xs text-blue-600 font-medium mt-0.5">{kelas}</div>}
        </div>

        {/* QR Code */}
        <div id="qr-svg" className="flex items-center justify-center p-3 bg-white rounded-2xl border-2 border-slate-100">
          <QRCodeSVG
            value={qrValue}
            size={220}
            level="H"
            includeMargin={false}
            fgColor="#0f172a"
            bgColor="#ffffff"
            imageSettings={{
              src: '/favicon.ico',
              height: 32,
              width: 32,
              excavate: true,
            }}
          />
        </div>

        {/* Footer */}
        <div className="text-center mt-4">
          <p className="text-xs text-slate-400">Tunjukkan QR ini ke guru saat masuk kelas</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition shadow-lg shadow-blue-200"
        >
          <Download size={16} />
          Unduh QR
        </button>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-xl transition"
        >
          Cetak
        </button>
      </div>
    </div>
  )
}
