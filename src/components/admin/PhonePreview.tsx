import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useProfile } from '@/contexts/ProfileContext';
import { LinkType, LinkItem, SocialPlatform, SocialLink, Typography } from '@/types/modernProfile.types';
import { ExternalLink, Play, Grid, Link as LinkIcon, Instagram, Twitter, Linkedin, Mail, Youtube, Github, Facebook, Music, Twitch, Disc as Discord, Sparkles, UserPlus, QrCode, Share2, X, Check, Copy, Download, Volume2, VolumeX, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LinkItemRenderer } from '@/components/public-profile/LinkItemRenderer';
import { GalleryRenderer } from '@/components/public-profile/GalleryRenderer';
import { VideoRenderer } from '@/components/public-profile/VideoRenderer';

const PREVIEW_SOCIAL_ICONS: Record<SocialPlatform, React.ElementType> = {
  instagram: Instagram,
  twitter: Twitter,
  linkedin: Linkedin,
  email: Mail,
  youtube: Youtube,
  github: Github,
  facebook: Facebook,
  tiktok: Music,
  spotify: Music,
  twitch: Twitch,
  discord: Discord,
  website: LinkIcon,
  custom: Sparkles
};

// Helper to generate CSS style object from Typography config
const getTypographyStyle = (config: Typography) => {
    return {
        fontFamily: config.family,
        color: config.color,
        fontSize: `${config.size}rem`,
        fontWeight: config.weight === '800' ? 800 : config.weight === 'bold' ? 700 : 400,
        fontStyle: config.style,
        textTransform: config.transform || 'none',
        letterSpacing: config.letterSpacing || 'normal',
        textDecoration: config.decoration || 'none',
    } as React.CSSProperties;
};

// Helper to get favicon
const getFaviconUrl = (urlStr: string | undefined) => {
    if (!urlStr) return '';
    try {
        const url = urlStr.startsWith('http') ? urlStr : `https://${urlStr}`;
        const hostname = new URL(url).hostname;
        return `https://www.google.com/s2/favicons?domain=${hostname}&sz=128`;
    } catch (e) {
        return '';
    }
};

const SocialIconItem: React.FC<{ social: SocialLink, theme: any }> = ({ social, theme }) => {
    const Icon = PREVIEW_SOCIAL_ICONS[social.platform] || LinkIcon;
    const style = theme.socials.style;
    const color = theme.socials.color;

    // Determine icon container styles based on theme config
    let containerClass = "w-11 h-11 flex items-center justify-center transition-all duration-300 group overflow-hidden relative ";
    let iconSize = 20;

    // Check if color is "light" to determine if icon inside should be black for contrast
    const isLightColor = (hex: string) => {
        if (!hex) return false;
        const r = parseInt(hex.substr(1, 2), 16);
        const g = parseInt(hex.substr(3, 2), 16);
        const b = parseInt(hex.substr(5, 2), 16);
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        return brightness > 155;
    };

    const isBackgroundLight = style === 'filled' && isLightColor(color);

    if (style === 'filled') {
        containerClass += "rounded-full shadow-lg";
    } else if (style === 'outline') {
        containerClass += "rounded-full border border-current hover:bg-current hover:text-black";
    } else if (style === 'glass') {
        containerClass += "rounded-full backdrop-blur-md bg-white/10 border border-white/20 shadow-lg hover:scale-110";
    } else { // minimal
        containerClass += "hover:scale-110";
        iconSize = 24;
    }

    return (
        <motion.a
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className={containerClass}
            style={{
                backgroundColor: style === 'filled' ? color : undefined,
                color: style === 'filled' ? (isBackgroundLight ? '#000000' : '#ffffff') : color
            }}
            title={social.label || social.platform}
        >
            {social.platform === 'custom' && social.customIconUrl ? (
                <img src={social.customIconUrl} alt="custom" className="w-full h-full object-cover rounded-full" />
            ) : (
                <Icon size={iconSize} />
            )}
        </motion.a>
    );
}

interface PhonePreviewProps {
  mobileFullscreen?: boolean;
}

