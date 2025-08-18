'use client';

import { useFormStore } from '@/store/form';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ThemePreviewProps {
  showTitle?: boolean;
  className?: string;
}

export function ThemePreview({ showTitle = true, className = "" }: ThemePreviewProps) {
  const { theme } = useFormStore();

  return (
    <div 
      className={`min-h-[400px] p-6 transition-colors duration-300 ${className}`}
      style={{ backgroundColor: theme.backgroundColor }}
    >
      <div className="max-w-md mx-auto">
        <Card 
          className="p-6 shadow-lg transition-all duration-300"
          style={{ 
            backgroundColor: theme.formBackgroundColor,
            borderColor: theme.borderColor,
            borderWidth: theme.borderWidth,
            borderRadius: theme.borderRadius,
          }}
        >
          {showTitle && (
            <div className="mb-6">
              <h2 
                className="text-2xl font-bold mb-2"
                style={{ 
                  color: theme.questionTextColor,
                  fontFamily: theme.fontFamily 
                }}
              >
                Preview Form
              </h2>
              <p 
                className="text-sm"
                style={{ 
                  color: theme.answerTextColor,
                  fontFamily: theme.fontFamily 
                }}
              >
                This is how your form will look with the selected theme.
              </p>
            </div>
          )}

          <div className="space-y-4">
            {/* Text Input Preview */}
            <div className="space-y-2">
              <Label 
                className="text-sm font-medium"
                style={{ 
                  color: theme.questionTextColor,
                  fontFamily: theme.fontFamily 
                }}
              >
                What's your name?
              </Label>
              <Input 
                placeholder="Enter your name"
                className="transition-colors duration-200"
                style={{
                  color: theme.answerTextColor,
                  borderColor: theme.borderColor,
                  borderWidth: theme.borderWidth,
                  borderRadius: theme.borderRadius,
                  fontFamily: theme.fontFamily,
                  '--tw-ring-color': theme.primaryColor,
                } as React.CSSProperties}
              />
            </div>

            {/* Multiple Choice Preview */}
            <div className="space-y-2">
              <Label 
                className="text-sm font-medium"
                style={{ 
                  color: theme.questionTextColor,
                  fontFamily: theme.fontFamily 
                }}
              >
                How did you hear about us?
              </Label>
              <div className="space-y-2">
                {['Social Media', 'Friend Referral', 'Search Engine'].map((option, index) => (
                  <label key={option} className="flex items-center gap-2 cursor-pointer group">
                    <div 
                      className="w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors duration-200"
                      style={{
                        borderColor: index === 0 ? theme.primaryColor : theme.borderColor,
                      }}
                    >
                      {index === 0 && (
                        <div 
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: theme.primaryColor }}
                        />
                      )}
                    </div>
                    <span 
                      className="text-sm group-hover:opacity-70 transition-opacity duration-200"
                      style={{ 
                        color: theme.answerTextColor,
                        fontFamily: theme.fontFamily 
                      }}
                    >
                      {option}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Button Preview */}
            <div className="pt-4">
              <Button 
                className="w-full transition-all duration-200 hover:opacity-90"
                style={{
                  backgroundColor: theme.primaryColor,
                  color: theme.buttonTextColor,
                  borderRadius: theme.borderRadius,
                  fontFamily: theme.fontFamily,
                }}
              >
                Submit Form
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
