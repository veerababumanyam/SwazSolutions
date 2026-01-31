import React, { useState, useEffect } from 'react';
import {
  Palette,
  Bell,
  Music,
  Zap,
  Lock,
  Globe,
  Loader2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import * as preferencesApi from '../services/preferencesApi';
import { UserPreferences } from '../types/preferences';
import { Footer } from '../components/Footer';

export const PreferencesPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingState, setSavingState] = useState<Record<string, boolean>>({});
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    appearance: true,
    notifications: true,
    music: true,
    ai: true,
    privacy: true,
    general: true,
  });

  // Load preferences on mount
  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const prefs = await preferencesApi.getPreferences();
      setPreferences(prefs);
    } catch (error) {
      console.error('Failed to load preferences:', error);
      showToast('Failed to load preferences', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSection = async (category: keyof UserPreferences, settings: any) => {
    try {
      setSavingState((prev) => ({ ...prev, [category]: true }));
      const updated = await preferencesApi.updatePreferences(category, settings);
      setPreferences(updated);
      showToast(`${category} preferences updated successfully`, 'success');
    } catch (error) {
      console.error(`Failed to save ${category} preferences:`, error);
      showToast(`Failed to save ${category} preferences`, 'error');
    } finally {
      setSavingState((prev) => ({ ...prev, [category]: false }));
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pb-20">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-accent mx-auto mb-4" />
          <p className="text-primary">Loading your preferences...</p>
        </div>
      </div>
    );
  }

  if (!preferences) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pb-20">
        <div className="text-center">
          <p className="text-primary">Failed to load preferences</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Page Header */}
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-primary mb-2">Preferences</h1>
        <p className="text-secondary">Customize your Swaz Solutions experience</p>
      </div>

      {/* Preferences Sections */}
      <div className="container mx-auto px-4 space-y-4 max-w-4xl">
        {/* Appearance Settings */}
        <AppearanceSection
          data={preferences.appearance}
          onSave={(settings) => handleSaveSection('appearance', settings)}
          saving={savingState['appearance']}
          expanded={expandedSections['appearance']}
          onToggle={() => toggleSection('appearance')}
        />

        {/* Notification Preferences */}
        <NotificationSection
          data={preferences.notifications}
          onSave={(settings) => handleSaveSection('notifications', settings)}
          saving={savingState['notifications']}
          expanded={expandedSections['notifications']}
          onToggle={() => toggleSection('notifications')}
        />

        {/* Music Player Preferences */}
        <MusicSection
          data={preferences.music}
          onSave={(settings) => handleSaveSection('music', settings)}
          saving={savingState['music']}
          expanded={expandedSections['music']}
          onToggle={() => toggleSection('music')}
        />

        {/* AI Lyric Studio Preferences */}
        <AISection
          data={preferences.ai}
          onSave={(settings) => handleSaveSection('ai', settings)}
          saving={savingState['ai']}
          expanded={expandedSections['ai']}
          onToggle={() => toggleSection('ai')}
        />

        {/* Privacy Preferences */}
        <PrivacySection
          data={preferences.privacy}
          onSave={(settings) => handleSaveSection('privacy', settings)}
          saving={savingState['privacy']}
          expanded={expandedSections['privacy']}
          onToggle={() => toggleSection('privacy')}
        />

        {/* General Settings */}
        <GeneralSection
          data={preferences.general}
          onSave={(settings) => handleSaveSection('general', settings)}
          saving={savingState['general']}
          expanded={expandedSections['general']}
          onToggle={() => toggleSection('general')}
        />
      </div>

      <Footer />
    </div>
  );
};

// ========================================
// SECTION COMPONENTS
// ========================================

interface SectionProps {
  data: any;
  onSave: (settings: any) => Promise<void>;
  saving: boolean;
  expanded: boolean;
  onToggle: () => void;
}

const AppearanceSection: React.FC<SectionProps> = ({ data, onSave, saving, expanded, onToggle }) => {
  const [localData, setLocalData] = useState(data);

  useEffect(() => {
    setLocalData(data);
  }, [data]);

  const handleSave = async () => {
    await onSave(localData);
  };

  return (
    <section className="glass-card">
      <div
        className="p-6 flex items-center justify-between cursor-pointer hover:bg-white/10 dark:hover:bg-white/5 rounded-t-2xl transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <Palette className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-primary">Appearance</h2>
            <p className="text-sm text-muted">Customize the look and feel</p>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-muted" />
        ) : (
          <ChevronDown className="w-5 h-5 text-muted" />
        )}
      </div>

      {expanded && (
        <div className="p-6 border-t border-border space-y-4">
          <div>
            <label className="block text-sm font-medium text-primary mb-2">Theme</label>
            <select
              value={localData.theme}
              onChange={(e) => setLocalData({ ...localData, theme: e.target.value })}
              className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-primary focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System Default</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-primary mb-2">Font Size</label>
            <select
              value={localData.fontSize}
              onChange={(e) => setLocalData({ ...localData, fontSize: e.target.value })}
              className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-primary focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
              <option value="x-large">Extra Large</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-primary">Reduce Motion</label>
            <input
              type="checkbox"
              checked={localData.reduceMotion}
              onChange={(e) => setLocalData({ ...localData, reduceMotion: e.target.checked })}
              className="w-5 h-5"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving || JSON.stringify(localData) === JSON.stringify(data)}
            className="w-full px-6 py-3 bg-brand-gradient text-white font-medium rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Changes
          </button>
        </div>
      )}
    </section>
  );
};

