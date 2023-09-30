const mysql = require('mysql')
const { promisify } = require('util')

const pool = mysql.createPool({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  charset: 'utf8mb4',
  dateStrings: true
})

global.db = { query: promisify(pool.query).bind(pool) }
