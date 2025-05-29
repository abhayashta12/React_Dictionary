import React, { useState } from 'react';
import { suggestTerm } from '../lib/api';
import { X } from 'lucide-react';

interface SuggestionFormProps {
  onClose: () => void;
}

const SuggestionForm: React.FC<SuggestionFormProps> = ({ onClose }) => {
  const [term, setTerm] = useState('');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!term.trim()) {
      setResult({ success: false, message: 'Please enter a term' });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await suggestTerm(term, details);
      setResult(response);
      
      if (response.success) {
        setTerm('');
        setDetails('');
        
        // Close modal after successful submission
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } catch (error) {
      setResult({ success: false, message: 'An error occurred while submitting your suggestion' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose}></div>
      
      {/* Modal */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-auto transform transition-all">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Suggest a React Term
            </h3>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          {/* Content */}
          <div className="p-4">
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="term" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  React Term *
                </label>
                <input
                  type="text"
                  id="term"
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., useEffect, React.memo, Suspense"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="details" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Additional Details
                </label>
                <textarea
                  id="details"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Please describe what you're looking for or provide any additional context"
                ></textarea>
              </div>
              
              {result && (
                <div className={`p-3 mb-4 rounded-md ${
                  result.success 
                    ? 'bg-green-100 dark:bg-green-800/30 text-green-800 dark:text-green-200' 
                    : 'bg-red-100 dark:bg-red-800/30 text-red-800 dark:text-red-200'
                }`}>
                  {result.message}
                </div>
              )}
              
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="mr-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuggestionForm;