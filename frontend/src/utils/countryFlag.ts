// Maps country names as returned by randomuser.me to ISO 3166-1 alpha-2 codes.
// Only covers the nationalities we actually request (&nat= filter in randomUser.ts).
// GB has regional variants — all map to the UK flag.
const COUNTRY_TO_ISO: Record<string, string> = {
  Australia: 'AU',
  Brazil: 'BR',
  Canada: 'CA',
  Switzerland: 'CH',
  Germany: 'DE',
  Denmark: 'DK',
  Spain: 'ES',
  Finland: 'FI',
  France: 'FR',
  'United Kingdom': 'GB',
  England: 'GB',
  Scotland: 'GB',
  Wales: 'GB',
  'Northern Ireland': 'GB',
  Ireland: 'IE',
  Mexico: 'MX',
  Netherlands: 'NL',
  Norway: 'NO',
  'New Zealand': 'NZ',
  'United States': 'US',
}

function isoToFlag(code: string): string {
  return code
    .toUpperCase()
    .split('')
    .map((c) => String.fromCodePoint(c.charCodeAt(0) - 65 + 127462))
    .join('')
}

/** Returns a flag emoji for a country name, or 🌍 if unknown. */
export function countryFlag(countryName: string): string {
  const iso = COUNTRY_TO_ISO[countryName]
  return iso ? isoToFlag(iso) : '🌍'
}
