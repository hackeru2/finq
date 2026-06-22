import { describe, it, expect } from 'vitest'
import { validateName, getInputDir } from '../utils/nameValidation'

describe('validateName', () => {
  it('returns null for empty string', () => {
    expect(validateName('')).toBeNull()
  })

  it('returns null for whitespace only', () => {
    expect(validateName('   ')).toBeNull()
  })

  it('returns null for a valid English name', () => {
    expect(validateName('John')).toBeNull()
  })

  it('returns null for a valid English name with space', () => {
    expect(validateName('John Smith')).toBeNull()
  })

  it('returns null for a valid Hebrew name', () => {
    expect(validateName('דוד')).toBeNull()
  })

  it('returns null for a valid Hebrew name with space', () => {
    expect(validateName('דוד לוי')).toBeNull()
  })

  it('rejects a name that contains a digit', () => {
    expect(validateName('John1')).toMatch(/number/i)
  })

  it('rejects a name that is only digits', () => {
    expect(validateName('123')).toMatch(/number/i)
  })

  it('rejects a digit embedded in a Hebrew name', () => {
    expect(validateName('דוד2')).toMatch(/number/i)
  })

  it('rejects mixing Hebrew and English characters', () => {
    expect(validateName('דוד Smith')).toMatch(/Hebrew or English/i)
  })

  it('rejects mixing English prefix with Hebrew', () => {
    expect(validateName('A דוד')).toMatch(/Hebrew or English/i)
  })
})

describe('getInputDir', () => {
  it('returns ltr for an English name', () => {
    expect(getInputDir('John')).toBe('ltr')
  })

  it('returns ltr for an empty string', () => {
    expect(getInputDir('')).toBe('ltr')
  })

  it('returns ltr for digits only', () => {
    expect(getInputDir('123')).toBe('ltr')
  })

  it('returns rtl for a Hebrew name', () => {
    expect(getInputDir('דוד')).toBe('rtl')
  })

  it('returns rtl when any Hebrew character is present', () => {
    expect(getInputDir('John ד')).toBe('rtl')
  })
})
