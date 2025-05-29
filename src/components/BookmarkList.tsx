import React, { useState, useEffect } from 'react';
import { getBookmarks } from '../lib/db';
import { BookmarkItem } from '../types';
import { Bookmark, X } from 'lucide-react';

interface BookmarkListProps {
  onSelectBookmark: (term: string) => void;
}

const BookmarkList: React.FC<BookmarkListProps> = ({ onSelectBookmark }) => {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Load bookmarks from IndexedDB
  useEffect(() => {
    const loadBookmarks = async () => {
      try {
        const items = await getBookmarks();
        setBookmarks(items.sort((a, b) => 
          new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
        ));
      } catch (error) {
        console.error('Error loading bookmarks:', error);
      }
    };

    loadBookmarks();
  }, []);

  // Refresh bookmarks when the drawer is opened
  useEffect(() => {
    if (isOpen) {
      const loadBookmarks = async () => {
        try {
          const items = await getBookmarks();
          setBookmarks(items.sort((a, b) => 
            new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
          ));
        } catch (error) {
          console.error('Error loading bookmarks:', error);
        }
      };

      loadBookmarks();
    }
  }, [isOpen]);

  const toggleDrawer = () => {
    setIsOpen(!isOpen);
  };

  const handleSelectBookmark = (term: string) => {
    onSelectBookmark(term);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Bookmark button */}
      <button
        onClick={toggleDrawer}
        className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 relative"
        aria-label="View bookmarks"
      >
        <Bookmark className="h-5 w-5" />
        {bookmarks.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
            {bookmarks.length}
          </span>
        )}
      </button>

      {/* Bookmarks drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-end">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={toggleDrawer}
          ></div>

          {/* Drawer */}
          <div className="relative bg-white dark:bg-gray-800 w-full max-w-xs h-full overflow-auto shadow-xl transform transition-all ease-in-out duration-300">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Bookmarked Terms</h2>
              <button
                onClick={toggleDrawer}
                className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {bookmarks.length === 0 ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                <p>No bookmarks yet.</p>
                <p className="mt-2 text-sm">Bookmark React terms to quickly access them later.</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {bookmarks.map((bookmark) => (
                  <li key={bookmark.id}>
                    <button
                      className="w-full text-left p-4 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      onClick={() => handleSelectBookmark(bookmark.term)}
                    >
                      <div className="font-medium text-gray-900 dark:text-white">{bookmark.term}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(bookmark.addedAt).toLocaleDateString()}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BookmarkList;