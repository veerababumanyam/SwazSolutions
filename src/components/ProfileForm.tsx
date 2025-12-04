// ProfileForm Component (T040-T044)
// Complete form for creating/editing Virtual Profile

import React, { useState, useEffect, useCallback } from 'react';
import { ProfileData } from '../services/profileService';
import { useProfile } from '../hooks/useProfile';

interface ProfileFormProps {
  initialData?: Partial<ProfileData>;
  onSave?: (data: Partial<ProfileData>) => void;
  onCancel?: () => void;
  mode?: 'create' | 'edit';
}

const ProfileForm: React.FC<ProfileFormProps> = ({
  initialData,
  onSave,
  onCancel,
  mode = 'edit',
}) => {
  const { checkUsername } = useProfile();

  // Form state
  const [formData, setFormData] = useState<Partial<ProfileData>>({
    username: '',
    displayName: '',
    firstName: '',
    lastName: '',
    headline: '',
    company: '',
    bio: '',
    publicEmail: '',
    publicPhone: '',
    website: '',
    pronouns: '',
    published: false,
    indexingOptIn: false,
    showEmail: true,
    showPhone: true,
    showWebsite: true,
    // Company contact fields
    companyEmail: '',
    companyPhone: '',
    showCompanyEmail: true,
    showCompanyPhone: true,
    ...initialData,
  });

  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [usernameSuggestions, setUsernameSuggestions] = useState<string[]>([]);

  // Debounced username check
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.username && formData.username.length >= 3) {
        handleUsernameCheck(formData.username);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.username]);

  /**
   * Handle username availability check
   */
  const handleUsernameCheck = async (username: string) => {
    if (initialData?.username === username) {
      setUsernameAvailable(true);
      return;
    }

    try {
      setUsernameChecking(true);
      const result = await checkUsername(username);
      setUsernameAvailable(result.available);
      setUsernameSuggestions(result.suggestions || []);

      if (!result.available) {
        setErrors((prev) => ({ ...prev, username: 'Username is already taken' }));
      } else {
        setErrors((prev) => {
          const { username, ...rest } = prev;
          return rest;
        });
      }
    } catch (err) {
      console.error('Username check failed:', err);
    } finally {
      setUsernameChecking(false);
    }
  };

  /**
   * Handle form field changes
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear field error on change
    if (errors[name]) {
      setErrors((prev) => {
        const { [name]: removed, ...rest } = prev;
        return rest;
      });
    }
  };

  /**
   * Validate form data
   */
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!formData.username?.trim()) {
      newErrors.username = 'Username is required';
    } else if (!/^[a-zA-Z0-9_-]{3,30}$/.test(formData.username)) {
      newErrors.username = 'Username must be 3-30 characters (letters, numbers, _, -)';
    }

    if (!formData.displayName?.trim()) {
      newErrors.displayName = 'Display name is required';
    }

    // Optional field validations
    if (formData.publicEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.publicEmail)) {
      newErrors.publicEmail = 'Invalid email format';
    }

    // Company email validation
    if (formData.companyEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.companyEmail)) {
      newErrors.companyEmail = 'Invalid email format';
    }

    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
      newErrors.website = 'Website must start with http:// or https://';
    }

    if (formData.bio && formData.bio.length > 500) {
      newErrors.bio = 'Bio must be 500 characters or less';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    if (usernameAvailable === false) {
      setErrors((prev) => ({ ...prev, username: 'Username is not available' }));
      return;
    }

    onSave?.(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Username Field (T040) */}
      <div>
        <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Username <span className="text-red-500">*</span>
        </label>
        <div className="mt-1 relative">
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            disabled={mode === 'edit' && initialData?.username !== undefined}
            className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
              errors.username
                ? 'border-red-300'
                : usernameAvailable === true
                ? 'border-green-300'
                : 'border-gray-300'
            } dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
              mode === 'edit' && initialData?.username ? 'bg-gray-100 cursor-not-allowed' : ''
            }`}
            placeholder="johndoe"
          />
          {usernameChecking && (
            <div className="absolute right-3 top-2">
              <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            </div>
          )}
          {!usernameChecking && usernameAvailable === true && (
            <div className="absolute right-3 top-2 text-green-500">✓</div>
          )}
          {!usernameChecking && usernameAvailable === false && (
            <div className="absolute right-3 top-2 text-red-500">✗</div>
          )}
        </div>
        {errors.username && <p className="mt-1 text-sm text-red-600">{errors.username}</p>}
        {usernameAvailable === false && usernameSuggestions.length > 0 && (
          <div className="mt-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">Suggestions:</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {usernameSuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, username: suggestion }))}
                  className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Your profile will be available at: /u/{formData.username || 'username'}
        </p>
      </div>

      {/* Display Name (T041) */}
      <div>
        <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Display Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="displayName"
          name="displayName"
          value={formData.displayName}
          onChange={handleChange}
          className={`mt-1 block w-full px-3 py-2 border ${
            errors.displayName ? 'border-red-300' : 'border-gray-300'
          } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
          placeholder="John Doe"
        />
        {errors.displayName && <p className="mt-1 text-sm text-red-600">{errors.displayName}</p>}
      </div>

      {/* First Name & Last Name (T041) */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            First Name
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="John"
          />
        </div>
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Last Name
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Doe"
          />
        </div>
      </div>

      {/* Headline (T042) */}
      <div>
        <label htmlFor="headline" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Headline
        </label>
        <input
          type="text"
          id="headline"
          name="headline"
          value={formData.headline}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          placeholder="Software Engineer | Open Source Enthusiast"
          maxLength={100}
        />
        <p className="mt-1 text-xs text-gray-500">{formData.headline?.length || 0}/100 characters</p>
      </div>

      {/* Company (T042) */}
      <div>
        <label htmlFor="company" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Company
        </label>
        <input
          type="text"
          id="company"
          name="company"
          value={formData.company}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          placeholder="Acme Corp"
        />
      </div>

      {/* Bio (T042) */}
      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Bio
        </label>
        <textarea
          id="bio"
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          rows={4}
          className={`mt-1 block w-full px-3 py-2 border ${
            errors.bio ? 'border-red-300' : 'border-gray-300'
          } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
          placeholder="Tell people about yourself..."
          maxLength={500}
        />
        {errors.bio && <p className="mt-1 text-sm text-red-600">{errors.bio}</p>}
        <p className="mt-1 text-xs text-gray-500">{formData.bio?.length || 0}/500 characters</p>
      </div>

      {/* Pronouns (T042) */}
      <div>
        <label htmlFor="pronouns" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Pronouns
        </label>
        <input
          type="text"
          id="pronouns"
          name="pronouns"
          value={formData.pronouns}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          placeholder="he/him, she/her, they/them, etc."
        />
      </div>

      {/* Contact Information Section (T043) */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Contact Information</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Add contact details and control their visibility on your public profile and vCard.
        </p>

        {/* Personal Contact Section */}
        <div className="mb-6">
          <h4 className="text-md font-medium mb-3 text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            Personal Contact
          </h4>
          <div className="space-y-4">
            {/* Personal Email with Toggle */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="publicEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Personal Email
                </label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="showEmail"
                    checked={formData.showEmail ?? true}
                    onChange={(e) => setFormData({ ...formData, showEmail: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                  <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                    {formData.showEmail ? 'Visible' : 'Hidden'}
                  </span>
                </label>
              </div>
              <input
                type="email"
                id="publicEmail"
                name="publicEmail"
                value={formData.publicEmail}
                onChange={handleChange}
                className={`mt-1 block w-full px-3 py-2 border ${
                  errors.publicEmail ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
                placeholder="john@personal.com"
              />
              {errors.publicEmail && <p className="mt-1 text-sm text-red-600">{errors.publicEmail}</p>}
              <p className="mt-1 text-xs text-gray-400">Personal email shown in vCard as HOME type</p>
            </div>

            {/* Personal Phone with Toggle */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="publicPhone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Personal Phone
                </label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="showPhone"
                    checked={formData.showPhone ?? true}
                    onChange={(e) => setFormData({ ...formData, showPhone: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                  <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                    {formData.showPhone ? 'Visible' : 'Hidden'}
                  </span>
                </label>
              </div>
              <input
                type="tel"
                id="publicPhone"
                name="publicPhone"
                value={formData.publicPhone}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="+1 (555) 123-4567"
              />
              <p className="mt-1 text-xs text-gray-400">Personal phone shown in vCard as CELL type</p>
            </div>
          </div>
        </div>

        {/* Company Contact Section */}
        <div className="mb-6">
          <h4 className="text-md font-medium mb-3 text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
            </svg>
            Company Contact
          </h4>
          <div className="space-y-4">
            {/* Company Email with Toggle */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="companyEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Company Email
                </label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="showCompanyEmail"
                    checked={formData.showCompanyEmail ?? true}
                    onChange={(e) => setFormData({ ...formData, showCompanyEmail: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                    {formData.showCompanyEmail ? 'Visible' : 'Hidden'}
                  </span>
                </label>
              </div>
              <input
                type="email"
                id="companyEmail"
                name="companyEmail"
                value={formData.companyEmail || ''}
                onChange={handleChange}
                className={`mt-1 block w-full px-3 py-2 border ${
                  errors.companyEmail ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
                placeholder="john@company.com"
              />
              {errors.companyEmail && <p className="mt-1 text-sm text-red-600">{errors.companyEmail}</p>}
              <p className="mt-1 text-xs text-gray-400">Work email shown in vCard as WORK type</p>
            </div>

            {/* Company Phone with Toggle */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="companyPhone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Company Phone
                </label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="showCompanyPhone"
                    checked={formData.showCompanyPhone ?? true}
                    onChange={(e) => setFormData({ ...formData, showCompanyPhone: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                    {formData.showCompanyPhone ? 'Visible' : 'Hidden'}
                  </span>
                </label>
              </div>
              <input
                type="tel"
                id="companyPhone"
                name="companyPhone"
                value={formData.companyPhone || ''}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="+1 (555) 987-6543"
              />
              <p className="mt-1 text-xs text-gray-400">Work phone shown in vCard as WORK type</p>
            </div>
          </div>
        </div>

        {/* Website Section */}
        <div className="space-y-4">
          {/* Website with Toggle */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="website" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Website
              </label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="showWebsite"
                  checked={formData.showWebsite ?? true}
                  onChange={(e) => setFormData({ ...formData, showWebsite: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                  {formData.showWebsite ? 'Visible' : 'Hidden'}
                </span>
              </label>
            </div>
            <input
              type="url"
              id="website"
              name="website"
              value={formData.website}
              onChange={handleChange}
              className={`mt-1 block w-full px-3 py-2 border ${
                errors.website ? 'border-red-300' : 'border-gray-300'
              } rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
              placeholder="https://example.com"
            />
            {errors.website && <p className="mt-1 text-sm text-red-600">{errors.website}</p>}
            <p className="mt-1 text-xs text-gray-400">Visitors can click to visit your website</p>
          </div>
        </div>
      </div>

      {/* Publishing Controls (T044) */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Privacy & Visibility</h3>

        <div className="space-y-4">
          {/* Publish Toggle */}
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                type="checkbox"
                id="published"
                name="published"
                checked={formData.published}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
            </div>
            <div className="ml-3">
              <label htmlFor="published" className="font-medium text-gray-700 dark:text-gray-300">
                Make profile public
              </label>
              <p className="text-sm text-gray-500">
                When enabled, your profile will be accessible at /u/{formData.username || 'username'}
              </p>
            </div>
          </div>

          {/* Indexing Opt-In */}
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                type="checkbox"
                id="indexingOptIn"
                name="indexingOptIn"
                checked={formData.indexingOptIn}
                onChange={handleChange}
                disabled={!formData.published}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
              />
            </div>
            <div className="ml-3">
              <label
                htmlFor="indexingOptIn"
                className={`font-medium ${
                  formData.published ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400'
                }`}
              >
                Allow search engine indexing
              </label>
              <p className="text-sm text-gray-500">
                Let search engines like Google index your profile (requires profile to be public)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-6 border-t">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={usernameChecking || usernameAvailable === false}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {mode === 'create' ? 'Create Profile' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
};

export default ProfileForm;
