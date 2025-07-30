import { useRef, useEffect } from 'react'
import { Animated } from 'react-native'

interface UseFadeAnimationProps {
  initialValue?: number
  finalValue?: number
  duration?: number
  useNativeDriver?: boolean
  onAnimationComplete?: () => void
}

interface UseFadeAnimationReturn {
  fadeAnim: Animated.Value
  fadeIn: () => void
  fadeOut: () => void
  fadeTo: (toValue: number) => void
}

export function useFadeAnimation({
  initialValue = 0,
  finalValue = 1,
  duration = 300,
  useNativeDriver = true,
  onAnimationComplete,
}: UseFadeAnimationProps = {}): UseFadeAnimationReturn {
  const fadeAnim = useRef(new Animated.Value(initialValue)).current

  const fadeIn = () => {
    Animated.timing(fadeAnim, {
      toValue: finalValue,
      duration,
      useNativeDriver,
    }).start(onAnimationComplete)
  }

  const fadeOut = () => {
    Animated.timing(fadeAnim, {
      toValue: initialValue,
      duration,
      useNativeDriver,
    }).start(onAnimationComplete)
  }

  const fadeTo = (toValue: number) => {
    Animated.timing(fadeAnim, {
      toValue,
      duration,
      useNativeDriver,
    }).start(onAnimationComplete)
  }

  return {
    fadeAnim,
    fadeIn,
    fadeOut,
    fadeTo,
  }
} 