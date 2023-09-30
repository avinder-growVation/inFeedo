exports.handleErrorResponse = async (_req, res, error) => {
  console.log(error)
  res.status(500).json(error)
}
