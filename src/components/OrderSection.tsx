import { InteractiveCheckout } from '@/components/ui/interactive-checkout';

const OrderSection = () => {
  return (
    <section 
      id="order" 
      className="min-h-screen bg-background py-12 md:py-16 pt-20 md:pt-24"
    >
      <div className="container-width px-4 md:px-6">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-headline text-primary mb-4 px-4">Build Your Smart Home</h2>
          <p className="text-body text-muted-foreground px-4">
            Add products to your cart and checkout with ease.
          </p>
        </div>
        
        <InteractiveCheckout />
      </div>
    </section>
  );
};

export default OrderSection;