const NotificationSection: React.FC<SectionProps> = ({
  data,
  onSave,
  saving,
  expanded,
  onToggle,
}) => {
  const [localData, setLocalData] = useState(data);

  useEffect(() => {
    setLocalData(data);
  }, [data]);

  const handleSave = async () => {
    await onSave(localData);
  };

  return (
    <section className="glass-card">
      <div
        className="p-6 flex items-center justify-between cursor-pointer hover:bg-white/10 dark:hover:bg-white/5 rounded-t-2xl transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <Bell className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-primary">Notifications</h2>
            <p className="text-sm text-muted">Control notification behavior</p>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-muted" />
        ) : (
          <ChevronDown className="w-5 h-5 text-muted" />
        )}
      </div>

      {expanded && (
        <div className="p-6 border-t border-border space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-primary">Enable Notifications</label>
            <input
              type="checkbox"
              checked={localData.enabled}
              onChange={(e) => setLocalData({ ...localData, enabled: e.target.checked })}
              className="w-5 h-5"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-primary">Notification Sound</label>
            <input
              type="checkbox"
              checked={localData.sound}
              onChange={(e) => setLocalData({ ...localData, sound: e.target.checked })}
              disabled={!localData.enabled}
              className="w-5 h-5"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              Notification Duration (ms)
            </label>
            <input
              type="number"
              min="1000"
              max="10000"
              step="500"
              value={localData.duration}
              onChange={(e) => setLocalData({ ...localData, duration: parseInt(e.target.value) })}
              className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-primary focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <p className="text-xs text-muted mt-1">{localData.duration}ms</p>
          </div>

          <button
            onClick={handleSave}
            disabled={saving || JSON.stringify(localData) === JSON.stringify(data)}
            className="w-full px-6 py-3 bg-brand-gradient text-white font-medium rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Changes
          </button>
        </div>
      )}
    </section>
  );
};

const MusicSection: React.FC<SectionProps> = ({ data, onSave, saving, expanded, onToggle }) => {
  const [localData, setLocalData] = useState(data);

  useEffect(() => {
    setLocalData(data);
  }, [data]);

  const handleSave = async () => {
    await onSave(localData);
  };

  return (
    <section className="glass-card">
      <div
        className="p-6 flex items-center justify-between cursor-pointer hover:bg-white/10 dark:hover:bg-white/5 rounded-t-2xl transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <Music className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-primary">Music Player</h2>
            <p className="text-sm text-muted">Configure player behavior</p>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-muted" />
        ) : (
          <ChevronDown className="w-5 h-5 text-muted" />
        )}
      </div>

      {expanded && (
        <div className="p-6 border-t border-border space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-primary">Auto-play</label>
            <input
              type="checkbox"
              checked={localData.autoplay}
              onChange={(e) => setLocalData({ ...localData, autoplay: e.target.checked })}
              className="w-5 h-5"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              Crossfade Duration (seconds)
            </label>
            <input
              type="number"
              min="0"
              max="10"
              value={localData.crossfadeDuration}
              onChange={(e) =>
                setLocalData({ ...localData, crossfadeDuration: parseInt(e.target.value) })
              }
              className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-primary focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-primary">Volume Normalization</label>
            <input
              type="checkbox"
              checked={localData.volumeNormalization}
              onChange={(e) =>
                setLocalData({ ...localData, volumeNormalization: e.target.checked })
              }
              className="w-5 h-5"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-primary mb-2">Download Quality</label>
            <select
              value={localData.downloadQuality}
              onChange={(e) => setLocalData({ ...localData, downloadQuality: e.target.value })}
              className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-primary focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="lossless">Lossless</option>
            </select>
          </div>

          <button
            onClick={handleSave}
            disabled={saving || JSON.stringify(localData) === JSON.stringify(data)}
            className="w-full px-6 py-3 bg-brand-gradient text-white font-medium rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Changes
          </button>
        </div>
      )}
    </section>
  );
};

