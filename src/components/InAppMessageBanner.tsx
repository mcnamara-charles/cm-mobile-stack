import { useRealtimeMessages } from '../context/MessageRealtimeContext'
import { useTheme } from '../context/themeContext'
import { navigationRef } from '../utils/navigationRef'
import { fetchUserById } from '../services/api/users'
import {
  Text,
  Animated,
  TouchableOpacity,
  StyleSheet,
  Platform,
  PanResponder,
  View,
  Image,
  Dimensions,
} from 'react-native'
import { useEffect, useRef, useState } from 'react'

const { width: screenWidth } = Dimensions.get('window')

interface UserData {
  id: string
  first_name: string
  last_name: string
  profile_url: string | null
}

export default function InAppMessageBanner() {
  const { latestMessage } = useRealtimeMessages()
  const { theme } = useTheme()
  const [visibleMessage, setVisibleMessage] = useState<any>(null)
  const [senderData, setSenderData] = useState<UserData | null>(null)
  const senderCache = useRef<Map<string, UserData | null>>(new Map())
  const slideAnim = useRef(new Animated.Value(-120)).current
  const scaleAnim = useRef(new Animated.Value(0.95)).current
  const opacityAnim = useRef(new Animated.Value(0)).current
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const pan = useRef(new Animated.ValueXY()).current

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dy) > 8,
    onPanResponderMove: Animated.event([null, { dy: pan.y }], {
      useNativeDriver: false,
    }),
    onPanResponderRelease: (_, gesture) => {
      if (gesture.dy < -50 || gesture.vy < -0.5) {
        dismissBanner()
      } else {
        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }).start()
      }
    },
  })

  const dismissBanner = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -120,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
        requestAnimationFrame(() => {
          setVisibleMessage(null)
          setSenderData(null)
          pan.setValue({ x: 0, y: 0 })
        })
    })
  }

  const getSenderData = async (senderId: string) => {
    if (senderCache.current.has(senderId)) {
      setSenderData(senderCache.current.get(senderId) ?? null)
      return
    }
    try {
      const user = await fetchUserById(senderId)
      senderCache.current.set(senderId, user)
      setSenderData(user)
    } catch (err) {
      console.error('Failed to fetch sender profile:', err)
      senderCache.current.set(senderId, null)
    }
  }

  useEffect(() => {
    if (!latestMessage || !navigationRef.isReady()) return

    const routes = navigationRef.getRootState()?.routes
    const currentRoute = routes?.[routes.length - 1]

    const isSameThread =
      currentRoute?.name === 'MessageThread' &&
      typeof currentRoute.params === 'object' &&
      currentRoute.params !== null &&
      'userId' in currentRoute.params &&
      (currentRoute.params as { userId: string }).userId === latestMessage.sender_id

    if (isSameThread) return

    setVisibleMessage((prev: any) => {
      if (prev?.id === latestMessage.id) return prev
      return latestMessage
    })

    getSenderData(latestMessage.sender_id)

    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start()

    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      dismissBanner()
    }, 5000)
  }, [latestMessage])

  const handlePress = () => {
    if (navigationRef.isReady() && visibleMessage) {
      navigationRef.navigate('MessageThread', {
        userId: visibleMessage.sender_id as string,
      })
      dismissBanner()
    }
  }

  if (!visibleMessage) return null

  const senderName = senderData
    ? `${senderData.first_name} ${senderData.last_name}`.trim()
    : 'New message'

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim },
            ...pan.getTranslateTransform(),
          ],
          opacity: opacityAnim,
        },
      ]}
      {...panResponder.panHandlers}
    >
      <View style={styles.shadowOverlay} />

      <TouchableOpacity activeOpacity={0.95} onPress={handlePress} style={styles.content}>
        <View style={styles.avatarContainer}>
          {senderData?.profile_url ? (
            <Image
              source={{ uri: senderData.profile_url }}
              style={styles.avatar}
              resizeMode="cover"
            />
          ) : (
            <View
              style={[
                styles.avatarFallback,
                { backgroundColor: theme.colors.primary + '20' },
              ]}
            >
              <Text style={[styles.avatarText, { color: theme.colors.primary }]}>
                {getInitials(senderName)}
              </Text>
            </View>
          )}
          <View style={[styles.onlineIndicator, { backgroundColor: theme.colors.primary }]} />
        </View>

        <View style={styles.textContainer}>
          <View style={styles.headerRow}>
            <Text style={[styles.senderName, { color: theme.colors.text }]}>
              {senderName}
            </Text>
          </View>

          <Text
            style={[styles.messageText, { color: theme.colors.mutedText }]}
            numberOfLines={2}
          >
            {visibleMessage.content}
          </Text>
        </View>

        <View style={styles.actionContainer}>
          <View style={[styles.replyButton, { backgroundColor: theme.colors.primary + '15' }]}>
            <Text style={[styles.replyText, { color: theme.colors.primary }]}>Reply</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 16,
    right: 16,
    zIndex: 1000,
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
  },
  shadowOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarFallback: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#fff',
  },
  textContainer: {
    flex: 1,
    marginRight: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  senderName: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  messageText: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 18,
  },
  actionContainer: {
    alignItems: 'center',
  },
  replyButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  replyText: {
    fontSize: 12,
    fontWeight: '600',
  },
})
