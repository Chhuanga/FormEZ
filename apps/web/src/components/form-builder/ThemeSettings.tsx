'use client';

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brush, Palette, Check, Sparkles, Eye } from 'lucide-react';
import { useThemeSelector } from '@/hooks/useThemeSelector';
import { prebuiltThemes, PrebuiltTheme } from '@/lib/themes';
import { ThemePreview } from './ThemePreview';
import { QuickThemeDemo } from './QuickThemeDemo';

export function ThemeSettings() {
  const { getCurrentPrebuiltTheme, applyPrebuiltTheme, isPrebuiltThemeSelected, resetTheme } = useThemeSelector();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showPreview, setShowPreview] = useState(true);

  // Categorize themes
  const themeCategories = {
    all: prebuiltThemes,
    light: prebuiltThemes.filter(t => !t.id.includes('dark')),
    dark: prebuiltThemes.filter(t => t.id.includes('dark')),
    colorful: prebuiltThemes.filter(t => 
      ['ocean', 'sunset', 'forest', 'lavender', 'electric', 'cosmic', 'soft-pink', 'mint'].includes(t.id)
    ),
    minimal: prebuiltThemes.filter(t => 
      ['minimalist-gray', 'paper', 'default'].includes(t.id)
    ),
  };

  const handleThemeSelect = (selectedTheme: PrebuiltTheme) => {
    applyPrebuiltTheme(selectedTheme);
  };

  const isThemeSelected = (selectedTheme: PrebuiltTheme) => {
    return isPrebuiltThemeSelected(selectedTheme);
  };

  const ThemeCard = ({ prebuiltTheme }: { prebuiltTheme: PrebuiltTheme }) => {
    const isSelected = isThemeSelected(prebuiltTheme);
    
    return (
      <Card 
        className={`relative cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg ${
          isSelected ? 'ring-2 ring-primary ring-offset-2' : ''
        }`}
        onClick={() => handleThemeSelect(prebuiltTheme)}
      >
        {isSelected && (
          <div className="absolute -top-2 -right-2 z-10">
            <div className="bg-primary text-primary-foreground rounded-full p-1">
              <Check className="h-4 w-4" />
            </div>
          </div>
        )}
        
        {/* Theme Preview */}
        <div className="h-20 rounded-t-lg overflow-hidden">
          <QuickThemeDemo prebuiltTheme={prebuiltTheme} className="h-full" />
        </div>
        
        <div className="p-3">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-semibold text-sm">{prebuiltTheme.name}</h4>
            {prebuiltTheme.id.includes('dark') && (
              <Badge variant="outline" className="text-xs">Dark</Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {prebuiltTheme.description}
          </p>
          
          {/* Color swatches */}
          <div className="flex gap-1 mt-2">
            <div 
              className="w-3 h-3 rounded-full border border-gray-200"
              style={{ backgroundColor: prebuiltTheme.primaryColor }}
            />
            <div 
              className="w-3 h-3 rounded-full border border-gray-200"
              style={{ backgroundColor: prebuiltTheme.formBackgroundColor }}
            />
            <div 
              className="w-3 h-3 rounded-full border border-gray-200"
              style={{ backgroundColor: prebuiltTheme.backgroundColor }}
            />
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
      {/* Left Column - Theme Selection */}
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <Label className="text-lg font-semibold flex items-center gap-2">
            <Brush className="h-5 w-5 text-primary" />
            Theme & Appearance
          </Label>
          <p className="text-sm text-muted-foreground">
            Choose from our collection of beautiful prebuilt themes to customize your form's appearance.
          </p>
        </div>

        {/* Current Theme Info */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Palette className="h-5 w-5 text-primary" />
              <div>
                <h4 className="font-medium">Current Theme</h4>
                <p className="text-sm text-muted-foreground">
                  {getCurrentPrebuiltTheme()?.name || 'Custom Theme'}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowPreview(!showPreview)}
              >
                <Eye className="h-4 w-4" />
                {showPreview ? 'Hide' : 'Show'} Preview
              </Button>
              <Button variant="outline" size="sm" onClick={resetTheme}>
                Reset to Default
              </Button>
            </div>
          </div>
        </Card>

        {/* Theme Categories */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="light">Light</TabsTrigger>
            <TabsTrigger value="dark">Dark</TabsTrigger>
            <TabsTrigger value="colorful">Colorful</TabsTrigger>
            <TabsTrigger value="minimal">Minimal</TabsTrigger>
          </TabsList>

          {Object.entries(themeCategories).map(([category, themes]) => (
            <TabsContent key={category} value={category} className="mt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto">
                {themes.map((prebuiltTheme) => (
                  <ThemeCard key={prebuiltTheme.id} prebuiltTheme={prebuiltTheme} />
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Premium Themes Teaser */}
        <Card className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 border-dashed">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-purple-600" />
            <div className="flex-1">
              <h4 className="font-medium text-purple-900">More themes coming soon!</h4>
              <p className="text-sm text-purple-700">
                We're constantly adding new beautiful themes. Stay tuned for seasonal themes, brand-specific designs, and more customization options.
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Right Column - Live Preview */}
      {showPreview && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Live Preview</h3>
          </div>
          <div className="sticky top-4">
            <ThemePreview className="rounded-lg border" />
          </div>
        </div>
      )}
    </div>
  );
} 