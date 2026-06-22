import { describe, it, expect } from 'vitest'
import { nameChanged } from '../utils/nameHistory'
import { AppUser } from '../types'

const base: AppUser = {
  id: '1', title: 'Mr', firstName: 'John', lastName: 'Smith',
  gender: 'male', country: 'US', city: 'NYC', state: 'NY',
  streetName: 'Main St', streetNumber: 1, email: 'a@b.com', phone: '123',
  pictureLarge: '', pictureThumbnail: '', age: 30, dob: '1994-01-01',
}

describe('nameChanged', () => {
  it('returns false when originalFirstName is absent (random user)', () => {
    expect(nameChanged({ ...base })).toBe(false)
  })

  it('returns false when originalFirstName is empty string (pre-migration row)', () => {
    expect(nameChanged({ ...base, originalFirstName: '', originalLastName: '' })).toBe(false)
  })

  it('returns false when originals match current names', () => {
    expect(nameChanged({ ...base, originalFirstName: 'John', originalLastName: 'Smith' })).toBe(false)
  })

  it('returns true when firstName changed', () => {
    expect(nameChanged({ ...base, firstName: 'Jane', originalFirstName: 'John', originalLastName: 'Smith' })).toBe(true)
  })

  it('returns true when lastName changed', () => {
    expect(nameChanged({ ...base, lastName: 'Doe', originalFirstName: 'John', originalLastName: 'Smith' })).toBe(true)
  })

  it('returns true when both names changed', () => {
    expect(nameChanged({ ...base, firstName: 'Jane', lastName: 'Doe', originalFirstName: 'John', originalLastName: 'Smith' })).toBe(true)
  })

  it('returns true when name changed to Hebrew', () => {
    expect(nameChanged({ ...base, firstName: 'יוחנן', originalFirstName: 'John', originalLastName: 'Smith' })).toBe(true)
  })
})
