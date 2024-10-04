"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

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
  container: "flex flex-row w-full h-full text-white",
  leftColumn: "w-1/4 p-4 flex flex-col",
  categoryButton: "bg-white text-black px-2 py-1 mb-2 rounded",
  middleColumn: "w-1/2 relative",
  video: "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full max-h-full max-w-full object-cover rounded-xl border border-gray-200 overflow-hidden",
  spinner: "spinner border-t-4 border-b-4 border-gray-900 rounded-full w-12 h-12 animate-spin",
  likeButton: "absolute top-4 right-4 text-white z-30",
  rightColumn: "w-1/4 p-4 flex flex-col text-white",
  externalLink: "mt-4 p-2 bg-blue-500 text-white rounded text-center block",
  nextButtonContainer: "absolute bottom-4 w-full flex justify-center",
  nextButton: "p-4 bg-black text-white rounded",
};

export default function VideoPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<Video[]>([]);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('videos')
      .select('*');

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
        video.categories.forEach((category) => uniqueCategories.add(category));
      });
      setAllCategories(Array.from(uniqueCategories));
    }
    setIsLoading(false);
  };

  const filterVideosByCategory = (category: string) => {
    const filtered = videos.filter(video => video.categories.includes(category));
    setFilteredVideos(filtered);
    setCurrentVideoIndex(0);
  };

  const handleNextVideo = () => {
    setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % filteredVideos.length);
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

  return (
    <div className={styles.container}>
      {/* Linke Spalte: Filter */}
      <div className={styles.leftColumn}>
        {allCategories.map((category) => (
          <button
            key={category}
            onClick={() => filterVideosByCategory(category)}
            className={styles.categoryButton}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Mittlere Spalte: Video */}
      <div className={styles.middleColumn} style={{ height: '100vh' }}>
        {isLoading ? (
          <div className={styles.spinner}></div>
        ) : (
          <video
            src={filteredVideos.length > 0 ? filteredVideos[currentVideoIndex].videoUrl : ''}
            autoPlay
            loop
            muted
            className={styles.video}
            style={{ aspectRatio: '9 / 16' }}
          />
        )}
        <button
          onClick={handleLike}
          className={styles.likeButton}
        >
          ❤️ {filteredVideos.length > 0 ? filteredVideos[currentVideoIndex].likes : 0}
        </button>
      </div>

      {/* Rechte Spalte: Titel, Beschreibung, Externer Link */}
      <div className={styles.rightColumn}>
        {filteredVideos.length > 0 && (
          <>
            <strong className="text-2xl">{filteredVideos[currentVideoIndex].title}</strong>
            <p className="text-md my-4">{filteredVideos[currentVideoIndex].description}</p>
            <a href={filteredVideos[currentVideoIndex].external_link} target="_blank" rel="noopener noreferrer" className={styles.externalLink}>
              Zum Externen Link
            </a>
          </>
        )}
      </div>

      {/* Button für neues Video */}
      <div className={styles.nextButtonContainer}>
        <button
          onClick={handleNextVideo}
          className={styles.nextButton}
        >
          Neuer Trend
        </button>
      </div>
    </div>
  );
}