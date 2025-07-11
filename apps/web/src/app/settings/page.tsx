'use client';

import { Button } from '@/components/ui/button';
import { Settings, ArrowLeft, User, Bell, Shield, Palette } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  return (
    <div className="flex-1 p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground mt-1">
              Manage your account and application preferences
            </p>
          </div>
        </div>
      </div>

      {/* Settings Categories Preview */}
      <div className="grid gap-4 md:grid-cols-2 mb-8">
        <div className="p-4 border border-border rounded-lg">
          <div className="flex items-center gap-3 mb-2">
            <User className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Profile Settings</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Update your personal information and account details
          </p>
        </div>
        
        <div className="p-4 border border-border rounded-lg">
          <div className="flex items-center gap-3 mb-2">
            <Bell className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Notifications</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Configure email and push notification preferences
          </p>
        </div>
        
        <div className="p-4 border border-border rounded-lg">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Privacy & Security</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Manage data privacy and security settings
          </p>
        </div>
        
        <div className="p-4 border border-border rounded-lg">
          <div className="flex items-center gap-3 mb-2">
            <Palette className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Appearance</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Customize themes and display preferences
          </p>
        </div>
      </div>

      {/* Coming Soon Content */}
      <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-border rounded-lg bg-accent/50">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <Settings className="h-8 w-8 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-semibold mb-2">Advanced Settings</h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          Coming soon! Full settings panel with profile management, notifications, privacy controls, and customization options.
        </p>
        <Button asChild>
          <Link href="/dashboard">
            Back to My Forms
          </Link>
        </Button>
      </div>
    </div>
  );
} 