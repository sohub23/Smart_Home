import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const FAQSection = () => {
  return (
    <section id="faq" className="section-padding bg-surface">
      <div className="container-width px-4 md:px-6">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-headline text-primary mb-4">Questions, Answered</h2>
          <p className="text-body text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know about Curtain Luxe smart curtains.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Product FAQs */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-primary border-b-2 border-blue-500 pb-2 mb-2 inline-block">Product FAQs</h3>
                <p className="text-sm text-muted-foreground">Compatibility, reliability, warranty</p>
              </div>
              <Accordion type="single" collapsible className="space-y-4">
                <AccordionItem value="product-1" className="border border-gray-200 rounded-lg">
                  <AccordionTrigger className="text-left font-medium px-4 py-3 hover:no-underline">
                    Wi-Fi vs Zigbee compatibility?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground px-4 pb-4">
                    Wi-Fi: Direct connection, works with any router. Zigbee: Mesh network, more reliable, requires hub (included).
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="product-2" className="border border-gray-200 rounded-lg">
                  <AccordionTrigger className="text-left font-medium px-4 py-3 hover:no-underline">
                    What's the warranty coverage?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground px-4 pb-4">
                    2-year warranty on all components, valid with self-installation. Includes 24/7 support and lifetime software updates.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="product-3" className="border border-gray-200 rounded-lg">
                  <AccordionTrigger className="text-left font-medium px-4 py-3 hover:no-underline">
                    Power failure reliability?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground px-4 pb-4">
                    Curtains retain position during outages. Auto-reconnect when power returns. Manual controls always available.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            {/* Pricing & Payment */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-primary border-b-2 border-green-500 pb-2 mb-2 inline-block">Pricing & Payment</h3>
                <p className="text-sm text-muted-foreground">EMI, offers, discounts</p>
              </div>
              <Accordion type="single" collapsible className="space-y-4">
                <AccordionItem value="pricing-1" className="border border-gray-200 rounded-lg">
                  <AccordionTrigger className="text-left font-medium px-4 py-3 hover:no-underline">
                    EMI options available?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground px-4 pb-4">
                    Yes! 0% EMI for 3-12 months. Starting from ৳2,083/month. No processing fees or hidden charges.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="pricing-2" className="border border-gray-200 rounded-lg">
                  <AccordionTrigger className="text-left font-medium px-4 py-3 hover:no-underline">
                    Bundle discounts?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground px-4 pb-4">
                    Save up to 15% on multiple curtains. Free installation on orders above ৳50,000. Seasonal offers available.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="pricing-3" className="border border-gray-200 rounded-lg">
                  <AccordionTrigger className="text-left font-medium px-4 py-3 hover:no-underline">
                    Payment methods?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground px-4 pb-4">
                    Cash on Delivery, Online Payment, Bank Transfer, Mobile Banking. Secure payment gateway with SSL encryption.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            {/* Installation & Support */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-primary border-b-2 border-purple-500 pb-2 mb-2 inline-block">Installation & Support</h3>
                <p className="text-sm text-muted-foreground">How it works, availability, coverage</p>
              </div>
              <Accordion type="single" collapsible className="space-y-4">
                <AccordionItem value="install-1" className="border border-gray-200 rounded-lg">
                  <AccordionTrigger className="text-left font-medium px-4 py-3 hover:no-underline">
                    Professional installation available?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground px-4 pb-4">
                    Yes! Expert installation in Dhaka, Chittagong, Sylhet. ৳2,000 per curtain. Includes setup, testing, and training.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="install-2" className="border border-gray-200 rounded-lg">
                  <AccordionTrigger className="text-left font-medium px-4 py-3 hover:no-underline">
                    Self-installation support?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground px-4 pb-4">
                    Detailed video guides, 24/7 chat support, video call assistance. Average installation time: 30-45 minutes.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="install-3" className="border border-gray-200 rounded-lg">
                  <AccordionTrigger className="text-left font-medium px-4 py-3 hover:no-underline">
                    Delivery timeline?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground px-4 pb-4">
                    3-4 weeks from order (custom manufacturing). Express delivery available in Dhaka (2 weeks, +৳1,500).
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            {/* Personalization */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-primary border-b-2 border-orange-500 pb-2 mb-2 inline-block">Personalization</h3>
                <p className="text-sm text-muted-foreground">Switch engraving, bundled offers</p>
              </div>
              <Accordion type="single" collapsible className="space-y-4">
                <AccordionItem value="personal-1" className="border border-gray-200 rounded-lg">
                  <AccordionTrigger className="text-left font-medium px-4 py-3 hover:no-underline">
                    Switch engraving options?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground px-4 pb-4">
                    Custom text engraving on smart switches. Choose font, color, and position. ৳500 per switch. Preview before order.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="personal-2" className="border border-gray-200 rounded-lg">
                  <AccordionTrigger className="text-left font-medium px-4 py-3 hover:no-underline">
                    Smart home bundles?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground px-4 pb-4">
                    Curtain + Switch + Security bundles available. Save 20% on complete room automation. Free consultation included.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="personal-3" className="border border-gray-200 rounded-lg">
                  <AccordionTrigger className="text-left font-medium px-4 py-3 hover:no-underline">
                    Color customization?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground px-4 pb-4">
                    Motor colors: White, Black, Silver. Track colors: White, Black, Bronze. Fabric: 50+ premium options available.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;