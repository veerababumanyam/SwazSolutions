
import React, { useState, useEffect } from "react";
import { Feather, CheckCircle, Languages, Sparkles, Mic2, Heart, Palette, ListOrdered, Users, Save, Download, Trash2, Layout, ChevronRight, ChevronDown, Coffee, Sliders, Wand2, HelpCircle, X, Key, ExternalLink, Eye, EyeOff, Map, FileText, Music, Copy, Check } from "lucide-react";
import { AgentStatus, LanguageProfile, GenerationSettings, SavedProfile, SavedSong, CeremonyDefinition } from "../agents/types";
import { SCENARIO_KNOWLEDGE_BASE, MOOD_OPTIONS, STYLE_OPTIONS, COMPLEXITY_OPTIONS, RHYME_SCHEME_OPTIONS, SINGER_CONFIG_OPTIONS, THEME_OPTIONS, ALL_LANGUAGES } from "../agents/constants";

interface SidebarProps {
  isOpen: boolean;
  onCloseMobile?: () => void;
  agentStatus: AgentStatus;
  languageSettings: LanguageProfile;
  onLanguageChange: (type: keyof LanguageProfile, value: string) => void;
  generationSettings: GenerationSettings;
  onSettingChange: (type: keyof GenerationSettings, value: string) => void;
  onLoadProfile: (lang: LanguageProfile, gen: GenerationSettings) => void;
  onOpenHelp: () => void;
  onOpenSettings: () => void;
  savedSongs: SavedSong[];
  onDeleteSong: (id: string) => void;
  onLoadSong: (song: SavedSong) => void;
  fontSize?: number;
  onApiKeyChange?: (key: string) => void;
}

const PRO_PROMPTS = [
  {
    title: "Mass / Action (Hero)",
    text: "Write a high-energy Hero Intro song for a Mass Action movie. Theme: Power, Fearlessness. Style: Rap/Hip-Hop mixed with Dappankuthu beats. Lyrics should praise the protagonist's strength."
  },
  {
    title: "Deep Romance (Melody)",
    text: "Write a soulful Romantic duet. Theme: Eternal Love. Mood: Ethereal. Style: Cinematic Melody. Structure: Intro -> Verse 1 -> Chorus -> Bridge -> Outro. Use poetic metaphors."
  },
  {
    title: "Heartbreak (Soup Song)",
    text: "Write a 'Soup Song' (Love Failure) with a funny-sad vibe. Style: Folk + Gaana. Language: Tanglish (Tamil + English). Theme: Betrayal by a lover."
  },
  {
    title: "Devotional / Classical",
    text: "Write a traditional Devotional song dedicated to Lord Shiva. Mood: Spiritual/Powerful. Style: Classical Carnatic fusion. Use Sanskrit words."
  },
  {
    title: "Item / Party Song",
    text: "Write a catchy Item Number / Party Song. Mood: Energetic. Style: Bollywood Dance. Use Gen-Z slang and English hook lines."
  },
  {
    title: "Suno Optimized Structure",
    text: "Write a song structured specifically for Suno.com. Include meta-tags like [Intro], [Verse], [Chorus], [Bridge], [Outro]. Style: Synthwave. Theme: Cyberpunk City."
  }
];

const SidebarSection = ({
  title,
  icon,
  children,
  defaultOpen = false,
  badge,
  fontSize = 16
}: {
  title: string,
  icon: React.ReactNode,
  children?: React.ReactNode,
  defaultOpen?: boolean,
  badge?: React.ReactNode,
  fontSize?: number
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-background transition-colors group outline-none"
      >
        <span className="font-bold uppercase tracking-wide flex items-center gap-2 text-primary group-hover:text-accent transition-colors min-w-0" style={{ fontSize: `${fontSize * 0.875}px` }}>
          {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: "w-5 h-5 flex-shrink-0 text-accent" }) : icon}
          <span className="truncate">{title}</span>
        </span>
        <div className="flex items-center gap-3 ml-2 flex-shrink-0">
          {badge}
          <ChevronDown className={`w-5 h-5 text-secondary transition-transform duration-300 flex-shrink-0 ${isOpen ? "rotate-180" : ""}`} />
        </div>
      </button>
      <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
        <div className="overflow-hidden min-h-0">
          <div className="p-4 pt-0 space-y-4 bg-background/30">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

