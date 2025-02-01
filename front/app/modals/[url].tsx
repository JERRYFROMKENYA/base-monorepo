import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { Platform, ScrollView } from 'react-native';
import { Surface, Text, Divider } from 'react-native-paper';
import { useLocalSearchParams } from 'expo-router';
import { Locales } from '@/lib';
import {
  getBatSpeed,
  getHomeRunByPlayId,
  getPlayExplanation,
  getSummary,
  getTranslation,
} from '@/lib/data/mlb_data/videos'
import { View } from '@/lib/presentation/Themed';
import * as Localization from 'expo-localization'

const Url = () => {
  const { url } = useLocalSearchParams();
  const [hrData, setHrData] = useState<any>(null);
  const [title, setTitle] = useState<string>('Loading...');
  const [description, setDescription] = useState<string>('Loading...');
  const [explanation, setExplanation] = useState<string>('Loading...');
  const [exitVelocity, setExitVelocity] = useState<number>(0);
  const [launchAngle, setLaunchAngle] = useState<number>(0);
  const [batSpeed, setBatSpeed] = useState<number>(0);
  const [ballType, setBallType] = useState<string>('');
  const [hitDistance, setHitDistance] = useState<string>('');

  const languageCode= Localization.getLocales()[0].languageCode ?? 'en' // Change as needed

useEffect(() => {
  const fetchData = async () => {
    try {
      const hr_data = await getHomeRunByPlayId(url as string);
      console.log('Home Run Data:', hr_data);
      const bat_data= await getBatSpeed(hr_data[0].video)
      if (!hr_data || hr_data.length === 0) {
        console.error("No home run data found.");
        return;
      }

      const homeRun = hr_data[0];
      setHrData(homeRun);

      const summary = await getSummary(homeRun.video);
      const explanationData = await getPlayExplanation(homeRun.video);

      let finalTitle = homeRun.title || "No Title Available";
      let finalDescription = summary?.summary || "No Description Available";
      let finalExplanation = explanationData?.explanation || "No Explanation Available";

      setExitVelocity(homeRun.ExitVelocity || 0);
      setLaunchAngle(homeRun.LaunchAngle || 0);
      setHitDistance(homeRun.HitDistance || "Unknown");
      setBallType(bat_data.ballType || "Unknown");
      setBatSpeed(bat_data.batSpeed || 0);

      setTitle(finalTitle);
      setDescription(finalDescription);
      setExplanation(finalExplanation);

      if (languageCode !== "en") {
        await translateContent(finalTitle, finalDescription, finalExplanation);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  fetchData();
}, [url]);

const translateContent = async (finalTitle: string, finalDescription: string, finalExplanation: string) => {
  try {
    console.log('Translating:', finalTitle, finalDescription, finalExplanation);
    setTitle('...');
    setDescription('...');
    setExplanation('...');

    const [titleTranslation, descriptionTranslation, explanationTranslation] = await Promise.all([
      getTranslation(finalTitle, languageCode),
      getTranslation(finalDescription, languageCode),
      finalExplanation ? getTranslation(finalExplanation, languageCode) : { translation: '' },
    ]);

    console.log('Title Translation:', titleTranslation);
    console.log('Description Translation:', descriptionTranslation);
    console.log('Explanation Translation:', explanationTranslation);

    setTitle(titleTranslation?.translation || finalTitle);
    setDescription(descriptionTranslation?.translation || finalDescription);
    setExplanation(explanationTranslation?.translation || finalExplanation);
  } catch (translationError) {
    console.error("Error fetching translations:", translationError);
  }
};


  return (
    <ScrollView style={{ height: '100%', padding: 20, alignContent: "center", backgroundColor: "none" }}>
      {hrData && (
        <Surface style={{ padding: 20, borderRadius: 15, margin: 5, alignContent: 'center', flexDirection: "row" }}>
          <Text variant={"titleMedium"}>{title}</Text>
        </Surface>
      )}

      <View style={{ width: "95%", alignSelf: "center", flexDirection: "row", flexWrap: "wrap", margin: 5,backgroundColor:"none" }}>
        <Surface style={styles.statCard}>
          <Text variant={'displaySmall'}>{exitVelocity} mph</Text>
          <Text variant={'titleMedium'}>{Locales.t('exitVelocity')}</Text>
        </Surface>
        <Surface style={styles.statCard}>
          <Text variant={'displaySmall'}>{launchAngle}°</Text>
          <Text variant={'titleMedium'}>{Locales.t('launchAngle')}</Text>
        </Surface>
        <Surface style={styles.statCard}>
          <Text variant={'displaySmall'}>{batSpeed} mph</Text>
          <Text variant={'titleMedium'}>{Locales.t('batSpeed')}</Text>
        </Surface>
        <Surface style={styles.statCard}>
          <Text variant={'displaySmall'} style={{fontSize:25}}>{ballType}</Text>
          <Text variant={'titleMedium'}>{Locales.t('ballType')}</Text>
        </Surface>
        <Surface style={{ ...styles.statCard, width: "95%" }}>
          <Text variant={'displayMedium'}>{hitDistance}</Text>
          <Text variant={'titleMedium'}>{Locales.t('hitDistance')}</Text>
        </Surface>
      </View>

      {description && (
        <Surface style={styles.textCard}>
          <Text>{description}</Text>
        </Surface>
      )}

      {explanation && (
        <Surface style={styles.textCard}>
          <Text>{explanation}</Text>
        </Surface>
      )}

      <Divider style={{ marginBottom: 50, marginTop: 50 }} />
    </ScrollView>
  );
};

const styles = {
  statCard: {
    padding: 20,
    borderRadius: 15,
    margin: 5,
    alignContent: 'center',
    flexDirection: "column",
    width: "45%",
    height: 160,
  },
  textCard: {
    padding: 20,
    borderRadius: 15,
    margin: 5,
  },
};

export default Url;
