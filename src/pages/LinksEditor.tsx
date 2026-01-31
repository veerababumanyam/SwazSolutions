/**
 * LinksEditor - Main links management page
 * Uses Phase 3 components: LinkItemEditor, GalleryEditor, VideoUploadEditor
 * Implements drag-and-drop reordering with @dnd-kit/core
 */

import React, { useState } from 'react';
import { useProfile } from '@/contexts/ProfileContext';
import { LinkType, LinkItem } from '@/types/modernProfile.types';
import { Plus, GripVertical, Sparkles, Edit2, Trash2, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { LinkItemEditor } from '@/components/profile/LinkItemEditor';
import { GalleryEditor } from '@/components/profile/GalleryEditor';
import { useHaptic } from '@/hooks/useHaptic';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
};

const getLinkTypeIcon = (type: LinkType): string => {
  const icons: Record<LinkType, string> = {
    [LinkType.CLASSIC]: '🔗',
    [LinkType.HEADER]: '📝',
    [LinkType.GALLERY]: '🖼️',
    [LinkType.VIDEO_EMBED]: '🎬',
    [LinkType.CONTACT_FORM]: '📋',
    [LinkType.MAP_LOCATION]: '📍',
    [LinkType.FILE_DOWNLOAD]: '📥',
    [LinkType.CUSTOM_LINK]: '⭐',
    // Deprecated types - kept for backward compatibility with existing data
    [LinkType.VIDEO_UPLOAD]: '📹',
    [LinkType.BOOKING]: '📅',
  };
  return icons[type] || '🔗';
};

interface SortableLinkItemProps {
  link: LinkItem;
  onEdit: (linkId: string) => void;
  onDelete: (linkId: string) => void;
  onToggleActive: (linkId: string) => void;
}

