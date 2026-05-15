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
  it('renders the hero heading', () => {
    render(<Home />)
    expect(screen.getByRole('heading', { name: /automated pull request feedback/i })).toBeInTheDocument()
  })

  it('renders the badge', () => {
    render(<Home />)
    expect(screen.getByText(/ai-powered · every pr reviewed/i)).toBeInTheDocument()
  })

  it('renders the "Connect with GitHub" CTA link with correct OAuth URL', () => {
    const { container } = render(<Home />)
    const links = container.querySelectorAll<HTMLAnchorElement>('a[href*="github.com/login/oauth"]')
    expect(links.length).toBeGreaterThan(0)
    links.forEach(link => {
      expect(link.href).toContain(`client_id=${TEST_CLIENT_ID}`)
      expect(link.href).toContain('scope=repo')
    })
  })

  it('renders the "See how it works" link pointing to /services', () => {
    render(<Home />)
    expect(screen.getByRole('link', { name: /see how it works/i })).toHaveAttribute('href', '/services')
  })

  it('renders the stats bar', () => {
    render(<Home />)
    expect(screen.getByText('~30s')).toBeInTheDocument()
    expect(screen.getByText('avg review time')).toBeInTheDocument()
  })

  it('renders the language list', () => {
    render(<Home />)
    expect(screen.getByText('JavaScript')).toBeInTheDocument()
    expect(screen.getByText('TypeScript')).toBeInTheDocument()
    expect(screen.getByText('Python')).toBeInTheDocument()
  })
})
