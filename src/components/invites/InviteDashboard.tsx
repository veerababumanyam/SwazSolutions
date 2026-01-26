/**
 * Digital Invitations Dashboard Component
 * Main dashboard for digital invitation management
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Mail, Eye, Users, Calendar, TrendingUp, MoreHorizontal, Edit, Trash2, Copy } from 'lucide-react';
import { inviteApi } from '../../services/inviteApi';
import type { DigitalInvite } from '../../types/invite.types';

interface InviteStats {
  total: number;
  draft: number;
  published: number;
  totalGuests: number;
  accepted: number;
  pending: number;
}

export const InviteDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [invites, setInvites] = useState<DigitalInvite[]>([]);
  const [stats, setStats] = useState<InviteStats>({
    total: 0,
    draft: 0,
    published: 0,
    totalGuests: 0,
    accepted: 0,
    pending: 0
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'draft' | 'published'>('all');

  useEffect(() => {
    loadInvites();
    loadStats();
  }, [filter]);

  const loadInvites = async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await inviteApi.listInvites(params);
      if (response.success) {
        setInvites(response.data || []);
      }
    } catch (error) {
      console.error('Error loading invites:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await inviteApi.getStats();
      if (response.success) {
        const statusCounts = response.data.statusCounts || {};
        const guestStats = response.data.guestStats || {};

        setStats({
          total: Object.values(statusCounts).reduce((a: number, b: number) => a + b, 0),
          draft: statusCounts.draft || 0,
          published: statusCounts.published || 0,
          totalGuests: guestStats.total_guests || 0,
          accepted: guestStats.accepted || 0,
          pending: guestStats.pending || 0
        });
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleCreateNew = () => {
    navigate('/invites/create');
  };

  const handleEditInvite = (id: string) => {
    navigate(`/invites/edit/${id}`);
  };

  const handleViewGuests = (id: string) => {
    navigate(`/invites/${id}/guests`);
  };

  const handleViewAnalytics = (id: string) => {
    navigate(`/invites/${id}/analytics`);
  };

  const handleDuplicate = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await inviteApi.duplicateInvite(id);
      if (response.success) {
        loadInvites();
        loadStats();
        alert('Invitation duplicated successfully!');
      }
    } catch (error) {
      console.error('Error duplicating invite:', error);
      alert('Failed to duplicate invitation');
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this invitation? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await inviteApi.deleteInvite(id);
      if (response.success) {
        loadInvites();
        loadStats();
      }
    } catch (error) {
      console.error('Error deleting invite:', error);
      alert('Failed to delete invitation');
    }
  };

  const getEventTypeIcon = (eventType: string) => {
    const icons: Record<string, string> = {
      wedding: '💍',
      engagement: '💑',
      housewarming: '🏠',
      birthday: '🎂',
      anniversary: '💕',
      'baby-shower': '👶',
      corporate: '💼',
      festival: '🎉',
      custom: '✨'
    };
    return icons[eventType] || '📅';
  };

  const getEventDate = (invite: DigitalInvite) => {
    if (invite.multiEventEnabled && invite.events && invite.events.length > 0) {
      return new Date(invite.events[0].date).toLocaleDateString();
    }
    return invite.date ? new Date(invite.date).toLocaleDateString() : 'Not set';
  };

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ElementType;
    color: string;
    trend?: string;
  }> = ({ title, value, icon: Icon, color, trend }) => (
    <div className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-slate-200 dark:border-white/10 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-600 dark:text-white/60 font-medium">{title}</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{value}</p>
          {trend && (
            <p className="text-sm text-emerald-600 dark:text-green-400 mt-2 flex items-center gap-1">
              <TrendingUp size={14} />
              {trend}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon size={24} className="text-white dark:text-white/90" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a]">
      {/* Header */}
      <div className="bg-white dark:bg-white/5 border-b border-slate-200 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Digital Invitations</h1>
              <p className="text-slate-600 dark:text-white/60 mt-1">Create and manage your digital invitations</p>
            </div>
            <button
              onClick={handleCreateNew}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-pink-600 text-white font-semibold rounded-xl hover:shadow-lg hover:brightness-110 transition-all"
            >
              <Plus size={20} />
              Create Invitation
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Invites"
            value={stats.total}
            icon={Mail}
            color="bg-blue-500"
          />
          <StatCard
            title="Published"
            value={stats.published}
            icon={Calendar}
            color="bg-emerald-500"
            trend="Active"
          />
          <StatCard
            title="Total Guests"
            value={stats.totalGuests}
            icon={Users}
            color="bg-purple-500"
          />
          <StatCard
            title="RSVPs"
            value={`${Math.round(stats.totalGuests > 0 ? (stats.accepted / stats.totalGuests) * 100 : 0)}%`}
            icon={Eye}
            color="bg-amber-500"
            trend={`${stats.accepted} accepted`}
          />
        </div>

        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="flex gap-2 bg-white dark:bg-white/5 p-1 rounded-xl border border-slate-200 dark:border-white/10 w-fit">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === 'all'
                  ? 'bg-amber-500 text-white shadow-md'
                  : 'text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              All Invites
            </button>
            <button
              onClick={() => setFilter('draft')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === 'draft'
                  ? 'bg-amber-500 text-white shadow-md'
                  : 'text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              Drafts
            </button>
            <button
              onClick={() => setFilter('published')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === 'published'
                  ? 'bg-amber-500 text-white shadow-md'
                  : 'text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              Published
            </button>
          </div>
        </div>

        {/* Invites List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-amber-500"></div>
            <p className="text-slate-600 dark:text-white/60 mt-4">Loading invitations...</p>
          </div>
        ) : invites.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-white/5 rounded-2xl border border-dashed border-slate-300 dark:border-white/10">
            <div className="text-6xl mb-4">💌</div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No invitations yet</h3>
            <p className="text-slate-600 dark:text-white/60 mb-6">
              {filter === 'draft' ? "You don't have any draft invitations." :
               filter === 'published' ? "You haven't published any invitations yet." :
               "Create your first digital invitation to get started!"}
            </p>
            {filter === 'all' && (
              <button
                onClick={handleCreateNew}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-pink-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
              >
                <Plus size={20} />
                Create Your First Invite
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {invites.map((invite) => (
              <div
                key={invite.id}
                onClick={() => handleEditInvite(invite.id)}
                className="bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 hover:shadow-xl hover:border-amber-500/30 transition-all cursor-pointer group"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="text-4xl">{getEventTypeIcon(invite.eventType)}</div>
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                          {invite.hostName}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-white/60 capitalize">{invite.eventType}</p>
                      </div>
                    </div>
                    <div className="relative">
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <MoreHorizontal size={18} className="text-slate-400" />
                      </button>
                      {/* Dropdown menu would go here */}
                    </div>
                  </div>

                  {/* Event Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-white/60">
                      <Calendar size={14} />
                      <span>{getEventDate(invite)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-white/60">
                      <span className="font-medium">{invite.venue}</span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                      invite.status === 'published'
                        ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                        : 'bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-white/60'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        invite.status === 'published' ? 'bg-emerald-500' : 'bg-slate-400'
                      }`} />
                      {invite.status === 'published' ? 'Published' : 'Draft'}
                    </span>
                    {invite.multiEventEnabled && (
                      <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                        {invite.events?.length || 0} events
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t border-slate-100 dark:border-white/10">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditInvite(invite.id);
                      }}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      <Edit size={16} />
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDuplicate(invite.id, e);
                      }}
                      className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors"
                      title="Duplicate"
                    >
                      <Copy size={18} className="text-slate-400" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(invite.id, e)}
                      className="p-2 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={18} className="text-slate-400 hover:text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InviteDashboard;
