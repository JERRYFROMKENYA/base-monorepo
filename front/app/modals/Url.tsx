import React, { memo, useEffect, useState } from 'react'
import { ScrollView, StyleSheet } from 'react-native';
import { Surface, Text, Divider, Appbar } from 'react-native-paper';
import { useLocalSearchParams } from 'expo-router';
import { Locales } from '@/lib';
import {
  getBatSpeed,
  getHomeRunByPlayId,
  getPlayExplanation,
  getSummary,
  getTranslation,
} from '@/lib/data/mlb_data/videos';
import { View } from '@/lib/presentation/Themed';
import * as Localization from 'expo-localization';

const Url = ({ onClose, hrData, stats }: { onClose: any, hrData: any, stats: any }) => {



  return (
    <Surface>
      <Appbar.Header statusBarHeight={0}>
        <Appbar.BackAction onPress={onClose} />
        <Appbar.Content title={Locales.t('more_info')} />
      </Appbar.Header>
      <ScrollView style={styles.scrollView}>
        {hrData && (
          <Surface style={styles.surface}>
            <Text variant={'titleLarge'}>{stats.title}</Text>
          </Surface>
        )}

        {stats.description && (
          <Surface style={styles.textCard}>
            <Text variant={'bodyMedium'}>{stats.description}</Text>
          </Surface>
        )}

        {stats.explanation && (
          <Surface style={styles.textCard}>
            <Text variant={'bodyMedium'}>{stats.explanation}</Text>
          </Surface>
        )}

        <View style={styles.view}>
          {[
            { value: `${stats.exitVelocity} mph`, label: 'exitVelocity' },
            { value: `${stats.launchAngle}°`, label: 'launchAngle' },
            { value: `${stats.batSpeed} mph`, label: 'batSpeed' },
            { value: stats.ballType, label: 'ballType', style: { fontSize: 25 } },
          ].map((stat, index) => (
            <Surface key={index} style={styles.statCard}>
              <Text variant={'displaySmall'} style={stat.style}>{stat.value}</Text>
              <Text variant={'titleMedium'}>{Locales.t(stat.label)}</Text>
            </Surface>
          ))}

          <Surface style={styles.fullWidthStatCard}>
            <Text variant={'displayMedium'}>{stats.hitDistance}</Text>
            <Text variant={'titleMedium'}>{Locales.t('hitDistance')}</Text>
          </Surface>
        </View>





        <Divider style={{ marginBottom: 100, marginTop: 100 }} />
      </ScrollView>
    </Surface>
  );
};

const styles = StyleSheet.create({
  scrollView: { height: '100%', padding: 20 },
  surface: { padding: 20, borderRadius: 15, margin: 5, flexDirection: 'row' },
  view: { width: '95%', alignSelf: 'center', flexDirection: 'row', flexWrap: 'wrap', margin: 5, backgroundColor: 'none' },
  statCard: { padding: 20, borderRadius: 15, margin: 5, width: '45%', height: 160 },
  fullWidthStatCard: { width: '95%', padding: 20, borderRadius: 15, margin: 5, height: 160 },
  textCard: { padding: 20, borderRadius: 15, margin: 5 },
});

export default memo(Url);
