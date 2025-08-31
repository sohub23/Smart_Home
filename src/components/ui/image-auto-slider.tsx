import React, { useState, useRef, useEffect } from 'react';
import { X, Play } from 'lucide-react';

export const Component = () => {
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [loadedVideos, setLoadedVideos] = useState<Set<number>>(new Set());
  
  const youtubeVideos = [
    'cIDcLSghrJY',
    '3K-vu8aWYAs',
    'KihfqNckf8g',
    'Oivl481b1kA',
    '2jh58viBn2g',
    'DcLR83ElzH0',
    'PCNSRqS0b78',
    'bLHPxZDQyPI'
  ];

  const duplicatedVideos = [...youtubeVideos, ...youtubeVideos];

  const handleVideoClick = (videoId: string, index: number) => {
    setLoadedVideos(prev => new Set([...prev, index]));
    setSelectedVideo(videoId);
  };

  return (
    <>
      <style>{`
        @keyframes scroll-right {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .infinite-scroll {
          animation: scroll-right 30s linear infinite;
        }
        
        .infinite-scroll:hover {
          animation-play-state: paused;
        }

        .scroll-container {
          mask: linear-gradient(
            90deg,
            transparent 0%,
            black 10%,
            black 90%,
            transparent 100%
          );
          -webkit-mask: linear-gradient(
            90deg,
            transparent 0%,
            black 10%,
            black 90%,
            transparent 100%
          );
        }

        .video-item {
          transition: transform 0.3s ease;
        }

        .video-item:hover {
          transform: scale(1.05);
        }
      `}</style>
      
      <div className="w-full bg-gradient-to-br from-gray-50 to-white relative overflow-hidden flex items-center justify-center py-16">
        <div className="relative z-10 w-full flex items-center justify-center">
          <div className="scroll-container w-full">
            <div className="infinite-scroll flex gap-6 w-max">
              {duplicatedVideos.map((videoId, index) => (
                <div
                  key={index}
                  className="video-item flex-shrink-0 w-80 h-48 md:w-96 md:h-56 lg:w-[420px] lg:h-64 rounded-xl overflow-hidden shadow-lg cursor-pointer relative group"
                  onClick={() => handleVideoClick(videoId, index)}
                >
                  {loadedVideos.has(index) ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&modestbranding=1`}
                      title={`YouTube video ${index + 1}`}
                      className="w-full h-full border-0 pointer-events-none"
                      frameBorder="0"
                      style={{ border: 'none', outline: 'none' }}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-900 flex items-center justify-center relative">
                      <img
                        src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
                        alt={`YouTube thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                        }}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                        <Play className="w-12 h-12 text-white opacity-80" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Video Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4" onClick={() => setSelectedVideo(null)}>
          <div className="relative max-w-4xl w-full max-h-[90vh] bg-black rounded-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedVideo(null)}
              className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all duration-200"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="aspect-video">
              <iframe
                src={`https://www.youtube.com/embed/${selectedVideo}?autoplay=1&controls=1&showinfo=0&rel=0&modestbranding=1`}
                title="YouTube video modal"
                className="w-full h-full border-0"
                frameBorder="0"
                style={{ border: 'none', outline: 'none' }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};