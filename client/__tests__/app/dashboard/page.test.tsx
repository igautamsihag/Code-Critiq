import Dashboard from '@/app/dashboard/page'

const mockRedirect = jest.fn()
const mockCookies = jest.fn()

jest.mock('next/navigation', () => ({
  redirect: (url: string) => {
    mockRedirect(url)
    throw new Error(`NEXT_REDIRECT:${url}`)
  },
}))
jest.mock('next/headers', () => ({ cookies: () => mockCookies() }))
jest.mock('jose', () => ({ jwtVerify: jest.fn() }))

describe('Dashboard page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('redirects to / when no token cookie', async () => {
    mockCookies.mockReturnValue({ get: () => undefined })
    await expect(Dashboard()).rejects.toThrow('NEXT_REDIRECT:/')
    expect(mockRedirect).toHaveBeenCalledWith('/')
  })
})
