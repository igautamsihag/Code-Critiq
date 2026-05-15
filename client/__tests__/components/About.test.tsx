import { render, screen } from '@testing-library/react'
import About from '@/app/about/page'

jest.mock('@/components/Navbar', () => () => null)
jest.mock('@/components/Footer', () => () => null)

describe('About page', () => {
  it('renders without crashing', () => {
    render(<About />)
  })

  it('renders the problem section heading', () => {
    render(<About />)
    expect(screen.getByRole('heading', { name: /code review shouldn't be the slow part/i })).toBeInTheDocument()
  })

  it('renders all four principle cards', () => {
    render(<About />)
    expect(screen.getByText('Scoped to the diff')).toBeInTheDocument()
    expect(screen.getByText('Zero configuration')).toBeInTheDocument()
    expect(screen.getByText('Async by design')).toBeInTheDocument()
    expect(screen.getByText('Additive, not prescriptive')).toBeInTheDocument()
  })

  it('renders all stack layer labels', () => {
    render(<About />)
    expect(screen.getByText('Frontend')).toBeInTheDocument()
    expect(screen.getByText('Auth')).toBeInTheDocument()
    expect(screen.getByText('Repo events')).toBeInTheDocument()
    expect(screen.getByText('AI layer')).toBeInTheDocument()
    expect(screen.getByText('Infrastructure')).toBeInTheDocument()
    expect(screen.getByText('Deployment')).toBeInTheDocument()
  })

  it('renders the section tags', () => {
    render(<About />)
    expect(screen.getByText('WHY THIS EXISTS')).toBeInTheDocument()
    expect(screen.getByText('THE PRINCIPLES')).toBeInTheDocument()
    expect(screen.getByText('THE STACK')).toBeInTheDocument()
  })
})
