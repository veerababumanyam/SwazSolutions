import React, { useState, useEffect } from 'react';
import { Camera, Download, Calendar, Filter, Search, ChevronDown, ChevronUp, ExternalLink, AlertCircle, Zap, RefreshCw, Circle } from 'lucide-react';

interface Update {
  id: string;
  brand: 'Canon' | 'Nikon' | 'Sony';
  type: 'firmware' | 'camera' | 'lens';
  title: string;
  date: string;
  version?: string;
  description: string;
  features: string[];
  downloadLink?: string;
  imageUrl?: string;
  sourceUrl: string;
  sourceName: string;
  priority: 'critical' | 'high' | 'normal';
  category?: string;
}

const MOCK_UPDATES: Update[] = [
  {
    id: '1',
    brand: 'Canon',
    type: 'firmware',
    title: 'EOS R5 Mark II Firmware Update 1.2.0',
    date: '2025-11-20',
    version: '1.2.0',
    description: 'Critical stability improvements and enhanced autofocus performance for video recording.',
    features: [
      'Improved AF tracking in low light conditions',
      'Fixed overheating issue during 8K recording',
      'Enhanced eye detection for wildlife photography',
      'Stability improvements for CFexpress card writing'
    ],
    downloadLink: 'https://www.canon.com/firmware',
    imageUrl: '/placeholder-camera.jpg',
    sourceUrl: 'https://www.canon.com',
    sourceName: 'Canon Official',
    priority: 'critical',
    category: 'Full Frame Mirrorless'
  },
  {
    id: '2',
    brand: 'Sony',
    type: 'camera',
    title: 'Sony A7 V Announcement - Professional Hybrid Camera',
    date: '2025-11-19',
    description: 'Sony announces the highly anticipated A7 V, combining the best features of A7R and A7S series.',
    features: [
      '45MP full-frame sensor',
      '8K 30p / 4K 120p video recording',
      'AI-powered autofocus with bird/animal detection',
      'In-body 8-stop image stabilization',
      'Dual CFexpress Type A + SD UHS-II card slots'
    ],
    imageUrl: '/placeholder-camera.jpg',
    sourceUrl: 'https://www.sony.com',
    sourceName: 'Sony Official',
    priority: 'high',
    category: 'Full Frame Mirrorless'
  },
  {
    id: '3',
    brand: 'Nikon',
    type: 'lens',
    title: 'NIKKOR Z 35mm f/1.2 S - Professional Prime Lens',
    date: '2025-11-18',
    description: 'New fast prime lens designed for professional portraiture and low-light photography.',
    features: [
      'Ultra-wide f/1.2 aperture for exceptional bokeh',
      '9-blade rounded diaphragm',
      'Nano Crystal Coat for reduced flare',
      'Weather-sealed construction',
      'Stepping motor for silent autofocus'
    ],
    imageUrl: '/placeholder-lens.jpg',
    sourceUrl: 'https://www.nikon.com',
    sourceName: 'Nikon Official',
    priority: 'normal',
    category: 'Prime Lens'
  }
];

