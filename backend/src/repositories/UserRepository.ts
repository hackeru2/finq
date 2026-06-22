import { PrismaClient, User } from '@prisma/client'
import { AppUser } from '../types'

export class UserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findAll(): Promise<AppUser[]> {
    const users = await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return users.map(this.toAppUser)
  }

  async findById(id: string): Promise<AppUser | null> {
    const user = await this.prisma.user.findUnique({ where: { id } })
    return user ? this.toAppUser(user) : null
  }

  async create(user: AppUser): Promise<AppUser> {
    const created = await this.prisma.user.create({
      data: {
        id:               user.id,
        title:            user.title,
        firstName:        user.firstName,
        lastName:         user.lastName,
        originalFirstName: user.firstName,  // frozen at save time
        originalLastName:  user.lastName,
        gender:           user.gender,
        country:          user.country,
        city:             user.city,
        state:            user.state,
        streetName:       user.streetName,
        streetNumber:     user.streetNumber,
        email:            user.email,
        phone:            user.phone,
        pictureLarge:     user.pictureLarge,
        pictureThumbnail: user.pictureThumbnail,
        age:              user.age,
        dob:              user.dob,
      },
    })
    return this.toAppUser(created)
  }

  async update(id: string, firstName: string, lastName: string): Promise<AppUser | null> {
    try {
      const updated = await this.prisma.user.update({
        where: { id },
        data: { firstName, lastName },
      })
      return this.toAppUser(updated)
    } catch {
      return null  // record not found
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.user.delete({ where: { id } })
      return true
    } catch {
      return false  // record not found
    }
  }

  private toAppUser(user: User): AppUser {
    return {
      id:                user.id,
      title:             user.title,
      firstName:         user.firstName,
      lastName:          user.lastName,
      originalFirstName: user.originalFirstName,
      originalLastName:  user.originalLastName,
      gender:            user.gender,
      country:           user.country,
      city:              user.city,
      state:             user.state,
      streetName:        user.streetName,
      streetNumber:      user.streetNumber,
      email:             user.email,
      phone:             user.phone,
      pictureLarge:      user.pictureLarge,
      pictureThumbnail:  user.pictureThumbnail,
      age:               user.age,
      dob:               user.dob,
    }
  }
}
