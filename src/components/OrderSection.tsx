import { InteractiveCheckout } from '@/components/ui/interactive-checkout';

const OrderSection = () => {
  return (
    <section 
      id="order" 
      className="min-h-screen bg-background section-padding"
    >
      <div className="w-full lg:max-w-7xl lg:mx-auto px-0 md:px-6">
        <div className="text-center section-gap">
          <h2 className="text-headline text-primary content-gap px-4" style={{background: 'linear-gradient(180deg, #1f2937, #374151, #6b7280)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'}}>Build Your Smart Home</h2>
          <p className="text-body-large text-muted-foreground px-4" style={{background: 'linear-gradient(180deg, #1f2937, #374151, #6b7280)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'}}>
            Add products to your cart and checkout with ease.
          </p>
        </div>
        
        <InteractiveCheckout />
      </div>
    </section>
  );
};

export default OrderSection;