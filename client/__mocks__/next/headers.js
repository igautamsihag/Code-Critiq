const cookies = jest.fn().mockResolvedValue({
  get: jest.fn().mockReturnValue(undefined),
})

module.exports = { cookies }
