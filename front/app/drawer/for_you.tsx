import React, { useEffect, useState, useCallback } from 'react';
import { ActivityIndicator, Surface } from 'react-native-paper';
import { Dimensions, FlatList, StyleSheet, View } from 'react-native';
import { getHomeRunVideos } from '@/lib/data/mlb_data/videos';
import VideoPlayer from '@/lib/presentation/VideoPlayer';
import { getWatchedVideos, viewHomeRun } from '@/lib/data/pocketbase/video';
import { useAuth } from '@/lib/data/pocketbase/auth';
import { usePocketBase } from '@/lib/data/pocketbase';

const ForYou = () => {
  const [videos, setVideos] = useState<any[]>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { pb } = usePocketBase();

  const ITEMS_PER_PAGE = 21;

  const fetchVideos = async (page: number) => {
    if (loading) return; // Prevent duplicate fetches
    try {
      setLoading(true);
      // Fetch videos and watched list in parallel
      const [data, watchedList] = await Promise.all([
        getHomeRunVideos(page, ITEMS_PER_PAGE),
        getWatchedVideos(user, pb),
      ]);
      const watchedPlayIds = new Set(watchedList.map((video: any) => video.play_id));
      const filteredData = data
        .filter((video: any) => !watchedPlayIds.has(video.play_id))
        .map((video: any, index: number) => ({ ...video, id: (page - 1) * ITEMS_PER_PAGE + index }));

      setVideos((prev) => [...prev, ...filteredData]);
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos(currentPage);
  }, [currentPage]);

  const loadMoreVideos = () => {
    if (!loading) setCurrentPage((prev) => prev + 1);
  };

  const handleViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      const playId = viewableItems[0].item.play_id;
      if (playId !== activeIndex) {
        setActiveIndex(playId);
        viewHomeRun(user, pb, playId).then(console.log);
      }
    }
  }, [activeIndex, user, pb]);

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={videos}
        keyExtractor={(item) => `${item.id}-${item.play_id}`}
        renderItem={({ item }) => (
          <VideoPlayer item={item} index={item.id} isViewable={activeIndex === item.play_id} isLiked isBookmarked />
        )}
        snapToAlignment="end"
        snapToInterval={Dimensions.get('window').height}
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 90 }}
        onEndReached={loadMoreVideos}
        onEndReachedThreshold={0.5}
        refreshing={loading}
        ListHeaderComponent={loading ? <ActivityIndicator size="large" color="#F0F0FF" /> : null}
        removeClippedSubviews
        initialNumToRender={5} // Render only the first few items for performance
        maxToRenderPerBatch={5} // Optimize memory usage
        windowSize={21} // Reduce the number of items kept in memory
        getItemLayout={(data, index) => ({
          length: Dimensions.get('window').height,
          offset: Dimensions.get('window').height * index,
          index,
        })}
      />
    </View>
  );
};

const style = StyleSheet.create({
  backgroundVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
});

export default ForYou;
