// Mock React Native components
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native')
  return {
    ...RN,
    Animated: {
      ...RN.Animated,
      timing: jest.fn(() => ({
        start: jest.fn(),
      })),
      Value: jest.fn(() => ({
        setValue: jest.fn(),
      })),
    },
  }
})

// Mock @react-navigation/native
jest.mock('@react-navigation/native', () => ({
  useRoute: jest.fn(() => ({ params: { userId: 'test-user-id' } })),
  useNavigation: jest.fn(() => ({
    goBack: jest.fn(),
    navigate: jest.fn(),
  })),
  useFocusEffect: jest.fn(),
}))

// Mock expo-image-picker
jest.mock('expo-image-picker', () => ({
  launchCameraAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
  MediaTypeOptions: {
    Images: 'Images',
  },
}))

// Mock expo-image-manipulator
jest.mock('expo-image-manipulator', () => ({
  manipulateAsync: jest.fn(),
  SaveFormat: {
    JPEG: 'jpeg',
  },
}))

// Mock expo-file-system
jest.mock('expo-file-system', () => ({
  uploadAsync: jest.fn(),
}))

// Mock date-fns with actual formatting
jest.mock('date-fns', () => ({
  format: jest.fn((date, formatString) => {
    if (formatString === 'EEEE, MMM do') {
      return 'Monday, Jan 15'
    }
    if (formatString === 'h:mm a') {
      const hours = date.getHours()
      const minutes = date.getMinutes()
      const ampm = hours >= 12 ? 'PM' : 'AM'
      const displayHours = hours % 12 || 12
      return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`
    }
    if (formatString === 'MMMM d, h:mm a') {
      const month = date.toLocaleDateString('en-US', { month: 'long' })
      const day = date.getDate()
      const hours = date.getHours()
      const minutes = date.getMinutes()
      const ampm = hours >= 12 ? 'PM' : 'AM'
      const displayHours = hours % 12 || 12
      return `${month} ${day}, ${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`
    }
    return 'formatted date'
  }),
}))

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
  log: jest.fn(),
} 