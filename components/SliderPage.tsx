"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, RotateCw, Shuffle } from "lucide-react"
import VideoPlayer from './VideoPlayer';

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
  leftColumn: "hidden md:flex content-start flex-wrap gap-2 flex-row md:col-span-2 lg:col-span-1 p-0 lg:p-4 h-full",
  middleColumn: "relative",
  rightColumn: "p-0 lg:p-4 flex flex-col text-white",
  categoryButton: "w-fit py-2 px-6 bg-[#defd3e] text-black rounded-3xl inline-flex items-center justify-center whitespace-nowrap text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-gray-200",
  activeCategoryButton: "bg-gray-200 text-gray-800",
  spinner: "spinner border-t-4 border-b-4 border-gray-900 rounded-full w-12 h-12 animate-spin",
  externalLink: "w-full md:w-fit py-2 px-6 bg-[#defd3e] text-black rounded inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-gray-200",
  notification: "fixed top-4 right-4 bg-[#defd3e] text-black py-2 px-4 rounded shadow-lg z-50",
};

const CategoryButton = React.memo(({ category, isActive, onClick }: { category: string, isActive: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`${styles.categoryButton} ${isActive ? styles.activeCategoryButton : ''}`}
  >
    {category}
  </button>
));

export default function SliderPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<Video[]>([]);
  const [isMuted, setIsMuted] = useState(true);
  const [showCard, setShowCard] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [showCategoryPopup, setShowCategoryPopup] = useState(false);

  const toggleFilter = useCallback(() => {
    if (activeCategory) {
      setActiveCategory(null);
      setFilteredVideos(videos);
    } else {
      setShowCategoryPopup(true);
    }
  }, [activeCategory, videos]);

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
    setShowCategoryPopup(false);
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
        <div className="flex flex-col w-full items-center justify-center text-white h-screen">
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
                title={filteredVideos[currentVideoIndex].title}
                description={filteredVideos[currentVideoIndex].description}
                externalLink={filteredVideos[currentVideoIndex].external_link}
                onSwipeLeft={handleNextVideo}
              />
            )}
          </motion.div>

          <motion.div
            key={`right-${currentVideoIndex}`}
            className={`${styles.rightColumn} hidden md:flex`}
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
            <button
              onClick={toggleFilter}
              className="md:hidden bg-[#defd3e] text-black w-12 h-12 rounded-full flex items-center justify-center text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {activeCategory ? <RotateCw className="h-5 w-5" /> : <Filter className="h-5 w-5" />}
            </button>
            <button
              onClick={handleNextVideo}
              className="bg-[#defd3e] text-black w-12 h-12 md:w-auto md:h-auto md:px-6 md:py-2 rounded-full md:rounded flex items-center justify-center text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-gray-200"
            >
              <span className="hidden md:block">🔄 Spin again</span>
              <Shuffle className="h-5 w-5 md:hidden" />
            </button>
          </div>
        </div>
      )}

      {showCategoryPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 w-80">
            <h2 className="text-xl font-bold mb-4 text-black">Kategorien</h2>
            <div className="grid grid-cols-2 gap-2">
              {allCategories.map((category) => (
                <CategoryButton
                  key={category}
                  category={category}
                  isActive={activeCategory === category}
                  onClick={() => filterVideosByCategory(category)}
                />
              ))}
            </div>
            <button
              onClick={() => setShowCategoryPopup(false)}
              className="mt-4 w-full py-2 px-4 bg-gray-200 text-black rounded"
            >
              Schließen
            </button>
          </div>
        </div>
      )}
    </div>
  );
}