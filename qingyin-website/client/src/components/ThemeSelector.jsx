import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

const ThemeSelector = () => {
  const { themeColor, updateTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const themeColors = [
    { name: '粉色', value: 'pink', color: '#ff9eb5' },
    { name: '红色', value: 'red', color: '#f44336' },
    { name: '蓝色', value: 'blue', color: '#2196f3' },
    { name: '黄色', value: 'yellow', color: '#ffeb3b' },
    { name: '青色', value: 'cyan', color: '#00bcd4' },
    { name: '紫色', value: 'purple', color: '#9c27b0' },
    { name: '黑色', value: 'black', color: '#333333' }
  ];

  const handleThemeChange = (color) => {
    updateTheme(color);
    setIsOpen(false);
  };

  return (
    <div className="theme-selector">
      <button 
        className="theme-toggle"
        onClick={() => setIsOpen(!isOpen)}
        style={{ backgroundColor: themeColors.find(t => t.value === themeColor)?.color }}
      >
        主题
      </button>
      
      {isOpen && (
        <div className="theme-dropdown">
          {themeColors.map(theme => (
            <div
              key={theme.value}
              className={`theme-option ${theme.value === themeColor ? 'active' : ''}`}
              style={{ backgroundColor: theme.color }}
              onClick={() => handleThemeChange(theme.value)}
              title={theme.name}
            >
              {theme.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ThemeSelector;