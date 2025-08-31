import { useEffect } from 'react';
import { Check } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card } from '@/components/ui/card';

const AboutPage = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <main className="pt-24">
        {/* Header Section */}
        <section className="py-12 md:py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 md:px-6 text-center">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-black mb-4 md:mb-6 tracking-tight">
              About SOHUB Smart Curtains
            </h1>
            <p className="text-base md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              SOHUB brings global-quality smart curtains to Bangladesh — at #BuiltForComfort — with full transparency, no compromise, and deep respect for your right to quality living.
            </p>
          </div>
        </section>

        {/* Why Section */}
        <section className="py-12 md:py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 md:px-6">
            <h2 className="text-2xl md:text-4xl font-bold text-black text-center mb-8 md:mb-12">
              Why does SOHUB exist?
            </h2>
            <div className="max-w-3xl mx-auto space-y-4 md:space-y-6 text-sm md:text-lg text-gray-700 leading-relaxed">
              <p>
                Bangladesh deserves better than overpriced, low-quality smart home products that break promises and drain wallets. We saw a market flooded with fake brands, inflated prices, and products that simply don't deliver on their promises.
              </p>
              <p>
                SOHUB exists to change this narrative. We partner directly with the world's best smart curtain manufacturers, cutting out middlemen and brand premiums to bring you authentic, high-quality automation at honest prices.
              </p>
              <p>
                Our mission is simple: make premium smart living accessible to every Bangladeshi home, with complete transparency about what you're buying and why it costs what it does.
              </p>
            </div>
          </div>
        </section>

        {/* Promise Card */}
        <section className="py-12 md:py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 md:px-6">
            <Card className="p-6 md:p-8 bg-white rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
              <h3 className="text-xl md:text-2xl font-bold text-black mb-4 md:mb-6 text-center">Our Promise:</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 text-sm md:text-lg">No fakes — only authentic, tested products</span>
                </div>
                <div className="flex items-start space-x-3">
                  <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 text-lg">No inflated prices — transparent, honest pricing</span>
                </div>
                <div className="flex items-start space-x-3">
                  <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 text-lg">Simple packaging — because why pay for boxes instead of product?</span>
                </div>
                <div className="flex items-start space-x-3">
                  <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 text-lg">No scraps — premium materials and components only</span>
                </div>
                <div className="flex items-start space-x-3">
                  <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 text-lg">No brand premiums — only product value</span>
                </div>
                <div className="flex items-start space-x-3">
                  <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 text-lg">100% focus on quality and workmanship — because we believe Bangladesh deserves the best</span>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Vision Section */}
        <section className="py-12 md:py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 md:px-6 text-center">
            <div className="text-4xl md:text-6xl mb-4 md:mb-6">🫶</div>
            <h2 className="text-2xl md:text-3xl font-bold text-black mb-4 md:mb-6">Vision</h2>
            <p className="text-base md:text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
              To make global-quality smart curtains accessible to everyone in Bangladesh — all at honest #BuiltForComfort pricing — with full transparency, no compromises, and deep respect for the people we serve.
            </p>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-12 md:py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 md:px-6 text-center">
            <div className="text-4xl md:text-6xl mb-4 md:mb-6">💖</div>
            <h2 className="text-2xl md:text-3xl font-bold text-black mb-4 md:mb-6">Mission</h2>
            <div className="max-w-3xl mx-auto space-y-4 md:space-y-6 text-sm md:text-lg text-gray-700 leading-relaxed">
              <p>
                The truth about fake "branded" smart home products is that they're often the same generic products with inflated prices and fancy packaging. We believe in transparency — showing you exactly what you're getting and why.
              </p>
              <p>
                Our mission is to protect consumers from fakes, broken promises, and overpriced habits by offering direct access to premium manufacturers. We eliminate the brand tax and marketing fluff, focusing purely on product quality and honest pricing.
              </p>
              <p>
                Every SOHUB product comes with complete transparency about its origin, materials, and true cost breakdown. Because when you know what you're buying, you can make better decisions for your home and family.
              </p>
            </div>
          </div>
        </section>

        {/* Brand Layer Card */}
        <section className="py-12 md:py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 md:px-6">
            <Card className="p-6 md:p-8 bg-gray-900 text-white rounded-2xl shadow-xl hover:shadow-2xl transition-shadow">
              <h3 className="text-xl md:text-2xl font-bold mb-6 md:mb-8 text-center">Brand Layer</h3>
              <div className="grid md:grid-cols-2 gap-6 md:gap-8">
                <div>
                  <h4 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 text-blue-300">SOHUB (mother brand)</h4>
                  <p className="text-sm md:text-base text-gray-300 leading-relaxed">
                    Built on a concept that #BuiltForComfort delivers what it's worth, transparency, and access to the largest market reach for premium smart home solutions.
                  </p>
                </div>
                <div>
                  <h4 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 text-green-300">#BuiltForComfort (first initiative)</h4>
                  <p className="text-sm md:text-base text-gray-300 leading-relaxed">
                    A campaign with a clear purpose: helping people own what's real — with a promise towards fair quality, fairness, and sustainability in smart living.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default AboutPage;