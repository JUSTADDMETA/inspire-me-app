"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { FaHeart, FaVolumeMute, FaVolumeUp, FaRedo } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Video = {
  id: number;
  file_name: string;
  title: string;
  description: string;
  categories: string[];
  videoUrl: string;
  external_link: string;
  likes: number;
};

const styles = {
  container: "flex flex-col w-full h-full text-white",
  gridContainer: "grid w-full justify-center gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  leftColumn: "flex content-start flex-wrap gap-2 flex flex-row gap-2 md:col-span-2 lg:col-span-1 p-0 lg:p-4 h-full",
  middleColumn: "relative",
  rightColumn: "p-0 lg:p-4 flex flex-col text-white",
  categoryButton: "w-fit py-2 px-6 bg-[#defd3e] text-black rounded-3xl inline-flex items-center justify-center whitespace-nowrap text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-gray-200",
  activeCategoryButton: "bg-gray-200 text-gray-800",
  video: "w-full h-full object-fill",
  spinner: "spinner border-t-4 border-b-4 border-gray-900 rounded-full w-12 h-12 animate-spin",
  muteButton: "absolute bottom-4 right-4 text-white z-30",
  externalLink: "w-full md:w-fit py-2 px-6 bg-[#defd3e] text-black rounded inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-gray-200",
  nextButtonContainer: "w-full flex justify-center md:col-span-2 lg:col-span-3",
  nextButton: "py-2 px-6 bg-[#defd3e] text-black rounded inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-gray-200",
  notification: "fixed top-4 right-4 bg-[#defd3e] text-black py-2 px-4 rounded shadow-lg z-50",
};

// Memoized components
const CategoryButton = React.memo(({ category, isActive, onClick }: { category: string, isActive: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`${styles.categoryButton} ${isActive ? styles.activeCategoryButton : ''}`}
  >
    {category}
  </button>
));

type VideoPlayerProps = {
  videoUrl: string;
  isMuted: boolean;
  toggleMute: () => void;
};

const VideoPlayer = React.memo(({ videoUrl, isMuted, toggleMute }: VideoPlayerProps) => {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  return (
    <div className="rounded-lg" style={{ position: 'relative', width: '100%', height: '100%', aspectRatio: '9/16' }}>
      {!isVideoLoaded && (
        <div className="flex items-center justify-center w-full h-full bg-gray-800">
          <div className={styles.spinner}></div>
        </div>
      )}
      <motion.video
        src={videoUrl}
        autoPlay
        loop
        muted={isMuted}
        playsInline
        onLoadedData={() => setIsVideoLoaded(true)}
        style={{ width: '100%', height: '100%', objectFit: 'contain', display: isVideoLoaded ? 'block' : 'none' }}
        className="rounded-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      />
      <button onClick={toggleMute} style={{ position: 'absolute', bottom: '10px', right: '10px', zIndex: 2 }}>
        {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
      </button>
    </div>
  );
});

export default function VideoPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<Video[]>([]);
  const [isMuted, setIsMuted] = useState(true);
  const [showCard, setShowCard] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from('videos').select('*');
  
    if (error) {
      console.error('Fehler beim Abrufen der Videos:', error);
    } else {
      const parsedData = data.map((video: any) => ({
        ...video,
        categories: JSON.parse(video.categories),
        videoUrl: `https://ddbyrpmrexntgqszrays.supabase.co/storage/v1/object/public/videos/${video.file_name}`,
        likes: video.likes || 0
      }));
      setVideos(parsedData);
      setFilteredVideos(parsedData);
  
      const uniqueCategories = new Set<string>();
      parsedData.forEach((video) => {
        video.categories.forEach((category: string) => uniqueCategories.add(category));
      });
      setAllCategories(Array.from(uniqueCategories));
    }
    setIsLoading(false);
  };

  const filterVideosByCategory = useCallback((category: string) => {
    if (activeCategory === category) {
      setFilteredVideos(videos);
      setActiveCategory(null);
    } else {
      const filtered = videos.filter(video => video.categories.includes(category));
      setFilteredVideos(filtered);
      setActiveCategory(category);
      setCurrentVideoIndex(0);
    }
  }, [activeCategory, videos]);

  const resetFilter = useCallback(() => {
    setFilteredVideos(videos);
    setActiveCategory(null);
    setCurrentVideoIndex(0);
  }, [videos]);

  const handleNextVideo = useCallback(() => {
    if (filteredVideos.length === 0) {
      return;
    }
    const nextIndex = (currentVideoIndex + 1) % filteredVideos.length;
    setCurrentVideoIndex(nextIndex);
    if (nextIndex === 0 && !showNotification) {
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    }
  }, [currentVideoIndex, filteredVideos.length, showNotification]);

  const toggleMute = useCallback(() => {
    setIsMuted(!isMuted);
  }, [isMuted]);

  const handleInspireMe = useCallback(() => {
    setCurrentVideoIndex(Math.floor(Math.random() * filteredVideos.length));
    setShowCard(true);
  }, [filteredVideos.length]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
    };
  
    document.addEventListener('fullscreenchange', handleFullscreenChange);
  
    // Cleanup function to remove the event listener
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <div className={styles.container}>
      <AnimatePresence>
        {showNotification && (
          <motion.div
            className={styles.notification}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.5 }}
          >
            Alle Videos angesehen.
          </motion.div>
        )}
      </AnimatePresence>

      {!showCard ? (
        <div className="flex flex-col w-full items-center justify-center text-white h-96">
          <button onClick={handleInspireMe} className="bg-[#defd3e] text-black py-2 px-6 rounded mt-32">
            Inspire Me
          </button>
        </div>
      ) : (
        <div className={styles.gridContainer}>
          <div className={styles.leftColumn}>
            {allCategories.map((category) => (
              <CategoryButton
                key={category}
                category={category}
                isActive={activeCategory === category}
                onClick={() => filterVideosByCategory(category)}
              />
            ))}
          </div>

          <motion.div
            key={`middle-${currentVideoIndex}`}
            className={styles.middleColumn}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {isLoading ? (
              <div className={styles.spinner}></div>
            ) : (
              <VideoPlayer
                videoUrl={filteredVideos.length > 0 ? filteredVideos[currentVideoIndex].videoUrl : ''}
                isMuted={isMuted}
                toggleMute={toggleMute}
              />
            )}
          </motion.div>

          <motion.div
            key={`right-${currentVideoIndex}`}
            className={styles.rightColumn}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            {filteredVideos.length > 0 && (
              <>
                <strong className="text-2xl">{filteredVideos[currentVideoIndex].title}</strong>
                <p className="text-md mt-4 mb-6">{filteredVideos[currentVideoIndex].description}</p>
                <a href={filteredVideos[currentVideoIndex].external_link} target="_blank" rel="noopener noreferrer" className={styles.externalLink}>
                  Zum Externen Link
                </a>
              </>
            )}
          </motion.div>

          <div className="fixed bottom-4 right-4 flex gap-2">
            {activeCategory && (
              <button
                onClick={resetFilter}
                className="bg-[#defd3e] text-black w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <FaRedo />
              </button>
            )}
            <button
              onClick={handleNextVideo}
              className="bg-[#defd3e] text-black w-12 h-12 md:w-auto md:h-auto md:px-6 md:py-2 rounded-full md:rounded flex items-center justify-center text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-gray-200"
            >
              <span className="hidden md:block">🔄 Spin again</span>
              <span className="block md:hidden">🔄</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}