import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import FilterBar, { FilterState, DEFAULT_FILTER } from '../components/FilterBar'

const defaults: FilterState = DEFAULT_FILTER
const COUNTRIES = ['Germany', 'France', 'United States']

function renderBar(value = defaults, onChange = vi.fn()) {
  return render(<FilterBar value={value} onChange={onChange} countries={COUNTRIES} />)
}

async function openModal() {
  await userEvent.click(screen.getByRole('button', { name: /filters/i }))
}

describe('FilterBar — inline text search', () => {
  it('renders the text search input', () => {
    renderBar()
    expect(screen.getByPlaceholderText('Filter by name…')).toBeInTheDocument()
  })

  it('calls onChange immediately when user types', () => {
    const onChange = vi.fn()
    renderBar(defaults, onChange)
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Alice' } })
    expect(onChange).toHaveBeenCalledWith({ ...defaults, text: 'Alice' })
  })
})

describe('FilterBar — Filters button', () => {
  it('renders a Filters button', () => {
    renderBar()
    expect(screen.getByRole('button', { name: /filters/i })).toBeInTheDocument()
  })

  it('button is default style when no modal filters are active', () => {
    renderBar()
    const btn = screen.getByRole('button', { name: /filters/i })
    expect(btn.className).not.toMatch(/ant-btn-primary/)
  })

  it('button is primary style when a modal filter is active', () => {
    renderBar({ ...defaults, gender: 'male' })
    const btn = screen.getByRole('button', { name: /filters/i })
    expect(btn.className).toMatch(/ant-btn-primary/)
  })
})

describe('FilterBar — modal contents', () => {
  it('opens a modal with Gender, Age and Country sections on Filters click', async () => {
    renderBar()
    await openModal()
    expect(screen.getByText('Gender')).toBeInTheDocument()
    expect(screen.getByText(/^Age:/)).toBeInTheDocument()
    expect(screen.getByText('Country')).toBeInTheDocument()
  })

  it('calls onChange with gender=male after selecting Male and clicking Apply', async () => {
    const onChange = vi.fn()
    renderBar(defaults, onChange)
    await openModal()
    // Radio.Button renders as a label — click the label text
    await userEvent.click(screen.getByText('Male'))
    await userEvent.click(screen.getByRole('button', { name: /apply/i }))
    expect(onChange).toHaveBeenCalledWith({ ...defaults, gender: 'male' })
  })

  it('calls onChange with gender=female after selecting Female and clicking Apply', async () => {
    const onChange = vi.fn()
    renderBar(defaults, onChange)
    await openModal()
    await userEvent.click(screen.getByText('Female'))
    await userEvent.click(screen.getByRole('button', { name: /apply/i }))
    expect(onChange).toHaveBeenCalledWith({ ...defaults, gender: 'female' })
  })

  it('does NOT call onChange when Cancel is clicked', async () => {
    const onChange = vi.fn()
    renderBar(defaults, onChange)
    await openModal()
    await userEvent.click(screen.getByText('Female'))
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(onChange).not.toHaveBeenCalled()
  })

  it('shows the current age range label inside the modal', async () => {
    renderBar({ ...defaults, ageRange: [20, 40] })
    await openModal()
    expect(screen.getByText('Age: 20–40')).toBeInTheDocument()
  })
})
