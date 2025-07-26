import React, { createContext, useContext, useEffect, useState } from 'react'
import { Appearance } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { themes, ThemeName, AppTheme } from '../styles/theme'

interface ThemeContextType {
    themeName: 'light' | 'dark'; // actual in-use theme
    themeOverride: ThemeName;    // user selection
    theme: AppTheme;
    setTheme: (name: ThemeName) => void;
}

const STORAGE_KEY = '@theme-preference'

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const [themeOverride, setThemeOverride] = useState<ThemeName>('system')
    const colorScheme = Appearance.getColorScheme()
    const systemPref: 'light' | 'dark' = colorScheme === 'dark' ? 'dark' : 'light'
    const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>(systemPref)
    const themeName: 'light' | 'dark' = themeOverride === 'system' ? systemTheme : themeOverride;

    // Load saved preference from AsyncStorage
    useEffect(() => {
        const loadStoredTheme = async () => {
            try {
                const savedTheme = await AsyncStorage.getItem(STORAGE_KEY)
                if (savedTheme && savedTheme !== themeOverride) {
                    setThemeOverride(savedTheme as ThemeName)
                }
            } catch (err) {
                console.warn('Failed to load theme from storage:', err)
            }
        }
        loadStoredTheme()
    }, [])

    // Listen for system theme changes
    useEffect(() => {
        const listener = Appearance.addChangeListener(({ colorScheme }) => {
            setSystemTheme(colorScheme === 'dark' ? 'dark' : 'light')
        })
        return () => listener.remove()
    }, [])

    // Save to AsyncStorage whenever it changes
    useEffect(() => {
        AsyncStorage.setItem(STORAGE_KEY, themeOverride)
    }, [themeOverride])

    const setTheme = (name: ThemeName) => {
        setThemeOverride(name)
    }

    const theme = themes[themeName]

    return (
        <ThemeContext.Provider value={{ themeName, themeOverride, theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}

export const useTheme = () => {
    const context = useContext(ThemeContext)
    if (!context) throw new Error('useTheme must be used within ThemeProvider')
    return context
}
