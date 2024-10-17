import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, PanInfo, useAnimation } from 'framer-motion';
import { FaPlay, FaPause, FaVolumeMute, FaVolumeUp, FaExpand, FaCompress } from 'react-icons/fa';

interface VideoPlayerProps {
  videoUrl: string;
  isMuted: boolean;
  toggleMute: () => void;
  title: string;
  description: string;
  externalLink: string;
  onSwipeLeft: () => void;
  categories: string[]; // Neue Prop für Kategorien
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  videoUrl, 
  isMuted, 
  toggleMute, 
  title, 
  description, 
  externalLink, 
  onSwipeLeft,
  categories // Neue Prop für Kategorien
}) => {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [showPlayButton, setShowPlayButton] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const controls = useAnimation();
  const volumeSliderTimeout = useRef<NodeJS.Timeout | null>(null);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }, []);

  const togglePlay = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  const handleDrag = (event: any, info: PanInfo) => {
    if (info.offset.y < -50 && !isExpanded) {
      controls.start({ height: 'auto' });
      setIsExpanded(true);
    } else if (info.offset.y > 50 && isExpanded) {
      setIsExpanded(false);
    }
  };

  const handleDragEnd = (e: any, info: PanInfo) => {
    if (info.offset.x < -100) {
      controls
        .start({ x: -300, opacity: 0, rotate: -10, transition: { duration: 0.3 } })
        .then(onSwipeLeft);
    } else {
      controls.start({ x: 0, opacity: 1, rotate: 0, transition: { duration: 0.3 } });
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (videoElement) {
      const handlePlay = () => setIsPlaying(true);
      const handlePause = () => setIsPlaying(false);
      const handleTimeUpdate = () => setCurrentTime(videoElement.currentTime);
      const handleLoadedMetadata = () => setDuration(videoElement.duration);

      videoElement.addEventListener('play', handlePlay);
      videoElement.addEventListener('pause', handlePause);
      videoElement.addEventListener('timeupdate', handleTimeUpdate);
      videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);

      return () => {
        videoElement.removeEventListener('play', handlePlay);
        videoElement.removeEventListener('pause', handlePause);
        videoElement.removeEventListener('timeupdate', handleTimeUpdate);
        videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
      };
    }
  }, []);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const volume = parseFloat(e.target.value);
    setVolume(volume);
    if (videoRef.current) {
      videoRef.current.volume = volume;
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const handleMouseEnter = () => {
    setShowPlayButton(true);
  };

  const handleMouseLeave = () => {
    setShowPlayButton(false);
  };

  return (
    <motion.div
      ref={containerRef}
      className="rounded-none md:rounded-lg relative overflow-hidden"
      style={{ width: '100%', height: isExpanded ? 'auto' : '100%', aspectRatio: '9/16' }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.2}
      onDragEnd={handleDragEnd}
      animate={controls}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {!isVideoLoaded && (
        <div className="flex items-center justify-center w-full h-full bg-gray-800">
          <div className="w-12 h-12 bg-white rounded-full"></div>
        </div>
      )}
      <motion.video
        ref={videoRef}
        src={videoUrl}
        loop
        muted={isMuted}
        autoPlay
        playsInline
        onLoadedData={() => setIsVideoLoaded(true)}
        style={{ width: '100%', height: '100%', cursor: 'pointer' }}
        className="rounded-none md:rounded-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        onClick={togglePlay}
      />
      {showPlayButton && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <button
            className="w-16 h-16 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center"
          >
            {isPlaying ? <FaPause size={32} /> : <FaPlay size={32} />}
          </button>
        </div>
      )}
      <div className="absolute top-4 right-4 flex gap-2 z-30">
        <div
          className="relative"
          onMouseEnter={() => setShowVolumeSlider(true)}
          onMouseLeave={() => setShowVolumeSlider(false)}
        >
          <button
            onClick={() => {
              toggleMute();
              setVolume(isMuted ? 1 : 0);
            }}
            className="w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center"
          >
            {isMuted ? <FaVolumeMute size={16} /> : <FaVolumeUp size={16} />}
          </button>
        </div>
        <button
          onClick={toggleFullscreen}
          className="w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center"
        >
          {isFullscreen ? <FaCompress size={16} /> : <FaExpand size={16} />}
        </button>
      </div>
      <motion.div
        className="absolute bottom-20 left-4 right-4 flex items-center gap-2 z-30 md:bottom-4"
        initial={{ opacity: 1 }}
        animate={{ opacity: isExpanded ? 0 : 1 }}
        transition={{ duration: 0.5 }}
      >
        <input
          type="range"
          min="0"
          max={duration}
          step="0.1"
          value={currentTime}
          onChange={handleSeek}
          className="flex-1 appearance-none bg-transparent [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-black/50 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
        />
      </motion.div>
      <motion.div
        className="md:hidden absolute bottom-0 left-0 right-0 bg-black/70 text-white rounded-t-lg cursor-pointer"
        initial={{ height: '60px' }}
        animate={{ height: isExpanded ? 'auto' : '60px' }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        onDrag={handleDrag}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()} // Verhindert, dass der Klick das Video beeinflusst
      >
        <div className="p-4">
          <div className="flex justify-center mb-2">
            <div className="w-16 h-1 bg-gray-300 rounded-full" />
          </div>
          {isExpanded && (
            <div>
              <p className="text-sm text-gray-400 mb-2">
                Kategorien: {categories.join(', ')}
              </p>
              <h2 className="text-xl font-bold mb-2">{title}</h2>
              <p className="mb-4 text-sm md:text-base">{description}</p>
              <a
                href={externalLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 px-6 bg-[#defd3e] text-black rounded inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-gray-200"
              >
                Zum Externen Link
              </a>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default VideoPlayer;