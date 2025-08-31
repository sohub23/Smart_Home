import { useEffect, useState } from "react";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

const TrustedBySection = () => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  const products = [
    { image: "/images/sohub_protect/accesories/B020-SOS-SOS-Band.png", name: "SOS Band" },
    { image: "/images/sohub_protect/accesories/camera-c11.png", name: "Security Camera" },
    { image: "/images/sohub_protect/accesories/door_Sensor_DS200.png", name: "Door Sensor" },
    { image: "/images/sohub_protect/accesories/doorbell-b100.png", name: "Smart Doorbell" },
    { image: "/images/sohub_protect/accesories/EX010-Signal-extender.png", name: "Signal Extender" },
    { image: "/images/sohub_protect/accesories/GB010-Vibration-Sensor-2.png", name: "Vibration Sensor" },
    { image: "/images/sohub_protect/accesories/GS020-Gas-Detector.png", name: "Gas Detector" },
    { image: "/images/sohub_protect/accesories/H320-SecCube.png", name: "Security Hub" },
    { image: "/images/sohub_protect/accesories/H502-Alarm panel.png", name: "Alarm Panel" },
    { image: "/images/sohub_protect/accesories/H700 Alarm panel.png", name: "Advanced Panel" },
    { image: "/images/sohub_protect/accesories/Motion_pr200.png", name: "Motion Sensor" },
    { image: "/images/sohub_protect/accesories/shutter_sensor_ss010.png", name: "Shutter Sensor" },
    { image: "/images/sohub_protect/accesories/WSR101-Wireless_siren.png", name: "Wireless Siren" },
  ];

  useEffect(() => {
    if (!api) {
      return;
    }

    const timer = setTimeout(() => {
      if (api.selectedScrollSnap() + 1 === api.scrollSnapList().length) {
        setCurrent(0);
        api.scrollTo(0, false);
      } else {
        api.scrollNext();
        setCurrent(current + 1);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [api, current]);

  return (
    <section id="sohub-protect" className="pt-24 pb-16 md:pt-32 md:pb-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex flex-col gap-8 md:gap-12">
          <div className="w-full">
            <img 
              src="/images/sohub_protect/banner/banner.jpg" 
              alt="Smart Home Security Banner"
              className="w-full h-auto rounded-lg"
            />
          </div>
          
          <Carousel setApi={setApi} className="w-full">
            <CarouselContent>
              {products.map((product, index) => (
                <CarouselItem className="basis-1/2 md:basis-1/4 lg:basis-1/6" key={index}>
                  <div className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300 aspect-square">
                    <div className="w-24 h-24 md:w-28 md:h-28 mb-4 flex items-center justify-center">
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-700 font-medium">{product.name}</div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      </div>
    </section>
  );
};

export default TrustedBySection;