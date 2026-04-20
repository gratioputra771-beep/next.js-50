// app/(dashboard)/layout.tsx
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import Navbar from '@/components/layout/Navbar'
import Sidebar from '@/components/layout/Sidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar — only for guru */}
      {session.user.role === 'GURU' || session.user.role === 'ADMIN' ? (
        <Sidebar role={session.user.role} />
      ) : null}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar user={session.user} />
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
