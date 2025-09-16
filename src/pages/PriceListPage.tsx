import { useState, useEffect, useMemo } from 'react';
import { Download, Mail, Phone, Search, Filter, ChevronLeft, ChevronRight, FileText, Zap, Home, Shield, Lightbulb, Eye, List, Grid3X3 } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RainbowButton } from '@/components/ui/rainbow-button';
import { toast } from '@/components/ui/use-toast';
import { priceListService, PriceListItem } from '@/services/priceList';

const PriceListPage = () => {
  const [priceList, setPriceList] = useState<PriceListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('default');
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;

  const categories = useMemo(() => {
    const cats = Array.from(new Set(priceList.map(item => item.category)));
    return ['all', ...cats];
  }, [priceList]);

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = priceList.filter(item => {
      const matchesSearch = 
        item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.variant.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.productName.localeCompare(b.productName);
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'default':
          return parseInt(a.id) - parseInt(b.id);
        default:
          return parseInt(a.id) - parseInt(b.id);
      }
    });

    return filtered;
  }, [priceList, searchTerm, selectedCategory, sortBy]);

  const totalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage);
  const paginatedProducts = filteredAndSortedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    const fetchPriceList = async () => {
      try {
        setLoading(true);
        console.log('Starting to fetch price list...');
        const data = await priceListService.getPriceList();
        console.log('Received data from service:', data.length, 'items');
        setPriceList(data);
      } catch (error) {
        console.error('Error fetching price list:', error);
        toast({
          title: "Error",
          description: "Failed to load price list from database.",
          variant: "destructive",
        });
        setPriceList([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPriceList();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, sortBy]);

  const exportToCSV = () => {
    const headers = ['#', 'Product Name', 'Category', 'Variant', 'Protocol', 'Price (BDT)'];
    const csvContent = [
      headers.join(','),
      ...filteredAndSortedProducts.map((item, index) => 
        `"${index + 1}","${item.productName}","${item.category}","${item.variant}","${item.protocol}","${item.price}"`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'sohub-price-list.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Price List - Sohub Smart Home</title>
        <style>
          body { font-family: 'Inter', sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #eee; padding-bottom: 20px; }
          .logo-img { width: 120px; height: auto; margin-bottom: 15px; }
          .subtitle { color: #666; margin-top: 5px; font-size: 16px; }
          .date { color: #888; font-size: 14px; margin-top: 10px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
          th { background-color: #f8f9fa; font-weight: 600; color: #333; }
          .price { text-align: right; font-weight: 600; }
          .footer { margin-top: 30px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #eee; padding-top: 20px; }
          .footer-logo { margin-bottom: 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <img src="/assets/navbar_imgaes.png" alt="Sohub Smart Home" class="logo-img" onerror="this.style.display='none'">
          <div class="subtitle">Product Price List</div>
          <div class="date">Generated on ${new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</div>
        </div>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Product Name</th>
              <th>Category</th>
              <th>Variant</th>
              <th>Protocol</th>
              <th class="price">Price (BDT)</th>
            </tr>
          </thead>
          <tbody>
            ${filteredAndSortedProducts.map((item, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${item.productName}</td>
                <td>${item.category}</td>
                <td>${item.variant}</td>
                <td>${item.protocol}</td>
                <td class="price">${item.price.toLocaleString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="footer">
          <div class="footer-logo">
            <img src="/assets/footer_logo.png" alt="SOHUB" style="height: 20px; width: auto;" onerror="this.style.display='none'">
          </div>
          <p><strong>Contact:</strong> +88 09678-076482 | hello@sohub.com.bd | home.sohub.com.bd</p>
          <p style="margin-top: 10px; font-style: italic;">* Prices are subject to change without notice. Installation charges may apply separately.</p>
        </div>
      </body>
      </html>
    `;
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const getProductIcon = (category: string) => {
    switch (category) {
      case 'Smart Switches':
        return <Zap className="w-4 h-4 text-blue-600" />;
      case 'Smart Curtains':
        return <Home className="w-4 h-4 text-green-600" />;
      case 'Security Systems':
        return <Shield className="w-4 h-4 text-red-600" />;
      case 'Smart Lighting':
        return <Lightbulb className="w-4 h-4 text-yellow-600" />;
      case 'Smart Glass':
        return <Eye className="w-4 h-4 text-purple-600" />;
      default:
        return <Zap className="w-4 h-4 text-gray-600" />;
    }
  };

  useEffect(() => {
    document.title = 'Price List - Sohub Smart Home';
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-16">
        {/* Header Section */}
        <section className="section-padding bg-gradient-hero">
          <div className="container-width">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-display mb-6">Price List</h1>
              <p className="text-body-large mb-8">
                Transparent pricing for all our smart home products. Get the best value for premium quality.
              </p>
              
              {/* Filters */}
              <div className="space-y-4 mb-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent side="bottom" className="bg-white">
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category === 'all' ? 'All Categories' : category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default Order</SelectItem>
                      <SelectItem value="name">Name A-Z</SelectItem>
                      <SelectItem value="price-low">Price Low-High</SelectItem>
                      <SelectItem value="price-high">Price High-Low</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <div className="flex gap-2 sm:col-span-2 lg:col-span-1">
                    <Button onClick={exportToCSV} variant="outline" className="flex-1 h-12">
                      <Download className="w-4 h-4 mr-2" />
                      CSV
                    </Button>
                    <Button onClick={exportToPDF} variant="outline" className="flex-1 h-12">
                      <FileText className="w-4 h-4 mr-2" />
                      PDF
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Price List Section */}
        <section className="py-8 md:py-12">
          <div className="container mx-auto px-4 md:px-8 lg:px-16 xl:px-24">
            {/* View Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="text-sm text-gray-600">
                Showing {filteredAndSortedProducts.length} products
              </div>
              
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="flex items-center gap-2"
                >
                  <List className="w-4 h-4" />
                  List
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="flex items-center gap-2"
                >
                  <Grid3X3 className="w-4 h-4" />
                  Cards
                </Button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-soft border border-gray-100 overflow-hidden">
              {/* Desktop Header - Only show in list view */}
              {viewMode === 'list' && (
                <div className="hidden md:block bg-gray-50 border-b border-gray-200">
                  <div className="grid px-6 py-4" style={{gridTemplateColumns: '60px 1fr 150px 120px 100px 120px'}}>
                    <div className="font-semibold text-sm text-gray-900 uppercase tracking-wide">#</div>
                    <div className="font-semibold text-sm text-gray-900 uppercase tracking-wide">Product Name</div>
                    <div className="font-semibold text-sm text-gray-900 uppercase tracking-wide">Category</div>
                    <div className="font-semibold text-sm text-gray-900 uppercase tracking-wide">Variant</div>
                    <div className="font-semibold text-sm text-gray-900 uppercase tracking-wide">Protocol</div>
                    <div className="font-semibold text-sm text-gray-900 uppercase tracking-wide text-right">Price (BDT)</div>
                  </div>
                </div>
              )}

              {/* Price Items */}
              <div className={viewMode === 'list' ? 'divide-y divide-gray-100' : 'p-6'}>
                {/* Card System */}
                {viewMode === 'grid' && !loading && paginatedProducts.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {paginatedProducts.map((item, index) => (
                      <div key={item.id} className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group">
                        {/* Card Header */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 group-hover:from-blue-100 group-hover:to-indigo-100 transition-colors">
                              {getProductIcon(item.category)}
                            </div>
                            <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-1 rounded-full">#{((currentPage - 1) * itemsPerPage) + index + 1}</span>
                          </div>
                        </div>
                        
                        {/* Product Name */}
                        <h3 className="font-bold text-lg text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                          {item.productName}
                        </h3>
                        
                        {/* Product Details */}
                        <div className="space-y-3 mb-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-500">Category</span>
                            <span className="text-sm font-semibold text-gray-700 bg-gray-50 px-2 py-1 rounded-md">{item.category}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-500">Variant</span>
                            <span className="text-sm font-semibold text-gray-700">{item.variant}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-500">Protocol</span>
                            <span className="text-xs font-bold text-white bg-gradient-to-r from-green-400 to-blue-500 px-2 py-1 rounded-full">{item.protocol}</span>
                          </div>
                        </div>
                        
                        {/* Price Section */}
                        <div className="border-t border-gray-100 pt-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-500">Price</span>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                {item.price.toLocaleString()}
                              </div>
                              <div className="text-xs text-gray-500 font-medium">BDT</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* List View */}
                {viewMode === 'list' && (
                  <>
                    {loading ? (
                      <div className="px-6 py-12 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading price list...</p>
                      </div>
                    ) : paginatedProducts.length === 0 ? (
                      <div className="px-6 py-12 text-center">
                        <p className="text-gray-600">No products found matching your criteria.</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-100">
                        {paginatedProducts.map((item, index) => (
                          <div key={item.id} className="hover:bg-gray-50 transition-colors duration-200">
                            {/* Mobile Card Layout */}
                            <div className="md:hidden px-4 py-5">
                              <div className="flex justify-between items-start mb-3">
                                <div className="flex-1 pr-4">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm font-medium text-gray-500">#{((currentPage - 1) * itemsPerPage) + index + 1}</span>
                                    {getProductIcon(item.category)}
                                    <h3 className="font-semibold text-base text-gray-900 leading-tight">
                                      {item.productName}
                                    </h3>
                                  </div>
                                  <p className="text-sm text-gray-600">
                                    {item.category}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <div className="text-lg font-bold text-gray-900">
                                    {item.price.toLocaleString()}
                                  </div>
                                </div>
                              </div>
                              <div className="space-y-2 pt-3 border-t border-gray-100">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-gray-500">Variant:</span>
                                  <span className="text-sm font-medium text-gray-700">{item.variant}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-gray-500">Protocol:</span>
                                  <span className="text-sm font-medium text-gray-700">{item.protocol}</span>
                                </div>
                              </div>
                            </div>

                            {/* Desktop Grid Layout */}
                            <div className="hidden md:grid px-6 py-5" style={{gridTemplateColumns: '60px 1fr 150px 120px 100px 120px'}}>
                              <div className="text-sm font-medium text-gray-500">
                                {((currentPage - 1) * itemsPerPage) + index + 1}
                              </div>
                              <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                                {getProductIcon(item.category)}
                                {item.productName}
                              </div>
                              <div className="text-sm text-gray-600">
                                {item.category}
                              </div>
                              <div className="text-sm text-gray-600">
                                {item.variant}
                              </div>
                              <div className="text-sm text-gray-600">
                                {item.protocol}
                              </div>
                              <div className="text-sm font-semibold text-gray-900 text-right">
                                {item.price.toLocaleString()}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
                
                {/* Loading and Empty States for Card System */}
                {viewMode === 'grid' && loading && (
                  <div className="text-center py-16">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading cards...</p>
                  </div>
                )}
                
                {viewMode === 'grid' && !loading && paginatedProducts.length === 0 && (
                  <div className="text-center py-16">
                    <div className="bg-gray-50 rounded-xl p-8 max-w-md mx-auto">
                      <Grid3X3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 font-medium">No products found matching your criteria.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
                  {/* Mobile Pagination */}
                  <div className="md:hidden">
                    <div className="text-center text-sm text-gray-600 mb-4">
                      Page {currentPage} of {totalPages} ({filteredAndSortedProducts.length} products)
                    </div>
                    <div className="flex justify-center gap-2">
                      <Button
                        variant="outline"
                        className="flex-1 max-w-[120px] h-12"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="w-4 h-4 mr-2" />
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 max-w-[120px] h-12"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>

                  {/* Desktop Pagination */}
                  <div className="hidden md:flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedProducts.length)} of {filteredAndSortedProducts.length} products
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <span className="text-sm font-medium px-3 py-1 bg-white rounded border">
                        {currentPage} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Note */}
              <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
                <p className="text-sm text-gray-600 text-center">
                  * Prices are subject to change without notice. Installation and customization charges may apply separately.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-12 md:py-16 bg-gradient-section">
          <div className="container-width">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-headline mb-6">Need a Custom Quote?</h2>
              <p className="text-body-large mb-8">
                Get personalized pricing for your smart home project. Our experts are ready to help you build the perfect solution.
              </p>
              
              <RainbowButton 
                onClick={() => window.location.href = '/contact'}
                className="px-8 py-4 text-lg font-semibold"
              >
                Contact Us Now
              </RainbowButton>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default PriceListPage;