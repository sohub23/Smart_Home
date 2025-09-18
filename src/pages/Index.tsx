import Navigation from '@/components/Navigation';
import HeroSlider from '@/components/HeroSlider';
import NarrativeSection from '@/components/NarrativeSection';
import TrustedBySection from '@/components/TrustedBySection';

import SpecificationsSection from '@/components/SpecificationsSection';
import InteractiveDemoSection from '@/components/InteractiveDemoSection';
import DetailOverview from '@/components/DetailOverview';
import ProductCompareSection from '@/components/ProductCompareSection';
import OrderSection from '@/components/OrderSection';
import FAQSection from '@/components/FAQSection';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main>
        <HeroSlider />
        <NarrativeSection />
        <ProductCompareSection />
        <InteractiveDemoSection />
        <SpecificationsSection />
        <DetailOverview />
        <TrustedBySection />
        <OrderSection />
        <FAQSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;