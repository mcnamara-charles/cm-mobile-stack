import { useFadeAnimation } from '../useFadeAnimation'

// Mock Animated
jest.mock('react-native', () => ({
  Animated: {
    Value: jest.fn(() => ({
      setValue: jest.fn(),
    })),
    timing: jest.fn(() => ({
      start: jest.fn(),
    })),
  },
}))

describe('useFadeAnimation', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should export the hook function', () => {
    expect(useFadeAnimation).toBeDefined()
    expect(typeof useFadeAnimation).toBe('function')
  })

  it('should have the correct function signature', () => {
    // Test that the function accepts optional parameters
    expect(useFadeAnimation.length).toBe(0) // No required parameters
  })
}) 