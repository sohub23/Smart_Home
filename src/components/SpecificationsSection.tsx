import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, 
  Gauge, 
  Volume, 
  Battery, 
  Wifi, 
  Smartphone, 
  Settings, 
  Shield, 
  Award,
  ExternalLink,
  Info
} from 'lucide-react';
import slidingImage1 from '@/assets/specification/sliding_1.webp';
import slidingImage2 from '@/assets/specification/sliding_2.webp';
import slidingImage3 from '@/assets/specification/sliding_3.webp';
import rollerImage1 from '@/assets/specification/roller_1.webp';
import rollerImage3 from '@/assets/specification/roller_3.webp';

type TabType = 'sliding' | 'roller';

interface SpecGroup {
  title: string;
  icon: React.ElementType;
  specs: Array<{
    label: string;
    value: string;
    tooltip?: string;
  }>;
}

const sharedSpecGroups: SpecGroup[] = [
  {
    title: 'Motor',
    icon: Zap,
    specs: [
      { label: 'Torque', value: '2.5 Nm', tooltip: 'Rotational force for smooth operation' },
      { label: 'Speed', value: '15 rpm', tooltip: 'Rotation speed for optimal performance' },
      { label: 'Noise Level', value: '< 35 dB', tooltip: 'Whisper-quiet operation' },
      { label: 'Power', value: '24V DC', tooltip: 'Low voltage for safety' },
      { label: 'Standby', value: '< 0.5W', tooltip: 'Energy efficient when idle' }
    ]
  },
  {
    title: 'Control',
    icon: Smartphone,
    specs: [
      { label: 'Connectivity', value: 'Wi-Fi/Zigbee', tooltip: 'Dual connectivity options' },
      { label: 'App Control', value: 'iOS/Android', tooltip: 'Universal app support' },
      { label: 'Voice Control', value: 'Alexa/Google', tooltip: 'Smart assistant integration' },
      { label: 'Scenes', value: 'Unlimited', tooltip: 'Custom automation scenarios' }
    ]
  },
  {
    title: 'Track/Fabric',
    icon: Settings,
    specs: [
      { label: 'Max Load', value: '15 kg', tooltip: 'Maximum fabric weight capacity' },
      { label: 'Max Width', value: '4.5 m', tooltip: 'Maximum curtain width' },
      { label: 'Max Height', value: '3.5 m', tooltip: 'Maximum curtain height' },
      { label: 'Compatibility', value: 'Universal', tooltip: 'Works with most fabric types' }
    ]
  },
  {
    title: 'Safety & Warranty',
    icon: Shield,
    specs: [
      { label: 'Overload Protection', value: 'Built-in', tooltip: 'Automatic motor protection' },
      { label: 'Certifications', value: 'CE, FCC, RoHS', tooltip: 'International safety standards' },
      { label: 'Warranty', value: '3 Years', tooltip: 'Comprehensive coverage' },
      { label: 'Support', value: '24/7 Local', tooltip: 'Bangladesh-based support team' }
    ]
  }
];

const tabContent = {
  sliding: {
    subtitle: "Sliding Curtain — Smooth. Silent. Precise.",
    bullets: [
      "Whisper-quiet motor for peaceful bedrooms",
      "Wide span support up to 4.5m",
      "One-tap control and smart schedules",
      "Wi-Fi and Zigbee connectivity options"
    ],
    images: [
      { src: slidingImage1, alt: "Sliding curtain system" },
      { src: slidingImage2, alt: "Sliding curtain details" },
      { src: slidingImage3, alt: "Sliding curtain installation" }
    ],
    badge: "Calibrated for whisper-quiet bedrooms"
  },
  roller: {
    subtitle: "Roller Curtain — Minimal Look. Max Control.",
    bullets: [
      "Compact design for modern aesthetics",
      "Precision roll control and positioning",
      "Silent operation for any room",
      "Advanced motor technology"
    ],
    images: [
      { src: rollerImage1, alt: "Roller curtain system" },
      { src: rollerImage3, alt: "Roller curtain installation" }
    ],
    badge: "Engineered for precision control"
  }
};

