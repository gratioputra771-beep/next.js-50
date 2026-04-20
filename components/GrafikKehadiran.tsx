'use client'
// components/GrafikKehadiran.tsx

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts'

interface DataPoint {
  label: string
  hadir: number
  sakit: number
  izin: number
  alfa: number
}

interface GrafikKehadiranProps {
  data: DataPoint[]
  title?: string
}

export default function GrafikKehadiran({ data, title }: GrafikKehadiranProps) {
  return (
    <div className="card p-5">
      {title && <h3 className="font-semibold text-slate-700 mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#94a3b8' }} />
          <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} />
          <Tooltip
            contentStyle={{
              background: '#1e293b',
              border: 'none',
              borderRadius: 12,
              color: '#f8fafc',
              fontSize: 13,
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="hadir" name="Hadir" fill="#10b981" radius={[4,4,0,0]} />
          <Bar dataKey="sakit" name="Sakit" fill="#f59e0b" radius={[4,4,0,0]} />
          <Bar dataKey="izin" name="Izin" fill="#3b82f6" radius={[4,4,0,0]} />
          <Bar dataKey="alfa" name="Alfa" fill="#ef4444" radius={[4,4,0,0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
