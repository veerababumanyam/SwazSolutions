/**
 * ProfileCustomizer - Customize name, profession, and bio typography
 * Controls profile text styling for the identity panel
 */

import React from 'react';
import { Theme } from '@/types/modernProfile.types';
import { Heading, User, AlignLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { SectionHeader, TypographyEditor } from '../shared';

interface ProfileCustomizerProps {
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
}

const ProfileCustomizer: React.FC<ProfileCustomizerProps> = ({ theme, onThemeChange }) => {
  const updateProfileTypography = (key: keyof typeof theme.profile, newConfig: any) => {
    onThemeChange({
      ...theme,
      profile: { ...theme.profile, [key]: newConfig },
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-gray-200 dark:divide-white/5"
    >
      {/* Name */}
      <div className="pb-8 md:pb-0 md:pr-4">
        <SectionHeader icon={Heading} title="Name" subtitle="Profile display name" />
        <TypographyEditor
          config={theme.profile.name}
          onChange={(c) => updateProfileTypography('name', c)}
        />
      </div>

      {/* Profession */}
      <div className="py-8 md:py-0 md:px-4">
        <SectionHeader icon={User} title="Profession" subtitle="Job title or role" />
        <TypographyEditor
          config={theme.profile.profession}
          onChange={(c) => updateProfileTypography('profession', c)}
        />
      </div>

      {/* Bio */}
      <div className="pt-8 md:pt-0 md:pl-4">
        <SectionHeader icon={AlignLeft} title="Bio" subtitle="Profile description" />
        <TypographyEditor
          config={theme.profile.bio}
          onChange={(c) => updateProfileTypography('bio', c)}
        />
      </div>
    </motion.div>
  );
};

export default ProfileCustomizer;
