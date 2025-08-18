'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Palette, Check, ChevronDown, X } from 'lucide-react';
import { useThemeSelector } from '@/hooks/useThemeSelector';
import { prebuiltThemes, PrebuiltTheme } from '@/lib/themes';
import { QuickThemeDemo } from './QuickThemeDemo';

export function ThemeSelector() {
  const { getCurrentPrebuiltTheme, applyPrebuiltTheme, isPrebuiltThemeSelected } = useThemeSelector();
  const [isOpen, setIsOpen] = useState(false);

  const handleThemeSelect = (theme: PrebuiltTheme) => {
    applyPrebuiltTheme(theme);
    setIsOpen(false);
  };

  const currentTheme = getCurrentPrebuiltTheme();

  return (
    <div className="relative">
      <Button 
        variant="outline" 
        size="sm" 
        className="flex items-center gap-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Palette className="h-4 w-4" />
        {currentTheme?.name || 'Custom Theme'}
        <ChevronDown className="h-4 w-4" />
      </Button>
      
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-[9998]" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <Card className="absolute top-full mt-2 right-0 z-[9999] w-96 max-h-[70vh] overflow-y-auto shadow-lg border bg-background">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Choose Theme
                </h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-3">
                {prebuiltThemes.map((theme) => {
                  const isSelected = isPrebuiltThemeSelected(theme);
                  
                  return (
                    <div 
                      key={theme.id}
                      className={`relative cursor-pointer transition-all duration-200 hover:bg-gray-50 rounded-lg border p-2 ${
                        isSelected ? 'ring-2 ring-primary ring-offset-2' : ''
                      }`}
                      onClick={() => handleThemeSelect(theme)}
                    >
                      {isSelected && (
                        <div className="absolute -top-1 -right-1 z-10">
                          <div className="bg-primary text-primary-foreground rounded-full p-1">
                            <Check className="h-3 w-3" />
                          </div>
                        </div>
                      )}
                      
                      <div className="flex gap-3">
                        {/* Theme Preview */}
                        <div className="w-16 h-12 rounded overflow-hidden flex-shrink-0">
                          <QuickThemeDemo prebuiltTheme={theme} className="h-full" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium text-sm truncate">{theme.name}</h4>
                            {theme.id.includes('dark') && (
                              <Badge variant="outline" className="text-xs flex-shrink-0">Dark</Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                            {theme.description}
                          </p>
                          
                          {/* Color swatches */}
                          <div className="flex gap-1 mt-1">
                            <div 
                              className="w-2 h-2 rounded-full border border-gray-200"
                              style={{ backgroundColor: theme.primaryColor }}
                            />
                            <div 
                              className="w-2 h-2 rounded-full border border-gray-200"
                              style={{ backgroundColor: theme.formBackgroundColor }}
                            />
                            <div 
                              className="w-2 h-2 rounded-full border border-gray-200"
                              style={{ backgroundColor: theme.backgroundColor }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
