import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

const products = [
  {
    name: 'Smart Sliding Curtain',
    video: '/videos/Slide Curtain .mp4',
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
    video: '/videos/Roller Curtain.mp4',
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
  return (
    <section id="compare" className="py-12 md:py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-headline text-primary mb-4 px-4">
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
              <div className="aspect-[3/2] overflow-hidden">
                <video
                  src={product.video}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                >
                  Your browser does not support the video tag.
                </video>
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

        {/* Bottom CTA */}
        <div className="text-center mt-12 md:mt-16 px-4">
          <div className="inline-flex items-center px-4 md:px-6 py-3 bg-black text-white rounded-full text-sm md:text-base font-medium hover:bg-gray-800 transition-colors duration-300 cursor-pointer">
            Experience #BuiltForComfort Today
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductCompareSection;