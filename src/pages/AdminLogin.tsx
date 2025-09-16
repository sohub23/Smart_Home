import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Home, Lock, User, Wifi, Smartphone } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Admin credentials check using environment variables
    const adminUsername = import.meta.env.VITE_ADMIN_USERNAME || 'admin';
    const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123';
    
    console.log('Expected:', { adminUsername, adminPassword });
    console.log('Entered:', { username: formData.username, password: formData.password });
    
    if (formData.username === adminUsername && formData.password === adminPassword) {
      localStorage.setItem('adminLoggedIn', 'true');
      toast({
        title: "Login Successful",
        description: "Welcome to the admin dashboard!",
      });
      window.location.assign('/admin');
    } else {
      toast({
        title: "Login Failed",
        description: "Invalid username or password.",
        variant: "destructive"
      });
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-purple-500/10 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-green-500/10 rounded-full blur-xl animate-pulse delay-500"></div>
      </div>
      
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/6 opacity-20 animate-bounce">
          <Home className="w-8 h-8 text-white" />
        </div>
        <div className="absolute top-3/4 right-1/6 opacity-20 animate-bounce delay-300">
          <Wifi className="w-6 h-6 text-white" />
        </div>
        <div className="absolute bottom-1/4 left-1/3 opacity-20 animate-bounce delay-700">
          <Smartphone className="w-7 h-7 text-white" />
        </div>
      </div>
      
      <Card className="w-full max-w-xl border-0 shadow-2xl bg-white/5 backdrop-blur-2xl relative z-10 border border-white/10 rounded-3xl">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-24 h-24 bg-gradient-to-br from-white/10 to-white/5 rounded-3xl flex items-center justify-center mb-8 shadow-2xl border border-white/30 backdrop-blur-sm">
            <img 
              src="/assets/navbar_imgaes.png" 
              alt="Smart Home Logo" 
              className="w-16 h-16 object-contain filter brightness-0 invert"
            />
          </div>
          <CardTitle className="text-4xl font-bold text-white mb-3 tracking-tight">
            Smart Home
          </CardTitle>
          <p className="text-gray-300 text-lg font-light mb-6">
            Control Center
          </p>
          <div className="flex items-center justify-center space-x-3 mb-2">
            <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50"></div>
            <span className="text-emerald-400 text-base font-medium tracking-wide">System Online</span>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-base font-medium text-gray-200 tracking-wide">
                Administrator
              </Label>
              <div className="relative group">
                <User className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6 group-focus-within:text-emerald-400 transition-all duration-300" />
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter username"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  className="pl-16 h-16 bg-white/5 border-white/10 text-white text-lg placeholder:text-gray-500 focus:border-emerald-400/50 focus:bg-white/10 backdrop-blur-md transition-all duration-300 rounded-2xl shadow-inner"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-base font-medium text-gray-200 tracking-wide">
                Security Key
              </Label>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6 group-focus-within:text-emerald-400 transition-all duration-300" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="pl-16 pr-16 h-16 bg-white/5 border-white/10 text-white text-lg placeholder:text-gray-500 focus:border-emerald-400/50 focus:bg-white/10 backdrop-blur-md transition-all duration-300 rounded-2xl shadow-inner"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-emerald-400 transition-all duration-300"
                >
                  {showPassword ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
                </button>
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-16 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold text-lg border-0 transition-all duration-500 transform hover:scale-[1.02] hover:shadow-2xl hover:shadow-emerald-500/25 rounded-2xl mt-8"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span className="tracking-wide">Authenticating...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Home className="w-6 h-6" />
                  <span className="tracking-wide">Enter Control Center</span>
                </div>
              )}
            </Button>
          </form>

        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;