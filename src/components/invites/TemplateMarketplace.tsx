import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Search,
  Filter,
  Grid3x3,
  Bookmark,
  Star,
  Heart,
  Eye,
  Download,
  X,
  Palette,
  Sparkles
} from 'lucide-react';
import { inviteApi } from '../../services/inviteApi';
import { SavedTemplate } from '../../types/invite.types';

interface TemplateMarketplaceProps {
  onClose: () => void;
  onSelectTemplate: (template: SavedTemplate) => void;
}

interface TemplateCategory {
  id: string;
  name: string;
  icon: string;
}

const CATEGORIES: TemplateCategory[] = [
  { id: 'all', name: 'All Templates', icon: '✨' },
  { id: 'wedding', name: 'Wedding', icon: '💍' },
  { id: 'birthday', name: 'Birthday', icon: '🎂' },
  { id: 'corporate', name: 'Corporate', icon: '💼' },
  { id: 'festival', name: 'Festival', icon: '🎉' },
  { id: 'baby', name: 'Baby Shower', icon: '👶' },
  { id: 'housewarming', name: 'Housewarming', icon: '🏠' }
];

const SORT_OPTIONS = [
  { id: 'popular', name: 'Most Popular' },
  { id: 'recent', name: 'Recently Added' },
  { id: 'rated', name: 'Highest Rated' },
  { id: 'downloaded', name: 'Most Downloaded' }
];

