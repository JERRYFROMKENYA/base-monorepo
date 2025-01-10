import { router } from 'expo-router'
import { Drawer } from 'expo-router/drawer'
import React from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { Appbar, Menu, Tooltip, useTheme } from 'react-native-paper'

import { DrawerContent, DrawerHeader, Locales } from '@/lib'

const DrawerLayout = () => {
  const theme = useTheme()
  const [visible, setVisible] = React.useState(false)

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        drawerContent={(props) => (
          <DrawerContent
            navProps={props}
            showDivider={false}
            children={undefined}
            title="Base"
          />
        )}
        screenOptions={{
          drawerStyle: {
            backgroundColor: theme.colors.background,
            paddingTop: 64,
          },
          header: (props) => (
            <DrawerHeader navProps={props} children={undefined} />
          ),
        }}
      >
        <Drawer.Screen
          name="index"
          options={{
            drawerLabel: Locales.t('titleHome'),
            title: Locales.t('titleHome'),
            headerRight: () => (
              <>
                <Tooltip title={Locales.t('search')}>
                  <Appbar.Action
                    icon="magnify"
                    onPress={() => router.push('/search')}
                  />
                </Tooltip>
                <Menu
                  statusBarHeight={48}
                  visible={visible}
                  onDismiss={() => setVisible(false)}
                  anchor={
                    <Tooltip title={Locales.t('options')}>
                      <Appbar.Action
                        icon="dots-vertical"
                        onPress={() => setVisible(true)}
                      />
                    </Tooltip>
                  }
                >
                  <Menu.Item
                    title={Locales.t('titleSettings')}
                    leadingIcon="cog"
                    onPress={() => router.push('/drawer/settings')}
                  />
                  <Menu.Item
                    title={Locales.t('stackNav')}
                    leadingIcon="card-multiple-outline"
                    onPress={() => router.push('/modal')}
                  />
                  <Menu.Item
                    title={Locales.t('drawerNav')}
                    leadingIcon="gesture-swipe"
                    onPress={() => router.push('/drawer')}
                  />
                </Menu>
              </>
            ),
          }}
        />
        <Drawer.Screen
          name="profile"
          options={{
            drawerLabel: Locales.t('profile'),
            title: Locales.t('profile'),
            headerRight: () => (
              <>
                <Tooltip title={Locales.t('search')}>
                  <Appbar.Action
                    icon="magnify"
                    onPress={() => router.push('/search')}
                  />
                </Tooltip>
                <Tooltip title={Locales.t('titleSettings')}>
                  <Appbar.Action
                    icon="cog"
                    onPress={() => router.push('/drawer/settings')}
                  />
                </Tooltip>
              </>
            ),
          }}
        />
        <Drawer.Screen
          name="for_you"
          options={{
            drawerLabel: Locales.t('for_you'),
            title: Locales.t('for_you'),
            headerRight: () => (
              <>
                <Tooltip title={Locales.t('search')}>
                  <Appbar.Action
                    icon="magnify"
                    onPress={() => router.push('/search')}
                  />
                </Tooltip>
                <Tooltip title={Locales.t('titleSettings')}>
                  <Appbar.Action
                    icon="youtube-subscription"
                    onPress={() => router.push('/drawer/settings')}
                  />
                </Tooltip>
              </>
            ),
          }}
        />
        <Drawer.Screen
          name="settings"
          options={{
            drawerLabel: Locales.t('titleSettings'),
            title: Locales.t('titleSettings'),
            headerRight: () => (
              <Tooltip title={Locales.t('stackNav')}>
                <Appbar.Action
                  icon="card-multiple-outline"
                  onPress={() => router.push('/modal')}
                />
              </Tooltip>
            ),
          }}
        />
        <Drawer.Screen
          name="statistics"
          options={{
            drawerLabel: Locales.t('statistics'),
            title: Locales.t('statistics'),
            headerRight: () => (
              <Tooltip title={Locales.t('stackNav')}>
                <Appbar.Action
                  icon="card-multiple-outline"
                  onPress={() => router.push('/modal')}
                />
              </Tooltip>
            ),
          }}
        />
        <Drawer.Screen
          name="predictions"
          options={{
            drawerLabel: Locales.t('predictions'),
            title: Locales.t('predictions'),
            headerRight: () => (
              <Tooltip title={Locales.t('stackNav')}>
                <Appbar.Action
                  icon="card-multiple-outline"
                  onPress={() => router.push('/modal')}
                />
              </Tooltip>
            ),
          }}
        />
        <Drawer.Screen
          name="fantasy"
          options={{
            drawerLabel: Locales.t('fantasy'),
            title: Locales.t('fantasy'),
            headerRight: () => (
              <Tooltip title={Locales.t('stackNav')}>
                <Appbar.Action
                  icon="card-multiple-outline"
                  onPress={() => router.push('/modal')}
                />
              </Tooltip>
            ),
          }}
        />
        <Drawer.Screen
          name="news"
          options={{
            drawerLabel: Locales.t('news'),
            title: Locales.t('news'),
            headerRight: () => (
              <Tooltip title={Locales.t('stackNav')}>
                <Appbar.Action
                  icon="card-multiple-outline"
                  onPress={() => router.push('/modal')}
                />
              </Tooltip>
            ),
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  )
}

export default DrawerLayout
