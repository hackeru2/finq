import { AppUser } from '../types'

const BASE = '/api'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, init)
  if (res.status === 204) return undefined as T
  const body = await res.json()
  if (!res.ok) throw new Error(body?.error ?? 'Request failed')
  return body as T
}

export const getUsers = (): Promise<AppUser[]> => request('/users')

export const saveUser = (user: AppUser): Promise<AppUser> =>
  request('/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user),
  })

export const updateUser = (id: string, firstName: string, lastName: string): Promise<AppUser> =>
  request(`/users/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ firstName, lastName }),
  })

export const deleteUser = (id: string): Promise<void> =>
  request(`/users/${id}`, { method: 'DELETE' })
