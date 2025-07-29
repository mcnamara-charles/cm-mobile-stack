import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, ScrollView, Animated, StyleSheet, KeyboardAvoidingView, Platform, Keyboard, Modal } from 'react-native';
import { useTheme } from '../context/themeContext';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { ThemedText, BackButton } from '../components/themed';
import { ThemedIcon } from '../components/themed/ThemedIcon';
import { AppHeader } from '../components/themed/AppHeader';
import { fetchUserAvailabilities, setGeneralAvailability, GeneralAvailabilityInput } from '../services/api/availability';

const days = [
  { key: 0, label: 'Su', name: 'Sunday' },
  { key: 1, label: 'M', name: 'Monday' },
  { key: 2, label: 'Tu', name: 'Tuesday' },
  { key: 3, label: 'W', name: 'Wednesday' },
  { key: 4, label: 'Th', name: 'Thursday' },
  { key: 5, label: 'F', name: 'Friday' },
  { key: 6, label: 'Sa', name: 'Saturday' },
];

type AvailabilityData = {
  [key: number]: {
    isAvailable: boolean;
    startTime: string;
    endTime: string;
  };
};

export default function AvailabilityScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation();
  const [selectedDay, setSelectedDay] = useState(0);
  const [availabilityData, setAvailabilityData] = useState<AvailabilityData>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [modifiedDays, setModifiedDays] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  
  // Time picker modal state
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [timePickerType, setTimePickerType] = useState<'start' | 'end'>('start');
  const [selectedHour, setSelectedHour] = useState(9);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState<'AM' | 'PM'>('AM');
  
  // Animation values
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(0.95)).current;
  const hourScrollRef = useRef<ScrollView>(null);
  const minuteScrollRef = useRef<ScrollView>(null);
  const periodScrollRef = useRef<ScrollView>(null);

  const selectedDayData = days.find(day => day.key === selectedDay);
  const currentDayData = availabilityData[selectedDay] || { isAvailable: true, startTime: '09:00', endTime: '17:00' };

  // Format time to 12-hour format
  const formatTime = (time: string): string => {
    if (!time) return '9:00 AM';
    // Remove seconds if present and convert to 12-hour format
    const cleanTime = time.replace(/:[0-9]{2}$/, '');
    const [hour, minute] = cleanTime.split(':').map(Number);
    const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    const period = hour >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minute.toString().padStart(2, '0')} ${period}`;
  };

  // Parse time to hour, minute and period
  const parseTime = (time: string): { hour: number; minute: number; period: 'AM' | 'PM' } => {
    const [hour, minute] = time.split(':').map(Number);
    const hour12 = hour || 9;
    const period = hour12 >= 12 ? 'PM' : 'AM';
    const hourIn12Format = hour12 === 0 ? 12 : hour12 > 12 ? hour12 - 12 : hour12;
    return { hour: hourIn12Format, minute: minute || 0, period };
  };

  // Open time picker
  const openTimePicker = (type: 'start' | 'end') => {
    setTimePickerType(type);
    const time = type === 'start' ? currentDayData.startTime : currentDayData.endTime;
    const { hour, minute, period } = parseTime(time);
    setSelectedHour(hour);
    setSelectedMinute(minute);
    setSelectedPeriod(period);
    setShowTimePicker(true);
  };

  // Set initial scroll positions when modal opens
  useEffect(() => {
    if (showTimePicker) {
      setTimeout(() => {
        const hourIndex = hours.indexOf(selectedHour);
        const minuteIndex = minutes.indexOf(selectedMinute);
        const periodIndex = periods.indexOf(selectedPeriod);
        
        if (hourScrollRef.current && hourIndex >= 0) {
          hourScrollRef.current.scrollTo({ y: hourIndex * 50, animated: false });
        }
        if (minuteScrollRef.current && minuteIndex >= 0) {
          minuteScrollRef.current.scrollTo({ y: minuteIndex * 50, animated: false });
        }
        if (periodScrollRef.current && periodIndex >= 0) {
          periodScrollRef.current.scrollTo({ y: periodIndex * 50, animated: false });
        }
      }, 100);
    }
  }, [showTimePicker, selectedHour, selectedMinute, selectedPeriod]);

  // Save time from picker
  const saveTime = () => {
    // Convert 12-hour format to 24-hour format for storage
    let hour24 = selectedHour;
    if (selectedPeriod === 'PM' && selectedHour !== 12) {
      hour24 = selectedHour + 12;
    } else if (selectedPeriod === 'AM' && selectedHour === 12) {
      hour24 = 0;
    }
    
    const formattedTime = `${hour24.toString().padStart(2, '0')}:${selectedMinute.toString().padStart(2, '0')}`;
    
    const updatedData = {
      ...availabilityData,
      [selectedDay]: {
        ...currentDayData,
        [timePickerType === 'start' ? 'startTime' : 'endTime']: formattedTime,
      },
    };
    setAvailabilityData(updatedData);
    setHasChanges(true);
    setModifiedDays(prev => new Set([...prev, selectedDay]));
    setShowTimePicker(false);
  };

  // Generate time options
  const generateTimeOptions = () => {
    const hours = Array.from({ length: 12 }, (_, i) => i + 1); // 1-12 for 12-hour format
    const minutes = [0, 15, 30, 45];
    const periods = ['AM', 'PM'];
    return { hours, minutes, periods };
  };

  const { hours, minutes, periods } = generateTimeOptions();

  // Handle scroll events for picker wheels
  const handleHourScrollEnd = (event: any) => {
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / 50);
    if (index >= 0 && index < hours.length) {
      setSelectedHour(hours[index]);
      // Ensure scroll position is exactly at the selected item
      if (hourScrollRef.current) {
        hourScrollRef.current.scrollTo({ y: index * 50, animated: true });
      }
    }
  };

  const handleMinuteScrollEnd = (event: any) => {
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / 50);
    if (index >= 0 && index < minutes.length) {
      setSelectedMinute(minutes[index]);
      // Ensure scroll position is exactly at the selected item
      if (minuteScrollRef.current) {
        minuteScrollRef.current.scrollTo({ y: index * 50, animated: true });
      }
    }
  };

  const handlePeriodScrollEnd = (event: any) => {
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / 50);
    if (index >= 0 && index < periods.length) {
      setSelectedPeriod(periods[index] as 'AM' | 'PM');
      // Ensure scroll position is exactly at the selected item
      if (periodScrollRef.current) {
        periodScrollRef.current.scrollTo({ y: index * 50, animated: true });
      }
    }
  };

  // Create default availability (9-5 every day)
  const createDefaultAvailability = (): AvailabilityData => {
    const defaultData: AvailabilityData = {};
    days.forEach(day => {
      defaultData[day.key] = {
        isAvailable: true,
        startTime: '09:00',
        endTime: '17:00',
      };
    });
    return defaultData;
  };

  // Fetch availability from API
  const fetchAvailability = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const apiData = await fetchUserAvailabilities(user.id);
      
      if (apiData && apiData.length > 0) {
        // Convert API data to our format
        const convertedData: AvailabilityData = {};
        apiData.forEach(item => {
          convertedData[item.day_of_week] = {
            isAvailable: true,
            startTime: formatTime(item.start_time),
            endTime: formatTime(item.end_time),
          };
        });
        setAvailabilityData(convertedData);
      } else {
        // No availability exists, create default
        const defaultData = createDefaultAvailability();
        setAvailabilityData(defaultData);
        
        // Save default availability to API
        const defaultAvailabilities: GeneralAvailabilityInput[] = days.map(day => ({
          dayOfWeek: day.key,
          startTime: '09:00',
          endTime: '17:00',
        }));
        
        await setGeneralAvailability(user.id, defaultAvailabilities);
      }
    } catch (error) {
      console.error('Error fetching availability:', error);
      // Fallback to default availability
      setAvailabilityData(createDefaultAvailability());
    } finally {
      setIsLoading(false);
    }
  };

  // Load availability on mount
  useEffect(() => {
    fetchAvailability();
  }, [user]);

  // Track changes
  const handleAvailabilityChange = (newValue: boolean) => {
    const updatedData = {
      ...availabilityData,
      [selectedDay]: {
        ...currentDayData,
        isAvailable: newValue,
      },
    };
    setAvailabilityData(updatedData);
    setHasChanges(true);
    setModifiedDays(prev => new Set([...prev, selectedDay]));
  };

  const handleTimeChange = (field: 'start' | 'end', value: string) => {
    // Format time to only show hours and minutes (HH:MM)
    const formattedValue = value.replace(/[^0-9]/g, '').slice(0, 4);
    let timeValue = formattedValue;
    
    if (formattedValue.length >= 2) {
      timeValue = formattedValue.slice(0, 2) + ':' + formattedValue.slice(2);
    }
    
    const updatedData = {
      ...availabilityData,
      [selectedDay]: {
        ...currentDayData,
        [field === 'start' ? 'startTime' : 'endTime']: timeValue,
      },
    };
    setAvailabilityData(updatedData);
    setHasChanges(true);
    setModifiedDays(prev => new Set([...prev, selectedDay]));
  };

  const handleDaySelection = (dayKey: number) => {
    setSelectedDay(dayKey);
    // Only reset changes if there are no modified days at all
    if (modifiedDays.size === 0) {
      setHasChanges(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!user) return;
    
    try {
      // Convert our data format to API format
      const apiAvailabilities: GeneralAvailabilityInput[] = [];
      
      Object.entries(availabilityData).forEach(([dayKey, data]) => {
        if (data.isAvailable) {
          apiAvailabilities.push({
            dayOfWeek: parseInt(dayKey),
            startTime: data.startTime,
            endTime: data.endTime,
          });
        }
      });
      
      // Save to API
      await setGeneralAvailability(user.id, apiAvailabilities);
      
      setHasChanges(false);
      setModifiedDays(new Set());
    } catch (error) {
      console.error('Error saving availability:', error);
    }
  };

  // Animate card when day is selected
  useEffect(() => {
    Animated.parallel([
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(cardScale, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [selectedDay]);

  // Keyboard event handlers
  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (event) => {
        setKeyboardHeight(event.endCoordinates.height + 100); // Increased extra padding for accessory views
      }
    );

    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <AppHeader 
          title="Availability" 
          backButton={<BackButton iconName="arrow-back" />}
        />
        <View style={styles.loadingContainer}>
          <ThemedText style={[styles.loadingText, { color: theme.colors.text }]}>
            Loading availability...
          </ThemedText>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={{ flex: 1 }}
    >
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <AppHeader 
          title="Availability" 
          backButton={<BackButton iconName="arrow-back" />}
        >
          <TouchableOpacity
            style={[
              styles.saveButton, 
              { 
                backgroundColor: hasChanges ? theme.colors.primary : theme.colors.mutedText + '40',
              }
            ]}
            onPress={hasChanges ? handleSaveChanges : undefined}
            activeOpacity={0.7}
            disabled={!hasChanges}
          >
            <ThemedText style={[
              styles.saveButtonText,
              { color: hasChanges ? '#fff' : theme.colors.mutedText }
            ]}>
              Save
            </ThemedText>
          </TouchableOpacity>
        </AppHeader>

        <ScrollView 
          style={styles.content} 
          contentContainerStyle={[
            styles.contentContainer,
            { paddingBottom: 40 + keyboardHeight }
          ]}
        >
          {/* Introduction */}
          <View style={styles.introSection}>
            <View style={[styles.introIcon, { backgroundColor: theme.colors.primary + '15' }]}>
              <ThemedIcon type="ionicons" name="calendar-outline" size={24} color={theme.colors.primary} />
            </View>
            <ThemedText style={[styles.introTitle, { color: theme.colors.text }]}>
              Set Your Weekly Schedule
            </ThemedText>
            <ThemedText style={[styles.introSubtext, { color: theme.colors.mutedText }]}>
              Configure your availability for each day of the week
            </ThemedText>
          </View>

          {/* Day Selector */}
          <View style={styles.daySelectorContainer}>
            <ThemedText style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Select Day
            </ThemedText>
            <View style={styles.daySelector}>
              {days.map((day) => (
                <TouchableOpacity
                  key={day.key}
                  style={[
                    styles.dayBox,
                    {
                      backgroundColor: selectedDay === day.key ? theme.colors.primary : 'transparent',
                      borderColor: selectedDay === day.key ? theme.colors.primary : theme.colors.border,
                      transform: [{ scale: selectedDay === day.key ? 1.05 : 1 }],
                    }
                  ]}
                  onPress={() => handleDaySelection(day.key)}
                  activeOpacity={0.7}
                >
                  <ThemedText
                    style={[
                      styles.dayText,
                      {
                        color: selectedDay === day.key ? '#fff' : theme.colors.text,
                        fontWeight: selectedDay === day.key ? '600' : '500',
                      }
                    ]}
                  >
                    {day.label}
                  </ThemedText>
                  {modifiedDays.has(day.key) && (
                    <View style={[styles.modifiedBadge, { backgroundColor: '#4CAF50' }]}>
                      <ThemedIcon type="ionicons" name="checkmark" size={6} color="#fff" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Availability Settings */}
          {selectedDayData && (
            <Animated.View 
              style={[
                styles.availabilityCard, 
                { 
                  backgroundColor: theme.colors.card,
                  opacity: cardOpacity,
                  transform: [{ scale: cardScale }],
                }
              ]}
            >
              {/* Header */}
              <View style={styles.availabilityHeader}>
                <View style={[styles.headerIcon, { backgroundColor: theme.colors.primary + '15' }]}>
                  <ThemedIcon type="ionicons" name="time-outline" size={20} color={theme.colors.primary} />
                </View>
                <View style={styles.headerText}>
                  <ThemedText style={[styles.availabilityTitle, { color: theme.colors.text }]}>
                    {selectedDayData.name} Availability
                  </ThemedText>
                  <ThemedText style={[styles.availabilitySubtitle, { color: theme.colors.mutedText }]}>
                    Configure your booking availability for this day
                  </ThemedText>
                </View>
              </View>

              {/* Toggle Switch */}
              <View style={[styles.toggleContainer, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}>
                <View style={styles.toggleLabelContainer}>
                  <ThemedText style={[styles.toggleLabel, { color: theme.colors.text }]}>
                    Available for Bookings
                  </ThemedText>
                  <ThemedText style={[styles.toggleSubtext, { color: theme.colors.mutedText }]}>
                    Enable or disable availability for this day
                  </ThemedText>
                </View>
                <TouchableOpacity
                  style={[
                    styles.toggleSwitch,
                    {
                      backgroundColor: currentDayData.isAvailable ? theme.colors.primary : theme.colors.border,
                    }
                  ]}
                  onPress={() => handleAvailabilityChange(!currentDayData.isAvailable)}
                  activeOpacity={0.8}
                >
                  <Animated.View
                    style={[
                      styles.toggleThumb,
                      {
                        backgroundColor: '#fff',
                        transform: [{ translateX: currentDayData.isAvailable ? 22 : 2 }]
                      }
                    ]}
                  />
                </TouchableOpacity>
              </View>

              {/* Time Range Inputs */}
              {currentDayData.isAvailable && (
                <View style={styles.timeContainer}>
                  <View style={styles.timeHeader}>
                    <ThemedIcon type="ionicons" name="time-outline" size={16} color={theme.colors.primary} />
                    <ThemedText style={[styles.timeLabel, { color: theme.colors.text }]}>
                      Available Hours
                    </ThemedText>
                  </View>
                  
                  <View style={styles.timeInputs}>
                    <View style={styles.timeInputGroup}>
                      <ThemedText style={[styles.timeInputLabel, { color: theme.colors.mutedText }]}>
                        Start Time
                      </ThemedText>
                      <TouchableOpacity
                        style={[
                          styles.timeInput,
                          {
                            backgroundColor: theme.colors.background,
                            borderColor: theme.colors.border,
                          }
                        ]}
                        onPress={() => openTimePicker('start')}
                        activeOpacity={0.8}
                      >
                        <ThemedText style={[styles.timeInputText, { color: theme.colors.text }]}>
                          {currentDayData.startTime}
                        </ThemedText>
                      </TouchableOpacity>
                    </View>

                    <View style={styles.timeSeparator}>
                      <ThemedText style={[styles.timeSeparatorText, { color: theme.colors.mutedText }]}>
                        to
                      </ThemedText>
                    </View>

                    <View style={styles.timeInputGroup}>
                      <ThemedText style={[styles.timeInputLabel, { color: theme.colors.mutedText }]}>
                        End Time
                      </ThemedText>
                      <TouchableOpacity
                        style={[
                          styles.timeInput,
                          {
                            backgroundColor: theme.colors.background,
                            borderColor: theme.colors.border,
                          }
                        ]}
                        onPress={() => openTimePicker('end')}
                        activeOpacity={0.8}
                      >
                        <ThemedText style={[styles.timeInputText, { color: theme.colors.text }]}>
                          {currentDayData.endTime}
                        </ThemedText>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )}
            </Animated.View>
          )}
        </ScrollView>
      </View>

      {/* Time Picker Modal */}
      <Modal
        visible={showTimePicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTimePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <ThemedIcon type="ionicons" name="time-outline" size={20} color={theme.colors.primary} />
                <ThemedText style={[styles.modalTitle, { color: theme.colors.text }]}>
                  {timePickerType === 'start' ? 'Start' : 'End'} Time
                </ThemedText>
              </View>
              <TouchableOpacity
                onPress={() => setShowTimePicker(false)}
                style={[styles.closeButton, { backgroundColor: theme.colors.border }]}
                activeOpacity={0.7}
              >
                <ThemedIcon type="ionicons" name="close" size={18} color={theme.colors.mutedText} />
              </TouchableOpacity>
            </View>

            {/* Time Display */}
            <View style={styles.timeDisplayContainer}>
              <ThemedText style={[styles.timeDisplayLabel, { color: theme.colors.mutedText }]}>
                Current Selection
              </ThemedText>
              <View style={[styles.timeDisplay, { backgroundColor: theme.colors.card }]}>
                <ThemedText style={[styles.timeDisplayText, { color: theme.colors.primary }]}>
                  {selectedHour}:{selectedMinute.toString().padStart(2, '0')} {selectedPeriod}
                </ThemedText>
              </View>
            </View>
            
                        {/* Time Picker */}
            <View style={styles.timePickerContainer}>
              {/* Hour Picker */}
              <View style={styles.timePickerColumn}>
                <ThemedText style={[styles.timePickerLabel, { color: theme.colors.mutedText }]}>
                  Hour
                </ThemedText>
                <View style={[styles.timePickerWheel, { backgroundColor: theme.colors.background }]}>
                  <View style={[styles.timePickerSelection, { backgroundColor: theme.colors.primary + '15' }]} />
                  <ScrollView
                    ref={hourScrollRef}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.timePickerScrollContent}
                    snapToInterval={50}
                    decelerationRate="fast"
                    onMomentumScrollEnd={handleHourScrollEnd}
                    bounces={false}
                  >
                    {hours.map((hour) => (
                      <View key={hour} style={styles.timePickerItem}>
                        <ThemedText 
                          style={[
                            styles.timePickerItemText, 
                            { 
                              color: selectedHour === hour ? theme.colors.primary : theme.colors.text,
                              fontWeight: selectedHour === hour ? '700' : '400',
                            }
                          ]}
                        >
                          {hour}
                        </ThemedText>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              </View>

              {/* Colon */}
              <View style={styles.timePickerColon}>
                <ThemedText style={[styles.timePickerColonText, { color: theme.colors.text }]}>
                  :
                </ThemedText>
              </View>

              {/* Minute Picker */}
              <View style={styles.timePickerColumn}>
                <ThemedText style={[styles.timePickerLabel, { color: theme.colors.mutedText }]}>
                  Minute
                </ThemedText>
                <View style={[styles.timePickerWheel, { backgroundColor: theme.colors.background }]}>
                  <View style={[styles.timePickerSelection, { backgroundColor: theme.colors.primary + '15' }]} />
                  <ScrollView
                    ref={minuteScrollRef}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.timePickerScrollContent}
                    snapToInterval={50}
                    decelerationRate="fast"
                    onMomentumScrollEnd={handleMinuteScrollEnd}
                    bounces={false}
                  >
                    {minutes.map((minute) => (
                      <View key={minute} style={styles.timePickerItem}>
                        <ThemedText 
                          style={[
                            styles.timePickerItemText, 
                            { 
                              color: selectedMinute === minute ? theme.colors.primary : theme.colors.text,
                              fontWeight: selectedMinute === minute ? '700' : '400',
                            }
                          ]}
                        >
                          {minute.toString().padStart(2, '0')}
                        </ThemedText>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              </View>

              {/* Space between Minute and Period */}
              <View style={styles.timePickerSpacer} />

              {/* Period Picker */}
              <View style={styles.timePickerColumn}>
                <ThemedText style={[styles.timePickerLabel, { color: theme.colors.mutedText }]}>
                  Period
                </ThemedText>
                <View style={[styles.timePickerWheel, { backgroundColor: theme.colors.background }]}>
                  <View style={[styles.timePickerSelection, { backgroundColor: theme.colors.primary + '15' }]} />
                  <ScrollView
                    ref={periodScrollRef}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.timePickerScrollContent}
                    snapToInterval={50}
                    decelerationRate="fast"
                    onMomentumScrollEnd={handlePeriodScrollEnd}
                    bounces={false}
                  >
                    {periods.map((period) => (
                      <View key={period} style={styles.timePickerItem}>
                        <ThemedText 
                          style={[
                            styles.timePickerItemText, 
                            { 
                              color: selectedPeriod === period ? theme.colors.primary : theme.colors.text,
                              fontWeight: selectedPeriod === period ? '700' : '400',
                            }
                          ]}
                        >
                          {period}
                        </ThemedText>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              </View>
            </View>

            {/* Action Button */}
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
              onPress={saveTime}
              activeOpacity={0.8}
            >
              <ThemedIcon type="ionicons" name="checkmark" size={20} color="#fff" />
              <ThemedText style={styles.actionButtonText}>
                Set Time
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
  },
  introSection: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  introIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  introTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 10,
  },
  introSubtext: {
    fontSize: 16,
    marginTop: 5,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  daySelectorContainer: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  daySelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  dayBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  dayText: {
    fontSize: 14,
  },
  modifiedBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  availabilityCard: {
    borderRadius: 12,
    padding: 24,
    marginTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  availabilityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  availabilityTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  availabilitySubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 24,
  },
  toggleLabelContainer: {
    flex: 1,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  toggleSubtext: {
    fontSize: 12,
    marginTop: 2,
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
    width: 20,
    height: 20,
    borderRadius: 10,
    position: 'absolute',
    left: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  timeContainer: {
    marginTop: 8,
  },
  timeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  timeLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 6,
  },
  timeInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeInputGroup: {
    flex: 1,
    marginRight: 12,
  },
  timeInputLabel: {
    fontSize: 12,
    marginBottom: 6,
  },
  timeInput: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  timeInputText: {
    fontSize: 16,
  },
  timeSeparator: {
    marginHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 28,
  },
  timeSeparatorText: {
    fontSize: 14,
    fontWeight: '500',
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '90%',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 15,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 32,
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginLeft: 10,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  timeDisplayContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  timeDisplayLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  timeDisplay: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    alignItems: 'center',
  },
  timeDisplayText: {
    fontSize: 36,
    fontWeight: '600',
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginBottom: 32,
    paddingHorizontal: 10,
  },
  pickerColumn: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    height: 150,
  },
  pickerScrollView: {
    flex: 1,
    width: '100%',
  },
  pickerScrollContent: {
    paddingVertical: 45,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  pickerItem: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 0,
  },
  pickerItemText: {
    fontSize: 32,
    fontWeight: '600',
    letterSpacing: -0.5,
    textAlign: 'center',
    width: '100%',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  pickerWheel: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'transparent',
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.02)',
    position: 'relative',
  },
  pickerLabel: {
    fontSize: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  colonSeparator: {
    marginHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    height: 200,
    alignSelf: 'center',
  },
  colonText: {
    fontSize: 36,
    fontWeight: '600',
    opacity: 0.8,
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  pickerSelectionOverlay: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
    transform: [{ translateY: -40 }],
    zIndex: 1,
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none'
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    marginTop: 20,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  scrollIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    pointerEvents: 'none'
  },
  scrollIndicatorBottom: {
    top: 'auto',
    bottom: 0,
  },
  timePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  timePickerColumn: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 70,
    height: 120,
  },
  timePickerLabel: {
    fontSize: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  timePickerWheel: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  timePickerSelection: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 50,
    borderRadius: 6,
    transform: [{ translateY: -25 }],
    zIndex: -1,
  },
  timePickerScrollContent: {
    paddingVertical: 35,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  timePickerItem: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  timePickerItemText: {
    fontSize: 20,
    textAlign: 'center',
  },
  timePickerColon: {
    marginHorizontal: 15,
    justifyContent: 'center',
    alignItems: 'center',
    height: 120,
    alignSelf: 'center',
  },
  timePickerColonText: {
    fontSize: 24,
    fontWeight: '600',
    opacity: 0.8,
  },
  timePickerSpacer: {
    width: 15,
  },
}); 