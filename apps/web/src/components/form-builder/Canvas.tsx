'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useFormStore } from '@/store/form';
import { FormField } from './FormField';
import { cn } from '@/lib/utils';
import { Plus, Smile, Star, Heart, Zap, Award, Target, Rocket, Crown, Gift, Image as ImageIcon } from 'lucide-react';
import { useState } from 'react';

interface CanvasProps {
  viewMode: 'single' | 'two';
  id?: string;
  formTitle?: string;
}

// Utility function to validate and convert Unsplash URLs
const validateAndConvertImageUrl = (url: string): { isValid: boolean; convertedUrl: string; errorMessage?: string } => {
  if (!url || typeof url !== 'string') {
    return { isValid: false, convertedUrl: url, errorMessage: 'Invalid URL provided' };
  }

  // If it's already a proper image URL from a known source, validate it
  if (url.includes('images.unsplash.com')) {
    // Check if it's a proper Unsplash photo URL with ID
    const unsplashMatch = url.match(/images\.unsplash\.com\/photo-([a-zA-Z0-9_-]{10,})/);
    if (!unsplashMatch || unsplashMatch[1].length < 10) {
      return { 
        isValid: false, 
        convertedUrl: url, 
        errorMessage: 'Invalid Unsplash photo ID. IDs should be at least 10 characters long.' 
      };
    }
    return { isValid: true, convertedUrl: url };
  }
  
  // If it's an Unsplash page URL, extract and validate the photo ID
  if (url.includes('unsplash.com/photos/')) {
    const match = url.match(/unsplash\.com\/photos\/[^\/]*-([a-zA-Z0-9_-]+)$/);
    if (match && match[1] && match[1].length >= 10) {
      // Convert to proper image URL with decent resolution
      const convertedUrl = `https://images.unsplash.com/photo-${match[1]}?w=800&h=400&fit=crop&crop=top`;
      return { isValid: true, convertedUrl };
    }
    return { 
      isValid: false, 
      convertedUrl: url, 
      errorMessage: 'Could not extract valid photo ID from Unsplash page URL' 
    };
  }

  // For other URLs, do basic validation
  try {
    new URL(url);
    // Check if it looks like an image URL
    const imageExtensions = /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i;
    if (!imageExtensions.test(url) && !url.includes('unsplash.com') && !url.includes('images.')) {
      return { 
        isValid: false, 
        convertedUrl: url, 
        errorMessage: 'URL does not appear to be a valid image URL' 
      };
    }
    return { isValid: true, convertedUrl: url };
  } catch {
    return { 
      isValid: false, 
      convertedUrl: url, 
      errorMessage: 'Invalid URL format' 
    };
  }
};

// Component to handle cover image loading with error fallback
interface CoverImageContainerProps {
  coverImage: string;
}

