/**
 * ContactFormEditor Component
 * Builder interface for creating embeddable contact forms
 * Features: field selector, reordering, recipient email, customization
 */

import React, { useState, useEffect } from 'react';
import { ContactFormConfig, ContactFormField } from '@/types/modernProfile.types';

interface ContactFormEditorProps {
  config?: ContactFormConfig;
  onChange: (config: ContactFormConfig) => void;
}

const DEFAULT_FIELDS = [
  { id: 'name', type: 'text' as const, label: 'Name', required: true, order: 0 },
  { id: 'email', type: 'email' as const, label: 'Email', required: true, order: 1 },
  { id: 'message', type: 'textarea' as const, label: 'Message', required: true, order: 2 }
];

const AVAILABLE_FIELDS = [
  { id: 'name', type: 'text' as const, label: 'Name', required: true, placeholder: 'Your name' },
  { id: 'email', type: 'email' as const, label: 'Email', required: true, placeholder: 'your@email.com' },
  { id: 'phone', type: 'phone' as const, label: 'Phone', required: false, placeholder: '+1 (555) 000-0000' },
  { id: 'subject', type: 'text' as const, label: 'Subject', required: false, placeholder: 'Message subject' },
  { id: 'message', type: 'textarea' as const, label: 'Message', required: true, placeholder: 'Your message here...' }
];

