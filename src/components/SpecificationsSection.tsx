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
      { label: 'Voice Control', value: 'Apple/Alexa/Google', tooltip: 'Smart assistant integration' },
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
      { label: 'Warranty', value: '1 Year', tooltip: 'Comprehensive coverage' }
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
      { src: '/assets/specification/sliding_1.webp', alt: "Sliding curtain system" }
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
      { src: '/assets/specification/roller_1.webp', alt: "Roller curtain system" }
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
          <h2 className="text-headline text-primary content-gap" style={{background: 'linear-gradient(180deg, #1f2937, #374151, #6b7280)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'}}>
            Curtain Luxe — Built the Right Way
          </h2>
          
          {/* Tab Menu */}
          <div className="flex justify-center">
            <div className="bg-background rounded-[var(--radius-button)] p-1.5 border border-border shadow-subtle">
              <button
                onClick={() => setActiveTab('sliding')}
                className={`px-4 md:px-5 py-2 md:py-2.5 rounded-[var(--radius-button)] font-medium transition-all duration-300 text-sm md:text-base ${
                  activeTab === 'sliding'
                    ? 'bg-primary text-primary-foreground shadow-soft'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Sliding
              </button>
              <button
                onClick={() => setActiveTab('roller')}
                className={`px-4 md:px-5 py-2 md:py-2.5 rounded-[var(--radius-button)] font-medium transition-all duration-300 text-sm md:text-base ${
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
        <div className="grid lg:grid-cols-2 gap-6 md:gap-8 lg:gap-12 items-start pb-8">
          {/* Left: Content & Specs */}
          <div className="space-y-4 md:space-y-6">
            {/* Tab Introduction */}
            <div className="space-y-3 md:space-y-4 fade-in">
              <h3 className="text-title text-primary" style={{background: 'linear-gradient(180deg, #1f2937, #374151, #6b7280)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'}}>
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



            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-6">
              <Button 
                onClick={() => document.getElementById('compare')?.scrollIntoView({ behavior: 'smooth' })}
                className="btn-secondary text-base py-3 px-6"
              >
                Compare
              </Button>
              <Button 
                onClick={() => {
                  const productSection = document.querySelector('[data-main-container]');
                  if (productSection) {
                    const rect = productSection.getBoundingClientRect();
                    const offsetTop = window.pageYOffset + rect.top - 80;
                    window.scrollTo({ top: offsetTop, behavior: 'smooth' });
                  }
                }}
                className="btn-cta text-base py-3 px-6"
              >
                Buy Now
              </Button>
            </div>


          </div>

          {/* Right: Images */}
          <div className="space-y-3 md:space-y-4 order-first lg:order-last">
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