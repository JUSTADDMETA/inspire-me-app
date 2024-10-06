import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, PanInfo, useAnimation } from 'framer-motion';
import { FaPlay, FaPause, FaVolumeMute, FaVolumeUp, FaExpand, FaCompress } from 'react-icons/fa';

const VideoPlayer = ({ videoUrl, isMuted, toggleMute, title, description, externalLink, onSwipeLeft }) => {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const controls = useAnimation();

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

  const handleDrag = (event, info) => {
    if (info.offset.y < -50 && !isExpanded) {
      controls.start({ height: 'auto' });
      setIsExpanded(true);
    } else if (info.offset.y > 50 && isExpanded) {
      setIsExpanded(false);
    }
  };

  const handleDragEnd = (e, info) => {
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
    if (videoRef.current) {
      videoRef.current.addEventListener('play', () => setIsPlaying(true));
      videoRef.current.addEventListener('pause', () => setIsPlaying(false));
    }

    return () => {
      if (videoRef.current) {
        videoRef.current.removeEventListener('play', () => setIsPlaying(true));
        videoRef.current.removeEventListener('pause', () => setIsPlaying(false));
      }
    };
  }, []);

  return (
    <motion.div
      ref={containerRef}
      className="rounded-lg relative overflow-hidden"
      style={{ width: '100%', height: isExpanded ? 'auto' : '100%', aspectRatio: '9/16' }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.2}
      onDragEnd={handleDragEnd}
      animate={controls}
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
        style={{ width: '100%', height: '100%' }}
        className="rounded-none md:rounded-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      />
      <div className="absolute top-4 right-4 flex gap-2 z-30">
        <button
          onClick={togglePlay}
          className="w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center"
        >
          {isPlaying ? <FaPause size={16} /> : <FaPlay size={16} />}
        </button>
        <button
          onClick={toggleMute}
          className="w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center"
        >
          {isMuted ? <FaVolumeMute size={16} /> : <FaVolumeUp size={16} />}
        </button>
        <button
          onClick={toggleFullscreen}
          className="w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center"
        >
          {isFullscreen ? <FaCompress size={16} /> : <FaExpand size={16} />}
        </button>
      </div>
      <motion.div
        className="md:hidden absolute bottom-0 left-0 right-0 bg-black/70 text-white rounded-b-lg cursor-pointer"
        initial={{ height: '60px' }}
        animate={{ height: isExpanded ? 'auto' : '60px' }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        onDrag={handleDrag}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      >
        <div className="p-4">
          <div className="flex justify-center mb-2">
            <div className="w-16 h-1 bg-gray-300 rounded-full" />
          </div>
          {isExpanded && (
            <div>
              <h2 className="text-xl font-bold mb-2">{title}</h2>
              <p className="mb-4">{description}</p>
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