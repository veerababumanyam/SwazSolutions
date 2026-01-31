/**
 * FileDownloadEditor Component
 * File upload and download manager with metadata and optional security features
 * Features: drag-drop upload, file metadata, password protection, expiration dates
 */

import React, { useState, useRef, useEffect } from 'react';
import { FileDownloadConfig } from '@/types/modernProfile.types';

interface FileDownloadEditorProps {
  config?: FileDownloadConfig;
  onChange: (config: FileDownloadConfig) => void;
  linkId?: string;
}

const SUPPORTED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/zip',
  'application/x-zip-compressed'
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const FILE_ICONS: Record<string, string> = {
  'application/pdf': '📄',
  'application/msword': '📝',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '📝',
  'application/vnd.ms-excel': '📊',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '📊',
  'application/zip': '📦',
  'application/x-zip-compressed': '📦'
};

export const FileDownloadEditor: React.FC<FileDownloadEditorProps> = ({
  config,
  onChange,
  linkId
}) => {
  const [fileUrl, setFileUrl] = useState(config?.fileUrl || '');
  const [fileName, setFileName] = useState(config?.fileName || '');
  const [fileSize, setFileSize] = useState(config?.fileSize);
  const [mimeType, setMimeType] = useState(config?.mimeType || '');
  const [displayName, setDisplayName] = useState(config?.displayName || '');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState(config?.mimeType ? FILE_ICONS[config.mimeType] || '📥' : '📥');
  const [passwordProtected, setPasswordProtected] = useState(!!config?.password);
  const [password, setPassword] = useState(config?.password || '');
  const [expiresAt, setExpiresAt] = useState(config?.expiresAt || '');
  const [trackDownloads, setTrackDownloads] = useState(config?.trackDownloads !== false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync changes to parent
  useEffect(() => {
    const newConfig: FileDownloadConfig = {
      fileUrl,
      fileName,
      ...(fileSize && { fileSize }),
      ...(mimeType && { mimeType }),
      ...(displayName && { displayName }),
      ...(password && { password }),
      ...(expiresAt && { expiresAt }),
      trackDownloads
    };
    onChange(newConfig);
  }, [fileUrl, fileName, fileSize, mimeType, displayName, password, expiresAt, trackDownloads, onChange]);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    setError(null);
    setSuccess(null);

    // Validate file type
    if (!SUPPORTED_TYPES.includes(file.type)) {
      setError('Unsupported file type. Supported: PDF, DOC, DOCX, XLS, XLSX, ZIP');
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setError('File exceeds 10MB limit');
      return;
    }

    // Prepare file data
    setFileName(file.name);
    setMimeType(file.type);
    setFileSize(file.size);
    setDisplayName(file.name.replace(/\.[^/.]+$/, '')); // Remove extension
    setIcon(FILE_ICONS[file.type] || '📥');

    // Upload file
    await uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    if (!linkId) {
      setError('Link ID required for upload');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(percentComplete);
        }
      });

      // Handle completion
      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          setFileUrl(response.fileUrl);
          setSuccess('File uploaded successfully');
          setTimeout(() => setSuccess(null), 3000);
        } else {
          setError('Upload failed');
        }
        setUploading(false);
      });

      xhr.addEventListener('error', () => {
        setError('Upload error occurred');
        setUploading(false);
      });

      xhr.addEventListener('abort', () => {
        setError('Upload cancelled');
        setUploading(false);
      });

      xhr.open('POST', `/api/profiles/me/files/${linkId}/upload`);
      xhr.withCredentials = true;
      xhr.send(formData);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload file');
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileTypeLabel = (mime: string): string => {
    const labels: Record<string, string> = {
      'application/pdf': 'PDF Document',
      'application/msword': 'Word Document',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word Document',
      'application/vnd.ms-excel': 'Excel Spreadsheet',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel Spreadsheet',
      'application/zip': 'ZIP Archive',
      'application/x-zip-compressed': 'ZIP Archive'
    };
    return labels[mime] || 'File';
  };

  const getMinExpirationDate = (): string => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <div className="space-y-6">
      {/* File Upload Zone */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Upload File <span className="text-red-500">*</span>
        </label>
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
            uploading
              ? 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-purple-500 dark:hover:border-purple-400 cursor-pointer'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.zip"
            onChange={(e) => handleFileSelect(e.target.files)}
            disabled={uploading}
            className="hidden"
            id="file-upload"
          />

          {uploading ? (
            <div className="space-y-3">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/20">
                <svg className="animate-spin w-6 h-6 text-purple-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Uploading...</p>
                <div className="mt-2 w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div
                    className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{uploadProgress}%</p>
              </div>
            </div>
          ) : (
            <label htmlFor="file-upload" className="cursor-pointer">
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                  <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Drop file here or click to upload
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    PDF, DOC, DOCX, XLS, XLSX, ZIP (max 10MB)
                  </p>
                </div>
              </div>
            </label>
          )}
        </div>
      </div>

      {/* File Info Card */}
      {fileUrl && fileName && (
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-4">
          <div className="flex items-start gap-4">
            <div className="text-3xl flex-shrink-0">{icon}</div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {getFileTypeLabel(mimeType)}
              </p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white break-all">
                {fileName}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {fileSize ? formatFileSize(fileSize) : 'Size unknown'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setFileUrl('');
                setFileName('');
                setFileSize(undefined);
                setMimeType('');
                setError(null);
              }}
              className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
              title="Remove file"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
          <p className="text-sm text-green-600 dark:text-green-400">{success}</p>
        </div>
      )}

      {/* Display Customization */}
      <div className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Download Button Label
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Download Resume"
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Leave empty to use filename
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description (optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Additional info about this file..."
            rows={2}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
          />
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Track Downloads
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Count how many times this file is downloaded
            </p>
          </div>
          <button
            type="button"
            onClick={() => setTrackDownloads(!trackDownloads)}
            className={`relative w-12 h-7 rounded-full transition-colors ${
              trackDownloads
                ? 'bg-purple-500'
                : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <div
              className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
                trackDownloads ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Security Settings */}
      <div className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Password Protect
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Require password to download
            </p>
          </div>
          <button
            type="button"
            onClick={() => setPasswordProtected(!passwordProtected)}
            className={`relative w-12 h-7 rounded-full transition-colors ${
              passwordProtected
                ? 'bg-purple-500'
                : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <div
              className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
                passwordProtected ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {passwordProtected && (
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Set a password"
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        )}
      </div>

      {/* Expiration Date */}
      <div className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4">
        <label className="block">
          <div className="flex items-center gap-2 mb-2">
            <input
              type="checkbox"
              checked={!!expiresAt}
              onChange={(e) => {
                if (e.target.checked) {
                  const tomorrow = new Date();
                  tomorrow.setDate(tomorrow.getDate() + 30);
                  setExpiresAt(tomorrow.toISOString().split('T')[0]);
                } else {
                  setExpiresAt('');
                }
              }}
              className="w-4 h-4 rounded border-gray-300 text-purple-500 focus:ring-purple-500 dark:border-gray-600"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Expiration Date
            </span>
          </div>
        </label>

        {expiresAt && (
          <input
            type="date"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            min={getMinExpirationDate()}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        )}
      </div>

      {/* Download Preview */}
      {fileUrl && fileName && (
        <div className="bg-gray-50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-600 rounded-xl p-4">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Download Button Preview
          </p>
          <div className="max-w-sm">
            {description && (
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                {description}
              </p>
            )}
            <button
              disabled
              className="w-full px-4 py-3 rounded-xl bg-purple-500 text-white font-medium cursor-not-allowed opacity-75 flex items-center justify-center gap-2"
            >
              <span>{icon}</span>
              <span>{displayName || fileName}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileDownloadEditor;
