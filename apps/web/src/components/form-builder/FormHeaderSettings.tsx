'use client';

import { useState } from 'react';
import { useFormStore } from '@/store/form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Image, 
  Smile, 
  Star, 
  Heart, 
  Zap, 
  Award, 
  Target, 
  Rocket, 
  Crown, 
  Gift,
  X,
  Upload,
  ExternalLink
} from 'lucide-react';

const iconOptions = [
  { name: 'Smile', icon: Smile, emoji: '😊' },
  { name: 'Star', icon: Star, emoji: '⭐' },
  { name: 'Heart', icon: Heart, emoji: '❤️' },
  { name: 'Zap', icon: Zap, emoji: '⚡' },
  { name: 'Award', icon: Award, emoji: '🏆' },
  { name: 'Target', icon: Target, emoji: '🎯' },
  { name: 'Rocket', icon: Rocket, emoji: '🚀' },
  { name: 'Crown', icon: Crown, emoji: '👑' },
  { name: 'Gift', icon: Gift, emoji: '🎁' },
];

export function FormHeaderSettings() {
  const { formSettings, setFormSettings } = useFormStore();
  const [coverImageUrl, setCoverImageUrl] = useState(formSettings.coverImage || '');
  const [isValidImage, setIsValidImage] = useState(false);

  const handleIconSelect = (iconName: string) => {
    setFormSettings({ titleIcon: iconName });
  };

  const handleIconRemove = () => {
    setFormSettings({ titleIcon: undefined });
  };

  const handleCoverImageChange = (url: string) => {
    setCoverImageUrl(url);
    if (url.trim()) {
      // Basic URL validation
      try {
        new URL(url);
        setIsValidImage(true);
        setFormSettings({ coverImage: url });
      } catch {
        setIsValidImage(false);
      }
    } else {
      setIsValidImage(false);
      setFormSettings({ coverImage: undefined });
    }
  };

  const handleCoverImageRemove = () => {
    setCoverImageUrl('');
    setIsValidImage(false);
    setFormSettings({ coverImage: undefined });
  };

  const selectedIcon = iconOptions.find(option => option.name === formSettings.titleIcon);

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <Label className="text-lg font-semibold flex items-center gap-2">
          <Image className="h-5 w-5 text-primary" />
          Form Header
        </Label>
        <p className="text-sm text-muted-foreground">
          Add visual elements to make your form more engaging and branded.
        </p>
      </div>

      {/* Title Icon Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Title Icon</CardTitle>
          <CardDescription>
            Add an icon above your form title to make it more visually appealing.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {selectedIcon && (
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <selectedIcon.icon className="h-6 w-6 text-primary" />
                <span className="font-medium">{selectedIcon.name}</span>
                <Badge variant="secondary" className="text-lg">
                  {selectedIcon.emoji}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleIconRemove}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          <div className="grid grid-cols-3 gap-2">
            {iconOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = formSettings.titleIcon === option.name;
              
              return (
                <Button
                  key={option.name}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleIconSelect(option.name)}
                  className="flex items-center gap-2 h-auto p-3"
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm">{option.emoji}</span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Cover Image Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cover Image</CardTitle>
          <CardDescription>
            Add a cover image to display at the top of your form.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Unsplash Help Text */}
          <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-md">
            <p className="font-medium mb-1">💡 Using Unsplash images:</p>
            <p>1. Go to <a href="https://unsplash.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">unsplash.com</a></p>
            <p>2. Right-click on any image → "Copy image address"</p>
            <p>3. Paste the URL below (should start with https://images.unsplash.com/)</p>
          </div>
          {formSettings.coverImage && isValidImage && (
            <div className="space-y-3">
              <div className="relative">
                <img
                  src={formSettings.coverImage}
                  alt="Cover image preview"
                  className="w-full h-32 object-cover rounded-lg border"
                  onError={() => setIsValidImage(false)}
                />
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleCoverImageRemove}
                  className="absolute top-2 right-2 h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="coverImage" className="text-sm font-medium">
              Image URL
            </Label>
            <div className="flex gap-2">
              <Input
                id="coverImage"
                type="url"
                placeholder="https://images.unsplash.com/photo-... or any image URL"
                value={coverImageUrl}
                onChange={(e) => handleCoverImageChange(e.target.value)}
                className="flex-1"
              />
              <Button
                variant="outline"
                size="sm"
                asChild
                className="flex-shrink-0"
              >
                <a 
                  href="https://unsplash.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Unsplash
                </a>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Recommended: Use high-quality images with a 16:9 aspect ratio for best results.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
