import { Router, Request, Response, NextFunction } from 'express'
import { prisma } from '../db'
import { UserRepository } from '../repositories/UserRepository'
import { AppUser } from '../types'

const router = Router()
const repo = new UserRepository(prisma)

router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.json(await repo.findAll())
  } catch (err) {
    next(err)
  }
})

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  const user: AppUser = req.body
  try {
    const created = await repo.create(user)
    res.status(201).json(created)
  } catch (err: any) {
    if (err.code === 'P2002') {  // Prisma unique constraint violation
      return res.status(409).json({ error: 'User already saved' })
    }
    next(err)
  }
})

router.patch('/:id', async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params
  const { firstName, lastName } = req.body as { firstName: string; lastName: string }
  try {
    const updated = await repo.update(id, firstName, lastName)
    if (!updated) return res.status(404).json({ error: 'User not found' })
    res.json(updated)
  } catch (err) {
    next(err)
  }
})

router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params
  try {
    const deleted = await repo.delete(id)
    if (!deleted) return res.status(404).json({ error: 'User not found' })
    res.status(204).send()
  } catch (err) {
    next(err)
  }
})

export default router
