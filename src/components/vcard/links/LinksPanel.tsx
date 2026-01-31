/**
 * LinksPanel - Main list container with drag-and-drop functionality
 * Extracted from LinksEditor.tsx for reusability
 * Features: DnD with @dnd-kit, haptic feedback, Framer Motion animations
 */

import React, { useCallback } from 'react';
import { LinkItem, LinkType } from '@/types/modernProfile.types';
import { motion } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Plus, Sparkles } from 'lucide-react';
import { SortableLinkItem } from './SortableLinkItem';
import { useHaptic } from '@/hooks/useHaptic';

interface LinksPanelProps {
  links: LinkItem[];
  onAddClick: () => void;
  onEdit: (linkId: string) => void;
  onDelete: (linkId: string) => void;
  onToggleActive: (linkId: string) => void;
  onReorder: (newOrder: LinkItem[]) => Promise<void>;
  isLoading?: boolean;
}

/**
 * Animation variants for staggered list rendering
 */
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

/**
 * LinksPanel Component
 * Main container for displaying and managing link items with drag-and-drop reordering
 * Features:
 * - Drag-and-drop reordering using @dnd-kit
 * - Keyboard navigation support (Arrow keys, Enter, Space)
 * - Pointer and touch support via PointerSensor
 * - Haptic feedback on interactions
 * - Staggered animation for list items
 * - Empty state with CTA
 * - Dark mode support
 * - Full accessibility (ARIA labels, semantic HTML)
 *
 * @param links - Array of LinkItem objects to display
 * @param onAddClick - Callback when "Add Block" button is clicked
 * @param onEdit - Callback when edit button is clicked for a link
 * @param onDelete - Callback when delete button is clicked for a link
 * @param onToggleActive - Callback when visibility toggle is clicked
 * @param onReorder - Callback when links are reordered (receives new order array)
 * @param isLoading - Optional loading state
 */
export const LinksPanel: React.FC<LinksPanelProps> = ({
  links,
  onAddClick,
  onEdit,
  onDelete,
  onToggleActive,
  onReorder,
  isLoading = false,
}) => {
  const { trigger: triggerHaptic } = useHaptic();

  /**
   * Configure drag sensors
   * PointerSensor: Mouse and touch input
   * KeyboardSensor: Keyboard navigation (Arrow keys, Enter, Space)
   */
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  /**
   * Handle drag end event - reorder links via backend sync
   */
  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;

      if (over && active.id !== over.id) {
        const oldIndex = links.findIndex((link) => link.id === active.id);
        const newIndex = links.findIndex((link) => link.id === over.id);

        if (oldIndex !== -1 && newIndex !== -1) {
          const newOrder = arrayMove(links, oldIndex, newIndex);

          try {
            // Haptic feedback on successful reorder
            triggerHaptic(20);
            await onReorder(newOrder);
          } catch (error) {
            console.error('Failed to reorder links:', error);
            triggerHaptic(10); // Error feedback
          }
        }
      }
    },
    [links, onReorder, triggerHaptic]
  );

  /**
   * Handle add block button click
   */
  const handleAddClick = useCallback(() => {
    triggerHaptic(10);
    onAddClick();
  }, [onAddClick, triggerHaptic]);

  /**
   * Handle edit link
   */
  const handleEdit = useCallback(
    (linkId: string) => {
      triggerHaptic(10);
      onEdit(linkId);
    },
    [onEdit, triggerHaptic]
  );

  /**
   * Handle delete link
   */
  const handleDelete = useCallback(
    (linkId: string) => {
      onDelete(linkId);
      triggerHaptic(20);
    },
    [onDelete, triggerHaptic]
  );

  /**
   * Handle toggle active state
   */
  const handleToggleActive = useCallback(
    (linkId: string) => {
      triggerHaptic(10);
      onToggleActive(linkId);
    },
    [onToggleActive, triggerHaptic]
  );

  // Empty state
  if (links.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16 px-4"
      >
        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-4">
          <Sparkles size={28} className="text-gray-400 dark:text-white/40" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          No content yet
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
          Start building your portfolio by adding links, galleries, and videos
        </p>
        <button
          onClick={handleAddClick}
          disabled={isLoading}
          className="px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white rounded-xl inline-flex items-center gap-2 transition-colors font-medium shadow-lg"
          aria-label="Add your first content block"
        >
          <Plus size={20} />
          Add Your First Block
        </button>
      </motion.div>
    );
  }

  // Links list with drag-and-drop
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={links.map((link) => link.id)}
        strategy={verticalListSortingStrategy}
      >
        <motion.div variants={containerVariants} initial="hidden" animate="show">
          {links.map((link) => (
            <SortableLinkItem
              key={link.id}
              link={link}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleActive={handleToggleActive}
            />
          ))}
        </motion.div>
      </SortableContext>
    </DndContext>
  );
};

export default LinksPanel;
