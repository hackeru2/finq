import { AppUser } from '../types'

interface RUResult {
  login: { uuid: string }
  name: { title: string; first: string; last: string }
  gender: string
  location: {
    street: { number: number; name: string }
    city: string
    state: string
    country: string
  }
  email: string
  phone: string
  picture: { large: string; thumbnail: string }
  dob: { date: string; age: number }
}

// Restrict to Latin-script nationalities so names contain only letters the
// app can validate (Hebrew or English). Excluded: IR (Farsi/Arabic script),
// RS/UA (Cyrillic), IN (Devanagari/Tamil/…).
const NAT = 'au,br,ca,ch,de,dk,es,fi,fr,gb,ie,mx,nl,no,nz,us'

export async function fetchRandomUsers(count: number): Promise<AppUser[]> {
  const res = await fetch(`https://randomuser.me/api/?results=${count}&nat=${NAT}`)
  if (!res.ok) throw new Error('Failed to fetch random users')
  const data: { results: RUResult[] } = await res.json()
  return data.results.map((r) => ({
    id: r.login.uuid,
    title: r.name.title,
    firstName: r.name.first,
    lastName: r.name.last,
    gender: r.gender,
    country: r.location.country,
    city: r.location.city,
    state: r.location.state,
    streetName: r.location.street.name,
    streetNumber: r.location.street.number,
    email: r.email,
    phone: r.phone,
    pictureLarge: r.picture.large,
    pictureThumbnail: r.picture.thumbnail,
    age: r.dob.age,
    dob: r.dob.date,
  }))
}
