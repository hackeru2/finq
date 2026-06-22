// Maps country names as returned by randomuser.me to ISO 3166-1 alpha-2 codes.
// Covers ALL nationalities randomuser.me supports (active + legacy) so that
// saved users from before the &nat= filter still get a real flag.
// GB has regional variants — all map to the UK flag.
const COUNTRY_TO_ISO: Record<string, string> = {
  // Active &nat= filter set
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
  // Legacy nationalities (excluded from new fetches but may exist in saved data)
  India: 'IN',
  Iran: 'IR',
  Serbia: 'RS',
  Turkey: 'TR',
  'Türkiye': 'TR',
  Ukraine: 'UA',
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
