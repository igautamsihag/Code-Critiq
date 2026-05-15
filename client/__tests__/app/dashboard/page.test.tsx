import { render, screen } from '@testing-library/react'
import Dashboard from '@/app/dashboard/page'

describe('Dashboard page', () => {
  it('shows the username initials in the avatar', async () => {
    render(await Dashboard())
    expect(screen.getByText('DE')).toBeInTheDocument()
  })

  it('shows the 3 dev repos', async () => {
    render(await Dashboard())
    expect(screen.getByText('frontend-app')).toBeInTheDocument()
    expect(screen.getByText('api-service')).toBeInTheDocument()
    expect(screen.getByText('data-pipeline')).toBeInTheDocument()
  })

  it('caps the activity feed at 3 items', async () => {
    render(await Dashboard())
    expect(screen.getByText(/SQL injection/)).toBeInTheDocument()
    expect(screen.getByText(/O\(n²\)/)).toBeInTheDocument()
    expect(screen.getByText(/80 lines/)).toBeInTheDocument()
    expect(screen.queryByText(/14 tests passing/)).not.toBeInTheDocument()
  })
})
