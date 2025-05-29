import React, { useState } from 'react';
import { Bookmark, CopyCheck, Copy } from 'lucide-react';
import { TermDefinition } from '../types';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { vs2015, docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { addBookmark, removeBookmark, isBookmarked } from '../lib/db';

interface ResultCardProps {
  definition: TermDefinition;
  onBookmarkToggle: () => void;
  theme: 'light' | 'dark';
}

const ResultCard: React.FC<ResultCardProps> = ({ definition, onBookmarkToggle, theme }) => {
  const [copied, setCopied] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  
  // Check if the term is bookmarked
  React.useEffect(() => {
    const checkBookmark = async () => {
      const id = definition.term.toLowerCase().replace(/\s+/g, '-');
      const isMarked = await isBookmarked(id);
      setBookmarked(isMarked);
    };
    
    checkBookmark();
  }, [definition.term]);
  
  // Copy code to clipboard
  const handleCopyCode = () => {
    navigator.clipboard.writeText(definition.code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  
  // Toggle bookmark status
  const handleToggleBookmark = async () => {
    try {
      const id = definition.term.toLowerCase().replace(/\s+/g, '-');
      
      if (bookmarked) {
        await removeBookmark(id);
      } else {
        await addBookmark(definition.term, id);
      }
      
      setBookmarked(!bookmarked);
      onBookmarkToggle();
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-all duration-200 transform hover:shadow-lg">
      <div className="p-6">
        {/* Header with term and bookmark button */}
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{definition.term}</h2>
          <button
            onClick={handleToggleBookmark}
            className={`p-2 rounded-full transition-colors ${
              bookmarked 
                ? 'text-yellow-500 hover:text-yellow-600' 
                : 'text-gray-400 hover:text-yellow-500'
            }`}
            aria-label={bookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}
          >
            <Bookmark className={`h-5 w-5 ${bookmarked ? 'fill-current' : ''}`} />
          </button>
        </div>
        
        {/* Purpose */}
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">{definition.purpose}</p>
        
        {/* Why section */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Why use it:</h3>
          <ul className="list-disc pl-5 space-y-1">
            {definition.why.map((reason, index) => (
              <li key={index} className="text-gray-700 dark:text-gray-300">{reason}</li>
            ))}
          </ul>
        </div>
        
        {/* Example */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Example:</h3>
          <p className="text-gray-700 dark:text-gray-300">{definition.example}</p>
        </div>
        
        {/* Code snippet */}
        <div className="mb-6 relative">
          <div className="absolute right-2 top-2 z-10">
            <button
              onClick={handleCopyCode}
              className="p-2 bg-gray-800 dark:bg-gray-700 text-white rounded-md hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
              aria-label="Copy code"
            >
              {copied ? <CopyCheck className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
          <SyntaxHighlighter
            language="javascript"
            style={theme === 'dark' ? vs2015 : docco}
            customStyle={{
              borderRadius: '0.5rem',
              padding: '1rem',
              fontSize: '0.9rem',
              lineHeight: 1.5
            }}
          >
            {definition.code}
          </SyntaxHighlighter>
        </div>
        
        {/* Summary */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <p className="italic text-gray-600 dark:text-gray-400">{definition.summary}</p>
        </div>
      </div>
    </div>
  );
};

export default ResultCard;