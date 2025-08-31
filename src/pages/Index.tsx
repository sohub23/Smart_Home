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
      <main>
        <HeroSlider />
        <NarrativeSection />
        <ProblemSolutionSection />
        <SpecificationsSection />
        <TrustedBySection />
        <InteractiveDemoSection />
        <AutoGallerySection />
        <ProductCompareSection />
        <OrderSection />
        <FAQSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;