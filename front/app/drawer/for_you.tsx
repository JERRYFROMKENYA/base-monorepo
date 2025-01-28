import React, { useEffect, useState } from 'react'
import { ActivityIndicator, Surface } from 'react-native-paper'

import { Dimensions, FlatList, StyleSheet, SafeAreaView, View } from 'react-native'
import { getHomeRunVideos } from '@/lib/data/mlb_data/videos'
import VideoPlayer from '@/lib/presentation/VideoPlayer'
import SafeScreen from '@/lib/presentation/SafeScreen'
import { viewHomeRun } from '@/lib/data/pocketbase/video'
import { useAuth } from '@/lib/data/pocketbase/auth'
import { usePocketBase } from '@/lib/data/pocketbase'

const ForYou = () => {
  const [videos, setVideos] = useState([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const {user}=useAuth()
  const {pb}=usePocketBase()

  const ITEMS_PER_PAGE = 5;

  const fetchVideos = async (page: number) => {
    setLoading(true);
    const res = await getHomeRunVideos();
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedVideos = res.slice(startIndex, endIndex).map((video, index) => ({
      ...video,
      id: startIndex + index,
    }));

    if (paginatedVideos.length < ITEMS_PER_PAGE) {
      setHasMore(false);
    }

    setVideos((prev) => [...prev, ...paginatedVideos]);
    setLoading(false);

  };

  useEffect(() => {
    fetchVideos(currentPage);
  }, [currentPage]);

  const loadMoreVideos = () => {
    if (!loading && hasMore) {
      setCurrentPage((prev) => prev + 1);
    }
    console.log(videos.length)
  };

  const handleViewableItemsChanged = React.useCallback(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index);
      // console.log(viewableItems[0].item.play_id)
      viewHomeRun(user,pb,viewableItems[0].item.play_id).then((res)=>{
        console.log(res)
      })
    }
  }, []);

  return (
    <View style={{ height: '100%'}}>
      <FlatList
        data={videos}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        renderItem={({ item }) => (
          <VideoPlayer item={item} index={item.id} isViewable={activeIndex === item.id} isLiked isBookmarked />
        )}

        snapToAlignment="end"
        snapToInterval={Dimensions.get('window').height}
        snapToEnd={true}
        decelerationRate="fast"
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 70 }}
        onEndReached={loadMoreVideos}
        onRefresh={loadMoreVideos}
        refreshing={loading}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={loading ? <ActivityIndicator  size="large" color="#F0F0FF" /> : null}
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

export default ForYou