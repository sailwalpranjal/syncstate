'use client';

import { useState } from 'react';
import { X, FileText, Sparkles, ChevronLeft } from 'lucide-react';
import { documentTemplates, type DocumentTemplate } from '@/lib/templates';

interface CreateDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (title: string, templateId?: string) => Promise<void>;
}

export function CreateDocumentModal({
  isOpen,
  onClose,
  onCreate,
}: CreateDocumentModalProps) {
  const [title, setTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [step, setStep] = useState<'template' | 'title'>('template');
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);

  if (!isOpen) return null;

  const handleTemplateSelect = (template: DocumentTemplate) => {
    setSelectedTemplate(template);
    setTitle(template.name === 'Blank Document' ? '' : template.name);
    setStep('title');
  };

  const handleBack = () => {
    setStep('template');
    setSelectedTemplate(null);
    setTitle('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isCreating) return;

    setIsCreating(true);
    try {
      await onCreate(title.trim(), selectedTemplate?.id);
      setTitle('');
      setSelectedTemplate(null);
      setStep('template');
      onClose();
    } catch (error) {
      console.error('Error creating document:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    if (!isCreating) {
      setTitle('');
      setSelectedTemplate(null);
      setStep('template');
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fade-in"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl max-w-2xl w-full pointer-events-auto animate-scale-in border border-neutral-200 dark:border-neutral-800 max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center gap-3">
              {step === 'title' && (
                <button
                  onClick={handleBack}
                  className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
                </button>
              )}
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                  {step === 'template' ? 'Choose a Template' : 'Name Your Document'}
                </h2>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  {step === 'template' ? 'Start with a template or blank document' : 'Give your document a memorable name'}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={isCreating}
              className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto">
            {step === 'template' ? (
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {documentTemplates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => handleTemplateSelect(template)}
                      className="group text-left p-4 bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-750 border border-neutral-200 dark:border-neutral-700 hover:border-primary-500 dark:hover:border-primary-500 rounded-xl transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{template.icon}</span>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-neutral-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                            {template.name}
                          </h3>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1 line-clamp-2">
                            {template.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Template Preview */}
                {selectedTemplate && (
                  <div className="flex items-center gap-3 p-4 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-xl">
                    <span className="text-2xl">{selectedTemplate.icon}</span>
                    <div>
                      <p className="text-sm font-medium text-primary-900 dark:text-primary-100">
                        Selected Template
                      </p>
                      <p className="text-xs text-primary-700 dark:text-primary-300">
                        {selectedTemplate.name}
                      </p>
                    </div>
                  </div>
                )}

                {/* Input */}
                <div>
                  <label
                    htmlFor="document-title"
                    className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2"
                  >
                    Document Title
                  </label>
                  <input
                    id="document-title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter a title..."
                    autoFocus
                    disabled={isCreating}
                    className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all disabled:opacity-50 text-neutral-900 dark:text-white placeholder-neutral-400"
                    maxLength={100}
                  />
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-neutral-500">
                      {title.length}/100 characters
                    </span>
                    {title.length > 50 && (
                      <span className="text-xs text-warning-500">
                        Keep it concise for better readability
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isCreating}
                    className="flex-1 px-4 py-3 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-xl hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors disabled:opacity-50 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!title.trim() || isCreating}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl hover:shadow-lg hover:shadow-primary-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {isCreating ? 'Creating...' : 'Create Document'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
