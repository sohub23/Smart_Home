import { Component as ImageAutoSlider } from '@/components/ui/image-auto-slider';


const AutoGallerySection = () => {
  return (
    <section id="gallery" className="section-padding bg-gradient-section">
      <div className="container-width px-4 md:px-6">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <h2 className="lg:text-[2.7rem] xl:text-[3.24rem] font-semibold leading-tight tracking-tight apple-gradient-text mb-6 text-[3.24rem]" style={{lineHeight: 1.09}}>
            Every Detail Matters
          </h2>
          <p className="text-body-large text-muted-foreground max-w-2xl mx-auto mb-6">
            Explore our complete smart home solutions - from automated curtains and PDLC film technology to comprehensive SOHUB Protect security systems.
          </p>
          
          <div className="w-full">
            <img
              src="/assets/every_detail.png"
              alt="Every Detail Matters Banner"
              className="w-full h-auto rounded-lg shadow-lg"
            />
          </div>
        </div>

        {/* Auto Slider */}
        <ImageAutoSlider />
      </div>
    </section>
  );
};

export default AutoGallerySection;