import React, { useEffect } from 'react'
import { Chip, Surface, Button, SegmentedButtons } from 'react-native-paper'
import { ScrollView, View } from 'react-native'
import { Locales, ScreenInfo, styles } from '@/lib'

const HomeCategories = ({ categories }) => {
  const [selectedCategory, setSelectedCategory] = React.useState(2)
  const [isLoading, setIsLoading] = React.useState(true)

  return (
    <ScrollView horizontal>
      <Surface
        elevation={0}
        style={{
          alignSelf: "flex-start",
          display: "flex",
          flexDirection: "row",
          gap: 10,
          overflow: "scroll",
          overscrollBehaviorX: "auto"
        }}
      >
        {categories.map((category: { icon: any; label: any }, index: any) => (
          <Chip
            key={index}
            mode={selectedCategory !== index ? 'outlined' : undefined}
            icon={selectedCategory !== index ? category.icon : undefined}
            selected={selectedCategory === index}
            onPress={() => setSelectedCategory(index)}
          >
            {Locales.t(category.label)}
          </Chip>
        ))}
      </Surface>
    </ScrollView>
  )
}


const BottomSegmentedButtons = ({ buttons, value, onValueChange }) => {
  return (
    <View style={{ position: 'absolute', bottom: 0, width: '100%', flexDirection: 'row', justifyContent: 'center', padding: 10 }}>
      <SegmentedButtons
        style={{ width: '100%' }}
        value={value}
        onValueChange={onValueChange}
        buttons={buttons}
      />
    </View>
  )
}

const HomeScreen = () => {
  const categories = [
    { label: "all" },
    { label: "popular", icon: "web" },
    { label: "favorites", icon: "star" },
    { label: "mlb", icon: "baseball" },
    { label: "home_runs", icon: "baseball-bat" },
  ]

  const segmentedButtons = [
    { label: "Recent", icon: "clock", value: "recent" },
    { label: "Suggested", icon: "star", value: "suggested" },
  ]

  const [selectedValue, setSelectedValue] = React.useState('')

  return (
    <Surface style={{ flex: 1, gap: 16, padding: 10, alignItems: 'center', justifyContent: 'flex-start' }}>
      <HomeCategories categories={categories} />
      <BottomSegmentedButtons
        buttons={segmentedButtons}
        value={selectedValue}
        onValueChange={setSelectedValue}
      />
    </Surface>
  )
}

export default HomeScreen