const AISection: React.FC<SectionProps> = ({ data, onSave, saving, expanded, onToggle }) => {
  const [localData, setLocalData] = useState(data);

  useEffect(() => {
    setLocalData(data);
  }, [data]);

  const handleSave = async () => {
    await onSave(localData);
  };

  return (
    <section className="glass-card">
      <div
        className="p-6 flex items-center justify-between cursor-pointer hover:bg-white/10 dark:hover:bg-white/5 rounded-t-2xl transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <Zap className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-primary">AI Lyric Studio</h2>
            <p className="text-sm text-muted">Configure AI generation defaults</p>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-muted" />
        ) : (
          <ChevronDown className="w-5 h-5 text-muted" />
        )}
      </div>

      {expanded && (
        <div className="p-6 border-t border-border space-y-4">
          <div>
            <label className="block text-sm font-medium text-primary mb-2">Default Language</label>
            <input
              type="text"
              value={localData.defaultLanguage}
              onChange={(e) => setLocalData({ ...localData, defaultLanguage: e.target.value })}
              placeholder="e.g., English"
              className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-primary focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-primary mb-2">Default Ceremony</label>
            <input
              type="text"
              value={localData.defaultCeremony}
              onChange={(e) => setLocalData({ ...localData, defaultCeremony: e.target.value })}
              placeholder="e.g., modern"
              className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-primary focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              Temperature Preference
            </label>
            <select
              value={localData.temperaturePreference}
              onChange={(e) =>
                setLocalData({ ...localData, temperaturePreference: e.target.value })
              }
              className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-primary focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="precise">Precise</option>
              <option value="balanced">Balanced</option>
              <option value="creative">Creative</option>
            </select>
            <p className="text-xs text-muted mt-1">
              Precise: More consistent | Balanced: Mix | Creative: More varied
            </p>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-primary">Auto-save Drafts</label>
            <input
              type="checkbox"
              checked={localData.autoSaveDrafts}
              onChange={(e) => setLocalData({ ...localData, autoSaveDrafts: e.target.checked })}
              className="w-5 h-5"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving || JSON.stringify(localData) === JSON.stringify(data)}
            className="w-full px-6 py-3 bg-brand-gradient text-white font-medium rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Changes
          </button>
        </div>
      )}
    </section>
  );
};

const PrivacySection: React.FC<SectionProps> = ({ data, onSave, saving, expanded, onToggle }) => {
  const [localData, setLocalData] = useState(data);

  useEffect(() => {
    setLocalData(data);
  }, [data]);

  const handleSave = async () => {
    await onSave(localData);
  };

  return (
    <section className="glass-card">
      <div
        className="p-6 flex items-center justify-between cursor-pointer hover:bg-white/10 dark:hover:bg-white/5 rounded-t-2xl transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <Lock className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-primary">Privacy</h2>
            <p className="text-sm text-muted">Control your privacy settings</p>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-muted" />
        ) : (
          <ChevronDown className="w-5 h-5 text-muted" />
        )}
      </div>

      {expanded && (
        <div className="p-6 border-t border-border space-y-4">
          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              Profile Visibility
            </label>
            <select
              value={localData.profileVisibility}
              onChange={(e) =>
                setLocalData({ ...localData, profileVisibility: e.target.value })
              }
              className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-primary focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-primary">Analytics Tracking</label>
            <input
              type="checkbox"
              checked={localData.analyticsTracking}
              onChange={(e) =>
                setLocalData({ ...localData, analyticsTracking: e.target.checked })
              }
              className="w-5 h-5"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-primary">Show Activity Status</label>
            <input
              type="checkbox"
              checked={localData.activityStatus}
              onChange={(e) => setLocalData({ ...localData, activityStatus: e.target.checked })}
              className="w-5 h-5"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving || JSON.stringify(localData) === JSON.stringify(data)}
            className="w-full px-6 py-3 bg-brand-gradient text-white font-medium rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Changes
          </button>
        </div>
      )}
    </section>
  );
};

const GeneralSection: React.FC<SectionProps> = ({ data, onSave, saving, expanded, onToggle }) => {
  const [localData, setLocalData] = useState(data);

  useEffect(() => {
    setLocalData(data);
  }, [data]);

  const handleSave = async () => {
    await onSave(localData);
  };

  return (
    <section className="glass-card">
      <div
        className="p-6 flex items-center justify-between cursor-pointer hover:bg-white/10 dark:hover:bg-white/5 rounded-t-2xl transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <Globe className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-primary">General</h2>
            <p className="text-sm text-muted">Regional and localization settings</p>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-muted" />
        ) : (
          <ChevronDown className="w-5 h-5 text-muted" />
        )}
      </div>

      {expanded && (
        <div className="p-6 border-t border-border space-y-4">
          <div>
            <label className="block text-sm font-medium text-primary mb-2">Language</label>
            <input
              type="text"
              value={localData.language}
              onChange={(e) => setLocalData({ ...localData, language: e.target.value })}
              placeholder="e.g., en"
              className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-primary focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-primary mb-2">Date Format</label>
            <select
              value={localData.dateFormat}
              onChange={(e) => setLocalData({ ...localData, dateFormat: e.target.value })}
              className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-primary focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="MM/DD/YYYY">MM/DD/YYYY (US)</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY (EU)</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD (ISO)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-primary mb-2">Timezone</label>
            <input
              type="text"
              value={localData.timezone}
              onChange={(e) => setLocalData({ ...localData, timezone: e.target.value })}
              placeholder="e.g., auto or UTC"
              className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-primary focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving || JSON.stringify(localData) === JSON.stringify(data)}
            className="w-full px-6 py-3 bg-brand-gradient text-white font-medium rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Changes
          </button>
        </div>
      )}
    </section>
  );
};