export const PhonePreview: React.FC<PhonePreviewProps> = ({ mobileFullscreen = false }) => {
  const { profile, links, theme, updateLink } = useProfile();
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);
  const [hoveredLinkId, setHoveredLinkId] = useState<string | null>(null);

  useEffect(() => {
    const calculateScale = () => {
      if (mobileFullscreen) {
          setScale(1);
          return;
      }
      if (!containerRef.current) return;
      const parent = containerRef.current.parentElement;
      if (parent) {
        const { width: parentWidth, height: parentHeight } = parent.getBoundingClientRect();
        const targetW = 393;
        const targetH = 852;
        const padding = 40;
        const availableW = parentWidth - padding;
        const availableH = parentHeight - padding;
        const scaleW = availableW / targetW;
        const scaleH = availableH / targetH;
        const newScale = Math.min(scaleW, scaleH, 0.95);
        setScale(newScale);
      }
    };
    calculateScale();
    window.addEventListener('resize', calculateScale);
    return () => window.removeEventListener('resize', calculateScale);
  }, [mobileFullscreen]);

  const getBackgroundStyle = () => {
    const style: React.CSSProperties = {};
    if (theme.bgType === 'color') {
        style.backgroundColor = theme.bgValue;
    } else if (theme.bgType === 'gradient') {
        style.background = theme.bgValue;
    } else if (theme.bgType === 'image') {
        style.backgroundImage = `url(${theme.bgValue})`;
        style.backgroundSize = 'cover';
        style.backgroundPosition = 'center';
        style.backgroundAttachment = mobileFullscreen ? 'fixed' : 'local';
        if (theme.bgConfig) {
            style.transform = `scale(${theme.bgConfig.bgScale}) translateY(${theme.bgConfig.bgPositionY - 50}%)`;
            style.filter = `blur(${theme.bgConfig.bgBlur}px)`;
            style.transformOrigin = 'center center';
        }
    } else {
        style.backgroundColor = '#000000';
    }
    return style;
  };

  const getButtonClass = () => {
    let classes = "w-full py-4 px-5 mb-3 flex items-center justify-between transition-all duration-300 ease-out hover:scale-[1.02] hover:brightness-110 active:scale-95 border relative group ";
    const s = theme.buttons.shape;

    if (s === 'glass') return classes + "rounded-xl backdrop-blur-md shadow-lg";
    if (s === 'outline') return classes + "rounded-xl hover:bg-white/10";
    if (s === 'pill') classes += "rounded-full ";
    if (s === 'rounded') classes += "rounded-xl ";
    if (s === 'square') classes += "rounded-none ";
    if (s === 'hard-shadow') classes += "rounded-none shadow-[4px_4px_0px_0px] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px] ";

    return classes;
  };

  const handleLinkClick = (link: LinkItem) => {
    const analyticsEvent = {
        event: 'link_click',
        timestamp: new Date().toISOString(),
        linkId: link.id,
        linkType: link.type,
        title: link.title,
        url: link.url,
        platform: link.platform || 'generic',
        userAgent: navigator.userAgent
    };

    console.groupCollapsed(`Analytics: Clicked "${link.title}"`);
    console.log('Event Payload:', analyticsEvent);
    console.groupEnd();

    updateLink(link.id, { clicks: (link.clicks || 0) + 1 });
  };

  const handleShare = async () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!profile) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-gray-500">Loading preview...</div>
      </div>
    );
  }

  const visibleLinks = links.filter(link => link.isActive);
  const visibleSocials = profile.socials.filter(s => s.isActive);

  const inviteButtonStyle = {
      color: theme.accentColor,
      borderColor: theme.accentColor + '40',
      backgroundColor: theme.accentColor + '10'
  };

  const wrapperClass = mobileFullscreen
     ? "w-full h-full relative bg-black overflow-hidden"
     : "relative w-[393px] h-[852px] rounded-[55px] bg-[#1a1a1a] shadow-[0_0_0_2px_#333,0_0_0_6px_#000,0_20px_60px_-10px_rgba(0,0,0,0.8)] overflow-hidden border-[8px] border-[#0a0a0a] ring-1 ring-white/10 z-10";

  return (
    <div ref={containerRef} className={`w-full h-full flex items-center justify-center ${mobileFullscreen ? 'p-0' : ''}`}>
        <div
          className="relative origin-center transition-transform duration-200"
          style={{ transform: mobileFullscreen ? 'none' : `scale(${scale})`, width: mobileFullscreen ? '100%' : 'auto', height: mobileFullscreen ? '100%' : 'auto' }}
        >
          <div className={wrapperClass}>

            {!mobileFullscreen && (
                <>
                    <div className="absolute top-28 -left-[10px] w-[4px] h-[26px] bg-[#222] rounded-l-md shadow-sm border-r border-[#111]"></div>
                    <div className="absolute top-[11px] left-1/2 -translate-x-1/2 z-50">
                        <div className="w-[126px] h-[37px] bg-black rounded-full flex items-center justify-between px-3 shadow-lg pointer-events-none">
                            <div className="w-12 h-full"></div>
                        </div>
                    </div>
                </>
            )}

            <div className="absolute inset-0 z-0 h-full w-full overflow-hidden bg-black">
                <div className="absolute inset-[-10%] w-[120%] h-[120%]" style={getBackgroundStyle()} />
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ backgroundColor: `rgba(0,0,0,${theme.bgConfig?.bgOverlay ?? 0.2})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/60 pointer-events-none" />

                <div className="absolute inset-0 h-full overflow-y-auto no-scrollbar scroll-touch pt-16 pb-12 px-6">

                    <div className={`flex flex-col items-center mb-6 text-center ${mobileFullscreen ? 'pt-4' : 'pt-8'}`}>
                        <motion.div
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="w-28 h-28 rounded-full overflow-hidden border-2 mb-5 shadow-2xl relative"
                          style={{ borderColor: theme.profile.name.color + '40' }}
                        >
                          <img src={profile.avatarUrl} alt={profile.displayName} className="w-full h-full object-cover" />
                        </motion.div>

                        <h2 style={getTypographyStyle(theme.profile.name)} className="mb-2 leading-tight">
                          {profile.displayName}
                        </h2>
                        {profile.profession && (
                          <p style={getTypographyStyle(theme.profile.profession)} className="mb-3">
                            {profile.profession}
                          </p>
                        )}
                        <p style={getTypographyStyle(theme.profile.bio)} className="max-w-[280px] leading-relaxed">
                          {profile.bio}
                        </p>

                        {visibleSocials.length > 0 && (
                            <motion.div layout className="flex flex-wrap items-center justify-center gap-3 mt-6">
                                {visibleSocials.map((social) => (
                                    <SocialIconItem key={social.id} social={social} theme={theme} />
                                ))}
                            </motion.div>
                        )}
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-8">
                        {[{icon: UserPlus, label: 'SAVE'}, {icon: QrCode, label: 'SCAN'}, {icon: Share2, label: 'SHARE'}].map((cta, i) => (
                            <button
                                key={i}
                                className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl border hover:brightness-110 active:scale-95 transition-all backdrop-blur-md shadow-sm"
                                style={inviteButtonStyle}
                                onClick={cta.label === 'SHARE' ? handleShare : cta.label === 'SCAN' ? () => setShowQR(true) : undefined}
                            >
                                <cta.icon size={20} />
                                <span className="text-[10px] font-bold tracking-wider">{cta.label}</span>
                            </button>
                        ))}
                    </div>

                    <div className="space-y-4 pb-20">
                        {visibleLinks.map((link, i) => {
                            if (link.type === LinkType.HEADER) {
                                return (
                                    <motion.div key={link.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-4 py-4 mt-2">
                                        <div className="h-[1px] flex-1 opacity-20" style={{ backgroundColor: theme.headers.color }}></div>
                                        <h3 style={getTypographyStyle(theme.headers)}>
                                        {link.title}
                                        </h3>
                                        <div className="h-[1px] flex-1 opacity-20" style={{ backgroundColor: theme.headers.color }}></div>
                                    </motion.div>
                                );
                            }

                            if (link.type === LinkType.GALLERY && link.galleryImages && link.galleryImages.length > 0) {
                                return (
                                    <motion.div key={link.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                        <GalleryRenderer
                                            images={link.galleryImages || []}
                                            layout={link.layout}
                                            title={link.title}
                                        />
                                    </motion.div>
                                )
                            }

                            if (link.type === LinkType.VIDEO_EMBED || link.type === LinkType.VIDEO_UPLOAD) {
                                return (
                                    <motion.div key={link.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-3">
                                        <VideoRenderer
                                            url={link.url || ''}
                                            thumbnail={link.thumbnail}
                                            title={link.title}
                                        />
                                    </motion.div>
                                )
                            }

                            return (
                                <motion.a
                                    key={link.id}
                                    href={link.url || '#'}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className={getButtonClass()}
                                    onMouseEnter={() => setHoveredLinkId(link.id)}
                                    onMouseLeave={() => setHoveredLinkId(null)}
                                    style={{
                                        backgroundColor: theme.buttons.backgroundColor,
                                        borderColor: theme.buttons.borderColor,
                                        borderWidth: `${theme.buttons.borderWidth}px`,
                                        color: theme.buttons.textColor,
                                        fontFamily: theme.buttons.fontFamily,
                                        fontWeight: theme.buttons.fontWeight,
                                        boxShadow: theme.buttons.shape === 'hard-shadow' && theme.buttons.shadowColor
                                            ? `4px 4px 0px 0px ${theme.buttons.shadowColor}`
                                            : undefined
                                    }}
                                    onClick={(e) => {
                                        if (!link.url) e.preventDefault();
                                        handleLinkClick(link);
                                    }}
                                >
                                    {link.thumbnail && (
                                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-black/10 shrink-0 mr-3">
                                            <img src={link.thumbnail} alt="" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                    <span className="flex-1 text-center font-medium relative z-10">{link.title}</span>
                                    {link.thumbnail && <div className="w-10" />}

                                    <AnimatePresence>
                                        {hoveredLinkId === link.id && link.url && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.5, y: 10, x: '-50%' }}
                                                animate={{ opacity: 1, scale: 1, y: -50, x: '-50%' }}
                                                exit={{ opacity: 0, scale: 0.5, y: 10, x: '-50%' }}
                                                className="absolute left-1/2 p-2 bg-white/90 dark:bg-black/90 backdrop-blur-md rounded-xl shadow-xl z-20 pointer-events-none border border-black/5 dark:border-white/10 text-neutral-900 dark:text-white"
                                                style={{ color: 'inherit' }}
                                            >
                                                <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/10 flex items-center justify-center">
                                                    <img
                                                        src={getFaviconUrl(link.url)}
                                                        className="w-8 h-8 object-contain"
                                                        alt="preview"
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).style.display = 'none';
                                                            (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                                                        }}
                                                    />
                                                    <div className="hidden text-gray-500 dark:text-gray-400">
                                                        <Globe size={20} />
                                                    </div>
                                                </div>
                                                <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-white/90 dark:bg-black/90 rotate-45 border-r border-b border-black/5 dark:border-white/10"></div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.a>
                            );
                        })}
                    </div>
                </div>
            </div>
          </div>
        </div>

        <AnimatePresence>
            {showQR && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-6"
                    onClick={() => setShowQR(false)}
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        className="bg-white dark:bg-[#18181b] rounded-[32px] p-8 w-full max-w-sm shadow-2xl flex flex-col items-center gap-6 border border-transparent dark:border-white/10"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="text-center">
                            <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-4 text-blue-600 dark:text-blue-400">
                                <QrCode size={32} />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Share Profile</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">Scan to visit this profile</p>
                        </div>

                        <div className="bg-white p-4 rounded-2xl border-2 border-gray-100 dark:border-white/5 shadow-inner">
                             <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(window.location.href)}&color=000000&bgcolor=ffffff`}
                                alt="QR Code"
                                className="w-48 h-48 mix-blend-multiply"
                             />
                        </div>

                        <div className="flex gap-3 w-full">
                            <button
                                onClick={() => {
                                    const link = document.createElement('a');
                                    link.href = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(window.location.href)}`;
                                    link.download = 'swaz-profile-qr.png';
                                    link.target = '_blank';
                                    link.click();
                                }}
                                className="flex-1 py-3 rounded-xl bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-900 dark:text-white font-bold text-sm transition-colors flex items-center justify-center gap-2"
                            >
                                <Download size={16} /> Save
                            </button>
                            <button
                                onClick={() => setShowQR(false)}
                                className="flex-1 py-3 rounded-xl bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 font-bold text-sm transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>

        <AnimatePresence>
            {copied && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-black/80 dark:bg-white/90 text-white dark:text-black px-4 py-2 rounded-full backdrop-blur-md shadow-xl flex items-center gap-2 z-[60]"
                >
                    <Check size={16} className="text-green-400 dark:text-green-600" />
                    <span className="text-sm font-bold">Link Copied!</span>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
  );
};

export default PhonePreview;
