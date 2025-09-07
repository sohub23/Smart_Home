import { useState, useEffect } from 'react';
import { supabase } from '@/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff } from 'lucide-react';

const ConnectionStatus = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const { data, error } = await supabase.from('product_categories').select('count').limit(1);
      
      if (error) {
        setIsConnected(false);
        setError(error.message);
      } else {
        setIsConnected(true);
        setError('');
      }
    } catch (err) {
      setIsConnected(false);
      setError(err instanceof Error ? err.message : 'Connection failed');
    }
  };

  if (isConnected === null) {
    return (
      <Badge variant="outline" className="flex items-center space-x-1">
        <Wifi className="w-3 h-3 animate-pulse" />
        <span>Checking...</span>
      </Badge>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <Badge 
        variant={isConnected ? "default" : "destructive"}
        className="flex items-center space-x-1"
      >
        {isConnected ? (
          <>
            <Wifi className="w-3 h-3" />
            <span>Connected</span>
          </>
        ) : (
          <>
            <WifiOff className="w-3 h-3" />
            <span>Disconnected</span>
          </>
        )}
      </Badge>
      {error && (
        <span className="text-xs text-red-600 max-w-xs truncate" title={error}>
          {error}
        </span>
      )}
    </div>
  );
};

export default ConnectionStatus;