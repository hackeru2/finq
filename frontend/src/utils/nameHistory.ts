import { AppUser } from '../types'

/**
 * Returns true when a saved user's name was edited after being saved.
 * originalFirstName / originalLastName are only present on saved users (from DB).
 * Empty string means the user was saved before history tracking was added — treat as unknown.
 */
export function nameChanged(user: AppUser): boolean {
  return Boolean(
    user.originalFirstName &&
    (user.originalFirstName !== user.firstName || user.originalLastName !== user.lastName)
  )
}
