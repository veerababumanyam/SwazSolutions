// UnifiedProfileEditor Page
// Single comprehensive page for all profile management: info, photo/logo, links, appearance, QR code
// Virtual Invitation Card - all features in one place

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Image, Link2, Palette, QrCode, Eye, Share2, Download,
  Cloud, ChevronDown, ChevronUp, Check, X, Camera, Globe, Lock,
  Mail, Phone, Briefcase, Building2, FileText, ExternalLink, CheckCircle, AlertCircle, Loader2, MapPin
} from 'lucide-react';
import { useProfile } from '../hooks/useProfile';
import { useToast } from '../contexts/ToastContext';
import { ProfileData } from '../services/profileService';
import { LinkCard } from '../components/profile/LinkCard';
import { MobilePreview, AppearanceSettings } from '../components/profile/MobilePreview';
import { AddLinkModal } from '../components/profile/AddLinkModal';
import { AppearancePanel } from '../components/profile/AppearancePanel';
import { getQRCodeDataURL } from '../services/qrCodeService';
import { detectPlatformFromUrl, DEFAULT_LOGO } from '../constants/platforms';
import { ImageCropper, AspectRatioPreset } from '../components/common/ImageCropper';
import { CropResult } from '../utils/cropImage';
import { AIEnhanceButton } from '../components/AIEnhanceButton';

// Tab types for different sections
type TabType = 'info' | 'media' | 'links' | 'address' | 'appearance' | 'qr';

interface SocialLink {
  id: number;
  platform: string | null;
  url: string;
  displayLabel: string | null;
  customLogo: string | null;
  isFeatured: boolean;
  displayOrder: number;
  clicks?: number;
}

// Helper for authenticated fetch requests
const authFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const token = localStorage.getItem('auth_token');
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });
};

// Default appearance settings
const DEFAULT_APPEARANCE: AppearanceSettings = {
  buttonStyle: 'solid',
  cornerRadius: 12,
  shadowStyle: 'subtle',
  buttonColor: '#8B5CF6',
  shadowColor: '#000000',
  textColor: '#FFFFFF',
  backgroundColor: '#F9FAFB',
  fontFamily: 'Inter',
  headerStyle: 'simple',
  headerColor: '#8B5CF6',
  bannerSettings: {
    mode: 'color',
    color: '#8B5CF6',
    derivedFromWallpaper: true,
  },
  wallpaper: '',
  wallpaperOpacity: 100,
  footerText: '',
  showPoweredBy: true,
  themeId: '',
};

// Address Tab Component with local state to prevent auto-save issues
interface AddressTabContentProps {
  formData: Partial<ProfileData>;
  onSave: (data: Partial<ProfileData>) => Promise<void>;
  onUpdateLocalData?: (data: Partial<ProfileData>) => void;
}

