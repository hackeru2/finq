import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import FilterBar, { FilterState } from '../components/FilterBar'

const defaults: FilterState = { text: '', gender: 'all', ageRange: [0, 100] }

describe('FilterBar', () => {
  it('renders text search input', () => {
    render(<FilterBar value={defaults} onChange={vi.fn()} />)
    expect(screen.getByPlaceholderText('Filter by name or country…')).toBeInTheDocument()
  })

  it('renders All, Male, Female gender options', () => {
    render(<FilterBar value={defaults} onChange={vi.fn()} />)
    expect(screen.getByText('All')).toBeInTheDocument()
    expect(screen.getByText('Male')).toBeInTheDocument()
    expect(screen.getByText('Female')).toBeInTheDocument()
  })

  it('calls onChange with updated text when user types', () => {
    const onChange = vi.fn()
    render(<FilterBar value={defaults} onChange={onChange} />)
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Alice' } })
    expect(onChange).toHaveBeenCalledWith({ ...defaults, text: 'Alice' })
  })

  it('calls onChange with gender=male when Male is clicked', async () => {
    const onChange = vi.fn()
    render(<FilterBar value={defaults} onChange={onChange} />)
    await userEvent.click(screen.getByText('Male'))
    expect(onChange).toHaveBeenCalledWith({ ...defaults, gender: 'male' })
  })

  it('calls onChange with gender=female when Female is clicked', async () => {
    const onChange = vi.fn()
    render(<FilterBar value={defaults} onChange={onChange} />)
    await userEvent.click(screen.getByText('Female'))
    expect(onChange).toHaveBeenCalledWith({ ...defaults, gender: 'female' })
  })

  it('shows the current age range', () => {
    render(<FilterBar value={{ ...defaults, ageRange: [20, 40] }} onChange={vi.fn()} />)
    expect(screen.getByText('Age 20–40')).toBeInTheDocument()
  })
})
