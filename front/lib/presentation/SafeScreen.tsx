import React, { useState } from 'react';
import { StyleSheet, Platform, ScrollView, SafeAreaView, RefreshControl } from 'react-native';
import { View } from './Themed';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const SafeScreen = ({ children, onRefresh }: { children: React.ReactNode, onRefresh?: () => void }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExtended, setIsExtended] = useState(true); // Initialize isExtended state
  const isIOS = Platform.OS === 'ios';

  const handleRefresh = async () => {
    setIsRefreshing(true);
    if(!onRefresh) return;
    await onRefresh();
    setIsRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <KeyboardAwareScrollView>
        <SafeAreaView >
          <ScrollView
            onScroll={({ nativeEvent }) => {
              const currentScrollPosition = Math.floor(nativeEvent?.contentOffset?.y) ?? 0;
              setIsExtended(currentScrollPosition <= 0); // Update isExtended state based on scroll position
            }}
            refreshControl={
              <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
            }
          >
            {children}
          </ScrollView>
        </SafeAreaView>
      </KeyboardAwareScrollView>
    </View>
  );
};

export default SafeScreen;

const styles = StyleSheet.create({
  container: {
    marginBottom: 45,
    minWidth: '100%',
    height: '100%',
    // paddingHorizontal:10

  },
});