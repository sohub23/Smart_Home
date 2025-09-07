# Database Setup Instructions

## 1. Update Environment Configuration ✅
Your `.env.local` file has been updated with the new Supabase configuration:
```
VITE_SUPABASE_URL=https://202.59.208.112:8443/project/default
VITE_SUPABASE_ANON_KEY=Q1fTrm3zq8v5tP6dRn9b7jLpE8uQwzHgYk4tM9aC8aE
```

## 2. Database Setup
1. Access your Supabase dashboard at: `https://202.59.208.112:8443/project/default`
2. Login with:
   - Username: `supabase`
   - Password: `Sup@b4s3!Dash2025`

3. Go to SQL Editor and run the `database_setup.sql` script

## 3. Tables Created
The script will create the following tables:

### Core Tables:
- `product_categories` - Product category management
- `product_subcategories` - Product subcategory management  
- `products_new` - New product structure with advanced features
- `products` - Legacy products table (backward compatibility)
- `product_variants` - Product variants (size, type, etc.)
- `product_colors` - Product color options
- `product_images` - Product image gallery

### Business Tables:
- `orders` - Customer orders
- `quotes` - Quote requests
- `customers` - Customer information
- `users` - Admin/staff users
- `category_images` - Category display images

### Features Included:
- ✅ UUID primary keys
- ✅ Proper foreign key relationships
- ✅ Indexes for performance
- ✅ Row Level Security (RLS)
- ✅ Automatic timestamps
- ✅ Sample data insertion
- ✅ Storage bucket for images

## 4. Test Connection
After running the SQL script, restart your development server:
```bash
npm run dev
```

## 5. Admin Access
- Admin Username: `admin`
- Admin Password: `admin123` (or check your environment variables)

## 6. Troubleshooting
If you encounter connection issues:
1. Verify the Supabase server is running on Ubuntu
2. Check firewall settings for port 8443
3. Ensure SSL certificates are properly configured
4. Test the connection URL in browser first

## 7. Storage Setup
The script creates a `product-images` storage bucket. If you need to configure storage policies manually:
1. Go to Storage in Supabase dashboard
2. Create bucket named `product-images`
3. Set it as public for image access