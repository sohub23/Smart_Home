import { Component as ImageAutoSlider } from '@/components/ui/image-auto-slider';

const AutoGallerySection = () => {
  return (
    <section id="gallery" className="section-padding bg-gradient-section">
      <div className="container-width px-4 md:px-6">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-headline text-primary mb-4">
            Every Detail Matters
          </h2>
          <p className="text-body-large text-muted-foreground max-w-2xl mx-auto">
            Explore our complete smart home solutions - from automated curtains and PDLC film technology to comprehensive SOHUB Protect security systems.
          </p>
        </div>

        {/* Auto Slider */}
        <ImageAutoSlider />

        {/* Bottom Badge */}
        <div className="text-center mt-8 md:mt-12">
          <div className="inline-flex items-center px-4 md:px-6 py-2 md:py-3 rounded-full border border-blue-800" style={{ backgroundColor: 'rgb(31 41 55)' }}>
            <span className="text-xs md:text-sm font-medium text-white text-center">
              Crafted with attention to every detail • #BuiltForComfort
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AutoGallerySection;