const SortableLinkItem: React.FC<SortableLinkItemProps> = ({ link, onEdit, onDelete, onToggleActive }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: link.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group mb-4">
      {/* Active Highlight Border */}
      {link.isActive && (
        <div className="absolute -left-[1px] top-[10px] bottom-[10px] w-[3px] bg-blue-500 rounded-r-full"></div>
      )}

      <div className="relative bg-white dark:bg-[#18181b] rounded-xl border border-gray-200 dark:border-white/5 shadow-sm hover:border-gray-300 dark:hover:border-white/20 transition-all duration-300 overflow-hidden">
        <div className="flex">
          {/* Drag Handle */}
          <div
            {...attributes}
            {...listeners}
            className="w-8 flex items-center justify-center cursor-grab active:cursor-grabbing text-gray-300 dark:text-white/10 hover:text-gray-500 dark:hover:text-white/50 touch-none hover:bg-gray-50 dark:hover:bg-white/5 transition-colors border-r border-gray-100 dark:border-white/5"
          >
            <GripVertical size={16} />
          </div>

          {/* Link Content */}
          <div className="flex-1 p-4 flex items-center gap-3">
            <div className="text-2xl">{getLinkTypeIcon(link.type)}</div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-gray-900 dark:text-white truncate">
                {link.title || 'Untitled'}
              </div>
              {link.url && link.type !== LinkType.HEADER && (
                <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {link.url}
                </div>
              )}
              {link.type === LinkType.GALLERY && link.galleryImages && (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {link.galleryImages.length} image{link.galleryImages.length !== 1 ? 's' : ''}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => onToggleActive(link.id)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                title={link.isActive ? 'Hide' : 'Show'}
              >
                {link.isActive ? (
                  <Eye size={16} className="text-green-500" />
                ) : (
                  <EyeOff size={16} className="text-gray-400" />
                )}
              </button>
              <button
                onClick={() => onEdit(link.id)}
                className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors"
                title="Edit"
              >
                <Edit2 size={16} className="text-blue-500" />
              </button>
              <button
                onClick={() => onDelete(link.id)}
                className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
                title="Delete"
              >
                <Trash2 size={16} className="text-red-500" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const LinksEditor: React.FC = () => {
  const { links, addLink, reorderLinks, updateLink, removeLink } = useProfile();
  const { trigger } = useHaptic();
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = links.findIndex((link) => link.id === active.id);
      const newIndex = links.findIndex((link) => link.id === over.id);

      const newOrder = arrayMove(links, oldIndex, newIndex);
      await reorderLinks(newOrder);
      trigger(20);
    }
  };

  const handleAddLink = async (type: LinkType) => {
    await addLink(type);
    setShowAddMenu(false);
    trigger(10);
  };

  const handleEdit = (linkId: string) => {
    setEditingLinkId(linkId);
    trigger(10);
  };

  const handleDelete = async (linkId: string) => {
    if (window.confirm('Are you sure you want to delete this link? This action cannot be undone.')) {
      await removeLink(linkId);
      trigger(20);
    }
  };

  const handleToggleActive = async (linkId: string) => {
    const link = links.find((l) => l.id === linkId);
    if (link) {
      await updateLink(linkId, { isActive: !link.isActive });
      trigger(10);
    }
  };

  // Available link types for creating new blocks
  // VIDEO_UPLOAD and BOOKING are deprecated and hidden from UI
  const linkTypes = [
    { type: LinkType.CLASSIC, label: 'Link', icon: '🔗', description: 'Standard clickable link' },
    { type: LinkType.HEADER, label: 'Header', icon: '📝', description: 'Section divider' },
    { type: LinkType.GALLERY, label: 'Gallery', icon: '🖼️', description: 'Image showcase' },
    { type: LinkType.VIDEO_EMBED, label: 'YouTube / Vimeo', icon: '🎬', description: 'Embed video from URL' },
    { type: LinkType.CONTACT_FORM, label: 'Contact Form', icon: '📋', description: 'Visitor inquiry form' },
    { type: LinkType.MAP_LOCATION, label: 'Map', icon: '📍', description: 'Show your location' },
    { type: LinkType.FILE_DOWNLOAD, label: 'File Download', icon: '📥', description: 'Share downloadable files' },
    { type: LinkType.CUSTOM_LINK, label: 'Custom Link', icon: '⭐', description: 'Custom styled link' },
  ];

  return (
    <div className="w-full h-full">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Portfolio Links</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Manage your links, galleries, and content blocks
            </p>
          </div>
          <button
            onClick={() => setShowAddMenu(true)}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl flex items-center gap-2 transition-colors shadow-lg shadow-blue-500/30"
          >
            <Plus size={18} />
            <span className="font-medium">Add Block</span>
          </button>
        </div>
      </div>

      {/* Links List with Drag & Drop */}
      {links.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16 px-4"
        >
          <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-4">
            <Sparkles size={28} className="text-gray-400 dark:text-white/40" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No content yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
            Start building your portfolio by adding links, galleries, and videos
          </p>
          <button
            onClick={() => setShowAddMenu(true)}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl inline-flex items-center gap-2 transition-colors font-medium shadow-lg"
          >
            <Plus size={20} />
            Add Your First Block
          </button>
        </motion.div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={links.map((link) => link.id)} strategy={verticalListSortingStrategy}>
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
      )}

      {/* Add Link Type Modal */}
      <AnimatePresence>
        {showAddMenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
            onClick={() => setShowAddMenu(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-[#18181b] border border-gray-200 dark:border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-white/5">
                <h3 className="text-gray-900 dark:text-white font-bold text-xl">Add Content Block</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                  Choose what you want to add to your profile
                </p>
              </div>

              <div className="p-4 max-h-[60vh] overflow-y-auto">
                <div className="grid grid-cols-1 gap-3">
                  {linkTypes.map((item) => (
                    <button
                      key={item.type}
                      onClick={() => handleAddLink(item.type)}
                      className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 dark:border-white/5 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all text-left group"
                    >
                      <div className="text-3xl">{item.icon}</div>
                      <div className="flex-1">
                        <div className="font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {item.label}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{item.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 border-t border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-white/5">
                <button
                  onClick={() => setShowAddMenu(false)}
                  className="w-full py-3 rounded-xl bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-900 dark:text-white font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Link Item Editor Modal */}
      {editingLinkId && (
        <LinkItemEditor
          linkId={editingLinkId}
          onClose={() => setEditingLinkId(null)}
          onSave={() => {
            setEditingLinkId(null);
            trigger(20);
          }}
        />
      )}
    </div>
  );
};

export default LinksEditor;
