import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Bell, RefreshCw, User, Settings, LogOut, Shield, Key, HelpCircle, UserCog, Menu, X } from 'lucide-react';
import { useState } from 'react';
import navbarLogo from '@/assets/navbar_imgaes.png';

const AdminNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/admin', label: 'Dashboard' },
    { path: '/admin/orders', label: 'Orders' },
    { path: '/admin/products-enhanced', label: 'Products' },
    { path: '/admin/categories-enhanced', label: 'Categories' },
    { path: '/admin/customers', label: 'Customers' },
    { path: '/admin/reports', label: 'Reports' },
    { path: '/admin/users', label: 'Users' },
  ];

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-50 shadow-sm">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-3">
            <img src={navbarLogo} alt="Smart Home" className="h-10 w-auto" />
            <Badge className="px-3 py-1 text-sm font-medium bg-[#0a1d3a] text-white">
              Admin Panel
            </Badge>
          </div>
          <nav className="hidden lg:flex space-x-1">
            {navItems.map((item) => (
              <Button 
                key={item.path}
                variant="ghost" 
                className={`px-4 py-2 rounded-lg transition-colors ${
                  isActive(item.path) 
                    ? 'bg-[#0a1d3a] text-white' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
                onClick={() => navigate(item.path)}
              >
                {item.label}

              </Button>
            ))}
          </nav>
          
          {/* Mobile Menu Button */}
          <button 
            className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        <div className="flex items-center space-x-2 md:space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center space-x-2 border-gray-200 hover:bg-gray-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#0a1d3a]' : 'text-gray-600'}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <div className="hidden md:flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="relative hover:bg-gray-100 rounded-full p-2">
              <Bell className="w-5 h-5 text-gray-600" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
            </Button>
            <Button variant="ghost" size="sm" className="hover:bg-gray-100 rounded-full p-2">
              <Settings className="w-5 h-5 text-gray-600" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-8 h-8 p-0 rounded-full">
                  <div className="w-8 h-8 bg-[#0a1d3a] rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 mr-4 mt-2 shadow-lg bg-white">
                <div className="px-4 py-3 bg-gray-50 border-b">
                  <p className="text-sm font-semibold text-gray-900">Admin User</p>
                  <p className="text-xs text-gray-600">admin@smartcurtain.com</p>
                </div>
                <div className="py-2">
                  <DropdownMenuItem className="cursor-pointer px-4 py-2">
                    <UserCog className="w-4 h-4 mr-3 text-[#0a1d3a]" />
                    <span className="text-sm font-medium">Profile Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer px-4 py-2">
                    <Settings className="w-4 h-4 mr-3 text-gray-600" />
                    <span className="text-sm font-medium">System Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer px-4 py-2">
                    <Key className="w-4 h-4 mr-3 text-orange-600" />
                    <span className="text-sm font-medium">Change Password</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer px-4 py-2">
                    <Shield className="w-4 h-4 mr-3 text-green-600" />
                    <span className="text-sm font-medium">Security</span>
                  </DropdownMenuItem>
                </div>
                <DropdownMenuSeparator className="my-1" />
                <div className="py-2">
                  <DropdownMenuItem className="cursor-pointer px-4 py-2">
                    <HelpCircle className="w-4 h-4 mr-3 text-[#0a1d3a]" />
                    <span className="text-sm font-medium">Help & Support</span>
                  </DropdownMenuItem>
                </div>
                <DropdownMenuSeparator className="my-1" />
                <div className="py-2">
                  <DropdownMenuItem 
                    className="cursor-pointer px-4 py-2 text-red-600 hover:bg-red-50 focus:bg-red-50 focus:text-red-600"
                    onClick={(e) => {
                      e.preventDefault();
                      localStorage.removeItem('adminLoggedIn');
                      window.location.href = '/admin/login';
                    }}
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    <span className="text-sm font-medium">Sign Out</span>
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
        
        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-200 shadow-lg">
            <div className="px-4 py-4 space-y-2">
              {navItems.map((item) => (
                <Button 
                  key={item.path}
                  variant="ghost" 
                  className={`w-full justify-start px-4 py-3 rounded-lg transition-colors ${
                    isActive(item.path) 
                      ? 'bg-[#0a1d3a] text-white' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                  onClick={() => {
                    navigate(item.path);
                    setIsMobileMenuOpen(false);
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </div>
          </div>
        )}
    </header>
  );
};

export default AdminNavbar;