import { Button } from '@/components/ui/button';
import { Check, Smartphone, Clock, Volume } from 'lucide-react';

const NarrativeSection = () => {
  return (
    <section className="section-padding bg-gradient-section">
      <div className="container-width px-4 md:px-6">
        <div className="grid lg:grid-cols-2 gap-12 md:gap-16 lg:gap-20 items-center">
          {/* Content */}
          <div className="space-y-10 md:space-y-12">
            <div className="space-y-6 md:space-y-8">
              <h2 className="text-headline text-primary">
                Control Your Comfort
              </h2>
              <p className="text-body-large text-muted-foreground">
                Manual curtains steal your time. Go smart—control with one tap, from anywhere.
              </p>
            </div>

            {/* Benefits List */}
            <div className="space-y-6">
              <div className="flex items-center space-x-6 p-6 rounded-[var(--radius-card)] bg-surface border border-border">
                <div className="flex-shrink-0 w-14 h-14 bg-accent/10 rounded-full flex items-center justify-center">
                  <Volume className="w-7 h-7 text-accent-soft" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-primary mb-1">No more tug & pull</h3>
                  <p className="text-body-small text-muted-foreground">Silent, effortless operation</p>
                </div>
              </div>

              <div className="flex items-center space-x-6 p-6 rounded-[var(--radius-card)] bg-surface border border-border">
                <div className="flex-shrink-0 w-14 h-14 bg-accent/10 rounded-full flex items-center justify-center">
                  <Smartphone className="w-7 h-7 text-accent-soft" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-primary mb-1">One-tap open/close</h3>
                  <p className="text-body-small text-muted-foreground">Control from anywhere with the app</p>
                </div>
              </div>

              <div className="flex items-center space-x-6 p-6 rounded-[var(--radius-card)] bg-surface border border-border">
                <div className="flex-shrink-0 w-14 h-14 bg-accent/10 rounded-full flex items-center justify-center">
                  <Clock className="w-7 h-7 text-accent-soft" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-primary mb-1">Schedules & scenes</h3>
                  <p className="text-body-small text-muted-foreground">Automated comfort, exactly when you need it</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-6">
              <Button 
                onClick={() => document.getElementById('specs')?.scrollIntoView({ behavior: 'smooth' })}
                className="btn-primary text-base py-3 px-6"
              >
                Learn More
              </Button>
              <Button 
                onClick={() => document.getElementById('order')?.scrollIntoView({ behavior: 'smooth' })}
                className="btn-secondary text-base py-3 px-6"
              >
                Buy Now
              </Button>
            </div>

            {/* Comfort Badge */}
            <div className="inline-flex items-center px-6 py-3 bg-accent/10 rounded-full border border-accent/20">
              <Check className="w-5 h-5 text-accent-soft mr-3" />
              <span className="text-base font-medium text-accent-soft">#BuiltForComfort</span>
            </div>
          </div>

          {/* Visual */}
          <div className="relative">
            <div className="aspect-[4/3] rounded-[var(--radius-large)] overflow-hidden shadow-medium">
              <video
                src="http://202.59.208.112/smart_curtain/videos/ati_bazar.mp4"
                autoPlay
                muted
                loop
                playsInline
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