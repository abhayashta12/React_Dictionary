import { TermDefinition } from '../types';

// In-memory cache
const memoryCache = new Map<string, TermDefinition>();

export const fetchDefinition = async (term: string): Promise<TermDefinition | null> => {
  if (!term.trim()) return null;

  try {
    // Normalize the term
    const normalizedTerm = term.trim().toLowerCase();
    
    // Check memory cache first
    if (memoryCache.has(normalizedTerm)) {
      return memoryCache.get(normalizedTerm) || null;
    }
    
    // Fetch from API
    const response = await fetch(`/api/define?term=${encodeURIComponent(normalizedTerm)}`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Cache the result in memory
    memoryCache.set(normalizedTerm, data);
    
    return data;
  } catch (error) {
    console.error('Error fetching definition:', error);
    return null;
  }
};

export const suggestTerm = async (term: string, details: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await fetch('/api/suggest', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ term, details }),
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error suggesting term:', error);
    return { success: false, message: 'Failed to submit suggestion' };
  }
};