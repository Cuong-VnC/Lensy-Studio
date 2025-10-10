import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Use a lazy initializer for useState to read from localStorage only once on initial load.
  // This prevents UI flicker by setting the correct theme state from the very first render.
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('theme') === 'dark') {
      return 'dark';
    }
    return 'light'; // Default to light mode
  });

  // This effect is the single source of truth for all side effects related to the theme.
  // It runs whenever the `theme` state changes.
  useEffect(() => {
    const root = window.document.documentElement;

    // 1. Update the class on the <html> element for Tailwind CSS
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // 2. Save the user's preference to localStorage
    try {
      localStorage.setItem('theme', theme);
    } catch (e) {
      console.error('Failed to save theme to localStorage', e);
    }
  }, [theme]); // The effect re-runs only when the theme state changes.

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
