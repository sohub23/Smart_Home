import { useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { BackgroundBeamsWithCollision } from '@/components/ui/background-beams-with-collision';

const BuiltForComfort = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <main className="pt-16">
        {/* Hero Section */}
        <section className="py-12 md:py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 md:px-6 text-center">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 md:mb-6 tracking-tight leading-none" style={{background: 'linear-gradient(180deg, #1f2937, #374151, #6b7280)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'}}>
              #BuiltForComfort
            </h1>
            <p className="text-lg md:text-2xl lg:text-3xl font-light leading-relaxed" style={{background: 'linear-gradient(180deg, #1f2937, #374151, #6b7280)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'}}>
              Redefining smart living with precision engineering and effortless elegance.
            </p>
          </div>
        </section>

        {/* Philosophy Section */}
        <section className="py-12 md:py-16 bg-gray-50">
          <div className="max-w-5xl mx-auto px-4 md:px-6">
            <div className="text-center mb-8 md:mb-12">
              <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4" style={{background: 'linear-gradient(180deg, #1f2937, #374151, #6b7280)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'}}>Our Philosophy</h2>
              <p className="text-base md:text-xl max-w-3xl mx-auto leading-relaxed" style={{background: 'linear-gradient(180deg, #1f2937, #374151, #6b7280)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'}}>
                True comfort isn't just about convenience. It's about creating spaces that adapt to your life, 
                seamlessly and beautifully, every single day.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 md:gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <div className="w-6 h-6 bg-white rounded-full"></div>
                </div>
                <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3" style={{background: 'linear-gradient(180deg, #1f2937, #374151, #6b7280)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'}}>Precision</h3>
                <p className="text-sm md:text-base leading-relaxed" style={{background: 'linear-gradient(180deg, #1f2937, #374151, #6b7280)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'}}>
                  Every component engineered to perfection. No compromises on quality or performance.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <div className="w-6 h-6 bg-white rounded-full"></div>
                </div>
                <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3" style={{background: 'linear-gradient(180deg, #1f2937, #374151, #6b7280)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'}}>Simplicity</h3>
                <p className="text-sm md:text-base leading-relaxed" style={{background: 'linear-gradient(180deg, #1f2937, #374151, #6b7280)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'}}>
                  Complex technology made beautifully simple. Control your environment with a touch.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <div className="w-6 h-6 bg-white rounded-full"></div>
                </div>
                <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3" style={{background: 'linear-gradient(180deg, #1f2937, #374151, #6b7280)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'}}>Excellence</h3>
                <p className="text-sm md:text-base leading-relaxed" style={{background: 'linear-gradient(180deg, #1f2937, #374151, #6b7280)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'}}>
                  Uncompromising standards in materials, craftsmanship, and customer experience.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-12 md:py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4 md:px-6">
            <div className="text-center mb-8 md:mb-12">
              <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4" style={{background: 'linear-gradient(180deg, #1f2937, #374151, #6b7280)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'}}>Built Different</h2>
              <p className="text-base md:text-xl max-w-3xl mx-auto" style={{background: 'linear-gradient(180deg, #1f2937, #374151, #6b7280)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'}}>
                Premium materials. Precision engineering. Professional installation. 
                This is what sets Curtain Luxe apart.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 md:gap-10">
              <div className="space-y-6 md:space-y-8">
                <div>
                  <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3" style={{background: 'linear-gradient(180deg, #1f2937, #374151, #6b7280)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'}}>Premium Components</h3>
                  <p className="text-sm md:text-base leading-relaxed" style={{background: 'linear-gradient(180deg, #1f2937, #374151, #6b7280)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'}}>
                    Military-grade motors and aerospace-quality materials ensure decades of silent, 
                    smooth operation.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3" style={{background: 'linear-gradient(180deg, #1f2937, #374151, #6b7280)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'}}>Smart Integration</h3>
                  <p className="text-sm md:text-base leading-relaxed" style={{background: 'linear-gradient(180deg, #1f2937, #374151, #6b7280)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'}}>
                    Seamlessly connects with your smart home ecosystem. Voice control, 
                    scheduling, and remote access included.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3" style={{background: 'linear-gradient(180deg, #1f2937, #374151, #6b7280)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'}}>Professional Installation</h3>
                  <p className="text-sm md:text-base leading-relaxed" style={{background: 'linear-gradient(180deg, #1f2937, #374151, #6b7280)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'}}>
                    Our certified technicians ensure perfect alignment and optimal performance 
                    from day one.
                  </p>
                </div>
              </div>
              
              <div className="space-y-6 md:space-y-8">
                <div>
                  <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3" style={{background: 'linear-gradient(180deg, #1f2937, #374151, #6b7280)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'}}>Whisper Quiet</h3>
                  <p className="text-sm md:text-base leading-relaxed" style={{background: 'linear-gradient(180deg, #1f2937, #374151, #6b7280)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'}}>
                    Advanced noise dampening technology ensures operation so quiet, 
                    you'll barely notice it's working.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3" style={{background: 'linear-gradient(180deg, #1f2937, #374151, #6b7280)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'}}>Fail-Safe Design</h3>
                  <p className="text-sm md:text-base leading-relaxed" style={{background: 'linear-gradient(180deg, #1f2937, #374151, #6b7280)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'}}>
                    Manual override and battery backup ensure your curtains work 
                    even during power outages.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3" style={{background: 'linear-gradient(180deg, #1f2937, #374151, #6b7280)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'}}>Lifetime Support</h3>
                  <p className="text-sm md:text-base leading-relaxed" style={{background: 'linear-gradient(180deg, #1f2937, #374151, #6b7280)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'}}>
                    Dedicated customer success team and comprehensive warranty 
                    for complete peace of mind.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Experience Section */}
        <section className="py-12 md:py-16 bg-black text-white">
          <div className="max-w-4xl mx-auto px-4 md:px-6 text-center">
            <h2 className="text-2xl md:text-4xl font-bold mb-3 md:mb-6">The Experience</h2>
            <p className="text-sm md:text-lg text-gray-300 mb-6 md:mb-10 leading-relaxed">
              Wake up to natural light. Come home to the perfect ambiance. 
              Live in spaces that understand you.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 text-left">
              <div className="bg-gray-900/80 backdrop-blur-sm rounded-lg md:rounded-xl p-4 md:p-6">
                <h3 className="text-sm md:text-lg font-bold mb-2 md:mb-3">Morning Routine</h3>
                <p className="text-xs md:text-sm text-gray-400 leading-relaxed">
                  Curtains open gently with the sunrise, creating the perfect wake-up experience.
                </p>
              </div>
              
              <div className="bg-gray-900/80 backdrop-blur-sm rounded-lg md:rounded-xl p-4 md:p-6">
                <h3 className="text-sm md:text-lg font-bold mb-2 md:mb-3">Away Mode</h3>
                <p className="text-xs md:text-sm text-gray-400 leading-relaxed">
                  Simulate presence while you're away with intelligent scheduling patterns.
                </p>
              </div>
              
              <div className="bg-gray-900/80 backdrop-blur-sm rounded-lg md:rounded-xl p-4 md:p-6">
                <h3 className="text-sm md:text-lg font-bold mb-2 md:mb-3">Evening Comfort</h3>
                <p className="text-xs md:text-sm text-gray-400 leading-relaxed">
                  Automatic closure at sunset creates intimate, cozy spaces for relaxation.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 md:py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 md:px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 md:mb-6" style={{background: 'linear-gradient(180deg, #1f2937, #374151, #6b7280)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'}}>Ready to Transform Your Space?</h2>
            <p className="text-base md:text-lg mb-6 md:mb-8 leading-relaxed" style={{background: 'linear-gradient(180deg, #1f2937, #374151, #6b7280)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'}}>
              Experience the future of home automation with Curtain Luxe.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button className="w-full sm:w-auto bg-gradient-to-r from-gray-700 to-gray-900 text-white hover:from-gray-800 hover:to-black px-6 md:px-8 py-2 md:py-3 text-sm md:text-base font-medium rounded-lg transition-all duration-300">
                Schedule Consultation
              </Button>
              <Button variant="outline" className="w-full sm:w-auto border-2 border-gray-700 text-gray-700 hover:bg-gray-700 hover:text-white px-6 md:px-8 py-2 md:py-3 text-sm md:text-base font-medium rounded-lg transition-all duration-300">
                View Gallery
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default BuiltForComfort;