import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import heroSlidingImage from '@/assets/hero-sliding-curtain.jpg';
import heroRollerImage from '@/assets/hero-roller-curtain.jpg';
import sliderThumbnail from '@/assets/default_images/slider_thumbnail.png';
import rollerThumbnail from '@/assets/default_images/roller_thumbnail.png';

const slides = [
  {
    id: 1,
    youtubeId: 'APm2EDVBljw',
    image: heroSlidingImage,
    thumbnail: sliderThumbnail,
    headline: "Every Home. A Smart Home.",
    subtitle: "Transform your home into a world of safety, security comfort, and effortless control.",
    alt: "Smart curtain demonstration video"
  },
  {
    id: 2,
    youtubeId: 'K0MZDn2Tw_4',
    image: heroRollerImage,
    thumbnail: rollerThumbnail,
    headline: "Every Home. A Smart Home.",
    subtitle: "Transform your home into a world of safety, security comfort, and effortless control.",
    alt: "Roller curtain demonstration video"
  }
];

const HeroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [videoLoaded, setVideoLoaded] = useState<{[key: number]: boolean}>({});

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setIsAutoPlaying(false);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
  };

  const scrollToOrder = () => {
    const element = document.getElementById('order');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="hero" className="relative h-screen overflow-hidden">
      {/* Slides */}
      <div className="relative w-full h-full">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="relative w-full h-full">
              {slide.youtubeId ? (
                <>
                  {/* YouTube video - hidden initially */}
                  <iframe
                    key={slide.id}
                    src={`https://www.youtube-nocookie.com/embed/${slide.youtubeId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${slide.youtubeId}`}
                    className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-opacity duration-500 ${
                      videoLoaded[slide.id] ? 'opacity-100' : 'opacity-0'
                    }`}
                    style={{ 
                      border: 'none',
                      width: '177.78vh',
                      height: '100vh',
                      minWidth: '100vw',
                      minHeight: '56.25vw'
                    }}
                    allow="autoplay; encrypted-media"
                    title={slide.alt}
                    onLoad={() => {
                      setTimeout(() => {
                        setVideoLoaded(prev => ({ ...prev, [slide.id]: true }));
                      }, 3000);
                    }}
                  />
                  
                  {/* Default thumbnail overlay - covers everything until video is ready */}
                  <div className={`absolute inset-0 transition-opacity duration-500 ${
                    videoLoaded[slide.id] ? 'opacity-0 pointer-events-none' : 'opacity-100'
                  }`}>
                    <img
                      src={slide.thumbnail}
                      alt={slide.alt}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </>
              ) : (
                <img
                  src={slide.image}
                  alt={slide.alt}
                  className={`w-full h-full object-cover ${
                    index === currentSlide ? 'animate-ken-burns' : ''
                  }`}
                />
              )}
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-white/10" />
              <div className="absolute inset-0 bg-gradient-to-t from-white/20 via-white/10 to-white/5" />
            </div>
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="container-width px-4 md:px-6">
          <div className="text-center text-black max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 md:mb-8 fade-in whitespace-nowrap">
              {slides[currentSlide].headline}
            </h1>
            <p className="text-body-large mb-8 md:mb-10 max-w-3xl mx-auto opacity-90 fade-in-delay px-4">
              {slides[currentSlide].subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-2 md:left-4 top-1/2 transform -translate-y-1/2 z-20 p-2 md:p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-4 h-4 md:w-6 md:h-6" />
      </button>
      
      <button
        onClick={nextSlide}
        className="absolute right-2 md:right-4 top-1/2 transform -translate-y-1/2 z-20 p-2 md:p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all"
        aria-label="Next slide"
      >
        <ChevronRight className="w-4 h-4 md:w-6 md:h-6" />
      </button>

      {/* Dots Navigation */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex space-x-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentSlide 
                ? 'bg-white' 
                : 'bg-white/40 hover:bg-white/60'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Scroll Indicator */}
      <div className="hidden md:block absolute bottom-8 right-8 z-20">
        <div className="flex flex-col items-center text-white/60">
          <span className="text-sm mb-2 font-medium">Scroll</span>
          <div className="w-px h-8 bg-white/30">
            <div className="w-px h-4 bg-white animate-pulse" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSlider;