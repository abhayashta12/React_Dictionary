import React, { useState, useRef, useEffect } from 'react';
import { Search, Mic, MicOff } from 'lucide-react';
import Fuse from 'fuse.js';
import { TermDefinition, SearchResult } from '../types';

interface SearchBarProps {
  onSearch: (term: string) => void;
  initialTerms: TermDefinition[];
  onSelectSuggestion: (term: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, initialTerms, onSelectSuggestion }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionRef = useRef<HTMLDivElement>(null);
  const fuseRef = useRef<Fuse<TermDefinition>>();
  
  // Check for speech recognition support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    setIsSpeechSupported(!!SpeechRecognition);
  }, []);
  
  // Initialize Fuse.js
  useEffect(() => {
    fuseRef.current = new Fuse(initialTerms, {
      keys: ['term'],
      threshold: 0.4,
      includeScore: true
    });
  }, [initialTerms]);
  
  // Handle search input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    
    if (value.trim().length > 1 && fuseRef.current) {
      const results = fuseRef.current.search(value).slice(0, 5);
      setSuggestions(results);
    } else {
      setSuggestions([]);
    }
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
      setSuggestions([]);
    }
  };
  
  // Handle voice search
  const toggleVoiceInput = () => {
    if (!isSpeechSupported) return;
    
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!isListening) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = 'en-US';
      
      recognition.onstart = () => setIsListening(true);
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        setIsListening(false);
        
        // Submit the search after a short delay
        setTimeout(() => {
          onSearch(transcript);
        }, 300);
      };
      
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      
      recognition.start();
    } else {
      setIsListening(false);
      // Would stop recognition here if we had a reference to it
    }
  };
  
  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node) &&
          searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
        setSuggestions([]);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  return (
    <div className="relative w-full max-w-xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center">
          <input
            ref={searchInputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder="Search React terms..."
            className="w-full py-3 px-4 pl-12 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            autoComplete="off"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          
          {isSpeechSupported && (
            <button
              type="button"
              onClick={toggleVoiceInput}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {isListening ? (
                <MicOff className="h-5 w-5 text-red-500 animate-pulse" />
              ) : (
                <Mic className="h-5 w-5 text-gray-400 hover:text-blue-500 transition-colors" />
              )}
            </button>
          )}
        </div>
      </form>
      
      {/* Suggestions dropdown */}
      {suggestions.length > 0 && (
        <div 
          ref={suggestionRef}
          className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 max-h-60 overflow-auto"
        >
          <ul className="py-1">
            {suggestions.map((result) => (
              <li 
                key={result.refIndex}
                className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                onClick={() => {
                  setQuery(result.item.term);
                  onSelectSuggestion(result.item.term);
                  setSuggestions([]);
                }}
              >
                <span className="font-medium">{result.item.term}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchBar;