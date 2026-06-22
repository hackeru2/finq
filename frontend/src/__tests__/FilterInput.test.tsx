import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import FilterInput from '../components/FilterInput'

describe('FilterInput', () => {
  it('renders an input with the correct placeholder', () => {
    render(<FilterInput value="" onChange={vi.fn()} />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Filter by name or country…')).toBeInTheDocument()
  })

  it('displays the current value', () => {
    render(<FilterInput value="Alice" onChange={vi.fn()} />)
    expect(screen.getByRole('textbox')).toHaveValue('Alice')
  })

  it('calls onChange with the new value when the user types', () => {
    const onChange = vi.fn()
    render(<FilterInput value="" onChange={onChange} />)
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'John' } })
    expect(onChange).toHaveBeenCalledWith('John')
  })
})
