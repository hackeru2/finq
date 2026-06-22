// U+0590–U+05FF covers the full Hebrew Unicode block
const HEBREW = /[֐-׿]/
const LATIN = /[a-zA-Z]/

export function validateName(value: string): string | null {
  const text = value.trim()
  if (!text) return null
  if (/[0-9]/.test(text)) return 'Name must not contain numbers'
  if (HEBREW.test(text) && LATIN.test(text)) return 'Name must be Hebrew or English — not both'
  return null
}

export function getInputDir(value: string): 'ltr' | 'rtl' {
  return HEBREW.test(value) ? 'rtl' : 'ltr'
}
