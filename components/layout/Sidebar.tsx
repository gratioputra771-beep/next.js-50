'use client'
// components/layout/Sidebar.tsx

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  QrCode, LayoutDashboard, ClipboardList, BarChart2,
  Users, BookOpen, Settings, ChevronLeft, ChevronRight, GraduationCap
} from 'lucide-react'
import type { Role } from '@/types'

interface SidebarProps {
  role: Role
}

const guruMenus = [
  { href: '/guru', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/guru/scan', label: 'Scan QR Code', icon: QrCode },
  { href: '/guru/absensi', label: 'Absensi Hari Ini', icon: ClipboardList },
  { href: '/guru/keterangan', label: 'Input Keterangan', icon: BookOpen },
  { href: '/guru/rekap/bulanan', label: 'Rekap Bulanan', icon: BarChart2 },
  { href: '/guru/rekap/tahunan', label: 'Rekap Tahunan', icon: BarChart2 },
  { href: '/guru/siswa', label: 'Data Siswa', icon: Users },
  { href: '/guru/kelas', label: 'Data Kelas', icon: GraduationCap },
  { href: '/guru/pengaturan', label: 'Pengaturan', icon: Settings },
]

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const menus = guruMenus

  return (
    <aside
      className={`
        relative flex flex-col bg-slate-900 text-white transition-all duration-300 ease-in-out
        ${collapsed ? 'w-16' : 'w-60'}
        hidden md:flex shrink-0
      `}
    >
      {/* Logo */}
      <div className={`h-16 flex items-center border-b border-slate-800 ${collapsed ? 'justify-center px-0' : 'px-5'}`}>
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
            <QrCode size={16} />
          </div>
          {!collapsed && (
            <span className="font-bold text-sm whitespace-nowrap">QR Attendance</span>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {menus.map(menu => {
          const active = menu.exact ? pathname === menu.href : pathname.startsWith(menu.href)
          const Icon = menu.icon
          return (
            <Link
              key={menu.href}
              href={menu.href}
              title={collapsed ? menu.label : undefined}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition
                ${active
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }
                ${collapsed ? 'justify-center' : ''}
              `}
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && <span className="truncate">{menu.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition z-10"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  )
}
