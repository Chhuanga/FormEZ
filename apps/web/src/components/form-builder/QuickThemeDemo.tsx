'use client';

import { useFormStore } from '@/store/form';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface QuickThemeDemoProps {
  prebuiltTheme?: any;
  className?: string;
}

export function QuickThemeDemo({ prebuiltTheme, className = "" }: QuickThemeDemoProps) {
  const { theme } = useFormStore();
  const displayTheme = prebuiltTheme || theme;

  return (
    <div 
      className={`p-3 rounded-lg transition-all duration-300 ${className}`}
      style={{ backgroundColor: displayTheme.backgroundColor }}
    >
      <Card 
        className="p-3"
        style={{ 
          backgroundColor: displayTheme.formBackgroundColor,
          borderColor: displayTheme.borderColor,
          borderWidth: displayTheme.borderWidth,
          borderRadius: displayTheme.borderRadius,
        }}
      >
        {/* Form Title */}
        <h3 
          className="text-sm font-semibold mb-2"
          style={{ 
            color: displayTheme.questionTextColor,
            fontFamily: displayTheme.fontFamily 
          }}
        >
          Sample Form
        </h3>
        
        {/* Sample Input */}
        <div className="mb-3">
          <div 
            className="w-full h-6 rounded border text-xs flex items-center px-2"
            style={{
              borderColor: displayTheme.borderColor,
              color: displayTheme.answerTextColor,
              borderRadius: displayTheme.borderRadius / 2,
            }}
          >
            Your answer...
          </div>
        </div>
        
        {/* Sample Button */}
        <Button 
          size="sm" 
          className="w-full h-6 text-xs"
          style={{
            backgroundColor: displayTheme.primaryColor,
            color: displayTheme.buttonTextColor,
            borderRadius: displayTheme.borderRadius / 2,
          }}
        >
          Submit
        </Button>
      </Card>
    </div>
  );
}
