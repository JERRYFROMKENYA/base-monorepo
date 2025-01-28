import { DrawerContentComponentProps } from '@react-navigation/drawer'
import { router } from 'expo-router'
import React from 'react'
import { Drawer, DrawerSectionProps } from 'react-native-paper'

import { Locales } from '@/lib/locales'

interface DrawerContentProps extends DrawerSectionProps {
  navProps: DrawerContentComponentProps
}

const DrawerContent = (props: DrawerContentProps) => (
  <Drawer.Section {...props}>
    <Drawer.Item
      label={Locales.t('titleHome')}
      icon="baseball"
      active={props.navProps.state.index === 0}
      onPress={() => router.push('/drawer')}
    />
      <Drawer.Item
        label={Locales.t('home_runs')}
        icon="book-play"
        active={props.navProps.state.index === 1}
        onPress={() => router.push('/drawer/for_you')}
      />
    <Drawer.Item
      label={Locales.t('news')}
      icon="newspaper"
      active={props.navProps.state.index === 3}
      onPress={() => router.push('/drawer/news')}
    />
    <Drawer.Item
      label={Locales.t('statistics')}
      icon="chart-line"
      active={props.navProps.state.index === 4}
      onPress={() => router.push('/drawer/statistics')}
    />
    <Drawer.Item
      label={Locales.t('predictions')}
      icon="baseball-bat"
      active={props.navProps.state.index === 5}
      onPress={() => router.push('/drawer/predictions')}
    />

    <Drawer.Item
      label={Locales.t('profile')}
      icon="account"
      active={props.navProps.state.index === 6}
      onPress={() => router.push('/drawer/profile')}
    />
    <Drawer.Item
      label={Locales.t('titleSettings')}
      icon="cog"
      active={props.navProps.state.index === 7}
      onPress={() => router.push('/drawer/settings')}
    />
  </Drawer.Section>
)

export default DrawerContent
