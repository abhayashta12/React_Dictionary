import { openDB } from 'idb';

export const dbPromise = openDB('react-dictionary', 1, {
  upgrade(db) {
    // Bookmarks store
    if (!db.objectStoreNames.contains('bookmarks')) {
      const bookmarkStore = db.createObjectStore('bookmarks', { keyPath: 'id' });
      bookmarkStore.createIndex('term', 'term', { unique: true });
    }
    
    // Terms store (for locally cached terms)
    if (!db.objectStoreNames.contains('terms')) {
      const termStore = db.createObjectStore('terms', { keyPath: 'id' });
      termStore.createIndex('term', 'term', { unique: true });
    }
  },
});

// Bookmark functions
export const addBookmark = async (term: string, id: string) => {
  const db = await dbPromise;
  return db.put('bookmarks', { 
    id, 
    term, 
    addedAt: new Date().toISOString() 
  });
};

export const removeBookmark = async (id: string) => {
  const db = await dbPromise;
  return db.delete('bookmarks', id);
};

export const getBookmarks = async () => {
  const db = await dbPromise;
  return db.getAll('bookmarks');
};

export const isBookmarked = async (id: string) => {
  const db = await dbPromise;
  const bookmark = await db.get('bookmarks', id);
  return !!bookmark;
};

// Terms cache functions
export const cacheTerm = async (term: string, definition: any) => {
  const db = await dbPromise;
  const id = term.toLowerCase().replace(/\s+/g, '-');
  return db.put('terms', { 
    ...definition,
    id, 
    term,
    createdAt: new Date().toISOString()
  });
};

export const getCachedTerm = async (term: string) => {
  const db = await dbPromise;
  const id = term.toLowerCase().replace(/\s+/g, '-');
  return db.get('terms', id);
};

export const getAllCachedTerms = async () => {
  const db = await dbPromise;
  return db.getAll('terms');
};