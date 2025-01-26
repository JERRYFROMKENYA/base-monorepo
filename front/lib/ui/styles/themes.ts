/**
 * Themes
 */

import { MD3LightTheme, MD3DarkTheme, configureFonts } from 'react-native-paper'

import Colors from '@/lib/ui/styles/colors'

const fonts = configureFonts({ config: { fontFamily: 'Ubuntu_400Regular' } })

const BaseLightTheme = {
  ...MD3LightTheme,
  fonts,
}

const BaseDarkTheme = {
  ...MD3DarkTheme,
  fonts,
}

const Themes = {
  light: {
    default: BaseLightTheme,
    orange: {
      ...BaseLightTheme,
      colors: {
        ...BaseLightTheme.colors,
        ...Colors.light.orange,
      },
    },
    red: {
      ...BaseLightTheme,
      colors: {
        ...BaseLightTheme.colors,
        ...Colors.light.red,
      },
    },
    violet: {
      ...BaseLightTheme,
      colors: {
        ...BaseLightTheme.colors,
        ...Colors.light.violet,
      },
    },
    indigo: {
      ...BaseLightTheme,
      colors: {
        ...BaseLightTheme.colors,
        ...Colors.light.indigo,
      },
    },
    blue: {
      ...BaseLightTheme,
      colors: {
        ...BaseLightTheme.colors,
        ...Colors.light.blue,
      },
    },
    teal: {
      ...BaseLightTheme,
      colors: {
        ...BaseLightTheme.colors,
        ...Colors.light.teal,
      },
    },
    cyan: {
      ...BaseLightTheme,
      colors: {
        ...BaseLightTheme.colors,
        ...Colors.light.cyan,
      },
    },
    green: {
      ...BaseLightTheme,
      colors: {
        ...BaseLightTheme.colors,
        ...Colors.light.green,
      },
    },
    lime: {
      ...BaseLightTheme,
      colors: {
        ...BaseLightTheme.colors,
        ...Colors.light.lime,
      },
    },
    olive: {
      ...BaseLightTheme,
      colors: {
        ...BaseLightTheme.colors,
        ...Colors.light.olive,
      },
    },
    blueRed: {
      ...BaseLightTheme,
      colors: {
        primary: 'rgb(0, 99, 154)',
        onPrimary: 'rgb(255, 255, 255)',
        primaryContainer: 'rgb(206, 229, 255)',
        onPrimaryContainer: 'rgb(0, 29, 50)',
        secondary: 'rgb(185, 12, 85)',
        onSecondary: 'rgb(255, 255, 255)',
        secondaryContainer: 'rgb(255, 217, 223)',
        onSecondaryContainer: 'rgb(63, 0, 24)',
        tertiary: 'rgb(163, 208, 190)',
        onTertiary: 'rgb(9, 55, 43)',
        tertiaryContainer: 'rgb(36, 78, 65)',
        onTertiaryContainer: 'rgb(191, 236, 218)',
        error: 'rgb(255, 180, 171)',
        onError: 'rgb(105, 0, 5)',
        errorContainer: 'rgb(147, 0, 10)',
        onErrorContainer: 'rgb(255, 180, 171)',
        background: 'rgb(252, 252, 255)',
        onBackground: 'rgb(26, 28, 30)',
        surface: 'rgb(252, 252, 255)',
        onSurface: 'rgb(26, 28, 30)',
        surfaceVariant: 'rgb(222, 227, 235)',
        onSurfaceVariant: 'rgb(66, 71, 78)',
        outline: 'rgb(114, 119, 127)',
        outlineVariant: 'rgb(194, 199, 207)',
        shadow: 'rgb(0, 0, 0)',
        scrim: 'rgb(0, 0, 0)',
        inverseSurface: 'rgb(47, 48, 51)',
        inverseOnSurface: 'rgb(240, 240, 244)',
        inversePrimary: 'rgb(150, 204, 255)',
        elevation: {
          level0: 'transparent',
          level1: 'rgb(239, 244, 250)',
          level2: 'rgb(232, 240, 247)',
          level3: 'rgb(224, 235, 244)',
          level4: 'rgb(222, 234, 243)',
          level5: 'rgb(217, 231, 241)',
        },
        surfaceDisabled: 'rgba(26, 28, 30, 0.12)',
        onSurfaceDisabled: 'rgba(26, 28, 30, 0.38)',
        backdrop: 'rgba(44, 49, 55, 0.4)',
      },
    },
    brown: {
      ...BaseLightTheme,
      colors: {
        ...BaseLightTheme.colors,
        ...Colors.light.brown,
      },
    },
  },
  dark: {
    default: BaseDarkTheme,
    red: {
      ...BaseDarkTheme,
      colors: {
        ...BaseDarkTheme.colors,
        ...Colors.dark.red,
      },
    },
    orange: {
      ...BaseDarkTheme,
      colors: {
        ...BaseDarkTheme.colors,
        ...Colors.dark.orange,
      },
    },
    violet: {
      ...BaseDarkTheme,
      colors: {
        ...BaseDarkTheme.colors,
        ...Colors.dark.violet,
      },
    },
    indigo: {
      ...BaseDarkTheme,
      colors: {
        ...BaseDarkTheme.colors,
        ...Colors.dark.indigo,
      },
    },
    blue: {
      ...BaseDarkTheme,
      colors: {
        ...BaseDarkTheme.colors,
        ...Colors.dark.blue,
      },
    },
    teal: {
      ...BaseDarkTheme,
      colors: {
        ...BaseDarkTheme.colors,
        ...Colors.dark.teal,
      },
    },
    cyan: {
      ...BaseDarkTheme,
      colors: {
        ...BaseDarkTheme.colors,
        ...Colors.dark.cyan,
      },
    },
    green: {
      ...BaseDarkTheme,
      colors: {
        ...BaseDarkTheme.colors,
        ...Colors.dark.green,
      },
    },
    lime: {
      ...BaseDarkTheme,
      colors: {
        ...BaseDarkTheme.colors,
        ...Colors.dark.lime,
      },
    },
    olive: {
      ...BaseDarkTheme,
      colors: {
        ...BaseDarkTheme.colors,
        ...Colors.dark.olive,
      },
    },
    blueRed: {
      dark: true,
      colors: {
        blueRed: {
          dark: false,
          colors: {
            primary: 'rgb(0, 99, 154)',
            onPrimary: 'rgb(255, 255, 255)',
            primaryContainer: 'rgb(206, 229, 255)',
            onPrimaryContainer: 'rgb(0, 29, 50)',
            secondary: 'rgb(185, 12, 85)',
            onSecondary: 'rgb(255, 255, 255)',
            secondaryContainer: 'rgb(255, 217, 223)',
            onSecondaryContainer: 'rgb(63, 0, 24)',
            tertiary: 'rgb(163, 208, 190)',
            onTertiary: 'rgb(9, 55, 43)',
            tertiaryContainer: 'rgb(36, 78, 65)',
            onTertiaryContainer: 'rgb(191, 236, 218)',
            error: 'rgb(255, 180, 171)',
            onError: 'rgb(105, 0, 5)',
            errorContainer: 'rgb(147, 0, 10)',
            onErrorContainer: 'rgb(255, 180, 171)',
            background: 'rgb(252, 252, 255)',
            onBackground: 'rgb(26, 28, 30)',
            surface: 'rgb(252, 252, 255)',
            onSurface: 'rgb(26, 28, 30)',
            surfaceVariant: 'rgb(222, 227, 235)',
            onSurfaceVariant: 'rgb(66, 71, 78)',
            outline: 'rgb(114, 119, 127)',
            outlineVariant: 'rgb(194, 199, 207)',
            shadow: 'rgb(0, 0, 0)',
            scrim: 'rgb(0, 0, 0)',
            inverseSurface: 'rgb(47, 48, 51)',
            inverseOnSurface: 'rgb(240, 240, 244)',
            inversePrimary: 'rgb(150, 204, 255)',
            elevation: {
              level0: 'transparent',
              level1: 'rgb(239, 244, 250)',
              level2: 'rgb(232, 240, 247)',
              level3: 'rgb(224, 235, 244)',
              level4: 'rgb(222, 234, 243)',
              level5: 'rgb(217, 231, 241)',
            },
            surfaceDisabled: 'rgba(26, 28, 30, 0.12)',
            onSurfaceDisabled: 'rgba(26, 28, 30, 0.38)',
            backdrop: 'rgba(44, 49, 55, 0.4)',
          },
        },
      },
    },
    brown: {
      ...BaseDarkTheme,
      colors: {
        ...BaseDarkTheme.colors,
        ...Colors.dark.brown,
      },
    },
  },
}

export default Themes