const AgentCard = ({ icon, name, desc, active, fontSize = 16 }: { icon: React.ReactNode, name: string, desc: string, active: boolean, fontSize?: number }) => (
  <div className={`flex items-center gap-3 p-3 rounded-lg transition-all border ${active
    ? "bg-accent-light border-accent shadow-sm"
    : "border-border bg-surface hover:border-accent/30"
    }`}>
    <div className={`p-2 rounded-full ${active
      ? "text-accent bg-accent/10"
      : "text-secondary bg-background"
      }`}>
      {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: "w-4 h-4" }) : icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className={`font-semibold truncate ${active ? "text-primary" : "text-secondary"}`} style={{ fontSize: `${fontSize * 0.875}px` }}>{name}</p>
      <p className="text-muted truncate" style={{ fontSize: `${fontSize * 0.75}px` }}>{desc}</p>
    </div>
    {active && <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />}
  </div>
);

const PreferenceSelect = ({
  label,
  icon,
  value,
  options,
  customValue,
  onChange,
  onCustomChange,
  compact = false,
  fontSize = 16
}: {
  label: string,
  icon: React.ReactNode,
  value: string,
  options: string[],
  customValue: string,
  onChange: (val: string) => void,
  onCustomChange: (val: string) => void,
  compact?: boolean,
  fontSize?: number
}) => (
  <div className="space-y-2 w-full">
    <label className="font-bold text-primary flex items-center gap-2 truncate" title={label} style={{ fontSize: `${fontSize * 0.875}px` }}>
      {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: "w-4 h-4 text-accent" }) : icon}
      {label}
    </label>
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input block p-2.5 pr-10 cursor-pointer appearance-none font-medium shadow-sm"
        style={{ fontSize: `${fontSize}px` }}
      >
        {options.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-secondary">
        <ChevronDown className="w-5 h-5" />
      </div>
    </div>
    {value === "Custom" && (
      <input
        type="text"
        value={customValue}
        onChange={(e) => onCustomChange(e.target.value)}
        placeholder="Type custom..."
        className="input block p-2.5 animate-fade-in font-medium"
        style={{ fontSize: `${fontSize}px` }}
      />
    )}
  </div>
);

