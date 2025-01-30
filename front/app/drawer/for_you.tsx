import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Surface } from 'react-native-paper';
import { Dimensions, FlatList, StyleSheet, View } from 'react-native';
import { getHomeRunVideos } from '@/lib/data/mlb_data/videos';
import VideoPlayer from '@/lib/presentation/VideoPlayer';
import { getWatchedVideos, viewHomeRun } from '@/lib/data/pocketbase/video';
import { useAuth } from '@/lib/data/pocketbase/auth';
import { usePocketBase } from '@/lib/data/pocketbase';

const ForYou = () => {
  const [videos, setVideos] = useState<any[]>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore] = useState(true);
  const { user } = useAuth();
  const { pb } = usePocketBase();

  const ITEMS_PER_PAGE = 10;

const fetchVideos = async (page: number) => {
  try {
    setLoading(true);

    // Fetch videos and watched list in parallel
    const [data, watchedList] = await Promise.all([
      getHomeRunVideos(page, ITEMS_PER_PAGE),
      getWatchedVideos(user, pb)
    ]);

    const watchedPlayIds = watchedList.map((video: any) => video.play_id);

    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const filteredData = data
      .filter((video: any) => !watchedPlayIds.includes(video.play_id))
      .map((video: any, index: number) => ({ ...video, id: startIndex + index }));

    // Use functional state update to avoid unnecessary re-renders
    setVideos((prev) => [...prev, ...filteredData]);
    setLoading(false);
  } catch (error) {
    console.error('Error fetching videos:', error);
    setLoading(false);
  }
};

useEffect(() => {
  fetchVideos(currentPage);

  return () => {
    // Cleanup function to release memory
    setVideos([]);
    setActiveIndex(null);
  };
}, [currentPage]);

  const loadMoreVideos = () => {
    if (!loading && hasMore) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handleViewableItemsChanged = React.useCallback(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      console.log(viewableItems[0]);
      setActiveIndex(viewableItems[0].item.play_id);
      viewHomeRun(user, pb, viewableItems[0].item.play_id).then((res) => {
        console.log(res);
      });
    }
  }, []);

  return (
    <View style={{ height: '100%' }}>
      <FlatList
        data={videos}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        renderItem={({ item }) => (
          <VideoPlayer item={item} index={item.id} isViewable={activeIndex === item.play_id} isLiked isBookmarked />
        )}
        snapToAlignment="end"
        snapToInterval={Dimensions.get('window').height}
        snapToEnd={true}
        showsVerticalScrollIndicator={false}
        decelerationRate="fast"
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 90 }}
        onEndReached={loadMoreVideos}
        onRefresh={loadMoreVideos}
        refreshing={loading}
        ListHeaderComponent={loading ? <ActivityIndicator size="large" color="#F0F0FF" /> : null}
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