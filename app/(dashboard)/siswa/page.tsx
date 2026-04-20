// app/(dashboard)/siswa/page.tsx
import { redirect } from 'next/navigation'

export default function SiswaDashboard() {
  redirect('/siswa/qrcode')
}
