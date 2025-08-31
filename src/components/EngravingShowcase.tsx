import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Palette, Type } from 'lucide-react';

const EngravingShowcase = () => {
  return (
    <section className="section-padding bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="container-width px-4 md:px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Visual */}
          <div className="relative">
            <div className="aspect-square bg-gradient-to-br from-gray-900 to-gray-700 rounded-2xl p-8 flex items-center justify-center">
              <div className="bg-white rounded-lg p-6 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-300">
                <div className="w-32 h-20 bg-gray-100 rounded border-2 border-gray-300 flex items-center justify-center">
                  <span className="text-xs font-mono text-gray-600">BEDROOM</span>
                </div>
                <div className="mt-2 text-center">
                  <div className="w-16 h-1 bg-blue-500 mx-auto rounded"></div>
                </div>
              </div>
            </div>
            
            {/* Floating elements */}
            <div className="absolute -top-4 -right-4 bg-white p-3 rounded-full shadow-lg">
              <Sparkles className="w-6 h-6 text-purple-600" />
            </div>
            <div className="absolute -bottom-4 -left-4 bg-white p-3 rounded-full shadow-lg">
              <Palette className="w-6 h-6 text-pink-600" />
            </div>
          </div>

          {/* Content */}
          <div className="space-y-6">
            <div>
              <h2 className="text-headline text-primary mb-4">Make it yours.</h2>
              <p className="text-body text-muted-foreground">
                Engrave names, icons, or room labels on your smart switches. 
                Personalized, professional laser engraving at no extra hassle.
              </p>
            </div>

            <div className="space-y-4">
              <Card>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Type className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Custom Text</h4>
                    <p className="text-sm text-muted-foreground">Room names, family member names</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-pink-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Icons & Symbols</h4>
                    <p className="text-sm text-muted-foreground">Light bulbs, fans, AC symbols</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Palette className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Premium Finish</h4>
                    <p className="text-sm text-muted-foreground">Laser precision, permanent marking</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
              Start Personalizing
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EngravingShowcase;