const CoverImageContainer: React.FC<CoverImageContainerProps> = ({ coverImage }) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Validate and convert the URL
  const urlValidation = validateAndConvertImageUrl(coverImage);
  
  // If URL is invalid from the start, show error immediately
  if (!urlValidation.isValid) {
    return (
      <div className="relative w-full h-48 mb-0 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 flex items-center justify-center">
        <div className="text-center text-red-600 p-4">
          <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm font-medium">Invalid Image URL</p>
          <p className="text-xs opacity-75 mt-1">{urlValidation.errorMessage}</p>
          <div className="mt-2 p-2 bg-red-100 rounded text-xs">
            <p className="font-mono break-all">{coverImage}</p>
          </div>
        </div>
        <div className="absolute inset-0 bg-red-500/5"></div>
      </div>
    );
  }

  if (imageError) {
    return (
      <div className="relative w-full h-48 mb-0 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 flex items-center justify-center">
        <div className="text-center text-yellow-700 p-4">
          <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm font-medium">Image Failed to Load</p>
          <p className="text-xs opacity-75 mt-1">
            {errorMessage || 'The image could not be loaded. Please check the URL or try a different image.'}
          </p>
          <div className="mt-2 p-2 bg-yellow-100 rounded text-xs">
            <p className="font-mono break-all">{urlValidation.convertedUrl}</p>
          </div>
          <button
            onClick={() => {
              setImageError(false);
              setIsLoading(true);
              setErrorMessage(null);
            }}
            className="mt-2 px-3 py-1 bg-yellow-200 hover:bg-yellow-300 rounded text-xs transition-colors"
          >
            Try Again
          </button>
        </div>
        <div className="absolute inset-0 bg-yellow-500/5"></div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-48 mb-0">
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center z-10">
          <div className="text-center">
            <ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-xs text-gray-500">Loading image...</p>
          </div>
        </div>
      )}
      <img
        src={urlValidation.convertedUrl}
        alt="Form cover"
        className="w-full h-full object-cover"
        crossOrigin="anonymous"
        onLoad={(e) => {
          console.log('Cover image loaded successfully:', urlValidation.convertedUrl);
          if (urlValidation.convertedUrl !== coverImage) {
            console.log('Original URL was converted from:', coverImage);
          }
          setIsLoading(false);
          setImageError(false);
          setErrorMessage(null);
        }}
        onError={(e) => {
          console.error('Cover image failed to load:', urlValidation.convertedUrl);
          console.error('Original URL:', coverImage);
          console.error('Validation result:', urlValidation);
          
          // Determine error message based on the type of failure
          let errorMsg = 'Image failed to load';
          if (urlValidation.convertedUrl.includes('unsplash.com')) {
            errorMsg = 'Unsplash image not found or access denied';
          } else if (e.currentTarget.naturalWidth === 0) {
            errorMsg = 'Invalid image format or corrupted file';
          } else {
            errorMsg = 'Network error or image server unavailable';
          }
          
          setErrorMessage(errorMsg);
          setImageError(true);
          setIsLoading(false);
        }}
      />
      <div className="absolute inset-0 bg-black/20"></div>
    </div>
  );
};

export function Canvas({ viewMode, id, formTitle = 'Untitled Form' }: CanvasProps) {
  const { fields, theme, formSettings } = useFormStore();
  const { setNodeRef, isOver } = useDroppable({ id: 'canvas' });

  const iconMap = {
    'Smile': Smile,
    'Star': Star,
    'Heart': Heart,
    'Zap': Zap,
    'Award': Award,
    'Target': Target,
    'Rocket': Rocket,
    'Crown': Crown,
    'Gift': Gift,
  };

  const SelectedIcon = formSettings.titleIcon ? iconMap[formSettings.titleIcon as keyof typeof iconMap] : null;

  const canvasStyle: React.CSSProperties = {
    backgroundColor: theme.formBackgroundColor,
    borderColor: theme.borderColor,
    borderWidth: theme.borderWidth,
    borderRadius: theme.borderRadius,
    fontFamily: theme.fontFamily,
  };

  const maxWidth = viewMode === 'two' ? 'max-w-6xl' : 'max-w-2xl';
  const gridColumns = viewMode === 'two' ? 'grid grid-cols-2 gap-6' : 'space-y-0';

  // Helper function to determine if we should add a section divider
  const shouldAddDivider = (currentIndex: number) => {
    if (currentIndex === 0 || currentIndex >= fields.length - 1) return false;
    
    const currentField = fields[currentIndex];
    const nextField = fields[currentIndex + 1];
    
    // Add dividers between different field type categories
    const getFieldCategory = (type: string) => {
      switch (type) {
        case 'Input':
        case 'Email':
        case 'NumberInput':
          return 'basic';
        case 'Textarea':
          return 'long';
        case 'RadioGroup':
        case 'Select':
        case 'Checkbox':
          return 'choice';
        case 'DatePicker':
        case 'FileUpload':
          return 'special';
        default:
          return 'other';
      }
    };
    
    return getFieldCategory(currentField.type) !== getFieldCategory(nextField.type);
  };

  // Helper function to get appropriate spacing
  const getFieldSpacing = (currentIndex: number) => {
    if (currentIndex === 0) return 'mb-6';
    
    const currentField = fields[currentIndex];
    const prevField = fields[currentIndex - 1];
    
    // Extra spacing for long text areas
    if (currentField.type === 'Textarea' || prevField.type === 'Textarea') {
      return 'mb-8';
    }
    
    // Standard spacing
    return 'mb-6';
  };

  return (
    <div
      id={id}
      ref={setNodeRef}
      style={{ backgroundColor: '#fafafa', fontFamily: theme.fontFamily }}
      className={cn(
        "min-h-full flex justify-center items-start transition-all duration-200",
        isOver && "bg-primary/5"
      )}
    >
      <div
        className={cn(
          `w-full max-w-4xl transition-all duration-200 relative`,
          isOver && "scale-[1.005]"
        )}
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '0',
          fontFamily: theme.fontFamily,
          minHeight: '100vh'
        }}
      >
        {/* Cover Image */}
        {formSettings.coverImage && (
          <CoverImageContainer 
            coverImage={formSettings.coverImage} 
          />
        )}

        {/* Tally-like Header Section */}
        <div className="relative">
          {/* Header - Removed branding */}
          <div className="px-6 py-4 border-b border-gray-100 bg-white/95 backdrop-blur-sm">
            <div className="flex items-center justify-end">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-gray-500">Live</span>
              </div>
            </div>
          </div>

          {/* Main Form Header */}
          <div className="px-8 py-12 text-left bg-gradient-to-b from-white to-gray-50/50">
            {SelectedIcon && (
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 shadow-sm">
                  <SelectedIcon className="h-8 w-8 text-primary" />
                </div>
              </div>
            )}
            <h1 
              style={{ color: theme.questionTextColor, fontFamily: theme.fontFamily }}
              className="text-4xl font-bold leading-tight mb-3"
            >
              {formTitle}
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed max-w-2xl">
              We'd love to hear from you. Please fill out this form and we'll get back to you soon.
            </p>
          </div>
        </div>

        {/* Form Content Container */}
        <div className="px-8 pb-8">

          <SortableContext
            items={fields.map((f) => f.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-8 max-w-3xl">
              {fields.map((field, index) => (
                <div key={field.id} className="group">
                  {/* Field number indicator - Tally style */}
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mt-1">
                      <span className="text-xs font-semibold text-primary">
                        {index + 1}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <FormField field={field} />
                    </div>
                  </div>
                  
                  {/* Subtle progress indicator */}
                  {index < fields.length - 1 && (
                    <div className="ml-4 mt-6 mb-2">
                      <div className="w-px h-8 bg-gradient-to-b from-primary/20 to-transparent"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </SortableContext>
          
          {/* Submit button section - Tally style */}
          {fields.length > 0 && (
            <div className="mt-12 max-w-3xl">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 border border-green-200 flex items-center justify-center">
                  <span className="text-xs font-semibold text-green-600">
                    ✓
                  </span>
                </div>
                <div className="flex-1">
                  <button 
                    className="w-full sm:w-auto px-8 py-4 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    style={{ fontFamily: theme.fontFamily }}
                  >
                    Submit form
                  </button>
                  <p className="text-sm text-gray-500 mt-3">
                    Press <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Enter ↵</kbd> to submit
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {fields.length === 0 && (
            <div className={cn(
              "text-center p-12 border-2 border-dashed rounded-xl transition-all duration-200 max-w-3xl mx-auto",
              isOver 
                ? "border-primary bg-primary/10 text-primary" 
                : "border-gray-300 text-gray-500"
            )}>
              {isOver ? (
                <div className="space-y-2">
                  <Plus className="h-8 w-8 mx-auto text-primary" />
                  <p className="text-primary font-medium">
                    Drop your field here to get started
                  </p>
                </div>
              ) : (
                <div>
                  <Plus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">Start building your form</h3>
                  <p className="text-sm">
                    Drag and drop form fields from the sidebar to get started
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Drop zone indicator when dragging over filled canvas */}
          {isOver && fields.length > 0 && (
            <div className="absolute inset-0 border-2 border-dashed border-primary rounded-lg bg-primary/5 pointer-events-none flex items-center justify-center">
              <div className="bg-primary/20 text-primary px-4 py-2 rounded-lg border border-primary/40">
                <div className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  <span className="text-sm font-medium">Drop to add field</span>
                </div>
              </div>
            </div>
          )}

          {/* Footer branding - Tally style */}
        </div>
      </div>
    </div>
  );
} 