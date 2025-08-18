import { Theme } from '@/store/form';
import { prebuiltThemes } from './themes';

/**
 * Theme utility functions
 */

// Convert hex color to rgba with opacity
export const hexToRgba = (hex: string, opacity: number): string => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return hex;
  
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

// Generate CSS variables from theme
export const generateThemeCSSVars = (theme: Theme): Record<string, string> => {
  return {
    '--theme-bg': theme.backgroundColor,
    '--theme-form-bg': theme.formBackgroundColor,
    '--theme-question-color': theme.questionTextColor,
    '--theme-answer-color': theme.answerTextColor,
    '--theme-primary': theme.primaryColor,
    '--theme-button-text': theme.buttonTextColor,
    '--theme-border': theme.borderColor,
    '--theme-text': theme.textColor,
    '--theme-border-radius': `${theme.borderRadius}px`,
    '--theme-border-width': `${theme.borderWidth}px`,
    '--theme-font-family': theme.fontFamily,
    // Additional utility variables
    '--theme-primary-light': hexToRgba(theme.primaryColor, 0.1),
    '--theme-primary-medium': hexToRgba(theme.primaryColor, 0.2),
    '--theme-shadow': hexToRgba(theme.questionTextColor, 0.1),
  };
};

// Check if theme is dark
export const isDarkTheme = (theme: Theme): boolean => {
  // Simple heuristic: if background is darker than form background, it's likely dark
  const bgBrightness = getBrightness(theme.backgroundColor);
  return bgBrightness < 128;
};

// Get brightness of hex color (0-255)
export const getBrightness = (hex: string): number => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return 128; // fallback
  
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  
  // Standard formula for perceived brightness
  return (r * 299 + g * 587 + b * 114) / 1000;
};

// Get contrasting text color (black or white) for a background color
export const getContrastingColor = (backgroundColor: string): string => {
  const brightness = getBrightness(backgroundColor);
  return brightness > 128 ? '#000000' : '#FFFFFF';
};

// Suggest themes based on color preference
export const suggestThemes = (preferredColor?: string) => {
  if (!preferredColor) return prebuiltThemes.slice(0, 4);
  
  // Simple color matching logic
  const colorMap: Record<string, string[]> = {
    blue: ['default', 'ocean', 'electric', 'dark-modern'],
    green: ['forest', 'mint', 'paper'],
    purple: ['lavender', 'cosmic', 'dark-elegant'],
    pink: ['soft-pink', 'sunset'],
    orange: ['sunset', 'paper'],
    gray: ['minimalist-gray', 'paper', 'dark-modern'],
  };
  
  const matchingThemeIds = colorMap[preferredColor.toLowerCase()] || ['default'];
  return prebuiltThemes.filter(theme => 
    matchingThemeIds.includes(theme.id)
  );
};

// Theme validation
export const validateTheme = (theme: Partial<Theme>): string[] => {
  const errors: string[] = [];
  
  if (theme.borderRadius && (theme.borderRadius < 0 || theme.borderRadius > 50)) {
    errors.push('Border radius must be between 0 and 50px');
  }
  
  if (theme.borderWidth && (theme.borderWidth < 0 || theme.borderWidth > 10)) {
    errors.push('Border width must be between 0 and 10px');
  }
  
  // Validate hex colors
  const hexPattern = /^#[0-9A-F]{6}$/i;
  const colorFields = ['backgroundColor', 'formBackgroundColor', 'questionTextColor', 
                      'answerTextColor', 'primaryColor', 'buttonTextColor', 'borderColor', 'textColor'];
  
  colorFields.forEach(field => {
    const value = (theme as any)[field];
    if (value && !hexPattern.test(value)) {
      errors.push(`${field} must be a valid hex color`);
    }
  });
  
  return errors;
};
