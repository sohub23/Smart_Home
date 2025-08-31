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
        <section className="py-16 md:py-32 bg-white">
          <div className="max-w-4xl mx-auto px-4 md:px-6 text-center">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-black mb-6 md:mb-8 tracking-tight leading-none">
              #BuiltForComfort
            </h1>
            <p className="text-lg md:text-2xl lg:text-3xl text-gray-600 font-light leading-relaxed">
              Redefining smart living with precision engineering and effortless elegance.
            </p>
          </div>
        </section>

        {/* Philosophy Section */}
        <section className="py-16 md:py-24 bg-gray-50">
          <div className="max-w-5xl mx-auto px-4 md:px-6">
            <div className="text-center mb-12 md:mb-20">
              <h2 className="text-3xl md:text-5xl font-bold text-black mb-4 md:mb-6">Our Philosophy</h2>
              <p className="text-base md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                True comfort isn't just about convenience. It's about creating spaces that adapt to your life, 
                seamlessly and beautifully, every single day.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 md:gap-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-black rounded-full mx-auto mb-6 flex items-center justify-center">
                  <div className="w-8 h-8 bg-white rounded-full"></div>
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-black mb-3 md:mb-4">Precision</h3>
                <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                  Every component engineered to perfection. No compromises on quality or performance.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-black rounded-full mx-auto mb-6 flex items-center justify-center">
                  <div className="w-8 h-8 bg-white rounded-full"></div>
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-black mb-3 md:mb-4">Simplicity</h3>
                <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                  Complex technology made beautifully simple. Control your environment with a touch.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-black rounded-full mx-auto mb-6 flex items-center justify-center">
                  <div className="w-8 h-8 bg-white rounded-full"></div>
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-black mb-3 md:mb-4">Excellence</h3>
                <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                  Uncompromising standards in materials, craftsmanship, and customer experience.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-16 md:py-24 bg-white">
          <div className="max-w-6xl mx-auto px-4 md:px-6">
            <div className="text-center mb-12 md:mb-20">
              <h2 className="text-3xl md:text-5xl font-bold text-black mb-4 md:mb-6">Built Different</h2>
              <p className="text-base md:text-xl text-gray-600 max-w-3xl mx-auto">
                Premium materials. Precision engineering. Professional installation. 
                This is what sets Curtain Luxe apart.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 md:gap-16">
              <div className="space-y-8 md:space-y-12">
                <div>
                  <h3 className="text-xl md:text-2xl font-bold text-black mb-3 md:mb-4">Premium Components</h3>
                  <p className="text-sm md:text-lg text-gray-600 leading-relaxed">
                    Military-grade motors and aerospace-quality materials ensure decades of silent, 
                    smooth operation.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-xl md:text-2xl font-bold text-black mb-3 md:mb-4">Smart Integration</h3>
                  <p className="text-sm md:text-lg text-gray-600 leading-relaxed">
                    Seamlessly connects with your smart home ecosystem. Voice control, 
                    scheduling, and remote access included.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-xl md:text-2xl font-bold text-black mb-3 md:mb-4">Professional Installation</h3>
                  <p className="text-sm md:text-lg text-gray-600 leading-relaxed">
                    Our certified technicians ensure perfect alignment and optimal performance 
                    from day one.
                  </p>
                </div>
              </div>
              
              <div className="space-y-8 md:space-y-12">
                <div>
                  <h3 className="text-xl md:text-2xl font-bold text-black mb-3 md:mb-4">Whisper Quiet</h3>
                  <p className="text-sm md:text-lg text-gray-600 leading-relaxed">
                    Advanced noise dampening technology ensures operation so quiet, 
                    you'll barely notice it's working.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-xl md:text-2xl font-bold text-black mb-3 md:mb-4">Fail-Safe Design</h3>
                  <p className="text-sm md:text-lg text-gray-600 leading-relaxed">
                    Manual override and battery backup ensure your curtains work 
                    even during power outages.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-xl md:text-2xl font-bold text-black mb-3 md:mb-4">Lifetime Support</h3>
                  <p className="text-sm md:text-lg text-gray-600 leading-relaxed">
                    Dedicated customer success team and comprehensive warranty 
                    for complete peace of mind.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Experience Section */}
        <section className="py-16 md:py-24 bg-black text-white">
          <div className="max-w-4xl mx-auto px-4 md:px-6 text-center">
            <h2 className="text-2xl md:text-5xl font-bold mb-4 md:mb-8">The Experience</h2>
            <p className="text-sm md:text-xl text-gray-300 mb-8 md:mb-16 leading-relaxed">
              Wake up to natural light. Come home to the perfect ambiance. 
              Live in spaces that understand you.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 text-left">
              <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl md:rounded-2xl p-4 md:p-8">
                <h3 className="text-base md:text-xl font-bold mb-2 md:mb-4">Morning Routine</h3>
                <p className="text-xs md:text-base text-gray-400 leading-relaxed">
                  Curtains open gently with the sunrise, creating the perfect wake-up experience.
                </p>
              </div>
              
              <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl md:rounded-2xl p-4 md:p-8">
                <h3 className="text-base md:text-xl font-bold mb-2 md:mb-4">Away Mode</h3>
                <p className="text-xs md:text-base text-gray-400 leading-relaxed">
                  Simulate presence while you're away with intelligent scheduling patterns.
                </p>
              </div>
              
              <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl md:rounded-2xl p-4 md:p-8">
                <h3 className="text-base md:text-xl font-bold mb-2 md:mb-4">Evening Comfort</h3>
                <p className="text-xs md:text-base text-gray-400 leading-relaxed">
                  Automatic closure at sunset creates intimate, cozy spaces for relaxation.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-32 bg-white">
          <div className="max-w-4xl mx-auto px-4 md:px-6 text-center">
            <h2 className="text-3xl md:text-5xl font-bold text-black mb-6 md:mb-8">Ready to Transform Your Space?</h2>
            <p className="text-base md:text-xl text-gray-600 mb-8 md:mb-12 leading-relaxed">
              Experience the future of home automation with Curtain Luxe.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center items-center">
              <Button className="w-full sm:w-auto bg-black text-white hover:bg-gray-800 px-8 md:px-12 py-3 md:py-4 text-base md:text-lg font-medium rounded-full transition-all duration-300">
                Schedule Consultation
              </Button>
              <Button variant="outline" className="w-full sm:w-auto border-2 border-black text-black hover:bg-black hover:text-white px-8 md:px-12 py-3 md:py-4 text-base md:text-lg font-medium rounded-full transition-all duration-300">
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