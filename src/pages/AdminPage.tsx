import React, { useState, useEffect } from 'react';
import { getAllCachedTerms, cacheTerm } from '../lib/db';
import { TermDefinition } from '../types';
import { ArrowLeft, CheckCircle, XCircle, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AdminPageProps {
  theme: 'light' | 'dark';
}

const AdminPage: React.FC<AdminPageProps> = ({ theme }) => {
  const [terms, setTerms] = useState<TermDefinition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'suggested' | 'moderated'>('all');
  
  // Load all terms on mount
  useEffect(() => {
    const loadTerms = async () => {
      try {
        setIsLoading(true);
        const allTerms = await getAllCachedTerms();
        setTerms(allTerms.sort((a, b) => {
          // Sort by suggested first, then by creation date (newest first)
          if ((a.suggested && b.suggested) || (!a.suggested && !b.suggested)) {
            return new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime();
          }
          return a.suggested ? -1 : 1;
        }));
      } catch (error) {
        console.error('Error loading terms:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTerms();
  }, []);
  
  // Filter terms based on selected filter
  const filteredTerms = terms.filter(term => {
    if (filter === 'all') return true;
    if (filter === 'suggested') return term.suggested === true;
    if (filter === 'moderated') return term.moderated === true;
    return true;
  });
  
  // Approve a term
  const handleApproveTerm = async (term: TermDefinition) => {
    try {
      const updatedTerm = { ...term, moderated: true, suggested: false };
      await cacheTerm(term.term, updatedTerm);
      
      // Update local state
      setTerms(terms.map(t => 
        t.term === term.term ? updatedTerm : t
      ));
    } catch (error) {
      console.error('Error approving term:', error);
    }
  };
  
  // Reject a term
  const handleRejectTerm = async (term: TermDefinition) => {
    try {
      const updatedTerm = { ...term, moderated: false, suggested: false };
      await cacheTerm(term.term, updatedTerm);
      
      // Update local state
      setTerms(terms.map(t => 
        t.term === term.term ? updatedTerm : t
      ));
    } catch (error) {
      console.error('Error rejecting term:', error);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center">
            <Link to="/" className="flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Dictionary
            </Link>
            <h1 className="ml-4 text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          </div>
        </div>
      </header>
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter controls */}
        <div className="mb-6 flex items-center">
          <Filter className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
          <span className="mr-3 text-gray-700 dark:text-gray-300">Filter:</span>
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-full text-sm ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('suggested')}
              className={`px-3 py-1 rounded-full text-sm ${
                filter === 'suggested'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Suggested
            </button>
            <button
              onClick={() => setFilter('moderated')}
              className={`px-3 py-1 rounded-full text-sm ${
                filter === 'moderated'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Approved
            </button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredTerms.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-500 dark:text-gray-400">No terms found matching the current filter.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredTerms.map((term, index) => (
              <div 
                key={index}
                className={`bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden ${
                  term.suggested ? 'border-l-4 border-yellow-500' : 
                  term.moderated ? 'border-l-4 border-green-500' : ''
                }`}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{term.term}</h2>
                    <div className="flex space-x-2">
                      {term.suggested && (
                        <>
                          <button
                            onClick={() => handleApproveTerm(term)}
                            className="p-1 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300"
                            title="Approve"
                          >
                            <CheckCircle className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleRejectTerm(term)}
                            className="p-1 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                            title="Reject"
                          >
                            <XCircle className="h-5 w-5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-gray-700 dark:text-gray-300 mb-3">{term.purpose}</p>
                  
                  <div className="mb-3">
                    <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">Why:</h3>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      {term.why.map((reason, idx) => (
                        <li key={idx} className="text-gray-700 dark:text-gray-300">{reason}</li>
                      ))}
                    </ul>
                  </div>
                  
                  {term.createdAt && (
                    <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                      Added: {new Date(term.createdAt).toLocaleString()}
                    </div>
                  )}
                  
                  {term.suggested && (
                    <div className="mt-2 inline-block bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 text-xs px-2 py-1 rounded">
                      Awaiting approval
                    </div>
                  )}
                  
                  {term.moderated && (
                    <div className="mt-2 inline-block bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs px-2 py-1 rounded">
                      Approved
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminPage;