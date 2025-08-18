import { Theme } from '@/store/form';

export interface PrebuiltTheme extends Theme {
  id: string;
  name: string;
  description: string;
  preview: string; // A gradient or color preview
}

// Beautiful prebuilt themes with aesthetic color schemes
export const prebuiltThemes: PrebuiltTheme[] = [
  // Default Theme
  {
    id: 'default',
    name: 'Classic Blue',
    description: 'Clean and professional with blue accents',
    preview: 'linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%)',
    backgroundColor: '#F3F4F6',
    formBackgroundColor: '#FFFFFF',
    questionTextColor: '#111827',
    answerTextColor: '#374151',
    primaryColor: '#3B82F6',
    buttonTextColor: '#FFFFFF',
    fontFamily: 'Inter, sans-serif',
    borderColor: '#E5E7EB',
    borderWidth: 1,
    borderRadius: 8,
    textColor: '#000000',
  },

  // Modern Gradient Themes
  {
    id: 'ocean',
    name: 'Ocean Breeze',
    description: 'Refreshing blues and teals inspired by the ocean',
    preview: 'linear-gradient(135deg, #0891B2 0%, #0E7490 100%)',
    backgroundColor: '#F0F9FF',
    formBackgroundColor: '#FFFFFF',
    questionTextColor: '#0F172A',
    answerTextColor: '#475569',
    primaryColor: '#0891B2',
    buttonTextColor: '#FFFFFF',
    fontFamily: 'Inter, sans-serif',
    borderColor: '#E0F2FE',
    borderWidth: 1,
    borderRadius: 12,
    textColor: '#0F172A',
  },

  {
    id: 'sunset',
    name: 'Warm Sunset',
    description: 'Vibrant oranges and pinks like a beautiful sunset',
    preview: 'linear-gradient(135deg, #F97316 0%, #DC2626 100%)',
    backgroundColor: '#FFF7ED',
    formBackgroundColor: '#FFFFFF',
    questionTextColor: '#1C1917',
    answerTextColor: '#57534E',
    primaryColor: '#F97316',
    buttonTextColor: '#FFFFFF',
    fontFamily: 'Inter, sans-serif',
    borderColor: '#FED7AA',
    borderWidth: 1,
    borderRadius: 12,
    textColor: '#1C1917',
  },

  {
    id: 'forest',
    name: 'Forest Green',
    description: 'Natural greens that evoke tranquility and growth',
    preview: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
    backgroundColor: '#F0FDF4',
    formBackgroundColor: '#FFFFFF',
    questionTextColor: '#14532D',
    answerTextColor: '#374151',
    primaryColor: '#059669',
    buttonTextColor: '#FFFFFF',
    fontFamily: 'Inter, sans-serif',
    borderColor: '#BBFBCF',
    borderWidth: 1,
    borderRadius: 12,
    textColor: '#14532D',
  },

  {
    id: 'lavender',
    name: 'Lavender Dreams',
    description: 'Soft purples and lavenders for a dreamy feel',
    preview: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
    backgroundColor: '#FAF5FF',
    formBackgroundColor: '#FFFFFF',
    questionTextColor: '#581C87',
    answerTextColor: '#6B21A8',
    primaryColor: '#8B5CF6',
    buttonTextColor: '#FFFFFF',
    fontFamily: 'Inter, sans-serif',
    borderColor: '#E9D5FF',
    borderWidth: 1,
    borderRadius: 12,
    textColor: '#581C87',
  },

  // Dark Themes
  {
    id: 'dark-modern',
    name: 'Dark Modern',
    description: 'Sleek dark theme with blue accents',
    preview: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
    backgroundColor: '#0F172A',
    formBackgroundColor: '#1E293B',
    questionTextColor: '#F8FAFC',
    answerTextColor: '#CBD5E1',
    primaryColor: '#3B82F6',
    buttonTextColor: '#FFFFFF',
    fontFamily: 'Inter, sans-serif',
    borderColor: '#334155',
    borderWidth: 1,
    borderRadius: 12,
    textColor: '#F8FAFC',
  },

  {
    id: 'dark-elegant',
    name: 'Dark Elegant',
    description: 'Sophisticated dark theme with gold accents',
    preview: 'linear-gradient(135deg, #1F2937 0%, #111827 100%)',
    backgroundColor: '#111827',
    formBackgroundColor: '#1F2937',
    questionTextColor: '#F9FAFB',
    answerTextColor: '#D1D5DB',
    primaryColor: '#F59E0B',
    buttonTextColor: '#1F2937',
    fontFamily: 'Inter, sans-serif',
    borderColor: '#374151',
    borderWidth: 1,
    borderRadius: 8,
    textColor: '#F9FAFB',
  },

  // Pastel Themes
  {
    id: 'soft-pink',
    name: 'Soft Rose',
    description: 'Gentle pinks and roses for a warm, welcoming feel',
    preview: 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)',
    backgroundColor: '#FDF2F8',
    formBackgroundColor: '#FFFFFF',
    questionTextColor: '#881337',
    answerTextColor: '#9F1239',
    primaryColor: '#EC4899',
    buttonTextColor: '#FFFFFF',
    fontFamily: 'Inter, sans-serif',
    borderColor: '#F9A8D4',
    borderWidth: 1,
    borderRadius: 12,
    textColor: '#881337',
  },

  {
    id: 'mint',
    name: 'Fresh Mint',
    description: 'Cool mint and teal for a fresh, clean look',
    preview: 'linear-gradient(135deg, #10B981 0%, #047857 100%)',
    backgroundColor: '#ECFDF5',
    formBackgroundColor: '#FFFFFF',
    questionTextColor: '#064E3B',
    answerTextColor: '#065F46',
    primaryColor: '#10B981',
    buttonTextColor: '#FFFFFF',
    fontFamily: 'Inter, sans-serif',
    borderColor: '#A7F3D0',
    borderWidth: 1,
    borderRadius: 12,
    textColor: '#064E3B',
  },

  // Vibrant Themes
  {
    id: 'electric',
    name: 'Electric Blue',
    description: 'Bold and energetic with electric blue highlights',
    preview: 'linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)',
    backgroundColor: '#CFFAFE',
    formBackgroundColor: '#FFFFFF',
    questionTextColor: '#164E63',
    answerTextColor: '#0E7490',
    primaryColor: '#06B6D4',
    buttonTextColor: '#FFFFFF',
    fontFamily: 'Inter, sans-serif',
    borderColor: '#67E8F9',
    borderWidth: 2,
    borderRadius: 16,
    textColor: '#164E63',
  },

  {
    id: 'cosmic',
    name: 'Cosmic Purple',
    description: 'Deep space-inspired purples and cosmic vibes',
    preview: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)',
    backgroundColor: '#F3E8FF',
    formBackgroundColor: '#FFFFFF',
    questionTextColor: '#581C87',
    answerTextColor: '#6B21A8',
    primaryColor: '#7C3AED',
    buttonTextColor: '#FFFFFF',
    fontFamily: 'Inter, sans-serif',
    borderColor: '#C4B5FD',
    borderWidth: 2,
    borderRadius: 16,
    textColor: '#581C87',
  },

  // Minimalist Themes
  {
    id: 'minimalist-gray',
    name: 'Minimalist Gray',
    description: 'Clean and minimal with subtle gray tones',
    preview: 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)',
    backgroundColor: '#F9FAFB',
    formBackgroundColor: '#FFFFFF',
    questionTextColor: '#111827',
    answerTextColor: '#4B5563',
    primaryColor: '#6B7280',
    buttonTextColor: '#FFFFFF',
    fontFamily: 'Inter, sans-serif',
    borderColor: '#E5E7EB',
    borderWidth: 1,
    borderRadius: 4,
    textColor: '#111827',
  },

  {
    id: 'paper',
    name: 'Paper White',
    description: 'Crisp paper-like theme with subtle shadows',
    preview: 'linear-gradient(135deg, #FFFFFF 0%, #F3F4F6 100%)',
    backgroundColor: '#F8F9FA',
    formBackgroundColor: '#FFFFFF',
    questionTextColor: '#1F2937',
    answerTextColor: '#4B5563',
    primaryColor: '#2563EB',
    buttonTextColor: '#FFFFFF',
    fontFamily: 'Inter, sans-serif',
    borderColor: '#D1D5DB',
    borderWidth: 1,
    borderRadius: 8,
    textColor: '#1F2937',
  },
];

// Helper function to get theme by ID
export const getThemeById = (id: string): PrebuiltTheme | undefined => {
  return prebuiltThemes.find(theme => theme.id === id);
};

// Helper function to get default theme
export const getDefaultTheme = (): PrebuiltTheme => {
  return prebuiltThemes[0]; // Classic Blue
};
