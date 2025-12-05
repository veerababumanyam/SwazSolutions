// AIEnhanceButton Component
// A reusable button with dropdown for AI-powered text enhancement

import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, ChevronDown, Loader2, X, Check } from 'lucide-react';
import {
  PROFILE_TYPES,
  ENHANCEMENT_TONES,
  DEFAULT_PROFILE_TYPE,
  DEFAULT_ENHANCEMENT_TONE,
  ProfileType,
  EnhancementTone
} from '../constants/profileEnhancement';
import {
  enhanceHeadline,
  enhanceBio,
  getApiKey,
  EnhancementResult
} from '../services/profileEnhancementService';

export type EnhancementFieldType = 'headline' | 'bio';

interface AIEnhanceButtonProps {
  fieldType: EnhancementFieldType;
  currentText: string;
  onEnhanced: (enhancedText: string) => void;
  additionalContext?: string;
  disabled?: boolean;
  className?: string;
}

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
  originalText: string;
  enhancedText: string;
  isLoading: boolean;
  fieldType: EnhancementFieldType;
}

const PreviewModal: React.FC<PreviewModalProps> = ({
  isOpen,
  onClose,
  onAccept,
  originalText,
  enhancedText,
  isLoading,
  fieldType
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent" />
            AI Enhanced {fieldType === 'headline' ? 'Headline' : 'Bio'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-hover rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-secondary" />
          </button>
        </div>
        
        <div className="p-4 space-y-4 overflow-y-auto max-h-[60vh]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="w-8 h-8 text-accent animate-spin mb-3" />
              <p className="text-secondary">Enhancing your {fieldType}...</p>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">Original</label>
                <div className="p-3 bg-hover rounded-lg text-primary text-sm">
                  {originalText || <span className="italic text-secondary">No text provided</span>}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-accent mb-2">Enhanced ✨</label>
                <div className="p-3 bg-accent/10 border border-accent/30 rounded-lg text-primary text-sm">
                  {enhancedText}
                </div>
                <p className="text-xs text-secondary mt-1">
                  {enhancedText.length} characters
                </p>
              </div>
            </>
          )}
        </div>
        
        {!isLoading && (
          <div className="flex gap-3 p-4 border-t border-border">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-border rounded-lg text-secondary hover:bg-hover transition-colors"
            >
              Keep Original
            </button>
            <button
              onClick={onAccept}
              className="flex-1 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              Use Enhanced
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export const AIEnhanceButton: React.FC<AIEnhanceButtonProps> = ({
  fieldType,
  currentText,
  onEnhanced,
  additionalContext,
  disabled = false,
  className = ''
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedProfileType, setSelectedProfileType] = useState<string>(DEFAULT_PROFILE_TYPE);
  const [selectedTone, setSelectedTone] = useState<string>(DEFAULT_ENHANCEMENT_TONE);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [enhancedResult, setEnhancedResult] = useState<EnhancementResult | null>(null);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleEnhance = async () => {
    const apiKey = getApiKey();
    if (!apiKey) {
      setError('Please configure your Gemini API key in Settings first.');
      return;
    }

    if (!currentText.trim()) {
      setError(`Please enter some ${fieldType} text first.`);
      return;
    }

    setError(null);
    setIsLoading(true);
    setShowPreview(true);
    setIsDropdownOpen(false);

    try {
      const request = {
        text: currentText,
        profileTypeId: selectedProfileType,
        toneId: selectedTone,
        additionalContext
      };

      console.log("[AIEnhanceButton] Starting enhancement with request:", request);
      
      const result = fieldType === 'headline'
        ? await enhanceHeadline(request, apiKey)
        : await enhanceBio(request, apiKey);

      console.log("[AIEnhanceButton] Got result:", result);
      console.log("[AIEnhanceButton] Enhanced text:", result.enhancedText);
      console.log("[AIEnhanceButton] Original text:", result.originalText);
      console.log("[AIEnhanceButton] Are they same?", result.enhancedText === result.originalText);
      
      setEnhancedResult(result);
    } catch (err) {
      console.error("[AIEnhanceButton] Enhancement error:", err);
      setError(err instanceof Error ? err.message : 'Enhancement failed. Please try again.');
      setShowPreview(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = () => {
    if (enhancedResult) {
      onEnhanced(enhancedResult.enhancedText);
    }
    setShowPreview(false);
    setEnhancedResult(null);
  };

  const handleClosePreview = () => {
    setShowPreview(false);
    setEnhancedResult(null);
  };

  const selectedProfileTypeObj = PROFILE_TYPES.find(p => p.id === selectedProfileType);
  const selectedToneObj = ENHANCEMENT_TONES.find(t => t.id === selectedTone);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Main Button */}
      <button
        type="button"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        disabled={disabled || isLoading}
        className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm bg-gradient-to-r from-purple-500/10 to-pink-500/10 
                   hover:from-purple-500/20 hover:to-pink-500/20 border border-purple-500/30 rounded-lg 
                   text-purple-400 hover:text-purple-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        title="Enhance with AI"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Sparkles className="w-4 h-4" />
        )}
        <span className="hidden sm:inline">AI</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-surface border border-border rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="p-3 border-b border-border">
            <h4 className="text-sm font-semibold text-primary mb-1">AI Enhancement Options</h4>
            <p className="text-xs text-secondary">Select your profile type and tone</p>
          </div>

          {/* Profile Type Selector */}
          <div className="p-3 border-b border-border">
            <label className="block text-xs font-medium text-secondary mb-2">Profile Type</label>
            <select
              value={selectedProfileType}
              onChange={(e) => setSelectedProfileType(e.target.value)}
              className="w-full px-3 py-2 bg-hover border border-border rounded-lg text-sm text-primary 
                         focus:outline-none focus:ring-2 focus:ring-accent/50"
            >
              {PROFILE_TYPES.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.label}
                </option>
              ))}
            </select>
            {selectedProfileTypeObj && (
              <p className="text-xs text-secondary mt-1">{selectedProfileTypeObj.description}</p>
            )}
          </div>

          {/* Tone Selector */}
          <div className="p-3 border-b border-border">
            <label className="block text-xs font-medium text-secondary mb-2">Tone</label>
            <div className="grid grid-cols-2 gap-2">
              {ENHANCEMENT_TONES.map((tone) => (
                <button
                  key={tone.id}
                  type="button"
                  onClick={() => setSelectedTone(tone.id)}
                  className={`px-3 py-2 text-xs rounded-lg border transition-all ${
                    selectedTone === tone.id
                      ? 'bg-accent/20 border-accent text-accent'
                      : 'bg-hover border-border text-secondary hover:border-accent/50'
                  }`}
                >
                  {tone.label}
                </button>
              ))}
            </div>
            {selectedToneObj && (
              <p className="text-xs text-secondary mt-2">{selectedToneObj.description}</p>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="px-3 py-2 bg-red-500/10 border-b border-red-500/30">
              <p className="text-xs text-red-400">{error}</p>
            </div>
          )}

          {/* Enhance Button */}
          <div className="p-3">
            <button
              type="button"
              onClick={handleEnhance}
              disabled={isLoading}
              className="w-full px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 
                         hover:from-purple-600 hover:to-pink-600 text-white text-sm font-medium 
                         rounded-lg transition-all duration-200 flex items-center justify-center gap-2
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Enhancing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Enhance {fieldType === 'headline' ? 'Headline' : 'Bio'}
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      <PreviewModal
        isOpen={showPreview}
        onClose={handleClosePreview}
        onAccept={handleAccept}
        originalText={currentText}
        enhancedText={enhancedResult?.enhancedText || ''}
        isLoading={isLoading}
        fieldType={fieldType}
      />
    </div>
  );
};

export default AIEnhanceButton;
