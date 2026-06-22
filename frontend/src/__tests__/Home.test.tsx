import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import Home from '../screens/Home'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

describe('Home', () => {
  beforeEach(() => mockNavigate.mockClear())

  it('renders Fetch and History buttons', () => {
    render(<MemoryRouter><Home /></MemoryRouter>)
    expect(screen.getByText('Fetch')).toBeInTheDocument()
    expect(screen.getByText('History')).toBeInTheDocument()
  })

  it('navigates to /random when Fetch is clicked', async () => {
    render(<MemoryRouter><Home /></MemoryRouter>)
    await userEvent.click(screen.getByText('Fetch'))
    expect(mockNavigate).toHaveBeenCalledWith('/random')
  })

  it('navigates to /history when History is clicked', async () => {
    render(<MemoryRouter><Home /></MemoryRouter>)
    await userEvent.click(screen.getByText('History'))
    expect(mockNavigate).toHaveBeenCalledWith('/history')
  })
})
