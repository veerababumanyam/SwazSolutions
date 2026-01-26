/**
 * Digital Invitation Editor Component
 * Multi-step wizard for creating/editing digital invitations
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, Check, Sparkles, Calendar, Globe,
  MapPin, Image, Music, Users, QrCode, MessageCircle, Share2,
  Clock, Wand2, Eye, Save, Plus, Trash2, Upload, X
} from 'lucide-react';
import { inviteApi } from '../../services/inviteApi';
import { SUPPORTED_INVITE_LANGUAGES, EVENT_PRESETS, THEME_COLORS } from '../../types/invite.types';
import type {
  DigitalInvite,
  SubEvent,
  IndianEventConfig,
  CardSection,
  SectionStyle,
  SavedTemplate
} from '../../types/invite.types';

interface InviteEditorProps {
  mode?: 'create' | 'edit';
}

type EditorStep = 0 | 1 | 2 | 3 | 4;

const TEMPLATES = [
  { id: 'wc1', cat: 'wedding', name: 'Floral Gold', bg: 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?q=80&w=800', font: 'font-serif', overlay: 'bg-black/40', accent: 'text-amber-200' },
  { id: 'wc2', cat: 'wedding', name: 'Royal Ivory', bg: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?q=80&w=800', font: 'font-serif', overlay: 'bg-black/20', accent: 'text-yellow-100' },
  { id: 'mm1', cat: 'custom', name: 'Helvetica Bold', bg: 'https://images.unsplash.com/photo-1497215728101-856c6e3c1fdc?q=80&w=800', font: 'font-sans', overlay: 'bg-black/60', accent: 'text-white' },
  { id: 'th1', cat: 'wedding', name: 'Temple Gold', bg: 'https://images.unsplash.com/photo-1610128960763-7eb928424271?q=80&w=800', font: 'font-serif', overlay: 'bg-gradient-to-t from-red-900/80 via-red-900/40 to-transparent', accent: 'text-yellow-400' },
  { id: 'hw1', cat: 'housewarming', name: 'Warm Lights', bg: 'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?q=80&w=800', font: 'font-sans', overlay: 'bg-black/30', accent: 'text-orange-100' },
  { id: 'bd1', cat: 'birthday', name: 'Confetti Pop', bg: 'https://images.unsplash.com/photo-1530103862676-de3c9da59af7?q=80&w=800', font: 'font-sans', overlay: 'bg-purple-900/40', accent: 'text-white' },
];

const CATEGORIES = [
  { id: 'wedding', name: 'Wedding', icon: '💍', label: 'Couple Names' },
  { id: 'engagement', name: 'Engagement', icon: '💑', label: 'Couple Names' },
  { id: 'housewarming', name: 'Housewarming', icon: '🏠', label: 'Family Name' },
  { id: 'birthday', name: 'Birthday', icon: '🎂', label: 'Birthday Person' },
  { id: 'anniversary', name: 'Anniversary', icon: '💕', label: 'Couple Names' },
  { id: 'baby-shower', name: 'Baby Shower', icon: '👶', label: 'Parents Names' },
  { id: 'corporate', name: 'Corporate', icon: '💼', label: 'Company Name' },
  { id: 'festival', name: 'Festival', icon: '🎉', label: 'Festival Name' },
  { id: 'custom', name: 'Custom Event', icon: '✨', label: 'Event Title' }
];

export const InviteEditor: React.FC<InviteEditorProps> = ({ mode = 'create' }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [step, setStep] = useState<EditorStep>(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generatingAi, setGeneratingAi] = useState(false);

  // Form state
  const [formData, setFormData] = useState<Partial<DigitalInvite>>({
    // Language
    primaryLang: 'en',
    secondaryLang: '',
    bilingualEnabled: false,
    bilingualLayout: 'tabs',

    // Event
    eventType: 'wedding',
    hostName: '',
    date: new Date().toISOString().split('T')[0],
    time: '18:30',
    venue: '',
    mapLink: '',
    details: '',
    multiEventEnabled: false,
    events: [],

    // Cultural
    indianConfig: {
      enabled: false,
      religiousSymbol: 'none',
      regionalGreeting: '',
      showHaldi: false
    },

    // Visual
    templateId: 'wc1',
    customBg: '',
    customFontFamily: '',
    sections: [],

    // Features
    showQr: false,
    showCountdown: true,
    showRsvp: true,
    autoExpiry: false,

    // Media
    mediaConfig: {},

    // Generated
    generatedText: '',
    aiTone: 'Poetic' as const,

    // Gallery
    galleryImages: []
  });

  // New event for multi-event
  const [newEvent, setNewEvent] = useState<Partial<SubEvent>>({
    name: '',
    date: '',
    startTime: '',
    venue: '',
    colorTheme: '#F59E0B'
  });

  // Preview state
  const [previewPage, setPreviewPage] = useState(0); // 0: Hero, 1: Details, 2: Gallery, 3: RSVP
  const [previewLang, setPreviewLang] = useState('en');

  // Load existing invite for edit mode
  useEffect(() => {
    if (mode === 'edit' && id) {
      loadInvite(id);
    }
  }, [mode, id]);

  const loadInvite = async (inviteId: string) => {
    try {
      setLoading(true);
      const response = await inviteApi.getInvite(inviteId);
      if (response.success && response.data) {
        setFormData(response.data);
      }
    } catch (error) {
      console.error('Error loading invite:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get active template
  const activeTemplate = TEMPLATES.find(t => t.id === formData.templateId) || TEMPLATES[0];

  // Step handlers
  const nextStep = () => {
    if (step < 4) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 0) setStep(step - 1);
  };

  // Save handlers
  const handleSave = async (publish = false) => {
    try {
      setSaving(true);
      let response;

      if (mode === 'edit' && id) {
        response = await inviteApi.updateInvite(id, formData);
      } else {
        response = await inviteApi.createInvite(formData);
      }

      if (response.success) {
        if (publish) {
          await inviteApi.publishInvite(response.data.id);
        }
        navigate('/invites');
      }
    } catch (error) {
      console.error('Error saving invite:', error);
      alert('Failed to save invitation');
    } finally {
      setSaving(false);
    }
  };

  // AI Text Generation
  const handleGenerateAi = async () => {
    try {
      setGeneratingAi(true);
      const response = await inviteApi.generateAiText(
        id || '',
        {
          tone: formData.aiTone || 'Poetic',
          venueDetails: `${formData.venue}. ${formData.details}`,
          culturalContext: formData.indianConfig?.enabled ? 'Indian wedding' : undefined
        }
      );

      if (response.success) {
        setFormData(prev => ({
          ...prev,
          generatedText: response.data.generatedText
        }));
      }
    } catch (error) {
      console.error('Error generating AI text:', error);
      alert('Failed to generate text');
    } finally {
      setGeneratingAi(false);
    }
  };

  // Add event to multi-event itinerary
  const addEvent = () => {
    if (!newEvent.name || !newEvent.date) return;

    const eventToAdd: SubEvent = {
      id: `evt_${Date.now()}`,
      name: newEvent.name!,
      date: newEvent.date!,
      startTime: newEvent.startTime || '10:00',
      venue: newEvent.venue || '',
      city: '',
      requiresRsvp: true,
      colorTheme: newEvent.colorTheme || '#F59E0B',
      ...newEvent
    };

    setFormData(prev => ({
      ...prev,
      events: [...(prev.events || []), eventToAdd].sort((a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
      )
    }));

    setNewEvent({
      name: '',
      date: '',
      startTime: '',
      venue: '',
      colorTheme: '#F59E0B'
    });
  };

  const removeEvent = (eventId: string) => {
    setFormData(prev => ({
      ...prev,
      events: prev.events?.filter(e => e.id !== eventId) || []
    }));
  };

  // Initialize sections when reaching visual step
  useEffect(() => {
    if (step === 3 && (!formData.sections || formData.sections.length === 0)) {
      const displayDate = formData.multiEventEnabled && formData.events && formData.events.length > 0
        ? formData.events[0].date
        : formData.date;
      const displayVenue = formData.multiEventEnabled && formData.events && formData.events.length > 0
        ? formData.events[0].venue
        : formData.venue;

      const defaultSections: CardSection[] = [
        {
          id: 's1',
          text: formData.indianConfig?.regionalGreeting || '|| Shree Ganeshay Namah ||',
          style: {
            fontSize: 'text-sm',
            color: '#FCD34D',
            fontFamily: 'font-serif',
            fontWeight: 'font-normal',
            italic: false,
            underline: false,
            uppercase: false,
            letterSpacing: 'tracking-widest',
            textAlign: 'text-center'
          }
        },
        {
          id: 's2',
          text: 'Save The Date',
          style: {
            fontSize: 'text-base',
            color: '#FFFFFF',
            fontFamily: 'font-sans',
            fontWeight: 'font-light',
            italic: false,
            underline: false,
            uppercase: true,
            letterSpacing: 'tracking-[0.3em]',
            textAlign: 'text-center'
          }
        },
        {
          id: 's3',
          text: formData.hostName || 'Your Names Here',
          style: {
            fontSize: 'text-5xl',
            color: '#FEF3C7',
            fontFamily: formData.customFontFamily || activeTemplate.font,
            fontWeight: 'font-bold',
            italic: false,
            underline: false,
            uppercase: false,
            letterSpacing: 'tracking-normal',
            textAlign: 'text-center'
          }
        },
        {
          id: 's5',
          text: `${displayDate ? new Date(displayDate).toLocaleDateString() : ''} ${displayVenue ? '• ' + displayVenue : ''}`,
          style: {
            fontSize: 'text-base',
            color: '#FCD34D',
            fontFamily: 'font-serif',
            fontWeight: 'font-semibold',
            italic: false,
            underline: false,
            uppercase: true,
            letterSpacing: 'tracking-widest',
            textAlign: 'text-center'
          }
        }
      ];

      setFormData(prev => ({ ...prev, sections: defaultSections }));
    }
  }, [step, formData.hostName, formData.date, formData.venue, formData.indianConfig, formData.events, formData.sections, formData.customFontFamily]);

  const renderLanguageStep = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Languages</h2>
        <p className="text-slate-600 dark:text-white/60">Configure the languages for your invitation</p>
      </div>

      <div className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-slate-200 dark:border-white/10 space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-white/80 mb-2">Primary Language</label>
          <select
            value={formData.primaryLang}
            onChange={(e) => setFormData({ ...formData, primaryLang: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          >
            {SUPPORTED_INVITE_LANGUAGES.map(lang => (
              <option key={lang.code} value={lang.code}>{lang.label} ({lang.native})</option>
            ))}
          </select>
        </div>

        <div className="border-t border-slate-200 dark:border-white/10 pt-6">
          <div className="flex items-center justify-between mb-4">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.bilingualEnabled}
                onChange={(e) => setFormData({ ...formData, bilingualEnabled: e.target.checked })}
                className="rounded bg-slate-100 dark:bg-white/10 border-slate-300 dark:border-white/20 text-amber-500 focus:ring-amber-500"
              />
              <span className="font-medium text-slate-900 dark:text-white">Enable Bilingual Invitation</span>
            </label>
          </div>

          {formData.bilingualEnabled && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-white/80 mb-2">Secondary Language</label>
                <select
                  value={formData.secondaryLang}
                  onChange={(e) => setFormData({ ...formData, secondaryLang: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white"
                >
                  {SUPPORTED_INVITE_LANGUAGES.filter(l => l.code !== formData.primaryLang).map(lang => (
                    <option key={lang.code} value={lang.code}>{lang.label} ({lang.native})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-white/80 mb-2">Bilingual Layout Style</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'sideBySide' as const, label: 'Side by Side', icon: '||' },
                    { id: 'stacked' as const, label: 'Stacked', icon: '=' },
                    { id: 'tabs' as const, label: 'Tabs', icon: '⇄' }
                  ].map(layout => (
                    <button
                      key={layout.id}
                      onClick={() => setFormData({ ...formData, bilingualLayout: layout.id })}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        formData.bilingualLayout === layout.id
                          ? 'border-amber-500 bg-amber-50 dark:bg-amber-500/20'
                          : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                      }`}
                    >
                      <div className="text-2xl mb-1">{layout.icon}</div>
                      <div className="text-xs font-medium text-slate-900 dark:text-white">{layout.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderScheduleStep = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Schedule & Itinerary</h2>
        <p className="text-slate-600 dark:text-white/60">Set your event date and time, or create a multi-event celebration</p>
      </div>

      <div className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-slate-200 dark:border-white/10 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="text-amber-500" />
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">Multi-Day Celebration</h3>
              <p className="text-sm text-slate-600 dark:text-white/60">For Indian weddings with multiple events</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.multiEventEnabled}
              onChange={(e) => setFormData({ ...formData, multiEventEnabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 dark:peer-focus:ring-amber-800 rounded-full peer dark:bg-white/10 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-amber-500"></div>
          </label>
        </div>

        {!formData.multiEventEnabled ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-white/80 mb-2">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-white/80 mb-2">Start Time</label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-white/80 mb-2">End Time (Optional)</label>
              <input
                type="time"
                value=""
                onChange={(e) => console.log('End time:', e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-white/80 mb-2">Venue Name & Location</label>
              <input
                type="text"
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                placeholder="e.g. The Oberoi Udaivilas, Udaipur"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/30 focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-white/80 mb-2">Google Maps Link (Optional)</label>
              <input
                type="url"
                value={formData.mapLink}
                onChange={(e) => setFormData({ ...formData, mapLink: e.target.value })}
                placeholder="https://maps.google.com/..."
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/30 focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in">
            <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-4 border border-slate-200 dark:border-white/10 space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-semibold text-slate-900 dark:text-white">Add Event to Itinerary</h4>
                <div className="flex gap-1">
                  {EVENT_PRESETS.map(preset => (
                    <button
                      key={preset.name}
                      onClick={() => setNewEvent({ ...newEvent, name: preset.name, colorTheme: preset.color })}
                      className="w-6 h-6 rounded-full border border-slate-300 dark:border-white/20 hover:scale-110 transition-transform"
                      style={{ backgroundColor: preset.color }}
                      title={preset.name}
                    />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Event Name"
                  value={newEvent.name}
                  onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
                  className="px-3 py-2 rounded-lg bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 text-sm"
                />
                <input
                  type="date"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                  className="px-3 py-2 rounded-lg bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 text-sm"
                />
                <input
                  type="time"
                  value={newEvent.startTime}
                  onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                  className="px-3 py-2 rounded-lg bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 text-sm"
                />
                <input
                  type="text"
                  placeholder="Venue"
                  value={newEvent.venue}
                  onChange={(e) => setNewEvent({ ...newEvent, venue: e.target.value })}
                  className="px-3 py-2 rounded-lg bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 text-sm"
                />
              </div>

              <button
                onClick={addEvent}
                disabled={!newEvent.name || !newEvent.date}
                className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Plus size={16} />
                Add to Itinerary
              </button>
            </div>

            {/* Events List */}
            <div className="space-y-3">
              {(!formData.events || formData.events.length === 0) ? (
                <p className="text-center text-slate-400 dark:text-white/30 text-sm py-4">No events added yet</p>
              ) : (
                formData.events.map((evt: SubEvent) => (
                  <div key={evt.id} className="flex items-center gap-4 bg-white dark:bg-white/5 p-3 rounded-xl border border-slate-200 dark:border-white/10">
                    <div className="w-2 h-12 rounded-full" style={{ backgroundColor: evt.colorTheme }} />
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900 dark:text-white">{evt.name}</h4>
                      <p className="text-xs text-slate-600 dark:text-white/60">
                        {new Date(evt.date).toLocaleDateString()} @ {evt.startTime}
                        {evt.venue && ` • ${evt.venue}`}
                      </p>
                    </div>
                    <button
                      onClick={() => removeEvent(evt.id)}
                      className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderDetailsStep = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Event Details</h2>
        <p className="text-slate-600 dark:text-white/60">Tell us more about your celebration</p>
      </div>

      <div className="space-y-6">
        <div className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-slate-200 dark:border-white/10 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-white/80 mb-2">Event Type</label>
            <select
              value={formData.eventType}
              onChange={(e) => setFormData({ ...formData, eventType: e.target.value as any })}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
            >
              {CATEGORIES.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-white/80 mb-2">
              {CATEGORIES.find(c => c.id === formData.eventType)?.label || 'Host Name'}
            </label>
            <input
              type="text"
              value={formData.hostName}
              onChange={(e) => setFormData({ ...formData, hostName: e.target.value })}
              placeholder="e.g. Priya & Rahul"
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/30 focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-white/80 mb-2">Description / Message</label>
            <textarea
              value={formData.details}
              onChange={(e) => setFormData({ ...formData, details: e.target.value })}
              placeholder="What is the vibe? Dress code? Key highlights?"
              rows={4}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/30 focus:ring-2 focus:ring-amber-500 resize-none"
            />
          </div>
        </div>

        {/* AI Text Generation */}
        <div className="bg-gradient-to-r from-amber-50 to-pink-50 dark:from-amber-500/10 dark:to-pink-500/10 rounded-2xl p-6 border border-amber-200 dark:border-amber-500/20">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500 rounded-lg">
                <Sparkles className="text-white" size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">AI Message Writer</h3>
                <p className="text-sm text-slate-600 dark:text-white/60">Generate invitation text with AI</p>
              </div>
            </div>
            <button
              onClick={handleGenerateAi}
              disabled={generatingAi}
              className="px-4 py-2 bg-white dark:bg-white/10 hover:bg-slate-50 dark:hover:bg-white/20 text-slate-900 dark:text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {generatingAi ? (
                <>
                  <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 size={16} />
                  Generate
                </>
              )}
            </button>
          </div>

          {formData.generatedText && (
            <div className="mt-4 p-4 bg-white dark:bg-white/10 rounded-xl">
              <p className="text-sm text-slate-600 dark:text-white/80 italic font-serif">"{formData.generatedText}"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderVisualsStep = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Visual Style</h2>
        <p className="text-slate-600 dark:text-white/60">Choose a template and customize the appearance</p>
      </div>

      <div className="space-y-6">
        {/* Template Selection */}
        <div className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-slate-200 dark:border-white/10">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Choose a Template</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {TEMPLATES.map(template => (
              <div
                key={template.id}
                onClick={() => setFormData({ ...formData, templateId: template.id })}
                className={`relative aspect-[3/4] rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                  formData.templateId === template.id
                    ? 'border-amber-500 shadow-lg scale-105'
                    : 'border-slate-200 dark:border-white/10 hover:border-amber-500/50 hover:scale-105'
                }`}
              >
                <img src={template.bg} alt={template.name} className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3">
                  <p className="text-white font-medium text-sm">{template.name}</p>
                </div>
                {formData.templateId === template.id && (
                  <div className="absolute top-2 right-2 bg-amber-500 rounded-full p-1">
                    <Check size={12} className="text-white" strokeWidth={3} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Background Upload */}
        <div className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-slate-200 dark:border-white/10">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Custom Background</h3>
          <div className="border-2 border-dashed border-slate-300 dark:border-white/10 rounded-xl p-8 text-center hover:border-amber-500/50 transition-colors cursor-pointer">
            <Upload className="mx-auto text-slate-400 mb-2" size={32} />
            <p className="text-sm text-slate-600 dark:text-white/60">Click to upload a custom background image</p>
            <p className="text-xs text-slate-400 dark:text-white/30 mt-1">Recommended: 1080x1920px, JPG or PNG</p>
          </div>
        </div>

        {/* Color Theme */}
        <div className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-slate-200 dark:border-white/10">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Accent Color</h3>
          <div className="flex gap-2 flex-wrap">
            {THEME_COLORS.map(color => (
              <button
                key={color}
                onClick={() => console.log('Selected color:', color)}
                className={`w-10 h-10 rounded-full border-2 transition-transform hover:scale-110 ${
                  color === '#FFFFFF' ? 'border-slate-300' : 'border-transparent'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderFeaturesStep = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Features & Modules</h2>
        <p className="text-slate-600 dark:text-white/60">Enable features for your invitation microsite</p>
      </div>

      <div className="space-y-4">
        {[
          { key: 'showRsvp', label: 'RSVP Form', icon: MessageCircle, desc: 'Let guests respond to your invitation' },
          { key: 'showCountdown', label: 'Countdown Timer', icon: Clock, desc: 'Show countdown to your event' },
          { key: 'showQr', label: 'QR Code', icon: QrCode, desc: 'Display QR code for easy access' },
          { key: 'autoExpiry', label: 'Auto-Expire', icon: Clock, desc: 'Automatically expire after event date' }
        ].map(feature => (
          <div
            key={feature.key}
            className="bg-white dark:bg-white/5 rounded-2xl p-4 border border-slate-200 dark:border-white/10 flex items-center justify-between hover:border-amber-500/30 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${formData[feature.key] ? 'bg-amber-500' : 'bg-slate-200 dark:bg-white/10'}`}>
                <feature.icon size={20} className={formData[feature.key] ? 'text-white' : 'text-slate-500'} />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white">{feature.label}</h4>
                <p className="text-sm text-slate-600 dark:text-white/60">{feature.desc}</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData[feature.key] as boolean}
                onChange={(e) => setFormData({ ...formData, [feature.key]: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 dark:peer-focus:ring-amber-800 rounded-full peer dark:bg-white/10 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-amber-500"></div>
            </label>
          </div>
        ))}

        {/* Gallery Upload */}
        <div className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-slate-200 dark:border-white/10">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Photo Gallery</h3>
          <div className="grid grid-cols-4 gap-3">
            {(formData.galleryImages || []).map((img, idx) => (
              <div key={idx} className="relative aspect-square rounded-lg overflow-hidden group">
                <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                <button
                  onClick={() => {
                    setFormData({
                      ...formData,
                      galleryImages: formData.galleryImages?.filter((_, i) => i !== idx) || []
                    });
                  }}
                  className="absolute top-2 right-2 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={14} className="text-white" />
                </button>
              </div>
            ))}
            {(formData.galleryImages || []).length < 4 && (
              <button className="aspect-square rounded-xl border-2 border-dashed border-slate-300 dark:border-white/10 hover:border-amber-500/50 flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-amber-500 transition-colors">
                <Plus size={24} />
                <span className="text-xs font-medium">Add Photo</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Progress indicator
  const renderProgress = () => (
    <div className="flex items-center justify-between mb-8 px-4">
      <button onClick={() => navigate('/invites')} className="text-slate-500 hover:text-slate-700 dark:text-white/50 dark:hover:text-white flex items-center gap-2 transition-colors">
        <ArrowLeft size={18} />
        Cancel
      </button>
      <div className="flex gap-2">
        {[0, 1, 2, 3, 4].map(i => (
          <div
            key={i}
            className={`h-2 w-12 rounded-full transition-all duration-300 ${
              step >= i ? 'bg-amber-500' : 'bg-slate-200 dark:bg-white/10'
            }`}
          />
        ))}
      </div>
      <div className="text-right">
        <span className="text-sm font-medium text-slate-900 dark:text-white">
          {step === 0 && 'Languages'}
          {step === 1 && 'Schedule'}
          {step === 2 && 'Details'}
          {step === 3 && 'Visuals'}
          {step === 4 && 'Features'}
        </span>
        <span className="text-xs text-slate-500 dark:text-white/30 ml-2">Step {step + 1}/5</span>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-amber-500"></div>
          <p className="text-slate-600 dark:text-white/60 mt-4">Loading invitation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {renderProgress()}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Editor Column */}
          <div className="lg:col-span-2">
            {step === 0 && renderLanguageStep()}
            {step === 1 && renderScheduleStep()}
            {step === 2 && renderDetailsStep()}
            {step === 3 && renderVisualsStep()}
            {step === 4 && renderFeaturesStep()}

            {/* Navigation */}
            <div className="flex justify-between mt-8 pt-6 border-t border-slate-200 dark:border-white/10">
              {step > 0 ? (
                <button
                  onClick={prevStep}
                  className="px-6 py-3 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 text-slate-900 dark:text-white font-medium rounded-xl border border-slate-200 dark:border-white/10 transition-colors flex items-center gap-2"
                >
                  <ArrowLeft size={18} />
                  Back
                </button>
              ) : (
                <div />
              )}

              <div className="flex gap-3">
                {step === 4 && (
                  <button
                    onClick={() => handleSave(false)}
                    disabled={saving}
                    className="px-6 py-3 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 text-slate-900 dark:text-white font-medium rounded-xl border border-slate-200 dark:border-white/10 transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <Save size={18} />
                    Save Draft
                  </button>
                )}

                {step < 4 ? (
                  <button
                    onClick={nextStep}
                    className="px-6 py-3 bg-gradient-to-r from-amber-500 to-pink-600 hover:brightness-110 text-white font-medium rounded-xl transition-all flex items-center gap-2"
                  >
                    Next Step
                    <ArrowRight size={18} />
                  </button>
                ) : (
                  <button
                    onClick={() => handleSave(true)}
                    disabled={saving}
                    className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 text-white font-medium rounded-xl transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Publishing...
                      </>
                    ) : (
                      <>
                        <Share2 size={18} />
                        Publish Invitation
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Preview Column */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-8">
              <div className="bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden">
                <div className="p-4 border-b border-slate-200 dark:border-white/10">
                  <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <Eye size={18} />
                    Preview
                  </h3>
                </div>

                {/* Mobile Device Frame */}
                <div className="p-8 flex justify-center">
                  <div className="relative w-[280px] h-[560px] bg-[#121212] rounded-[40px] border-[8px] border-[#2a2a2a] overflow-hidden shadow-2xl">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-b-2xl z-10" />

                    <div className="relative w-full h-full bg-gray-900 overflow-hidden flex flex-col">
                      {/* Background */}
                      <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{
                          backgroundImage: activeTemplate.bg ? `url(${activeTemplate.bg})` : 'none',
                          filter: previewPage > 0 ? 'blur(10px) brightness(0.3)' : 'none'
                        }}
                      />
                      <div className={`absolute inset-0 ${activeTemplate.overlay}`} />

                      {/* Content */}
                      <div className="relative z-20 flex-1 flex flex-col p-6 text-center">
                        {previewPage === 0 && (
                          <div className="flex-1 flex flex-col justify-end pb-16">
                            {(formData.sections || []).map((section: CardSection) => (
                              <div
                                key={section.id}
                                className={`${section.style.fontSize} ${section.style.fontFamily} ${section.style.fontWeight} ${section.style.textAlign}`}
                                style={{ color: section.style.color }}
                              >
                                {section.text}
                              </div>
                            ))}
                          </div>
                        )}

                        {previewPage === 1 && (
                          <div className="flex-1 flex items-center justify-center">
                            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 space-y-4">
                              <h4 className="text-white font-semibold">Event Details</h4>
                              <div className="text-amber-400 text-sm">
                                <Calendar size={12} className="inline mr-1" />
                                {formData.date && new Date(formData.date).toLocaleDateString()}
                              </div>
                              <div className="text-white text-sm">
                                <MapPin size={12} className="inline mr-1" />
                                {formData.venue || 'Venue TBD'}
                              </div>
                            </div>
                          </div>
                        )}

                        {previewPage === 2 && (
                          <div className="flex-1 flex items-center justify-center">
                            <div className="grid grid-cols-2 gap-2 w-full px-4">
                              {(formData.galleryImages || []).slice(0, 4).map((img, i) => (
                                <div key={i} className={`aspect-square rounded-lg overflow-hidden ${i === 0 ? 'col-span-2' : ''}`}>
                                  <img src={img} alt={`Gallery ${i}`} className="w-full h-full object-cover" />
                                </div>
                              ))}
                              {(formData.galleryImages || []).length === 0 && (
                                <div className="col-span-2 text-center text-white/50 py-8">
                                  <Image size={32} className="mx-auto mb-2 opacity-50" />
                                  <p className="text-sm">No photos added</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {previewPage === 3 && (
                          <div className="flex-1 flex items-center justify-center">
                            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 w-full">
                              <h4 className="text-white font-semibold mb-4">RSVP</h4>
                              <input
                                type="text"
                                placeholder="Your Name"
                                className="w-full px-3 py-2 bg-white/20 border border-white/10 rounded-lg text-white placeholder-white/50 text-sm mb-3"
                              />
                              <button className="w-full py-2 bg-white text-black rounded-lg text-sm font-medium">
                                Submit RSVP
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Bottom Nav */}
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30">
                        <div className="bg-black/60 backdrop-blur-xl rounded-full p-1 flex gap-1">
                          {[
                            { id: 0, icon: '💌' },
                            { id: 1, icon: '📅' },
                            { id: 2, icon: '📸' },
                            { id: 3, icon: '✉️' }
                          ].map(item => (
                            <button
                              key={item.id}
                              onClick={() => setPreviewPage(item.id)}
                              className={`p-2 rounded-full transition-all ${
                                previewPage === item.id ? 'bg-amber-500' : 'hover:bg-white/10'
                              }`}
                            >
                              {item.icon}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black via-black/60 to-transparent pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InviteEditor;
