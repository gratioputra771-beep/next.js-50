// lib/utils.ts
import { type ClassValue, clsx } from 'clsx'
import { format, formatDistance } from 'date-fns'
import { id } from 'date-fns/locale'
import type { StatusAbsen } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return inputs.filter(Boolean).join(' ')
}

export function formatTanggal(date: Date | string, fmt = 'dd MMMM yyyy') {
  return format(new Date(date), fmt, { locale: id })
}

export function formatWaktu(date: Date | string) {
  return format(new Date(date), 'HH:mm', { locale: id })
}

export function formatRelative(date: Date | string) {
  return formatDistance(new Date(date), new Date(), { addSuffix: true, locale: id })
}

export function getNamaHari(date: Date | string) {
  return format(new Date(date), 'EEEE', { locale: id })
}

export function getStatusColor(status: StatusAbsen): string {
  const colors: Record<StatusAbsen, string> = {
    HADIR: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    SAKIT: 'bg-amber-100 text-amber-800 border-amber-200',
    IZIN: 'bg-blue-100 text-blue-800 border-blue-200',
    ALFA: 'bg-red-100 text-red-800 border-red-200',
    DISPENSASI: 'bg-purple-100 text-purple-800 border-purple-200',
  }
  return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200'
}

export function getStatusLabel(status: StatusAbsen): string {
  const labels: Record<StatusAbsen, string> = {
    HADIR: 'Hadir',
    SAKIT: 'Sakit',
    IZIN: 'Izin',
    ALFA: 'Alfa',
    DISPENSASI: 'Dispensasi',
  }
  return labels[status] || status
}

export function getStatusEmoji(status: StatusAbsen): string {
  const emojis: Record<StatusAbsen, string> = {
    HADIR: '✅',
    SAKIT: '🤒',
    IZIN: '📋',
    ALFA: '❌',
    DISPENSASI: '🏆',
  }
  return emojis[status] || '❓'
}

export function hitungPersentase(hadir: number, total: number): number {
  if (total === 0) return 0
  return Math.round((hadir / total) * 100)
}

export function getNamaBulan(bulan: number): string {
  const bulanList = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ]
  return bulanList[bulan - 1] || ''
}

export function generateCSV(data: Record<string, any>[], headers: string[]): string {
  const rows = data.map(row =>
    headers.map(h => JSON.stringify(row[h] ?? '')).join(',')
  )
  return [headers.join(','), ...rows].join('\n')
}
