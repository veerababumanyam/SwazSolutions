/**
 * BlocksSection - Block types grid and management
 * Features: Add new blocks, drag-and-drop reordering, embedded LinksPanel
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
  Layout,
  Plus,
  Type,
  Image as ImageIcon,
  Video,
  FormInput,
  MapPin,
  FileDown,
  Settings,
} from 'lucide-react';
import { LinkItem, LinkType } from '@/types/modernProfile.types';
import { SectionHeader } from '../shared';
import LinksPanel from '../links/LinksPanel';

interface BlocksSectionProps {
  links: LinkItem[];
  onAddBlock: (type: LinkType) => Promise<void>;
  onEditBlock: (blockId: string) => void;
  onDeleteBlock: (blockId: string) => Promise<void>;
  onToggleBlockActive: (blockId: string) => Promise<void>;
  onReorderBlocks: (newOrder: LinkItem[]) => Promise<void>;
  isLoading?: boolean;
}

interface BlockTypeOption {
  type: LinkType;
  label: string;
  icon: React.ComponentType<{ size: number }>;
  description: string;
}

const BLOCK_TYPES: BlockTypeOption[] = [
  {
    type: LinkType.CLASSIC,
    label: 'Link',
    icon: Plus,
    description: 'Simple link button',
  },
  {
    type: LinkType.HEADER,
    label: 'Header',
    icon: Type,
    description: 'Section header',
  },
  {
    type: LinkType.GALLERY,
    label: 'Gallery',
    icon: ImageIcon,
    description: 'Image gallery',
  },
  {
    type: LinkType.VIDEO_EMBED,
    label: 'Video',
    icon: Video,
    description: 'Embedded video',
  },
  {
    type: LinkType.CONTACT_FORM,
    label: 'Contact Form',
    icon: FormInput,
    description: 'Contact form',
  },
  {
    type: LinkType.MAP_LOCATION,
    label: 'Map',
    icon: MapPin,
    description: 'Location map',
  },
  {
    type: LinkType.FILE_DOWNLOAD,
    label: 'File',
    icon: FileDown,
    description: 'Downloadable file',
  },
  {
    type: LinkType.CUSTOM_LINK,
    label: 'Custom',
    icon: Settings,
    description: 'Custom block',
  },
];

const BlocksSection: React.FC<BlocksSectionProps> = ({
  links,
  onAddBlock,
  onEditBlock,
  onDeleteBlock,
  onToggleBlockActive,
  onReorderBlocks,
  isLoading = false,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      {/* Section Header */}
      <SectionHeader
        icon={Layout}
        title="Content Blocks"
        subtitle="Manage your profile content"
      />

      {/* Add Block Grid */}
      <div className="space-y-3">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
          Add New Block
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {BLOCK_TYPES.map((blockType) => {
            const Icon = blockType.icon;
            return (
              <motion.button
                key={blockType.type}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onAddBlock(blockType.type)}
                disabled={isLoading}
                className="p-3 rounded-2xl border-2 border-gray-200 dark:border-white/10 hover:border-blue-300 dark:hover:border-blue-500/50 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center gap-2"
                aria-label={`Add ${blockType.label}`}
              >
                <Icon size={20} className="text-gray-600 dark:text-gray-300" />
                <span className="text-xs font-bold text-gray-600 dark:text-gray-300">
                  {blockType.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Existing Blocks List */}
      <div className="space-y-3 border-t border-gray-200 dark:border-white/5 pt-6">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
          Your Blocks
        </p>
        <LinksPanel
          links={links}
          onAddClick={() => onAddBlock(LinkType.CLASSIC)}
          onEdit={onEditBlock}
          onDelete={onDeleteBlock}
          onToggleActive={onToggleBlockActive}
          onReorder={onReorderBlocks}
          isLoading={isLoading}
        />
      </div>
    </motion.div>
  );
};

export default BlocksSection;
