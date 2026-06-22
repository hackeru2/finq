import { AppUser } from '../types'
import { FilterState } from '../components/FilterBar'

export function filterUsers(users: AppUser[], filter: FilterState): AppUser[] {
  const q = filter.text.toLowerCase()
  return users.filter((u) =>
    `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) &&
    (filter.gender === 'all' || u.gender === filter.gender) &&
    u.age >= filter.ageRange[0] && u.age <= filter.ageRange[1] &&
    (filter.country.length === 0 || filter.country.includes(u.country))
  )
}
