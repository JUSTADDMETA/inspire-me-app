"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/effect-cards';
import { EffectCards } from 'swiper/modules';

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
  targetAudience: string;
  benefits: string;
  examples: string;
  likes: number;
};

export default function SliderPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSlider, setShowSlider] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

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
        targetAudience: video.targetAudience || "Allgemeine Zielgruppe",
        benefits: video.benefits || "Vorteile nicht angegeben",
        examples: video.examples || "Keine Beispiele verfügbar",
        likes: video.likes || 0
      }));
      setVideos(parsedData);
    }
    setIsLoading(false);
  };

  const handleLike = async (index: number) => {
    const video = videos[index];
    const likedVideos = JSON.parse(localStorage.getItem('likedVideos') || '[]');

    if (!likedVideos.includes(video.id)) {
      const newLikes = video.likes + 1;

      const { error } = await supabase
        .from('videos')
        .update({ likes: newLikes })
        .eq('id', video.id);

      if (!error) {
        const updatedVideos = [...videos];
        updatedVideos[index].likes = newLikes;
        setVideos(updatedVideos);

        likedVideos.push(video.id);
        localStorage.setItem('likedVideos', JSON.stringify(likedVideos));
      }
    } else {
      console.log("Already liked");
    }
  };

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="flex flex-col items-center justify-center text-black">
      {!showSlider ? (
        <button
          onClick={() => setShowSlider(true)}
          className="p-4 bg-black text-white rounded"
        >
          Inspire Me
        </button>
      ) : (
        <div className="w-full max-w-md">
          {isLoading ? (
            <div className="spinner border-t-4 border-b-4 border-gray-900 rounded-full w-12 h-12 animate-spin"></div>
          ) : (
            <Swiper
              effect="cards"
              grabCursor={true}
              modules={[EffectCards]}
              className="mySwiper"
            >
              {videos.map((video, index) => (
                <SwiperSlide key={video.file_name}>
                  <div className="relative w-full" style={{ paddingTop: '177.78%' }}>
                    <video
                      src={video.videoUrl}
                      autoPlay
                      loop
                      muted
                      className="absolute top-0 left-0 w-full h-full object-cover rounded-xl border border-gray-200 overflow-hidden"
                    />
                    <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 z-10"></div>
                    <div className="absolute top-0 left-0 w-full h-full z-20 flex flex-col justify-between p-4">
                      <div className="flex space-x-2">
                        {video.categories.map((category, index) => (
                          <button key={index} className="bg-white text-black px-2 py-1 rounded">
                            {category}
                          </button>
                        ))}
                      </div>
                      <div className="text-left text-white w-full p-4">
                        <strong className="text-4xl">{video.title}</strong>
                        <p className="text-lg mb-8">{video.description}</p>
                      </div>
                      <button
                        onClick={() => handleLike(index)}
                        className="absolute top-4 right-4 text-white z-30"
                      >
                        ❤️ {video.likes}
                      </button>
                    </div>
                    <button
                      className={`absolute bottom-4 right-4 transform transition-transform z-40 ${
                        expandedIndex === index ? 'text-black rotate-180' : 'text-white'
                      }`}
                      onClick={() => toggleExpand(index)}
                    >
                      ▲
                    </button>
                    <div
                      className={`absolute bottom-0 left-0 w-full bg-white text-black p-4 transition-transform transform ${
                        expandedIndex === index ? 'translate-y-0' : 'translate-y-full'
                      } z-30 rounded-t-lg`}
                    >
                      <p><strong>Trendbeschreibung:</strong> {video.description}</p>
                      <p><strong>Zielgruppe:</strong> {video.targetAudience}</p>
                      <p><strong>Vorteile:</strong> {video.benefits}</p>
                      <a href={video.videoUrl} className="underline">
                        Zum Video
                      </a>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </div>
      )}
    </div>
  );
}