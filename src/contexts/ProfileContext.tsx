/**
 * Modern vCard Suite - Profile Context
 * Manages profile state, links, themes, and all mutations with backend sync
 */

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { LinkItem, ProfileData, Theme, SocialLink, LinkType } from '@/types/modernProfile.types';
import { THEMES } from '@/constants/themes';

interface ProfileContextType {
    // State
    profile: ProfileData | null;
    links: LinkItem[];
    theme: Theme;
    isLoading: boolean;
    error: string | null;

    // Profile mutations
    updateProfile: (data: Partial<ProfileData>) => Promise<void>;

    // Link mutations
    addLink: (type: LinkItem['type']) => Promise<void>;
    updateLink: (id: string, updates: Partial<LinkItem>) => Promise<void>;
    removeLink: (id: string) => Promise<void>;
    reorderLinks: (newOrder: LinkItem[]) => Promise<void>;

    // Social mutations
    addSocialLink: (platform: SocialLink['platform'], customData?: { url?: string; label?: string; icon?: string }) => Promise<void>;
    updateSocialLink: (id: string, updates: Partial<SocialLink>) => Promise<void>;
    removeSocialLink: (id: string) => Promise<void>;
    reorderSocials: (newOrder: SocialLink[]) => Promise<void>;

    // Theme mutations
    setTheme: (theme: Theme) => Promise<void>;
    saveThemeCustomization: (themeId: string, customizations: Partial<Theme>) => Promise<void>;

    // Actions
    fetchProfile: () => Promise<void>;
    publishProfile: (published: boolean) => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

// Default theme
const DEFAULT_THEME = THEMES[0]; // Slate theme

export const ProfileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // State
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [links, setLinks] = useState<LinkItem[]>([]);
    const [theme, setThemeState] = useState<Theme>(DEFAULT_THEME);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch profile data from backend
    const fetchProfile = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            // TODO: Implement backend API call
            // const response = await profileService.getMyProfile();
            // For now, using mock data

            // Mock profile data
            const mockProfile: ProfileData = {
                username: 'demo.user',
                displayName: 'Demo User',
                profession: 'Product Designer',
                bio: 'Creating beautiful digital experiences. Based in SF.',
                avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
                socials: [
                    { id: 's1', platform: 'instagram', url: 'https://instagram.com/demo', isActive: true },
                    { id: 's2', platform: 'twitter', url: 'https://twitter.com/demo', isActive: true },
                    { id: 's3', platform: 'email', url: 'mailto:demo@example.com', isActive: true },
                ],
                seo: {
                    title: 'Demo User - Portfolio',
                    description: 'Product Designer based in SF',
                    keywords: 'design, product, portfolio'
                }
            };

            const mockLinks: LinkItem[] = [
                {
                    id: '1',
                    type: LinkType.CLASSIC,
                    title: 'Check out my Website',
                    url: 'https://example.com',
                    isActive: true,
                    clicks: 0,
                    platform: 'generic'
                }
            ];

