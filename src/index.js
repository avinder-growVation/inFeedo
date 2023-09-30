const express = require('express')
const app = express()

require('dotenv').config()
require('./config/db')

const tasksRoute = require('./routes/tasks')

app.use(express.json({ type: ['application/json', 'text/plain'] }))
app.use(express.urlencoded({ extended: true }))

app.use('/api/v1/tasks', tasksRoute)

app.listen(process.env.PORT, () => {
  console.log(`App running on port ${process.env.PORT}.`)
})
