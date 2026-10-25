import type { Metadata } from 'next'
import AdminFrame from '@/components/admin/AdminFrame'
import './admin.css'

export const metadata: Metadata = {
  title: 'Quản trị - An Lạc Stone',
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminFrame>{children}</AdminFrame>
}
