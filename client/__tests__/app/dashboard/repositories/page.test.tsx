import { render, screen } from '@testing-library/react'
import RepositoriesPage from '@/app/dashboard/repositories/page'

describe('Repositories page', () => {
  it('renders all repos', async () => {
    render(await RepositoriesPage())
    expect(screen.getByText('frontend-app')).toBeInTheDocument()
    expect(screen.getByText('api-service')).toBeInTheDocument()
    expect(screen.getByText('data-pipeline')).toBeInTheDocument()
    expect(screen.getByText('ml-experiments')).toBeInTheDocument()
    expect(screen.getByText('portfolio')).toBeInTheDocument()
  })

  it('shows Private badge only on private repos', async () => {
    render(await RepositoriesPage())
    expect(screen.getAllByText('Private')).toHaveLength(2)
  })

  it('shows Connect buttons for unconnected repos and Connected badge for connected repos', async () => {
    render(await RepositoriesPage())
    expect(screen.getAllByRole('button', { name: /connect/i })).toHaveLength(4)
    expect(screen.getByText('Connected')).toBeInTheDocument()
  })

  it('shows repo count in the card header', async () => {
    render(await RepositoriesPage())
    expect(screen.getByText('5 repos')).toBeInTheDocument()
  })
})
