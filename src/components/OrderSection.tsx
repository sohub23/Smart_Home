import { InteractiveCheckout } from '@/components/ui/interactive-checkout';

const OrderSection = () => {
  return (
    <section 
      id="order" 
      className="min-h-screen bg-background section-padding"
    >
      <div className="container-width px-4 md:px-6">
        <div className="text-center section-gap">
          <h2 className="text-headline text-primary content-gap px-4">Build Your Smart Home</h2>
          <p className="text-body-large text-muted-foreground px-4">
            Add products to your cart and checkout with ease.
          </p>
        </div>
        
        <InteractiveCheckout />
      </div>
    </section>
  );
};

export default OrderSection;