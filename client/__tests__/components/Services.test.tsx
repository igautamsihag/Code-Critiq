import { render, screen } from '@testing-library/react'
import Services from '@/app/services/page'

jest.mock('@/components/Navbar', () => () => null)
jest.mock('@/components/Footer', () => () => null)

describe('Services page', () => {
  it('renders without crashing', () => {
    render(<Services />)
  })

  it('renders the section tags', () => {
    render(<Services />)
    expect(screen.getByText('WHAT WE REVIEW')).toBeInTheDocument()
    expect(screen.getByText('HOW IT WORKS')).toBeInTheDocument()
  })

  it('renders all three review type cards', () => {
    render(<Services />)
    expect(screen.getByText('Security analysis')).toBeInTheDocument()
    expect(screen.getByText('Performance review')).toBeInTheDocument()
    expect(screen.getByText('Test coverage gaps')).toBeInTheDocument()
  })

  it('renders the tagline for each review type', () => {
    render(<Services />)
    expect(screen.getByText('Catch vulnerabilities before they ship.')).toBeInTheDocument()
    expect(screen.getByText('Spot regressions before they hit production.')).toBeInTheDocument()
    expect(screen.getByText('Know exactly what needs a test.')).toBeInTheDocument()
  })

  it('renders all four steps', () => {
    render(<Services />)
    expect(screen.getByText('Sign in with GitHub')).toBeInTheDocument()
    expect(screen.getByText('Connect a repo')).toBeInTheDocument()
    expect(screen.getByText('Open a pull request')).toBeInTheDocument()
    expect(screen.getByText('Read the review')).toBeInTheDocument()
  })

  it('renders the CTA heading', () => {
    render(<Services />)
    expect(screen.getByRole('heading', { name: /start reviewing smarter/i })).toBeInTheDocument()
  })
})
