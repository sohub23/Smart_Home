import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Phone, Mail, MapPin, CreditCard, Smartphone } from 'lucide-react';
import navbarLogo from '@/assets/navbar_imgaes.png';
import footerLogo from '@/assets/footer_logo.png';

const Footer = () => {
  const [activeSection, setActiveSection] = useState('');
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (location.pathname === '/') {
        const sections = ['specs', 'gallery', 'compare', 'faq'];
        const currentSection = sections.find(section => {
          const element = document.getElementById(section);
          if (element) {
            const rect = element.getBoundingClientRect();
            return rect.top <= 100 && rect.bottom >= 100;
          }
          return false;
        });
        setActiveSection(currentSection || '');
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-gray-100 text-gray-900">
      <div className="container-width px-4 md:px-6 py-8 md:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {/* Left: Logo & Brand */}
          <div className="space-y-4">
            <div>
              <img 
                src={navbarLogo} 
                alt="Curtain Luxe" 
                className="h-8 w-auto mb-2"
              />
              <p className="text-sm text-gray-700 mb-2">
                Smart Comfort. Designed for You.
              </p>
              <p className="text-xs text-gray-600 mb-4">
                Part of #BuiltForComfort
              </p>
              <a 
                href="https://sohub.com.bd" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-gray-600 hover:text-gray-900 transition-colors flex items-center space-x-2"
              >
                <img src={footerLogo} alt="SOHUB" className="h-4 w-auto" />
                <span>Powered by SOHUB</span>
              </a>
            </div>
            
            {/* Social Icons */}
            <div className="flex space-x-4">
              <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button 
                  onClick={() => scrollToSection('specs')}
                  className={`hover:text-gray-900 transition-colors ${
                    activeSection === 'specs' ? 'text-black font-bold' : 'text-gray-700'
                  }`}
                >
                  Specs
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('gallery')}
                  className={`hover:text-gray-900 transition-colors ${
                    activeSection === 'gallery' ? 'text-black font-bold' : 'text-gray-700'
                  }`}
                >
                  Gallery
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('compare')}
                  className={`hover:text-gray-900 transition-colors ${
                    activeSection === 'compare' ? 'text-black font-bold' : 'text-gray-700'
                  }`}
                >
                  Compare
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('faq')}
                  className={`hover:text-gray-900 transition-colors ${
                    activeSection === 'faq' ? 'text-black font-bold' : 'text-gray-700'
                  }`}
                >
                  FAQ
                </button>
              </li>
              <li>
                <a href="/built-for-comfort" className={`hover:text-gray-900 transition-colors ${
                  location.pathname === '/built-for-comfort' ? 'text-black font-bold' : 'text-gray-700'
                }`}>
                  #BuiltForComfort
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/contact" className={`hover:text-gray-900 transition-colors ${
                  location.pathname === '/contact' ? 'text-black font-bold' : 'text-gray-700'
                }`}>
                  Contact Us
                </a>
              </li>
              <li>
                <a href="/about" className={`hover:text-gray-900 transition-colors ${
                  location.pathname === '/about' ? 'text-black font-bold' : 'text-gray-700'
                }`}>
                  About Us
                </a>
              </li>
              <li>
                <a href="/track-order" className={`hover:text-gray-900 transition-colors ${
                  location.pathname === '/track-order' ? 'text-black font-bold' : 'text-gray-700'
                }`}>
                  Track Order
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            
            {/* Contact Info */}
            <div className="space-y-2 text-sm">
              <div className="flex items-start space-x-2">
                <Phone className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
                <a href="tel:+8809678076482" className="text-gray-700 hover:text-gray-900 transition-colors">+88 09678-076482</a>
              </div>
              <div className="flex items-start space-x-2">
                <Mail className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
                <a href="mailto:hello@sohub.com.bd" className="text-gray-700 hover:text-gray-900 transition-colors">hello@sohub.com.bd</a>
              </div>
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">
                  Flat #C2, House #29, Kaderabad, Katasur, Mohammadpur, Dhaka-1207
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Payment Methods */}
        <div className="mt-6 md:mt-8 pt-4 md:pt-6">
          <div className="text-center">
            <p className="text-xs md:text-sm text-gray-600 mb-2 md:mb-3">We Accept</p>
            <img 
              src="/src/assets/footer/payment.png" 
              alt="Payment methods - bKash, Nagad, Visa, Mastercard" 
              className="mx-auto h-5 md:h-6 lg:h-10 max-w-full"
            />
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-300">
        <div className="container-width px-4 md:px-6 py-3 md:py-4">
          <div className="flex flex-col md:flex-row justify-between items-center text-xs md:text-sm text-gray-600 space-y-2 md:space-y-0">
            <p className="text-center md:text-left">© 2025 Curtain Luxe. All rights reserved.</p>
            <a 
              href="https://sohub.com.bd" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <img src={footerLogo} alt="SOHUB" className="h-4 w-auto" />
              <span>Powered by SOHUB</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;