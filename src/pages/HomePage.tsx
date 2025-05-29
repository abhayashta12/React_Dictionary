import React, { useState, useEffect } from 'react';
import { fetchDefinition } from '../lib/api';
import { getAllCachedTerms, cacheTerm } from '../lib/db';
import { TermDefinition } from '../types';
import SearchBar from '../components/SearchBar';
import ResultCard from '../components/ResultCard';
import DarkModeToggle from '../components/DarkModeToggle';
import BookmarkList from '../components/BookmarkList';
import SuggestionForm from '../components/SuggestionForm';
import { Book, PlusCircle, MessageSquare, GithubIcon } from 'lucide-react';

interface HomePageProps {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

const HomePage: React.FC<HomePageProps> = ({ theme, setTheme }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResult, setSearchResult] = useState<TermDefinition | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cachedTerms, setCachedTerms] = useState<TermDefinition[]>([]);
  const [showSuggestionForm, setShowSuggestionForm] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  
  // Load cached terms on mount
  useEffect(() => {
    const loadCachedTerms = async () => {
      try {
        const terms = await getAllCachedTerms();
        setCachedTerms(terms);
        
        // Load recent searches from localStorage
        const savedRecentSearches = localStorage.getItem('recentSearches');
        if (savedRecentSearches) {
          setRecentSearches(JSON.parse(savedRecentSearches));
        }
      } catch (error) {
        console.error('Error loading cached terms:', error);
      }
    };
    
    loadCachedTerms();
  }, []);
  
  // Update recent searches in localStorage
  useEffect(() => {
    localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
  }, [recentSearches]);
  
  // Handle search
  const handleSearch = async (term: string) => {
    if (!term.trim()) return;
    
    setSearchTerm(term);
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await fetchDefinition(term);
      
      if (result) {
        setSearchResult(result);
        
        // Cache the result
        await cacheTerm(term, result);
        
        // Update cached terms
        setCachedTerms((prev) => {
          const exists = prev.some((t) => t.term.toLowerCase() === term.toLowerCase());
          if (!exists) {
            return [...prev, result];
          }
          return prev;
        });
        
        // Add to recent searches
        setRecentSearches((prev) => {
          const filtered = prev.filter((t) => t.toLowerCase() !== term.toLowerCase());
          return [term, ...filtered].slice(0, 5);
        });
      } else {
        setSearchResult(null);
        setError(`No definition found for "${term}"`);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResult(null);
      setError('An error occurred while searching. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle bookmark toggle
  const handleBookmarkToggle = () => {
    // This will be called when a bookmark is added or removed
    // No need to do anything here as the UI will update automatically
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Book className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <h1 className="ml-2 text-2xl font-bold text-gray-900 dark:text-white">React Dictionary</h1>
            </div>
            <div className="flex items-center space-x-3">
              <BookmarkList onSelectBookmark={handleSearch} />
              <DarkModeToggle theme={theme} setTheme={setTheme} />
              <a 
                href="https://github.com/yourusername/react-dictionary" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                aria-label="View on GitHub"
              >
                <GithubIcon className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search section */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-center mb-6 text-gray-900 dark:text-white">
            Find definitions for React terms
          </h2>
          <SearchBar 
            onSearch={handleSearch} 
            initialTerms={cachedTerms} 
            onSelectSuggestion={handleSearch} 
          />
          
          {/* Recent searches */}
          {recentSearches.length > 0 && !searchResult && !isLoading && !error && (
            <div className="mt-4 flex flex-wrap justify-center">
              <span className="text-sm text-gray-500 dark:text-gray-400 mr-2 mt-2">Recent:</span>
              {recentSearches.map((term, index) => (
                <button
                  key={index}
                  onClick={() => handleSearch(term)}
                  className="m-1 px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-sm hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Results section */}
        <div className="mt-8">
          {isLoading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          )}
          
          {error && !isLoading && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
              <p className="text-red-500 dark:text-red-400 mb-4">{error}</p>
              <button
                onClick={() => setShowSuggestionForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Suggest this term
              </button>
            </div>
          )}
          
          {searchResult && !isLoading && (
            <ResultCard 
              definition={searchResult} 
              onBookmarkToggle={handleBookmarkToggle}
              theme={theme}
            />
          )}
          
          {!searchResult && !isLoading && !error && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Search for a React term above to see its definition.
              </p>
              <div className="flex justify-center">
                <button
                  onClick={() => setShowSuggestionForm(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Suggest a term
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
      
      {/* Suggest Term Modal */}
      {showSuggestionForm && (
        <SuggestionForm onClose={() => setShowSuggestionForm(false)} />
      )}
    </div>
  );
};

export default HomePage;