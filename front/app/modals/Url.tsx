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

const Url = ({ url, onClose }: { url: string; onClose: any }) => {
  const [hrData, setHrData] = useState<any>(null);
  const [stats, setStats] = useState({
    title: 'Loading...',
    description: 'Loading...',
    explanation: 'Loading...',
    exitVelocity: 0,
    launchAngle: 0,
    batSpeed: 0,
    ballType: '',
    hitDistance: '',
  });

  const languageCode = Localization.getLocales()[0].languageCode ?? 'en';

  useEffect(() => {
    if (!url) return console.error('URL parameter is missing.');

    const fetchData = async () => {
      try {
        const [hr_data] = await getHomeRunByPlayId(url);
        if (!hr_data) return console.error('No home run data found.');

        setHrData(hr_data);

        const [bat_data, summary, explanationData] = await Promise.all([
          getBatSpeed(hr_data.video),
          getSummary(hr_data.video),
          getPlayExplanation(hr_data.video),
        ]);

        // const bat_data = await getBatSpeed(hr_data.video);
        // const summary = await getSummary(hr_data.video);
        // const explanationData = await getPlayExplanation(hr_data.video);

        let newStats = {
          title: hr_data.title || 'No Title Available',
          description: summary?.summary || 'No Description Available',
          explanation: explanationData?.explanation || 'No Explanation Available',
          exitVelocity: hr_data.ExitVelocity || 0,
          launchAngle: hr_data.LaunchAngle || 0,
          batSpeed: bat_data?.batSpeed || 0,
          ballType: bat_data?.ballType || 'Unknown',
          hitDistance: hr_data.HitDistance || 'Unknown',
        };

        if (languageCode !== 'en') {
          newStats = await translateContent(newStats);
        }

        setStats(newStats);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [url]);

  const translateContent = async (data: any) => {
    try {
      const [titleTranslation, descriptionTranslation, explanationTranslation] = await Promise.all([
        getTranslation(data.title, languageCode),
        getTranslation(data.description, languageCode),
        data.explanation ? getTranslation(data.explanation, languageCode) : { translation: '' },
      ]);

      return {
        ...data,
        title: titleTranslation?.translation || data.title,
        description: descriptionTranslation?.translation || data.description,
        explanation: explanationTranslation?.translation || data.explanation,
      };
    } catch (error) {
      console.error('Error fetching translations:', error);
      return data;
    }
  };

  return (
    <Surface>
      <Appbar.Header statusBarHeight={0}>
        <Appbar.BackAction onPress={onClose} />
        <Appbar.Content title={Locales.t('more_info')} />
      </Appbar.Header>
      <ScrollView style={styles.scrollView}>
        {hrData && (
          <Surface style={styles.surface}>
            <Text variant={'titleMedium'}>{stats.title}</Text>
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

        {stats.description && (
          <Surface style={styles.textCard}>
            <Text>{stats.description}</Text>
          </Surface>
        )}

        {stats.explanation && (
          <Surface style={styles.textCard}>
            <Text>{stats.explanation}</Text>
          </Surface>
        )}

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
