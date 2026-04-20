'use client'
// components/QRScanner.tsx

import { useEffect, useRef, useState } from 'react'
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode'
import { Camera, CameraOff } from 'lucide-react'

interface QRScannerProps {
  onScan: (token: string) => void
  isProcessing?: boolean
}

export default function QRScanner({ onScan, isProcessing = false }: QRScannerProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null)
  const [active, setActive] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const startScanner = () => {
    setError(null)
    setActive(true)

    const scanner = new Html5QrcodeScanner(
      'qr-reader',
      {
        fps: 10,
        qrbox: { width: 280, height: 280 },
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
        aspectRatio: 1.0,
      },
      false
    )

    scanner.render(
      (decodedText) => {
        // Extract token from URL or use raw value
        let token = decodedText
        try {
          const url = new URL(decodedText)
          const t = url.searchParams.get('token')
          if (t) token = t
        } catch {
          // Not a URL, use raw
        }
        onScan(token)
      },
      (err) => {
        // Suppress "No QR code found" errors
        if (!err.includes('No QR code found')) {
          console.warn('Scanner error:', err)
        }
      }
    )

    scannerRef.current = scanner
  }

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch(console.error)
      scannerRef.current = null
    }
    setActive(false)
  }

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error)
      }
    }
  }, [])

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Scanner viewport */}
      <div className="relative w-full max-w-sm">
        {active ? (
          <div className="relative rounded-2xl overflow-hidden border-2 border-blue-200 bg-black">
            <div id="qr-reader" className="w-full" />
            {/* Scan overlay */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 border-[3px] border-transparent rounded-2xl" />
              {/* Corner markers */}
              {['top-2 left-2', 'top-2 right-2', 'bottom-2 left-2', 'bottom-2 right-2'].map((pos, i) => (
                <div
                  key={i}
                  className={`absolute ${pos} w-6 h-6 border-blue-400`}
                  style={{
                    borderTopWidth: i < 2 ? 3 : 0,
                    borderBottomWidth: i >= 2 ? 3 : 0,
                    borderLeftWidth: i % 2 === 0 ? 3 : 0,
                    borderRightWidth: i % 2 === 1 ? 3 : 0,
                    borderRadius: 3,
                  }}
                />
              ))}
              {!isProcessing && (
                <div className="scan-line" style={{ top: 0 }} />
              )}
            </div>
            {isProcessing && (
              <div className="absolute inset-0 bg-blue-900/70 flex items-center justify-center rounded-2xl">
                <div className="text-center text-white">
                  <div className="w-10 h-10 border-3 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-sm font-medium">Memproses...</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="w-full aspect-square max-w-sm rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center gap-3">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center">
              <Camera size={28} className="text-slate-400" />
            </div>
            <p className="text-sm text-slate-500 text-center px-4">
              Klik tombol di bawah untuk mengaktifkan kamera
            </p>
          </div>
        )}

        {error && (
          <p className="mt-2 text-sm text-red-600 text-center">{error}</p>
        )}
      </div>

      {/* Toggle button */}
      <button
        onClick={active ? stopScanner : startScanner}
        disabled={isProcessing}
        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm transition shadow-lg
          ${active
            ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-200'
            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200'
          }
          disabled:opacity-60 disabled:cursor-not-allowed
        `}
      >
        {active ? (
          <><CameraOff size={18} /> Matikan Kamera</>
        ) : (
          <><Camera size={18} /> Aktifkan Kamera</>
        )}
      </button>
    </div>
  )
}
