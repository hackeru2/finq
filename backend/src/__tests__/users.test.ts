import request from 'supertest'
import express from 'express'

// Mock Prisma client before importing routes
jest.mock('../db', () => ({
  prisma: {
    $connect: jest.fn().mockResolvedValue(undefined),
    $executeRaw: jest.fn().mockResolvedValue(0),
    user: {
      findMany:  jest.fn(),
      findUnique: jest.fn(),
      create:    jest.fn(),
      update:    jest.fn(),
      delete:    jest.fn(),
    },
  },
  initDb: jest.fn().mockResolvedValue(undefined),
}))

import { prisma } from '../db'
import usersRouter from '../routes/users'

const mockUser = prisma.user as jest.Mocked<typeof prisma.user>

const app = express()
app.use(express.json())
app.use('/api/users', usersRouter)
app.use((_err: Error, _req: any, res: any, _next: any) => {
  res.status(500).json({ error: 'Internal server error' })
})

const prismaRow = {
  id:                'test-uuid',
  title:             'Mr',
  firstName:         'John',
  lastName:          'Doe',
  originalFirstName: 'John',
  originalLastName:  'Doe',
  gender:            'male',
  country:           'USA',
  city:              'New York',
  state:             'NY',
  streetName:        'Broadway',
  streetNumber:      42,
  email:             'john@example.com',
  phone:             '555-0100',
  pictureLarge:      'https://example.com/large.jpg',
  pictureThumbnail:  'https://example.com/thumb.jpg',
  age:               30,
  dob:               '1994-01-01T00:00:00.000Z',
  createdAt:         new Date(),
}

const user = {
  id:              'test-uuid',
  title:           'Mr',
  firstName:       'John',
  lastName:        'Doe',
  gender:          'male',
  country:         'USA',
  city:            'New York',
  state:           'NY',
  streetName:      'Broadway',
  streetNumber:    42,
  email:           'john@example.com',
  phone:           '555-0100',
  pictureLarge:    'https://example.com/large.jpg',
  pictureThumbnail: 'https://example.com/thumb.jpg',
  age:             30,
  dob:             '1994-01-01T00:00:00.000Z',
}

describe('GET /api/users', () => {
  it('returns an array of users mapped from DB rows', async () => {
    mockUser.findMany.mockResolvedValueOnce([prismaRow])

    const res = await request(app).get('/api/users')

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body[0]).toMatchObject({ id: 'test-uuid', firstName: 'John', lastName: 'Doe' })
  })

  it('returns an empty array when no users are saved', async () => {
    mockUser.findMany.mockResolvedValueOnce([])

    const res = await request(app).get('/api/users')

    expect(res.status).toBe(200)
    expect(res.body).toEqual([])
  })
})

describe('POST /api/users', () => {
  it('saves a user and returns 201 with the user body', async () => {
    mockUser.create.mockResolvedValueOnce(prismaRow)

    const res = await request(app).post('/api/users').send(user)

    expect(res.status).toBe(201)
    expect(res.body).toMatchObject({ id: 'test-uuid', firstName: 'John' })
  })

  it('returns 409 on duplicate id', async () => {
    const dupError = Object.assign(new Error('Unique constraint'), { code: 'P2002' })
    mockUser.create.mockRejectedValueOnce(dupError)

    const res = await request(app).post('/api/users').send(user)

    expect(res.status).toBe(409)
    expect(res.body.error).toMatch(/already saved/i)
  })
})

describe('PATCH /api/users/:id', () => {
  it('updates name and returns the updated user', async () => {
    const updatedRow = { ...prismaRow, firstName: 'Jane' }
    mockUser.update.mockResolvedValueOnce(updatedRow)

    const res = await request(app)
      .patch('/api/users/test-uuid')
      .send({ firstName: 'Jane', lastName: 'Doe' })

    expect(res.status).toBe(200)
    expect(res.body.firstName).toBe('Jane')
  })

  it('returns 404 when the user does not exist', async () => {
    mockUser.update.mockRejectedValueOnce(new Error('Record not found'))

    const res = await request(app)
      .patch('/api/users/missing-id')
      .send({ firstName: 'X', lastName: 'Y' })

    expect(res.status).toBe(404)
    expect(res.body.error).toMatch(/not found/i)
  })
})

describe('DELETE /api/users/:id', () => {
  it('deletes an existing user and returns 204', async () => {
    mockUser.delete.mockResolvedValueOnce(prismaRow)

    const res = await request(app).delete('/api/users/test-uuid')

    expect(res.status).toBe(204)
  })

  it('returns 404 when the user does not exist', async () => {
    mockUser.delete.mockRejectedValueOnce(new Error('Record not found'))

    const res = await request(app).delete('/api/users/missing-id')

    expect(res.status).toBe(404)
    expect(res.body.error).toMatch(/not found/i)
  })
})