const AddressTabContent: React.FC<AddressTabContentProps> = ({ formData: initialFormData, onSave, onUpdateLocalData }) => {
  const [saving, setSaving] = useState(false);
  const [localData, setLocalData] = useState({
    // Personal address
    addressLine1: initialFormData.addressLine1 || '',
    addressLine2: initialFormData.addressLine2 || '',
    addressCity: initialFormData.addressCity || '',
    addressState: initialFormData.addressState || '',
    addressPostalCode: initialFormData.addressPostalCode || '',
    addressCountry: initialFormData.addressCountry || '',
    showAddressLine1: initialFormData.showAddressLine1 ?? false,
    showAddressLine2: initialFormData.showAddressLine2 ?? false,
    showAddressCity: initialFormData.showAddressCity ?? false,
    showAddressState: initialFormData.showAddressState ?? false,
    showAddressPostalCode: initialFormData.showAddressPostalCode ?? false,
    showAddressCountry: initialFormData.showAddressCountry ?? false,
    // Company address
    companyAddressLine1: initialFormData.companyAddressLine1 || '',
    companyAddressLine2: initialFormData.companyAddressLine2 || '',
    companyAddressCity: initialFormData.companyAddressCity || '',
    companyAddressState: initialFormData.companyAddressState || '',
    companyAddressPostalCode: initialFormData.companyAddressPostalCode || '',
    companyAddressCountry: initialFormData.companyAddressCountry || '',
    showCompanyAddressLine1: initialFormData.showCompanyAddressLine1 ?? false,
    showCompanyAddressLine2: initialFormData.showCompanyAddressLine2 ?? false,
    showCompanyAddressCity: initialFormData.showCompanyAddressCity ?? false,
    showCompanyAddressState: initialFormData.showCompanyAddressState ?? false,
    showCompanyAddressPostalCode: initialFormData.showCompanyAddressPostalCode ?? false,
    showCompanyAddressCountry: initialFormData.showCompanyAddressCountry ?? false,
  });

  // Sync local state when initialFormData changes (e.g., when profile loads from API)
  useEffect(() => {
    setLocalData({
      addressLine1: initialFormData.addressLine1 || '',
      addressLine2: initialFormData.addressLine2 || '',
      addressCity: initialFormData.addressCity || '',
      addressState: initialFormData.addressState || '',
      addressPostalCode: initialFormData.addressPostalCode || '',
      addressCountry: initialFormData.addressCountry || '',
      showAddressLine1: initialFormData.showAddressLine1 ?? false,
      showAddressLine2: initialFormData.showAddressLine2 ?? false,
      showAddressCity: initialFormData.showAddressCity ?? false,
      showAddressState: initialFormData.showAddressState ?? false,
      showAddressPostalCode: initialFormData.showAddressPostalCode ?? false,
      showAddressCountry: initialFormData.showAddressCountry ?? false,
      companyAddressLine1: initialFormData.companyAddressLine1 || '',
      companyAddressLine2: initialFormData.companyAddressLine2 || '',
      companyAddressCity: initialFormData.companyAddressCity || '',
      companyAddressState: initialFormData.companyAddressState || '',
      companyAddressPostalCode: initialFormData.companyAddressPostalCode || '',
      companyAddressCountry: initialFormData.companyAddressCountry || '',
      showCompanyAddressLine1: initialFormData.showCompanyAddressLine1 ?? false,
      showCompanyAddressLine2: initialFormData.showCompanyAddressLine2 ?? false,
      showCompanyAddressCity: initialFormData.showCompanyAddressCity ?? false,
      showCompanyAddressState: initialFormData.showCompanyAddressState ?? false,
      showCompanyAddressPostalCode: initialFormData.showCompanyAddressPostalCode ?? false,
      showCompanyAddressCountry: initialFormData.showCompanyAddressCountry ?? false,
    });
  }, [initialFormData.addressLine1, initialFormData.addressLine2, initialFormData.addressCity, 
      initialFormData.addressState, initialFormData.addressPostalCode, initialFormData.addressCountry,
      initialFormData.showAddressLine1, initialFormData.showAddressLine2, initialFormData.showAddressCity,
      initialFormData.showAddressState, initialFormData.showAddressPostalCode, initialFormData.showAddressCountry,
      initialFormData.companyAddressLine1, initialFormData.companyAddressLine2, initialFormData.companyAddressCity,
      initialFormData.companyAddressState, initialFormData.companyAddressPostalCode, initialFormData.companyAddressCountry,
      initialFormData.showCompanyAddressLine1, initialFormData.showCompanyAddressLine2, initialFormData.showCompanyAddressCity,
      initialFormData.showCompanyAddressState, initialFormData.showCompanyAddressPostalCode, initialFormData.showCompanyAddressCountry]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setLocalData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(localData);
      // Update parent's local formData so preview updates immediately
      if (onUpdateLocalData) {
        onUpdateLocalData(localData);
      }
    } finally {
      setSaving(false);
    }
  };

  // Small toggle component for inline use
  const VisibilityToggle = ({ name, checked, label }: { name: string; checked: boolean; label: string }) => (
    <label className="inline-flex items-center cursor-pointer ml-2">
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={handleChange}
        className="sr-only peer"
      />
      <div className="w-8 h-4 bg-gray-300 peer-focus:outline-none peer-focus:ring-1 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-purple-600 relative"></div>
      <span className="ml-1 text-xs text-secondary">{checked ? 'Show' : 'Hide'}</span>
    </label>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-6 h-6 text-accent" />
          <h2 className="text-xl font-semibold text-primary">Address Information</h2>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 disabled:opacity-50 transition-colors"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              Save Address
            </>
          )}
        </button>
      </div>
      <p className="text-sm text-secondary mb-6">
        Add your personal and company addresses. Toggle visibility for each field to control what appears in your vCard and public profile.
      </p>

      {/* Personal Address Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
            <User className="w-5 h-5 text-purple-500" />
            Personal Address
          </h3>
        </div>
        <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
          {/* Street Address Line 1 */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-primary">Street Address Line 1</label>
              <VisibilityToggle name="showAddressLine1" checked={localData.showAddressLine1} label="Line 1" />
            </div>
            <input
              type="text"
              name="addressLine1"
              value={localData.addressLine1}
              onChange={handleChange}
              className="w-full input"
              placeholder="House/Flat No., Building, Street"
            />
          </div>

          {/* Street Address Line 2 */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-primary">Street Address Line 2</label>
              <VisibilityToggle name="showAddressLine2" checked={localData.showAddressLine2} label="Line 2" />
            </div>
            <input
              type="text"
              name="addressLine2"
              value={localData.addressLine2}
              onChange={handleChange}
              className="w-full input"
              placeholder="Area, Landmark (optional)"
            />
          </div>

          {/* City */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-primary">City</label>
              <VisibilityToggle name="showAddressCity" checked={localData.showAddressCity} label="City" />
            </div>
            <input
              type="text"
              name="addressCity"
              value={localData.addressCity}
              onChange={handleChange}
              className="w-full input"
              placeholder="City"
            />
          </div>

          {/* State */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-primary">State</label>
              <VisibilityToggle name="showAddressState" checked={localData.showAddressState} label="State" />
            </div>
            <input
              type="text"
              name="addressState"
              value={localData.addressState}
              onChange={handleChange}
              className="w-full input"
              placeholder="State"
            />
          </div>

          {/* PIN Code */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-primary">PIN Code</label>
              <VisibilityToggle name="showAddressPostalCode" checked={localData.showAddressPostalCode} label="PIN" />
            </div>
            <input
              type="text"
              name="addressPostalCode"
              value={localData.addressPostalCode}
              onChange={handleChange}
              className="w-full input"
              placeholder="PIN Code"
            />
          </div>

          {/* Country */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-primary">Country</label>
              <VisibilityToggle name="showAddressCountry" checked={localData.showAddressCountry} label="Country" />
            </div>
            <input
              type="text"
              name="addressCountry"
              value={localData.addressCountry}
              onChange={handleChange}
              className="w-full input"
              placeholder="Country"
            />
          </div>

          <p className="text-xs text-secondary mt-2">Personal address will be shown in vCard as HOME type</p>
        </div>
      </div>

      {/* Company Address Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-500" />
            Company Address
          </h3>
        </div>
        <div className="space-y-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
          {/* Street Address Line 1 */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-primary">Street Address Line 1</label>
              <VisibilityToggle name="showCompanyAddressLine1" checked={localData.showCompanyAddressLine1} label="Line 1" />
            </div>
            <input
              type="text"
              name="companyAddressLine1"
              value={localData.companyAddressLine1}
              onChange={handleChange}
              className="w-full input"
              placeholder="Office No., Building, Street"
            />
          </div>

          {/* Street Address Line 2 */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-primary">Street Address Line 2</label>
              <VisibilityToggle name="showCompanyAddressLine2" checked={localData.showCompanyAddressLine2} label="Line 2" />
            </div>
            <input
              type="text"
              name="companyAddressLine2"
              value={localData.companyAddressLine2}
              onChange={handleChange}
              className="w-full input"
              placeholder="Area, Landmark (optional)"
            />
          </div>

          {/* City */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-primary">City</label>
              <VisibilityToggle name="showCompanyAddressCity" checked={localData.showCompanyAddressCity} label="City" />
            </div>
            <input
              type="text"
              name="companyAddressCity"
              value={localData.companyAddressCity}
              onChange={handleChange}
              className="w-full input"
              placeholder="City"
            />
          </div>

          {/* State */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-primary">State</label>
              <VisibilityToggle name="showCompanyAddressState" checked={localData.showCompanyAddressState} label="State" />
            </div>
            <input
              type="text"
              name="companyAddressState"
              value={localData.companyAddressState}
              onChange={handleChange}
              className="w-full input"
              placeholder="State"
            />
          </div>

          {/* PIN Code */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-primary">PIN Code</label>
              <VisibilityToggle name="showCompanyAddressPostalCode" checked={localData.showCompanyAddressPostalCode} label="PIN" />
            </div>
            <input
              type="text"
              name="companyAddressPostalCode"
              value={localData.companyAddressPostalCode}
              onChange={handleChange}
              className="w-full input"
              placeholder="PIN Code"
            />
          </div>

          {/* Country */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-primary">Country</label>
              <VisibilityToggle name="showCompanyAddressCountry" checked={localData.showCompanyAddressCountry} label="Country" />
            </div>
            <input
              type="text"
              name="companyAddressCountry"
              value={localData.companyAddressCountry}
              onChange={handleChange}
              className="w-full input"
              placeholder="Country"
            />
          </div>

          <p className="text-xs text-secondary mt-2">Company address will be shown in vCard as WORK type</p>
        </div>
      </div>
    </div>
  );
};

export const UnifiedProfileEditor: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { profile, loading, error, exists, saving, createProfile, updateProfile, checkUsername } = useProfile();

  // Active tab
  const [activeTab, setActiveTab] = useState<TabType>('info');

  // Form state
  const [formData, setFormData] = useState<Partial<ProfileData>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Auto-save state
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingChangesRef = useRef<Partial<ProfileData> | null>(null);

  // Username validation
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);

  // Media state
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [uploading, setUploading] = useState<'avatar' | 'logo' | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Image cropper state
  const [cropperOpen, setCropperOpen] = useState(false);
  const [cropperImage, setCropperImage] = useState<string>('');
  const [cropperType, setCropperType] = useState<'avatar' | 'logo'>('avatar');

  // Links state
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [linksLoading, setLinksLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Appearance state
  const [appearance, setAppearance] = useState<AppearanceSettings>(DEFAULT_APPEARANCE);

  // QR Code state (auto-generated, persistent URL)
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [qrLoading, setQrLoading] = useState(false);

  // Initialize form data from profile
  useEffect(() => {
    if (profile) {
      setFormData({
        username: profile.username,
        displayName: profile.displayName,
        firstName: profile.firstName,
        lastName: profile.lastName,
        headline: profile.headline,
        company: profile.company,
        bio: profile.bio,
        publicEmail: profile.publicEmail,
        publicPhone: profile.publicPhone,
        website: profile.website,
        pronouns: profile.pronouns,
        published: profile.published,
        indexingOptIn: profile.indexingOptIn,
        // Contact visibility toggles
        showEmail: profile.showEmail ?? true,
        showPhone: profile.showPhone ?? true,
        showWebsite: profile.showWebsite ?? true,
        showBio: profile.showBio ?? true,
        // Company contact fields
        companyEmail: profile.companyEmail,
        companyPhone: profile.companyPhone,
        showCompanyEmail: profile.showCompanyEmail ?? true,
        showCompanyPhone: profile.showCompanyPhone ?? true,
        // Personal address fields
        addressLine1: profile.addressLine1,
        addressLine2: profile.addressLine2,
        addressCity: profile.addressCity,
        addressState: profile.addressState,
        addressPostalCode: profile.addressPostalCode,
        addressCountry: profile.addressCountry,
        showAddressLine1: profile.showAddressLine1 ?? false,
        showAddressLine2: profile.showAddressLine2 ?? false,
        showAddressCity: profile.showAddressCity ?? false,
        showAddressState: profile.showAddressState ?? false,
        showAddressPostalCode: profile.showAddressPostalCode ?? false,
        showAddressCountry: profile.showAddressCountry ?? false,
        // Company address fields
        companyAddressLine1: profile.companyAddressLine1,
        companyAddressLine2: profile.companyAddressLine2,
        companyAddressCity: profile.companyAddressCity,
        companyAddressState: profile.companyAddressState,
        companyAddressPostalCode: profile.companyAddressPostalCode,
        companyAddressCountry: profile.companyAddressCountry,
        showCompanyAddressLine1: profile.showCompanyAddressLine1 ?? false,
        showCompanyAddressLine2: profile.showCompanyAddressLine2 ?? false,
        showCompanyAddressCity: profile.showCompanyAddressCity ?? false,
        showCompanyAddressState: profile.showCompanyAddressState ?? false,
        showCompanyAddressPostalCode: profile.showCompanyAddressPostalCode ?? false,
        showCompanyAddressCountry: profile.showCompanyAddressCountry ?? false,
      });
      setAvatarUrl(profile.avatar || '');
      setLogoUrl(profile.logo || '');

      // Load appearance settings from API
      loadAppearanceSettings();
    }
  }, [profile]);

  // Load appearance settings from API
  const loadAppearanceSettings = async () => {
    try {
      const response = await authFetch('/api/profiles/me/appearance');
      if (response.ok) {
        const data = await response.json();
        if (data.settings) {
          setAppearance({ ...DEFAULT_APPEARANCE, ...data.settings });
        }
      }
    } catch (e) {
      console.error('Failed to load appearance settings:', e);
      // Fallback to localStorage for backward compatibility
      if (profile?.username) {
        const saved = localStorage.getItem(`appearance_${profile.username}`);
        if (saved) {
          try {
            setAppearance({ ...DEFAULT_APPEARANCE, ...JSON.parse(saved) });
          } catch (parseError) {
            console.error('Failed to parse localStorage appearance:', parseError);
          }
        }
      }
    }
  };

  // Load links when profile exists
  useEffect(() => {
    if (exists && profile) {
      fetchLinks();
      loadQRCode();
    }
  }, [exists, profile?.username]);

  // Username check with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.username && formData.username.length >= 3 && formData.username !== profile?.username) {
        handleUsernameCheck(formData.username);
      } else if (formData.username === profile?.username) {
        setUsernameAvailable(true);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [formData.username, profile?.username]);

  const handleUsernameCheck = async (username: string) => {
    try {
      setUsernameChecking(true);
      const result = await checkUsername(username);
      setUsernameAvailable(result.available);
      if (!result.available) {
        setFormErrors(prev => ({ ...prev, username: 'Username is already taken' }));
      } else {
        setFormErrors(prev => {
          const { username, ...rest } = prev;
          return rest;
        });
      }
    } catch (err) {
      console.error('Username check failed:', err);
    } finally {
      setUsernameChecking(false);
    }
  };

  const fetchLinks = async () => {
    try {
      setLinksLoading(true);
      const response = await authFetch('/api/profiles/me/social-links');
      if (!response.ok) throw new Error('Failed to fetch links');
      const data = await response.json();
      const allLinks = [...(data.featured || []), ...(data.custom || [])];
      setLinks(allLinks);
    } catch (err) {
      console.error('Error fetching links:', err);
    } finally {
      setLinksLoading(false);
    }
  };

  const loadQRCode = async () => {
    if (!profile?.username) return;
    setQrLoading(true);
    try {
      const url = await getQRCodeDataURL({ format: 'png', size: 300 });
      setQrCodeUrl(url);
    } catch (error) {
      console.error('Failed to load QR code:', error);
    } finally {
      setQrLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    const newValue = type === 'checkbox' ? checked : value;
    
    const newFormData = {
      ...formData,
      [name]: newValue,
    };
    
    setFormData(newFormData);
    setHasChanges(true);

    // Clear field error
    if (formErrors[name]) {
      setFormErrors(prev => {
        const { [name]: removed, ...rest } = prev;
        return rest;
      });
    }

    // For checkboxes (toggles), save immediately
    // For text fields, use debounced auto-save
    if (type === 'checkbox' && exists) {
      performAutoSave(newFormData);
    } else if (exists) {
      scheduleAutoSave(newFormData);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.username?.trim()) {
      errors.username = 'Username is required';
    } else if (!/^[a-zA-Z0-9_-]{3,30}$/.test(formData.username)) {
      errors.username = 'Username must be 3-30 characters (letters, numbers, _, -)';
    }

    if (!formData.displayName?.trim()) {
      errors.displayName = 'Display name is required';
    }

    if (formData.publicEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.publicEmail)) {
      errors.publicEmail = 'Invalid email format';
    }

    if (formData.companyEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.companyEmail)) {
      errors.companyEmail = 'Invalid email format';
    }

    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
      errors.website = 'Website must start with http:// or https://';
    }

    if (formData.bio && formData.bio.length > 500) {
      errors.bio = 'Bio must be 500 characters or less';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Debounced auto-save function for profile info
  const performAutoSave = useCallback(async (dataToSave: Partial<ProfileData>) => {
    // Skip auto-save if profile doesn't exist yet (need explicit create)
    if (!exists) return;
    
    // Basic validation before auto-save
    if (!dataToSave.displayName?.trim()) return;
    if (dataToSave.publicEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dataToSave.publicEmail)) return;
    if (dataToSave.companyEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dataToSave.companyEmail)) return;
    if (dataToSave.website && dataToSave.website.length > 0 && !/^https?:\/\/.+/.test(dataToSave.website)) return;
    if (dataToSave.bio && dataToSave.bio.length > 500) return;

    setAutoSaveStatus('saving');
    try {
      await updateProfile(dataToSave);
      setAutoSaveStatus('saved');
      setLastSaveTime(new Date());
      setHasChanges(false);
      // Reset to idle after 2 seconds
      setTimeout(() => setAutoSaveStatus('idle'), 2000);
    } catch (err) {
      console.error('Auto-save failed:', err);
      setAutoSaveStatus('error');
      // Keep error state visible longer
      setTimeout(() => setAutoSaveStatus('idle'), 5000);
    }
  }, [exists, updateProfile]);

  // Schedule auto-save with debouncing
  const scheduleAutoSave = useCallback((newFormData: Partial<ProfileData>) => {
    pendingChangesRef.current = newFormData;
    
    // Clear existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    // Schedule new auto-save after 1 second of inactivity
    autoSaveTimeoutRef.current = setTimeout(() => {
      if (pendingChangesRef.current) {
        performAutoSave(pendingChangesRef.current);
        pendingChangesRef.current = null;
      }
    }, 1000);
  }, [performAutoSave]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  // Handle updates from AI enhancement
  const handleEnhancementUpdate = (field: keyof ProfileData, value: string) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
    setHasChanges(true);
    
    if (exists) {
      scheduleAutoSave(newFormData);
    }
  };

  const handleSave = async () => {
    if (!validateForm()) {
      showToast('Please fix the errors before saving', 'error');
      return;
    }

    if (usernameAvailable === false) {
      showToast('Username is not available', 'error');
      return;
    }

    try {
      if (exists) {
        await updateProfile(formData);
        showToast('Profile saved successfully!', 'success');
      } else {
        await createProfile(formData);
        showToast('Profile created successfully!', 'success');
      }
      setHasChanges(false);
    } catch (err) {
      console.error('Failed to save profile:', err);
      showToast(err instanceof Error ? err.message : 'Failed to save profile', 'error');
    }
  };

  const handleImageUpload = async (file: File, type: 'avatar' | 'logo') => {
    if (!file.type.startsWith('image/')) {
      showToast('Please select an image file', 'error');
      return;
    }

    const maxSize = type === 'avatar' ? 5 * 1024 * 1024 : 2 * 1024 * 1024;
    if (file.size > maxSize) {
      showToast(`File size must be less than ${type === 'avatar' ? '5MB' : '2MB'}`, 'error');
      return;
    }

    // Read file and open cropper
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setCropperImage(base64);
      setCropperType(type);
      setCropperOpen(true);
    };
    reader.readAsDataURL(file);
  };

  // Handle cropped image upload
  const handleCroppedImageUpload = async (result: CropResult) => {
    const type = cropperType;
    setUploading(type);
    try {
      const response = await authFetch(`/api/uploads/${type}`, {
        method: 'POST',
        body: JSON.stringify({ image: result.base64 })
      });

      if (!response.ok) throw new Error('Upload failed');
      const data = await response.json();

      if (type === 'avatar') setAvatarUrl(data.url);
      else setLogoUrl(data.url);

      showToast(`${type === 'avatar' ? 'Photo' : 'Logo'} uploaded successfully!`, 'success');
    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
      showToast(`Failed to upload ${type}`, 'error');
    } finally {
      setUploading(null);
      // Clear file input
      if (type === 'avatar' && avatarInputRef.current) {
        avatarInputRef.current.value = '';
      } else if (logoInputRef.current) {
        logoInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = async (type: 'avatar' | 'logo') => {
    if (!confirm(`Remove your ${type}?`)) return;
    try {
      const response = await authFetch(`/api/uploads/${type}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Delete failed');

      if (type === 'avatar') setAvatarUrl('');
      else setLogoUrl('');

      showToast(`${type === 'avatar' ? 'Photo' : 'Logo'} removed`, 'success');
    } catch (error) {
      showToast(`Failed to remove ${type}`, 'error');
    }
  };

  const detectPlatform = (url: string) => {
    const platform = detectPlatformFromUrl(url);
    if (platform) {
      return { name: platform.name, logo: platform.logo };
    }
    return null;
  };

  const handleAddLink = async (url: string, label: string, isFeatured: boolean, customLogo?: string) => {
    const detected = detectPlatform(url);
    try {
      const response = await authFetch('/api/profiles/me/social-links', {
        method: 'POST',
        body: JSON.stringify({
          url,
          displayLabel: label || null,
          platform: detected?.name || null,
          customLogo: customLogo || detected?.logo || DEFAULT_LOGO,
          isFeatured
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add link');
      }

      await fetchLinks();
      setShowAddModal(false);
      showToast('Link added successfully!', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to add link', 'error');
    }
  };

  const handleDeleteLink = async (linkId: number) => {
    if (!confirm('Delete this link?')) return;
    try {
      const response = await authFetch(`/api/profiles/me/social-links/${linkId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete link');
      await fetchLinks();
      showToast('Link deleted', 'success');
    } catch (err) {
      showToast('Failed to delete link', 'error');
    }
  };

  const handleUpdateLink = async (linkId: number, updates: Partial<SocialLink>) => {
    try {
      const response = await authFetch(`/api/profiles/me/social-links/${linkId}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
      if (!response.ok) throw new Error('Failed to update link');
      await fetchLinks();
    } catch (err) {
      showToast('Failed to update link', 'error');
    }
  };

  const handleAppearanceChange = async (newSettings: AppearanceSettings) => {
    setAppearance(newSettings);

    // Save to API (persistent storage)
    try {
      const response = await authFetch('/api/profiles/me/appearance', {
        method: 'PUT',
        body: JSON.stringify({ settings: newSettings })
      });

      if (!response.ok) {
        throw new Error('Failed to save appearance settings');
      }

      // Also save to localStorage as backup
      if (profile?.username) {
        localStorage.setItem(`appearance_${profile.username}`, JSON.stringify(newSettings));
      }
    } catch (error) {
      console.error('Failed to save appearance settings to API:', error);
      // Fallback to localStorage only
      if (profile?.username) {
        localStorage.setItem(`appearance_${profile.username}`, JSON.stringify(newSettings));
      }
    }
  };

  const handleDownloadQR = async (format: 'png' | 'svg') => {
    try {
      const response = await authFetch(`/api/profiles/me/qr-code?format=${format}&size=1000`);
      if (!response.ok) throw new Error('Failed to download');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${profile?.username || 'profile'}-qr.${format}`;
      a.click();
      window.URL.revokeObjectURL(url);
      showToast(`QR code downloaded as ${format.toUpperCase()}`, 'success');
    } catch (error) {
      showToast('Failed to download QR code', 'error');
    }
  };

  const handleDownloadVCard = async () => {
    try {
      const response = await fetch(`/api/public/profile/${profile?.username}/vcard`);
      if (!response.ok) throw new Error('Failed to download vCard');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${profile?.username}.vcf`;
      a.click();
      window.URL.revokeObjectURL(url);
      showToast('vCard downloaded!', 'success');
    } catch (err) {
      showToast('Failed to download vCard', 'error');
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/#/u/${profile?.username}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: `${profile?.displayName}'s Profile`, url });
      } catch (err) {
        navigator.clipboard.writeText(url);
        showToast('Link copied to clipboard!', 'success');
      }
    } else {
      navigator.clipboard.writeText(url);
      showToast('Link copied to clipboard!', 'success');
    }
  };

  const profileUrl = `${window.location.origin}/#/u/${profile?.username || formData.username || 'username'}`;
  const sortedLinks = [...links].sort((a, b) => a.displayOrder - b.displayOrder);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-secondary">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // Tab content components
  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'info', label: 'Profile Info', icon: <User className="w-5 h-5" /> },
    { id: 'media', label: 'Photo & Logo', icon: <Image className="w-5 h-5" /> },
    { id: 'links', label: 'Links', icon: <Link2 className="w-5 h-5" /> },
    { id: 'address', label: 'Address', icon: <MapPin className="w-5 h-5" /> },
    { id: 'appearance', label: 'Appearance', icon: <Palette className="w-5 h-5" /> },
    { id: 'qr', label: 'QR Code', icon: <QrCode className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Top Header */}
      <header className="bg-surface border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/profile')}
                className="p-2 hover:bg-muted rounded-full transition-colors"
                title="Back to Dashboard"
              >
                <ChevronDown className="w-6 h-6 rotate-90" />
              </button>
              <h1 className="text-xl font-bold text-primary flex items-center gap-2">
                <FileText className="w-6 h-6 text-accent" />
                {exists ? 'Edit Profile' : 'Create Profile'}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              {/* Publish Status */}
              {exists && (
                <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm ${formData.published
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'bg-muted text-muted-foreground'
                  }`}>
                  {formData.published ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                  {formData.published ? 'Published' : 'Draft'}
                </span>
              )}

              {/* Preview Button */}
              {exists && formData.published && (
                <button
                  onClick={() => window.open(`/#/u/${profile?.username}`, '_blank')}
                  className="flex items-center gap-2 px-4 py-2 text-primary hover:bg-muted rounded-lg transition-colors"
                >
                  <Eye className="w-5 h-5" />
                  <span className="hidden sm:inline">Preview</span>
                </button>
              )}

              {/* Share Button */}
              {exists && formData.published && (
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 px-4 py-2 text-primary hover:bg-muted rounded-lg transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                  <span className="hidden sm:inline">Share</span>
                </button>
              )}

              {/* Auto-save Status / Create Button */}
              {exists ? (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm">
                  {autoSaveStatus === 'saving' && (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-accent" />
                      <span className="text-secondary hidden sm:inline">Saving...</span>
                    </>
                  )}
                  {autoSaveStatus === 'saved' && (
                    <>
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      <span className="text-emerald-600 dark:text-emerald-400 hidden sm:inline">Saved</span>
                    </>
                  )}
                  {autoSaveStatus === 'error' && (
                    <>
                      <AlertCircle className="w-4 h-4 text-red-500" />
                      <span className="text-red-600 dark:text-red-400 hidden sm:inline">Save failed</span>
                      <button
                        onClick={() => pendingChangesRef.current && performAutoSave(pendingChangesRef.current)}
                        className="text-xs text-accent hover:underline"
                      >
                        Retry
                      </button>
                    </>
                  )}
                  {autoSaveStatus === 'idle' && lastSaveTime && (
                    <>
                      <Cloud className="w-4 h-4 text-secondary" />
                      <span className="text-secondary hidden sm:inline">All changes saved</span>
                    </>
                  )}
                  {autoSaveStatus === 'idle' && !lastSaveTime && !hasChanges && (
                    <>
                      <Cloud className="w-4 h-4 text-secondary" />
                      <span className="text-secondary hidden sm:inline">Up to date</span>
                    </>
                  )}
                  {autoSaveStatus === 'idle' && hasChanges && (
                    <>
                      <Cloud className="w-4 h-4 text-amber-500" />
                      <span className="text-amber-600 dark:text-amber-400 hidden sm:inline">Unsaved changes</span>
                    </>
                  )}
                </div>
              ) : (
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors btn btn-primary"
                >
                  {saving ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <CheckCircle className="w-5 h-5" />
                  )}
                  <span className="hidden sm:inline">Create Profile</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Tab Navigation */}
            <div className="bg-surface rounded-xl shadow-sm border border-border mb-6">
              <div className="flex overflow-x-auto scrollbar-hide">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-4 font-medium whitespace-nowrap transition-colors border-b-2 ${activeTab === tab.id
                      ? 'border-accent text-accent'
                      : 'border-transparent text-secondary hover:text-primary'
                      }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="bg-surface rounded-xl shadow-sm border border-border p-6">

              {/* Profile Info Tab */}
              {activeTab === 'info' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <User className="w-6 h-6 text-accent" />
                    <h2 className="text-xl font-semibold text-primary">Profile Information</h2>
                  </div>

                  {/* Username */}
                  <div>
                    <label className="block text-sm font-medium text-primary mb-1">
                      Username <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="username"
                        value={formData.username || ''}
                        onChange={handleChange}
                        disabled={exists}
                        className={`w-full input ${formErrors.username ? 'border-red-500' : usernameAvailable === true ? 'border-emerald-500' : ''
                          } ${exists ? 'bg-muted cursor-not-allowed' : ''}`}
                        placeholder="johndoe"
                      />
                      {usernameChecking && (
                        <div className="absolute right-3 top-3">
                          <div className="animate-spin h-5 w-5 border-2 border-accent border-t-transparent rounded-full"></div>
                        </div>
                      )}
                      {!usernameChecking && usernameAvailable === true && (
                        <Check className="absolute right-3 top-3 w-5 h-5 text-emerald-500" />
                      )}
                      {!usernameChecking && usernameAvailable === false && (
                        <X className="absolute right-3 top-3 w-5 h-5 text-red-500" />
                      )}
                    </div>

                    {formErrors.username && <p className="mt-1 text-sm text-red-500">{formErrors.username}</p>}
                    <p className="mt-1 text-xs text-secondary">Your profile URL: {profileUrl}</p>
                  </div>

                  {/* Display Name */}
                  <div>
                    <label className="block text-sm font-medium text-primary mb-1">
                      Display Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="displayName"
                      value={formData.displayName || ''}
                      onChange={handleChange}
                      className={`w-full input ${formErrors.displayName ? 'border-red-500' : ''}`}
                      placeholder="John Doe"
                    />
                    {formErrors.displayName && <p className="mt-1 text-sm text-red-500">{formErrors.displayName}</p>}
                  </div>

                  {/* First & Last Name */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-primary mb-1">First Name</label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName || ''}
                        onChange={handleChange}
                        className="w-full input"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-primary mb-1">Last Name</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName || ''}
                        onChange={handleChange}
                        className="w-full input"
                        placeholder="Doe"
                      />
                    </div>
                  </div>

                  {/* Headline */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-sm font-medium text-primary">Headline</label>
                      <AIEnhanceButton
                        fieldType="headline"
                        currentText={formData.headline || ''}
                        onEnhanced={(text) => handleEnhancementUpdate('headline', text)}
                        additionalContext={formData.company ? `Company: ${formData.company}` : undefined}
                      />
                    </div>
                    <input
                      type="text"
                      name="headline"
                      value={formData.headline || ''}
                      onChange={handleChange}
                      className="w-full input"
                      placeholder="Software Engineer | Open Source Enthusiast"
                      maxLength={100}
                    />
                    <p className="mt-1 text-xs text-secondary">{(formData.headline || '').length}/100</p>
                  </div>

                  {/* Company */}
                  <div>
                    <label className="block text-sm font-medium text-primary mb-1">Company</label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company || ''}
                      onChange={handleChange}
                      className="w-full input"
                      placeholder="Acme Corp"
                    />
                  </div>

                  {/* Bio */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-sm font-medium text-primary">Bio</label>
                      <div className="flex items-center gap-3">
                        <AIEnhanceButton
                          fieldType="bio"
                          currentText={formData.bio || ''}
                          onEnhanced={(text) => handleEnhancementUpdate('bio', text)}
                          additionalContext={[
                            formData.headline ? `Headline: ${formData.headline}` : '',
                            formData.company ? `Company: ${formData.company}` : ''
                          ].filter(Boolean).join(', ')}
                        />
                        <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          name="showBio"
                          checked={formData.showBio ?? true}
                          onChange={handleChange}
                          className="sr-only peer"
                        />
                        <div className="relative w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-accent rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-accent"></div>
                        <span className="text-xs text-secondary">
                          {formData.showBio !== false ? 'Visible' : 'Hidden'}
                        </span>
                      </label>
                      </div>
                    </div>
                    <textarea
                      name="bio"
                      value={formData.bio || ''}
                      onChange={handleChange}
                      rows={4}
                      className={`w-full input ${formErrors.bio ? 'border-red-500' : ''}`}
                      placeholder="Tell people about yourself..."
                      maxLength={500}
                    />
                    {formErrors.bio && <p className="mt-1 text-sm text-red-500">{formErrors.bio}</p>}
                    <div className="flex justify-between mt-1">
                      <p className="text-xs text-secondary">{(formData.bio || '').length}/500</p>
                      {formData.showBio === false && (
                        <p className="text-xs text-amber-500">Bio will be hidden on public profile</p>
                      )}
                    </div>
                  </div>

                  {/* Contact Info Section */}
                  <div className="border-t border-border pt-6">
                    <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                      <Mail className="w-5 h-5 text-accent" />
                      Contact Information
                    </h3>
                    <p className="text-sm text-secondary mb-4">
                      Add contact details and control their visibility on your public profile and vCard.
                    </p>

                    {/* Personal Contact Section */}
                    <div className="mb-6">
                      <h4 className="text-md font-medium mb-3 text-primary flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Personal Contact
                      </h4>
                      <div className="space-y-4">
                        {/* Personal Email with Toggle */}
                        <div className="p-4 bg-muted/30 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-primary">Personal Email</label>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                name="showEmail"
                                checked={formData.showEmail ?? true}
                                onChange={handleChange}
                                className="sr-only peer"
                              />
                              <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                              <span className="ml-2 text-xs text-secondary">
                                {formData.showEmail !== false ? 'Visible' : 'Hidden'}
                              </span>
                            </label>
                          </div>
                          <input
                            type="email"
                            name="publicEmail"
                            value={formData.publicEmail || ''}
                            onChange={handleChange}
                            className={`w-full input ${formErrors.publicEmail ? 'border-red-500' : ''}`}
                            placeholder="john@personal.com"
                          />
                          {formErrors.publicEmail && <p className="mt-1 text-sm text-red-500">{formErrors.publicEmail}</p>}
                          <p className="mt-1 text-xs text-secondary">Personal email shown in vCard as HOME type</p>
                        </div>

                        {/* Personal Phone with Toggle */}
                        <div className="p-4 bg-muted/30 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-primary">Personal Phone</label>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                name="showPhone"
                                checked={formData.showPhone ?? true}
                                onChange={handleChange}
                                className="sr-only peer"
                              />
                              <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                              <span className="ml-2 text-xs text-secondary">
                                {formData.showPhone !== false ? 'Visible' : 'Hidden'}
                              </span>
                            </label>
                          </div>
                          <input
                            type="tel"
                            name="publicPhone"
                            value={formData.publicPhone || ''}
                            onChange={handleChange}
                            className="w-full input"
                            placeholder="+1 (555) 123-4567"
                          />
                          <p className="mt-1 text-xs text-secondary">Personal phone shown in vCard as CELL type</p>
                        </div>
                      </div>
                    </div>

                    {/* Company Contact Section */}
                    <div className="mb-6">
                      <h4 className="text-md font-medium mb-3 text-primary flex items-center gap-2">
                        <Briefcase className="w-4 h-4" />
                        Company Contact
                      </h4>
                      <div className="space-y-4">
                        {/* Company Email with Toggle */}
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                          <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-primary">Company Email</label>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                name="showCompanyEmail"
                                checked={formData.showCompanyEmail ?? true}
                                onChange={handleChange}
                                className="sr-only peer"
                              />
                              <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                              <span className="ml-2 text-xs text-secondary">
                                {formData.showCompanyEmail !== false ? 'Visible' : 'Hidden'}
                              </span>
                            </label>
                          </div>
                          <input
                            type="email"
                            name="companyEmail"
                            value={formData.companyEmail || ''}
                            onChange={handleChange}
                            className={`w-full input ${formErrors.companyEmail ? 'border-red-500' : ''}`}
                            placeholder="john@company.com"
                          />
                          {formErrors.companyEmail && <p className="mt-1 text-sm text-red-500">{formErrors.companyEmail}</p>}
                          <p className="mt-1 text-xs text-secondary">Work email shown in vCard as WORK type</p>
                        </div>

                        {/* Company Phone with Toggle */}
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                          <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-primary">Company Phone</label>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                name="showCompanyPhone"
                                checked={formData.showCompanyPhone ?? true}
                                onChange={handleChange}
                                className="sr-only peer"
                              />
                              <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                              <span className="ml-2 text-xs text-secondary">
                                {formData.showCompanyPhone !== false ? 'Visible' : 'Hidden'}
                              </span>
                            </label>
                          </div>
                          <input
                            type="tel"
                            name="companyPhone"
                            value={formData.companyPhone || ''}
                            onChange={handleChange}
                            className="w-full input"
                            placeholder="+1 (555) 987-6543"
                          />
                          <p className="mt-1 text-xs text-secondary">Work phone shown in vCard as WORK type</p>
                        </div>
                      </div>
                    </div>

                    {/* Website Section */}
                    <div className="space-y-4">
                      <div className="p-4 bg-muted/30 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-medium text-primary">Website</label>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              name="showWebsite"
                              checked={formData.showWebsite ?? true}
                              onChange={handleChange}
                              className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                            <span className="ml-2 text-xs text-secondary">
                              {formData.showWebsite !== false ? 'Visible' : 'Hidden'}
                            </span>
                          </label>
                        </div>
                        <input
                          type="url"
                          name="website"
                          value={formData.website || ''}
                          onChange={handleChange}
                          className={`w-full input ${formErrors.website ? 'border-red-500' : ''}`}
                          placeholder="https://example.com"
                        />
                        {formErrors.website && <p className="mt-1 text-sm text-red-500">{formErrors.website}</p>}
                        <p className="mt-1 text-xs text-secondary">Visitors can click to visit your website</p>
                      </div>
                    </div>
                  </div>

                  {/* Visibility Section */}
                  <div className="border-t border-border pt-6">
                    <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                      <Globe className="w-5 h-5 text-accent" />
                      Visibility Settings
                    </h3>

                    <div className="space-y-4">
                      <label className="flex items-center justify-between p-4 bg-muted/30 rounded-lg cursor-pointer">
                        <div>
                          <p className="font-medium text-primary">Make profile public</p>
                          <p className="text-sm text-secondary">Anyone with the link can view your profile</p>
                        </div>
                        <input
                          type="checkbox"
                          name="published"
                          checked={formData.published || false}
                          onChange={handleChange}
                          className="w-5 h-5 text-accent border-border rounded focus:ring-accent"
                        />
                      </label>

                      <label className={`flex items-center justify-between p-4 bg-muted/30 rounded-lg ${formData.published ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}>
                        <div>
                          <p className="font-medium text-primary">Allow search engine indexing</p>
                          <p className="text-sm text-secondary">Let Google and other search engines find your profile</p>
                        </div>
                        <input
                          type="checkbox"
                          name="indexingOptIn"
                          checked={formData.indexingOptIn || false}
                          onChange={handleChange}
                          disabled={!formData.published}
                          className="w-5 h-5 text-accent border-border rounded focus:ring-accent disabled:opacity-50"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Photo & Logo Tab */}
              {activeTab === 'media' && (
                <div className="space-y-8">
                  <div className="flex items-center gap-2 mb-4">
                    <Image className="w-6 h-6 text-purple-500" />
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Photo & Logo</h2>
                  </div>

                  {/* Hidden file inputs */}
                  <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'avatar')} />
                  <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'logo')} />

                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Profile Photo */}
                    <div className="text-center">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Profile Photo</h3>
                      <div className="relative inline-block group">
                        {avatarUrl ? (
                          <img src={avatarUrl} alt="Profile" className="w-40 h-40 rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-xl" />
                        ) : (
                          <div className="w-40 h-40 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-5xl font-bold border-4 border-white dark:border-gray-700 shadow-xl">
                            {formData.displayName?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                        )}
                        {uploading === 'avatar' && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                            <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        )}
                        <button
                          onClick={() => avatarInputRef.current?.click()}
                          disabled={uploading !== null}
                          className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Camera className="w-10 h-10 text-white" />
                        </button>
                        {avatarUrl && (
                          <button
                            onClick={() => handleRemoveImage('avatar')}
                            className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">Your main profile picture (max 5MB)</p>
                      <button
                        onClick={() => avatarInputRef.current?.click()}
                        disabled={uploading !== null}
                        className="mt-3 px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors disabled:opacity-50"
                      >
                        Upload Photo
                      </button>
                    </div>

                    {/* Logo */}
                    <div className="text-center">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Logo / Brand</h3>
                      <div className="relative inline-block group">
                        {logoUrl ? (
                          <img src={logoUrl} alt="Logo" className="w-32 h-32 rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-xl bg-white" />
                        ) : (
                          <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center border-4 border-dashed border-gray-300 dark:border-gray-600">
                            <Building2 className="w-12 h-12 text-gray-400" />
                          </div>
                        )}
                        {uploading === 'logo' && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        )}
                        <button
                          onClick={() => logoInputRef.current?.click()}
                          disabled={uploading !== null}
                          className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Camera className="w-8 h-8 text-white" />
                        </button>
                        {logoUrl && (
                          <button
                            onClick={() => handleRemoveImage('logo')}
                            className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">Company or brand logo (max 2MB)</p>
                      <button
                        onClick={() => logoInputRef.current?.click()}
                        disabled={uploading !== null}
                        className="mt-3 px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50"
                      >
                        Upload Logo
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Links Tab */}
              {activeTab === 'links' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Link2 className="w-6 h-6 text-purple-500" />
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Social Links</h2>
                    </div>
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Link
                    </button>
                  </div>

                  {linksLoading ? (
                    <div className="flex justify-center py-12">
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500"></div>
                    </div>
                  ) : sortedLinks.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                      <Link2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No links yet</h3>
                      <p className="text-gray-500 dark:text-gray-400 mb-6">Add links to your social profiles and websites</p>
                      <button
                        onClick={() => setShowAddModal(true)}
                        className="px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-full font-medium transition-colors"
                      >
                        Add your first link
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {sortedLinks.map((link) => (
                        <LinkCard
                          key={link.id}
                          link={link}
                          appearance={appearance}
                          onEdit={() => { }}
                          onDelete={() => handleDeleteLink(link.id)}
                          onToggleActive={() => handleUpdateLink(link.id, { isFeatured: !link.isFeatured })}
                          onUpdateLabel={(label) => handleUpdateLink(link.id, { displayLabel: label })}
                          onUpdateUrl={(url) => {
                            const detected = detectPlatform(url);
                            handleUpdateLink(link.id, {
                              url,
                              platform: detected?.name || link.platform,
                              customLogo: detected?.logo || link.customLogo
                            });
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Address Tab */}
              {activeTab === 'address' && (
                <AddressTabContent
                  formData={formData}
                  onSave={async (addressData) => {
                    try {
                      await updateProfile(addressData);
                      showToast('Address saved successfully!', 'success');
                    } catch (err) {
                      showToast('Failed to save address', 'error');
                    }
                  }}
                  onUpdateLocalData={(addressData) => {
                    setFormData(prev => ({ ...prev, ...addressData }));
                  }}
                />
              )}

              {/* Appearance Tab */}
              {activeTab === 'appearance' && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Palette className="w-6 h-6 text-purple-500" />
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Customize Appearance</h2>
                  </div>
                  <AppearancePanel
                    settings={appearance}
                    onChange={handleAppearanceChange}
                    profileData={{
                      username: formData.username || '',
                      displayName: formData.displayName || '',
                      bio: formData.bio,
                      avatar: avatarUrl,
                      logo: logoUrl,
                    }}
                  />
                </div>
              )}

              {/* QR Code Tab */}
              {activeTab === 'qr' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <QrCode className="w-6 h-6 text-purple-500" />
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Your QR Code</h2>
                  </div>

                  <div className="text-center">
                    <div className="bg-white p-6 rounded-xl shadow-lg inline-block mb-6">
                      {qrLoading ? (
                        <div className="w-64 h-64 flex items-center justify-center">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                        </div>
                      ) : qrCodeUrl ? (
                        <img src={qrCodeUrl} alt="Profile QR Code" className="w-64 h-64" />
                      ) : (
                        <div className="w-64 h-64 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg">
                          <QrCode className="w-16 h-16 text-gray-400" />
                        </div>
                      )}
                    </div>

                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      This QR code links to your profile: <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm">{profileUrl}</code>
                    </p>

                    <div className="flex justify-center gap-4">
                      <button
                        onClick={() => handleDownloadQR('png')}
                        className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        <Download className="w-5 h-5" />
                        Download PNG
                      </button>
                      <button
                        onClick={() => handleDownloadQR('svg')}
                        className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        <Download className="w-5 h-5" />
                        Download SVG
                      </button>
                    </div>

                    <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-left max-w-lg mx-auto">
                      <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">📱 Scanning Instructions</h3>
                      <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                        <li><strong>iOS:</strong> Open Camera app and point at QR code</li>
                        <li><strong>Android:</strong> Open Camera or Google Lens to scan</li>
                        <li><strong>Print:</strong> Great for business cards and presentations</li>
                      </ul>
                    </div>

                    {/* Download vCard */}
                    <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Download Contact Card</h3>
                      <button
                        onClick={handleDownloadVCard}
                        className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors mx-auto"
                      >
                        <Download className="w-5 h-5" />
                        Download vCard (.vcf)
                      </button>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        vCard can be imported directly into phone contacts
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Live Preview Sidebar (Desktop) */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-24">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4 text-center">Live Preview</h3>
              <MobilePreview
                profile={{
                  username: formData.username || '',
                  displayName: formData.displayName || '',
                  bio: formData.bio,
                  headline: formData.headline,
                  avatar: avatarUrl,
                  logo: logoUrl,
                  publicEmail: formData.publicEmail,
                  publicPhone: formData.publicPhone,
                  website: formData.website,
                  showEmail: formData.showEmail,
                  showPhone: formData.showPhone,
                  showWebsite: formData.showWebsite,
                  showBio: formData.showBio,
                  companyEmail: formData.companyEmail,
                  companyPhone: formData.companyPhone,
                  showCompanyEmail: formData.showCompanyEmail,
                  showCompanyPhone: formData.showCompanyPhone,
                  // Personal address fields
                  addressLine1: formData.addressLine1,
                  addressLine2: formData.addressLine2,
                  addressCity: formData.addressCity,
                  addressState: formData.addressState,
                  addressPostalCode: formData.addressPostalCode,
                  addressCountry: formData.addressCountry,
                  showAddressLine1: formData.showAddressLine1,
                  showAddressLine2: formData.showAddressLine2,
                  showAddressCity: formData.showAddressCity,
                  showAddressState: formData.showAddressState,
                  showAddressPostalCode: formData.showAddressPostalCode,
                  showAddressCountry: formData.showAddressCountry,
                  // Company address fields
                  companyAddressLine1: formData.companyAddressLine1,
                  companyAddressLine2: formData.companyAddressLine2,
                  companyAddressCity: formData.companyAddressCity,
                  companyAddressState: formData.companyAddressState,
                  companyAddressPostalCode: formData.companyAddressPostalCode,
                  companyAddressCountry: formData.companyAddressCountry,
                  showCompanyAddressLine1: formData.showCompanyAddressLine1,
                  showCompanyAddressLine2: formData.showCompanyAddressLine2,
                  showCompanyAddressCity: formData.showCompanyAddressCity,
                  showCompanyAddressState: formData.showCompanyAddressState,
                  showCompanyAddressPostalCode: formData.showCompanyAddressPostalCode,
                  showCompanyAddressCountry: formData.showCompanyAddressCountry,
                }}
                links={sortedLinks}
                appearance={appearance}
                profileUrl={formData.username ? `${window.location.origin}/u/${encodeURIComponent(formData.username)}` : undefined}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Add Link Modal */}
      {
        showAddModal && (
          <AddLinkModal
            isOpen={showAddModal}
            onClose={() => setShowAddModal(false)}
            onAdd={handleAddLink}
            existingLinksCount={links.length}
            featuredCount={links.filter(l => l.isFeatured).length}
          />
        )
      }

      {/* Image Cropper Modal */}
      <ImageCropper
        imageSrc={cropperImage}
        isOpen={cropperOpen}
        onClose={() => {
          setCropperOpen(false);
          setCropperImage('');
          // Clear file input
          if (cropperType === 'avatar' && avatarInputRef.current) {
            avatarInputRef.current.value = '';
          } else if (logoInputRef.current) {
            logoInputRef.current.value = '';
          }
        }}
        onCropComplete={handleCroppedImageUpload}
        aspectRatio={cropperType === 'avatar' ? 'avatar' : 'logo'}
        title={cropperType === 'avatar' ? 'Crop Profile Photo' : 'Crop Logo'}
        cropShape={cropperType === 'avatar' ? 'round' : 'rect'}
      />
    </div >
  );
};

export default UnifiedProfileEditor;
