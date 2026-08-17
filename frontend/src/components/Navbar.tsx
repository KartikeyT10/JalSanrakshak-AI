import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Droplets, Menu, X } from 'lucide-react';
import waterIcon from '@/assets/water-icon.png';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled 
        ? 'bg-white/95 backdrop-blur-xl shadow-md border-b border-gray-100' 
        : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <img 
                src={waterIcon} 
                alt="JalSanrakshak AI" 
                className="h-9 w-9 relative z-10 transition-transform duration-300 group-hover:scale-110" 
              />
            </div>
            <span className={`text-2xl font-extrabold tracking-tight transition-colors duration-300 ${
              scrolled 
                ? 'bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent' 
                : 'text-white'
            }`}>
              JalSanrakshak AI
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {['Home', 'Assessment', 'About'].map((item) => (
              <Link 
                key={item}
                to={item === 'Home' ? '/' : `/${item.toLowerCase()}`}
                className={`text-sm font-medium tracking-wide transition-colors duration-200 ${
                  scrolled 
                    ? 'text-gray-600 hover:text-blue-600' 
                    : 'text-white/80 hover:text-white'
                }`}
              >
                {item}
              </Link>
            ))}
            <Link to="/assessment">
              <Button size="default" className={`rounded-full px-6 font-semibold transition-all duration-300 ${
                scrolled 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25' 
                  : 'bg-white/15 backdrop-blur-md text-white border border-white/30 hover:bg-white/25'
              }`}>
                <Droplets className="mr-2 h-4 w-4" />
                Start Assessment
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              className={`rounded-full ${scrolled ? 'text-gray-900' : 'text-white'}`}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-4 space-y-4">
            <Link 
              to="/" 
              className="block text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/assessment" 
              className="block text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Assessment
            </Link>
            <Link 
              to="/about" 
              className="block text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            <Button className="w-full rounded-full bg-blue-600 hover:bg-blue-700">
              <Droplets className="mr-2 h-4 w-4" />
              Start Assessment
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;