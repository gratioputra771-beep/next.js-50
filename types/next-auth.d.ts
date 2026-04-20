// types/next-auth.d.ts
import { DefaultSession, DefaultUser } from 'next-auth'
import { Role } from './index'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      nama: string
      email: string
      role: Role
      foto?: string | null
      siswaId?: string
      guruId?: string
    } & DefaultSession['user']
  }

  interface User extends DefaultUser {
    id: string
    nama: string
    role: Role
    foto?: string | null
    siswaId?: string
    guruId?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    nama: string
    role: Role
    foto?: string | null
    siswaId?: string
    guruId?: string
  }
}
