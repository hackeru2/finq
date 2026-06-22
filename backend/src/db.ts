import mysql from 'mysql2/promise'

export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'finq',
  waitForConnections: true,
  connectionLimit: 10,
})

export async function initDb(): Promise<void> {
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id           VARCHAR(36)  PRIMARY KEY,
      title        VARCHAR(20)  NOT NULL,
      first_name   VARCHAR(100) NOT NULL,
      last_name    VARCHAR(100) NOT NULL,
      gender       VARCHAR(20)  NOT NULL,
      country      VARCHAR(100) NOT NULL,
      city         VARCHAR(100) NOT NULL,
      state        VARCHAR(100) NOT NULL,
      street_name  VARCHAR(200) NOT NULL,
      street_number INT         NOT NULL,
      email        VARCHAR(200) NOT NULL,
      phone        VARCHAR(50)  NOT NULL,
      picture_large     TEXT    NOT NULL,
      picture_thumbnail TEXT    NOT NULL,
      age          INT          NOT NULL,
      dob          VARCHAR(30)  NOT NULL,
      created_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
    )
  `)
}
