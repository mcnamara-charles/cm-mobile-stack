import React from 'react'
import { StyleSheet, View } from 'react-native'
import { useTheme } from '../../context/themeContext'
import { ThemedText } from './ThemedText'

export const AppHeader = ({ title, children, backButton }: { title: string, children?: React.ReactNode, backButton?: React.ReactNode }) => {
  const { theme } = useTheme()
  return (
    <View style={[styles.header, { backgroundColor: theme.colors.background, borderBottomColor: theme.colors.border }]}> 
      <View style={styles.headerContent}>
        {backButton && (
          <View style={styles.backButtonContainer}>
            {backButton}
          </View>
        )}
        <View style={styles.titleContainer}>
          <ThemedText style={[styles.title, { color: theme.colors.text }]}>{title}</ThemedText>
        </View>
        {children && (
          <View style={styles.childrenContainer}>
            {children}
          </View>
        )}
      </View>
    </View>
  )
}

export const AppContentWrapper = ({ children, style }: { children: React.ReactNode, style?: any }) => {
  return (
    <View style={[styles.contentWrapper, style]}>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    height: 56,
    justifyContent: 'center',
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    zIndex: 10,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  childrenContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginLeft: 'auto',
  },
  backButtonContainer: {
    position: 'absolute',
    left: 0,
    zIndex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
    letterSpacing: 0,
  },
  contentWrapper: {
    flex: 1,
    paddingHorizontal: 24,
  },
}) 