import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pause, ChevronLeft, ChevronRight, Square, ArrowLeft, ArrowRight, ChevronsLeft, ChevronsRight, ChevronDown, ChevronUp, ArrowUp, ArrowDown } from 'lucide-react';


// Realistic indoor background with window image
const realisticRoomBackground = `
  background-image: url('/assets/window.jpeg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
`;

const InteractiveDemoSection = () => {
  const [curtainOpen, setCurtainOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [curtainType, setCurtainType] = useState<'sliding' | 'roller'>('sliding');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [curtainPosition, setCurtainPosition] = useState(0); // 0-100 percentage
  const [animationRef, setAnimationRef] = useState<number | null>(null);
  const [shouldStop, setShouldStop] = useState(false);
  const [targetPosition, setTargetPosition] = useState(0);

  const animateToPosition = (target) => {
    setShouldStop(false);
    setTargetPosition(target);
    if (animationRef) {
      cancelAnimationFrame(animationRef);
    }
    
    setIsAnimating(true);
    const startPosition = curtainPosition;
    const duration = 6000;
    const startTime = Date.now();
    
    const animate = () => {
      if (shouldStop) {
        setIsAnimating(false);
        setAnimationRef(null);
        setShouldStop(false);
        return;
      }
      
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 0.5 * (1 - Math.cos(Math.PI * progress));
      const currentPos = startPosition + (target - startPosition) * easeProgress;
      
      setCurtainPosition(Math.round(currentPos));
      
      if (progress < 1) {
        const id = requestAnimationFrame(animate);
        setAnimationRef(id);
      } else {
        setCurtainPosition(target);
        setCurtainOpen(target > 50);
        setIsAnimating(false);
        setAnimationRef(null);
      }
    };
    
    const id = requestAnimationFrame(animate);
    setAnimationRef(id);
  };

  const handleSliderChange = (value: number) => {
    // Stop any ongoing animation
    if (animationRef) {
      cancelAnimationFrame(animationRef);
      setAnimationRef(null);
    }
    setIsAnimating(false);
    setCurtainPosition(value);
    setCurtainOpen(value > 50);
  };

  const handlePause = () => {
    setShouldStop(true);
    if (animationRef) {
      cancelAnimationFrame(animationRef);
    }
    setAnimationRef(null);
    setIsAnimating(false);
    setCurtainOpen(curtainPosition > 50);
  };

  return (
    <>
      <style>{`
        .no-transition {
          transition: none !important;
        }
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        }
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        }
        @media (max-width: 1023px) {
          .mobile-preview-fix .w-24 {
            width: 9rem !important;
          }
          .mobile-preview-fix .h-16 {
            height: 6rem !important;
          }
          .mobile-preview-fix .w-16 {
            width: 4.1rem !important;
          }
          .mobile-preview-fix .h-4 {
            height: 1.2rem !important;
            margin-top: 4px;
          }
        }
      `}</style>
      <section className="section-padding bg-background">
      <div className="container-width" style={{paddingBottom: '4rem'}}>
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="lg:text-[2.7rem] xl:text-[3.24rem] font-semibold leading-tight tracking-tight apple-gradient-text mb-6 text-[3.24rem]" style={{lineHeight: 1.09, background: 'linear-gradient(180deg, #1f2937, #374151, #6b7280)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'}}>
            See It in Action — Control With Your Phone
          </h2>
          <p className="text-body-large text-muted-foreground max-w-2xl mx-auto" style={{background: 'linear-gradient(180deg, #1f2937, #374151, #6b7280)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'}}>
            Click the phone buttons to see how the curtains work
          </p>
        </div>

        {/* Mobile-First Layout */}
        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-4 lg:gap-8 items-center max-h-screen lg:max-h-none">
          {/* Window Demo - Top on mobile, Left on desktop */}
          <div className="relative w-full order-1 lg:order-1">
            <div className="aspect-[16/9] lg:aspect-[4/3] overflow-hidden rounded-xl lg:rounded-2xl shadow-2xl" style={{ backgroundImage: `url('/assets/window.jpeg')`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
              <div className="relative w-full h-full">
                {/* Window Frame */}
                <div className="absolute inset-0 border-4 lg:border-8 border-white/20 rounded-2xl" />

                {/* Curtains */}
                <div className="absolute inset-0">
                  {curtainType === 'sliding' ? (
                    <>
                      <div 
                        className="absolute h-full no-transition"
                        style={{
                          top: '0', left: '0', width: '50%',
                          background: `linear-gradient(135deg, #9a7d71 0%, #8a6d61 50%, #7a5d51 100%)`,
                          transform: `translateX(-${curtainPosition}%)`
                        }}
                      >
                        {/* Clean fabric texture */}
                        <div className="absolute inset-0 bg-gradient-to-r from-black/5 via-transparent to-white/10" />
                        {/* Subtle vertical lines for fabric texture */}
                        <div className="absolute inset-0">
                          {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="absolute h-full w-px opacity-20" 
                                 style={{ left: `${(i + 1) * 16.66}%`, background: '#000' }} />
                          ))}
                        </div>
                        {/* Gathered edge when open */}
                        {curtainPosition > 10 && (
                          <div className="absolute right-0 top-0 h-full w-6 bg-gradient-to-l from-black/20 to-transparent" />
                        )}
                      </div>
                      <div 
                        className="absolute h-full no-transition"
                        style={{
                          top: '0', right: '0', width: '50%',
                          background: `linear-gradient(225deg, #9a7d71 0%, #8a6d61 50%, #7a5d51 100%)`,
                          transform: `translateX(${curtainPosition}%)`
                        }}
                      >
                        {/* Clean fabric texture */}
                        <div className="absolute inset-0 bg-gradient-to-l from-black/5 via-transparent to-white/10" />
                        {/* Subtle vertical lines for fabric texture */}
                        <div className="absolute inset-0">
                          {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="absolute h-full w-px opacity-20" 
                                 style={{ right: `${(i + 1) * 16.66}%`, background: '#000' }} />
                          ))}
                        </div>
                        {/* Gathered edge when open */}
                        {curtainPosition > 10 && (
                          <div className="absolute left-0 top-0 h-full w-6 bg-gradient-to-r from-black/20 to-transparent" />
                        )}
                      </div>
                    </>
                  ) : (
                    <div 
                      className="absolute left-0 right-0 overflow-hidden"
                      style={{
                        top: '0',
                        height: `${100 - curtainPosition}%`,
                        background: `linear-gradient(135deg, #9a7d71 0%, #8a6d61 50%, #7a5d51 100%)`
                      }}
                    >
                      {/* Clean fabric texture */}
                      <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-white/10" />
                      {/* Subtle horizontal lines for fabric texture */}
                      <div className="absolute inset-0 overflow-hidden">
                        {Array.from({ length: 8 }).map((_, i) => (
                          <div key={i} className="absolute w-full h-px opacity-20" 
                               style={{ top: `${(i + 1) * 12.5}%`, background: '#000' }} />
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Track */}
                  <div className="absolute top-0 left-0 right-0 h-2 lg:h-3 bg-gradient-to-b from-gray-400 to-gray-600" />
                </div>

                {/* Real-time Status */}
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-black/70 text-white px-3 py-1 rounded-full text-xs lg:text-sm backdrop-blur-sm">
                    {isAnimating ? (targetPosition > curtainPosition ? 'Opening...' : 'Closing...') : `${Math.round(curtainPosition)}%`}
                  </div>
                </div>
              </div>
            </div>

            {/* Status Badge */}
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
              <Badge className={curtainPosition > 50 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                {Math.round(curtainPosition)}% {curtainPosition > 75 ? 'Open' : curtainPosition < 25 ? 'Closed' : 'Partial'}
              </Badge>
            </div>
          </div>

          {/* Control Panel - Bottom on mobile, Right on desktop */}
          <div className="relative w-full order-2 lg:order-2 flex justify-center lg:mt-12">
            <div className="w-full max-w-[220px] lg:w-60 mobile-preview-fix">
              {/* iPhone Mockup */}
              <div className="relative aspect-[9/17] lg:aspect-[9/19.5] bg-black rounded-[2rem] lg:rounded-[2.5rem] p-1 lg:p-1.5 shadow-2xl mx-auto">
                {/* Dynamic Island */}
                <div className="absolute top-1.5 lg:top-2 left-1/2 transform -translate-x-1/2 w-16 lg:w-24 h-4 lg:h-6 bg-black rounded-full z-10" />
                
                {/* Screen */}
                <div className="w-full h-full bg-gradient-to-b from-[#1e293b] to-[#0f172a] rounded-[1.8rem] lg:rounded-[2rem] overflow-hidden relative">
                  {/* Status Bar */}
                  <div className="h-8 lg:h-10 flex items-center justify-between px-3 lg:px-4 text-white text-xs font-medium pt-4 lg:pt-6">
                    <span className="font-mono font-semibold">9:41</span>
                    <div className="flex items-center space-x-1 lg:space-x-2">
                      <div className="flex space-x-0.5 lg:space-x-1">
                        {Array.from({length: 4}).map((_, i) => (
                          <div key={i} className={`w-1 h-1 rounded-full ${i < 3 ? 'bg-white' : 'bg-white/50'}`} />
                        ))}
                      </div>
                      <div className="w-5 lg:w-6 h-2.5 lg:h-3 border border-white/80 rounded-sm">
                        <div className="w-4/5 h-full bg-white rounded-sm" />
                      </div>
                    </div>
                  </div>

                  {/* App Content */}
                  <div className="flex-1 p-2 lg:p-3 flex flex-col">
                    {/* Header */}
                    <div className="text-center mb-3 lg:mb-4">
                      <h3 className="text-base lg:text-lg font-bold text-white mb-1">Smart Curtains</h3>
                      <p className="text-sm text-slate-300">Living Room</p>
                    </div>

                    {/* Mini Preview */}
                    <div className="flex flex-col items-center mb-3 lg:mb-4">
                      <div className="relative w-24 lg:w-36 h-16 lg:h-28 rounded-lg lg:rounded-xl border border-white/20 overflow-hidden mb-2">
                        <div className="absolute inset-1 overflow-hidden">
                          {curtainType === 'sliding' ? (
                            <>
                              <div 
                                className="absolute top-0 h-full w-1/2 no-transition"
                                style={{ 
                                  transform: `translateX(-${curtainPosition}%)`,
                                  background: '#9a7d71'
                                }}
                              >
                                <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-white/10" />
                              </div>
                              <div 
                                className="absolute top-0 right-0 h-full w-1/2 no-transition"
                                style={{ 
                                  transform: `translateX(${curtainPosition}%)`,
                                  background: '#9a7d71'
                                }}
                              >
                                <div className="absolute inset-0 bg-gradient-to-l from-black/10 to-white/10" />
                              </div>
                            </>
                          ) : (
                            <div 
                              className="absolute top-0 left-0 right-0 overflow-hidden"
                              style={{ 
                                height: `${100 - curtainPosition}%`,
                                background: '#9a7d71'
                              }}
                            >
                              <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-white/10" />
                            </div>
                          )}
                          <div className="absolute top-0 left-0 right-0 h-0.5 lg:h-1 bg-gray-500" />
                        </div>
                      </div>
                      
                      {/* Real-time Percentage */}
                      <div className="bg-white/20 backdrop-blur-sm rounded-sm lg:rounded-lg px-1 lg:px-3 py-0.5 lg:py-1.5">
                        <span className="text-white text-xs lg:text-sm font-bold">
                          {curtainPosition}%
                        </span>
                      </div>
                    </div>

                    {/* Type Selector */}
                    <div className="flex bg-white/10 rounded-sm lg:rounded-lg p-0.5 lg:p-1 mb-3 lg:mb-4">
                      <button
                        onClick={() => {
                          if (curtainType !== 'sliding') {
                            setIsTransitioning(true);
                            setCurtainOpen(false);
                            setTimeout(() => {
                              setCurtainType('sliding');
                              setTimeout(() => setIsTransitioning(false), 100);
                            }, 50);
                          }
                        }}
                        className={`flex-1 py-1.5 lg:py-2 px-1.5 lg:px-2 rounded text-xs font-semibold transition-all ${
                          curtainType === 'sliding'
                            ? 'bg-white text-slate-900 shadow-lg'
                            : 'text-white/80 hover:text-white'
                        }`}
                      >
                        Sliding
                      </button>
                      <button
                        onClick={() => {
                          if (curtainType !== 'roller') {
                            setIsTransitioning(true);
                            setCurtainOpen(false);
                            setTimeout(() => {
                              setCurtainType('roller');
                              setTimeout(() => setIsTransitioning(false), 100);
                            }, 50);
                          }
                        }}
                        className={`flex-1 py-1.5 lg:py-2 px-1.5 lg:px-2 rounded text-xs font-semibold transition-all ${
                          curtainType === 'roller'
                            ? 'bg-white text-slate-900 shadow-lg'
                            : 'text-white/80 hover:text-white'
                        }`}
                      >
                        Roller
                      </button>
                    </div>



                    {/* Control Buttons - ALWAYS SHOW PAUSE */}
                    <div className="flex justify-center gap-3 lg:gap-4 mb-2">
                      <div className="flex flex-col items-center">
                        <button
                          onClick={() => animateToPosition(0)}
                          className="relative w-8 h-8 lg:w-14 lg:h-14 bg-gradient-to-br from-slate-600 to-slate-800 hover:from-slate-700 hover:to-slate-900 rounded-lg lg:rounded-lg flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 border border-slate-500/30 mb-1"
                        >
                          {curtainType === 'sliding' ? (
                            <span className="text-white text-xs lg:text-sm font-bold">⫸⫷</span>
                          ) : (
                            <ArrowDown className="w-3 lg:w-5 h-3 lg:h-5 text-white" />
                          )}
                        </button>
                        <span className="text-xs text-slate-300 font-medium">Close</span>
                      </div>
                      
                      <div className="flex flex-col items-center">
                        <button
                          onClick={handlePause}
                          className="relative w-8 h-8 lg:w-14 lg:h-14 bg-gradient-to-br from-slate-500 to-slate-700 hover:from-slate-600 hover:to-slate-800 rounded-lg lg:rounded-lg flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 border border-slate-400/30 mb-1"
                        >
                          <Pause className="w-3 lg:w-5 h-3 lg:h-5 text-white fill-current" />
                        </button>
                        <span className="text-xs text-slate-300 font-medium">Pause</span>
                      </div>
                      
                      <div className="flex flex-col items-center">
                        <button
                          onClick={() => animateToPosition(90)}
                          className="relative w-8 h-8 lg:w-14 lg:h-14 bg-gradient-to-br from-slate-600 to-slate-800 hover:from-slate-700 hover:to-slate-900 rounded-lg lg:rounded-lg flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 border border-slate-500/30 mb-1"
                        >
                          {curtainType === 'sliding' ? (
                            <span className="text-white text-xs lg:text-sm font-bold">⫷⫸</span>
                          ) : (
                            <ArrowUp className="w-3 lg:w-5 h-3 lg:h-5 text-white" />
                          )}
                        </button>
                        <span className="text-xs text-slate-300 font-medium">Open</span>
                      </div>
                    </div>
                  </div>

                  {/* Home Indicator */}
                  <div className="absolute bottom-0.5 lg:bottom-1 left-1/2 transform -translate-x-1/2 w-8 lg:w-24 h-0.5 lg:h-1 bg-white/80 rounded-full" />
                </div>
              </div>

              {/* Interaction Hint - Only on desktop */}
              <div className="hidden lg:block text-center mt-6">
                <p className="text-sm text-muted-foreground">
                  👆 Click the buttons to test
                </p>
              </div>
            </div>
          </div>
        </div>


      </div>
      </section>
    </>
  );
};

export default InteractiveDemoSection;