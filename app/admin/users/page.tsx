import { UsersClient } from './users-client'

export const metadata = {
  title: 'User Management | Everloop Admin',
  description: 'Manage user accounts in Everloop',
}

export default function AdminUsersPage() {
  return <UsersClient />
}
