module.exports = {
  jwtVerify: jest.fn().mockResolvedValue({
    payload: { userId: 'user1', username: 'testuser', avatarUrl: '' },
  }),
}
