/**
 * Public Invitation View Page
 * Display invitation for guests and handle RSVP submissions
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Calendar, MapPin, Clock, Users, Image as ImageIcon,
  ChevronRight, Heart, PartyPopper, Camera, MessageCircle,
  Share2, Mail, Phone, Copy, Check, X, Menu, Loader2, ArrowLeft
} from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { rsvpApi } from '../../services/inviteApi';
import type { DigitalInvite, SubEvent, CardSection, GuestStatus } from '../../types/invite.types';

interface PublicInviteViewProps {
  slug: string;
}

interface RSVPFormData {
  name: string;
  email: string;
  phone: string;
  response: 'Accepted' | 'Declined';
  plusOns: number;
  dietary: string;
  message: string;
}

const TRANSLATIONS: Record<string, any> = {
  en: {
    saveDate: "Save the Date",
    joinUs: "Join us to celebrate",
    rsvp: "RSVP",
    details: "Event Details",
    gallery: "Gallery",
    days: "Days",
    hrs: "Hrs",
    mins: "Mins",
    map: "View on Map",
    count: "Number of Guests",
    submit: "Send Confirmation",
    hosting: "Hosting",
    scan: "Scan for Photos",
    itinerary: "Wedding Itinerary",
    loading: "Loading invitation...",
    error: "Invitation not found or has been removed.",
    rsvpSuccess: "Thank you for your response!",
    rsvpError: "Please fill in all required fields.",
    guests: "Guests",
    plusOnes: "Plus Ones",
    dietary: "Dietary Requirements",
    message: "Message to host"
  },
  hi: {
    saveDate: "शुभ विवाह",
    joinUs: "हमारे जश्न में शामिल हों",
    rsvp: "आमंत्रण उत्तर",
    details: "कार्यक्रम विवरण",
    gallery: "तस्वीरें",
    days: "दिन",
    hrs: "घंटे",
    mins: "मिनट",
    map: "मैप देखें",
    count: "अतिथियों की संख्या",
    submit: "पुष्टि भेजें",
    hosting: "स्वागतकर्ता",
    scan: "तस्वीरों के लिए स्कैन करें",
    itinerary: "विवाह कार्यक्रम",
    loading: "निमंत्रण लोड हो रही है...",
    error: "निमंत्रण नहीं मिला या हटा दिया गया है।",
    rsvpSuccess: "आपकी प्रतिक्रिया के लिए धन्यवाद!",
    rsvpError: "कृपया सभी आवश्यक फ़ील्ड करें।",
    guests: "मेहमान",
    plusOnes: "साथी",
    dietary: "खान्य प्राथाओं",
    message: "मेजबान को संदेश"
  }
};

export const PublicInviteView: React.FC<PublicInviteViewProps> = ({ slug }) => {
  const [invite, setInvite] = useState<DigitalInvite | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'hero' | 'details' | 'gallery' | 'rsvp'>('hero');
  const [previewLang, setPreviewLang] = useState('en');
  const [showShare, setShowShare] = useState(false);
  const [rsvped, setRsvped] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [rsvpSuccess, setRsvpSuccess] = useState(false);
  const [rsvpError, setRsvpError] = useState('');

  // RSVP form state
  const [rsvpForm, setRsvpForm] = useState<RSVPFormData>({
    name: '',
    email: '',
    phone: '',
    response: 'Accepted',
    plusOnes: 0,
    dietary: '',
    message: ''
  });

  useEffect(() => {
    loadInvite();
  }, [slug]);

  const loadInvite = async () => {
    try {
      // Use public API endpoint
      const response = await fetch(`/api/invites/slug/${slug}`);
      const result = await response.json();

      if (result.success && result.data) {
        setInvite(result.data);
      } else {
        throw new Error(result.error || 'Failed to load invitation');
      }
    } catch (error) {
      console.error('Error loading invite:', error);
      setLoading(false);
    }
  };

  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
  };

  const handleRSVPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setRsvpError('');

    // Validation
    if (!rsvpForm.name || !rsvpForm.email) {
      setRsvpError('Please fill in all required fields');
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch(`/api/invites/${slug}/rsvp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rsvpForm)
      });

      const result = await response.json();

      if (result.success) {
        setRsvpSuccess(true);
        setRsvped(true);
        // Reset form
        setRsvpForm({
          name: '',
          email: '',
          phone: '',
          response: 'Accepted',
          plusOnes: 0,
          dietary: '',
          message: ''
        });
      } else {
        setRsvpError(result.error || 'Failed to submit RSVP');
      }
    } catch (error) {
      console.error('Error submitting RSVP:', error);
      setRsvpError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${invite?.hostName} - Invitation`,
          text: `You're invited! View the invitation details.`,
          url: window.location.href
        });
      } catch (error) {
        console.log('Share canceled or not supported');
      }
    } else {
      setShowShare(true);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard!');
  };

  const getInviteUrl = () => window.location.origin + window.location.pathname;
  const getMapUrl = () => invite?.mapLink || `https://maps.google.com/?q=${encodeURIComponent(invite?.venue || '')}`;

  // Render loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-pink-50 to-white dark:from-gray-900 dark:via-gray-800 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-amber-600 dark:text-amber-400 mx-auto" />
          <p className="text-slate-700 dark:text-white/80 font-medium">{TRANSLATIONS[previewLang].loading}</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (!invite) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-pink-50 to-white dark:from-gray-900 dark:via-gray-800 flex items-center justify-center p-4">
        <div className="text-center space-y-4 bg-white dark:bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-xl">
          <div className="text-6xl mb-4">📭</div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Invitation Not Found</h2>
          <p className="text-slate-600 dark:text-white/60">{TRANSLATIONS[previewLang].error}</p>
        </div>
      </div>
    );
  }

  // Get template for styling
  const getTemplateStyle = () => {
    // Simple template matching based on templateId
    const templates: Record<string, any> = {
      'wc1': { overlay: 'bg-black/40', accent: 'text-amber-200' },
      'wc2': { overlay: 'bg-black/20', accent: 'text-yellow-100' },
      'mm1': { overlay: 'bg-black/60', accent: 'text-white' },
      'th1': { overlay: 'bg-gradient-to-t from-red-900/80 via-red-900/40 to-transparent', accent: 'text-yellow-400' },
      'hw1': { overlay: 'bg-black/30', accent: 'text-orange-100' },
      'bd1': { overlay: 'bg-purple-900/40', accent: 'text-white' },
    };
    return templates[invite.templateId] || templates['wc1'];
  };

  const templateStyle = getTemplateStyle();

  // Render hero section
  const renderHero = () => (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4 py-16">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: invite.customBg || TEMPLATES.find(t => t.id === invite.templateId)?.bg || '',
        filter: 'brightness(0.6)'
        }}
      />
      <div className={`absolute inset-0 ${templateStyle.overlay}`} />

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8 animate-in fade-in">
        {/* Sections */}
        <div className="space-y-6">
          {(invite.sections || []).map((section: CardSection, idx) => (
            <div
              key={section.id}
              className={`${section.style.fontSize} ${section.style.fontFamily} ${section.style.fontWeight} ${section.style.textAlign}`}
              style={{ color: section.style.color }}
            >
              {section.text}
            </div>
          ))}

          {/* Countdown Timer */}
          {invite.showCountdown && (
            <div className="flex justify-center gap-4 pt-4">
              {[14, 6, 32].map((val, i) => (
                <div key={i} className="bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-lg min-w-[60px]">
                  <div className="text-2xl font-bold text-white">{val}</div>
                  <div className="text-[10px uppercase opacity-70 text-white">
                    {i === 0 ? TRANSLATIONS[previewLang].days : i === 1 ? TRANSLATIONS[previewLang].hrs : TRANSLATIONS[previewLang].mins}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CTA */}
        <button
          onClick={() => handleTabChange('details')}
          className="animate-bounce mt-8 bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 px-8 py-4 rounded-full text-white font-medium transition-all"
        >
          <ChevronRight className="rotate-90 mx-auto" />
        </button>
      </div>

      {/* Share Button */}
      <button
        onClick={handleShare}
        className="absolute top-4 right-4 z-20 p-3 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full text-white transition-all"
        title="Share"
      >
        <Share2 size={20} />
      </button>
    </div>
  );

  // Render details/itinerary section
  const renderDetails = () => (
    <div className="min-h-screen bg-white dark:bg-gray-900 p-4 py-16">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => handleTabChange('hero')}
          className="mb-8 flex items-center gap-2 text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8 text-center">
          {TRANSLATIONS[previewLang].details}
        </h2>

        <div className="space-y-6">
          {invite.multiEventEnabled && invite.events && invite.events.length > 0 ? (
            // Multi-event timeline
            <div className="space-y-8">
              {invite.events.map((evt: SubEvent, idx) => (
                <div key={evt.id} className="relative pl-8 pb-8">
                  <div className="absolute left-0 top-0 w-4 h-4 rounded-full border-2 border-white/50" style={{ backgroundColor: evt.colorTheme }} />

                  <div className="bg-gradient-to-r from-slate-50 to-white dark:from-gray-800 dark:to-gray-700 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-white/10 ml-4">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white" style={{ color: evt.colorTheme }}>
                        {evt.name}
                      </h3>
                      <span className="text-sm text-slate-600 dark:text-white/40 bg-slate-100 dark:bg-white/5 px-2 py-1 rounded">
                        {evt.startTime}
                      </span>
                    </div>

                    <div className="space-y-3 text-slate-700 dark:text-white/70">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-amber-600" />
                        <span>{new Date(evt.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-amber-600" />
                        <span>{evt.startTime} onwards</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-amber-600" />
                        <span>{evt.venue}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Single event
            <div className="bg-gradient-to-r from-slate-50 to-white dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8 shadow-lg border border-slate-200 dark:border-white/10 text-center space-y-6">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                {TRANSLATIONS[previewLang].details}
              </h3>

              <div className="space-y-4 text-slate-700 dark:text-white/70">
                <div className="flex items-center justify-center gap-3 p-4 bg-white/50 dark:bg-white/5 rounded-xl">
                  <Calendar className="text-amber-600" size={24} />
                  <div>
                    <div className="font-bold text-lg">{invite.date ? new Date(invite.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'TBD'}</div>
                    <div className="text-sm">{invite.time || 'TBD'} onwards</div>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-3 p-4 bg-white/50 dark:bg-white/5 rounded-xl">
                  <MapPin className="text-amber-600" size={24} />
                  <div className="font-bold text-lg">{invite.venue}</div>
                </div>

                {invite.mapLink && (
                  <a
                    href={getMapUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-xl transition-colors"
                  >
                    <MapPin size={18} />
                    {TRANSLATIONS[previewLang].map}
                  </a>
                )}
              </div>

              {invite.generatedText && (
                <div className="pt-6 border-t border-slate-200 dark:border-white/10">
                  <p className="text-lg italic text-slate-600 dark:text-white/60 font-serif">
                    "{invite.generatedText}"
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Render gallery section
  const renderGallery = () => (
    <div className="min-h-screen bg-white dark:bg-gray-900 p-4 py-16">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => handleTabChange('details')}
          className="mb-8 flex items-center gap-2 text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8 text-center">
          {TRANSLATIONS[previewLang].gallery}
        </h2>

        {(invite.galleryImages || []).length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {(invite.galleryImages || []).map((img, i) => (
              <div key={i} className={`aspect-square rounded-2xl overflow-hidden shadow-lg ${i === 0 ? 'col-span-2' : ''}`}>
                <img src={img} alt={`Gallery ${i}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <ImageIcon size={64} className="mx-auto text-slate-300 dark:text-white/20 mb-4" />
            <p className="text-slate-500 dark:text-white/40">No photos added yet</p>
          </div>
        )}
      </div>
    </div>
  );

  // Render RSVP section
  const renderRSVP = () => (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-pink-50 to-white dark:from-gray-900 dark:via-gray-800 p-4 py-16">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => handleTabChange('details')}
          className="mb-8 flex items-center gap-2 text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        {rsvped ? (
          <div className="bg-white dark:bg-white/10 backdrop-blur-md rounded-2xl p-8 text-center shadow-xl border border-slate-200 dark:border-white/10">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check size={40} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              {TRANSLATIONS[previewLang].rsvpSuccess}
            </h2>
            <p className="text-slate-600 dark:text-white/60">
              We've received your response and look forward to seeing you!
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-slate-200 dark:border-white/10">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">
              {TRANSLATIONS[previewLang].rsvp}
            </h2>

            {invite.showQr && (
              <div className="flex justify-center mb-8">
                <QRCodeCanvas
                  value={getInviteUrl()}
                  size={150}
                  level="M"
                  includeMargin={true}
                  className="bg-white p-2 rounded-xl"
                />
              </div>
            )}

            <form onSubmit={handleRSVPSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-white/80 mb-2">
                  Your Name *
                </label>
                <input
                  type="text"
                  required
                  value={rsvpForm.name}
                  onChange={(e) => setRsvpForm({ ...rsvpForm, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-white/80 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={rsvpForm.email}
                  onChange={(e) => setRsvpForm({ ...rsvpForm, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-white/80 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={rsvpForm.phone}
                  onChange={(e) => setRsvpForm({ ...rsvpForm, phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                  placeholder="+91 98765 43210"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-white/80 mb-2">
                  Will you attend? *
                </label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setRsvpForm({ ...rsvpForm, response: 'Accepted' })}
                    className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                      rsvpForm.response === 'Accepted'
                        ? 'bg-emerald-500 text-white shadow-lg'
                        : 'bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-white hover:bg-emerald-100 dark:hover:bg-emerald-500/20'
                    }`}
                  >
                    <Users size={18} className="inline mr-2" />
                    Accept
                  </button>
                  <button
                    type="button"
                    onClick={() => setRsvpForm({ ...rsvpForm, response: 'Declined' })}
                    className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                      rsvpForm.response === 'Declined'
                        ? 'bg-red-500 text-white shadow-lg'
                        : 'bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-white hover:bg-red-100 dark:hover:bg-red-500/20'
                    }`}
                  >
                    <X size={18} className="inline mr-2" />
                    Decline
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-white/80 mb-2">
                  {TRANSLATIONS[previewLang].plusOnes}
                </label>
                <input
                  type="number"
                  min={0}
                  max={10}
                  value={rsvpForm.plusOnes}
                  onChange={(e) => setRsvpForm({ ...rsvpForm, plusOnes: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-white/80 mb-2">
                  {TRANSLATIONS[previewLang].dietary}
                </label>
                <input
                  type="text"
                  value={rsvpForm.dietary}
                  onChange={(e) => setRsvpForm({ ...rsvpForm, dietary: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                  placeholder="e.g., Vegetarian, Vegan, No nuts..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-white/80 mb-2">
                  {TRANSLATIONS[previewLang].message}
                </label>
                <textarea
                  value={rsvpForm.message}
                  onChange={(e) => setRsvpForm({ ...rsvpForm, message: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 resize-none"
                  placeholder="Leave a message for the hosts..."
                />
              </div>

              {rsvpError && (
                <div className="bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm">
                  {rsvpError}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-gradient-to-r from-amber-500 to-pink-600 hover:brightness-110 text-white font-bold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
              >
                {submitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Mail size={18} />
                    {TRANSLATIONS[previewLang].submit}
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );

  // Render share modal
  const renderShareModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowShare(false)} />
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95">
        <button
          onClick={() => setShowShare(false)}
          className="absolute top-4 right-4 p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors"
        >
          <X size={20} className="text-slate-500" />
        </button>

        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">
          Share Invitation
        </h3>

        <div className="space-y-4">
          <div className="flex justify-center bg-slate-50 dark:bg-white/5 p-4 rounded-xl">
            <QRCodeCanvas
              value={getInviteUrl()}
              size={150}
              level="M"
              includeMargin={true}
            />
          </div>

          <input
            type="text"
            readOnly
            value={getInviteUrl()}
            className="w-full px-4 py-3 bg-slate-100 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white text-center font-mono text-sm"
          />

          <button
            onClick={copyLink}
            className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <Copy size={18} />
            Copy Link
          </button>

          <div className="flex gap-3">
            <a
              href={`whatsapp://send?text=${encodeURIComponent(`Join us for ${invite.hostName}! ${getInviteUrl()}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <MessageCircle size={18} />
              WhatsApp
            </a>
            <a
              href={`mailto:?subject=Invitation&body=${encodeURIComponent(`Join us for ${invite.hostName}! ${getInviteUrl()}`)}`}
              className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Mail size={18} />
              Email
            </a>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a]">
      {/* Share Modal */}
      {showShare && renderShareModal()}

      {/* Main Content */}
      {activeTab === 'hero' && renderHero()}
      {activeTab === 'details' && renderDetails()}
      {activeTab === 'gallery' && renderGallery()}
      {activeTab === 'rsvp' && renderRSVP()}

      {/* Bottom Navigation (Mobile) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-800 border-t border-slate-200 dark:border-white/10 md:hidden">
        <div className="flex justify-around py-3">
          <button
            onClick={() => handleTabChange('hero')}
            className={`flex flex-col items-center gap-1 ${
              activeTab === 'hero' ? 'text-amber-600' : 'text-slate-600 dark:text-white/40'
            }`}
          >
            <Heart size={24} />
            <span className="text-xs">Cover</span>
          </button>
          <button
            onClick={() => handleTabChange('details')}
            className={`flex flex-col items-center gap-1 ${
              activeTab === 'details' ? 'text-amber-600' : 'text-slate-600 dark:text-white/40'
            }`}
          >
            <PartyPopper size={24} />
            <span className="text-xs">Details</span>
          </button>
          <button
            onClick={() => handleTabChange('gallery')}
            className={`flex flex-col items-center gap-1 ${
              activeTab === 'gallery' ? 'text-amber-600' : 'text-slate-600 dark:text-white/40'
            }`}
          >
            <Camera size={24} />
            <span className="text-xs">Gallery</span>
          </button>
          <button
            onClick={() => handleTabChange('rsvp')}
            className={`flex flex-col items-center gap-1 ${
              activeTab === 'rsvp' ? 'text-amber-600' : 'text-slate-600 dark:text-white/40'
            }`}
          >
            <MessageCircle size={24} />
            <span className="text-xs">RSVP</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Template imports for the gallery
const TEMPLATES = [
  { id: 'wc1', cat: 'wedding', name: 'Floral Gold', bg: 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?q=80&w=800' },
  { id: 'wc2', cat: 'wedding', name: 'Royal Ivory', bg: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?q=80&w=800' },
  { id: 'mm1', cat: 'custom', name: 'Helvetica Bold', bg: 'https://images.unsplash.com/photo-1497215728101-856c6e3c1fdc?q=80&w=800' },
  { id: 'th1', cat: 'wedding', name: 'Temple Gold', bg: 'https://images.unsplash.com/photo-1610128960763-7eb928424271?q=80&w=800' },
  { id: 'hw1', cat: 'housewarming', name: 'Warm Lights', bg: 'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?q=80&w=800' },
  { id: 'bd1', cat: 'birthday', name: 'Confetti Pop', bg: 'https://images.unsplash.com/photo-1530103862676-de3c9da59af7?q=80&w=800' },
];

export default PublicInviteView;