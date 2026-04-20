// app/(dashboard)/siswa/profil/page.tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { formatTanggal } from '@/lib/utils'
import { User, Mail, BookOpen, Calendar, Phone, MapPin } from 'lucide-react'

export default async function ProfilPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'SISWA') redirect('/login')

  const siswa = await prisma.siswa.findUnique({
    where: { userId: session.user.id },
    include: {
      user: { select: { nama: true, email: true, foto: true } },
      kelas: { select: { namaKelas: true, tingkat: true, tahunAjaran: true } },
    },
  })
  if (!siswa) redirect('/login')

  const fields = [
    { icon: User, label: 'NIS', value: siswa.nis },
    { icon: User, label: 'NISN', value: siswa.nisn || '—' },
    { icon: Mail, label: 'Email', value: siswa.user.email },
    { icon: BookOpen, label: 'Kelas', value: `${siswa.kelas.namaKelas} (${siswa.kelas.tahunAjaran})` },
    { icon: User, label: 'Jenis Kelamin', value: siswa.jenisKelamin === 'LAKI_LAKI' ? 'Laki-laki' : siswa.jenisKelamin === 'PEREMPUAN' ? 'Perempuan' : '—' },
    { icon: Calendar, label: 'Tanggal Lahir', value: siswa.tanggalLahir ? formatTanggal(siswa.tanggalLahir) : '—' },
    { icon: Phone, label: 'HP Orang Tua', value: siswa.noHpOrtu || '—' },
    { icon: MapPin, label: 'Alamat', value: siswa.alamat || '—' },
  ]

  return (
    <div className="max-w-lg mx-auto space-y-5 fade-in">
      <h1 className="text-2xl font-bold text-slate-800">Profil Saya</h1>

      {/* Avatar */}
      <div className="card p-6 flex flex-col items-center text-center">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-3">
          {siswa.user.foto ? (
            <img src={siswa.user.foto} className="w-20 h-20 rounded-full object-cover" alt="Foto profil" />
          ) : (
            <User size={36} className="text-blue-500" />
          )}
        </div>
        <h2 className="text-xl font-bold text-slate-800">{siswa.user.nama}</h2>
        <p className="text-sm text-slate-500">{siswa.kelas.namaKelas}</p>
      </div>

      {/* Detail */}
      <div className="card divide-y divide-slate-50">
        {fields.map(f => {
          const Icon = f.icon
          return (
            <div key={f.label} className="flex items-start gap-3 px-5 py-3.5">
              <Icon size={16} className="text-slate-400 mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-400">{f.label}</p>
                <p className="text-sm font-medium text-slate-700 mt-0.5 break-words">{f.value}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
