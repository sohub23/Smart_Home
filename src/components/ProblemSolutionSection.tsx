import { Clock, Smartphone, VolumeX, Settings } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const problemSolutions = [
  {
    problem: "Miss the perfect timing?",
    solution: "Automated schedules that match sunrise and sunset.",
    icon: Clock
  },
  {
    problem: "Not at home?",
    solution: "Control anytime, anywhere via app or voice.",
    icon: Smartphone
  },
  {
    problem: "Tired of pulling and noisy movement?",
    solution: "Whisper-quiet motor with smooth glide.",
    icon: VolumeX
  },
  {
    problem: "Forget to adjust your curtains?",
    solution: "Custom scenes that do it for you.",
    icon: Settings
  }
];

const ProblemSolutionSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 75%",
          end: "bottom 25%",
          toggleActions: "play none none reverse"
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
        { opacity: 0, y: 30, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 1.0, ease: "power2.out", stagger: 0.15 },
        "-=0.6"
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="section-padding bg-white" style={{paddingBottom: '8rem'}}>
      <div className="container-width px-4 md:px-6">
        {/* Header */}
        <div className="text-center section-gap">
          <h2 ref={headingRef} className="text-headline text-primary content-gap px-4" style={{background: 'linear-gradient(180deg, #1f2937, #374151, #6b7280)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'}}>
            Turn Everyday Hassles Into Instant Comfort
          </h2>
          <p ref={subtitleRef} className="text-body-large text-gray-500 max-w-3xl mx-auto px-4" style={{background: 'linear-gradient(180deg, #1f2937, #374151, #6b7280)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'}}>
            Experience the transformation from frustration to effortless living.
          </p>
        </div>

        {/* Solutions Grid */}
        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-6xl mx-auto pb-8">
          {problemSolutions.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <div
                key={index}
                className="group relative"
              >
                {/* Card */}
                <div className="relative bg-white rounded-lg p-4 md:p-5 pb-6 md:pb-7 border border-gray-100 hover:border-gray-200 transition-all duration-500 hover:shadow-xl hover:shadow-gray-100/50 h-32 md:h-36">
                  {/* Background Gradient */}
                  <div className="absolute inset-0 rounded-2xl bg-gray-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Content */}
                  <div className="relative z-10">
                    {/* Icon */}
                    <div className="mb-3">
                      <IconComponent className="w-5 h-5 text-black" />
                    </div>

                    {/* Problem */}
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 leading-tight">
                      {item.problem}
                    </h3>

                    {/* Solution */}
                    <p className="text-body text-gray-600 leading-relaxed">
                      {item.solution}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>


      </div>
    </section>
  );
};

export default ProblemSolutionSection;