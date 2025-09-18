import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const FAQSection = () => {

  const faqData = {
    "Smart Home Basics": [
      {
        question: "What is a smart home?",
        answer: "A smart home is a house where various devices and systems—such as lights, curtains, ACs, and security devices—can be controlled automatically, via the internet, and from a central point like your smartphone or by voice commands."
      },
      {
        question: "Is a smart home very expensive?",
        answer: "You can start with a single device and build your system over time. We offer solutions for various budgets. In the long run, smart automation is an investment that can help you save significantly on electricity bills."
      },
      {
        question: "Are these smart products compatible with my existing home?",
        answer: "Yes, our products are designed for retrofitting. Smart switches can replace manual ones, motorized curtains can be installed on your existing windows, and PDLC film is applied directly to your current glass."
      },
      {
        question: "Are smart devices secure and do they require monthly fees?",
        answer: "Our smart devices are built with advanced security features and we recommend using strong passwords and secure Wi-Fi networks. No monthly subscription is required - all standard control features are accessible via the mobile app after the initial purchase and setup."
      },
      {
        question: "I want a customized solution. How can you help?",
        answer: "We specialize in custom packages tailored to your specific needs, space, and budget. Our consultants will help you design the perfect smart home solution. Contact us for a personalized consultation."
      }
    ],
    "Services & Support": [
      {
        question: "What are your service areas?",
        answer: "We are based in Dhaka and provide our installation services across Bangladesh. Contact us with your location to confirm availability."
      },
      {
        question: "Do you provide installation services?",
        answer: "Yes, we provide professional installation services for all our products. Our expert team will come to your location and set everything up correctly for you."
      },
      {
        question: "Do you provide after-sales support and warranty?",
        answer: "Yes. We offer a warranty on our products and provide comprehensive after-sales support, including installation help, troubleshooting, and maintenance services to ensure your system runs perfectly."
      },
      {
        question: "What payment methods do you accept?",
        answer: "We accept cash, bank transfers, and mobile banking. Specific payment options can be discussed and arranged at the time of order."
      },
      {
        question: "Are your smart devices energy-efficient?",
        answer: "Yes. Automation is key to energy efficiency. Our systems allow you to schedule devices and reduce unnecessary usage, helping you save on energy bills."
      },
      {
        question: "What services do you provide?",
        answer: "We offer: PDLC smart film supply & installation, Smart curtain automation & installation, After-sales support & maintenance, and Customized smart home/office solutions. Contact us for a full consultation."
      }
    ],
    "Smart Curtains & Automation": [
      {
        question: "Can I get smart curtains?",
        answer: "Yes, we provide complete smart curtain automation solutions, including motorized tracks and installation."
      },
      {
        question: "Do you provide fabrics for smart curtains?",
        answer: "We offer a selection of fabrics. However, customers are also welcome to source their own fabric externally. We ensure proper fitting and installation with our motorized system regardless of the fabric choice."
      },
      {
        question: "Can I schedule timers for my curtains?",
        answer: "Yes, our smart curtain app allows you to set precise daily schedules and automation rules for opening and closing, perfect for mimicking occupancy or managing light."
      },
      {
        question: "Can I control curtains, lights, and AC from a single app?",
        answer: "Yes! Our integrated smart home solutions allow you to control curtains, lights, AC, and other devices from a single mobile app with schedules, timers, and scenes."
      },
      {
        question: "Do your smart systems work with Alexa and Google Home?",
        answer: "Yes, most of our smart devices are compatible with popular platforms like Amazon Alexa, Google Assistant, and Apple HomeKit, allowing for seamless voice control."
      },
      {
        question: "Can I monitor and control devices when I'm away from home?",
        answer: "Yes. Our systems support remote access via the mobile app, allowing you to manage your smart home or office devices from anywhere in the world."
      },
      {
        question: "What else do I need to install a new Smart Curtain (Slider or Roller)?",
        answer: "The curtain requires a 220V power supply to operate. If you choose the Zigbee variant, you'll need a Zigbee hub for setup, while the Wi-Fi variant works without any hub. For mobile app control (both Zigbee and Wi-Fi), a stable internet connection is always required. During the Slider Curtain installation, make sure to have 8 inches of free space for a single curtain, and 10–12 inches for a double curtain. For roller curtains, we recommend using an 8-feet tube for proper installation and durability."
      }
    ],
    "PDLC Smart Film": [
      {
        question: "How does PDLC film work?",
        answer: "PDLC film contains liquid crystal molecules dispersed in a polymer. When an electric current is applied, the crystals align, making the film transparent. Without power, the molecules are randomly oriented, creating a frosted, private effect."
      },
      {
        question: "Can PDLC film be retrofitted on existing glass windows?",
        answer: "Yes, absolutely. PDLC film can be applied to most existing clean, smooth, and defect-free glass surfaces. Our professional team handles the installation to ensure optimal performance."
      },
      {
        question: "Do you provide the glass with PDLC film?",
        answer: "No, we provide and install only the PDLC film onto your existing glass. A power adapter/transformer is required, which can be purchased from our website."
      },
      {
        question: "How do I clean and maintain the PDLC film?",
        answer: "The film is durable and can be cleaned with a soft, lint-free cloth and a mild, non-abrasive glass cleaner. Avoid abrasive materials. Our team will provide full care instructions upon installation."
      },
      {
        question: "What else do I need to install a new PDLC film?",
        answer: "The film requires a 220V power supply to operate. If you choose the Zigbee variant, you'll need a Zigbee hub for setup, while the Wi-Fi variant works without any hub. For mobile app control (both Zigbee and Wi-Fi), a stable internet connection is always required."
      }
    ]
  };

  return (
    <section id="faq" className="py-16 bg-gray-50">
      <div className="container-width px-4 md:px-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Frequently Asked Questions</h2>
          <p className="text-base text-gray-600 max-w-2xl mx-auto">Find answers to common questions about our smart home solutions</p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {Object.entries(faqData).map(([category, faqs], categoryIndex) => (
              <div key={category} className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="mb-2">
                  <div className="inline-block">
                    <h3 className="text-lg font-semibold text-gray-900 mb-0.5">{category}</h3>
                    <div className={`h-0.5 w-30 ${
                      category === "Smart Home Basics" ? "bg-blue-500" :
                      category === "PDLC Smart Film" ? "bg-purple-500" :
                      category === "Smart Curtains & Automation" ? "bg-green-500" :
                      category === "Services & Support" ? "bg-orange-500" : "bg-gray-500"
                    }`}></div>
                  </div>
                </div>
                <Accordion type="single" collapsible className="space-y-2">
                  {faqs.map((faq, index) => (
                    <AccordionItem 
                      key={`${categoryIndex}-${index}`} 
                      value={`faq-${categoryIndex}-${index}`} 
                      className="bg-white border border-gray-200 rounded-lg"
                    >
                      <AccordionTrigger className="text-left font-medium px-4 py-3 hover:no-underline text-gray-700 hover:text-gray-900 text-sm">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-gray-600 px-4 pb-3 leading-relaxed text-sm">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;