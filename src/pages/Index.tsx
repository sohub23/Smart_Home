import Navigation from '@/components/Navigation';
import HeroSlider from '@/components/HeroSlider';
import NarrativeSection from '@/components/NarrativeSection';
import TrustedBySection from '@/components/TrustedBySection';
import ProblemSolutionSection from '@/components/ProblemSolutionSection';
import SpecificationsSection from '@/components/SpecificationsSection';
import InteractiveDemoSection from '@/components/InteractiveDemoSection';
import AutoGallerySection from '@/components/AutoGallerySection';
import ProductCompareSection from '@/components/ProductCompareSection';
import OrderSection from '@/components/OrderSection';
import FAQSection from '@/components/FAQSection';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="space-y-0">
        <HeroSlider />
        <div className="space-y-16 md:space-y-20 lg:space-y-24">
          <NarrativeSection />
          <ProblemSolutionSection />
          <SpecificationsSection />
          <TrustedBySection />
          <InteractiveDemoSection />
          <AutoGallerySection />
          <ProductCompareSection />
          <OrderSection />
          <FAQSection />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;