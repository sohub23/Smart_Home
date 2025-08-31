import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import heroSlidingImage from '@/assets/hero-sliding-curtain.jpg';
import heroRollerImage from '@/assets/hero-roller-curtain.jpg';

const slides = [
  {
    id: 1,
    video: '/videos/Slide Curtain .mp4',
    image: heroSlidingImage, // Fallback image
    headline: "Every Home. A Smart Home.",
    subtitle: "Transform your home into a world of safety, comfort, and effortless control.",
    alt: "Smart curtain demonstration video"
  },
  {
    id: 2,
    video: '/videos/Roller Curtain.mp4',
    image: heroRollerImage, // Fallback image
    headline: "Every Home. A Smart Home.",
    subtitle: "Transform your home into a world of safety, comfort, and effortless control.",
    alt: "Roller curtain demonstration video"
  }
];

const HeroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

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
              {slide.video ? (
                <>
                  <video
                    key={slide.id}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    className="w-full h-full object-cover"
                    style={{ display: 'block' }}
                    onError={(e) => {
                      // Video failed to load, fallback handled by image
                    }}
                  >
                    <source src={slide.video} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  {/* Fallback image overlay - hidden when video loads */}
                  <img
                    src={slide.image}
                    alt={slide.alt}
                    className="absolute inset-0 w-full h-full object-cover -z-10"
                    style={{ display: 'none' }}
                    onLoad={() => {
                      // Show image if video fails
                      const video = document.querySelector(`video[src*="${slide.video.split('/').pop()}"]`) as HTMLVideoElement;
                      if (video && video.readyState === 0) {
                        (video.nextElementSibling as HTMLImageElement).style.display = 'block';
                        video.style.display = 'none';
                      }
                    }}
                  />
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
            <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 fade-in leading-tight">
              {slides[currentSlide].headline}
            </h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl mb-6 md:mb-8 max-w-2xl mx-auto opacity-90 fade-in-delay px-4">
              {slides[currentSlide].subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4 justify-center fade-in-delay px-4">
              <Button onClick={scrollToOrder} className="btn-cta w-full sm:w-auto text-sm md:text-base py-2 md:py-3 px-4 md:px-6">
                Build Your Smart Home
              </Button>
              <Button 
                onClick={() => document.getElementById('specs')?.scrollIntoView({ behavior: 'smooth' })}
                className="btn-cta w-full sm:w-auto text-sm md:text-base py-2 md:py-3 px-4 md:px-6"
              >
                Watch How It Works
              </Button>
            </div>
            {/* Built for Comfort Badge */}
            <div className="mt-6 md:mt-8 fade-in-delay">
              <span className="inline-flex items-center px-2 sm:px-3 md:px-4 py-1.5 md:py-2 bg-black/80 backdrop-blur-sm rounded-full text-xs md:text-sm font-medium text-white border border-black">
                #BuiltForComfort
              </span>
            </div>
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