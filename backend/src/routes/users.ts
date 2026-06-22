import { Router, Request, Response } from 'express'
import { RowDataPacket } from 'mysql2'
import { pool } from '../db'
import { AppUser } from '../types'

const router = Router()

function rowToUser(row: RowDataPacket): AppUser {
  return {
    id: row.id,
    title: row.title,
    firstName: row.first_name,
    lastName: row.last_name,
    gender: row.gender,
    country: row.country,
    city: row.city,
    state: row.state,
    streetName: row.street_name,
    streetNumber: row.street_number,
    email: row.email,
    phone: row.phone,
    pictureLarge: row.picture_large,
    pictureThumbnail: row.picture_thumbnail,
    age: row.age,
    dob: row.dob,
  }
}

router.get('/', async (_req: Request, res: Response) => {
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT * FROM users ORDER BY created_at DESC'
  )
  res.json(rows.map(rowToUser))
})

router.post('/', async (req: Request, res: Response) => {
  const user: AppUser = req.body
  try {
    await pool.execute(
      `INSERT INTO users
        (id, title, first_name, last_name, gender, country, city, state,
         street_name, street_number, email, phone, picture_large, picture_thumbnail, age, dob)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user.id, user.title, user.firstName, user.lastName, user.gender,
        user.country, user.city, user.state, user.streetName, user.streetNumber,
        user.email, user.phone, user.pictureLarge, user.pictureThumbnail, user.age, user.dob,
      ]
    )
    res.status(201).json(user)
  } catch (err: any) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'User already saved' })
    }
    throw err
  }
})

router.patch('/:id', async (req: Request, res: Response) => {
  const { id } = req.params
  const { firstName, lastName } = req.body as { firstName: string; lastName: string }

  const [result] = await pool.execute<any>(
    'UPDATE users SET first_name = ?, last_name = ? WHERE id = ?',
    [firstName, lastName, id]
  )

  if (result.affectedRows === 0) {
    return res.status(404).json({ error: 'User not found' })
  }

  const [rows] = await pool.execute<RowDataPacket[]>('SELECT * FROM users WHERE id = ?', [id])
  res.json(rowToUser(rows[0]))
})

router.delete('/:id', async (req: Request, res: Response) => {
  const { id } = req.params
  const [result] = await pool.execute<any>('DELETE FROM users WHERE id = ?', [id])

  if (result.affectedRows === 0) {
    return res.status(404).json({ error: 'User not found' })
  }

  res.status(204).send()
})

export default router
