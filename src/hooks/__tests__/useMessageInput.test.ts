import { useMessageInput } from '../useMessageInput'

describe('useMessageInput', () => {
  const mockOnTextChange = jest.fn()
  const mockOnTyping = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should export the hook function', () => {
    expect(useMessageInput).toBeDefined()
    expect(typeof useMessageInput).toBe('function')
  })

  it('should accept optional props', () => {
    expect(() => useMessageInput()).not.toThrow()
    expect(() => useMessageInput({})).not.toThrow()
    expect(() => useMessageInput({ onTextChange: mockOnTextChange })).not.toThrow()
    expect(() => useMessageInput({ onTyping: mockOnTyping })).not.toThrow()
  })

  it('should handle both callbacks', () => {
    expect(() => useMessageInput({
      onTextChange: mockOnTextChange,
      onTyping: mockOnTyping,
    })).not.toThrow()
  })

  it('should handle undefined callbacks', () => {
    expect(() => useMessageInput({
      onTextChange: undefined,
      onTyping: undefined,
    })).not.toThrow()
  })
}) 