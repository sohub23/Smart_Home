import { Button } from '@/components/ui/button';
import { Check, Smartphone, Clock, Volume } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';


gsap.registerPlugin(ScrollTrigger);

const NarrativeSection = () => {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play reverse play reverse"
        }
      });

      tl.fromTo(headingRef.current, 
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1.5, ease: "power2.out" }
      )
      .fromTo(subtitleRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 1.2, ease: "power2.out" },
        "-=1.0"
      )
      .fromTo(cardsRef.current?.children || [],
        { opacity: 0, y: 20, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 1.0, ease: "power2.out", stagger: 0.12 },
        "-=0.6"
      )
      .fromTo(videoRef.current,
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 1.3, ease: "power2.out" },
        "-=0.8"
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="section-padding bg-gradient-section" style={{paddingBottom: '8rem'}}>
      <div className="container-width px-4 md:px-6">
        <div className="grid lg:grid-cols-2 gap-6 md:gap-8 lg:gap-10 items-center">
          {/* Content */}
          <div className="space-y-4 md:space-y-6">
            <div className="space-y-3 md:space-y-4">
              <h2 ref={headingRef} className="text-headline text-primary">
                Control Your Comfort
              </h2>
              <p ref={subtitleRef} className="text-body-large text-muted-foreground">
                Manual curtains steal your time. Go smart—control with one tap, from anywhere.
              </p>
            </div>

            {/* Benefits List */}
            <div ref={cardsRef} className="space-y-3">
              <div className="flex items-center space-x-4 p-3 rounded-[var(--radius-card)] bg-surface border border-border">
                <div className="flex-shrink-0 w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                  <Volume className="w-5 h-5 text-accent-soft" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-primary mb-1">No more tug & pull</h3>
                  <p className="text-body-small text-muted-foreground">Silent, effortless operation</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 p-3 rounded-[var(--radius-card)] bg-surface border border-border">
                <div className="flex-shrink-0 w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-accent-soft" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-primary mb-1">One-tap open/close</h3>
                  <p className="text-body-small text-muted-foreground">Control from anywhere with the app</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 p-3 rounded-[var(--radius-card)] bg-surface border border-border">
                <div className="flex-shrink-0 w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                  <Clock className="w-5 h-5 text-accent-soft" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-primary mb-1">Schedules & scenes</h3>
                  <p className="text-body-small text-muted-foreground">Automated comfort, exactly when you need it</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-6">
              <Button 
                onClick={() => document.getElementById('specs')?.scrollIntoView({ behavior: 'smooth' })}
                className="btn-primary text-base py-3 px-6"
              >
                Learn More
              </Button>
              <Button 
                onClick={() => document.getElementById('order')?.scrollIntoView({ behavior: 'smooth' })}
                className="btn-secondary text-base py-3 px-6"
              >
                Buy Now
              </Button>
            </div>


          </div>

          {/* Visual */}
          <div ref={videoRef} className="relative">
            <div className="aspect-video rounded-[var(--radius-large)] overflow-hidden shadow-medium relative">
              {/* Thumbnail placeholder */}
              <img
                src="/assets/default_images/roller_thumbnail.png"
                alt="Roller curtain thumbnail"
                className={`w-full h-full object-cover transition-opacity duration-500 ${
                  videoLoaded ? 'opacity-0' : 'opacity-100'
                }`}
              />
              
              {/* YouTube video */}
              <iframe
                src="https://www.youtube.com/embed/K0MZDn2Tw_4?autoplay=1&mute=1&loop=1&playlist=K0MZDn2Tw_4"
                className={`absolute inset-0 w-full h-full transition-opacity duration-500 ${
                  videoLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                allow="autoplay; encrypted-media"
                allowFullScreen
                onLoad={() => {
                  setTimeout(() => setVideoLoaded(true), 2000);
                }}
              />
            </div>
            
            {/* Floating card */}
            <div className="absolute -bottom-4 -right-4 md:-bottom-6 md:-right-6 bg-background p-4 md:p-6 rounded-[var(--radius-card)] shadow-strong border border-border max-w-xs">
              <h4 className="text-sm md:text-base font-semibold text-primary mb-2">The Curtain Luxe way:</h4>
              <p className="text-xs md:text-sm text-muted-foreground">Smart automation that adapts to your life</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NarrativeSection;