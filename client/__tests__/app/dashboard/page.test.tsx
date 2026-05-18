import { render, screen } from '@testing-library/react'
import Dashboard from '@/app/dashboard/page'

describe('Dashboard page', () => {
  it('shows the username initials in the avatar', async () => {
    render(await Dashboard())
    expect(screen.getByText('DE')).toBeInTheDocument()
  })

  it('shows repos from the API', async () => {
    render(await Dashboard())
    expect(screen.getByText('frontend-app')).toBeInTheDocument()
    expect(screen.getByText('api-service')).toBeInTheDocument()
    expect(screen.getByText('data-pipeline')).toBeInTheDocument()
  })

  it('shows a Connect button for each repo', async () => {
    render(await Dashboard())
    expect(screen.getAllByRole('button', { name: /connect/i })).toHaveLength(3)
  })

  it('caps the activity feed at 3 items', async () => {
    render(await Dashboard())
    expect(screen.getByText(/SQL injection/)).toBeInTheDocument()
    expect(screen.getByText(/O\(n²\)/)).toBeInTheDocument()
    expect(screen.getByText(/80 lines/)).toBeInTheDocument()
    expect(screen.queryByText(/14 tests passing/)).not.toBeInTheDocument()
  })
})
