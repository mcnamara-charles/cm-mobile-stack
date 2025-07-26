import { useState } from 'react'
import {
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
  View,
} from 'react-native'
import { ThemedIcon } from './themed'
import { useTheme } from '../context/themeContext'
import { ThemedInputWrapper } from './themed' // adjust path if needed

type Props = TextInputProps & {
  value: string
  onChangeText: (text: string) => void
  placeholder?: string
}

export default function PasswordInput({
  value,
  onChangeText,
  placeholder = 'Password',
  ...rest
}: Props) {
  const [show, setShow] = useState(false)
  const { theme } = useTheme()

  return (
    <ThemedInputWrapper>
      <TextInput
        style={[styles.input, { color: theme.colors.text }]}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.mutedText}
        secureTextEntry={!show}
        value={value}
        onChangeText={onChangeText}
        autoCapitalize="none"
        autoCorrect={false}
        {...rest}
      />
      <TouchableOpacity
        onPress={() => setShow(prev => !prev)}
        style={[styles.iconWrapper, { borderLeftColor: theme.colors.border }]}
        activeOpacity={0.7}
      >
        <ThemedIcon
          type="ionicons"
          name={show ? 'eye-off-outline' : 'eye-outline'}
          size={22}
          color={theme.colors.mutedText}
        />
      </TouchableOpacity>
    </ThemedInputWrapper>
  )
}

const styles = StyleSheet.create({
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
  },
  iconWrapper: {
    padding: 12,
    borderLeftWidth: 1,
  },
})
