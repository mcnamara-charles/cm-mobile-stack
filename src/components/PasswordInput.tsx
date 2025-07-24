import { useState } from 'react'
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'

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

  return (
    <View style={styles.wrapper}>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        secureTextEntry={!show}
        value={value}
        onChangeText={onChangeText}
        autoCapitalize="none"
        autoCorrect={false}
        {...rest}
      />
      <TouchableOpacity
        onPress={() => setShow(prev => !prev)}
        style={styles.iconWrapper}
        activeOpacity={0.7}
      >
        <Ionicons
          name={show ? 'eye-off-outline' : 'eye-outline'}
          size={22}
          color="#666"
        />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingRight: 0,
    marginBottom: 14,
    backgroundColor: '#f9f9f9',
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111',
  },
  iconWrapper: {
    padding: 12,
    borderLeftWidth: 1,
    borderLeftColor: '#ccc',
  },
})