export const TemplateMarketplace: React.FC<TemplateMarketplaceProps> = ({
  onClose,
  onSelectTemplate
}) => {
  const [templates, setTemplates] = useState<SavedTemplate[]>([]);
  const [savedTemplates, setSavedTemplates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [selectedTemplate, setSelectedTemplate] = useState<SavedTemplate | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    loadTemplates();
    loadSavedTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      // For marketplace, we'd normally fetch from a public API
      // For now, we'll use the templates endpoint which will show saved templates
      const data = await inviteApi.listTemplates();
      setTemplates(data);
    } catch (error) {
      console.error('Failed to load templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSavedTemplates = async () => {
    try {
      const data = await inviteApi.listTemplates();
      setSavedTemplates(data.map(t => t.id));
    } catch (error) {
      console.error('Failed to load saved templates:', error);
    }
  };

  const handleToggleSave = async (template: SavedTemplate) => {
    try {
      if (savedTemplates.includes(template.id)) {
        await inviteApi.deleteTemplate(template.id);
        setSavedTemplates(prev => prev.filter(id => id !== template.id));
      } else {
        // Save template to user's library
        const newTemplate: Partial<SavedTemplate> = {
          ...template,
          id: `${template.id}-${Date.now()}`,
          userId: '', // Will be set by backend
          isMarketplace: false
        };
        await inviteApi.saveTemplate(newTemplate);
        setSavedTemplates(prev => [...prev, template.id]);
      }
    } catch (error) {
      console.error('Failed to toggle save:', error);
    }
  };

  const handleUseTemplate = () => {
    if (selectedTemplate) {
      onSelectTemplate(selectedTemplate);
      onClose();
    }
  };

  const filteredTemplates = templates
    .filter(t => {
      const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
      const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           t.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'popular') return (b.downloadCount || 0) - (a.downloadCount || 0);
      if (sortBy === 'recent') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'rated') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'downloaded') return (b.downloadCount || 0) - (a.downloadCount || 0);
      return 0;
    });

  // Add some mock marketplace templates if none exist
  const marketplaceTemplates = filteredTemplates.length > 0 ? filteredTemplates : getMockTemplates();

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Grid3x3 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-8 h-8 text-purple-500" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Template Marketplace
            </h1>
            <Sparkles className="w-8 h-8 text-pink-500" />
          </div>
          <p className="text-gray-600">
            Discover beautiful templates crafted by designers worldwide
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {SORT_OPTIONS.map(option => (
                <option key={option.id} value={option.id}>{option.name}</option>
              ))}
            </select>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2 mt-4">
            {CATEGORIES.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Templates Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className={`grid gap-6 ${
            viewMode === 'grid'
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              : 'grid-cols-1'
          }`}>
            {marketplaceTemplates.map((template) => (
              <div
                key={template.id}
                className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all cursor-pointer"
                onClick={() => setSelectedTemplate(template)}
              >
                {/* Preview */}
                <div className="relative aspect-[3/4] overflow-hidden">
                  <div
                    className="absolute inset-0 transition-transform group-hover:scale-105"
                    style={{
                      background: template.previewImage || template.backgroundGradient,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  >
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                      <Eye className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>

                  {/* Badge */}
                  {template.isPremium && (
                    <div className="absolute top-3 right-3 px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold rounded-full shadow-lg">
                      PRO
                    </div>
                  )}

                  {/* Rating */}
                  {template.rating && (
                    <div className="absolute top-3 left-3 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-lg flex items-center gap-1 shadow">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-semibold">{template.rating}</span>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="p-4">
                  <h3 className="font-bold text-gray-800 mb-1">{template.name}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {template.description}
                  </p>

                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <span className="flex items-center gap-1">
                      <Download className="w-3 h-3" />
                      {template.downloadCount || 0} downloads
                    </span>
                    <span>{template.category}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleSave(template);
                      }}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-medium transition-colors ${
                        savedTemplates.includes(template.id)
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <Bookmark
                        className={`w-4 h-4 ${savedTemplates.includes(template.id) ? 'fill-current' : ''}`}
                      />
                      {savedTemplates.includes(template.id) ? 'Saved' : 'Save'}
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTemplate(template);
                        handleUseTemplate();
                      }}
                      className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-colors"
                    >
                      Use Template
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {marketplaceTemplates.length === 0 && !loading && (
          <div className="text-center py-20">
            <Palette className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No templates found</h3>
            <p className="text-gray-500">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>

      {/* Template Detail Modal */}
      {selectedTemplate && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex h-[80vh]">
              {/* Preview */}
              <div className="w-1/2 bg-gray-100 p-8 flex items-center justify-center">
                <div
                  className="aspect-[3/4] rounded-xl shadow-2xl w-full max-w-sm"
                  style={{
                    background: selectedTemplate.previewImage || selectedTemplate.backgroundGradient,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                />
              </div>

              {/* Details */}
              <div className="w-1/2 p-8 overflow-y-auto">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    {selectedTemplate.isPremium && (
                      <span className="inline-block px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold rounded-full mb-2">
                        PREMIUM
                      </span>
                    )}
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                      {selectedTemplate.name}
                    </h2>
                    <p className="text-gray-600">{selectedTemplate.description}</p>
                  </div>
                  <button
                    onClick={() => setSelectedTemplate(null)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-center gap-1 text-yellow-500 mb-1">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="font-bold">{selectedTemplate.rating || 'N/A'}</span>
                    </div>
                    <div className="text-xs text-gray-600">Rating</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-center gap-1 text-blue-500 mb-1">
                      <Download className="w-4 h-4" />
                      <span className="font-bold">{selectedTemplate.downloadCount || 0}</span>
                    </div>
                    <div className="text-xs text-gray-600">Downloads</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-center gap-1 text-pink-500 mb-1">
                      <Heart className="w-4 h-4" />
                      <span className="font-bold">{selectedTemplate.likeCount || 0}</span>
                    </div>
                    <div className="text-xs text-gray-600">Likes</div>
                  </div>
                </div>

                {/* Features */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-800 mb-3">Features</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedTemplate.features?.map((feature, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => handleToggleSave(selectedTemplate)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-colors ${
                      savedTemplates.includes(selectedTemplate.id)
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Bookmark
                      className={`w-5 h-5 ${savedTemplates.includes(selectedTemplate.id) ? 'fill-current' : ''}`}
                    />
                    {savedTemplates.includes(selectedTemplate.id) ? 'Saved' : 'Save to Library'}
                  </button>

                  <button
                    onClick={handleUseTemplate}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-medium hover:from-purple-600 hover:to-pink-600 transition-colors"
                  >
                    Use This Template
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Mock templates for the marketplace
function getMockTemplates(): SavedTemplate[] {
  return [
    {
      id: 'floral-gold',
      userId: '',
      name: 'Floral Gold Elegance',
      description: 'A stunning floral design with gold accents, perfect for traditional weddings',
      category: 'wedding',
      backgroundGradient: 'linear-gradient(135deg, #f5e6d3 0%, #fff 50%, #f5e6d3 100%)',
      primaryColor: '#d4a574',
      secondaryColor: '#8b6914',
      textColor: '#1a202c',
      fontFamily: 'Georgia',
      templateData: {},
      features: ['Multi-event', 'Bilingual', 'Photo Gallery', 'RSVP'],
      isMarketplace: true,
      isPremium: false,
      rating: 4.8,
      downloadCount: 2340,
      likeCount: 456,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'royal-ivory',
      userId: '',
      name: 'Royal Ivory',
      description: 'Elegant ivory template with royal blue accents for sophisticated events',
      category: 'wedding',
      backgroundGradient: 'linear-gradient(135deg, #1e3a5f 0%, #2c5282 100%)',
      primaryColor: '#f6e05e',
      secondaryColor: '#ffffff',
      textColor: '#ffffff',
      fontFamily: 'Cinzel',
      templateData: {},
      features: ['Multi-event', 'Countdown', 'Music', 'Maps'],
      isMarketplace: true,
      isPremium: true,
      rating: 4.9,
      downloadCount: 1890,
      likeCount: 678,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'confetti-birthday',
      userId: '',
      name: 'Confetti Pop',
      description: 'Fun and colorful confetti design perfect for birthday celebrations',
      category: 'birthday',
      backgroundGradient: 'linear-gradient(135deg, #ff6b6b 0%, #feca57 25%, #48dbfb 50%, #ff9ff3 75%, #54a0ff 100%)',
      primaryColor: '#ff6b6b',
      secondaryColor: '#feca57',
      textColor: '#2d3436',
      fontFamily: 'Comic Sans MS',
      templateData: {},
      features: ['Photo Gallery', 'RSVP', 'Wishes Wall'],
      isMarketplace: true,
      isPremium: false,
      rating: 4.5,
      downloadCount: 3420,
      likeCount: 892,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'corporate-blue',
      userId: '',
      name: 'Corporate Blue',
      description: 'Professional template for corporate events and business meetings',
      category: 'corporate',
      backgroundGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      primaryColor: '#ffffff',
      secondaryColor: '#e9ecef',
      textColor: '#ffffff',
      fontFamily: 'Helvetica',
      templateData: {},
      features: ['Agenda', 'Speaker Profiles', 'Registration'],
      isMarketplace: true,
      isPremium: true,
      rating: 4.6,
      downloadCount: 1234,
      likeCount: 345,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'diwali-lights',
      userId: '',
      name: 'Diwali Festival Lights',
      description: 'Celebrate the festival of lights with this beautiful traditional design',
      category: 'festival',
      backgroundGradient: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
      primaryColor: '#fbbf24',
      secondaryColor: '#fef3c7',
      textColor: '#ffffff',
      fontFamily: 'Playfair Display',
      templateData: {},
      features: ['Lamp Animation', 'Greetings', 'Photo Share'],
      isMarketplace: true,
      isPremium: false,
      rating: 4.7,
      downloadCount: 2890,
      likeCount: 567,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'baby-shower-pink',
      userId: '',
      name: 'Sweet Baby Shower',
      description: 'Adorable pastel pink template for baby showers',
      category: 'baby',
      backgroundGradient: 'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)',
      primaryColor: '#ec4899',
      secondaryColor: '#f9a8d4',
      textColor: '#831843',
      fontFamily: 'Cormorant Garamond',
      templateData: {},
      features: ['Gift Registry', 'Games', 'Photo Gallery'],
      isMarketplace: true,
      isPremium: false,
      rating: 4.4,
      downloadCount: 1567,
      likeCount: 234,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'housewarming-warm',
      userId: '',
      name: 'Cozy Housewarming',
      description: 'Warm and inviting template for housewarming parties',
      category: 'housewarming',
      backgroundGradient: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
      primaryColor: '#d97706',
      secondaryColor: '#fbbf24',
      textColor: '#78350f',
      fontFamily: 'Georgia',
      templateData: {},
      features: ['Address', 'Maps', 'RSVP'],
      isMarketplace: true,
      isPremium: false,
      rating: 4.3,
      downloadCount: 980,
      likeCount: 156,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'minimal-white',
      userId: '',
      name: 'Minimalist White',
      description: 'Clean and minimalist design for modern events',
      category: 'all',
      backgroundGradient: 'linear-gradient(135deg, #fafafa 0%, #ffffff 100%)',
      primaryColor: '#1a202c',
      secondaryColor: '#4a5568',
      textColor: '#1a202c',
      fontFamily: 'Helvetica',
      templateData: {},
      features: ['All Events', 'Customizable', 'Print Ready'],
      isMarketplace: true,
      isPremium: true,
      rating: 4.9,
      downloadCount: 4567,
      likeCount: 1234,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];
}

export default TemplateMarketplace;
