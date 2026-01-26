/**
 * Modern vCard Suite - Theme Constants
 * 50+ professionally designed themes across multiple categories
 */

import { Theme, ThemeCategory } from '@/types/modernProfile.types';

export const THEMES: Theme[] = [
  // ==========================================
  // BUSINESS / PROFESSIONAL
  // ==========================================
  {
    id: 'minimal-slate',
    name: 'Slate',
    category: 'Business',
    bgType: 'color',
    bgValue: '#f8fafc',
    accentColor: '#0f172a',
    profile: {
        name: { family: 'Inter', color: '#0f172a', size: 1.5, weight: '800', style: 'normal' },
        profession: { family: 'Inter', color: '#64748b', size: 0.8, weight: 'bold', style: 'normal', transform: 'uppercase', letterSpacing: '0.1em' },
        bio: { family: 'Inter', color: '#334155', size: 0.9, weight: 'normal', style: 'normal' }
    },
    headers: { family: 'Inter', color: '#94a3b8', size: 0.8, weight: 'bold', style: 'normal', transform: 'uppercase', letterSpacing: '0.2em' },
    socials: { color: '#0f172a', style: 'outline' },
    buttons: {
        shape: 'rounded',
        backgroundColor: '#ffffff',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        textColor: '#0f172a',
        fontFamily: 'Inter',
        fontWeight: 'bold',
        shadowColor: 'transparent'
    }
  },
  {
    id: 'biz-navy',
    name: 'Executive',
    category: 'Business',
    bgType: 'color',
    bgValue: '#0f172a',
    accentColor: '#38bdf8',
    profile: {
        name: { family: 'DM Sans', color: '#ffffff', size: 1.6, weight: 'bold', style: 'normal' },
        profession: { family: 'Inter', color: '#94a3b8', size: 0.8, weight: 'normal', style: 'normal', transform: 'uppercase', letterSpacing: '0.15em' },
        bio: { family: 'Inter', color: '#cbd5e1', size: 0.9, weight: 'normal', style: 'normal' }
    },
    headers: { family: 'DM Sans', color: '#38bdf8', size: 0.9, weight: 'bold', style: 'normal', transform: 'uppercase', letterSpacing: '0.1em' },
    socials: { color: '#ffffff', style: 'filled' },
    buttons: {
        shape: 'rounded',
        backgroundColor: '#1e293b',
        borderColor: '#334155',
        borderWidth: 1,
        textColor: '#ffffff',
        fontFamily: 'DM Sans',
        fontWeight: 'normal'
    }
  },
  {
    id: 'biz-monolith',
    name: 'Monolith',
    category: 'Business',
    bgType: 'color',
    bgValue: '#000000',
    accentColor: '#ffffff',
    profile: {
        name: { family: 'Inter', color: '#ffffff', size: 1.8, weight: '800', style: 'normal', letterSpacing: '-0.05em' },
        profession: { family: 'Inter', color: '#737373', size: 0.75, weight: 'normal', style: 'normal', transform: 'uppercase', letterSpacing: '0.2em' },
        bio: { family: 'Inter', color: '#a3a3a3', size: 0.95, weight: 'normal', style: 'normal' }
    },
    headers: { family: 'Inter', color: '#525252', size: 0.8, weight: 'bold', style: 'normal', transform: 'uppercase', letterSpacing: '0.2em' },
    socials: { color: '#ffffff', style: 'minimal' },
    buttons: {
        shape: 'square',
        backgroundColor: '#171717',
        borderColor: '#262626',
        borderWidth: 1,
        textColor: '#ffffff',
        fontFamily: 'Inter',
        fontWeight: 'bold'
    }
  },
  {
    id: 'biz-startup',
    name: 'Startup',
    category: 'Business',
    bgType: 'gradient',
    bgValue: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
    accentColor: '#ffffff',
    profile: {
        name: { family: 'DM Sans', color: '#ffffff', size: 1.7, weight: 'bold', style: 'normal' },
        profession: { family: 'DM Sans', color: '#e0e7ff', size: 0.85, weight: 'normal', style: 'normal', transform: 'uppercase', letterSpacing: '0.05em' },
        bio: { family: 'DM Sans', color: '#e0e7ff', size: 1.0, weight: 'normal', style: 'normal' }
    },
    headers: { family: 'DM Sans', color: '#ffffff', size: 1.0, weight: 'bold', style: 'normal', transform: 'uppercase' },
    socials: { color: '#ffffff', style: 'filled' },
    buttons: {
        shape: 'pill',
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderColor: 'rgba(255,255,255,0.3)',
        borderWidth: 1,
        textColor: '#ffffff',
        fontFamily: 'DM Sans',
        fontWeight: 'bold'
    }
  },
  {
    id: 'biz-consultant',
    name: 'Consultant',
    category: 'Business',
    bgType: 'color',
    bgValue: '#e7e5e4',
    accentColor: '#44403c',
    profile: {
        name: { family: 'Playfair Display', color: '#292524', size: 1.6, weight: 'bold', style: 'normal' },
        profession: { family: 'Inter', color: '#57534e', size: 0.8, weight: 'normal', style: 'normal', transform: 'uppercase', letterSpacing: '0.1em' },
        bio: { family: 'Inter', color: '#44403c', size: 0.95, weight: 'normal', style: 'normal' }
    },
    headers: { family: 'Playfair Display', color: '#292524', size: 0.9, weight: 'bold', style: 'italic' },
    socials: { color: '#292524', style: 'outline' },
    buttons: {
        shape: 'rounded',
        backgroundColor: '#fafaf9',
        borderColor: '#d6d3d1',
        borderWidth: 1,
        textColor: '#292524',
        fontFamily: 'Inter',
        fontWeight: 'normal'
    }
  },

  // ==========================================
  // WEDDING / LUXURY
  // ==========================================
  {
    id: 'wedding-royal',
    name: 'Royal',
    category: 'Wedding',
    bgType: 'color',
    bgValue: '#2c0b0e',
    accentColor: '#fbbf24',
    profile: {
        name: { family: 'Cinzel', color: '#fef3c7', size: 1.4, weight: 'bold', style: 'normal', letterSpacing: '0.05em' },
        profession: { family: 'Playfair Display', color: '#d1d5db', size: 0.8, weight: 'normal', style: 'italic', transform: 'uppercase' },
        bio: { family: 'DM Sans', color: '#e5e7eb', size: 0.9, weight: 'normal', style: 'normal' }
    },
    headers: { family: 'Cinzel', color: '#fbbf24', size: 1.1, weight: 'bold', style: 'normal', letterSpacing: '0.2em', transform: 'uppercase' },
    socials: { color: '#fbbf24', style: 'outline' },
    buttons: {
        shape: 'outline',
        backgroundColor: 'transparent',
        borderColor: '#fbbf24',
        borderWidth: 1,
        textColor: '#fef3c7',
        fontFamily: 'Cinzel',
        fontWeight: 'bold'
    }
  },
  {
    id: 'wedding-ethereal',
    name: 'Ethereal',
    category: 'Wedding',
    bgType: 'color',
    bgValue: '#fdf2f8',
    accentColor: '#be185d',
    profile: {
        name: { family: 'Playfair Display', color: '#831843', size: 1.8, weight: 'normal', style: 'italic' },
        profession: { family: 'Inter', color: '#bc1a5e', size: 0.75, weight: 'normal', style: 'normal', transform: 'uppercase', letterSpacing: '0.15em' },
        bio: { family: 'Inter', color: '#9d174d', size: 0.9, weight: 'normal', style: 'normal' }
    },
    headers: { family: 'Playfair Display', color: '#be185d', size: 1.0, weight: 'normal', style: 'normal', decoration: 'underline' },
    socials: { color: '#be185d', style: 'minimal' },
    buttons: {
        shape: 'rounded',
        backgroundColor: '#ffffff',
        borderColor: '#fbcfe8',
        borderWidth: 1,
        textColor: '#831843',
        fontFamily: 'Playfair Display',
        fontWeight: 'normal'
    }
  },
  {
    id: 'wedding-classic',
    name: 'Classic',
    category: 'Wedding',
    bgType: 'color',
    bgValue: '#ffffff',
    accentColor: '#18181b',
    profile: {
        name: { family: 'Cinzel', color: '#18181b', size: 1.5, weight: 'bold', style: 'normal' },
        profession: { family: 'Cinzel', color: '#52525b', size: 0.7, weight: 'normal', style: 'normal', transform: 'uppercase', letterSpacing: '0.1em' },
        bio: { family: 'Cormorant Garamond', color: '#27272a', size: 1.1, weight: 'normal', style: 'italic' }
    },
    headers: { family: 'Cinzel', color: '#18181b', size: 0.9, weight: 'bold', style: 'normal', transform: 'uppercase', letterSpacing: '0.2em' },
    socials: { color: '#18181b', style: 'outline' },
    buttons: {
        shape: 'square',
        backgroundColor: '#ffffff',
        borderColor: '#18181b',
        borderWidth: 1,
        textColor: '#18181b',
        fontFamily: 'Cinzel',
        fontWeight: 'bold'
    }
  },
  {
    id: 'wedding-botanical',
    name: 'Botanical',
    category: 'Wedding',
    bgType: 'color',
    bgValue: '#f0fdf4',
    accentColor: '#15803d',
    profile: {
        name: { family: 'Playfair Display', color: '#14532d', size: 1.6, weight: 'bold', style: 'normal' },
        profession: { family: 'Inter', color: '#166534', size: 0.8, weight: 'normal', style: 'normal', transform: 'uppercase', letterSpacing: '0.1em' },
        bio: { family: 'Inter', color: '#15803d', size: 0.95, weight: 'normal', style: 'normal' }
    },
    headers: { family: 'Playfair Display', color: '#15803d', size: 1.0, weight: 'bold', style: 'italic' },
    socials: { color: '#15803d', style: 'minimal' },
    buttons: {
        shape: 'rounded',
        backgroundColor: '#dcfce7',
        borderColor: '#bbf7d0',
        borderWidth: 1,
        textColor: '#14532d',
        fontFamily: 'Playfair Display',
        fontWeight: 'normal'
    }
  },
  {
    id: 'wedding-champagne',
    name: 'Champagne',
    category: 'Wedding',
    bgType: 'color',
    bgValue: '#fffbeb',
    accentColor: '#b45309',
    profile: {
        name: { family: 'Cinzel', color: '#78350f', size: 1.5, weight: 'bold', style: 'normal' },
        profession: { family: 'Inter', color: '#92400e', size: 0.75, weight: 'normal', style: 'normal', transform: 'uppercase', letterSpacing: '0.15em' },
        bio: { family: 'Inter', color: '#92400e', size: 0.9, weight: 'normal', style: 'normal' }
    },
    headers: { family: 'Cinzel', color: '#b45309', size: 0.9, weight: 'bold', style: 'normal', transform: 'uppercase' },
    socials: { color: '#b45309', style: 'outline' },
    buttons: {
        shape: 'pill',
        backgroundColor: '#ffffff',
        borderColor: '#fcd34d',
        borderWidth: 1,
        textColor: '#78350f',
        fontFamily: 'Inter',
        fontWeight: 'normal'
    }
  },

  // ==========================================
  // PHOTOGRAPHY / ART
  // ==========================================
  {
    id: 'photo-noir',
    name: 'Noir',
    category: 'Photography',
    bgType: 'color',
    bgValue: '#000000',
    accentColor: '#ffffff',
    profile: {
        name: { family: 'Playfair Display', color: '#ffffff', size: 1.6, weight: 'normal', style: 'italic' },
        profession: { family: 'Inter', color: '#737373', size: 0.75, weight: 'normal', style: 'normal', transform: 'uppercase', letterSpacing: '0.2em' },
        bio: { family: 'Inter', color: '#a3a3a3', size: 0.9, weight: 'normal', style: 'normal' }
    },
    headers: { family: 'Inter', color: '#404040', size: 0.8, weight: 'bold', style: 'normal', transform: 'uppercase', letterSpacing: '0.3em' },
    socials: { color: '#ffffff', style: 'minimal' },
    buttons: {
        shape: 'square',
        backgroundColor: '#171717',
        borderColor: '#333333',
        borderWidth: 0,
        textColor: '#ffffff',
        fontFamily: 'Inter',
        fontWeight: 'normal'
    }
  },
  {
    id: 'photo-darkroom',
    name: 'Darkroom',
    category: 'Photography',
    bgType: 'color',
    bgValue: '#0f0000',
    accentColor: '#ef4444',
    profile: {
        name: { family: 'Inter', color: '#ffffff', size: 1.5, weight: '800', style: 'normal', transform: 'uppercase', letterSpacing: '0.05em' },
        profession: { family: 'Space Grotesk', color: '#ef4444', size: 0.8, weight: 'normal', style: 'normal', transform: 'uppercase', letterSpacing: '0.1em' },
        bio: { family: 'Inter', color: '#9ca3af', size: 0.9, weight: 'normal', style: 'normal' }
    },
    headers: { family: 'Inter', color: '#7f1d1d', size: 0.8, weight: 'bold', style: 'normal', transform: 'uppercase', letterSpacing: '0.2em' },
    socials: { color: '#ef4444', style: 'outline' },
    buttons: {
        shape: 'rounded',
        backgroundColor: '#1a0505',
        borderColor: '#450a0a',
        borderWidth: 1,
        textColor: '#fecaca',
        fontFamily: 'Space Grotesk',
        fontWeight: 'bold'
    }
  },
  {
    id: 'photo-sepia',
    name: 'Sepia',
    category: 'Photography',
    bgType: 'color',
    bgValue: '#2a221e',
    accentColor: '#fdba74',
    profile: {
        name: { family: 'Playfair Display', color: '#fdba74', size: 1.6, weight: 'bold', style: 'normal' },
        profession: { family: 'Caveat', color: '#fb923c', size: 1.1, weight: 'normal', style: 'normal' },
        bio: { family: 'DM Sans', color: '#fed7aa', size: 0.95, weight: 'normal', style: 'normal' }
    },
    headers: { family: 'DM Sans', color: '#9a3412', size: 0.9, weight: 'bold', style: 'normal', transform: 'uppercase', letterSpacing: '0.1em' },
    socials: { color: '#fdba74', style: 'minimal' },
    buttons: {
        shape: 'rounded',
        backgroundColor: '#431407',
        borderColor: '#7c2d12',
        borderWidth: 1,
        textColor: '#fdba74',
        fontFamily: 'DM Sans',
        fontWeight: 'normal'
    }
  },
  {
    id: 'photo-polaroid',
    name: 'Polaroid',
    category: 'Photography',
    bgType: 'color',
    bgValue: '#e5e5e5',
    accentColor: '#171717',
    profile: {
        name: { family: 'Caveat', color: '#171717', size: 1.8, weight: 'bold', style: 'normal' },
        profession: { family: 'Inter', color: '#525252', size: 0.75, weight: 'normal', style: 'normal', transform: 'uppercase', letterSpacing: '0.1em' },
        bio: { family: 'Inter', color: '#262626', size: 0.9, weight: 'normal', style: 'normal' }
    },
    headers: { family: 'Caveat', color: '#525252', size: 1.2, weight: 'bold', style: 'normal' },
    socials: { color: '#171717', style: 'outline' },
    buttons: {
        shape: 'hard-shadow',
        backgroundColor: '#ffffff',
        borderColor: '#171717',
        borderWidth: 1,
        textColor: '#171717',
        fontFamily: 'Inter',
        fontWeight: 'bold',
        shadowColor: '#a3a3a3'
    }
  },
  {
    id: 'photo-gallery',
    name: 'Gallery',
    category: 'Photography',
    bgType: 'color',
    bgValue: '#f3f4f6',
    accentColor: '#000000',
    profile: {
        name: { family: 'Inter', color: '#000000', size: 1.5, weight: 'bold', style: 'normal', letterSpacing: '-0.03em' },
        profession: { family: 'Inter', color: '#6b7280', size: 0.8, weight: 'normal', style: 'normal' },
        bio: { family: 'Inter', color: '#374151', size: 0.9, weight: 'normal', style: 'normal' }
    },
    headers: { family: 'Inter', color: '#9ca3af', size: 0.8, weight: 'bold', style: 'normal', transform: 'uppercase' },
    socials: { color: '#000000', style: 'minimal' },
    buttons: {
        shape: 'square',
        backgroundColor: '#ffffff',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        textColor: '#000000',
        fontFamily: 'Inter',
        fontWeight: 'normal'
    }
  },

  // ==========================================
  // MAKEUP / BEAUTY
  // ==========================================
  {
    id: 'makeup-blush',
    name: 'Blush',
    category: 'Makeup',
    bgType: 'gradient',
    bgValue: 'linear-gradient(to bottom, #fff1f2, #ffe4e6)',
    accentColor: '#f43f5e',
    profile: {
        name: { family: 'Playfair Display', color: '#be123c', size: 1.6, weight: 'bold', style: 'normal' },
        profession: { family: 'Inter', color: '#fb7185', size: 0.8, weight: 'bold', style: 'normal', transform: 'uppercase', letterSpacing: '0.1em' },
        bio: { family: 'Inter', color: '#9f1239', size: 0.95, weight: 'normal', style: 'normal' }
    },
    headers: { family: 'Playfair Display', color: '#e11d48', size: 1.0, weight: 'bold', style: 'italic' },
    socials: { color: '#f43f5e', style: 'filled' },
    buttons: {
        shape: 'pill',
        backgroundColor: '#ffffff',
        borderColor: '#fda4af',
        borderWidth: 1,
        textColor: '#be123c',
        fontFamily: 'Inter',
        fontWeight: 'bold'
    }
  },
  {
    id: 'makeup-glow',
    name: 'Glow',
    category: 'Makeup',
    bgType: 'gradient',
    bgValue: 'linear-gradient(135deg, #1c1917, #451a03)',
    accentColor: '#fcd34d',
    profile: {
        name: { family: 'Cinzel', color: '#fcd34d', size: 1.5, weight: 'normal', style: 'normal' },
        profession: { family: 'Inter', color: '#fbbf24', size: 0.75, weight: 'normal', style: 'normal', transform: 'uppercase', letterSpacing: '0.15em' },
        bio: { family: 'Inter', color: '#fafaf9', size: 0.9, weight: 'normal', style: 'normal' }
    },
    headers: { family: 'Cinzel', color: '#f59e0b', size: 0.9, weight: 'bold', style: 'normal', transform: 'uppercase' },
    socials: { color: '#fcd34d', style: 'outline' },
    buttons: {
        shape: 'rounded',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderColor: '#fcd34d',
        borderWidth: 1,
        textColor: '#fef3c7',
        fontFamily: 'Inter',
        fontWeight: 'normal'
    }
  },
  {
    id: 'makeup-nude',
    name: 'Nude Palette',
    category: 'Makeup',
    bgType: 'color',
    bgValue: '#d6c0b0',
    accentColor: '#49372f',
    profile: {
        name: { family: 'DM Sans', color: '#49372f', size: 1.6, weight: 'bold', style: 'normal' },
        profession: { family: 'Inter', color: '#75584b', size: 0.8, weight: 'normal', style: 'normal', transform: 'uppercase', letterSpacing: '0.1em' },
        bio: { family: 'Inter', color: '#49372f', size: 0.95, weight: 'normal', style: 'normal' }
    },
    headers: { family: 'DM Sans', color: '#75584b', size: 0.9, weight: 'bold', style: 'normal' },
    socials: { color: '#49372f', style: 'minimal' },
    buttons: {
        shape: 'rounded',
        backgroundColor: '#eaddd5',
        borderColor: '#cbb6a8',
        borderWidth: 1,
        textColor: '#49372f',
        fontFamily: 'DM Sans',
        fontWeight: 'bold'
    }
  },
  {
    id: 'makeup-vamp',
    name: 'Vamp',
    category: 'Makeup',
    bgType: 'color',
    bgValue: '#2e1065',
    accentColor: '#e879f9',
    profile: {
        name: { family: 'Playfair Display', color: '#f5d0fe', size: 1.7, weight: 'normal', style: 'italic' },
        profession: { family: 'Inter', color: '#d8b4fe', size: 0.8, weight: 'normal', style: 'normal', transform: 'uppercase', letterSpacing: '0.2em' },
        bio: { family: 'Inter', color: '#e9d5ff', size: 0.9, weight: 'normal', style: 'normal' }
    },
    headers: { family: 'Playfair Display', color: '#e879f9', size: 1.0, weight: 'bold', style: 'normal' },
    socials: { color: '#e879f9', style: 'outline' },
    buttons: {
        shape: 'glass',
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderColor: 'rgba(232, 121, 249, 0.3)',
        borderWidth: 1,
        textColor: '#f5d0fe',
        fontFamily: 'Inter',
        fontWeight: 'normal'
    }
  },
  {
    id: 'makeup-clean',
    name: 'Clean Girl',
    category: 'Makeup',
    bgType: 'color',
    bgValue: '#ffffff',
    accentColor: '#0ea5e9',
    profile: {
        name: { family: 'Inter', color: '#0f172a', size: 1.5, weight: '800', style: 'normal', letterSpacing: '-0.03em' },
        profession: { family: 'Inter', color: '#94a3b8', size: 0.8, weight: 'bold', style: 'normal', transform: 'uppercase', letterSpacing: '0.1em' },
        bio: { family: 'Inter', color: '#475569', size: 0.9, weight: 'normal', style: 'normal' }
    },
    headers: { family: 'Inter', color: '#0ea5e9', size: 0.8, weight: 'bold', style: 'normal', transform: 'uppercase', letterSpacing: '0.1em' },
    socials: { color: '#0ea5e9', style: 'minimal' },
    buttons: {
        shape: 'pill',
        backgroundColor: '#f0f9ff',
        borderColor: '#e0f2fe',
        borderWidth: 1,
        textColor: '#0284c7',
        fontFamily: 'Inter',
        fontWeight: 'bold'
    }
  },

  // ==========================================
  // FASHION / STYLE
  // ==========================================
  {
    id: 'fashion-vogue',
    name: 'Vogue',
    category: 'Fashion',
    bgType: 'color',
    bgValue: '#e7e5e4',
    accentColor: '#000000',
    profile: {
        name: { family: 'Playfair Display', color: '#1c1917', size: 1.8, weight: '800', style: 'normal' },
        profession: { family: 'Inter', color: '#57534e', size: 0.7, weight: 'normal', style: 'normal', transform: 'uppercase', letterSpacing: '0.2em' },
        bio: { family: 'Playfair Display', color: '#292524', size: 1.0, weight: 'normal', style: 'italic' }
    },
    headers: { family: 'Inter', color: '#1c1917', size: 0.9, weight: 'bold', style: 'normal', transform: 'uppercase' },
    socials: { color: '#1c1917', style: 'outline' },
    buttons: {
        shape: 'square',
        backgroundColor: '#ffffff',
        borderColor: '#1c1917',
        borderWidth: 1,
        textColor: '#1c1917',
        fontFamily: 'Inter',
        fontWeight: 'bold'
    }
  },
  {
    id: 'fashion-street',
    name: 'Streetwear',
    category: 'Fashion',
    bgType: 'color',
    bgValue: '#171717',
    accentColor: '#bef264',
    profile: {
        name: { family: 'Space Grotesk', color: '#ffffff', size: 1.8, weight: '800', style: 'normal', transform: 'uppercase', letterSpacing: '-0.05em' },
        profession: { family: 'Inter', color: '#bef264', size: 0.8, weight: 'bold', style: 'normal', transform: 'uppercase' },
        bio: { family: 'Space Grotesk', color: '#d4d4d4', size: 1.0, weight: 'normal', style: 'normal' }
    },
    headers: { family: 'Space Grotesk', color: '#bef264', size: 1.0, weight: 'bold', style: 'normal', transform: 'uppercase', decoration: 'underline' },
    socials: { color: '#bef264', style: 'filled' },
    buttons: {
        shape: 'hard-shadow',
        backgroundColor: '#262626',
        borderColor: '#bef264',
        borderWidth: 2,
        textColor: '#bef264',
        fontFamily: 'Space Grotesk',
        fontWeight: 'bold',
        shadowColor: '#ffffff'
    }
  },
  {
    id: 'fashion-high',
    name: 'Haute Couture',
    category: 'Fashion',
    bgType: 'color',
    bgValue: '#000000',
    accentColor: '#ffffff',
    profile: {
        name: { family: 'Cinzel', color: '#ffffff', size: 1.5, weight: 'normal', style: 'normal', letterSpacing: '0.1em' },
        profession: { family: 'Inter', color: '#a3a3a3', size: 0.7, weight: 'normal', style: 'normal', transform: 'uppercase', letterSpacing: '0.3em' },
        bio: { family: 'Inter', color: '#d4d4d4', size: 0.9, weight: 'normal', style: 'normal' }
    },
    headers: { family: 'Cinzel', color: '#ffffff', size: 0.9, weight: 'normal', style: 'normal', transform: 'uppercase', letterSpacing: '0.2em' },
    socials: { color: '#ffffff', style: 'minimal' },
    buttons: {
        shape: 'outline',
        backgroundColor: 'transparent',
        borderColor: '#ffffff',
        borderWidth: 0.5,
        textColor: '#ffffff',
        fontFamily: 'Inter',
        fontWeight: 'normal'
    }
  },
  {
    id: 'fashion-pastel',
    name: 'Pastel Chic',
    category: 'Fashion',
    bgType: 'color',
    bgValue: '#fdf4ff',
    accentColor: '#d8b4fe',
    profile: {
        name: { family: 'DM Sans', color: '#6b21a8', size: 1.6, weight: 'bold', style: 'normal' },
        profession: { family: 'Inter', color: '#a855f7', size: 0.8, weight: 'bold', style: 'normal', transform: 'uppercase', letterSpacing: '0.1em' },
        bio: { family: 'Inter', color: '#7e22ce', size: 0.95, weight: 'normal', style: 'normal' }
    },
    headers: { family: 'DM Sans', color: '#c084fc', size: 0.9, weight: 'bold', style: 'normal' },
    socials: { color: '#a855f7', style: 'filled' },
    buttons: {
        shape: 'rounded',
        backgroundColor: '#ffffff',
        borderColor: '#f3e8ff',
        borderWidth: 1,
        textColor: '#6b21a8',
        fontFamily: 'DM Sans',
        fontWeight: 'bold'
    }
  },
  {
    id: 'fashion-editorial',
    name: 'Editorial',
    category: 'Fashion',
    bgType: 'color',
    bgValue: '#f5f5f4',
    accentColor: '#ef4444',
    profile: {
        name: { family: 'Playfair Display', color: '#000000', size: 2.0, weight: '800', style: 'normal', letterSpacing: '-0.05em' },
        profession: { family: 'Inter', color: '#ef4444', size: 0.75, weight: 'bold', style: 'normal', transform: 'uppercase', letterSpacing: '0.2em' },
        bio: { family: 'Inter', color: '#44403c', size: 0.95, weight: 'bold', style: 'normal' }
    },
    headers: { family: 'Inter', color: '#000000', size: 1.0, weight: '800', style: 'normal', transform: 'uppercase' },
    socials: { color: '#000000', style: 'outline' },
    buttons: {
        shape: 'square',
        backgroundColor: '#ffffff',
        borderColor: '#000000',
        borderWidth: 2,
        textColor: '#000000',
        fontFamily: 'Inter',
        fontWeight: '800'
    }
  },

  // ==========================================
  // FITNESS / WELLNESS
  // ==========================================
  {
    id: 'nature-zen',
    name: 'Zen',
    category: 'Fitness',
    bgType: 'image',
    bgValue: 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=800&q=80',
    bgConfig: { bgScale: 1.1, bgBlur: 4, bgOverlay: 0.4, bgPositionY: 50 },
    accentColor: '#dcfce7',
    profile: {
        name: { family: 'DM Sans', color: '#f0fdf4', size: 1.4, weight: 'bold', style: 'normal' },
        profession: { family: 'Caveat', color: '#dcfce7', size: 1.2, weight: 'normal', style: 'normal' },
        bio: { family: 'DM Sans', color: '#f0fdf4', size: 0.9, weight: 'normal', style: 'normal' }
    },
    headers: { family: 'DM Sans', color: '#dcfce7', size: 0.9, weight: 'bold', style: 'normal', transform: 'uppercase', letterSpacing: '0.15em' },
    socials: { color: '#dcfce7', style: 'minimal' },
    buttons: {
        shape: 'rounded',
        backgroundColor: 'rgba(20, 83, 45, 0.6)',
        borderColor: 'rgba(220, 252, 231, 0.2)',
        borderWidth: 1,
        textColor: '#f0fdf4',
        fontFamily: 'DM Sans',
        fontWeight: 'normal'
    }
  },
  {
    id: 'fitness-power',
    name: 'Power',
    category: 'Fitness',
    bgType: 'color',
    bgValue: '#000000',
    accentColor: '#eab308',
    profile: {
        name: { family: 'Inter', color: '#ffffff', size: 1.8, weight: '800', style: 'italic', transform: 'uppercase' },
        profession: { family: 'Inter', color: '#eab308', size: 0.9, weight: 'bold', style: 'normal', transform: 'uppercase' },
        bio: { family: 'Inter', color: '#d4d4d4', size: 0.95, weight: 'normal', style: 'normal' }
    },
    headers: { family: 'Inter', color: '#eab308', size: 1.0, weight: '800', style: 'italic', transform: 'uppercase' },
    socials: { color: '#eab308', style: 'filled' },
    buttons: {
        shape: 'hard-shadow',
        backgroundColor: '#262626',
        borderColor: '#eab308',
        borderWidth: 0,
        textColor: '#ffffff',
        fontFamily: 'Inter',
        fontWeight: 'bold',
        shadowColor: '#eab308'
    }
  },
  {
    id: 'fitness-cardio',
    name: 'Cardio',
    category: 'Fitness',
    bgType: 'gradient',
    bgValue: 'linear-gradient(45deg, #ef4444, #f97316)',
    accentColor: '#ffffff',
    profile: {
        name: { family: 'Inter', color: '#ffffff', size: 1.6, weight: 'bold', style: 'normal' },
        profession: { family: 'Inter', color: '#fed7aa', size: 0.8, weight: 'bold', style: 'normal', transform: 'uppercase', letterSpacing: '0.1em' },
        bio: { family: 'Inter', color: '#fff7ed', size: 0.95, weight: 'normal', style: 'normal' }
    },
    headers: { family: 'Inter', color: '#ffffff', size: 0.9, weight: 'bold', style: 'normal', transform: 'uppercase' },
    socials: { color: '#ffffff', style: 'outline' },
    buttons: {
        shape: 'pill',
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderColor: 'rgba(255,255,255,0.4)',
        borderWidth: 2,
        textColor: '#ffffff',
        fontFamily: 'Inter',
        fontWeight: 'bold'
    }
  },
  {
    id: 'fitness-aqua',
    name: 'Flow',
    category: 'Fitness',
    bgType: 'gradient',
    bgValue: 'linear-gradient(to top, #ecfeff, #cffafe)',
    accentColor: '#0891b2',
    profile: {
        name: { family: 'DM Sans', color: '#0e7490', size: 1.6, weight: 'bold', style: 'normal' },
        profession: { family: 'Inter', color: '#22d3ee', size: 0.8, weight: 'bold', style: 'normal', transform: 'uppercase', letterSpacing: '0.1em' },
        bio: { family: 'Inter', color: '#155e75', size: 0.95, weight: 'normal', style: 'normal' }
    },
    headers: { family: 'DM Sans', color: '#0891b2', size: 0.9, weight: 'bold', style: 'normal' },
    socials: { color: '#0891b2', style: 'filled' },
    buttons: {
        shape: 'rounded',
        backgroundColor: '#ffffff',
        borderColor: '#a5f3fc',
        borderWidth: 1,
        textColor: '#0e7490',
        fontFamily: 'DM Sans',
        fontWeight: 'bold'
    }
  },
  {
    id: 'fitness-gym',
    name: 'Iron',
    category: 'Fitness',
    bgType: 'color',
    bgValue: '#1f2937',
    accentColor: '#9ca3af',
    profile: {
        name: { family: 'Space Grotesk', color: '#f3f4f6', size: 1.7, weight: 'bold', style: 'normal' },
        profession: { family: 'Space Grotesk', color: '#9ca3af', size: 0.8, weight: 'normal', style: 'normal', transform: 'uppercase', letterSpacing: '0.2em' },
        bio: { family: 'Inter', color: '#d1d5db', size: 0.9, weight: 'normal', style: 'normal' }
    },
    headers: { family: 'Space Grotesk', color: '#9ca3af', size: 0.9, weight: 'bold', style: 'normal', transform: 'uppercase' },
    socials: { color: '#f3f4f6', style: 'outline' },
    buttons: {
        shape: 'square',
        backgroundColor: '#374151',
        borderColor: '#4b5563',
        borderWidth: 1,
        textColor: '#f3f4f6',
        fontFamily: 'Space Grotesk',
        fontWeight: 'bold'
    }
  },

  // ==========================================
  // MUSIC / AUDIO
  // ==========================================
  {
    id: 'music-vinyl',
    name: 'Vinyl',
    category: 'Music',
    bgType: 'color',
    bgValue: '#18181b',
    accentColor: '#fb923c',
    profile: {
        name: { family: 'Space Grotesk', color: '#fb923c', size: 1.6, weight: 'bold', style: 'normal' },
        profession: { family: 'Inter', color: '#52525b', size: 0.8, weight: 'normal', style: 'normal', transform: 'uppercase', letterSpacing: '0.2em' },
        bio: { family: 'Inter', color: '#a1a1aa', size: 0.9, weight: 'normal', style: 'normal' }
    },
    headers: { family: 'Space Grotesk', color: '#fb923c', size: 0.9, weight: 'bold', style: 'normal', transform: 'uppercase' },
    socials: { color: '#fb923c', style: 'outline' },
    buttons: {
        shape: 'rounded',
        backgroundColor: '#27272a',
        borderColor: '#fb923c',
        borderWidth: 1,
        textColor: '#fb923c',
        fontFamily: 'Space Grotesk',
        fontWeight: 'normal'
    }
  },
  {
    id: 'music-synth',
    name: 'Synthwave',
    category: 'Music',
    bgType: 'gradient',
    bgValue: 'linear-gradient(to bottom, #2e1065, #be185d)',
    accentColor: '#22d3ee',
    profile: {
        name: { family: 'Space Grotesk', color: '#22d3ee', size: 1.8, weight: 'bold', style: 'italic' },
        profession: { family: 'Inter', color: '#f0abfc', size: 0.8, weight: 'normal', style: 'normal', transform: 'uppercase', letterSpacing: '0.1em' },
        bio: { family: 'Inter', color: '#e0e7ff', size: 0.95, weight: 'normal', style: 'normal' }
    },
    headers: { family: 'Space Grotesk', color: '#22d3ee', size: 1.0, weight: 'bold', style: 'italic', transform: 'uppercase', decoration: 'underline' },
    socials: { color: '#22d3ee', style: 'filled' },
    buttons: {
        shape: 'hard-shadow',
        backgroundColor: '#000000',
        borderColor: '#22d3ee',
        borderWidth: 1,
        textColor: '#22d3ee',
        fontFamily: 'Space Grotesk',
        fontWeight: 'bold',
        shadowColor: '#f0abfc'
    }
  },
  {
    id: 'music-acoustic',
    name: 'Acoustic',
    category: 'Music',
    bgType: 'color',
    bgValue: '#451a03',
    accentColor: '#fcd34d',
    profile: {
        name: { family: 'DM Sans', color: '#fef3c7', size: 1.6, weight: 'bold', style: 'normal' },
        profession: { family: 'Inter', color: '#fbbf24', size: 0.8, weight: 'normal', style: 'normal', transform: 'uppercase', letterSpacing: '0.1em' },
        bio: { family: 'Inter', color: '#fffbeb', size: 0.9, weight: 'normal', style: 'normal' }
    },
    headers: { family: 'DM Sans', color: '#fcd34d', size: 0.9, weight: 'bold', style: 'normal' },
    socials: { color: '#fcd34d', style: 'minimal' },
    buttons: {
        shape: 'rounded',
        backgroundColor: '#78350f',
        borderColor: '#92400e',
        borderWidth: 1,
        textColor: '#fef3c7',
        fontFamily: 'DM Sans',
        fontWeight: 'normal'
    }
  },
  {
    id: 'music-pop',
    name: 'Pop Star',
    category: 'Music',
    bgType: 'gradient',
    bgValue: 'linear-gradient(135deg, #f472b6, #a855f7)',
    accentColor: '#ffffff',
    profile: {
        name: { family: 'Inter', color: '#ffffff', size: 1.8, weight: '800', style: 'normal' },
        profession: { family: 'Inter', color: '#fbcfe8', size: 0.8, weight: 'bold', style: 'normal', transform: 'uppercase', letterSpacing: '0.2em' },
        bio: { family: 'Inter', color: '#ffffff', size: 1.0, weight: 'normal', style: 'normal' }
    },
    headers: { family: 'Inter', color: '#ffffff', size: 1.0, weight: '800', style: 'normal', transform: 'uppercase' },
    socials: { color: '#ffffff', style: 'filled' },
    buttons: {
        shape: 'pill',
        backgroundColor: 'rgba(255,255,255,0.25)',
        borderColor: 'rgba(255,255,255,0.5)',
        borderWidth: 2,
        textColor: '#ffffff',
        fontFamily: 'Inter',
        fontWeight: 'bold'
    }
  },
  {
    id: 'music-techno',
    name: 'Techno',
    category: 'Music',
    bgType: 'color',
    bgValue: '#000000',
    accentColor: '#00ff00',
    profile: {
        name: { family: 'Space Grotesk', color: '#ffffff', size: 1.6, weight: 'bold', style: 'normal', transform: 'uppercase' },
        profession: { family: 'Space Grotesk', color: '#00ff00', size: 0.8, weight: 'normal', style: 'normal', transform: 'uppercase', letterSpacing: '0.1em' },
        bio: { family: 'Space Grotesk', color: '#d4d4d4', size: 0.9, weight: 'normal', style: 'normal' }
    },
    headers: { family: 'Space Grotesk', color: '#00ff00', size: 0.9, weight: 'bold', style: 'normal', transform: 'uppercase' },
    socials: { color: '#00ff00', style: 'outline' },
    buttons: {
        shape: 'square',
        backgroundColor: '#000000',
        borderColor: '#ffffff',
        borderWidth: 1,
        textColor: '#ffffff',
        fontFamily: 'Space Grotesk',
        fontWeight: 'bold'
    }
  },

  // ==========================================
  // CREATOR / FUTURISTIC
  // ==========================================
  {
    id: 'tech-cyber',
    name: 'Glitch',
    category: 'Creator',
    bgType: 'color',
    bgValue: '#09090b',
    accentColor: '#22c55e',
    profile: {
        name: { family: 'Space Grotesk', color: '#22c55e', size: 1.8, weight: '800', style: 'normal', letterSpacing: '-0.05em', transform: 'lowercase' },
        profession: { family: 'Space Grotesk', color: '#4ade80', size: 0.8, weight: 'normal', style: 'normal', transform: 'uppercase', letterSpacing: '0.1em' },
        bio: { family: 'Space Grotesk', color: '#bbf7d0', size: 1.0, weight: 'normal', style: 'normal' }
    },
    headers: { family: 'Space Grotesk', color: '#22c55e', size: 1, weight: 'normal', style: 'normal', transform: 'uppercase', decoration: 'underline' },
    socials: { color: '#22c55e', style: 'filled' },
    buttons: {
        shape: 'hard-shadow',
        backgroundColor: '#000000',
        borderColor: '#22c55e',
        borderWidth: 1,
        textColor: '#22c55e',
        fontFamily: 'Space Grotesk',
        fontWeight: 'bold',
        shadowColor: '#22c55e'
    }
  },
  {
    id: 'creator-pop',
    name: 'Bubblegum',
    category: 'Creator',
    bgType: 'gradient',
    bgValue: 'linear-gradient(to bottom right, #f9a8d4, #c084fc, #818cf8)',
    accentColor: '#ffffff',
    profile: {
        name: { family: 'DM Sans', color: '#ffffff', size: 1.6, weight: '800', style: 'normal' },
        profession: { family: 'DM Sans', color: '#ffffff', size: 0.9, weight: 'bold', style: 'normal', transform: 'uppercase', letterSpacing: '0.1em' },
        bio: { family: 'DM Sans', color: '#ffffff', size: 1.0, weight: 'normal', style: 'normal' }
    },
    headers: { family: 'DM Sans', color: '#ffffff', size: 1, weight: '800', style: 'normal', transform: 'uppercase' },
    socials: { color: '#ffffff', style: 'filled' },
    buttons: {
        shape: 'pill',
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderColor: 'rgba(255,255,255,0.4)',
        borderWidth: 2,
        textColor: '#ffffff',
        fontFamily: 'DM Sans',
        fontWeight: 'bold'
    }
  },
  {
    id: 'retro-80s',
    name: 'Retro 80s',
    category: 'Creator',
    bgType: 'color',
    bgValue: '#2a0a38',
    accentColor: '#f0abfc',
    profile: {
        name: { family: 'Space Grotesk', color: '#f0abfc', size: 1.6, weight: 'bold', style: 'italic', transform: 'uppercase', decoration: 'underline' },
        profession: { family: 'Space Grotesk', color: '#22d3ee', size: 0.8, weight: 'normal', style: 'normal', transform: 'uppercase' },
        bio: { family: 'Space Grotesk', color: '#e879f9', size: 0.9, weight: 'normal', style: 'normal' }
    },
    headers: { family: 'Space Grotesk', color: '#22d3ee', size: 1, weight: 'bold', style: 'normal', transform: 'uppercase', letterSpacing: '0.2em' },
    socials: { color: '#f0abfc', style: 'outline' },
    buttons: {
        shape: 'hard-shadow',
        backgroundColor: '#000000',
        borderColor: '#f0abfc',
        borderWidth: 2,
        textColor: '#f0abfc',
        fontFamily: 'Space Grotesk',
        fontWeight: 'bold',
        shadowColor: '#22d3ee'
    }
  },
  {
    id: 'creator-holo',
    name: 'Holographic',
    category: 'Creator',
    bgType: 'gradient',
    bgValue: 'linear-gradient(45deg, #d8b4fe, #818cf8, #22d3ee)',
    accentColor: '#ffffff',
    profile: {
        name: { family: 'DM Sans', color: '#ffffff', size: 1.6, weight: 'bold', style: 'normal' },
        profession: { family: 'Inter', color: '#e0e7ff', size: 0.8, weight: 'normal', style: 'normal', transform: 'uppercase', letterSpacing: '0.1em' },
        bio: { family: 'Inter', color: '#f0f9ff', size: 0.95, weight: 'normal', style: 'normal' }
    },
    headers: { family: 'DM Sans', color: '#ffffff', size: 0.9, weight: 'bold', style: 'normal', transform: 'uppercase' },
    socials: { color: '#ffffff', style: 'glass' },
    buttons: {
        shape: 'glass',
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderColor: 'rgba(255,255,255,0.4)',
        borderWidth: 1,
        textColor: '#ffffff',
        fontFamily: 'DM Sans',
        fontWeight: 'bold'
    }
  },
  {
    id: 'creator-streamer',
    name: 'Streamer',
    category: 'Creator',
    bgType: 'color',
    bgValue: '#4c1d95',
    accentColor: '#f472b6',
    profile: {
        name: { family: 'Inter', color: '#ffffff', size: 1.6, weight: '800', style: 'normal' },
        profession: { family: 'Inter', color: '#a78bfa', size: 0.8, weight: 'bold', style: 'normal', transform: 'uppercase', letterSpacing: '0.1em' },
        bio: { family: 'Inter', color: '#ddd6fe', size: 0.95, weight: 'normal', style: 'normal' }
    },
    headers: { family: 'Inter', color: '#f472b6', size: 0.9, weight: 'bold', style: 'normal', transform: 'uppercase' },
    socials: { color: '#f472b6', style: 'filled' },
    buttons: {
        shape: 'rounded',
        backgroundColor: '#5b21b6',
        borderColor: '#7c3aed',
        borderWidth: 1,
        textColor: '#ffffff',
        fontFamily: 'Inter',
        fontWeight: 'bold'
    }
  },
  {
    id: 'creator-matrix',
    name: 'Cyber',
    category: 'Creator',
    bgType: 'color',
    bgValue: '#000000',
    accentColor: '#00ff41',
    profile: {
        name: { family: 'Space Grotesk', color: '#00ff41', size: 1.6, weight: 'normal', style: 'normal' },
        profession: { family: 'Space Grotesk', color: '#008f11', size: 0.8, weight: 'normal', style: 'normal', transform: 'uppercase', letterSpacing: '0.2em' },
        bio: { family: 'Space Grotesk', color: '#00ff41', size: 0.9, weight: 'normal', style: 'normal' }
    },
    headers: { family: 'Space Grotesk', color: '#00ff41', size: 0.9, weight: 'bold', style: 'normal', transform: 'uppercase', decoration: 'underline' },
    socials: { color: '#00ff41', style: 'outline' },
    buttons: {
        shape: 'square',
        backgroundColor: '#000000',
        borderColor: '#00ff41',
        borderWidth: 1,
        textColor: '#00ff41',
        fontFamily: 'Space Grotesk',
        fontWeight: 'normal'
    }
  }
];

/**
 * Get themes filtered by category
 */
export function getThemesByCategory(category: ThemeCategory): Theme[] {
    if (category === 'All') {
        return THEMES;
    }
    return THEMES.filter(theme => theme.category === category);
}

/**
 * Get a specific theme by ID
 */
export function getThemeById(id: string): Theme | undefined {
    return THEMES.find(theme => theme.id === id);
}

/**
 * Get all unique categories
 */
export function getAllCategories(): ThemeCategory[] {
    const categories = new Set<ThemeCategory>(['All']);
    THEMES.forEach(theme => categories.add(theme.category));
    return Array.from(categories);
}
