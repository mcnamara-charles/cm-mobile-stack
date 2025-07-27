import React from 'react'
import { Image, ImageProps } from 'react-native'

// Extend props to accept cacheKey
interface ThemedImageProps extends ImageProps {
  cacheKey?: string | number
}

export const ThemedImage = ({ style, cacheKey, source, ...props }: ThemedImageProps) => {
  let finalSource = source
  if (
    cacheKey &&
    source &&
    typeof source === 'object' &&
    'uri' in source &&
    typeof source.uri === 'string' &&
    source.uri.startsWith('http')
  ) {
    // Only append cacheKey if remote URI
    const sep = source.uri.includes('?') ? '&' : '?'
    finalSource = { ...source, uri: source.uri + sep + 'v=' + cacheKey }
  }
  return <Image style={style} source={finalSource} {...props} />
}