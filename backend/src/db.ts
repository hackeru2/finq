import { PrismaClient } from '@prisma/client'

export const prisma = new PrismaClient()

export async function initDb(): Promise<void> {
  // Backfill rows saved before original_first_name was introduced
  await prisma.$executeRaw`
    UPDATE users
    SET original_first_name = first_name,
        original_last_name  = last_name
    WHERE original_first_name = ''
  `
}
