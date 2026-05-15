import { render, screen } from '@testing-library/react'
import Home from '@/app/page'

jest.mock('@/components/Navbar', () => () => null)
jest.mock('@/components/Footer', () => () => null)

const TEST_CLIENT_ID = 'test-client-id'

beforeEach(() => {
  process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID = TEST_CLIENT_ID
})

afterEach(() => {
  delete process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID
})

describe('Home page', () => {
  it('renders the page title', () => {
    render(<Home />)
    expect(screen.getByRole('heading', { name: /code critiq/i })).toBeInTheDocument()
  })

  it('renders the subtitle', () => {
    render(<Home />)
    expect(screen.getByText(/automated pull request feedback/i)).toBeInTheDocument()
  })

  it('"Continue with Github" link points to GitHub OAuth with correct client_id and scope', () => {
    render(<Home />)
    const link = screen.getByRole('link', { name: /continue with github/i })
    expect(link).toHaveAttribute('href', expect.stringContaining(`client_id=${TEST_CLIENT_ID}`))
    expect(link).toHaveAttribute('href', expect.stringContaining('scope=repo'))
  })
})
