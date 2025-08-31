import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Home, Building, Briefcase, Plus, Minus } from 'lucide-react';

const setupTypes = [
  { id: 'apartment', name: 'Apartment', icon: Building, desc: 'Perfect for 1-3 bedroom apartments' },
  { id: 'house', name: 'House', icon: Home, desc: 'Ideal for independent houses' },
  { id: 'office', name: 'Office', icon: Briefcase, desc: 'Commercial smart solutions' }
];

const deviceCategories = [
  { id: 'switches', name: 'Smart Switches', price: 2500, desc: 'Personalized engraving available' },
  { id: 'locks', name: 'Smart Door Locks', price: 15000, desc: 'Keyless entry system' },
  { id: 'cameras', name: 'Security Cameras', price: 8000, desc: 'Live monitoring 24/7' },
  { id: 'sensors', name: 'Smart Sensors', price: 3500, desc: 'Motion, smoke, gas detection' },
  { id: 'hubs', name: 'Voice Control Hubs', price: 12000, desc: 'Central control system' }
];

const SmartHomeConfigurator = () => {
  const [selectedSetup, setSelectedSetup] = useState('');
  const [selectedDevices, setSelectedDevices] = useState<Record<string, number>>({});
  const [showEngraving, setShowEngraving] = useState(false);

  const updateDeviceCount = (deviceId: string, change: number) => {
    setSelectedDevices(prev => ({
      ...prev,
      [deviceId]: Math.max(0, (prev[deviceId] || 0) + change)
    }));
  };

  const deviceMap = useMemo(() => 
    deviceCategories.reduce((map, device) => ({ ...map, [device.id]: device }), {}), []
  );

  const totalPrice = Object.entries(selectedDevices).reduce((total, [deviceId, count]) => {
    const device = deviceMap[deviceId as keyof typeof deviceMap];
    return total + (device?.price || 0) * count;
  }, 0);

  return (
    <section className="section-padding bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container-width px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-headline text-primary mb-4">Build Your Smart Home</h2>
          <p className="text-body text-muted-foreground">Configure your perfect smart home setup in minutes</p>
        </div>

        {/* Step 1: Choose Setup */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">1. Choose Your Setup</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {setupTypes.map((setup) => (
              <Card 
                key={setup.id}
                className={`cursor-pointer transition-all ${selectedSetup === setup.id ? 'ring-2 ring-blue-500' : ''}`}
                onClick={() => setSelectedSetup(setup.id)}
              >
                <CardContent className="p-6 text-center">
                  <setup.icon className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                  <h4 className="font-semibold">{setup.name}</h4>
                  <p className="text-sm text-muted-foreground">{setup.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Step 2: Select Devices */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">2. Select Devices</h3>
          <div className="space-y-4">
            {deviceCategories.map((device) => (
              <Card key={device.id}>
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">{device.name}</h4>
                    <p className="text-sm text-muted-foreground">{device.desc}</p>
                    <Badge variant="secondary">৳{device.price.toLocaleString()}</Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => updateDeviceCount(device.id, -1)}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-8 text-center">{selectedDevices[device.id] || 0}</span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => updateDeviceCount(device.id, 1)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Step 3: Personalization */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">3. Personalize Your Devices</h3>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">Switch Engraving Service</h4>
                  <p className="text-sm text-muted-foreground">Customize labels for each switch</p>
                </div>
                <Button 
                  variant={showEngraving ? "default" : "outline"}
                  onClick={() => setShowEngraving(!showEngraving)}
                >
                  {showEngraving ? 'Added' : 'Add Engraving'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Step 4: Quote & Services */}
        <div className="bg-white rounded-lg p-6 border">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Your Quote</h3>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">৳{totalPrice.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">or ৳{Math.round(totalPrice/12).toLocaleString()}/month</div>
            </div>
          </div>
          
          <div className="space-y-3 mb-6">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              <span className="text-sm">Professional Installation (+৳2,000)</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              <span className="text-sm">Free Consultation (Worth ৳1,500)</span>
            </label>
          </div>

          <div className="flex gap-4">
            <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
              Build My Smart Home Now
            </Button>
            <Button variant="outline" className="flex-1">
              Book Free Consultation
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SmartHomeConfigurator;