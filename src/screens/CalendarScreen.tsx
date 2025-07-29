import React, { useState } from 'react'
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Modal,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from 'react-native'
import { useTheme } from '../context/themeContext'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../services/supabaseClient'
import { addBlackoutDate, fetchUserUnavailabilities, fetchUserAvailabilities } from '../services/api/availability'
import { ThemedView, ThemedText, ThemedIcon } from '../components/themed'
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths, isSameMonth, isSameDay, isToday } from 'date-fns'
import { AppHeader } from '../components/themed/AppHeader'
import { useNavigation } from '@react-navigation/native'

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const SCREEN_WIDTH = Dimensions.get('window').width
const CALENDAR_PADDING = 24
const DAY_CELL_SIZE = Math.floor((SCREEN_WIDTH - CALENDAR_PADDING * 2) / 7)

export default function CalendarScreen() {
  const { theme } = useTheme()
  const { user } = useAuth()
  const navigation = useNavigation()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false)
  const [isAvailableForBookings, setIsAvailableForBookings] = useState(true)
  const [userProfile, setUserProfile] = useState<{ is_provider?: boolean } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [unavailableDays, setUnavailableDays] = useState<string[]>([])
  const [userAvailabilities, setUserAvailabilities] = useState<any[]>([])
  const [showHelpModal, setShowHelpModal] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  // Fetch user profile to check is_provider flag
  React.useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return
      try {
        const { data, error } = await supabase
          .from('users')
          .select('is_provider')
          .eq('id', user.id)
          .single()
        
        if (!error && data) {
          setUserProfile(data)
        }
      } catch (error) {
        console.error('Error fetching user profile:', error)
      }
    }

    fetchUserProfile()
  }, [user])

  // Fetch unavailable days and user availabilities for the current month
  const fetchAvailabilityData = async () => {
    if (!user) return
    setIsLoading(true)
    try {
      // Fetch unavailable days
      const unavailabilities = await fetchUserUnavailabilities(user.id)
      const unavailableDates = unavailabilities.map(u => u.date)
      setUnavailableDays(unavailableDates)
      // Fetch user's general availability
      const availabilities = await fetchUserAvailabilities(user.id)
      setUserAvailabilities(availabilities)
    } catch (error) {
      console.error('Error fetching availability data:', error)
    } finally {
      setIsLoading(false)
      setRefreshing(false)
    }
  }

  React.useEffect(() => {
    fetchAvailabilityData()
  }, [user, currentMonth])

  // Check if selected date is unavailable when modal opens
  React.useEffect(() => {
    const checkAvailabilityForDate = async () => {
      if (!user || !selectedDate || !showAvailabilityModal) return
      
      try {
        const unavailabilities = await fetchUserUnavailabilities(user.id)
        const selectedDateStr = format(selectedDate, 'yyyy-MM-dd')
        const isUnavailable = unavailabilities.some(
          (unavailability) => unavailability.date === selectedDateStr
        )
        setIsAvailableForBookings(!isUnavailable)
      } catch (error) {
        console.error('Error checking availability:', error)
        setIsAvailableForBookings(true) // Default to available on error
      }
    }

    checkAvailabilityForDate()
  }, [user, selectedDate, showAvailabilityModal])

  // Generate all days to display in the current month grid (including leading/trailing days)
  const getMonthDays = () => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const startDate = startOfWeek(monthStart)
    const endDate = endOfWeek(monthEnd)
    const days = []
    let day = startDate
    while (day <= endDate) {
      days.push(day)
      day = addDays(day, 1)
    }
    return days
  }

  const days = getMonthDays()

  // Helper function to format time to 12-hour format
  const formatTime = (time: string): string => {
    if (!time) return '9:00 AM'
    const [hour, minute] = time.split(':').map(Number)
    const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
    const period = hour >= 12 ? 'PM' : 'AM'
    return `${hour12}:${minute.toString().padStart(2, '0')} ${period}`
  }

  // Helper function to get availability for a specific day
  const getAvailabilityForDate = (date: Date) => {
    const dayOfWeek = date.getDay() // 0 = Sunday, 6 = Saturday
    const availability = userAvailabilities.find(a => a.day_of_week === dayOfWeek)
    
    if (!availability) {
      return null
    }
    
    return {
      startTime: formatTime(availability.start_time),
      endTime: formatTime(availability.end_time),
      isAvailable: true
    }
  }

  // Helper function to check if a day has availability
  const hasAvailability = (date: Date) => {
    const dayOfWeek = date.getDay()
    return userAvailabilities.some(a => a.day_of_week === dayOfWeek)
  }

  // Helper function to check if a day has zero availability (missing from table)
  const hasZeroAvailability = (date: Date) => {
    const dayOfWeek = date.getDay()
    return !userAvailabilities.some(a => a.day_of_week === dayOfWeek)
  }

  // Placeholder for events (easy to hook up later)
  const getEventsForDate = (date: Date) => {
    return []
  }

  // Split days into weeks for perfect grid
  const weeks: Date[][] = []
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7))
  }

  const handleAvailabilityPress = () => {
    setShowAvailabilityModal(true)
  }

  const handleSaveAvailability = async () => {
    if (!user || !selectedDate) return
    
    setIsLoading(true)
    try {
      const selectedDateStr = format(selectedDate, 'yyyy-MM-dd')
      
      if (isAvailableForBookings) {
        // User wants to be available - remove from unavailabilities if exists
        const { error } = await supabase
          .from('unavailabilities')
          .delete()
          .eq('user_id', user.id)
          .eq('date', selectedDateStr)
        
        if (error) {
          console.error('Error removing unavailability:', error)
          throw error
        }
      } else {
        // User wants to be unavailable - add to unavailabilities
        await addBlackoutDate(user.id, {
          date: selectedDateStr,
          reason: 'Manual availability setting'
        })
      }
      
      // Refresh unavailable days list
      const unavailabilities = await fetchUserUnavailabilities(user.id)
      const unavailableDates = unavailabilities.map(u => u.date)
      setUnavailableDays(unavailableDates)
      
      setShowAvailabilityModal(false)
    } catch (error) {
      console.error('Error saving availability:', error)
      // You might want to show an error message to the user here
    } finally {
      setIsLoading(false)
    }
  }

  const handleCloseModal = () => {
    setShowAvailabilityModal(false)
  }

  return (
    <ThemedView style={{ flex: 1, position: 'relative', backgroundColor: theme.colors.background }}>
      <AppHeader title="Calendar">
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity 
            style={styles.headerButton} 
            activeOpacity={0.7}
            onPress={() => setShowHelpModal(true)}
          >
            <ThemedIcon type="ionicons" name="help" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerButton} 
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Availability' as never)}
          >
            <ThemedIcon type="ionicons" name="settings-outline" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
      </AppHeader>
      
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true)
              fetchAvailabilityData()
            }}
            tintColor={theme.colors.primary}
          />
        }
      >
        <View style={{ height: 16 }} />
        <View style={[styles.header, { borderColor: theme.colors.border }]}> 
          <TouchableOpacity onPress={() => setCurrentMonth(subMonths(currentMonth, 1))} style={styles.navBtn}>
            <ThemedText style={[styles.navBtnText, { color: theme.colors.primary }]}>{'‹'}</ThemedText>
          </TouchableOpacity>
          <ThemedText style={[styles.headerTitle, { color: theme.colors.text }]}> 
            {format(currentMonth, 'MMMM yyyy')}
          </ThemedText>
          <TouchableOpacity onPress={() => setCurrentMonth(addMonths(currentMonth, 1))} style={styles.navBtn}>
            <ThemedText style={[styles.navBtnText, { color: theme.colors.primary }]}>{'›'}</ThemedText>
          </TouchableOpacity>
        </View>
        <View style={{ height: 16 }} />
        <View style={[styles.weekRow, { paddingHorizontal: CALENDAR_PADDING, marginBottom: 4 }]}> 
          {WEEK_DAYS.map((day) => (
            <ThemedText key={day} style={[styles.weekDay, { color: theme.colors.mutedText, width: DAY_CELL_SIZE }]}>{day}</ThemedText>
          ))}
        </View>

        <View style={[styles.grid, { paddingHorizontal: CALENDAR_PADDING }]}> 
          {/* Loader overlay covers everything below the header */}
          {isLoading && (
            <View style={{
              position: 'absolute',
              top: 0, // set to 0 to cover the header too, or adjust if you want to leave header visible
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.35)',
              zIndex: 100,
              alignItems: 'center',
              justifyContent: 'center',
            }} pointerEvents="auto">
              <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
          )}
          {weeks.map((week, wIdx) => (
            <View key={wIdx} style={styles.weekRow}>
              {week.map((day, dIdx) => {
                const isCurrentMonth = isSameMonth(day, currentMonth)
                const isSelected = selectedDate && isSameDay(day, selectedDate)
                const today = isToday(day)
                const dayStr = format(day, 'yyyy-MM-dd')
                const isUnavailable = unavailableDays.includes(dayStr)
                const dayAvailability = getAvailabilityForDate(day)
                const hasDayAvailability = hasAvailability(day)
                const hasZeroDayAvailability = hasZeroAvailability(day)
                
                return (
                  <TouchableOpacity
                    key={dIdx}
                    style={{
                      width: DAY_CELL_SIZE,
                      height: DAY_CELL_SIZE,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    onPress={() => setSelectedDate(day)}
                    activeOpacity={0.7}
                    disabled={isLoading}
                  >
                    <View style={{
                      width: DAY_CELL_SIZE * 0.8,
                      height: DAY_CELL_SIZE * 0.8,
                      borderRadius: 8, // Rounded square instead of circle
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: isLoading
                        ? theme.colors.input
                        : isUnavailable || hasZeroDayAvailability
                          ? theme.colors.mutedText + '20'
                          : isSelected
                            ? theme.colors.primary
                            : today
                              ? theme.colors.primary + '22'
                              : 'transparent',
                      borderWidth: today && !isSelected ? 2 : 0,
                      borderColor: today && !isSelected ? theme.colors.primary : 'transparent',
                      opacity: isCurrentMonth ? 1 : 0.35,
                      position: 'relative',
                    }}>
                      <ThemedText
                        style={{
                          color: isSelected
                            ? '#fff'
                            : today
                              ? theme.colors.primary
                              : isUnavailable || hasZeroDayAvailability
                                ? theme.colors.mutedText
                                : theme.colors.text,
                          fontWeight: isSelected || today ? '700' : '500',
                          fontSize: 16,
                        }}
                      >
                        {format(day, 'd')}
                      </ThemedText>
                      
                      {/* Unavailable indicator - diagonal striped pattern */}
                      {(isUnavailable || hasZeroDayAvailability) && isCurrentMonth && (
                        <View style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          borderRadius: 8,
                          overflow: 'hidden',
                        }}>
                          {/* Diagonal striped pattern */}
                          {[...Array(12)].map((_, index) => (
                            <View
                              key={index}
                              style={{
                                position: 'absolute',
                                width: DAY_CELL_SIZE * 3,
                                height: 3,
                                backgroundColor: isSelected 
                                  ? '#fff' 
                                  : today 
                                    ? theme.colors.primary 
                                    : theme.colors.mutedText,
                                opacity: isSelected ? 0.3 : 0.4,
                                left: -DAY_CELL_SIZE,
                                transform: [
                                  { rotate: '45deg' },
                                  { translateY: index * 7 - 40 }
                                ],
                              }}
                            />
                          ))}
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                )
              })}
            </View>
          ))}
        </View>

        <View style={[styles.eventsPanel, { backgroundColor: theme.colors.card }]}> 
          <ThemedText style={[styles.eventsTitle, { color: theme.colors.text }]}> 
            {selectedDate ? format(selectedDate, 'EEEE, MMM d, yyyy') : 'Select a date'}
          </ThemedText>
          
          {userProfile?.is_provider && (
            <TouchableOpacity 
              style={[styles.availabilityButton, { backgroundColor: theme.colors.primary }]}
              activeOpacity={0.85}
              onPress={handleAvailabilityPress}
            >
              <ThemedIcon type="ionicons" name="time-outline" size={16} color="#fff" />
              <ThemedText style={styles.availabilityButtonText}>Edit my availability</ThemedText>
            </TouchableOpacity>
          )}
          
          {selectedDate && getEventsForDate(selectedDate).length === 0 && (
            <View style={styles.noEventsContainer}>
              <ThemedIcon 
                type="ionicons" 
                name="calendar-outline" 
                size={24} 
                color={theme.colors.mutedText} 
                style={styles.noEventsIcon}
              />
              <ThemedText style={[styles.noEvents, { color: theme.colors.mutedText }]}>
                No events for this day
              </ThemedText>
              <ThemedText style={[styles.noEventsSubtext, { color: theme.colors.mutedText }]}>
                Tap the button above to set your availability
              </ThemedText>
            </View>
          )}
          {/* Future: map events here */}
        </View>
      </ScrollView>
      
      {/* Availability Modal */}
      <Modal
        visible={showAvailabilityModal}
        transparent
        animationType="fade"
        statusBarTranslucent
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={handleCloseModal}
        >
          <View style={[styles.modalContent, { backgroundColor: theme.colors.background }]}>
            {/* Header */}
            <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border }]}>
              <View style={styles.modalTitleContainer}>
                <ThemedText style={[styles.modalTitle, { color: theme.colors.mutedText }]}>
                  {selectedDate ? format(selectedDate, 'EEEE, MMMM d, yyyy') : 'Select a date'}
                </ThemedText>
                <ThemedText style={[styles.modalBookings, { color: theme.colors.text }]}>
                  0 bookings
                </ThemedText>
              </View>
              <TouchableOpacity
                style={[styles.closeButton, { backgroundColor: theme.colors.card }]}
                onPress={handleCloseModal}
                activeOpacity={0.8}
              >
                <ThemedIcon type="ionicons" name="close" size={20} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            {/* Content */}
            <View style={styles.modalBody}>
              {/* Availability Information */}
              {selectedDate && (() => {
                const dayAvailability = getAvailabilityForDate(selectedDate)
                const hasDayAvailability = hasAvailability(selectedDate)
                const hasZeroDayAvailability = hasZeroAvailability(selectedDate)
                
                return (
                  <View style={[styles.availabilityInfoContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                    <View style={styles.availabilityInfoHeader}>
                      <ThemedIcon type="ionicons" name="time-outline" size={16} color={theme.colors.primary} />
                      <ThemedText style={[styles.availabilityInfoTitle, { color: theme.colors.text }]}>
                        Weekly Schedule
                      </ThemedText>
                    </View>
                    
                    {hasDayAvailability ? (
                      <View style={styles.availabilityInfoContent}>
                        <ThemedText style={[styles.availabilityInfoText, { color: theme.colors.text }]}>
                          Available: {dayAvailability?.startTime} - {dayAvailability?.endTime}
                        </ThemedText>
                        <ThemedText style={[styles.availabilityInfoSubtext, { color: theme.colors.mutedText }]}>
                          This day follows your weekly schedule
                        </ThemedText>
                      </View>
                    ) : hasZeroDayAvailability ? (
                      <View style={styles.availabilityInfoContent}>
                        <ThemedText style={[styles.availabilityInfoText, { color: theme.colors.mutedText }]}>
                          No availability on this day
                        </ThemedText>
                        <ThemedText style={[styles.availabilityInfoSubtext, { color: theme.colors.mutedText }]}>
                          This day is not available in your weekly schedule
                        </ThemedText>
                      </View>
                    ) : (
                      <View style={styles.availabilityInfoContent}>
                        <ThemedText style={[styles.availabilityInfoText, { color: theme.colors.mutedText }]}>
                          No weekly schedule set
                        </ThemedText>
                        <ThemedText style={[styles.availabilityInfoSubtext, { color: theme.colors.mutedText }]}>
                          Go to Settings → Availability to set your schedule
                        </ThemedText>
                      </View>
                    )}
                  </View>
                )
              })()}
              
              <View style={[styles.toggleContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                <View style={styles.toggleLabelContainer}>
                  <ThemedText style={[styles.toggleLabel, { color: theme.colors.text }]}>
                    Available for Bookings
                  </ThemedText>
                </View>
                <TouchableOpacity
                  style={[
                    styles.toggleSwitch,
                    {
                      backgroundColor: isAvailableForBookings ? theme.colors.primary : theme.colors.border,
                    }
                  ]}
                  onPress={() => setIsAvailableForBookings(!isAvailableForBookings)}
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      styles.toggleThumb,
                      {
                        backgroundColor: '#fff',
                        transform: [{ translateX: isAvailableForBookings ? 23 : 3 }]
                      }
                    ]}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Footer */}
            <View style={[styles.modalFooter, { borderTopColor: theme.colors.border }]}>
              <TouchableOpacity
                style={[
                  styles.saveButton, 
                  { 
                    backgroundColor: isLoading ? theme.colors.border : theme.colors.primary,
                    opacity: isLoading ? 0.6 : 1
                  }
                ]}
                onPress={handleSaveAvailability}
                activeOpacity={0.85}
                disabled={isLoading}
              >
                <ThemedText style={styles.saveButtonText}>
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>

      {/* Help Modal */}
      <Modal
        visible={showHelpModal}
        transparent
        animationType="slide"
        statusBarTranslucent
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={{ flex: 1 }}
            onPress={() => setShowHelpModal(false)}
          />
          <View style={[styles.helpModalContent, { backgroundColor: theme.colors.background }]}>
            {/* Header with drag indicator */}
            <View style={styles.helpModalDragIndicator}>
              <View style={[styles.dragHandle, { backgroundColor: theme.colors.border }]} />
            </View>
            
            {/* Header */}
            <View style={[styles.helpModalHeader, { borderBottomColor: theme.colors.border }]}>
              <View style={styles.helpModalTitleContainer}>
                <ThemedText style={[styles.helpModalTitle, { color: theme.colors.text }]}>
                  Calendar Guide
                </ThemedText>
                <ThemedText style={[styles.helpModalSubtitle, { color: theme.colors.mutedText }]}>
                  Understanding your calendar states
                </ThemedText>
              </View>
              <TouchableOpacity
                style={[styles.closeButton, { backgroundColor: theme.colors.card }]}
                onPress={() => setShowHelpModal(false)}
                activeOpacity={0.8}
              >
                <ThemedIcon type="ionicons" name="close" size={20} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            {/* Scrollable Content */}
            <ScrollView 
              style={styles.helpModalScrollView}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 40 }}
            >
              <View style={styles.helpModalBody}>
                {/* Example 1: Open (Empty square) */}
                <View style={[styles.helpExampleContainer, { backgroundColor: theme.colors.card, borderRadius: 12, padding: 16, marginBottom: 16 }]}>
                  <View style={styles.helpExampleHeader}>
                    <View style={[styles.helpExampleDay, { backgroundColor: 'transparent', borderWidth: 1, borderColor: theme.colors.border }]}>
                      <ThemedText style={[styles.helpExampleNumber, { color: theme.colors.text }]}>
                        15
                      </ThemedText>
                    </View>
                    <View style={styles.helpExampleText}>
                      <ThemedText style={[styles.helpExampleTitle, { color: theme.colors.text }]}>
                        Open
                      </ThemedText>
                      <ThemedText style={[styles.helpExampleSubtitle, { color: theme.colors.mutedText }]}>
                        You are free for bookings on this day
                      </ThemedText>
                    </View>
                  </View>
                  <View style={styles.helpExampleDescription}>
                    <ThemedIcon type="ionicons" name="checkmark-circle" size={16} color={theme.colors.primary} />
                    <ThemedText style={[styles.helpExampleDescriptionText, { color: theme.colors.mutedText }]}>
                      Available for new bookings and appointments
                    </ThemedText>
                  </View>
                </View>

                {/* Example 2: Unavailable (Grey with hatching) */}
                <View style={[styles.helpExampleContainer, { backgroundColor: theme.colors.card, borderRadius: 12, padding: 16, marginBottom: 16 }]}>
                  <View style={styles.helpExampleHeader}>
                    <View style={[styles.helpExampleDay, { backgroundColor: theme.colors.mutedText + '20' }]}>
                      <ThemedText style={[styles.helpExampleNumber, { color: theme.colors.mutedText }]}>
                        15
                      </ThemedText>
                      {/* Diagonal striped pattern - identical to calendar */}
                      <View style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        borderRadius: 8,
                        overflow: 'hidden',
                      }}>
                        {[...Array(12)].map((_, index) => (
                          <View
                            key={index}
                            style={{
                              position: 'absolute',
                              width: 40 * 3,
                              height: 3,
                              backgroundColor: theme.colors.mutedText,
                              opacity: 0.4,
                              left: -40,
                              transform: [
                                { rotate: '45deg' },
                                { translateY: index * 7 - 40 }
                              ],
                            }}
                          />
                        ))}
                      </View>
                    </View>
                    <View style={styles.helpExampleText}>
                      <ThemedText style={[styles.helpExampleTitle, { color: theme.colors.text }]}>
                        No Availability
                      </ThemedText>
                      <ThemedText style={[styles.helpExampleSubtitle, { color: theme.colors.mutedText }]}>
                        You set yourself as unavailable for this day
                      </ThemedText>
                    </View>
                  </View>
                  <View style={styles.helpExampleDescription}>
                    <ThemedIcon type="ionicons" name="time-outline" size={16} color={theme.colors.mutedText} />
                    <ThemedText style={[styles.helpExampleDescriptionText, { color: theme.colors.mutedText }]}>
                      Use the "Edit my availability" button to change this
                    </ThemedText>
                  </View>
                </View>

                {/* Example 3: Booked (Red with hatching) */}
                <View style={[styles.helpExampleContainer, { backgroundColor: theme.colors.card, borderRadius: 12, padding: 16, marginBottom: 16 }]}>
                  <View style={styles.helpExampleHeader}>
                    <View style={[styles.helpExampleDay, { backgroundColor: '#FF3B30' + '20' }]}>
                      <ThemedText style={[styles.helpExampleNumber, { color: '#FF3B30' }]}>
                        15
                      </ThemedText>
                      {/* Diagonal striped pattern - identical to calendar */}
                      <View style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        borderRadius: 8,
                        overflow: 'hidden',
                      }}>
                        {[...Array(12)].map((_, index) => (
                          <View
                            key={index}
                            style={{
                              position: 'absolute',
                              width: 40 * 3,
                              height: 3,
                              backgroundColor: '#FF3B30',
                              opacity: 0.4,
                              left: -40,
                              transform: [
                                { rotate: '45deg' },
                                { translateY: index * 7 - 40 }
                              ],
                            }}
                          />
                        ))}
                      </View>
                    </View>
                    <View style={styles.helpExampleText}>
                      <ThemedText style={[styles.helpExampleTitle, { color: theme.colors.text }]}>
                        No Availability
                      </ThemedText>
                      <ThemedText style={[styles.helpExampleSubtitle, { color: theme.colors.mutedText }]}>
                        All slots are booked for this day
                      </ThemedText>
                    </View>
                  </View>
                  <View style={styles.helpExampleDescription}>
                    <ThemedIcon type="ionicons" name="calendar" size={16} color="#FF3B30" />
                    <ThemedText style={[styles.helpExampleDescriptionText, { color: theme.colors.mutedText }]}>
                      This day is fully booked with existing appointments
                    </ThemedText>
                  </View>
                </View>

                {/* Pro tip */}
                <View style={[styles.proTipContainer, { backgroundColor: theme.colors.primary + '10', borderColor: theme.colors.primary + '20' }]}>
                  <ThemedIcon type="ionicons" name="bulb-outline" size={20} color={theme.colors.primary} />
                  <View style={styles.proTipContent}>
                    <ThemedText style={[styles.proTipTitle, { color: theme.colors.primary }]}>
                      Pro Tip
                    </ThemedText>
                    <ThemedText style={[styles.proTipText, { color: theme.colors.mutedText }]}>
                      Tap any day to select it and manage your availability. Only providers can edit availability settings.
                    </ThemedText>
                  </View>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  navBtn: {
    padding: 8,
    borderRadius: 6,
  },
  navBtnText: {
    fontSize: 28,
    fontWeight: '700',
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  weekDay: {
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 15,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  grid: {
    marginTop: 6,
    marginBottom: 18,
  },
  eventsPanel: {
    marginTop: 8,
    marginHorizontal: 24,
    borderRadius: 12,
    padding: 20,
    minHeight: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  eventsTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 16,
  },
  availabilityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    gap: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  availabilityButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  noEventsContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  noEventsIcon: {
    marginBottom: 12,
  },
  noEvents: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 4,
  },
  noEventsSubtext: {
    fontSize: 13,
    textAlign: 'center',
    opacity: 0.8,
  },
  headerButton: {
    padding: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  modalTitleContainer: {
    flex: 1,
    marginRight: 10,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '400',
    marginBottom: 4,
  },
  modalBookings: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeButton: {
    padding: 8,
    borderRadius: 8,
  },
  modalBody: {
    padding: 20,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  toggleLabelContainer: {
    flex: 1,
    marginRight: 16,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  toggleSwitch: {
    width: 44,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  toggleThumb: {
    width: 18,
    height: 18,
    borderRadius: 9,
    position: 'absolute',
    left: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
  },
  saveButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  helpModalContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '70%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  helpModalDragIndicator: {
    alignItems: 'center',
    paddingVertical: 10,
    marginBottom: 10,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  helpModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  helpModalTitleContainer: {
    flex: 1,
    marginRight: 10,
  },
  helpModalTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  helpModalSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  helpModalBody: {
    padding: 20,
  },
  helpExampleContainer: {
    flexDirection: 'column',
    marginBottom: 24,
  },
  helpExampleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  helpExampleDay: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
    position: 'relative',
  },
  helpExampleNumber: {
    fontSize: 16,
    fontWeight: '600',
  },
  helpExampleText: {
    flex: 1,
  },
  helpExampleTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  helpExampleSubtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  helpExampleDescription: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  helpExampleDescriptionText: {
    marginLeft: 8,
    fontSize: 13,
    lineHeight: 18,
  },
  proTipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  proTipContent: {
    flex: 1,
    marginLeft: 12,
  },
  proTipTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  proTipText: {
    fontSize: 13,
    lineHeight: 18,
  },
  helpModalScrollView: {
    flex: 1,
  },
  availabilityInfoContainer: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  availabilityInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  availabilityInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  availabilityInfoContent: {
    marginTop: 4,
  },
  availabilityInfoText: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 4,
  },
  availabilityInfoSubtext: {
    fontSize: 13,
    opacity: 0.8,
  },
}) 