/**
 * PortfolioTab - Main editing tab for profile, socials, and blocks
 * Combines ProfileSection, SocialsSection, and BlocksSection
 */

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { LinkItem, ProfileData, LinkType, SocialLink } from '@/types/modernProfile.types';
import { useProfile } from '@/contexts/ProfileContext';
import ProfileSection from './sections/ProfileSection';
import SocialsSection from './sections/SocialsSection';
import BlocksSection from './sections/BlocksSection';

interface PortfolioTabProps {
  profile: ProfileData | null;
  links: LinkItem[];
  socials: SocialLink[];
}

const PortfolioTab: React.FC<PortfolioTabProps> = ({ profile, links, socials }) => {
  const {
    updateProfile,
    addLink,
    updateLink,
    removeLink,
    reorderLinks,
    addSocialLink,
    updateSocialLink,
    removeSocialLink,
  } = useProfile();

  const [isEnhancing, setIsEnhancing] = useState(false);

  /**
   * Handle profile field updates
   */
  const handleProfileChange = useCallback(
    async (updates: Partial<ProfileData>) => {
      try {
        await updateProfile(updates);
      } catch (error) {
        console.error('Failed to update profile:', error);
      }
    },
    [updateProfile]
  );

  /**
   * Handle AI bio enhancement
   * TODO: Integrate with Gemini API for bio enhancement
   */
  const handleAIEnhance = useCallback(async () => {
    if (!profile) return;

    setIsEnhancing(true);
    try {
      // TODO: Call Gemini API to enhance bio
      // For now, just a placeholder
      console.log('AI enhancement would be called here with:', profile.bio);
    } catch (error) {
      console.error('Failed to enhance bio:', error);
    } finally {
      setIsEnhancing(false);
    }
  }, [profile]);

  /**
   * Handle adding new block
   */
  const handleAddBlock = useCallback(
    async (type: LinkType) => {
      try {
        await addLink(type);
      } catch (error) {
        console.error('Failed to add block:', error);
      }
    },
    [addLink]
  );

  /**
   * Handle editing block (would open editor modal)
   */
  const handleEditBlock = useCallback((blockId: string) => {
    // TODO: Open block editor modal
    console.log('Edit block:', blockId);
  }, []);

  /**
   * Handle deleting block
   */
  const handleDeleteBlock = useCallback(
    async (blockId: string) => {
      try {
        await removeLink(blockId);
      } catch (error) {
        console.error('Failed to delete block:', error);
      }
    },
    [removeLink]
  );

  /**
   * Handle toggling block visibility
   */
  const handleToggleBlockActive = useCallback(
    async (blockId: string) => {
      const link = links.find((l) => l.id === blockId);
      if (link) {
        try {
          await updateLink(blockId, { isActive: !link.isActive });
        } catch (error) {
          console.error('Failed to toggle block:', error);
        }
      }
    },
    [links, updateLink]
  );

  /**
   * Handle reordering blocks
   */
  const handleReorderBlocks = useCallback(
    async (newOrder: LinkItem[]) => {
      try {
        await reorderLinks(newOrder);
      } catch (error) {
        console.error('Failed to reorder blocks:', error);
      }
    },
    [reorderLinks]
  );

  /**
   * Handle adding social link
   */
  const handleAddSocial = useCallback(
    async (platform: SocialLink['platform']) => {
      try {
        await addSocialLink(platform);
      } catch (error) {
        console.error('Failed to add social:', error);
      }
    },
    [addSocialLink]
  );

  /**
   * Handle updating social link
   */
  const handleUpdateSocial = useCallback(
    async (id: string, updates: Partial<SocialLink>) => {
      try {
        await updateSocialLink(id, updates);
      } catch (error) {
        console.error('Failed to update social:', error);
      }
    },
    [updateSocialLink]
  );

  /**
   * Handle removing social link
   */
  const handleRemoveSocial = useCallback(
    async (id: string) => {
      try {
        await removeSocialLink(id);
      } catch (error) {
        console.error('Failed to remove social:', error);
      }
    },
    [removeSocialLink]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="space-y-8"
    >
      {/* Profile Section */}
      <div className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-gray-200 dark:border-white/10">
        <ProfileSection
          profile={profile}
          onProfileChange={handleProfileChange}
          onAIEnhance={handleAIEnhance}
          isEnhancing={isEnhancing}
        />
      </div>

      {/* Socials Section */}
      <div className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-gray-200 dark:border-white/10">
        <SocialsSection
          socials={socials}
          onAddSocial={handleAddSocial}
          onUpdateSocial={handleUpdateSocial}
          onRemoveSocial={handleRemoveSocial}
        />
      </div>

      {/* Blocks Section */}
      <div className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-gray-200 dark:border-white/10">
        <BlocksSection
          links={links}
          onAddBlock={handleAddBlock}
          onEditBlock={handleEditBlock}
          onDeleteBlock={handleDeleteBlock}
          onToggleBlockActive={handleToggleBlockActive}
          onReorderBlocks={handleReorderBlocks}
        />
      </div>
    </motion.div>
  );
};

export default PortfolioTab;
