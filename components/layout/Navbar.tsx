'use client'
// components/layout/Navbar.tsx

import { signOut } from 'next-auth/react'
import { LogOut, User, Bell } from 'lucide-react'
import type { SessionUser } from '@/types'

interface NavbarProps {
  user: SessionUser
}

export default function Navbar({ user }: NavbarProps) {
  return (
    <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <div className="text-sm text-slate-500">
          Selamat datang,{' '}
          <span className="font-semibold text-slate-800">{user.nama}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 transition">
          <Bell size={18} />
        </button>

        <div className="flex items-center gap-2 pl-2 border-l border-slate-100">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            {user.foto ? (
              <img src={user.foto} alt={user.nama} className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <User size={16} className="text-blue-600" />
            )}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-slate-800 leading-tight">{user.nama}</p>
            <p className="text-xs text-slate-500 leading-tight capitalize">{user.role.toLowerCase()}</p>
          </div>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="ml-1 w-9 h-9 flex items-center justify-center rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 transition"
          title="Keluar"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  )
}
