import React from 'react'
import { Surface } from 'react-native-paper'

import { Locales, ScreenInfo, styles } from '@/lib'
import FantasyTeamViewer from '@/lib/ui/components/FantasyTeamViewer'
const players = {
  pitcher: 'John Doe',
  catcher: 'Jane Smith',
  firstBase: 'Mike Johnson',
  secondBase: 'Chris Lee',
  thirdBase: 'Patricia Williams',
  shortstop: 'James Brown',
  leftField: 'Laura Davis',
  centerField: 'David Miller',
  rightField: 'Emily Wilson',
}
const Games = () => (
  <Surface style={styles.screen}>
    {/*<ScreenInfo*/}
    {/*    title={Locales.t('titleHome')}*/}
    {/*    path="app/drawer/index.tsx.tsx" />*/}
    <FantasyTeamViewer players={players} />
  </Surface>
)

export default Games
