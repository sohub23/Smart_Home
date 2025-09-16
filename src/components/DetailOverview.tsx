const DetailOverview = () => {
  return (
    <section id="gallery" className="section-padding bg-gradient-section">
      <div className="container-width px-4 md:px-6">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <h2 className="lg:text-[2.7rem] xl:text-[3.24rem] font-semibold leading-tight tracking-tight apple-gradient-text mb-6 text-[3.24rem]" style={{lineHeight: 1.09, background: 'linear-gradient(180deg, #1f2937, #374151, #6b7280)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'}}>
            Every Detail Matters
          </h2>
          <p className="text-body-large text-muted-foreground max-w-2xl mx-auto mb-6" style={{background: 'linear-gradient(180deg, #1f2937, #374151, #6b7280)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'}}>
            Explore our complete smart home solutions
          </p>
          
          <div className="w-full">
            <img
              src="/assets/every_detail.png"
              alt="Every Detail Matters Banner"
              className="w-full h-auto rounded-lg shadow-lg"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default DetailOverview;