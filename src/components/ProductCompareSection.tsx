import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';


const products = [
  {
    name: 'Smart Sliding Curtain Motor',
    youtubeId: 'APm2EDVBljw',
    thumbnail: '/assets/default_images/slider_thumbnail.png',
    description: 'Traditional elegance meets smart technology',
    features: [
      'Traditional curtain appearance',
      'Up to 4.5m width coverage',
      'Whisper-quiet operation',
      'Flexible fabric options'
    ],
    specs: {
      'Max Size': '4.5m × 3.5m',
      'Noise Level': '< 35 dB',
      'Motor': '2.5 Nm, 15 rpm',
      'Best For': 'Living rooms, bedrooms'
    }
  },
  {
    name: 'Smart Roller Curtain Motor',
    youtubeId: 'K0MZDn2Tw_4',
    thumbnail: '/assets/default_images/roller_thumbnail.png',
    description: 'Minimal design with maximum control',
    features: [
      'Modern minimal aesthetic',
      'Compact installation',
      'Virtually silent operation',
      'Precision positioning'
    ],
    specs: {
      'Max Size': '3.5m × 3.0m',
      'Noise Level': '< 30 dB',
      'Motor': '1.8 Nm, 18 rpm',
      'Best For': 'Offices, modern homes'
    }
  }
];

const ProductCompareSection = () => {
  const [videoLoaded, setVideoLoaded] = useState<{[key: string]: boolean}>({});
  
  // Preload videos after component mounts
  useState(() => {
    const timer = setTimeout(() => {
      products.forEach(product => {
        if (!videoLoaded[product.youtubeId]) {
          // Trigger video loading
        }
      });
    }, 1000);
    return () => clearTimeout(timer);
  });
  return (
    <section id="compare" className="section-padding bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="lg:text-[2.7rem] xl:text-[3.24rem] font-semibold leading-tight tracking-tight apple-gradient-text mb-6 text-[3.24rem]" style={{lineHeight: 1.09, background: 'linear-gradient(180deg, #1f2937, #374151, #6b7280)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'}}>
            Choose Your Smart Style
          </h2>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto font-light px-4" style={{background: 'linear-gradient(180deg, #1f2937, #374151, #6b7280)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'}}>
            Both smart curtains deliver seamless smart control
          </p>
        </div>

        {/* Product Comparison */}
        <div className="grid lg:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto">
          {products.map((product, index) => (
            <div key={index} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-500">
              {/* Product Video */}
              <div className="h-[400px] overflow-hidden relative">
                {/* Default image - always visible as background */}
                <img
                  src={product.thumbnail}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                
                {/* YouTube video overlay - only show when loaded */}
                {videoLoaded[product.youtubeId] && (
                  <iframe
                    src={`https://www.youtube.com/embed/${product.youtubeId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${product.youtubeId}&enablejsapi=1&origin=${window.location.origin}`}
                    className="absolute inset-0 w-full h-full transition-opacity duration-1000 opacity-100 hover:scale-105 transition-all duration-500"
                    style={{ 
                      border: 'none',
                      width: '150%',
                      height: '150%',
                      left: '50%',
                      top: '50%',
                      transform: 'translate(-50%, -50%)'
                    }}
                    allow="autoplay; encrypted-media; fullscreen"
                    allowFullScreen
                    title={product.name}
                  />
                )}
                
                {/* Video loading trigger - invisible but loads video */}
                {!videoLoaded[product.youtubeId] && (
                  <iframe
                    src={`https://www.youtube.com/embed/${product.youtubeId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${product.youtubeId}&enablejsapi=1&origin=${window.location.origin}`}
                    className="absolute inset-0 w-full h-full opacity-0 pointer-events-none"
                    style={{ 
                      border: 'none',
                      width: '150%',
                      height: '150%',
                      left: '50%',
                      top: '50%',
                      transform: 'translate(-50%, -50%)'
                    }}
                    allow="autoplay; encrypted-media; fullscreen"
                    allowFullScreen
                    title={product.name}
                    onLoad={() => {
                      setTimeout(() => {
                        setVideoLoaded(prev => ({ ...prev, [product.youtubeId]: true }));
                      }, 2000);
                    }}
                    onError={() => {
                      setVideoLoaded(prev => ({ ...prev, [product.youtubeId]: false }));
                    }}
                  />
                )}
              </div>
              
              {/* Product Content */}
              <div className="p-4 md:p-6">
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
                  {product.name}
                </h3>
                
                <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6 font-light">
                  {product.description}
                </p>

                {/* Features */}
                <div className="space-y-2 md:space-y-3 mb-4 md:mb-6">
                  {product.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center space-x-3">
                      <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <Check className="w-4 h-4 text-green-600" />
                      </div>
                      <span className="text-sm md:text-base text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3 md:gap-4">
                  <Button 
                    onClick={() => {
                      const productSection = document.querySelector('[data-main-container]');
                      if (productSection) {
                        const rect = productSection.getBoundingClientRect();
                        const offsetTop = window.pageYOffset + rect.top - 80;
                        window.scrollTo({ top: offsetTop, behavior: 'smooth' });
                      }
                    }}
                    className="flex-1 bg-black text-white hover:bg-gray-800"
                  >
                    Buy Now
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>


      </div>
    </section>
  );
};

export default ProductCompareSection;