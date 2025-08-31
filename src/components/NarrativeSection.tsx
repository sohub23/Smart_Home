import { Button } from '@/components/ui/button';
import { Check, Smartphone, Clock, Volume } from 'lucide-react';

const NarrativeSection = () => {
  return (
    <section className="section-padding bg-gradient-section">
      <div className="container-width px-4 md:px-6">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-headline text-primary">
                Control Your Comfort
              </h2>
              <p className="text-body-large text-muted-foreground">
                Manual curtains steal your time. Go smart—control with one tap, from anywhere.
              </p>
            </div>

            {/* Benefits List */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-4 rounded-[var(--radius-card)] bg-surface border border-border">
                <div className="flex-shrink-0 w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                  <Volume className="w-6 h-6 text-accent-soft" />
                </div>
                <div>
                  <h3 className="font-semibold text-primary">No more tug & pull</h3>
                  <p className="text-sm text-muted-foreground">Silent, effortless operation</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 p-4 rounded-[var(--radius-card)] bg-surface border border-border">
                <div className="flex-shrink-0 w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                  <Smartphone className="w-6 h-6 text-accent-soft" />
                </div>
                <div>
                  <h3 className="font-semibold text-primary">One-tap open/close</h3>
                  <p className="text-sm text-muted-foreground">Control from anywhere with the app</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 p-4 rounded-[var(--radius-card)] bg-surface border border-border">
                <div className="flex-shrink-0 w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-accent-soft" />
                </div>
                <div>
                  <h3 className="font-semibold text-primary">Schedules & scenes</h3>
                  <p className="text-sm text-muted-foreground">Automated comfort, exactly when you need it</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={() => document.getElementById('specs')?.scrollIntoView({ behavior: 'smooth' })}
                className="btn-primary"
              >
                Learn More
              </Button>
              <Button 
                onClick={() => document.getElementById('order')?.scrollIntoView({ behavior: 'smooth' })}
                className="btn-secondary"
              >
                Buy Now
              </Button>
            </div>

            {/* Comfort Badge */}
            <div className="inline-flex items-center px-4 py-2 bg-accent/10 rounded-full border border-accent/20">
              <Check className="w-4 h-4 text-accent-soft mr-2" />
              <span className="text-sm font-medium text-accent-soft">#BuiltForComfort</span>
            </div>
          </div>

          {/* Visual */}
          <div className="relative">
            <div className="aspect-[4/3] rounded-[var(--radius-large)] overflow-hidden shadow-medium">
              <img
                src="/images/sohub_protect/banner/2nd_image.jpg"
                alt="Manual curtains vs smart curtains comparison"
                className="w-full h-full object-cover"
              />

            </div>
            
            {/* Floating card */}
            <div className="absolute -bottom-4 -right-4 md:-bottom-6 md:-right-6 bg-background p-4 md:p-6 rounded-[var(--radius-card)] shadow-strong border border-border max-w-xs">
              <h4 className="text-sm md:text-base font-semibold text-primary mb-2">The Curtain Luxe way:</h4>
              <p className="text-xs md:text-sm text-muted-foreground">Smart automation that adapts to your life</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NarrativeSection;