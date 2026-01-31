/**
 * MapLocationEditor Component
 * Geographic location editor for embedding maps with marker customization
 * Features: address input, provider selection, zoom control, marker styling, preview
 */

import React, { useState, useEffect } from 'react';
import { MapLocationConfig } from '@/types/modernProfile.types';

interface MapLocationEditorProps {
  config?: MapLocationConfig;
  onChange: (config: MapLocationConfig) => void;
}

export const MapLocationEditor: React.FC<MapLocationEditorProps> = ({
  config,
  onChange
}) => {
  const [address, setAddress] = useState(config?.address || '');
  const [provider, setProvider] = useState<'google' | 'openstreetmap' | 'mapbox'>(
    config?.provider || 'openstreetmap'
  );
  const [zoom, setZoom] = useState(config?.zoom || 15);
  const [markerColor, setMarkerColor] = useState(config?.markerColor || '#ef4444');
  const [markerTitle, setMarkerTitle] = useState(config?.markerTitle || '');
  const [showMarker, setShowMarker] = useState(config?.showMarker !== false);
  const [latitude, setLatitude] = useState(config?.latitude?.toString() || '');
  const [longitude, setLongitude] = useState(config?.longitude?.toString() || '');
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [geocodingError, setGeocodingError] = useState<string | null>(null);

  // Sync changes to parent
  useEffect(() => {
    const newConfig: MapLocationConfig = {
      address,
      provider,
      zoom,
      showMarker,
      markerColor,
      markerTitle,
      ...(latitude && { latitude: parseFloat(latitude) }),
      ...(longitude && { longitude: parseFloat(longitude) })
    };
    onChange(newConfig);
  }, [address, provider, zoom, markerColor, markerTitle, showMarker, latitude, longitude, onChange]);

  // Geocode address to get coordinates
  const geocodeAddress = async () => {
    if (!address.trim()) {
      setGeocodingError('Please enter an address');
      return;
    }

    setLoadingPreview(true);
    setGeocodingError(null);
    setPreviewError(null);

    try {
      // Use OpenStreetMap Nominatim API (free, no API key required)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`,
        {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'SwazSolutions-vCard'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to geocode address');
      }

      const results = await response.json();

      if (!results || results.length === 0) {
        setGeocodingError('Address not found. Please try a different search.');
        setLoadingPreview(false);
        return;
      }

      const result = results[0];
      setLatitude(parseFloat(result.lat).toString());
      setLongitude(parseFloat(result.lon).toString());
      setGeocodingError(null);
    } catch (err) {
      console.error('Geocoding error:', err);
      setGeocodingError(
        err instanceof Error ? err.message : 'Failed to find location'
      );
    } finally {
      setLoadingPreview(false);
    }
  };

  // Generate static map preview URL
  const generateMapPreviewUrl = (): string | null => {
    if (!latitude || !longitude) return null;

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    // Use OpenStreetMap static map
    const markerStyle = showMarker ? `&markers=${lat}%2C${lng}` : '';
    const mapUrl = `https://maps.geoapify.com/v1/staticmap?style=osm-bright&width=400&height=300&center=lonlat:${lng},${lat}&zoom=${zoom}${markerStyle}&apiKey=placeholder`;

    // Fallback to simpler OpenStreetMap tile preview
    return `https://tile.openstreetmap.org/14/${Math.floor((lng + 180) / 360 * 8192)}/${Math.floor((90 - lat) / 180 * 8192)}.png`;
  };

  const getProviderLabel = (prov: string): string => {
    const labels: Record<string, string> = {
      google: 'Google Maps',
      openstreetmap: 'OpenStreetMap',
      mapbox: 'Mapbox'
    };
    return labels[prov] || prov;
  };

  const mapPreviewUrl = generateMapPreviewUrl();

  return (
    <div className="space-y-6">
      {/* Address Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Address <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={address}
            onChange={(e) => {
              setAddress(e.target.value);
              setGeocodingError(null);
            }}
            placeholder="123 Main Street, New York, NY 10001"
            className="flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <button
            type="button"
            onClick={geocodeAddress}
            disabled={loadingPreview || !address.trim()}
            className="px-4 py-3 rounded-xl bg-purple-500 text-white font-medium hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
          >
            {loadingPreview ? (
              <svg className="animate-spin w-5 h-5 inline" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              'Search'
            )}
          </button>
        </div>
        {geocodingError && (
          <p className="text-sm text-red-600 dark:text-red-400 mt-2">{geocodingError}</p>
        )}
      </div>

      {/* Coordinates (read-only after geocoding) */}
      {(latitude || longitude) && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Latitude
            </label>
            <input
              type="text"
              value={latitude}
              readOnly
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Longitude
            </label>
            <input
              type="text"
              value={longitude}
              readOnly
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 cursor-not-allowed"
            />
          </div>
        </div>
      )}

      {/* Map Provider Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Map Provider
        </label>
        <div className="space-y-2 bg-gray-50 dark:bg-gray-700/30 rounded-xl p-3">
          {(['google', 'openstreetmap', 'mapbox'] as const).map((prov) => (
            <label
              key={prov}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-white dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
            >
              <input
                type="radio"
                name="provider"
                value={prov}
                checked={provider === prov}
                onChange={(e) => setProvider(e.target.value as typeof provider)}
                className="w-4 h-4 text-purple-500 focus:ring-purple-500 dark:border-gray-600"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {getProviderLabel(prov)}
              </span>
              {prov === 'google' && (
                <span className="text-xs text-gray-500">Requires API key</span>
              )}
              {prov === 'mapbox' && (
                <span className="text-xs text-gray-500">Requires API key</span>
              )}
            </label>
          ))}
        </div>
      </div>

      {/* Zoom Level Control */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Zoom Level
          </label>
          <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
            {zoom}
          </span>
        </div>
        <input
          type="range"
          min="1"
          max="20"
          value={zoom}
          onChange={(e) => setZoom(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-purple-500"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          1 (world) to 20 (detailed street level)
        </p>
      </div>

      {/* Marker Settings */}
      <div className="space-y-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Show Marker
          </label>
          <button
            type="button"
            onClick={() => setShowMarker(!showMarker)}
            className={`relative w-12 h-7 rounded-full transition-colors ${
              showMarker
                ? 'bg-purple-500'
                : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <div
              className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
                showMarker ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {showMarker && (
          <>
            {/* Marker Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Marker Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={markerColor}
                  onChange={(e) => setMarkerColor(e.target.value)}
                  className="w-12 h-10 rounded-lg cursor-pointer"
                />
                <input
                  type="text"
                  value={markerColor}
                  onChange={(e) => setMarkerColor(e.target.value)}
                  placeholder="#ef4444"
                  className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Marker Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Marker Title (shown on hover)
              </label>
              <input
                type="text"
                value={markerTitle}
                onChange={(e) => setMarkerTitle(e.target.value)}
                placeholder="Our Location"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </>
        )}
      </div>

      {/* Map Preview */}
      {mapPreviewUrl && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Map Preview
          </label>
          <div className="relative w-full h-48 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 overflow-hidden">
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {address && `📍 ${address}`}
                </p>
                {latitude && longitude && (
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {latitude}, {longitude} (Zoom: {zoom})
                  </p>
                )}
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Preview will be rendered when the profile is viewed
          </p>
        </div>
      )}

      {/* Embed Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
        <p className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-1">
          ℹ️ Embedding Information
        </p>
        <p className="text-xs text-blue-700 dark:text-blue-400">
          Maps require an API key for {getProviderLabel(provider)}. Configure your API key in settings for the map to display on your public profile.
        </p>
      </div>
    </div>
  );
};

export default MapLocationEditor;
