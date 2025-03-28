import { MaterialCommunityIcons } from '@expo/vector-icons'
import { JetBrainsMono_400Regular } from '@expo-google-fonts/jetbrains-mono'
import {Ubuntu_400Regular} from '@expo-google-fonts/ubuntu'

import {
  DarkTheme as NavDarkTheme,
  DefaultTheme as NavLightTheme,
  ThemeProvider,
} from '@react-navigation/native'
import { useFonts } from 'expo-font'
import * as Localization from 'expo-localization'
import { SplashScreen, Stack } from 'expo-router'
import * as SecureStore from 'expo-secure-store'
import { StatusBar } from 'expo-status-bar'
import React from 'react'
import { Platform, useColorScheme } from 'react-native'
import { adaptNavigationTheme, PaperProvider } from 'react-native-paper'
import { useRouter } from 'expo-router'
import { Locales, Setting, StackHeader, Themes } from '@/lib'
import drawer from '@/app/drawer'
import { PocketBaseProvider } from '@/lib/data/pocketbase'
import { AuthProvider } from '@/lib/data/pocketbase/auth'

// Catch any errors thrown by the Layout component.
export { ErrorBoundary } from 'expo-router'

// Ensure that reloading on `/modal` keeps a back button present.
export const unstable_settings = { initialRouteName: '(auth)' }

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync()

const RootLayout = () => {
  const [loaded, error] = useFonts({
    Ubuntu_400Regular,
    JetBrainsMono_400Regular,
    ...MaterialCommunityIcons.font,
  })

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  React.useEffect(() => {
    if (error) throw error
  }, [error])

  React.useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync()
    }
  }, [loaded])

  if (!loaded) {
    return null
  }

  return <RootLayoutNav />
}

const RootLayoutNav = () => {
  const router = useRouter()
  const colorScheme = useColorScheme()
  const [settings, setSettings] = React.useState<Setting>({
    theme: 'auto',
    color: 'blue',
    language: 'auto',
  })

  // Load settings from the device
  React.useEffect(() => {
    if (Platform.OS !== 'web') {
      SecureStore.getItemAsync('settings').then((result) => {
        if (result === null) {
          SecureStore.setItemAsync('settings', JSON.stringify(settings)).then(
            (res) => console.log(res),
          )
        }

        setSettings(JSON.parse(result ?? JSON.stringify(settings)))
      })
    } else {
      setSettings({ ...settings, theme: colorScheme ?? 'light' })
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  React.useEffect(() => {
    if (settings.language === 'auto') {
      Locales.locale = Localization.getLocales()[0].languageCode ?? 'en'
    } else {
      Locales.locale = settings.language
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const theme =
    Themes[
      settings.theme === 'auto' ? (colorScheme ?? 'dark') : settings.theme
    ][settings.color]

  const { DarkTheme, LightTheme } = adaptNavigationTheme({
    reactNavigationDark: NavDarkTheme,
    reactNavigationLight: NavLightTheme,
    materialDark: Themes.dark[settings.color],
    materialLight: Themes.light[settings.color],
  })

  return (
    <PocketBaseProvider>
      <AuthProvider>
    <ThemeProvider
      value={
        colorScheme === 'light'
          ? { ...LightTheme, fonts: NavLightTheme.fonts }
          : { ...DarkTheme, fonts: NavDarkTheme.fonts }
      }
    >
      <PaperProvider theme={theme}>
        <Stack
          initialRouteName={'drawer'}
          screenOptions={{
            // animation: 'slide_from_bottom',
            header: (props) => (
              <StackHeader navProps={props} children={undefined} />
            ),
          }}
        >
          <Stack.Screen name="drawer" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          {/*<Stack.Screen name="(tabs)" options={{ headerShown: false }} />*/}

          <Stack.Screen
            name="search"
            options={{ title: Locales.t('search') }}
          />
          <Stack.Screen
            name="modal"
            options={{ title: Locales.t('titleModal'), presentation: 'modal' }}
          />
          <Stack.Screen
            name="modals/[url]"
            options={{ title: Locales.t('more_info'), presentation:'modal' }}
          />
          <Stack.Screen
            name="team/[id]"
            options={{ title: Locales.t('more_info'), presentation:'modal' }} />
          <Stack.Screen
            name="player/[id]"
            options={{ title: Locales.t('more_info'), presentation:'modal' }} />

          <Stack.Screen
          name="index"
          options={{headerShown:false}}
        />
        </Stack>
      </PaperProvider>

      <StatusBar style="auto" />
    </ThemeProvider>
      </AuthProvider>
    </PocketBaseProvider>
  )
}

export default RootLayout
