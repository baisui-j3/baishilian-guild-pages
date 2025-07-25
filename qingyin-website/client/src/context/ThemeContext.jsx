import React, { createContext, useContext, useState, useEffect } from 'react';
import { getTheme } from '../services/api';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [themeColor, setThemeColor] = useState('pink');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTheme = async () => {
      try {
        const data = await getTheme();
        setThemeColor(data.themeColor);
      } catch (err) {
        console.error('获取主题失败:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTheme();
  }, []);

  const updateTheme = (color) => {
    setThemeColor(color);
  };

  if (loading) {
    return <div>加载主题中...</div>;
  }

  return (
    <ThemeContext.Provider value={{ themeColor, updateTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme必须在ThemeProvider内使用');
  }
  return context;
};