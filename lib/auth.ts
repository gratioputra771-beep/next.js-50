// lib/auth.ts
import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email dan password wajib diisi')
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: {
            siswa: true,
            guru: true,
          },
        })

        if (!user) {
          throw new Error('Email atau password salah')
        }

        if (!user.aktif) {
          throw new Error('Akun ini telah dinonaktifkan')
        }

        const isValidPassword = await bcrypt.compare(credentials.password, user.password)
        if (!isValidPassword) {
          throw new Error('Email atau password salah')
        }

        return {
          id: user.id,
          nama: user.nama,
          email: user.email,
          role: user.role,
          foto: user.foto,
          siswaId: user.siswa?.id,
          guruId: user.guru?.id,
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 hari
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.nama = (user as any).nama
        token.role = (user as any).role
        token.foto = (user as any).foto
        token.siswaId = (user as any).siswaId
        token.guruId = (user as any).guruId
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.nama = token.nama as string
        session.user.role = token.role as any
        session.user.foto = token.foto as string | null
        session.user.siswaId = token.siswaId as string | undefined
        session.user.guruId = token.guruId as string | undefined
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
}
