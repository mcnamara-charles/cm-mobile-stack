import React, { useState } from 'react'
import {
  Modal,
  TouchableOpacity,
  Pressable,
  Image,
  Dimensions,
  View,
  StyleSheet,
} from 'react-native'
import { ThemedIcon, ThemedText } from './themed'
import { useTheme } from '../context/themeContext'
import { MessageAttachment } from '../services/api/messages'

const SCREEN_WIDTH = Dimensions.get('window').width

interface ImageLightboxProps {
  visible: boolean
  onClose: () => void
  images?: MessageAttachment[]
  imageUrl?: string
  initialIndex?: number
}

export default function ImageLightbox({ 
  visible, 
  onClose, 
  images, 
  imageUrl,
  initialIndex = 0 
}: ImageLightboxProps) {
  const { theme } = useTheme()
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null)

  // Determine if we're showing multiple images or a single image
  const isMultipleImages = images && images.length > 0
  const currentImageUrl = isMultipleImages ? images[currentIndex]?.url : imageUrl

  // Reset current index when images change
  React.useEffect(() => {
    setCurrentIndex(initialIndex)
  }, [initialIndex, images])

  // Function to calculate lightbox image style based on orientation
  const getLightboxImageStyle = (dimensions: { width: number; height: number }) => {
    const { width, height } = dimensions
    const screenWidth = SCREEN_WIDTH
    const screenHeight = Dimensions.get('window').height
    
    const isPortrait = height > width
    const aspectRatio = width / height
    
    if (isPortrait) {
      // Portrait images: take up most of screen height
      const maxHeight = screenHeight * 0.8
      const calculatedWidth = maxHeight * aspectRatio
      
      return {
        width: Math.min(calculatedWidth, screenWidth * 0.9),
        height: maxHeight,
      }
    } else {
      // Landscape images: fit to screen width
      const maxWidth = screenWidth * 0.9
      const calculatedHeight = maxWidth / aspectRatio
      
      return {
        width: maxWidth,
        height: Math.min(calculatedHeight, screenHeight * 0.8),
      }
    }
  }

  const handleImageLoad = () => {
    // Get image dimensions using Image.getSize
    if (currentImageUrl) {
      Image.getSize(currentImageUrl, (width, height) => {
        setImageDimensions({ width, height })
        console.log('Lightbox image loaded:', { width, height })
      }, (error) => {
        console.error('Failed to get image dimensions:', error)
      })
    }
  }

  const handleImageError = (e: any) => {
    console.error('Lightbox image failed to load:', e.nativeEvent.error)
  }

  const goToNext = () => {
    if (isMultipleImages && currentIndex < images!.length - 1) {
      setCurrentIndex(prev => prev + 1)
    }
  }

  const goToPrevious = () => {
    if (isMultipleImages && currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
    }
  }

  if (!visible || (!isMultipleImages && !imageUrl)) return null

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <Pressable
        style={styles.lightboxOverlay}
        onPress={onClose}
      >
        {/* Swipe areas for navigation */}
        {isMultipleImages && images!.length > 1 && (
          <>
            {/* Left half - go to next image */}
            {currentIndex < images!.length - 1 && (
              <TouchableOpacity
                style={styles.lightboxSwipeArea}
                onPress={goToNext}
                activeOpacity={0}
              />
            )}
            
            {/* Right half - go to previous image */}
            {currentIndex > 0 && (
              <TouchableOpacity
                style={[styles.lightboxSwipeArea, styles.lightboxSwipeAreaRight]}
                onPress={goToPrevious}
                activeOpacity={0}
              />
            )}
          </>
        )}
        
        <View style={[styles.lightboxContent, { overflow: 'visible' }]}>
          <View style={styles.lightboxImageContainer}>
            <Image
              key={`lightbox-${currentImageUrl}`}
              source={{ uri: currentImageUrl }}
              style={[
                styles.lightboxImage,
                imageDimensions && getLightboxImageStyle(imageDimensions)
              ]}
              resizeMode="contain"
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          </View>

          {/* Image counter */}
          {isMultipleImages && images!.length > 1 && (
            <View style={styles.lightboxCounter}>
              <ThemedText style={styles.lightboxCounterText}>
                {currentIndex + 1} / {images!.length}
              </ThemedText>
            </View>
          )}

          {/* Navigation arrows */}
          {isMultipleImages && images!.length > 1 && (
            <>
              {/* Left arrow */}
              {currentIndex > 0 && (
                <TouchableOpacity
                  style={[styles.lightboxArrow, styles.lightboxArrowLeft, { backgroundColor: theme.colors.card }]}
                  onPress={goToPrevious}
                  activeOpacity={0.8}
                >
                  <ThemedIcon
                    type="ionicons"
                    name="chevron-back"
                    size={24}
                    color={theme.colors.text}
                  />
                </TouchableOpacity>
              )}

              {/* Right arrow */}
              {currentIndex < images!.length - 1 && (
                <TouchableOpacity
                  style={[styles.lightboxArrow, styles.lightboxArrowRight, { backgroundColor: theme.colors.card }]}
                  onPress={goToNext}
                  activeOpacity={0.8}
                >
                  <ThemedIcon
                    type="ionicons"
                    name="chevron-forward"
                    size={24}
                    color={theme.colors.text}
                  />
                </TouchableOpacity>
              )}
            </>
          )}

          <TouchableOpacity
            style={[styles.closeButton, { backgroundColor: theme.colors.card }]}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <ThemedIcon
              type="ionicons"
              name="close"
              size={24}
              color={theme.colors.text}
            />
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  )
}

const styles = StyleSheet.create({
  lightboxOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lightboxContent: {
    width: SCREEN_WIDTH,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lightboxImageContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  lightboxImage: {
    width: '100%',
    height: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    right: 30,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    zIndex: 10,
  },
  lightboxCounter: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  lightboxCounterText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  lightboxArrow: {
    position: 'absolute',
    top: '50%',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    transform: [{ translateY: -25 }],
    zIndex: 10,
  },
  lightboxArrowLeft: {
    left: 30,
  },
  lightboxArrowRight: {
    right: 30,
  },
  lightboxSwipeArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '50%',
    height: '100%',
    zIndex: 1,
  },
  lightboxSwipeAreaRight: {
    left: '50%',
  },
}) 