export const LyricSidebar: React.FC<SidebarProps> = ({
  isOpen,
  onCloseMobile,
  agentStatus,
  languageSettings,
  onLanguageChange,
  generationSettings,
  onSettingChange,
  onLoadProfile,
  onOpenHelp,
  onOpenSettings,
  savedSongs,
  onDeleteSong,
  onLoadSong,
  fontSize = 14,
  onApiKeyChange
}) => {
  const [profileName, setProfileName] = useState("");
  const [savedProfiles, setSavedProfiles] = useState<SavedProfile[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [autoConfigured, setAutoConfigured] = useState(false);

  // API Key State - Initialize from LocalStorage
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("swaz_gemini_api_key") || "");
  const [showApiKey, setShowApiKey] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Help Modal State
  const [activeHelpTab, setActiveHelpTab] = useState<'tour' | 'prompts' | 'suno' | 'setup'>('tour');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  useEffect(() => {
    const saved = localStorage.getItem("geetgatha_profiles");
    if (saved) {
      try {
        setSavedProfiles(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved profiles", e);
      }
    }
  }, []);

  const saveApiKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem("swaz_gemini_api_key", apiKey.trim());
      if (onApiKeyChange) onApiKeyChange(apiKey.trim());
      alert("API Key Saved Securely.");
    } else {
      localStorage.removeItem("swaz_gemini_api_key");
      if (onApiKeyChange) onApiKeyChange("");
    }
  };

  useEffect(() => {
    if (generationSettings.category && !activeCategory) {
      setActiveCategory(generationSettings.category);
    }
  }, [generationSettings.category]);

  useEffect(() => {
    if (autoConfigured) {
      const timer = setTimeout(() => setAutoConfigured(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [autoConfigured]);

  const handleSaveProfile = () => {
    if (!profileName.trim()) return;
    const newProfile: SavedProfile = {
      id: Date.now().toString(),
      name: profileName,
      language: languageSettings,
      generation: generationSettings,
      timestamp: Date.now()
    };
    const updated = [newProfile, ...savedProfiles];
    setSavedProfiles(updated);
    localStorage.setItem("geetgatha_profiles", JSON.stringify(updated));
    setProfileName("");
  };

  const handleDeleteProfile = (id: string) => {
    const updated = savedProfiles.filter(p => p.id !== id);
    setSavedProfiles(updated);
    localStorage.setItem("geetgatha_profiles", JSON.stringify(updated));
  };

  const handleLoadProfile = (profile: SavedProfile) => {
    onLoadProfile(profile.language, profile.generation);
  };

  const handleCeremonySelect = (category: string, event: CeremonyDefinition) => {
    onSettingChange('category', category);
    onSettingChange('ceremony', event.id);
    onSettingChange('theme', event.label);
    onSettingChange('mood', event.defaultMood);
    onSettingChange('style', event.defaultStyle);
    onSettingChange('complexity', event.defaultComplexity);
    onSettingChange('rhymeScheme', event.defaultRhyme);
    onSettingChange('singerConfig', event.defaultSinger);
    setAutoConfigured(true);
  };

  const isMixed = languageSettings.primary !== languageSettings.secondary || languageSettings.primary !== languageSettings.tertiary;

  const sidebarClasses = `
    fixed top-20 left-0 z-50 bg-surface/95 backdrop-blur-xl border-r border-border 
    flex flex-col shadow-2xl h-[calc(100vh-5rem)] transition-transform duration-300 ease-in-out
    w-72 lg:w-80
    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
  `;

  return (
    <>
      <aside className={sidebarClasses} style={{ fontSize: `${fontSize}px` }}>
        {/* Mobile Close Button */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-border bg-surface/50">
          <h2 className="font-bold text-primary">Studio Config</h2>
          <button onClick={onCloseMobile} className="p-2 hover:bg-accent/10 hover:text-accent rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin pb-6 pt-4">
          {/* 1. Language Studio */}
          <SidebarSection
            title="Language Mix"
            icon={<Languages />}
            defaultOpen={true}
            fontSize={fontSize}
            badge={isMixed && <span className="bg-brand-gradient text-white px-2 py-0.5 rounded-full flex items-center gap-1 font-bold text-[10px] shadow-sm"><Sparkles className="w-3 h-3" /> Fusion</span>}
          >
            <div className="space-y-4 relative">
              <div>
                <label className="font-bold text-primary mb-2 flex items-center justify-between" style={{ fontSize: `${fontSize * 0.875}px` }}>
                  <span>PRIMARY LANGUAGE</span>
                  <span className="text-white bg-accent px-2 py-1 rounded font-bold text-[10px] shadow-sm">Base</span>
                </label>
                <div className="relative">
                  <select
                    value={languageSettings.primary}
                    onChange={(e) => {
                      const newLang = e.target.value;
                      onLanguageChange('primary', newLang);
                      if (languageSettings.secondary === languageSettings.primary) onLanguageChange('secondary', newLang);
                      if (languageSettings.tertiary === languageSettings.primary) onLanguageChange('tertiary', newLang);
                    }}
                    className="input border-2 border-accent block p-3 pr-10 cursor-pointer shadow-sm hover:shadow-md bg-surface"
                  >
                    {ALL_LANGUAGES.map(lang => (
                      <option key={lang} value={lang}>{lang}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-accent flex-shrink-0">
                    <ChevronDown className="w-5 h-5" />
                  </div>
                </div>
              </div>

              <div className="absolute left-4 top-[60px] bottom-[30px] w-0.5 bg-gradient-to-b from-border to-transparent -z-10"></div>

              <div className="grid grid-cols-2 gap-3 pl-2">
                {['secondary', 'tertiary'].map((level) => (
                  <div key={level} className="space-y-1.5">
                    <label className="font-bold flex items-center gap-1.5 truncate text-secondary text-xs">
                      <span className={`w-2 h-2 rounded-full ${level === 'secondary' ? 'bg-muted' : 'bg-border'} flex-shrink-0`}></span>
                      <span className="truncate capitalize">{level}</span>
                    </label>
                    <div className="relative">
                      <select
                        value={level === 'secondary' ? languageSettings.secondary : languageSettings.tertiary}
                        onChange={(e) => onLanguageChange(level as any, e.target.value)}
                        className="input block p-2 pr-7 appearance-none text-sm bg-background hover:bg-surface border-border"
                      >
                        {ALL_LANGUAGES.map(lang => (
                          <option key={lang} value={lang}>{lang}</option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none flex-shrink-0 text-muted">
                        <ChevronDown className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </SidebarSection>

          {/* 2. Context & Situation */}
          <SidebarSection
            title="Context"
            icon={<Coffee />}
            defaultOpen={true}
            fontSize={fontSize}
            badge={autoConfigured && (
              <span className="flex items-center gap-1 bg-accent-light text-accent px-2 py-0.5 rounded-full animate-pulse border border-accent/20 text-[10px] font-bold">
                <Wand2 className="w-3 h-3" /> Optimized
              </span>
            )}
          >
            <div className="space-y-0.5">
              {SCENARIO_KNOWLEDGE_BASE.map((category) => (
                <div key={category.id} className="overflow-hidden transition-colors">
                  <button
                    onClick={() => setActiveCategory(activeCategory === category.id ? "" : category.id)}
                    className={`
                       w-full flex items-center justify-between p-2 text-left transition-all rounded-md text-sm
                       ${activeCategory === category.id ? "bg-background font-bold text-primary" : "text-secondary hover:bg-background"}
                     `}
                  >
                    <span>{category.label}</span>
                    <ChevronRight className={`w-3 h-3 transition-transform duration-200 opacity-50 ${activeCategory === category.id ? "rotate-90" : ""}`} />
                  </button>

                  <div className={`
                     grid transition-all duration-300 ease-in-out
                     ${activeCategory === category.id ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}
                   `}>
                    <div className="overflow-hidden">
                      <div className="pl-3 pr-1 py-1 grid grid-cols-1 gap-1 border-l-2 border-border ml-2.5 my-1">
                        {category.events.map((event) => (
                          <button
                            key={event.id}
                            title={event.promptContext}
                            onClick={() => handleCeremonySelect(category.id, event)}
                            className={`
                               text-left px-2.5 py-1.5 rounded-md transition-all flex items-center justify-between group relative text-xs
                               ${generationSettings.ceremony === event.id
                                ? "bg-accent/10 font-semibold text-accent"
                                : "text-secondary hover:bg-background"
                              }
                             `}
                          >
                            <span className="truncate mr-2">{event.label}</span>
                            {generationSettings.ceremony === event.id && <CheckCircle className="w-3 h-3 flex-shrink-0" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SidebarSection>

          {/* 3. Fine Tuning */}
          <SidebarSection title="Fine Tuning" icon={<Sliders />} defaultOpen={true} fontSize={fontSize}>
            <div className="space-y-4">
              <PreferenceSelect
                label="Theme Override"
                icon={<Palette className="w-3 h-3" />}
                value={generationSettings.theme}
                options={THEME_OPTIONS}
                customValue={generationSettings.customTheme}
                onChange={(val) => onSettingChange('theme', val)}
                onCustomChange={(val) => onSettingChange('customTheme', val)}
                fontSize={fontSize}
              />

              <div className="grid grid-cols-2 gap-3 w-full">
                <PreferenceSelect
                  label="Emotional Mood"
                  icon={<Heart className="w-3 h-3" />}
                  value={generationSettings.mood}
                  options={MOOD_OPTIONS}
                  customValue={generationSettings.customMood}
                  onChange={(val) => onSettingChange('mood', val)}
                  onCustomChange={(val) => onSettingChange('customMood', val)}
                  compact
                  fontSize={fontSize}
                />

                <PreferenceSelect
                  label="Musical Style"
                  icon={<Mic2 className="w-3 h-3" />}
                  value={generationSettings.style}
                  options={STYLE_OPTIONS}
                  customValue={generationSettings.customStyle}
                  onChange={(val) => onSettingChange('style', val)}
                  onCustomChange={(val) => onSettingChange('customStyle', val)}
                  compact
                  fontSize={fontSize}
                />
              </div>

              <div className="grid grid-cols-2 gap-3 w-full">
                <PreferenceSelect
                  label="Singer Config"
                  icon={<Users className="w-3 h-3" />}
                  value={generationSettings.singerConfig}
                  options={SINGER_CONFIG_OPTIONS}
                  customValue={generationSettings.customSingerConfig || ""}
                  onChange={(val) => onSettingChange('singerConfig', val)}
                  onCustomChange={(val) => onSettingChange('customSingerConfig', val)}
                  compact
                  fontSize={fontSize}
                />

                <PreferenceSelect
                  label="Rhyme Pattern"
                  icon={<ListOrdered className="w-3 h-3" />}
                  value={generationSettings.rhymeScheme}
                  options={RHYME_SCHEME_OPTIONS}
                  customValue={generationSettings.customRhymeScheme}
                  onChange={(val) => onSettingChange('rhymeScheme', val)}
                  onCustomChange={(val) => onSettingChange('customRhymeScheme', val)}
                  compact
                  fontSize={fontSize}
                />
              </div>

              <div className="space-y-2 pt-1 w-full">
                <label className="font-bold flex items-center gap-1.5 text-primary" style={{ fontSize: `${fontSize * 0.875}px` }}>
                  <Feather className="w-3 h-3 flex-shrink-0 text-accent" /> Complexity
                </label>
                <div className="relative">
                  <select
                    value={generationSettings.complexity}
                    onChange={(e) => onSettingChange('complexity', e.target.value as any)}
                    className="input block p-2.5 pr-8 text-sm"
                  >
                    {COMPLEXITY_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-secondary">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          </SidebarSection>

          {/* 4. Song Library */}
          <SidebarSection
            title="Song Library"
            icon={<Music />}
            fontSize={fontSize}
            badge={savedSongs.length > 0 ? <span className="bg-border px-1.5 py-0.5 rounded-full text-secondary text-[10px] font-bold">{savedSongs.length}</span> : null}
          >
            <div className="space-y-2 w-full">
              {savedSongs.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
                  {savedSongs.map(song => (
                    <div key={song.id} className="flex items-center justify-between bg-surface p-2.5 rounded-lg border border-border/50 hover:border-accent/30 group transition-all shadow-sm">
                      <div className="flex flex-col min-w-0 flex-1 mr-2">
                        <span className="font-bold truncate text-sm text-primary group-hover:text-accent transition-colors">{song.title}</span>
                        <div className="flex items-center gap-2 text-[10px] text-secondary mt-0.5">
                          <span className="truncate max-w-[80px] bg-muted/20 px-1.5 rounded">{song.language}</span>
                          <span>•</span>
                          <span>{new Date(song.timestamp).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onLoadSong(song)}
                          title="Load Song"
                          className="text-primary hover:bg-accent/10 hover:text-accent p-1.5 rounded transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5 rotate-180" /> {/* Using ExternalLink rotated to look like Load/Import */}
                        </button>
                        <button
                          onClick={() => onDeleteSong(song.id)}
                          title="Delete Song"
                          className="text-muted hover:bg-red-50 hover:text-red-500 p-1.5 rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 border border-dashed border-border rounded-lg">
                  <p className="text-xs text-muted font-medium">Save songs here to keep them forever</p>
                </div>
              )}
            </div>
          </SidebarSection>

          {/* 5. Saved Profiles */}
          <SidebarSection
            title="Saved Configs"
            icon={<Layout />}
            fontSize={fontSize}
            badge={savedProfiles.length > 0 ? <span className="bg-border px-1.5 py-0.5 rounded-full text-secondary text-[10px] font-bold">{savedProfiles.length}</span> : null}
          >
            <div className="space-y-3 w-full">
              <div className="flex gap-2 w-full">
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="Name config..."
                  className="input flex-1 px-3 py-2 text-sm"
                />
                <button
                  onClick={handleSaveProfile}
                  disabled={!profileName}
                  className="btn btn-primary px-3 flex-shrink-0"
                >
                  <Save className="w-3.5 h-3.5" />
                </button>
              </div>

              {savedProfiles.length > 0 ? (
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {savedProfiles.map(profile => (
                    <div key={profile.id} className="flex items-center justify-between bg-surface p-2 rounded-lg border border-border/50 hover:border-border group transition-all shadow-sm">
                      <div className="flex flex-col min-w-0">
                        <span className="font-medium truncate text-sm">{profile.name}</span>
                        <span className="truncate text-xs text-secondary">{profile.language.primary} • {profile.generation.theme}</span>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleLoadProfile(profile)} className="text-primary hover:bg-background p-1.5 rounded"><Download className="w-3 h-3" /></button>
                        <button onClick={() => handleDeleteProfile(profile.id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded"><Trash2 className="w-3 h-3" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 border border-dashed border-border rounded-lg text-xs text-muted">
                  No saved configs
                </div>
              )}
            </div>
          </SidebarSection>

          {/* 5. Settings & API Key (New) */}
          <SidebarSection
            title="Settings"
            icon={<Key />}
            fontSize={fontSize}
            defaultOpen={!apiKey}
            badge={!apiKey && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>}
          >
            <div className="space-y-3">
              <div className="bg-accent/5 border border-accent/10 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-accent flex items-center gap-1">
                    GEMINI API KEY
                  </label>
                  <button
                    onClick={() => {
                      setShowHelpModal(true);
                      setActiveHelpTab('setup');
                    }}
                    className="text-[10px] text-secondary underline hover:text-primary"
                  >
                    Need Help?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showApiKey ? "text" : "password"}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Paste your key here"
                    className="w-full bg-background border border-border rounded-md px-3 py-2 text-xs pr-8 focus:border-accent focus:ring-1 focus:ring-accent"
                  />
                  <button
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-2 top-2 text-muted hover:text-primary"
                  >
                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <button
                  onClick={saveApiKey}
                  className="w-full mt-2 bg-surface border border-border hover:bg-background text-primary text-xs font-bold py-1.5 rounded-md transition-colors flex items-center justify-center gap-1"
                >
                  <Save className="w-3 h-3" /> Save Securely
                </button>
                {!apiKey && (
                  <p className="text-[10px] text-muted mt-2 leading-relaxed">
                    Required for AI features. Keys are stored locally in your browser.
                  </p>
                )}
              </div>
            </div>
          </SidebarSection>
        </div>

        {/* Footer Status */}
        <div className="border-t border-border bg-surface/80 backdrop-blur-md p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold uppercase tracking-wider flex items-center gap-1.5 text-xs text-secondary">
              <Sparkles className="w-3 h-3" /> System Status
            </h3>
            <div className={`w-2 h-2 rounded-full ${agentStatus.active ? "bg-green-500 animate-pulse" : "bg-muted"}`} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <AgentCard icon={<Feather />} name="Lyricist" desc="Pro Model" active={agentStatus.currentAgent === "LYRICIST"} fontSize={fontSize} />
            <AgentCard icon={<CheckCircle />} name="Review" desc="Analyst" active={agentStatus.currentAgent === "REVIEW"} fontSize={fontSize} />
          </div>
          <div className="mt-3 pt-2 border-t border-border space-y-2">
            <button onClick={() => setShowHelpModal(true)} className="btn btn-primary w-full justify-center py-2 text-sm shadow-lg hover-lift bg-brand-gradient">
              <HelpCircle className="w-4 h-4" /> Help & Guide
            </button>
          </div>
        </div>
      </aside>

      {/* Enhanced Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-surface border border-border rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden animate-scale-in flex flex-col max-h-[85vh]">

            {/* Header */}
            <div className="p-4 border-b border-border flex justify-between items-center bg-background/50 shrink-0">
              <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-accent" /> Help & Guide
              </h3>
              <button onClick={() => setShowHelpModal(false)} className="text-secondary hover:text-primary">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border bg-surface/50 shrink-0 overflow-x-auto">
              {[
                { id: 'tour', label: 'App Tour', icon: Map },
                { id: 'prompts', label: 'Pro Prompts', icon: FileText },
                { id: 'suno', label: 'Suno Workflow', icon: Music },
                { id: 'setup', label: 'API Setup', icon: Key },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveHelpTab(tab.id as any)}
                  className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${activeHelpTab === tab.id
                      ? 'border-accent text-accent bg-accent/5'
                      : 'border-transparent text-secondary hover:text-primary hover:bg-surface'
                    }`}
                >
                  {React.createElement(tab.icon, { className: "w-4 h-4" })}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content - Scrollable */}
            <div className="p-6 overflow-y-auto scrollbar-thin">
              {activeHelpTab === 'tour' && (
                <div className="space-y-8">
                  {/* Sidebar Section */}
                  <div>
                    <h4 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                      <Layout className="w-5 h-5 text-accent" /> The Sidebar
                    </h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 bg-surface rounded-xl border border-border hover:border-accent/20 transition-colors">
                        <div className="font-bold text-primary mb-1 flex items-center gap-2"><Coffee className="w-4 h-4 text-accent-orange" /> Context Engine</div>
                        <p className="text-sm text-secondary leading-relaxed mt-2">
                          Explains how to select specific ceremonies (like Pelli Choopulu or Hero Entry) to unlock cultural metaphors.
                        </p>
                      </div>
                      <div className="p-4 bg-surface rounded-xl border border-border hover:border-accent/20 transition-colors">
                        <div className="font-bold text-primary mb-1 flex items-center gap-2"><Languages className="w-4 h-4 text-accent-orange" /> Language Mix</div>
                        <p className="text-sm text-secondary leading-relaxed mt-2">
                          How to create "Tanglish" or "Hinglish" by setting Primary and Secondary languages.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Renderer Section */}
                  <div>
                    <h4 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-accent" /> The Renderer
                    </h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 bg-surface rounded-xl border border-border hover:border-accent/20 transition-colors">
                        <div className="font-bold text-primary mb-1 flex items-center gap-2"><Wand2 className="w-4 h-4 text-emerald-500" /> Magic Rhymes</div>
                        <p className="text-sm text-secondary leading-relaxed mt-2">
                          Using the Wand icon to rewrite lines for perfect phonetic endings (Anthya Prasa).
                        </p>
                      </div>
                      <div className="p-4 bg-surface rounded-xl border border-border hover:border-accent/20 transition-colors">
                        <div className="font-bold text-primary mb-1 flex items-center gap-2"><Mic2 className="w-4 h-4 text-emerald-500" /> Listen (TTS)</div>
                        <p className="text-sm text-secondary leading-relaxed mt-2">
                          Text-to-speech feature to check rhythm and meter (Maatra).
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Power User Tip */}
                  <div className="p-4 bg-gradient-to-r from-accent/10 to-transparent rounded-xl border-l-4 border-accent">
                    <h4 className="font-bold text-primary mb-1 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-accent" /> Power User Tip
                    </h4>
                    <p className="text-sm text-secondary leading-relaxed">
                      Skip the sidebar and use natural language prompts directly.
                    </p>
                  </div>
                </div>
              )}

              {activeHelpTab === 'prompts' && (
                <div className="grid gap-4">
                  {PRO_PROMPTS.map((prompt, idx) => (
                    <div key={idx} className="p-4 bg-surface rounded-xl border border-border hover:border-accent/30 transition-all group">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-primary text-sm">{prompt.title}</h4>
                        <button
                          onClick={() => handleCopy(prompt.text, idx)}
                          className="text-secondary hover:text-accent transition-colors"
                          title="Copy Prompt"
                        >
                          {copiedIndex === idx ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                      <p className="text-xs text-secondary leading-relaxed font-mono bg-background p-3 rounded-lg border border-border/50">
                        {prompt.text}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {activeHelpTab === 'suno' && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h4 className="text-lg font-bold text-primary">Export to Suno.com & Udio</h4>
                    <p className="text-sm text-secondary">Swaz Studio generates structured data ready for music AI.</p>
                  </div>

                  <div className="space-y-4">
                    {[
                      { title: "Generate & Switch View", desc: "Click \"Suno Code\" button to format lyrics with proper tags." },
                      { title: "Copy to Clipboard", desc: "Copy the formatted lyrics." },
                      { title: "Paste in Suno/Udio", desc: "Use Custom Mode in Suno.com." },
                      { title: "Style Prompts", desc: "Use the metadata provided by SWAZ for music style." }
                    ].map((step, i) => (
                      <div key={i} className="flex gap-4 p-3 rounded-lg hover:bg-surface border border-transparent hover:border-border transition-all">
                        <div className="w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center font-bold flex-shrink-0 mt-1">
                          {i + 1}
                        </div>
                        <div>
                          <h5 className="font-bold text-primary text-sm mb-1">{step.title}</h5>
                          <p className="text-sm text-secondary leading-relaxed">{step.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 p-6 bg-surface/50 rounded-xl border border-border text-center">
                    <p className="text-xs text-muted mb-3 font-bold uppercase tracking-wider">Ready to make music?</p>
                    <a href="https://suno.com" target="_blank" rel="noreferrer" className="btn btn-primary px-6 py-3 rounded-xl text-sm inline-flex items-center gap-2 shadow-lg shadow-accent/20">
                      Open Suno.com <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              )}

              {activeHelpTab === 'setup' && (
                <div className="space-y-6">
                  <p className="text-sm text-secondary leading-relaxed">
                    Swaz Studio uses Google's advanced Gemini models (Pro & Flash) to generate lyrics. You need your own free API key to activate the agents.
                  </p>

                  <div className="space-y-3 bg-accent/5 p-4 rounded-xl border border-accent/10">
                    <h4 className="font-bold text-sm text-primary flex items-center gap-2">
                      <Key className="w-4 h-4 text-accent" /> How to get a key:
                    </h4>
                    <ol className="list-decimal list-inside text-sm text-secondary space-y-2 ml-1">
                      <li>Go to <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-accent underline font-bold">Google AI Studio</a>.</li>
                      <li>Sign in with your Google Account.</li>
                      <li>Click <strong>"Create API Key"</strong>.</li>
                      <li>Copy the key string (starts with 'AIza...').</li>
                      <li>Paste it in the <strong>Settings</strong> section of the sidebar or below.</li>
                    </ol>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-secondary uppercase tracking-wider">Enter API Key</label>
                    <div className="relative">
                      <input
                        type={showApiKey ? "text" : "password"}
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="Paste AIza..."
                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm pr-10 focus:border-accent focus:ring-1 focus:ring-accent"
                      />
                      <button
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="absolute right-3 top-3 text-muted hover:text-primary"
                      >
                        {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <button
                      onClick={saveApiKey}
                      className="btn btn-primary w-full justify-center py-3 rounded-xl font-bold"
                    >
                      Save & Activate
                    </button>
                  </div>

                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="block text-center text-xs text-accent font-bold hover:underline mt-4"
                  >
                    Get API Key from Google →
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
