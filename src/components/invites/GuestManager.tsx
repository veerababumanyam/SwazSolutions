/**
 * Guest Management Component
 * Interface for managing invitation guests with CRUD operations, groups, and import/export
 */

import React, { useState, useEffect } from 'react';
import {
  Search, Plus, Upload, Download, Mail, Filter, Trash2, Edit2,
  Users, CalendarCheck, Clock, XCircle, CheckCircle2, UserCheck,
  MoreHorizontal, FileSpreadsheet, UserPlus, FolderPlus, CheckCircle,
  ChevronDown, User
} from 'lucide-react';
import { guestApi } from '../../services/inviteApi';
import type { Guest, GuestGroup, GuestCategory, GuestStatus } from '../../types/invite.types';

interface GuestManagerProps {
  inviteId: string;
  onBack?: () => void;
}

const CATEGORIES: GuestCategory[] = ['Family', 'Friends', 'Work', 'VIP', 'Other'];
const STATUS_OPTIONS: GuestStatus[] = ['Pending', 'Accepted', 'Declined'];

export const GuestManager: React.FC<GuestManagerProps> = ({ inviteId, onBack }) => {
  // Navigation state
  const [activeTab, setActiveTab] = useState<'guests' | 'groups'>('guests');

  // Guest list state
  const [guests, setGuests] = useState<Guest[]>([]);
  const [filteredGuests, setFilteredGuests] = useState<Guest[]>([]);
  const [guestStats, setGuestStats] = useState({
    total: 0,
    accepted: 0,
    declined: 0,
    pending: 0
  });

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<Guest>>({
    name: '',
    email: '',
    phone: '',
    category: 'Other',
    status: 'Pending',
    plusOnes: 0,
    dietary: '',
    isInvited: true
  });

  // Groups state
  const [guestGroups, setGuestGroups] = useState<GuestGroup[]>([]);

  // Import state
  const [importText, setImportText] = useState('');

  // Loading state
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadGuests();
    loadGroups();
  }, [inviteId]);

  const loadGuests = async () => {
    try {
      setLoading(true);
      const response = await guestApi.listGuests(inviteId);
      if (response.success) {
        setGuests(response.data || []);
        setFilteredGuests(response.data || []);
        setGuestStats(response.stats || {
          total: 0,
          accepted: 0,
          declined: 0,
          pending: 0
        });
      }
    } catch (error) {
      console.error('Error loading guests:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadGroups = async () => {
    // Load guest groups - API endpoint needs to be created
    // For now, use mock data or load from a different endpoint
  };

  // Filtering
  useEffect(() => {
    let filtered = guests;

    if (searchTerm) {
      filtered = filtered.filter(g =>
        g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterCategory !== 'All') {
      filtered = filtered.filter(g => g.category === filterCategory);
    }

    if (filterStatus !== 'All') {
      filtered = filtered.filter(g => g.status === filterStatus);
    }

    setFilteredGuests(filtered);
  }, [guests, searchTerm, filterCategory, filterStatus]);

  // CRUD Operations
  const handleAddGuest = async () => {
    try {
      setActionLoading(true);
      const response = await guestApi.addGuest(inviteId, formData);
      if (response.success) {
        await loadGuests();
        handleCloseModal();
      }
    } catch (error) {
      console.error('Error adding guest:', error);
      alert('Failed to add guest');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateGuest = async () => {
    if (!editingGuest) return;

    try {
      setActionLoading(true);
      const response = await guestApi.updateGuest(inviteId, editingGuest.id, formData);
      if (response.success) {
        await loadGuests();
        handleCloseModal();
      }
    } catch (error) {
      console.error('Error updating guest:', error);
      alert('Failed to update guest');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteGuest = async (guestId: string) => {
    if (!confirm('Are you sure you want to delete this guest?')) return;

    try {
      await guestApi.deleteGuest(inviteId, guestId);
      await loadGuests();
      if (selectedIds.has(guestId)) {
        setSelectedIds(new Set([...selectedIds].filter(id => id !== guestId)));
      }
    } catch (error) {
      console.error('Error deleting guest:', error);
      alert('Failed to delete guest');
    }
  };

  const handleBulkDelete = async () => {
    const idsToDelete = Array.from(selectedIds);
    if (idsToDelete.length === 0) return;

    if (!confirm(`Delete ${idsToDelete.length} guest(s)?`)) return;

    try {
      await guestApi.bulkOperation(inviteId, 'delete', idsToDelete);
      await loadGuests();
      setSelectedIds(new Set());
    } catch (error) {
      console.error('Error bulk deleting:', error);
      alert('Failed to delete guests');
    }
  };

  const handleInviteToEvent = async () => {
    const idsToInvite = Array.from(selectedIds);
    if (idsToInvite.length === 0) return;

    try {
      await guestApi.bulkOperation(inviteId, 'invite', idsToInvite);
      await loadGuests();
      setSelectedIds(new Set());
      alert(`${idsToInvite.length} guest(s) added to event!`);
    } catch (error) {
      console.error('Error inviting guests:', error);
      alert('Failed to invite guests');
    }
  };

  const handleExport = async () => {
    try {
      await guestApi.exportGuests(inviteId);
    } catch (error) {
      console.error('Error exporting guests:', error);
      alert('Failed to export guests');
    }
  };

  const handleImport = async () => {
    const lines = importText.split('\n');
    const newGuests = [];

    for (const line of lines) {
      const [name, email, phone, cat] = line.split(',').map(s => s.trim());
      if (name) {
        newGuests.push({
          name,
          email: email || '',
          phone: phone || '',
          category: (CATEGORIES.includes(cat) ? cat : 'Other') as GuestCategory,
          status: 'Pending',
          plusOnes: 0,
          isInvited: true
        });
      }
    }

    try {
      const response = await guestApi.importGuests(inviteId, newGuests);
      if (response.success) {
        await loadGuests();
        setShowImportModal(false);
        setImportText('');
        alert(`Imported ${response.data.imported} guests successfully!`);
      }
    } catch (error) {
      console.error('Error importing guests:', error);
      alert('Failed to import guests');
    }
  };

  // Modal handlers
  const openAddModal = () => {
    setEditingGuest(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      category: 'Other',
      status: 'Pending',
      plusOnes: 0,
      dietary: '',
      isInvited: true
    });
    setShowAddModal(true);
  };

  const openEditModal = (guest: Guest) => {
    setEditingGuest(guest);
    setFormData(guest);
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingGuest(null);
  };

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const toggleAll = () => {
    if (selectedIds.size === filteredGuests.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredGuests.map(g => g.id)));
    }
  };

  // Stat Card Component
  const StatCard: React.FC<{
    title: string;
    value: string | number;
    color: string;
    icon: React.ElementType;
  }> = ({ title, value, color, icon: Icon }) => (
    <div className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-slate-200 dark:border-white/10">
      <div className={`p-3 rounded-xl ${color} mb-4 w-fit`}>
        <Icon size={24} className="text-white" />
      </div>
      <div>
        <p className="text-sm text-slate-600 dark:text-white/50 uppercase tracking-wider">{title}</p>
        <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{value}</h3>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a]">
      {/* Header */}
      <div className="bg-white dark:bg-white/5 border-b border-slate-200 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="text-slate-600 dark:text-white/50 hover:text-slate-900 dark:hover:text-white flex items-center gap-2"
            >
              <ArrowLeft size={20} />
              Back
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Guest Manager</h1>
              <p className="text-slate-600 dark:text-white/50">Manage your invitation guests</p>
            </div>
          </div>

          {/* Stats */}
          <div className="hidden lg:flex gap-4">
            <StatCard title="Total Guests" value={guestStats.total} color="bg-blue-500" icon={Users} />
            <StatCard title="Attending" value={guestStats.accepted} color="bg-emerald-500" icon={CheckCircle2} />
            <StatCard title="Pending" value={guestStats.pending} color="bg-amber-500" icon={Clock} />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tab Navigation */}
        <div className="flex bg-white dark:bg-white/5 rounded-xl p-1 border border-slate-200 dark:border-white/10 mb-6 w-fit">
          <button
            onClick={() => setActiveTab('guests')}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'guests'
                ? 'bg-amber-500 text-white'
                : 'text-slate-600 dark:text-white/40 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
            }`}
          >
            <Users size={18} className="inline mr-2" />
            Guests
          </button>
          <button
            onClick={() => setActiveTab('groups')}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'groups'
                ? 'bg-amber-500 text-white'
                : 'text-slate-600 dark:text-white/40 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
            }`}
          >
            <FolderPlus size={18} className="inline mr-2" />
            Groups
          </button>
        </div>

        {activeTab === 'guests' ? (
          <>
            {/* Toolbar */}
            <div className="bg-white dark:bg-white/5 rounded-2xl p-4 border border-slate-200 dark:border-white/10 mb-6">
              <div className="flex flex-col md:flex-row gap-4 justify-between">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search guests..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="flex gap-2">
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white"
                  >
                    <option value="All">All Categories</option>
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>

                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white"
                  >
                    <option value="All">All Status</option>
                    {STATUS_OPTIONS.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>

                  <button
                    onClick={() => setShowImportModal(true)}
                    className="px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors flex items-center gap-2"
                  >
                    <Upload size={18} />
                    Import
                  </button>

                  <button
                    onClick={handleExport}
                    className="px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors flex items-center gap-2"
                  >
                    <Download size={18} />
                    Export
                  </button>
                </div>

                <button
                  onClick={openAddModal}
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-pink-600 text-white font-medium rounded-xl hover:brightness-110 transition-all flex items-center gap-2 shadow-lg"
                >
                  <UserPlus size={18} />
                  Add Guest
                </button>
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedIds.size > 0 && (
              <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-6 animate-in slide-in-from-top-2">
                <div className="flex items-center justify-between">
                  <span className="text-amber-800 dark:text-amber-200 font-medium">
                    {selectedIds.size} guest{selectedIds.size !== 1 ? 's' : ''} selected
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={handleInviteToEvent}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                    >
                      <Mail size={16} />
                      Invite
                    </button>
                    <button
                      onClick={handleBulkDelete}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Guest Table */}
            <div className="bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden">
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-amber-500 border-t-transparent mx-auto" />
                </div>
              ) : filteredGuests.length === 0 ? (
                <div className="text-center py-12">
                  <Users size={48} className="mx-auto text-slate-300 dark:text-white/20 mb-4" />
                  <p className="text-slate-500 dark:text-white/40">No guests found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-white/5">
                        <th className="p-4 w-12">
                          <input
                            type="checkbox"
                            checked={selectedIds.size === filteredGuests.length}
                            onChange={toggleAll}
                            className="rounded bg-slate-200 dark:bg-white/20 w-4 h-4 cursor-pointer accent-amber-500"
                          />
                        </th>
                        <th className="p-4 text-xs font-bold text-slate-500 dark:text-white/50 uppercase tracking-wider">Name</th>
                        <th className="p-4 text-xs font-bold text-slate-500 dark:text-white/50 uppercase tracking-wider">Email</th>
                        <th className="p-4 text-xs font-bold text-slate-500 dark:text-white/50 uppercase tracking-wider">Category</th>
                        <th className="p-4 text-xs font-bold text-slate-500 dark:text-white/50 uppercase tracking-wider">Status</th>
                        <th className="p-4 text-xs font-bold text-slate-500 dark:text-white/50 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                      {filteredGuests.map(guest => (
                        <tr key={guest.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                          <td className="p-4">
                            <input
                              type="checkbox"
                              checked={selectedIds.has(guest.id)}
                              onChange={() => toggleSelection(guest.id)}
                              className="rounded bg-slate-200 dark:bg-white/20 w-4 h-4 cursor-pointer accent-amber-500"
                            />
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-100 to-pink-100 flex items-center justify-center text-xs font-bold text-amber-700">
                                {guest.name.substring(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-medium text-slate-900 dark:text-white">{guest.name}</div>
                                {guest.phone && (
                                  <div className="text-xs text-slate-500 dark:text-white/40">{guest.phone}</div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-sm text-slate-600 dark:text-white/40">{guest.email}</td>
                          <td className="p-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              guest.category === 'Family' ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400' :
                              guest.category === 'Friends' ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400' :
                              guest.category === 'Work' ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400' :
                              guest.category === 'VIP' ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400' :
                              'bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-white/40'
                            }`}>
                              {guest.category}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              guest.status === 'Accepted' ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400' :
                              guest.status === 'Declined' ? 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400' :
                              'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400'
                            }`}>
                              {guest.status === 'Accepted' && <CheckCircle size={12} className="text-emerald-600" />}
                              {guest.status === 'Declined' && <XCircle size={12} className="text-red-600" />}
                              {guest.status === 'Pending' && <Clock size={12} className="text-amber-600" />}
                              {guest.status}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => openEditModal(guest)}
                                className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                                title="Edit"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteGuest(guest.id)}
                                className="p-1.5 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-lg text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                                title="Delete"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <FolderPlus size={64} className="mx-auto text-slate-300 dark:text-white/20 mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Guest Groups</h3>
            <p className="text-slate-500 dark:text-white/40 mb-6">
              Create reusable guest lists (e.g., "Office Team", "Family")
            </p>
            <button
              onClick={() => setShowGroupModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-xl transition-colors"
            >
              <FolderPlus size={18} />
              Create Group
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {editingGuest ? 'Edit Guest' : 'Add New Guest'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors"
              >
                <X size={20} className="text-slate-500" />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); editingGuest ? handleUpdateGuest() : handleAddGuest(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-white/80 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. John Doe"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/30"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-white/80 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="guest@email.com"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/30"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-white/80 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-white/80 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as GuestCategory })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-white/80 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as GuestStatus })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white"
                  >
                    {STATUS_OPTIONS.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-white/80 mb-2">
                  Plus Ones
                </label>
                <input
                  type="number"
                  min={0}
                  max={10}
                  value={formData.plusOnes}
                  onChange={(e) => setFormData({ ...formData, plusOnes: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-white/80 mb-2">
                  Dietary Requirements
                </label>
                <input
                  type="text"
                  value={formData.dietary}
                  onChange={(e) => setFormData({ ...formData, dietary: e.target.value })}
                  placeholder="e.g., Vegetarian, Vegan, No nuts"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/30"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-6 py-3 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-white rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || !formData.name || !formData.email}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-500 to-pink-600 text-white font-medium rounded-xl hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {actionLoading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      {editingGuest ? 'Update' : 'Add'} Guest
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Import Guests</h2>
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportText('');
                }}
                className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors"
              >
                <X size={20} className="text-slate-500" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-slate-600 dark:text-white/60">
                Paste CSV data (Name, Email, Phone, Category) - one guest per line:
              </p>
              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder={`John Doe, john@example.com, , Family\nJane Smith, jane@work.com, , Work`}
                rows={8}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-mono text-sm resize-none"
              />
              <div className="flex gap-3">
                <button
                  onClick={handleImport}
                  disabled={!importText.trim()}
                  className="flex-1 px-4 py-3 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
                >
                  Import
                </button>
                <button
                  onClick={() => {
                    setShowImportModal(false);
                    setImportText('');
                  }}
                  className="px-4 py-3 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-white rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuestManager;