const SpecificationsSection = () => {
  const [activeTab, setActiveTab] = useState<TabType>('sliding');
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

  const currentContent = tabContent[activeTab];

  return (
    <section id="specs" className="section-padding bg-surface">
      <div className="container-width px-4 md:px-6">
        {/* Header */}
        <div className="text-center section-gap">
          <h2 className="text-headline text-primary content-gap">
            Curtain Luxe — Built the Right Way
          </h2>
          
          {/* Tab Menu */}
          <div className="flex justify-center">
            <div className="bg-background rounded-[var(--radius-button)] p-1.5 border border-border shadow-subtle">
              <button
                onClick={() => setActiveTab('sliding')}
                className={`px-6 md:px-8 py-3 md:py-4 rounded-[var(--radius-button)] font-medium transition-all duration-300 text-base md:text-lg ${
                  activeTab === 'sliding'
                    ? 'bg-primary text-primary-foreground shadow-soft'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Sliding
              </button>
              <button
                onClick={() => setActiveTab('roller')}
                className={`px-6 md:px-8 py-3 md:py-4 rounded-[var(--radius-button)] font-medium transition-all duration-300 text-base md:text-lg ${
                  activeTab === 'roller'
                    ? 'bg-primary text-primary-foreground shadow-soft'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Roller
              </button>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="grid lg:grid-cols-2 gap-12 md:gap-16 lg:gap-20 items-start">
          {/* Left: Content & Specs */}
          <div className="space-y-8 md:space-y-10">
            {/* Tab Introduction */}
            <div className="space-y-6 md:space-y-8 fade-in">
              <h3 className="text-title text-primary">
                {currentContent.subtitle}
              </h3>
              
              <ul className="space-y-4">
                {currentContent.bullets.map((bullet, index) => (
                  <li key={index} className="flex items-start space-x-4">
                    <div className="w-3 h-3 bg-accent-soft rounded-full mt-2 flex-shrink-0" />
                    <span className="text-body text-muted-foreground">{bullet}</span>
                  </li>
                ))}
              </ul>

              <Badge variant="secondary" className="bg-accent/10 text-accent-soft border-accent/20 text-base px-4 py-2">
                {currentContent.badge}
              </Badge>
            </div>

            {/* Specifications Tables */}
            <div className="space-y-6 md:space-y-8">
              {sharedSpecGroups.map((group, groupIndex) => {
                const IconComponent = group.icon;
                return (
                  <div key={groupIndex} className="card-minimal p-6 md:p-8">
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                        <IconComponent className="w-6 h-6 text-accent-soft" />
                      </div>
                      <h4 className="text-lg md:text-xl font-semibold text-primary">{group.title}</h4>
                    </div>
                    
                    <div className="space-y-4">
                      {group.specs.map((spec, specIndex) => (
                        <div key={specIndex} className="flex justify-between items-center py-3 border-b border-border last:border-b-0">
                          <div className="flex items-center space-x-3">
                            <span className="text-base font-medium text-muted-foreground">
                              {spec.label}
                            </span>
                            {spec.tooltip && (
                              <button
                                onMouseEnter={() => setShowTooltip(`${groupIndex}-${specIndex}`)}
                                onMouseLeave={() => setShowTooltip(null)}
                                className="relative"
                              >
                                <Info className="w-5 h-5 text-muted-foreground hover:text-foreground" />
                                {showTooltip === `${groupIndex}-${specIndex}` && (
                                  <div className="absolute bottom-full left-0 mb-2 p-3 bg-primary text-primary-foreground text-sm rounded whitespace-nowrap shadow-medium z-10">
                                    {spec.tooltip}
                                  </div>
                                )}
                              </button>
                            )}
                          </div>
                          <span className="text-base font-semibold text-primary">
                            {spec.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-6">
              <Button 
                onClick={() => document.getElementById('compare')?.scrollIntoView({ behavior: 'smooth' })}
                className="btn-secondary text-base py-3 px-6"
              >
                Compare
              </Button>
              <Button 
                onClick={() => document.getElementById('order')?.scrollIntoView({ behavior: 'smooth' })}
                className="btn-cta text-base py-3 px-6"
              >
                Buy Now
              </Button>
            </div>

            {/* Built for Comfort Badge */}
            <div className="pt-6 border-t border-border">
              <Badge variant="outline" className="border-accent/20 text-accent-soft text-base px-4 py-2">
                #BuiltForComfort
              </Badge>
            </div>
          </div>

          {/* Right: Images */}
          <div className="space-y-6 md:space-y-8 order-first lg:order-last">
            {currentContent.images.map((image, index) => (
              <div key={index} className="w-full overflow-hidden shadow-medium rounded-xl">
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SpecificationsSection;