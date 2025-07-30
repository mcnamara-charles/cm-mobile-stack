import React from 'react'
import { render, fireEvent } from '@testing-library/react-native'
import MessageThreadHeader from '../MessageThreadHeader'

// Mock navigation
const mockNavigate = jest.fn()
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}))

// Mock theme context
jest.mock('../../context/themeContext', () => ({
  useTheme: () => ({
    theme: {
      colors: {
        card: '#F2F2F7',
        border: '#C6C6C8',
        text: '#000000',
        primary: '#007AFF',
      },
    },
  }),
}))

describe('MessageThreadHeader', () => {
  const mockOtherUser = {
    id: 'user2',
    first_name: 'John',
    last_name: 'Doe',
    email: 'john@example.com',
    profile_url: 'https://example.com/avatar.jpg',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render loading state correctly', () => {
    const { getByText, getByTestId } = render(
      <MessageThreadHeader otherUser={null} loading={true} />
    )

    expect(getByText('Loading conversation...')).toBeTruthy()
  })

  it('should render user info correctly', () => {
    const { getByText } = render(
      <MessageThreadHeader otherUser={mockOtherUser} loading={false} />
    )

    expect(getByText('John Doe')).toBeTruthy()
    expect(getByText('john@example.com')).toBeTruthy()
  })

  it('should handle back button press', () => {
    const { getByTestId } = render(
      <MessageThreadHeader otherUser={mockOtherUser} loading={false} />
    )

    const backButton = getByTestId('header-back-button')
    fireEvent.press(backButton)

    expect(mockNavigate).toHaveBeenCalledWith('MainTabs', { screen: 'Inbox' })
  })

  it('should handle user avatar press', () => {
    const { getByTestId } = render(
      <MessageThreadHeader otherUser={mockOtherUser} loading={false} />
    )

    const avatarButton = getByTestId('user-avatar-button')
    fireEvent.press(avatarButton)

    expect(mockNavigate).toHaveBeenCalledWith('UserProfile', { userId: 'user2' })
  })

  it('should render fallback avatar when no profile URL', () => {
    const userWithoutAvatar = {
      ...mockOtherUser,
      profile_url: undefined,
    }

    const { getByText } = render(
      <MessageThreadHeader otherUser={userWithoutAvatar} loading={false} />
    )

    expect(getByText('J')).toBeTruthy() // First letter of first name
  })

  it('should render fallback avatar when no first name', () => {
    const userWithoutName = {
      ...mockOtherUser,
      first_name: undefined,
    }

    const { getByText } = render(
      <MessageThreadHeader otherUser={userWithoutName} loading={false} />
    )

    expect(getByText('U')).toBeTruthy() // Default fallback
  })

  it('should handle missing user gracefully', () => {
    const { getByTestId } = render(
      <MessageThreadHeader otherUser={null} loading={false} />
    )

    // Should still render the header structure
    expect(getByTestId('header-container')).toBeTruthy()
  })
}) 