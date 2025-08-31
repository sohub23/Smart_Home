import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, ChevronLeft, ChevronRight, Square, RotateCcw, Settings } from 'lucide-react';
import natureViewImage from '@/assets/nature-view.jpg';
import iphoneMockupImage from '@/assets/iphone-mockup.jpg';
import windowImage from '@/assets/window.jpeg';

// Realistic indoor background with window image
const realisticRoomBackground = `
  background-image: url(${windowImage});
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
`;

const InteractiveDemoSection = () => {
  const [curtainOpen, setCurtainOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [curtainType, setCurtainType] = useState<'sliding' | 'roller'>('sliding');
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleCurtainToggle = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setCurtainOpen(!curtainOpen);
    
    // Reset animation state after animation completes
    setTimeout(() => {
      setIsAnimating(false);
    }, curtainType === 'roller' ? 8000 : 6000);
  };

  return (
    <>
      <style>{`
        @keyframes shimmer {
          0%, 100% { transform: translateX(-100%); opacity: 0; }
          50% { transform: translateX(100%); opacity: 1; }
        }
        .roller-curtain-slow {
          transition: all 8s ease-in-out;
        }
        .roller-curtain-mobile-slow {
          transition: all 8s ease-in-out;
        }
        .sliding-curtain-slow {
          transition: all 6s ease-in-out;
        }
        .sliding-curtain-mobile-slow {
          transition: all 6s ease-in-out;
        }
        .no-transition {
          transition: none !important;
        }
      `}</style>
      <section className="section-padding bg-background">
      <div className="container-width">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-headline text-primary mb-4">
            See It in Action — Control With Your Phone
          </h2>
          <p className="text-body-large text-muted-foreground max-w-2xl mx-auto">
            Experience the smooth, silent operation of Curtain Luxe. Click the app controls to see your curtains respond instantly.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: 3D Window Demo */}
          <div className="relative">
            <div className="aspect-[4/3] overflow-hidden border border-border" style={{ backgroundImage: `url(${windowImage})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>
              {/* Window Frame */}
              <div className="relative w-full h-full bg-transparent">
                {/* Window Frame Border */}
                <div className="absolute inset-0 border-8 border-gray-400/30 bg-transparent">
                </div>

                {/* Curtain Overlay */}
                <div className="absolute inset-0 pointer-events-none">
                  {curtainType === 'sliding' ? (
                    <>
                      {/* Left Curtain Panel */}
                      <div 
                        className={`absolute h-full ${isTransitioning ? 'no-transition' : 'sliding-curtain-slow'}`}
                        style={{
                          top: '0',
                          left: '0',
                          width: '50%',
                          background: '#ada69c',
                          transform: curtainOpen ? 'translateX(-100%)' : 'translateX(0%)'
                        }}
                      >
                        {/* Vertical Stripe Fabric Texture */}
                        <div className="absolute inset-0">
                          {/* Vertical stripes */}
                          {Array.from({ length: 20 }).map((_, i) => (
                            <div
                              key={i}
                              className="absolute h-full"
                              style={{ 
                                left: `${i * 5}%`,
                                width: '2px',
                                background: i % 2 === 0 ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)',
                                opacity: 0.8
                              }}
                            />
                          ))}
                          {/* Fabric weave pattern */}
                          <div 
                            className="absolute inset-0"
                            style={{
                              background: `repeating-linear-gradient(
                                90deg,
                                transparent 0px,
                                rgba(0,0,0,0.05) 1px,
                                transparent 2px,
                                transparent 8px
                              )`
                            }}
                          />
                        </div>
                      </div>

                      {/* Right Curtain Panel */}
                      <div 
                        className={`absolute h-full ${isTransitioning ? 'no-transition' : 'sliding-curtain-slow'}`}
                        style={{
                          top: '0',
                          right: '0',
                          width: '50%',
                          background: '#ada69c',
                          transform: curtainOpen ? 'translateX(100%)' : 'translateX(0%)'
                        }}
                      >
                        {/* Vertical Stripe Fabric Texture */}
                        <div className="absolute inset-0">
                          {/* Vertical stripes */}
                          {Array.from({ length: 20 }).map((_, i) => (
                            <div
                              key={i}
                              className="absolute h-full"
                              style={{ 
                                left: `${i * 5}%`,
                                width: '2px',
                                background: i % 2 === 0 ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)',
                                opacity: 0.8
                              }}
                            />
                          ))}
                          {/* Fabric weave pattern */}
                          <div 
                            className="absolute inset-0"
                            style={{
                              background: `repeating-linear-gradient(
                                90deg,
                                transparent 0px,
                                rgba(0,0,0,0.05) 1px,
                                transparent 2px,
                                transparent 8px
                              )`
                            }}
                          />
                        </div>
                      </div>

                      {/* Curtain Track */}
                      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-gray-600 via-gray-500 to-gray-600">
                        <div className="absolute inset-0 bg-gradient-to-b from-gray-400 to-gray-700" />
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Roller Curtain */}
                      <div 
                        className={`absolute left-0 right-0 roller-curtain-slow ${
                          curtainOpen ? 'h-6' : 'h-full'
                        }`}
                        style={{
                          top: '0',
                          background: '#ada69c'
                        }}
                      >
                        {/* Honeycomb Cellular Fabric Texture */}
                        <div className="absolute inset-0">
                          {/* Honeycomb pattern */}
                          <div 
                            className="absolute inset-0"
                            style={{
                              background: `
                                radial-gradient(circle at 25% 25%, rgba(0,0,0,0.1) 2px, transparent 2px),
                                radial-gradient(circle at 75% 75%, rgba(255,255,255,0.1) 2px, transparent 2px),
                                linear-gradient(45deg, transparent 40%, rgba(0,0,0,0.05) 50%, transparent 60%)
                              `,
                              backgroundSize: '20px 20px, 20px 20px, 40px 40px'
                            }}
                          />
                          {/* Cellular structure lines */}
                          {Array.from({ length: 15 }).map((_, i) => (
                            <div
                              key={i}
                              className="absolute w-full"
                              style={{ 
                                top: `${i * 6.67}%`,
                                height: '1px',
                                background: 'rgba(0,0,0,0.08)',
                                opacity: 0.6
                              }}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Roller Track/Tube */}
                      <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-r from-gray-600 via-gray-500 to-gray-600">
                        <div className="absolute inset-0 bg-gradient-to-b from-gray-400 to-gray-700" />
                      </div>
                    </>
                  )}
                </div>

                {/* Animation Indicator */}
                {isAnimating && (
                  <div className="absolute top-6 left-1/2 transform -translate-x-1/2">
                    <div className="flex items-center space-x-2 bg-black/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
                      <div className="w-2 h-2 bg-accent-soft rounded-full animate-pulse" />
                      <span>{curtainOpen ? 'Opening...' : 'Closing...'}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Status Badge */}
            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
              <Badge 
                variant={curtainOpen ? "default" : "secondary"}
                className={`${
                  curtainOpen 
                    ? 'bg-green-100 text-green-800 border-green-200' 
                    : 'bg-gray-100 text-gray-800 border-gray-200'
                }`}
              >
                {curtainOpen ? 'Open' : 'Closed'}
              </Badge>
            </div>
          </div>

          {/* Right: iPhone 16 Pro Max Mockup */}
          <div className="relative">
            <div className="w-72 mx-auto">
              <div className="relative aspect-[9/19.5] rounded-[3rem] border-4 border-black bg-black shadow-2xl">
                {/* Dynamic Island */}
                <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-32 h-8 bg-black rounded-full z-10" />
                
                {/* iPhone Screen */}
                <div className="w-full h-full bg-gradient-to-b from-[#0A1D3A] via-[#0C2347] to-[#0F2E5D] rounded-[2.5rem] overflow-hidden relative">
                  {/* Subtle lighting effects */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400/5 via-transparent to-transparent rounded-[2.5rem]" />
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-16 bg-blue-300/10 blur-2xl rounded-full" />
                  
                  {/* Status Bar */}
                  <div className="h-12 flex items-center justify-between px-6 text-white text-sm font-medium relative z-10 mt-8">
                    <span className="font-mono font-semibold">9:41</span>
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-1 h-1 bg-white rounded-full" />
                        <div className="w-1 h-1 bg-white rounded-full" />
                        <div className="w-1 h-1 bg-white rounded-full" />
                        <div className="w-1 h-1 bg-white/50 rounded-full" />
                      </div>
                      <div className="w-6 h-3 border border-white/80 rounded-sm">
                        <div className="w-4/5 h-full bg-white rounded-sm" />
                      </div>
                    </div>
                  </div>

                  {/* App Interface */}
                  <div className="flex-1 p-4 flex flex-col relative z-10" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                    {/* App Header */}
                    <div className="text-center mb-4">
                      <h3 className="text-xl font-bold text-white mb-1 tracking-tight">
                        Smart Curtains
                      </h3>
                      <p className="text-sm text-blue-100/80 font-medium">Living Room</p>
                    </div>

                    {/* Curtain Visual */}
                    <div className="flex flex-col items-center justify-center mb-4">
                      <div className="relative w-48 h-40 rounded-2xl border border-white/20 shadow-2xl">
                        {/* Frame effect */}
                        <div className="absolute inset-1 bg-transparent overflow-hidden">
                          {/* Realistic curtain animation */}
                          {curtainType === 'sliding' ? (
                            <>
                              {/* Left curtain panel */}
                              <div 
                                className={`absolute top-0 ${isTransitioning ? 'no-transition' : 'sliding-curtain-mobile-slow'}`}
                                style={{
                                  left: '0',
                                  width: '50%',
                                  height: '100%',
                                  background: '#ada69c',
                                  transform: curtainOpen ? 'translateX(-98%)' : 'translateX(0%)'
                                }}
                              >
                              </div>
                              
                              {/* Right curtain panel */}
                              <div 
                                className={`absolute top-0 ${isTransitioning ? 'no-transition' : 'sliding-curtain-mobile-slow'}`}
                                style={{
                                  left: '50%',
                                  width: '50%',
                                  height: '100%',
                                  background: '#ada69c',
                                  transform: curtainOpen ? 'translateX(100%)' : 'translateX(0%)'
                                }}
                              >
                              </div>
                            </>
                          ) : (
                            /* Roller curtain */
                            <div 
                              className={`absolute top-0 left-0 right-0 roller-curtain-mobile-slow`}
                              style={{
                                height: curtainOpen ? '4px' : '100%',
                                background: '#ada69c'
                              }}
                            >
                            </div>
                          )}
                          
                          {/* Curtain track */}
                          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gray-600 via-gray-500 to-gray-600 shadow-md" />
                        </div>
                      </div>
                      
                      {/* Enhanced Percentage Indicator */}
                      <div className="mt-3">
                        <div className="bg-gradient-to-r from-white/25 to-white/15 backdrop-blur-lg rounded-xl px-4 py-2 border border-white/30 shadow-xl">
                          <span className="text-white text-lg font-bold tracking-wide">
                            {curtainOpen ? '100%' : '0%'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Curtain Type Selector */}
                    <div className="flex bg-white/10 rounded-xl p-1.5 mb-4 backdrop-blur-sm border border-white/20">
                      <button
                        onClick={() => {
                          if (curtainType !== 'sliding') {
                            setIsTransitioning(true);
                            setIsAnimating(false);
                            setCurtainOpen(false);
                            setTimeout(() => {
                              setCurtainType('sliding');
                              setTimeout(() => setIsTransitioning(false), 100);
                            }, 50);
                          }
                        }}
                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all duration-300 ${
                          curtainType === 'sliding'
                            ? 'bg-white text-blue-900 shadow-lg transform scale-105'
                            : 'text-white/80 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        Sliding
                      </button>
                      <button
                        onClick={() => {
                          if (curtainType !== 'roller') {
                            setIsTransitioning(true);
                            setIsAnimating(false);
                            setCurtainOpen(false);
                            setTimeout(() => {
                              setCurtainType('roller');
                              setTimeout(() => setIsTransitioning(false), 100);
                            }, 50);
                          }
                        }}
                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all duration-300 ${
                          curtainType === 'roller'
                            ? 'bg-white text-blue-900 shadow-lg transform scale-105'
                            : 'text-white/80 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        Roller
                      </button>
                    </div>

                    {/* Control Buttons */}
                    <div className="flex justify-center gap-8 mb-2">
                      <button
                        onClick={() => !isAnimating && !curtainOpen && handleCurtainToggle()}
                        disabled={isAnimating || curtainOpen}
                        className="w-16 h-16 bg-gradient-to-br from-white/25 to-white/15 backdrop-blur-md rounded-full flex items-center justify-center shadow-xl border border-white/30 transition-all duration-300 hover:shadow-2xl hover:scale-110 hover:from-blue-200/30 hover:to-blue-300/20 disabled:opacity-50 disabled:hover:scale-100"
                      >
                        {curtainType === 'sliding' ? (
                          <div className="flex items-center space-x-0.5">
                            <ChevronLeft className="w-4 h-4 text-white drop-shadow-lg" />
                            <ChevronRight className="w-4 h-4 text-white drop-shadow-lg" />
                          </div>
                        ) : (
                          <div className="flex flex-col items-center space-y-0.5">
                            <div className="w-5 h-0.5 bg-white rounded drop-shadow-lg" />
                            <ChevronRight className="w-4 h-4 text-white drop-shadow-lg rotate-90" />
                          </div>
                        )}
                      </button>
                      
                      <button
                        onClick={() => !isAnimating && curtainOpen && handleCurtainToggle()}
                        disabled={isAnimating || !curtainOpen}
                        className="w-16 h-16 bg-gradient-to-br from-white/25 to-white/15 backdrop-blur-md rounded-full flex items-center justify-center shadow-xl border border-white/30 transition-all duration-300 hover:shadow-2xl hover:scale-110 hover:from-blue-200/30 hover:to-blue-300/20 disabled:opacity-50 disabled:hover:scale-100"
                      >
                        {curtainType === 'sliding' ? (
                          <div className="flex items-center space-x-0.5">
                            <ChevronRight className="w-4 h-4 text-white drop-shadow-lg" />
                            <ChevronLeft className="w-4 h-4 text-white drop-shadow-lg" />
                          </div>
                        ) : (
                          <div className="flex flex-col items-center space-y-0.5">
                            <ChevronRight className="w-4 h-4 text-white drop-shadow-lg -rotate-90" />
                            <div className="w-5 h-0.5 bg-white rounded drop-shadow-lg" />
                          </div>
                        )}
                      </button>
                    </div>
                    
                    {/* Button Labels */}
                    <div className="flex justify-center gap-8">
                      <span className="text-sm text-white/90 text-center font-medium tracking-wide">Open</span>
                      <span className="text-sm text-white/90 text-center font-medium tracking-wide">Close</span>
                    </div>
                  </div>
                </div>

                {/* Home Indicator */}
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1.5 bg-white/80 rounded-full" />
              </div>
            </div>

            {/* Interaction Hint */}
            <div className="text-center mt-6">
              <p className="text-sm text-muted-foreground">
                👆 Tap the app controls to see the magic
              </p>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <Button 
            onClick={() => document.getElementById('order')?.scrollIntoView({ behavior: 'smooth' })}
            className="btn-cta"
          >
            Experience This Control
          </Button>
        </div>
      </div>
      </section>
    </>
  );
};

export default InteractiveDemoSection;