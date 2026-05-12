import { render, screen } from '@testing-library/react'
import Navbar from '@/components/Navbar'

const TEST_CLIENT_ID = 'test-client-id'

beforeEach(() => {
  process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID = TEST_CLIENT_ID
})

afterEach(() => {
  delete process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID
})

describe('Navbar', () => {
  it('renders the logo with correct alt text', () => {
    render(<Navbar />)
    expect(screen.getByAltText('logo')).toBeInTheDocument()
  })

  it('renders all four nav links', () => {
    render(<Navbar />)
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Services')).toBeInTheDocument()
    expect(screen.getByText('About')).toBeInTheDocument()
    expect(screen.getByText('Docs')).toBeInTheDocument()
  })

  it('"Get Started" link points to GitHub OAuth with correct client_id and scope', () => {
    render(<Navbar />)
    const link = screen.getByRole('link', { name: /get started/i })
    expect(link).toHaveAttribute('href', expect.stringContaining(`client_id=${TEST_CLIENT_ID}`))
    expect(link).toHaveAttribute('href', expect.stringContaining('scope=user:email'))
  })
})
