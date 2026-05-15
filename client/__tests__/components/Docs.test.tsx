import { render, screen } from '@testing-library/react'
import Docs from '@/app/docs/page'

jest.mock('@/components/Navbar', () => () => null)
jest.mock('@/components/Footer', () => () => null)

describe('Docs page', () => {
  it('renders without crashing', () => {
    render(<Docs />)
  })

  it('renders all three nav group labels', () => {
    render(<Docs />)
    expect(screen.getByText('Getting Started')).toBeInTheDocument()
    expect(screen.getByText('Webhooks')).toBeInTheDocument()
    expect(screen.getByText('Reviews')).toBeInTheDocument()
  })

  it('renders all sidebar navigation links', () => {
    render(<Docs />)
    expect(screen.getByRole('link', { name: 'Introduction' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Quick Start' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Connecting a Repo' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'How Webhooks Work' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Webhook Payload' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Retry Logic' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'What Gets Reviewed' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Review Format' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Security Findings' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Performance Findings' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Test Coverage' })).toBeInTheDocument()
  })

  it('renders the Introduction section heading', () => {
    render(<Docs />)
    expect(screen.getByRole('heading', { name: 'Introduction' })).toBeInTheDocument()
  })

  it('renders all content section headings', () => {
    render(<Docs />)
    const headings = [
      'Introduction',
      'Quick Start',
      'Connecting a Repo',
      'How Webhooks Work',
      'Webhook Payload',
      'Retry Logic',
      'What Gets Reviewed',
      'Review Format',
      'Security Findings',
      'Performance Findings',
      'Test Coverage',
    ]
    headings.forEach(h => {
      expect(screen.getByRole('heading', { name: h })).toBeInTheDocument()
    })
  })
})
