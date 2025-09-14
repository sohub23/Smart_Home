import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import sliderThumbnail from '@/assets/default_images/slider_thumbnail.png';
import rollerThumbnail from '@/assets/default_images/roller_thumbnail.png';

const products = [
  {
    name: 'Smart Sliding Curtain',
    youtubeId: 'APm2EDVBljw',
    thumbnail: sliderThumbnail,
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
    name: 'Smart Roller Curtain',
    youtubeId: 'K0MZDn2Tw_4',
    thumbnail: rollerThumbnail,
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
  return (
    <section id="compare" className="py-12 md:py-16 bg-gray-50" style={{paddingBottom: '8rem'}}>
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="lg:text-[2.7rem] xl:text-[3.24rem] font-semibold leading-tight tracking-tight apple-gradient-text mb-6 text-[3.24rem]" style={{lineHeight: 1.09}}>
            Choose Your Style
          </h2>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto font-light px-4">
            Both products deliver exceptional smart control. The choice comes down to your aesthetic preference and space requirements.
          </p>
        </div>

        {/* Product Comparison */}
        <div className="grid lg:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto">
          {products.map((product, index) => (
            <div key={index} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-500">
              {/* Product Video */}
              <div className="h-[400px] overflow-hidden relative">
                {/* YouTube video - hidden initially */}
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${product.youtubeId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${product.youtubeId}`}
                  className={`absolute hover:scale-105 transition-all duration-500 ${
                    videoLoaded[product.youtubeId] ? 'opacity-100' : 'opacity-0'
                  }`}
                  style={{ 
                    border: 'none',
                    width: '150%',
                    height: '150%',
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)'
                  }}
                  allow="autoplay; encrypted-media"
                  title={product.name}
                  onLoad={() => {
                    setTimeout(() => {
                      setVideoLoaded(prev => ({ ...prev, [product.youtubeId]: true }));
                    }, 3000);
                  }}
                />
                
                {/* Default thumbnail overlay - covers everything until video is ready */}
                <div className={`absolute inset-0 transition-opacity duration-500 ${
                  videoLoaded[product.youtubeId] ? 'opacity-0 pointer-events-none' : 'opacity-100'
                }`}>
                  <img
                    src={product.thumbnail}
                    alt={product.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
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

                {/* Quick Specs */}
                <div className="bg-gray-50 rounded-xl p-3 md:p-4 mb-4 md:mb-6">
                  <h4 className="text-sm md:text-base font-semibold text-gray-900 mb-2 md:mb-3">Key Specifications</h4>
                  <div className="space-y-2 md:space-y-3">
                    {Object.entries(product.specs).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center">
                        <span className="text-xs md:text-sm text-gray-600">{key}</span>
                        <span className="text-xs md:text-sm font-medium text-gray-900">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3 md:gap-4">
                  <Button 
                    onClick={() => {
                      const specsSection = document.getElementById('specs');
                      if (specsSection) {
                        specsSection.scrollIntoView({ behavior: 'smooth' });
                        setTimeout(() => {
                          const button = specsSection.querySelector(`button:${index === 0 ? 'first' : 'last'}-of-type`) as HTMLButtonElement;
                          if (button) button.click();
                        }, 500);
                      }
                    }}
                    className="flex-1 bg-gray-100 text-gray-900 hover:bg-gray-200 border-0"
                  >
                    View Full Specs
                  </Button>
                  <Button 
                    onClick={() => document.getElementById('order')?.scrollIntoView({ behavior: 'smooth' })}
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