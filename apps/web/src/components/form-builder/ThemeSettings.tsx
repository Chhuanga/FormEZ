'use client';

import { Label } from '@/components/ui/label';
import { Brush } from 'lucide-react';

export function ThemeSettings() {
  return (
    <div className="space-y-6 p-6">
        <div className="space-y-2">
            <Label className="text-lg font-semibold flex items-center gap-2">
                <Brush className="h-5 w-5 text-primary" />
                Theme & Appearance
            </Label>
            <p className="text-sm text-muted-foreground">
                Customize the look and feel of your form.
            </p>
        </div>
        <div className="flex flex-col items-center justify-center py-12 text-center bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
                Theme settings are not available yet.
            </p>
        </div>
    </div>
  );
} 