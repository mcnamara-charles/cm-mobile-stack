import { useState, useCallback } from 'react'
import { RefreshControl } from 'react-native'

export const useRefreshableScroll = (
  onRefresh: () => Promise<void>
) => {
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = useCallback(async () => {
    try {
      setRefreshing(true)
      await onRefresh()
    } finally {
      setRefreshing(false)
    }
  }, [onRefresh])

  const refreshControl = (
    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
  )

  return { refreshing, refreshControl }
}