export const CameraUpdatesPage: React.FC = () => {
  const [updates, setUpdates] = useState<Update[]>([]);
  const [filteredUpdates, setFilteredUpdates] = useState<Update[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>(['Canon', 'Nikon', 'Sony']);
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['firmware', 'camera', 'lens']);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<'date' | 'priority'>('date');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter and sort updates
  useEffect(() => {
    let filtered = updates.filter(update => 
      selectedBrands.includes(update.brand) &&
      selectedTypes.includes(update.type) &&
      (searchQuery === '' || 
        update.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        update.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        update.features.some(f => f.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    );

    // Sort
    if (sortBy === 'date') {
      filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } else {
      const priorityOrder = { critical: 0, high: 1, normal: 2 };
      filtered.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    }

    setFilteredUpdates(filtered);
  }, [updates, selectedBrands, selectedTypes, searchQuery, sortBy]);

  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev => 
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };

  const toggleType = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const toggleCard = (id: string) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Fetch updates from API
  const fetchUpdates = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await fetch(`${API_URL}/api/camera-updates`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch camera updates');
      }
      
      const data = await response.json();
      
      if (data.success && data.updates) {
        setUpdates(data.updates);
        setLastUpdated(data.lastUpdated ? new Date(data.lastUpdated) : new Date());
        setError(null);
      }
    } catch (err) {
      console.error('Error fetching camera updates:', err);
      setError('Failed to load camera updates. Using fallback data.');
      // Fallback to mock data on error
      setUpdates(MOCK_UPDATES);
      setLastUpdated(new Date());
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchUpdates();
  }, []);

  const refreshUpdates = async () => {
    setIsRefreshing(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await fetch(`${API_URL}/api/camera-updates/refresh`, {
        method: 'POST'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          await fetchUpdates(); // Refresh the data
        }
      }
    } catch (err) {
      console.error('Error refreshing updates:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const getBrandColor = (brand: string) => {
    switch (brand) {
      case 'Canon': return 'text-red-600 bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800';
      case 'Nikon': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800';
      case 'Sony': return 'text-blue-600 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800';
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-950 border-gray-200 dark:border-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'firmware': return 'text-purple-600 bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800';
      case 'camera': return 'text-green-600 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800';
      case 'lens': return 'text-orange-600 bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800';
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-950 border-gray-200 dark:border-gray-800';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical':
        return <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-bold rounded-full bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-700">
          <Zap className="w-3 h-3" /> Critical
        </span>;
      case 'high':
        return <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-bold rounded-full bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 border border-orange-300 dark:border-orange-700">
          <AlertCircle className="w-3 h-3" /> High Priority
        </span>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-black text-primary mb-2 flex items-center gap-3">
                <Camera className="w-10 h-10 text-accent" />
                Professional Camera Updates
              </h1>
              <p className="text-secondary text-lg">
                Latest news from Canon, Nikon, and Sony - Cameras, Lenses, and Firmware
              </p>
            </div>
            <button
              onClick={refreshUpdates}
              disabled={isRefreshing}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${
                isRefreshing 
                  ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed' 
                  : 'bg-accent text-white hover:bg-accent-dark shadow-md hover:shadow-lg'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
          
          {lastUpdated && (
            <div className="flex items-center gap-2 text-sm text-muted">
              <Calendar className="w-4 h-4" />
              <span>Last updated: {lastUpdated.toLocaleString()}</span>
              <span className="mx-2">•</span>
              <span className="text-accent font-semibold">AI-powered daily updates</span>
            </div>
          )}
          
          {error && (
            <div className="mt-2 p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg text-yellow-800 dark:text-yellow-200 text-sm">
              ⚠️ {error}
            </div>
          )}
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
            <input
              type="text"
              placeholder="Search updates, features, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-border bg-surface text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8 glass-card p-6 rounded-2xl">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-accent" />
            <h3 className="text-lg font-bold text-primary">Filters & Sort</h3>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* Brand Filter */}
            <div>
              <label className="block text-sm font-semibold text-secondary mb-2">Brands</label>
              <div className="space-y-2">
                {['Canon', 'Nikon', 'Sony'].map(brand => (
                  <label key={brand} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedBrands.includes(brand)}
                      onChange={() => toggleBrand(brand)}
                      className="w-4 h-4 rounded border-border text-accent focus:ring-accent"
                    />
                    <span className={`text-sm font-medium ${selectedBrands.includes(brand) ? 'text-primary' : 'text-muted'}`}>
                      {brand}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-sm font-semibold text-secondary mb-2">Update Type</label>
              <div className="space-y-2">
                {[
                  { value: 'firmware', label: 'Firmware' },
                  { value: 'camera', label: 'Cameras' },
                  { value: 'lens', label: 'Lenses' }
                ].map(type => (
                  <label key={type.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedTypes.includes(type.value)}
                      onChange={() => toggleType(type.value)}
                      className="w-4 h-4 rounded border-border text-accent focus:ring-accent"
                    />
                    <span className={`text-sm font-medium ${selectedTypes.includes(type.value) ? 'text-primary' : 'text-muted'}`}>
                      {type.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-semibold text-secondary mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'priority')}
                className="w-full px-4 py-2 rounded-xl border border-border bg-surface text-primary focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="date">Latest First</option>
                <option value="priority">Priority</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 text-sm text-secondary">
          Showing <span className="font-bold text-primary">{filteredUpdates.length}</span> of {updates.length} updates
        </div>

        {/* Updates Grid */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="text-center py-12 glass-card rounded-2xl">
              <RefreshCw className="w-16 h-16 text-accent mx-auto mb-4 animate-spin" />
              <p className="text-lg text-secondary">Loading camera updates...</p>
            </div>
          ) : filteredUpdates.length === 0 ? (
            <div className="text-center py-12 glass-card rounded-2xl">
              <AlertCircle className="w-16 h-16 text-muted mx-auto mb-4" />
              <p className="text-lg text-secondary">No updates found matching your filters</p>
            </div>
          ) : (
            filteredUpdates.map(update => (
              <div key={update.id} className="glass-card rounded-2xl overflow-hidden border border-border hover:shadow-lg transition-shadow">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className={`px-3 py-1 text-xs font-bold rounded-full border ${getBrandColor(update.brand)}`}>
                          {update.brand}
                        </span>
                        <span className={`px-3 py-1 text-xs font-bold rounded-full border ${getTypeColor(update.type)}`}>
                          {update.type === 'firmware' ? <Download className="w-3 h-3 inline mr-1" /> : update.type === 'camera' ? <Camera className="w-3 h-3 inline mr-1" /> : <Circle className="w-3 h-3 inline mr-1" />}
                          {update.type.charAt(0).toUpperCase() + update.type.slice(1)}
                        </span>
                        {update.version && (
                          <span className="px-3 py-1 text-xs font-mono font-bold rounded-full bg-surface border border-border text-primary">
                            v{update.version}
                          </span>
                        )}
                        {getPriorityBadge(update.priority)}
                      </div>
                      
                      <h2 className="text-2xl font-black text-primary mb-2">{update.title}</h2>
                      
                      <div className="flex items-center gap-4 text-sm text-secondary">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(update.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </span>
                        {update.category && (
                          <span className="text-muted">• {update.category}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-secondary mb-4 leading-relaxed">{update.description}</p>

                  {/* Features (Collapsed/Expanded) */}
                  {expandedCards.has(update.id) && (
                    <div className="mb-4 p-4 bg-accent-light/50 dark:bg-accent-light/10 rounded-xl border border-accent/20">
                      <h3 className="text-sm font-bold text-primary mb-3">Key Features & Improvements:</h3>
                      <ul className="space-y-2">
                        {update.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-secondary">
                            <span className="text-accent mt-0.5">•</span>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <button
                      onClick={() => toggleCard(update.id)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface hover:bg-border border border-border text-primary font-semibold text-sm transition-colors"
                    >
                      {expandedCards.has(update.id) ? (
                        <>
                          <ChevronUp className="w-4 h-4" /> Show Less
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4" /> Show More
                        </>
                      )}
                    </button>

                    {update.downloadLink && (
                      <a
                        href={update.downloadLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent hover:bg-accent-dark text-white font-semibold text-sm transition-colors shadow-md"
                      >
                        <Download className="w-4 h-4" /> Download
                      </a>
                    )}

                    <a
                      href={update.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border hover:bg-surface text-secondary hover:text-primary font-semibold text-sm transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" /> {update.sourceName}
                    </a>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
