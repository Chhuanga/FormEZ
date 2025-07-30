'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useFormStore } from '@/store/form';
import { FormField } from './FormField';
import { cn } from '@/lib/utils';
import { Plus, Smile, Star, Heart, Zap, Award, Target, Rocket, Crown, Gift } from 'lucide-react';

interface CanvasProps {
  viewMode: 'single' | 'two';
  id?: string;
  formTitle?: string;
}

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
      style={{ backgroundColor: theme.backgroundColor, fontFamily: theme.fontFamily }}
      className={cn(
        "p-4 md:p-8 min-h-full flex justify-center items-start pt-8 transition-all duration-200",
        isOver && "bg-primary/5"
      )}
    >
      <div
        className={cn(
          `w-full ${maxWidth} shadow-lg transition-all duration-200 relative overflow-hidden`,
          isOver && "shadow-xl scale-[1.01] border-2 border-dashed border-primary"
        )}
        style={canvasStyle}
      >
        {/* Cover Image */}
        {formSettings.coverImage && (
          <div className="relative w-full h-48 mb-0">
            <img
              src={formSettings.coverImage}
              alt="Form cover"
              className="w-full h-full object-cover"
              crossOrigin="anonymous"
              onLoad={(e) => {
                console.log('Cover image loaded successfully:', formSettings.coverImage);
              }}
              onError={(e) => {
                console.error('Cover image failed to load:', formSettings.coverImage);
                e.currentTarget.style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-black/20"></div>
          </div>
        )}

        {/* Form Content Container */}
        <div className="p-8">
          {/* Form Header with Icon and Title */}
          <div className="mb-8 text-center">
            {SelectedIcon && (
              <div className="mb-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 border-2 border-primary/20">
                  <SelectedIcon className="h-8 w-8 text-primary" />
                </div>
              </div>
            )}
            <h1 
              style={{ color: theme.questionTextColor, fontFamily: theme.fontFamily }}
              className="text-2xl font-bold"
            >
              {formTitle}
            </h1>
          </div>

          <SortableContext
            items={fields.map((f) => f.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className={gridColumns}>
              {fields.map((field, index) => (
                <div key={field.id}>
                  <div className={getFieldSpacing(index)}>
                    <FormField field={field} />
                  </div>
                  
                  {/* Section divider for different field types */}
                  {shouldAddDivider(index) && (
                    <div className="my-8 flex items-center">
                      <div className="flex-1 border-t border-gray-200"></div>
                      <div className="px-4">
                        <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                      </div>
                      <div className="flex-1 border-t border-gray-200"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </SortableContext>
          
          {fields.length === 0 && (
            <div className={cn(
              "text-center p-12 border-2 border-dashed rounded-lg transition-all duration-200",
              isOver 
                ? "border-primary bg-primary/10 text-primary" 
                : "border-border text-muted-foreground"
            )}>
              {isOver ? (
                <div className="space-y-2">
                  <Plus className="h-8 w-8 mx-auto text-primary" />
                  <p className="text-primary font-medium">
                    Drop your field here to get started
                  </p>
                </div>
              ) : (
                <p>
                  Drag blocks from the left panel to get started
                </p>
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

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              End of form
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 