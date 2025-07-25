import React, { createContext, useContext, useEffect, useState } from 'react'
import { Appearance } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { themes, ThemeName, AppTheme } from '../styles/theme'

interface ThemeContextType {
    themeName: ThemeName
    theme: AppTheme
    toggleTheme: () => void
    setTheme: (name: ThemeName) => void
}

const STORAGE_KEY = '@theme-preference'

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const systemPref = Appearance.getColorScheme() === 'dark' ? 'dark' : 'light'
    const [themeName, setThemeName] = useState<ThemeName>(systemPref)

    // Load saved preference from AsyncStorage
    useEffect(() => {
        const loadStoredTheme = async () => {
            try {
                const savedTheme = await AsyncStorage.getItem(STORAGE_KEY)
                if (savedTheme && savedTheme !== themeName) {
                    setThemeName(savedTheme as ThemeName)
                }
            } catch (err) {
                console.warn('Failed to load theme from storage:', err)
            }
        }
        loadStoredTheme()
    }, [])

    // Save to AsyncStorage whenever it changes
    useEffect(() => {
        AsyncStorage.setItem(STORAGE_KEY, themeName)
    }, [themeName])

    const toggleTheme = () => {
        setThemeName(prev => (prev === 'light' ? 'dark' : 'light'))
    }

    const setTheme = (name: ThemeName) => {
        setThemeName(name)
    }

    const theme = themes[themeName]

    return (
        <ThemeContext.Provider value={{ themeName, theme, toggleTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}

export const useTheme = () => {
    const context = useContext(ThemeContext)
    if (!context) throw new Error('useTheme must be used within ThemeProvider')
    return context
}
