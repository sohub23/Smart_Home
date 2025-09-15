import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { gsap } from 'gsap';


const slides = [
  {
    id: 1,
    youtubeId: 'APm2EDVBljw',
    image: '/assets/hero-sliding-curtain.jpg',
    thumbnail: '/assets/default_images/slider_thumbnail.png',
    headline: "Every Home. A Smart Home.",
    subtitle: "Transform your home into a world of safety, security comfort, and effortless control.",
    alt: "Smart curtain demonstration video"
  },
  {
    id: 2,
    youtubeId: 'K0MZDn2Tw_4',
    image: '/assets/hero-roller-curtain.jpg',
    thumbnail: '/assets/default_images/roller_thumbnail.png',
    headline: "Every Home. A Smart Home.",
    subtitle: "Transform your home into a world of safety, security comfort, and effortless control.",
    alt: "Roller curtain demonstration video"
  }
];

const HeroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [showImages, setShowImages] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState<{[key: number]: boolean}>({});
  
  // Reset video loaded state when slide changes
  useEffect(() => {
    const currentSlideData = slides[currentSlide];
    if (currentSlideData.youtubeId && !showImages) {
      // Reset video loaded state for smooth transition
      setVideoLoaded(prev => ({ ...prev, [currentSlideData.id]: false }));
    }
  }, [currentSlide, showImages]);
  const heroRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    // Initial hero animation
    const tl = gsap.timeline();
    tl.fromTo(headlineRef.current, 
      { opacity: 0 },
      { opacity: 1, duration: 1.5, ease: "none" }
    )
    .fromTo(subtitleRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 1.2, ease: "none" },
      "-=0.8"
    );
  }, []);

  useEffect(() => {
    // Animate content on slide change
    if (headlineRef.current && subtitleRef.current) {
      gsap.fromTo([headlineRef.current, subtitleRef.current],
        { opacity: 0 },
        { opacity: 1, duration: 0.8, ease: "none", stagger: 0.1 }
      );
    }
  }, [currentSlide]);

  useEffect(() => {
    if (!isAutoPlaying && !showImages) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, showImages ? 3000 : 6000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, showImages]);

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
    <section id="hero" ref={heroRef} className="relative h-screen overflow-hidden">
      {/* Slides */}
      <div className="relative w-full h-full">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <div className="relative w-full h-full">
              {/* Default image - show during loading or when videos are paused */}
              <img
                src={showImages || !videoLoaded[slide.id] ? slide.thumbnail : slide.image}
                alt={slide.alt}
                className={`w-full h-full object-cover transition-opacity duration-500 ${
                  showImages || !videoLoaded[slide.id] ? 'opacity-100' : 'opacity-30'
                }`}
                loading="eager"
              />
              
              {/* YouTube video overlay - only show when loaded and not paused */}
              {slide.youtubeId && !showImages && index === currentSlide && (
                <iframe
                  key={`${slide.id}-${currentSlide}`}
                  src={`https://www.youtube.com/embed/${slide.youtubeId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${slide.youtubeId}&rel=0&showinfo=0&modestbranding=1&enablejsapi=1&origin=${window.location.origin}`}
                  className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${
                    videoLoaded[slide.id] ? 'opacity-100' : 'opacity-0'
                  }`}
                  style={{ 
                    border: 'none',
                    width: '177.78vh',
                    height: '100vh',
                    minWidth: '100vw',
                    minHeight: '56.25vw',
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)'
                  }}
                  allow="autoplay; encrypted-media; fullscreen"
                  allowFullScreen
                  title={slide.alt}
                  loading="eager"
                  onLoad={() => {
                    setTimeout(() => {
                      setVideoLoaded(prev => ({ ...prev, [slide.id]: true }));
                    }, 2000);
                  }}
                />
              )}
              
              {/* Pause/Play button */}
              <button
                onClick={() => setShowImages(!showImages)}
                className="absolute top-4 right-4 z-30 p-3 rounded-full bg-black/50 text-white hover:bg-black/70 transition-all"
              >
                {showImages ? '▶️' : '⏸️'}
              </button>
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
            <h1 ref={headlineRef} className="text-2xl sm:text-3xl md:text-6xl lg:text-7xl font-bold mb-6 md:mb-8 whitespace-nowrap">
              {slides[currentSlide].headline}
            </h1>
            <p ref={subtitleRef} className="text-sm sm:text-base md:text-lg lg:text-xl mb-8 md:mb-10 max-w-3xl mx-auto opacity-90 px-4 leading-relaxed">
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