            setProfile(mockProfile);
            setLinks(mockLinks);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch profile');
            console.error('Error fetching profile:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Profile mutations
    const updateProfile = useCallback(async (data: Partial<ProfileData>) => {
        if (!profile) return;

        const previousProfile = profile;

        try {
            // Optimistic update
            setProfile({ ...profile, ...data });

            // TODO: Sync with backend
            // await profileService.updateProfile(data);
        } catch (err) {
            // Rollback on error
            setProfile(previousProfile);
            setError(err instanceof Error ? err.message : 'Failed to update profile');
            throw err;
        }
    }, [profile]);

    // Link mutations
    const addLink = useCallback(async (type: LinkItem['type']) => {
        const newLink: LinkItem = {
            id: `link_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type,
            title: type === LinkType.HEADER
                ? 'NEW SECTION'
                : type === LinkType.GALLERY
                ? 'New Gallery'
                : type === LinkType.VIDEO_EMBED
                ? 'New Video'
                : type === LinkType.VIDEO_UPLOAD
                ? 'Upload Video'
                : 'New Link',
            url: type === LinkType.HEADER ? undefined : '',
            isActive: true,
            clicks: 0,
            platform: 'generic',
            galleryImages: type === LinkType.GALLERY ? [] : undefined,
            layout: type === LinkType.GALLERY ? 'carousel' : undefined
        };

        const previousLinks = links;

        try {
            // Optimistic update
            setLinks([newLink, ...links]);

            // TODO: Sync with backend
            // await linkService.createLink(newLink);
        } catch (err) {
            // Rollback on error
            setLinks(previousLinks);
            setError(err instanceof Error ? err.message : 'Failed to add link');
            throw err;
        }
    }, [links]);

    const updateLink = useCallback(async (id: string, updates: Partial<LinkItem>) => {
        const previousLinks = links;

        try {
            // Optimistic update
            setLinks(links.map(link => link.id === id ? { ...link, ...updates } : link));

            // TODO: Sync with backend
            // await linkService.updateLink(id, updates);
        } catch (err) {
            // Rollback on error
            setLinks(previousLinks);
            setError(err instanceof Error ? err.message : 'Failed to update link');
            throw err;
        }
    }, [links]);

    const removeLink = useCallback(async (id: string) => {
        const previousLinks = links;

        try {
            // Optimistic update
            setLinks(links.filter(link => link.id !== id));

            // TODO: Sync with backend
            // await linkService.deleteLink(id);
        } catch (err) {
            // Rollback on error
            setLinks(previousLinks);
            setError(err instanceof Error ? err.message : 'Failed to remove link');
            throw err;
        }
    }, [links]);

    const reorderLinks = useCallback(async (newOrder: LinkItem[]) => {
        const previousLinks = links;

        try {
            // Optimistic update
            setLinks(newOrder);

            // TODO: Sync with backend
            // await linkService.reorderLinks(newOrder.map(l => l.id));
        } catch (err) {
            // Rollback on error
            setLinks(previousLinks);
            setError(err instanceof Error ? err.message : 'Failed to reorder links');
            throw err;
        }
    }, [links]);

    // Social mutations
    const addSocialLink = useCallback(async (
        platform: SocialLink['platform'],
        customData?: { url?: string; label?: string; icon?: string }
    ) => {
        if (!profile) return;

        const newSocial: SocialLink = {
            id: `social_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            platform,
            url: customData?.url || '',
            isActive: true,
            label: customData?.label,
            customIconUrl: customData?.icon,
            displayOrder: profile.socials.length
        };

        const previousProfile = profile;

        try {
            // Optimistic update
            setProfile({
                ...profile,
                socials: [...profile.socials, newSocial]
            });

            // TODO: Sync with backend
            // await socialService.createSocial(newSocial);
        } catch (err) {
            // Rollback on error
            setProfile(previousProfile);
            setError(err instanceof Error ? err.message : 'Failed to add social link');
            throw err;
        }
    }, [profile]);

    const updateSocialLink = useCallback(async (id: string, updates: Partial<SocialLink>) => {
        if (!profile) return;

        const previousProfile = profile;

        try {
            // Optimistic update
            setProfile({
                ...profile,
                socials: profile.socials.map(s => s.id === id ? { ...s, ...updates } : s)
            });

            // TODO: Sync with backend
            // await socialService.updateSocial(id, updates);
        } catch (err) {
            // Rollback on error
            setProfile(previousProfile);
            setError(err instanceof Error ? err.message : 'Failed to update social link');
            throw err;
        }
    }, [profile]);

    const removeSocialLink = useCallback(async (id: string) => {
        if (!profile) return;

        const previousProfile = profile;

        try {
            // Optimistic update
            setProfile({
                ...profile,
                socials: profile.socials.filter(s => s.id !== id)
            });

            // TODO: Sync with backend
            // await socialService.deleteSocial(id);
        } catch (err) {
            // Rollback on error
            setProfile(previousProfile);
            setError(err instanceof Error ? err.message : 'Failed to remove social link');
            throw err;
        }
    }, [profile]);

    const reorderSocials = useCallback(async (newOrder: SocialLink[]) => {
        if (!profile) return;

        const previousProfile = profile;

        try {
            // Optimistic update
            setProfile({
                ...profile,
                socials: newOrder
            });

            // TODO: Sync with backend
            // await socialService.reorderSocials(newOrder.map(s => s.id));
        } catch (err) {
            // Rollback on error
            setProfile(previousProfile);
            setError(err instanceof Error ? err.message : 'Failed to reorder social links');
            throw err;
        }
    }, [profile]);

    // Theme mutations
    const setTheme = useCallback(async (newTheme: Theme) => {
        const previousTheme = theme;

        try {
            // Optimistic update
            setThemeState(newTheme);

            // TODO: Sync with backend
            // await profileService.updateTheme(newTheme.id);
        } catch (err) {
            // Rollback on error
            setThemeState(previousTheme);
            setError(err instanceof Error ? err.message : 'Failed to set theme');
            throw err;
        }
    }, [theme]);

    const saveThemeCustomization = useCallback(async (
        themeId: string,
        customizations: Partial<Theme>
    ) => {
        const previousTheme = theme;

        try {
            // Optimistic update
            const customizedTheme = { ...theme, ...customizations, id: themeId };
            setThemeState(customizedTheme);

            // TODO: Sync with backend
            // await profileService.saveThemeCustomization(themeId, customizations);
        } catch (err) {
            // Rollback on error
            setThemeState(previousTheme);
            setError(err instanceof Error ? err.message : 'Failed to save theme customization');
            throw err;
        }
    }, [theme]);

    // Actions
    const publishProfile = useCallback(async (published: boolean) => {
        if (!profile) return;

        const previousProfile = profile;

        try {
            // Optimistic update - add published field if it exists in ProfileData
            setProfile({ ...profile });

            // TODO: Sync with backend
            // await profileService.togglePublish(published);
        } catch (err) {
            // Rollback on error
            setProfile(previousProfile);
            setError(err instanceof Error ? err.message : 'Failed to publish profile');
            throw err;
        }
    }, [profile]);

    // Context value
    const value: ProfileContextType = {
        // State
        profile,
        links,
        theme,
        isLoading,
        error,

        // Profile mutations
        updateProfile,

        // Link mutations
        addLink,
        updateLink,
        removeLink,
        reorderLinks,

        // Social mutations
        addSocialLink,
        updateSocialLink,
        removeSocialLink,
        reorderSocials,

        // Theme mutations
        setTheme,
        saveThemeCustomization,

        // Actions
        fetchProfile,
        publishProfile
    };

    return (
        <ProfileContext.Provider value={value}>
            {children}
        </ProfileContext.Provider>
    );
};

/**
 * Hook to use profile context
 * @throws Error if used outside ProfileProvider
 */
export const useProfile = () => {
    const context = useContext(ProfileContext);
    if (!context) {
        throw new Error('useProfile must be used within a ProfileProvider');
    }
    return context;
};
