type Theme = 'light' | 'dark';

export const getTheme = (): Theme => {
  if (typeof window !== 'undefined') {
    const savedTheme = localStorage.getItem('theme') as Theme;
    
    if (savedTheme) {
      return savedTheme;
    }
    
    // Check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  
  return 'light';
};

export const saveTheme = (theme: Theme): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('theme', theme);
    
    // Apply theme to document
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
};

export const toggleTheme = (): Theme => {
  const currentTheme = getTheme();
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  saveTheme(newTheme);
  return newTheme;
};

// Initialize theme on load
export const initTheme = (): void => {
  if (typeof window !== 'undefined') {
    const theme = getTheme();
    saveTheme(theme);
  }
};