export const ContactFormEditor: React.FC<ContactFormEditorProps> = ({
  config,
  onChange
}) => {
  const [recipientEmail, setRecipientEmail] = useState(config?.recipientEmail || '');
  const [fields, setFields] = useState<ContactFormField[]>(
    config?.fields || DEFAULT_FIELDS
  );
  const [submitButtonText, setSubmitButtonText] = useState(
    config?.submitButtonText || 'Send Message'
  );
  const [successMessage, setSuccessMessage] = useState(
    config?.successMessage || 'Thanks for reaching out! We\'ll get back to you soon.'
  );
  const [useRecaptcha, setUseRecaptcha] = useState(config?.recaptchaSiteKey ? true : false);
  const [draggedFieldId, setDraggedFieldId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Sync changes to parent
  useEffect(() => {
    const newConfig: ContactFormConfig = {
      recipientEmail,
      fields: fields.sort((a, b) => a.order - b.order),
      submitButtonText,
      successMessage,
      ...(useRecaptcha && { recaptchaSiteKey: 'RECAPTCHA_SITE_KEY' }) // Placeholder
    };
    onChange(newConfig);
  }, [recipientEmail, fields, submitButtonText, successMessage, useRecaptcha, onChange]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!recipientEmail.trim()) {
      newErrors.recipientEmail = 'Recipient email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail)) {
      newErrors.recipientEmail = 'Invalid email address';
    }

    if (fields.length === 0) {
      newErrors.fields = 'At least one field is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const toggleField = (fieldId: string) => {
    const fieldExists = fields.find(f => f.id === fieldId);

    if (fieldExists) {
      // Remove field
      setFields(fields.filter(f => f.id !== fieldId));
    } else {
      // Add field
      const availableField = AVAILABLE_FIELDS.find(f => f.id === fieldId);
      if (availableField) {
        const newField: ContactFormField = {
          ...availableField,
          order: Math.max(...fields.map(f => f.order), -1) + 1
        };
        setFields([...fields, newField]);
      }
    }
  };

  const handleDragStart = (fieldId: string) => {
    setDraggedFieldId(fieldId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetFieldId: string) => {
    if (!draggedFieldId || draggedFieldId === targetFieldId) return;

    const draggedIdx = fields.findIndex(f => f.id === draggedFieldId);
    const targetIdx = fields.findIndex(f => f.id === targetFieldId);

    const reordered = [...fields];
    const [dragged] = reordered.splice(draggedIdx, 1);
    reordered.splice(targetIdx, 0, dragged);

    // Update order values
    const updatedFields = reordered.map((field, idx) => ({
      ...field,
      order: idx
    }));

    setFields(updatedFields);
    setDraggedFieldId(null);
  };

  const getFieldLabel = (fieldId: string): string => {
    return AVAILABLE_FIELDS.find(f => f.id === fieldId)?.label || fieldId;
  };

  const getFieldIcon = (fieldType: string): string => {
    switch (fieldType) {
      case 'text':
        return '✎';
      case 'email':
        return '✉';
      case 'phone':
        return '☎';
      case 'textarea':
        return '☰';
      case 'select':
        return '▼';
      default:
        return '■';
    }
  };

  return (
    <div className="space-y-6">
      {/* Recipient Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Recipient Email <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          value={recipientEmail}
          onChange={(e) => {
            setRecipientEmail(e.target.value);
            if (errors.recipientEmail) {
              setErrors({ ...errors, recipientEmail: '' });
            }
          }}
          placeholder="your@email.com"
          className={`w-full px-4 py-3 rounded-xl border bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
            errors.recipientEmail
              ? 'border-red-500 dark:border-red-400'
              : 'border-gray-300 dark:border-gray-600'
          }`}
        />
        {errors.recipientEmail && (
          <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.recipientEmail}</p>
        )}
      </div>

      {/* Form Fields Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Form Fields {errors.fields && <span className="text-red-500 text-xs ml-1">{errors.fields}</span>}
        </label>
        <div className="space-y-2 bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4">
          {AVAILABLE_FIELDS.map((field) => {
            const isSelected = fields.some(f => f.id === field.id);
            const isRequired = field.required;

            return (
              <label
                key={field.id}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-white dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleField(field.id)}
                  disabled={isRequired && isSelected}
                  className="w-4 h-4 rounded border-gray-300 text-purple-500 focus:ring-purple-500 dark:border-gray-600"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex-1">
                  {field.label}
                </span>
                {isRequired && (
                  <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded">
                    Required
                  </span>
                )}
              </label>
            );
          })}
        </div>
      </div>

      {/* Selected Fields Reorder */}
      {fields.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Field Order (drag to reorder)
          </label>
          <div className="space-y-2 bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4">
            {fields
              .sort((a, b) => a.order - b.order)
              .map((field) => (
                <div
                  key={field.id}
                  draggable
                  onDragStart={() => handleDragStart(field.id)}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(field.id)}
                  className={`p-3 rounded-lg bg-white dark:bg-gray-700 border-2 cursor-move transition-all flex items-center gap-3 ${
                    draggedFieldId === field.id
                      ? 'opacity-50 border-purple-500'
                      : 'border-gray-200 dark:border-gray-600 hover:border-purple-500'
                  }`}
                >
                  <div className="text-lg text-gray-400 dark:text-gray-600">☰</div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex-1">
                    {field.label}
                  </span>
                  {field.required && (
                    <span className="text-xs text-red-600 dark:text-red-400">Required</span>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Submit Button Text */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Submit Button Text
        </label>
        <input
          type="text"
          value={submitButtonText}
          onChange={(e) => setSubmitButtonText(e.target.value)}
          placeholder="Send Message"
          className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>

      {/* Success Message */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Success Message
        </label>
        <textarea
          value={successMessage}
          onChange={(e) => setSuccessMessage(e.target.value)}
          placeholder="Thank you for your message!"
          rows={3}
          className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
        />
      </div>

      {/* reCAPTCHA Toggle */}
      <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            Enable reCAPTCHA v3
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Helps prevent spam submissions
          </p>
        </div>
        <button
          type="button"
          onClick={() => setUseRecaptcha(!useRecaptcha)}
          className={`relative w-12 h-7 rounded-full transition-colors ${
            useRecaptcha
              ? 'bg-purple-500'
              : 'bg-gray-300 dark:bg-gray-600'
          }`}
        >
          <div
            className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
              useRecaptcha ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Form Preview */}
      <div className="bg-gray-50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-600 rounded-xl p-4">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Form Preview
        </p>
        <div className="space-y-3 max-w-sm">
          {fields
            .sort((a, b) => a.order - b.order)
            .map((field) => (
              <div key={field.id}>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </label>
                {field.type === 'textarea' ? (
                  <textarea
                    disabled
                    placeholder={field.placeholder}
                    rows={3}
                    className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed resize-none"
                  />
                ) : (
                  <input
                    disabled
                    type={field.type === 'phone' ? 'tel' : field.type}
                    placeholder={field.placeholder}
                    className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                  />
                )}
              </div>
            ))}
          <button
            disabled
            className="w-full px-4 py-2 rounded-lg bg-purple-500 text-white text-sm font-medium cursor-not-allowed opacity-75"
          >
            {submitButtonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContactFormEditor;
