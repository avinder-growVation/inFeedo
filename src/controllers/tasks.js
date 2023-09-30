const moment = require('moment')

const tools = require('../utils/tools')

const STATUS = ['open', 'inprogress', 'completed']

/**
 * @field title (Required)
 */
exports.createTask = async (req, res) => {
  const { title } = req.body

  try {
    if (!title?.trim()) return res.status(400).json('The field `title` is required')

    const response = await db.query('INSERT INTO tasks (title) VALUES (?)', [title])

    res.status(200).json({ id: response.insertId })
  } catch (error) {
    tools.handleErrorResponse(req, res, error)
  }
}

/**
 * @param status (null | undefined | 'open' | 'inprogress' | 'completed')
 * @param page (null | undefined | number)
 * @param tasksPerPage (null | undefined | number)
 */
exports.fetchTasks = async (req, res) => {
  let { status, page = 1, tasksPerPage = 2 } = req.query

  try {
    let query = 'SELECT * FROM tasks'
    let params = []

    // If status is present, filter by status
    if (STATUS.includes(status)) {
      query += ' WHERE status = ?'
      params.push(status)
    }

    query += ' ORDER BY createdAt LIMIT ? OFFSET ?'
    params.push(+tasksPerPage, (page - 1) * tasksPerPage)

    const response = await db.query(query, params)

    res.status(200).json(response)
  } catch (error) {
    tools.handleErrorResponse(req, res, error)
  }
}

exports.fetchMetricsByStatus = async (req, res) => {
  try {
    let promises = []
    STATUS.forEach(status => promises.push(db.query(`SELECT COUNT(id) AS ${status}_tasks FROM tasks WHERE status = ?`, [status])))

    const response = await Promise.all(promises)

    const metrics = {}
    response.forEach(x => Object.assign(metrics, x[0]))

    res.status(200).json(metrics)
  } catch (error) {
    tools.handleErrorResponse(req, res, error)
  }
}

exports.fetchMetricsByTimeline = async (req, res) => {
  try {
    const response = await db.query(
      `
        SELECT COUNT(id) AS count, status, DATE_FORMAT(createdAt, '%Y-%m') AS date FROM tasks
        GROUP BY status, DATE_FORMAT(createdAt, '%Y-%m') ORDER BY createdAt
      `
    )

    const metrics = []
    const dates = new Set(response.map(x => x.date))

    dates.forEach(date => {
      const metric = { date: moment(date).format('MMMM YYYY') }

      // Set count values for all status values
      STATUS.forEach(status => {
        const statusCounts = response.find(x => x.date === date && x.status === status)
        Object.assign(metric, { [`${status}_tasks`]: statusCounts?.count || 0 })
      })

      metrics.push(metric)
    })

    res.status(200).json(metrics)
  } catch (error) {
    tools.handleErrorResponse(req, res, error)
  }
}

/**
 * @field id (Required)
 * @field title (null | string)
 * @field status (null | undefined | 'open' | 'inprogress' | 'completed')
 *
 * The row is updated only if either one of title or status is present
 */
exports.updateTask = async (req, res) => {
  const { id, title, status } = req.body

  try {
    if (!id) return res.status(400).json('The field `id` is required')
    if (!title?.trim() && !status) return res.status(204).end() // Nothing to update
    if (!STATUS.includes(status)) return res.status(400).json('This value of `status` is not allowed')

    await db.query('UPDATE tasks SET title = ?, status = ? WHERE id = ?', [title, status, id])

    res.status(200).end('Task updated')
  } catch (error) {
    tools.handleErrorResponse(req, res, error)
  }
}
