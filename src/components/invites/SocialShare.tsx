import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Share2,
  Whatsapp,
  Mail,
  Link2,
  QrCode,
  Instagram,
  Download,
  Copy,
  Check,
  Palette
} from 'lucide-react';
import { inviteApi } from '../../services/inviteApi';
import { DigitalInvite } from '../../types/invite.types';

interface SocialShareProps {
  invite: DigitalInvite;
  isOpen: boolean;
  onClose: () => void;
}

interface StoryTemplate {
  id: string;
  name: string;
  background: string;
  textColor: string;
  accentColor: string;
  font: string;
}

const STORY_TEMPLATES: StoryTemplate[] = [
  {
    id: 'floral',
    name: 'Floral Gold',
    background: 'linear-gradient(135deg, #f5e6d3 0%, #fff 50%, #f5e6d3 100%)',
    textColor: '#8b6914',
    accentColor: '#d4a574',
    font: 'Georgia'
  },
  {
    id: 'royal',
    name: 'Royal Blue',
    background: 'linear-gradient(135deg, #1e3a5f 0%, #2c5282 100%)',
    textColor: '#fff',
    accentColor: '#f6e05e',
    font: 'Cinzel'
  },
  {
    id: 'minimal',
    name: 'Minimal White',
    background: 'linear-gradient(135deg, #fafafa 0%, #fff 100%)',
    textColor: '#1a202c',
    accentColor: '#4a5568',
    font: 'Helvetica'
  },
  {
    id: 'festive',
    name: 'Festive Red',
    background: 'linear-gradient(135deg, #c53030 0%, #9b2c2c 100%)',
    textColor: '#fff',
    accentColor: '#fbd38d',
    font: 'Playfair Display'
  },
  {
    id: 'elegant',
    name: 'Elegant Rose',
    background: 'linear-gradient(135deg, #f687b3 0%, #d53f8c 100%)',
    textColor: '#fff',
    accentColor: '#fff',
    font: 'Cormorant Garamond'
  }
];

