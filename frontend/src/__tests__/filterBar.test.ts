import { describe, it, expect } from 'vitest'
import { isFilterActive, activeFilterCount, DEFAULT_FILTER, FilterState } from '../components/FilterBar'

const def = DEFAULT_FILTER

describe('isFilterActive', () => {
  it('returns false for the default state', () => {
    expect(isFilterActive(def)).toBe(false)
  })

  it('returns false when only text is set (text lives outside the modal)', () => {
    expect(isFilterActive({ ...def, text: 'John' })).toBe(false)
  })

  it('returns true when gender is not "all"', () => {
    expect(isFilterActive({ ...def, gender: 'male' })).toBe(true)
    expect(isFilterActive({ ...def, gender: 'female' })).toBe(true)
  })

  it('returns true when age min is raised', () => {
    expect(isFilterActive({ ...def, ageRange: [30, 100] })).toBe(true)
  })

  it('returns true when age max is lowered', () => {
    expect(isFilterActive({ ...def, ageRange: [0, 60] })).toBe(true)
  })

  it('returns true when both age bounds are changed', () => {
    expect(isFilterActive({ ...def, ageRange: [20, 50] })).toBe(true)
  })

  it('returns true when a country is selected', () => {
    expect(isFilterActive({ ...def, country: ['Germany'] })).toBe(true)
  })

  it('returns true when multiple countries are selected', () => {
    expect(isFilterActive({ ...def, country: ['Germany', 'France'] })).toBe(true)
  })

  it('returns true when all three modal filters are active', () => {
    expect(isFilterActive({ ...def, gender: 'female', ageRange: [25, 40], country: ['France'] })).toBe(true)
  })
})

describe('activeFilterCount', () => {
  it('returns 0 for the default state', () => {
    expect(activeFilterCount(def)).toBe(0)
  })

  it('does not count the text field', () => {
    expect(activeFilterCount({ ...def, text: 'John' })).toBe(0)
  })

  it('counts gender as 1', () => {
    expect(activeFilterCount({ ...def, gender: 'male' })).toBe(1)
  })

  it('counts an age range change as 1 regardless of how many bounds moved', () => {
    expect(activeFilterCount({ ...def, ageRange: [0, 50] })).toBe(1)
    expect(activeFilterCount({ ...def, ageRange: [20, 100] })).toBe(1)
    expect(activeFilterCount({ ...def, ageRange: [20, 50] })).toBe(1)
  })

  it('counts country as 1 whether one or many are selected', () => {
    expect(activeFilterCount({ ...def, country: ['Spain'] })).toBe(1)
    expect(activeFilterCount({ ...def, country: ['Spain', 'France'] })).toBe(1)
  })

  it('returns 3 when all three modal filters are active', () => {
    const f: FilterState = { text: 'x', gender: 'female', ageRange: [18, 40], country: ['France', 'Germany'] }
    expect(activeFilterCount(f)).toBe(3)
  })
})
