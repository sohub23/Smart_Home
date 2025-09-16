import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/supabase';
import { Play, Eye, Heart, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const GalleryPage = () => {
  const [categories, setCategories] = useState([]);
  const [videos, setVideos] = useState([]);
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(12);
  const [selectedVideo, setSelectedVideo] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [categoriesResult, videosResult] = await Promise.all([
        supabase.from('product_categories').select('*').eq('is_active', true).order('position'),
        supabase.from('category_gallery_videos').select(`
          *,
          product_categories(name, id)
        `).eq('is_active', true).order('position')
      ]);
      
      setCategories(categoriesResult.data || []);
      setVideos(videosResult.data || []);
      setFilteredVideos(videosResult.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const extractYouTubeId = useCallback((url) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }, []);

  const filterVideos = (categoryId) => {
    setActiveCategory(categoryId);
    setVisibleCount(12);
    
    if (categoryId === 'all') {
      setFilteredVideos(videos);
    } else if (categoryId === 'uncategorized') {
      setFilteredVideos(videos.filter(video => !video.category_id));
    } else {
      setFilteredVideos(videos.filter(video => video.category_id === categoryId));
    }
  };

  const loadMore = () => {
    setVisibleCount(prev => prev + 12);
  };

  const getCategoryName = (video) => {
    if (!video.category_id) return 'General';
    return video.product_categories?.name || 'Unknown';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center h-96 pt-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="pt-20">
          <section className="section-padding bg-gradient-section">
            <div className="container-width px-4 md:px-6">
              {/* Header */}
              <div className="text-center mb-8 md:mb-12">
                <h1 className="lg:text-[2.7rem] xl:text-[3.24rem] font-semibold leading-tight tracking-tight apple-gradient-text mb-6 text-[3.24rem]" style={{lineHeight: 1.09, background: 'linear-gradient(180deg, #1f2937, #374151, #6b7280)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'}}>
                  Smart Home Gallery
                </h1>
                <p className="text-body-large text-muted-foreground max-w-2xl mx-auto mb-6" style={{background: 'linear-gradient(180deg, #1f2937, #374151, #6b7280)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'}}>
                  Explore our complete smart home solutions in action
                </p>
              </div>

              {/* Filter Categories */}
              <div className="flex flex-wrap justify-center gap-3 mb-8 md:mb-12">
                <button
                  onClick={() => filterVideos('all')}
                  className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                    activeCategory === 'all'
                      ? 'bg-gray-900 text-white shadow-lg transform scale-105'
                      : 'bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white hover:shadow-md border border-gray-200'
                  }`}
                >
                  All ({videos.length})
                </button>
                <button
                  onClick={() => filterVideos('uncategorized')}
                  className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                    activeCategory === 'uncategorized'
                      ? 'bg-gray-900 text-white shadow-lg transform scale-105'
                      : 'bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white hover:shadow-md border border-gray-200'
                  }`}
                >
                  General ({videos.filter(v => !v.category_id).length})
                </button>
                {categories.map(category => {
                  const count = videos.filter(v => v.category_id === category.id).length;
                  return (
                    <button
                      key={category.id}
                      onClick={() => filterVideos(category.id)}
                      className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                        activeCategory === category.id
                          ? 'bg-gray-900 text-white shadow-lg transform scale-105'
                          : 'bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white hover:shadow-md border border-gray-200'
                      }`}
                    >
                      {category.name} ({count})
                    </button>
                  );
                })}
              </div>

              {/* Gallery Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8 md:mb-12">
                {filteredVideos.slice(0, visibleCount).map((video, index) => {
                  const youtubeId = extractYouTubeId(video.video_url);
                  const categoryName = getCategoryName(video);
                  
                  return (
                    <div 
                      key={video.id} 
                      className="group cursor-pointer"
                      onClick={() => setSelectedVideo(video)}
                    >
                      <Card className="overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                        <div className="relative aspect-video overflow-hidden">
                          {youtubeId ? (
                            <img
                              src={`https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`}
                              alt={video.title || 'Video thumbnail'}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
                              }}
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                              <Play className="w-12 h-12 text-gray-400" />
                            </div>
                          )}
                          
                          {/* Gradient Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
                          
                          {/* Play Button */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-75 group-hover:scale-100">
                              <Play className="w-8 h-8 text-white ml-1" />
                            </div>
                          </div>
                          
                          {/* Category Badge */}
                          <div className="absolute top-3 left-3">
                            <span className="bg-gray-900 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
                              {categoryName}
                            </span>
                          </div>
                          
                          {/* Stats */}
                          <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                            <div className="flex space-x-2">
                              <div className="flex items-center space-x-1 bg-black/50 backdrop-blur-sm rounded-full px-2 py-1">
                                <Eye className="w-3 h-3 text-white" />
                                <span className="text-xs text-white">{Math.floor(Math.random() * 1000) + 100}</span>
                              </div>
                              <div className="flex items-center space-x-1 bg-black/50 backdrop-blur-sm rounded-full px-2 py-1">
                                <Heart className="w-3 h-3 text-white" />
                                <span className="text-xs text-white">{Math.floor(Math.random() * 50) + 10}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-5">
                          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-gray-700 transition-colors duration-300">
                            {video.title || 'Smart Home Demo'}
                          </h3>
                          {video.description && (
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                              {video.description}
                            </p>
                          )}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center shadow-md">
                                <span className="text-white text-xs font-bold">SH</span>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">Smart Home</p>
                                <p className="text-xs text-gray-500">Solutions</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-500">#{video.position}</p>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </div>
                  );
                })}
              </div>

              {/* Load More Button */}
              {filteredVideos.length > visibleCount && (
                <div className="text-center">
                  <button
                    onClick={loadMore}
                    className="px-8 py-4 bg-gray-900 text-white font-medium rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                  >
                    Load More Videos ({filteredVideos.length - visibleCount} remaining)
                  </button>
                </div>
              )}

              {/* Empty State */}
              {filteredVideos.length === 0 && (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Play className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No videos found</h3>
                  <p className="text-gray-600">No videos available for the selected category.</p>
                </div>
              )}
            </div>
          </section>
        </main>
        <Footer />
      </div>

      {/* Video Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setSelectedVideo(null)}>
          <div className="relative max-w-3xl w-full bg-black rounded-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedVideo(null)}
              className="absolute top-3 right-3 z-10 w-8 h-8 bg-black/70 hover:bg-black text-white rounded-full flex items-center justify-center transition-colors duration-200"
            >
              <X className="w-4 h-4" />
            </button>
            
            <div className="aspect-video">
              <iframe
                src={`https://www.youtube.com/embed/${extractYouTubeId(selectedVideo.video_url)}?autoplay=1&controls=1&showinfo=0&rel=0&modestbranding=1&quality=hd720`}
                title={selectedVideo.title || 'Video'}
                className="w-full h-full border-0"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GalleryPage;