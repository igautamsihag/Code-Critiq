import { render, screen } from '@testing-library/react'
import DashboardSidebar from '@/components/DashboardSidebar'

const mockUsePathname = jest.fn()

jest.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
}))

describe('DashboardSidebar', () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue('/dashboard')
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders the logo', () => {
    render(<DashboardSidebar />)
    expect(screen.getByAltText('Code Critiq')).toBeInTheDocument()
  })

  it('renders all five nav links with correct hrefs', () => {
    render(<DashboardSidebar />)
    expect(screen.getByRole('link', { name: /dashboard/i })).toHaveAttribute('href', '/dashboard')
    expect(screen.getByRole('link', { name: /repositories/i })).toHaveAttribute('href', '/dashboard/repositories')
    expect(screen.getByRole('link', { name: /reviews/i })).toHaveAttribute('href', '/dashboard/reviews')
    expect(screen.getByRole('link', { name: /analytics/i })).toHaveAttribute('href', '/dashboard/analytics')
    expect(screen.getByRole('link', { name: /settings/i })).toHaveAttribute('href', '/dashboard/settings')
  })

  it('applies active class to the link matching the current path', () => {
    mockUsePathname.mockReturnValue('/dashboard/repositories')
    render(<DashboardSidebar />)
    expect(screen.getByRole('link', { name: /repositories/i })).toHaveClass('active')
  })

  it('does not apply active class to links that do not match the current path', () => {
    mockUsePathname.mockReturnValue('/dashboard')
    render(<DashboardSidebar />)
    expect(screen.getByRole('link', { name: /repositories/i })).not.toHaveClass('active')
    expect(screen.getByRole('link', { name: /reviews/i })).not.toHaveClass('active')
  })
})
