import React from 'react'
import { Dimensions, StyleSheet, View } from 'react-native'
import {
  Canvas,
  ImageSVG,
  Group,
  Rect,
  useSVG,
  Text,
  useFonts,
  useFont,
  Circle,
} from '@shopify/react-native-skia'

const FantasyTeamViewer = ({ players }) => {
  const screenWidth = Dimensions.get('window').width
  const screenHeight = Dimensions.get('window').height

  const svg = useSVG(require('../../../assets/images/baseball_pitch.svg'))

  const fontSize = 10
  const font = useFont(
    require('../../../assets/fonts/Ubuntu-Regular.ttf'),
    fontSize,
  )

  // Define the size of the SVG
  const svgWidth = svg?.width()
  const svgHeight = svg?.height()

  // SVG viewBox dimensions
  const viewBoxWidth = 440
  const viewBoxHeight = 340

  // Define positions for players on the baseball diamond using relative coordinates based on the viewBox size

  const positions = {
    pitcher: { x: viewBoxWidth * 0.44, y: viewBoxHeight * 0.53 },
    catcher: { x: viewBoxWidth * 0.42, y: viewBoxHeight * 0.85 },
    firstBase: { x: viewBoxWidth * 0.63, y: viewBoxHeight * 0.53 },
    secondBase: { x: viewBoxWidth * 0.55, y: viewBoxHeight * 0.35 },
    thirdBase: { x: viewBoxWidth * 0.25, y: viewBoxHeight * 0.53 },
    shortstop: { x: viewBoxWidth * 0.3, y: viewBoxHeight * 0.35 },
    leftField: { x: viewBoxWidth * 0.15, y: viewBoxHeight * 0.25 },
    centerField: { x: viewBoxWidth * 0.45, y: viewBoxHeight * 0.1 },
    rightField: { x: viewBoxWidth * 0.75, y: viewBoxHeight * 0.25 },
  }

  const hasPlayers = Object.keys(players || {}).length > 0

  // @ts-ignore
  return (
    <View style={styles.container}>
      <Canvas
        style={{
          width: screenWidth,
          height: screenHeight * 0.5,
          backgroundColor: '#c85757',
        }}
      >
        {svg && (
          <ImageSVG
            svg={svg}
            width={svgWidth}
            height={svgHeight}
            x={(screenWidth - svgWidth) / 2} // Center the SVG horizontally
            // y={(screenHeight - svgHeight)/20 } // Center the SVG vertically
          />
        )}

        {/* Render Players Dynamically or Placeholder Message */}
        <Group>
          {hasPlayers ? (
            Object.entries(players).map(([position, player], index) => (
              <Group key={index}>
                <Circle
                  key={position}
                  cx={positions[position].x}
                  cy={positions[position].y}
                  // width={20}
                  // height={20}
                  r={15}
                  color="cyan"
                />
                <Text
                  x={positions[position].x}
                  y={positions[position].y}
                  text={player || ''}
                  font={font}
                  // color={"white"}
                />
              </Group>
            ))
          ) : (
            <Rect
              x={(screenWidth - svgWidth) / 2 + svgWidth * 0.5}
              y={(screenHeight - svgHeight) / 2 + svgHeight * 0.25}
              width={50}
              height={50}
              color="lightblue"
            />
          )}
        </Group>
      </Canvas>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',

    margin: 20,
    // Background color to emphasize the SVG
  },
})

export default FantasyTeamViewer
