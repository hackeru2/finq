export interface AppUser {
  id: string
  title: string
  firstName: string
  lastName: string
  gender: string
  country: string
  city: string
  state: string
  streetName: string
  streetNumber: number
  email: string
  phone: string
  pictureLarge: string
  pictureThumbnail: string
  age: number
  dob: string
}

export type UserSource = 'random' | 'saved'
