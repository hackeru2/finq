import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useDebounce } from '../hooks/useDebounce'

describe('useDebounce', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('returns the initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('hello', 200))
    expect(result.current).toBe('hello')
  })

  it('still returns the old value before the delay elapses', () => {
    const { result, rerender } = renderHook(
      ({ v }) => useDebounce(v, 200),
      { initialProps: { v: 'hello' } }
    )
    rerender({ v: 'world' })
    act(() => vi.advanceTimersByTime(100))
    expect(result.current).toBe('hello')
  })

  it('returns the updated value after the delay elapses', () => {
    const { result, rerender } = renderHook(
      ({ v }) => useDebounce(v, 200),
      { initialProps: { v: 'hello' } }
    )
    rerender({ v: 'world' })
    act(() => vi.advanceTimersByTime(200))
    expect(result.current).toBe('world')
  })

  it('debounces rapid changes and only applies the last value', () => {
    const { result, rerender } = renderHook(
      ({ v }) => useDebounce(v, 200),
      { initialProps: { v: 'a' } }
    )
    rerender({ v: 'ab' })
    rerender({ v: 'abc' })
    act(() => vi.advanceTimersByTime(200))
    expect(result.current).toBe('abc')
  })
})
