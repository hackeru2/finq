import { create } from 'zustand'
import { AppUser } from '../types'
import { fetchRandomUsers } from '../api/randomUser'
import * as api from '../api/backend'

interface State {
  randomUsers: AppUser[]
  savedUsers: AppUser[]
  loadingRandom: boolean
  loadingSaved: boolean
  errorRandom: string | null
  errorSaved: string | null

  fetchRandom: () => Promise<void>
  fetchSaved: () => Promise<void>
  saveUser: (user: AppUser) => Promise<void>
  deleteUser: (id: string) => Promise<void>
  updateRandom: (id: string, firstName: string, lastName: string) => void
  updateSaved: (id: string, firstName: string, lastName: string) => Promise<void>
}

export const useStore = create<State>((set, get) => ({
  randomUsers: [],
  savedUsers: [],
  loadingRandom: false,
  loadingSaved: false,
  errorRandom: null,
  errorSaved: null,

  fetchRandom: async () => {
    set({ loadingRandom: true, errorRandom: null })
    try {
      const users = await fetchRandomUsers(10)
      set({ randomUsers: users })
    } catch {
      set({ errorRandom: 'Failed to fetch users. Check your connection.' })
    } finally {
      set({ loadingRandom: false })
    }
  },

  fetchSaved: async () => {
    set({ loadingSaved: true, errorSaved: null })
    try {
      const users = await api.getUsers()
      set({ savedUsers: users })
    } catch {
      set({ errorSaved: 'Failed to load saved profiles.' })
    } finally {
      set({ loadingSaved: false })
    }
  },

  saveUser: async (user: AppUser) => {
    await api.saveUser(user)
    set((s) => ({ savedUsers: [user, ...s.savedUsers] }))
  },

  deleteUser: async (id: string) => {
    await api.deleteUser(id)
    set((s) => ({ savedUsers: s.savedUsers.filter((u) => u.id !== id) }))
  },

  updateRandom: (id, firstName, lastName) =>
    set((s) => ({
      randomUsers: s.randomUsers.map((u) =>
        u.id === id ? { ...u, firstName, lastName } : u
      ),
    })),

  updateSaved: async (id, firstName, lastName) => {
    await api.updateUser(id, firstName, lastName)
    set((s) => ({
      savedUsers: s.savedUsers.map((u) =>
        u.id === id ? { ...u, firstName, lastName } : u
      ),
    }))
  },
}))
