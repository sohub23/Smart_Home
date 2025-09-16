import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { RainbowButton } from '@/components/ui/rainbow-button';


const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
      
      // Check which section is currently visible
      if (location.pathname === '/') {
        const sections = ['hero', 'specs', 'sohub-protect', 'gallery', 'compare', 'faq'];
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

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Check initial state
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  const handleNavigation = (sectionId: string) => {
    setIsMobileMenuOpen(false);
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        scrollToSection(sectionId);
      }, 200);
    } else {
      scrollToSection(sectionId);
    }
  };

  const scrollToSection = (sectionId: string) => {
    if (sectionId === 'order') {
      const productSection = document.querySelector('[data-main-container]');
      if (productSection) {
        const rect = productSection.getBoundingClientRect();
        const offsetTop = window.pageYOffset + rect.top - 80;
        window.scrollTo({ top: offsetTop, behavior: 'smooth' });
      }
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        const rect = element.getBoundingClientRect();
        const offsetTop = window.pageYOffset + rect.top - 80;
        window.scrollTo({ top: offsetTop, behavior: 'smooth' });
      }
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-200 shadow-lg transition-all duration-300">
      <div className="container-width">
        <div className="flex items-center justify-between h-12 px-4 md:px-6">
          {/* Logo */}
          <div 
            className="flex items-center cursor-pointer group"
            onClick={() => {
              navigate('/');
              setTimeout(() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }, 100);
            }}
          >
            <img 
              src="/assets/navbar_imgaes.png" 
              alt="Curtain Luxe" 
              className="h-10 w-auto transition-opacity group-hover:opacity-80"
            />
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => handleNavigation('specs')}
              className={`text-sm transition-colors hover:text-black text-black ${
                activeSection === 'specs' ? 'font-bold' : 'font-medium'
              }`}
            >
              Specs
            </button>
            <button 
              onClick={() => handleNavigation('sohub-protect')}
              className={`text-sm transition-colors hover:text-black text-black ${
                activeSection === 'sohub-protect' ? 'font-bold' : 'font-medium'
              }`}
            >
              Sohub Protect
            </button>
            <button 
              onClick={() => {
                setIsMobileMenuOpen(false);
                navigate('/gallery');
              }}
              className={`text-sm transition-colors hover:text-black text-black ${
                location.pathname === '/gallery' ? 'font-bold' : 'font-medium'
              }`}
            >
              Gallery
            </button>
            <button 
              onClick={() => handleNavigation('faq')}
              className={`text-sm transition-colors hover:text-black text-black ${
                activeSection === 'faq' ? 'font-bold' : 'font-medium'
              }`}
            >
              FAQ
            </button>
            <button 
              onClick={() => navigate('/built-for-comfort')}
              className={`text-sm transition-colors hover:text-black text-black ${
                location.pathname === '/built-for-comfort' ? 'font-bold' : 'font-medium'
              }`}
            >
              #BuiltForComfort
            </button>
          </div>

          {/* CTA Button - Desktop */}
          <RainbowButton 
            onClick={() => handleNavigation('order')}
            className="hidden md:block px-2 py-1 text-xs h-8 rounded-md font-semibold"
          >
            Build / Buy Now
          </RainbowButton>

          {/* Mobile Actions */}
          <div className="md:hidden flex items-center gap-3">
            <RainbowButton 
              onClick={() => handleNavigation('order')}
              className="px-2 text-xs rounded-md font-semibold h-6"
            >
              Build / Buy
            </RainbowButton>
            <button 
              className="p-2 text-gray-900 ml-1"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
            <div className="px-4 py-4 space-y-4">
              <button 
                onClick={() => handleNavigation('specs')}
                className="block w-full text-left py-2 text-black hover:text-black font-medium"
              >
                Specs
              </button>
              <button 
                onClick={() => handleNavigation('sohub-protect')}
                className="block w-full text-left py-2 text-black hover:text-black font-medium"
              >
                Sohub Protect
              </button>
              <button 
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  navigate('/gallery');
                }}
                className="block w-full text-left py-2 text-black hover:text-black font-medium"
              >
                Gallery
              </button>
              <button 
                onClick={() => handleNavigation('faq')}
                className="block w-full text-left py-2 text-black hover:text-black font-medium"
              >
                FAQ
              </button>
              <button 
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  navigate('/built-for-comfort');
                }}
                className="block w-full text-left py-2 text-black hover:text-black font-medium"
              >
                #BuiltForComfort
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;