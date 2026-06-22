import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import UserRow from '../components/UserRow'
import { AppUser } from '../types'

const female: AppUser = {
  id: '1',
  title: 'Ms',
  firstName: 'Alice',
  lastName: 'Smith',
  gender: 'female',
  country: 'Canada',
  city: 'Toronto',
  state: 'ON',
  streetName: 'King St',
  streetNumber: 7,
  email: 'alice@example.com',
  phone: '416-555-0101',
  pictureLarge: 'https://example.com/large.jpg',
  pictureThumbnail: 'https://example.com/thumb.jpg',
  age: 28,
  dob: '1996-03-15T00:00:00.000Z',
}

const male: AppUser = { ...female, id: '2', gender: 'male', firstName: 'Bob', lastName: 'Jones' }

describe('UserRow', () => {
  it('renders name without title prefix, country, email and phone', () => {
    const { container } = render(<UserRow user={female} onClick={vi.fn()} />)

    expect(screen.getByText('Alice Smith')).toBeInTheDocument()
    expect(screen.queryByText('Ms Alice Smith')).not.toBeInTheDocument()
    expect(screen.getByText('Canada')).toBeInTheDocument()
    expect(container).toHaveTextContent('alice@example.com')
    expect(container).toHaveTextContent('416-555-0101')
  })

  it('shows a female icon for female users', () => {
    render(<UserRow user={female} onClick={vi.fn()} />)
    expect(screen.getByLabelText('female')).toBeInTheDocument()
    expect(screen.queryByLabelText('male')).not.toBeInTheDocument()
  })

  it('shows a male icon for male users', () => {
    render(<UserRow user={male} onClick={vi.fn()} />)
    expect(screen.getByLabelText('male')).toBeInTheDocument()
    expect(screen.queryByLabelText('female')).not.toBeInTheDocument()
  })

  it('renders the thumbnail image', () => {
    const { container } = render(<UserRow user={female} onClick={vi.fn()} />)
    const img = container.querySelector('img')
    expect(img).not.toBeNull()
    expect(img).toHaveAttribute('src', female.pictureThumbnail)
  })

  it('calls onClick when the row is clicked', async () => {
    const onClick = vi.fn()
    render(<UserRow user={female} onClick={onClick} />)
    await userEvent.click(screen.getByText('Alice Smith'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
