// ProfileEditor Page (T039, T045)
// Full profile editing interface with integrated ProfileForm component

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../hooks/useProfile';
import ProfileForm from '../components/ProfileForm';
import SocialLinksManager from '../components/profile/SocialLinksManager';
import QRCodeModal from '../components/profile/QRCodeModal';
import { SharePanel } from '../components/profile/SharePanel';
import { ProfileData } from '../services/profileService';

export const ProfileEditor: React.FC = () => {
  const navigate = useNavigate();
  const { profile, loading, error, exists, saving, createProfile, updateProfile, clearError } = useProfile();
  const [showQRModal, setShowQRModal] = useState(false);

  // Handle save (create or update)
  const handleSave = async (data: Partial<ProfileData>) => {
    try {
      if (exists) {
        await updateProfile(data);
        alert('Profile updated successfully!');
      } else {
        await createProfile(data);
        alert('Profile created successfully!');
        navigate('/profile/dashboard');
      }
    } catch (err) {
      console.error('Failed to save profile:', err);
      alert(err instanceof Error ? err.message : 'Failed to save profile');
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (exists) {
      navigate('/profile/dashboard');
    } else {
      navigate('/');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !exists) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-2">Error Loading Profile</h2>
          <p className="text-red-700 dark:text-red-300">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {exists ? 'Edit Profile' : 'Create Your Profile'}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {exists
              ? 'Update your Virtual Profile information and settings'
              : 'Set up your Virtual Profile to share your contact info and social links'}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 flex justify-between items-start">
            <div>
              <p className="text-yellow-800 dark:text-yellow-200">{error}</p>
            </div>
            <button onClick={clearError} className="text-yellow-600 hover:text-yellow-800 dark:text-yellow-400">
              ✕
            </button>
          </div>
        )}

        {/* Profile Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          {saving && (
            <div className="mb-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded p-3 flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500 mr-3"></div>
              <span className="text-blue-800 dark:text-blue-200">Saving changes...</span>
            </div>
          )}

          <ProfileForm
            initialData={profile || undefined}
            onSave={handleSave}
            onCancel={handleCancel}
            mode={exists ? 'edit' : 'create'}
          />
        </div>

        {/* Social Links Manager - T093 */}
        {exists && profile && (
          <div className="mt-6">
            <SocialLinksManager />
          </div>
        )}

        {/* Preview & Actions (T052) */}
        {exists && profile && (
          <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
            <button
              onClick={() => {
                const previewUrl = `/#/u/${profile.username}`;
                window.open(previewUrl, '_blank', 'noopener,noreferrer');
              }}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              <span>Preview Public Profile</span>
            </button>
            
            <button
              onClick={async () => {
                try {
                  const response = await fetch(`/api/public/profile/${profile.username}/vcard`);
                  if (!response.ok) throw new Error('Failed to download vCard');
                  const blob = await response.blob();
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${profile.username}.vcf`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  window.URL.revokeObjectURL(url);
                } catch (err) {
                  console.error('vCard download failed:', err);
                  alert('Failed to download vCard. Please try again.');
                }
              }}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <span>Download vCard</span>
            </button>
            
            <button
              onClick={() => setShowQRModal(true)}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                />
              </svg>
              <span>View QR Code</span>
            </button>
          </div>
        )}

        {/* Share Panel - T134-T139 */}
        {exists && profile && (
          <div className="mt-6">
            <SharePanel 
              profileId={profile.id || 0}
              profileUrl={`${window.location.origin}/#/u/${profile.username}`}
              title={`${profile.displayName}'s Profile`}
              username={profile.username}
            />
          </div>
        )}

        {/* Help Text */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">💡 Tips</h3>
          <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
            <li>• Choose a memorable username - it cannot be changed later</li>
            <li>• Make your profile public to share it with others</li>
            <li>• Add social links after creating your profile</li>
            <li>• Enable search indexing to appear in Google search results</li>
          </ul>
        </div>
      </div>
      
      {/* QR Code Modal (T124-T128) */}
      {profile && (
        <QRCodeModal
          isOpen={showQRModal}
          onClose={() => setShowQRModal(false)}
          username={profile.username}
        />
      )}
    </div>
  );
};
