"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { FaHeart, FaVolumeMute, FaVolumeUp } from 'react-icons/fa';
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
  container: "flex flex-col w-full h-full text-white h-fit lg:h-screen",
  gridContainer: "grid w-full justify-center gap-4 grid-cols-1 md:grid-cols-2  lg:grid-cols-3",
  leftColumn: "flex  content-start flex-wrap gap-2 flex flex-row gap-2 md:col-span-2 lg:col-span-1",
  middleColumn: "relative",
  rightColumn: "p-0 lg:p-4 flex flex-col text-white",
  categoryButton: "w-fit py-2 px-6 bg-[#defd3e] text-black rounded-3xl inline-flex items-center justify-center whitespace-nowrap text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  activeCategoryButton: "bg-[#a8d603]",
  video: "w-full h-full object-fill",
  spinner: "spinner border-t-4 border-b-4 border-gray-900 rounded-full w-12 h-12 animate-spin",
  muteButton: "absolute bottom-4 right-4 text-white z-30",
  externalLink: "w-full md:w-fit py-2 px-6 bg-[#defd3e] text-black rounded-3xl inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  nextButtonContainer: "w-full flex justify-center md:col-span-2 lg:col-span-3",
  nextButton: "py-2 px-6 bg-[#defd3e] text-black rounded-3xl inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  notification: "fixed top-4 right-4 bg-[#defd3e] text-black py-2 px-4 rounded shadow-lg",
};

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

  const filterVideosByCategory = (category: string) => {
    if (activeCategory === category) {
      setFilteredVideos(videos);
      setActiveCategory(null);
    } else {
      const filtered = videos.filter(video => video.categories.includes(category));
      setFilteredVideos(filtered);
      setActiveCategory(category);
      setCurrentVideoIndex(0);
    }
  };

  const handleNextVideo = () => {
    if (filteredVideos.length === 0) {
      return;
    }
    const nextIndex = (currentVideoIndex + 1) % filteredVideos.length;
    setCurrentVideoIndex(nextIndex);
    if (nextIndex === 0 && !showNotification) {
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    }
  };

  const handleLike = async () => {
    const video = filteredVideos[currentVideoIndex];
    const likedVideos = JSON.parse(localStorage.getItem('likedVideos') || '[]');

    if (!likedVideos.includes(video.id)) {
      const newLikes = video.likes + 1;

      const { error } = await supabase
        .from('videos')
        .update({ likes: newLikes })
        .eq('id', video.id);

      if (!error) {
        const updatedVideos = [...filteredVideos];
        updatedVideos[currentVideoIndex].likes = newLikes;
        setFilteredVideos(updatedVideos);

        likedVideos.push(video.id);
        localStorage.setItem('likedVideos', JSON.stringify(likedVideos));
      }
    } else {
      console.log("Already liked");
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleInspireMe = () => {
    setCurrentVideoIndex(Math.floor(Math.random() * filteredVideos.length));
    setShowCard(true);
  };

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
          <button onClick={handleInspireMe} className="bg-[#defd3e] text-black py-2 px-6 rounded-3xl mb-44 md:mb-60 lg:mb-72">
            Inspire Me
          </button>
        </div>
      ) : (
        <div
          className={styles.gridContainer}
        >
          <motion.div
            key={`left-${currentVideoIndex}`}
            className={styles.leftColumn}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {allCategories.map((category) => (
              <button
                key={category}
                onClick={() => filterVideosByCategory(category)}
                className={`${styles.categoryButton} ${activeCategory === category ? styles.activeCategoryButton : ''}`}
              >
                {category}
              </button>
            ))}
          </motion.div>

          <motion.div
            key={`middle-${currentVideoIndex}`}
            className={styles.middleColumn}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div style={{ position: 'relative' }}>
              {isLoading ? (
                <div className={styles.spinner}></div>
              ) : (
                <motion.video
                  key={filteredVideos[currentVideoIndex].id}
                  src={filteredVideos.length > 0 ? filteredVideos[currentVideoIndex].videoUrl : ''}
                  autoPlay
                  loop
                  muted={isMuted}
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                />
              )}
              <button onClick={toggleMute} style={{ position: 'absolute', bottom: '10px', right: '10px', zIndex: 2 }}>
                {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
              </button>
            </div>
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
                <p className="text-md my-4">{filteredVideos[currentVideoIndex].description}</p>
                <a href={filteredVideos[currentVideoIndex].external_link} target="_blank" rel="noopener noreferrer" className={styles.externalLink}>
                  Zum Externen Link
                </a>
              </>
            )}
          </motion.div>

          
          <button
    onClick={handleNextVideo}
    className="bg-[#defd3e] text-black w-12 h-12 md:w-auto md:h-auto md:px-6 md:py-2 rounded-full md:rounded-3xl flex items-center justify-center text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 fixed bottom-4 right-4"
>
    <span className="hidden md:block">Spin again</span> {/* Text für Desktop */}
    <span className="block md:hidden">🔄</span> {/* Icon für Mobile */}
</button>

        </div>
      )}
    </div>
  );
}