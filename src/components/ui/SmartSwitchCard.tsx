import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SmartSwitchCardProps {
  imageUrl: string;
  name: string;
  price: string;
  gangType?: string;
  isSoldOut?: boolean;
  onAdd?: () => void;
  onClick?: () => void;
}

export function SmartSwitchCard({ 
  imageUrl, 
  name, 
  price, 
  gangType, 
  isSoldOut, 
  onAdd,
  onClick 
}: SmartSwitchCardProps) {
  return (
    <div 
      className={cn(
        "rounded-xl shadow-md p-4 bg-white transition-all duration-200 cursor-pointer relative",
        "hover:scale-[1.02] hover:shadow-lg",
        isSoldOut && "opacity-75"
      )}
      onClick={onClick}
    >
      {/* Gang Type Badge */}
      {gangType && (
        <div className="absolute top-2 left-2 bg-gray-200 text-xs px-2 py-1 rounded-md z-10">
          {gangType}
        </div>
      )}
      
      {/* Sold Out Badge */}
      {isSoldOut && (
        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-md z-10">
          SOLD OUT
        </div>
      )}
      
      {/* Product Image */}
      <div className="h-32 flex items-center justify-center mb-3">
        <img 
          src={imageUrl} 
          alt={name}
          className="h-full w-full object-contain"
        />
      </div>
      
      {/* Product Name */}
      <h3 className="text-sm font-medium truncate text-center mt-2">
        {name}
      </h3>
      
      {/* Price */}
      <p className="text-lg font-bold text-center mt-1">
        {price}
      </p>
      
      {/* Add Button */}
      <div className="flex justify-center mt-3">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAdd?.();
          }}
          disabled={isSoldOut}
          className={cn(
            "w-8 h-8 rounded-full border flex items-center justify-center transition-colors",
            isSoldOut 
              ? "border-gray-300 text-gray-300 cursor-not-allowed"
              : "border-gray-400 text-gray-600 hover:border-black hover:text-black"
          )}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}