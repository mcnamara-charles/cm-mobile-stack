# Testing Setup

This project uses Jest and React Native Testing Library for comprehensive testing of components, hooks, and utilities.

## Test Structure

Tests are co-located with the code they test in `__tests__` folders:

```
src/
├── components/
│   ├── __tests__/
│   │   └── MessageThreadHeader.test.tsx
│   └── MessageThreadHeader.tsx
├── hooks/
│   ├── __tests__/
│   │   ├── useMessageThread.test.ts
│   │   └── useMessageInput.test.ts
│   └── useMessageThread.ts
├── screens/
│   ├── __tests__/
│   │   └── MessageThreadScreen.test.tsx
│   └── MessageThreadScreen.tsx
└── utils/
    ├── __tests__/
    │   └── messageGrouping.test.ts
    └── messageGrouping.ts
```

## Running Tests

### All Tests
```bash
npm test
```

### Watch Mode (for development)
```bash
npm run test:watch
```

### With Coverage
```bash
npm run test:coverage
```

### Specific Test File
```bash
npm test -- src/hooks/__tests__/useMessageThread.test.ts
```

### Specific Test Pattern
```bash
npm test -- --testNamePattern="useMessageThread"
```

## Test Categories

### 1. **Utility Tests** (`src/utils/__tests__/`)
- **Purpose**: Test pure functions and data processing
- **Example**: `messageGrouping.test.ts`
- **Benefits**: Fast, reliable, no mocking needed

```typescript
describe('messageGrouping utilities', () => {
  it('should group messages by day and time', () => {
    const result = groupMessagesByDayAndTime(mockMessages)
    expect(result).toHaveLength(2)
  })
})
```

### 2. **Hook Tests** (`src/hooks/__tests__/`)
- **Purpose**: Test business logic in isolation
- **Example**: `useMessageThread.test.ts`, `useMessageInput.test.ts`
- **Benefits**: Test complex state management and side effects

```typescript
describe('useMessageThread', () => {
  it('should initialize with default state', () => {
    const { result } = renderHook(() => useMessageThread(mockProps))
    expect(result.current.messages).toEqual([])
  })
})
```

### 3. **Component Tests** (`src/components/__tests__/`)
- **Purpose**: Test UI components and user interactions
- **Example**: `MessageThreadHeader.test.tsx`
- **Benefits**: Test component rendering and user interactions

```typescript
describe('MessageThreadHeader', () => {
  it('should render user info correctly', () => {
    const { getByText } = render(<MessageThreadHeader user={mockUser} />)
    expect(getByText('John Doe')).toBeTruthy()
  })
})
```

### 4. **Screen Tests** (`src/screens/__tests__/`)
- **Purpose**: Test full screen integration
- **Example**: `MessageThreadScreen.test.tsx`
- **Benefits**: Test component integration and user flows

```typescript
describe('MessageThreadScreen', () => {
  it('should handle send message', async () => {
    const { getByTestId } = render(<MessageThreadScreen />)
    const sendButton = getByTestId('send-button')
    fireEvent.press(sendButton)
    // Verify behavior
  })
})
```

## Mocking Strategy

### 1. **API Services**
```typescript
jest.mock('../../services/api/messages', () => ({
  fetchMessagesBetween: jest.fn(() => Promise.resolve([])),
  sendMessage: jest.fn(() => Promise.resolve({ id: 'test-id' })),
}))
```

### 2. **Navigation**
```typescript
jest.mock('@react-navigation/native', () => ({
  useRoute: () => ({ params: { userId: 'test-user' } }),
  useNavigation: () => ({ navigate: jest.fn() }),
}))
```

### 3. **Contexts**
```typescript
jest.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'user1' } }),
}))
```

### 4. **Custom Hooks**
```typescript
jest.mock('../../hooks/useMessageThread', () => ({
  useMessageThread: jest.fn(() => mockHookReturn),
}))
```

## Test Utilities

### 1. **Mock Data**
```typescript
const mockMessages = [
  {
    id: '1',
    content: 'Hello',
    sender_id: 'user1',
    recipient_id: 'user2',
    created_at: '2024-01-15T10:00:00Z',
    attachments: []
  }
]
```

### 2. **Test Helpers**
```typescript
const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <AuthProvider>
      <ThemeProvider>
        {component}
      </ThemeProvider>
    </AuthProvider>
  )
}
```

## Best Practices

### 1. **Test Organization**
- Group related tests with `describe` blocks
- Use descriptive test names
- Test one behavior per test

### 2. **Mocking**
- Mock external dependencies
- Keep mocks simple and focused
- Use `jest.clearAllMocks()` in `beforeEach`

### 3. **Assertions**
- Test behavior, not implementation
- Use specific assertions
- Test error cases

### 4. **Async Testing**
```typescript
it('should handle async operations', async () => {
  const { result } = renderHook(() => useMessageThread(mockProps))
  
  await act(async () => {
    await result.current.handleSend('Hello')
  })
  
  expect(result.current.messages).toHaveLength(1)
})
```

## Coverage Goals

- **Statements**: 80%+
- **Branches**: 80%+
- **Functions**: 80%+
- **Lines**: 80%+

## Debugging Tests

### 1. **Verbose Output**
```bash
npm test -- --verbose
```

### 2. **Debug Mode**
```bash
npm test -- --debug
```

### 3. **Single Test**
```bash
npm test -- --testNamePattern="specific test name"
```

## Common Issues

### 1. **Jest Configuration**
- Ensure `jest.config.js` is properly configured
- Check that `setup.ts` is included

### 2. **Mock Dependencies**
- Mock all external dependencies
- Use `jest.mock()` at the top of test files

### 3. **Async Operations**
- Use `act()` for state updates
- Use `waitFor()` for async assertions

### 4. **TypeScript Errors**
- Install `@types/jest` for Jest types
- Ensure proper TypeScript configuration

## Continuous Integration

Tests run automatically in CI/CD pipelines:

```yaml
# Example GitHub Actions
- name: Run Tests
  run: npm test -- --coverage --watchAll=false
```

## Future Improvements

1. **E2E Testing**: Add Detox for end-to-end tests
2. **Visual Testing**: Add Storybook for component testing
3. **Performance Testing**: Add performance benchmarks
4. **Accessibility Testing**: Add accessibility testing tools 