export const SocialShare: React.FC<SocialShareProps> = ({ invite, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'whatsapp' | 'email' | 'qr' | 'story'>('whatsapp');
  const [copied, setCopied] = useState(false);
  const [emailMessage, setEmailMessage] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(STORY_TEMPLATES[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const inviteUrl = `${window.location.origin}/invite/${invite.slug}`;
  const qrCodeUrl = inviteApi.getQRCodeUrl(invite.slug);

  useEffect(() => {
    if (isOpen) {
      // Generate default email message
      const eventTypeLabel = invite.eventType.charAt(0).toUpperCase() + invite.eventType.slice(1);
      setEmailMessage(
        `Dear ${invite.eventType === 'wedding' ? 'Friends & Family' : 'Guests'},\n\n` +
        `You are cordially invited to ${invite.hostName}'s ${eventTypeLabel.toLowerCase()}!\n\n` +
        `Date: ${new Date(invite.date).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}\n` +
        `Time: ${invite.time}\n` +
        `Venue: ${invite.venue}\n\n` +
        `Click the link below to view the invitation and RSVP:\n${inviteUrl}\n\n` +
        `Looking forward to celebrating with you!\n\nWarm regards,\n${invite.hostName}`
      );
    }
  }, [isOpen, invite]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const handleWhatsAppShare = () => {
    const message = encodeURIComponent(
      `🎉 You're invited! ${invite.hostName}'s ${invite.eventType} invitation 🎉\n\n` +
      `📅 ${new Date(invite.date).toLocaleDateString()}\n` +
      `📍 ${invite.venue}\n\n` +
      `View full invitation: ${inviteUrl}`
    );

    const whatsappUrl = `https://wa.me/?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent(`Invitation: ${invite.hostName}'s ${invite.eventType}`);
    const body = encodeURIComponent(emailMessage);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleDownloadQR = async () => {
    try {
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qr-${invite.slug}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download QR code:', error);
    }
  };

  const generateInstagramStory = async () => {
    setIsGenerating(true);

    try {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Instagram story dimensions: 1080x1920
      canvas.width = 1080;
      canvas.height = 1920;

      // Draw background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);

      // Parse gradient colors (simplified)
      if (selectedTemplate.id === 'floral') {
        gradient.addColorStop(0, '#f5e6d3');
        gradient.addColorStop(0.5, '#ffffff');
        gradient.addColorStop(1, '#f5e6d3');
      } else if (selectedTemplate.id === 'royal') {
        gradient.addColorStop(0, '#1e3a5f');
        gradient.addColorStop(1, '#2c5282');
      } else if (selectedTemplate.id === 'minimal') {
        gradient.addColorStop(0, '#fafafa');
        gradient.addColorStop(1, '#ffffff');
      } else if (selectedTemplate.id === 'festive') {
        gradient.addColorStop(0, '#c53030');
        gradient.addColorStop(1, '#9b2c2c');
      } else if (selectedTemplate.id === 'elegant') {
        gradient.addColorStop(0, '#f687b3');
        gradient.addColorStop(1, '#d53f8c');
      }

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Set text styles
      ctx.fillStyle = selectedTemplate.textColor;
      ctx.textAlign = 'center';

      // Draw event type
      ctx.font = `bold 80px ${selectedTemplate.font}`;
      const eventTypeLabel = invite.eventType.charAt(0).toUpperCase() + invite.eventType.slice(1);
      ctx.fillText(eventTypeLabel + ' Invitation', canvas.width / 2, 300);

      // Draw host name
      ctx.font = `bold 120px ${selectedTemplate.font}`;
      ctx.fillText(invite.hostName, canvas.width / 2, 550);

      // Draw date and time
      ctx.font = `50px ${selectedTemplate.font}`;
      const dateStr = new Date(invite.date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      ctx.fillText(dateStr, canvas.width / 2, 750);
      ctx.fillText(`at ${invite.time}`, canvas.width / 2, 830);

      // Draw venue
      ctx.fillText(invite.venue, canvas.width / 2, 910);

      // Draw QR code placeholder
      const qrSize = 400;
      const qrX = (canvas.width - qrSize) / 2;
      const qrY = 1050;

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(qrX - 20, qrY - 20, qrSize + 40, qrSize + 40);
      ctx.strokeStyle = selectedTemplate.accentColor;
      ctx.lineWidth = 5;
      ctx.strokeRect(qrX - 20, qrY - 20, qrSize + 40, qrSize + 40);

      // Load and draw QR code
      const qrResponse = await fetch(qrCodeUrl);
      const qrBlob = await qrResponse.blob();
      const qrImage = await createImageBitmap(qrBlob);
      ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);

      // Draw scan instruction
      ctx.font = `40px ${selectedTemplate.font}`;
      ctx.fillStyle = selectedTemplate.textColor;
      ctx.fillText('Scan to view invitation', canvas.width / 2, 1550);

      // Draw RSVP button
      const btnY = 1650;
      ctx.fillStyle = selectedTemplate.accentColor;
      ctx.beginPath();
      ctx.roundRect(canvas.width / 2 - 200, btnY, 400, 100, 50);
      ctx.fill();

      ctx.fillStyle = selectedTemplate.id === 'minimal' ? '#000' : '#fff';
      ctx.font = `bold 45px ${selectedTemplate.font}`;
      ctx.fillText('RSVP Now', canvas.width / 2, btnY + 65);

      // Download the story
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `${invite.slug}-story.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

    } catch (error) {
      console.error('Failed to generate story:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Share Invitation</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('whatsapp')}
            className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 font-medium transition-colors ${
              activeTab === 'whatsapp'
                ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Whatsapp className="w-5 h-5" />
            WhatsApp
          </button>
          <button
            onClick={() => setActiveTab('email')}
            className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 font-medium transition-colors ${
              activeTab === 'email'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Mail className="w-5 h-5" />
            Email
          </button>
          <button
            onClick={() => setActiveTab('qr')}
            className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 font-medium transition-colors ${
              activeTab === 'qr'
                ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <QrCode className="w-5 h-5" />
            QR Code
          </button>
          <button
            onClick={() => setActiveTab('story')}
            className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 font-medium transition-colors ${
              activeTab === 'story'
                ? 'text-pink-600 border-b-2 border-pink-600 bg-pink-50'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Instagram className="w-5 h-5" />
            Story
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* WhatsApp Tab */}
          {activeTab === 'whatsapp' && (
            <div className="space-y-6">
              <div className="text-center">
                <Whatsapp className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Share via WhatsApp
                </h3>
                <p className="text-gray-600">
                  Send your invitation directly to guests through WhatsApp
                </p>
              </div>

              <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                <p className="text-sm text-green-800 whitespace-pre-line">
                  🎉 You're invited! {invite.hostName}'s {invite.eventType} invitation 🎉

                  📅 {new Date(invite.date).toLocaleDateString()}
                  📍 {invite.venue}

                  View full invitation: {inviteUrl}
                </p>
              </div>

              <button
                onClick={handleWhatsAppShare}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Whatsapp className="w-5 h-5" />
                Open WhatsApp
              </button>
            </div>
          )}

          {/* Email Tab */}
          {activeTab === 'email' && (
            <div className="space-y-6">
              <div className="text-center">
                <Mail className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Share via Email
                </h3>
                <p className="text-gray-600">
                  Send personalized invitations through email
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Message
                </label>
                <textarea
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  rows={10}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Enter your email message..."
                />
              </div>

              <button
                onClick={handleEmailShare}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Mail className="w-5 h-5" />
                Open Email Client
              </button>
            </div>
          )}

          {/* QR Code Tab */}
          {activeTab === 'qr' && (
            <div className="space-y-6">
              <div className="text-center">
                <QrCode className="w-16 h-16 text-purple-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  QR Code
                </h3>
                <p className="text-gray-600">
                  Guests can scan this code to view your invitation
                </p>
              </div>

              <div className="flex justify-center">
                <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-purple-200">
                  <img
                    src={qrCodeUrl}
                    alt="QR Code"
                    className="w-64 h-64"
                  />
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <p className="text-sm text-gray-600 mb-2">Invitation Link:</p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={inviteUrl}
                    readOnly
                    className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors flex items-center gap-2"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
              </div>

              <button
                onClick={handleDownloadQR}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                Download QR Code
              </button>
            </div>
          )}

          {/* Instagram Story Tab */}
          {activeTab === 'story' && (
            <div className="space-y-6">
              <div className="text-center">
                <Instagram className="w-16 h-16 text-pink-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Instagram Story
                </h3>
                <p className="text-gray-600">
                  Generate a beautiful story image to share on Instagram
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  <Palette className="w-4 h-4 inline mr-1" />
                  Choose Template
                </label>
                <div className="grid grid-cols-5 gap-3">
                  {STORY_TEMPLATES.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => setSelectedTemplate(template)}
                      className={`relative h-20 rounded-lg border-2 transition-all ${
                        selectedTemplate.id === template.id
                          ? 'border-pink-500 scale-105 shadow-lg'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      style={{ background: template.background }}
                    >
                      {selectedTemplate.id === template.id && (
                        <div className="absolute -top-2 -right-2 bg-pink-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
                          <Check className="w-4 h-4" />
                        </div>
                      )}
                      <span className="absolute bottom-1 left-0 right-0 text-xs font-medium text-white bg-black/50 px-1 rounded">
                        {template.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-pink-50 rounded-xl p-4 border border-pink-200">
                <p className="text-sm text-pink-800">
                  <strong>Preview:</strong> The story will include your invitation details,
                  event type, date, time, venue, and a QR code for guests to scan.
                </p>
              </div>

              <button
                onClick={generateInstagramStory}
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Instagram className="w-5 h-5" />
                    Generate Story
                  </>
                )}
              </button>

              <div className="text-center text-sm text-gray-500">
                <p>After generating, you can upload the image to Instagram Stories</p>
              </div>
            </div>
          )}
        </div>

        {/* Hidden canvas for story generation */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};

export default SocialShare;
