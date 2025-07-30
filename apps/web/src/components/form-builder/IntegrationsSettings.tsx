'use client';

import { Button } from '@/components/ui/button';
import { Zap } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';

interface IntegrationsSettingsProps {
  formId: string;
}

export function IntegrationsSettings({ formId }: IntegrationsSettingsProps) {
  const { getToken } = useAuth();

  const handleConnect = async () => {
    try {
      const token = await getToken();
      if (!token) {
        throw new Error('Authentication token not found.');
      }
      if (!formId) {
        throw new Error('Form ID not found.');
      }

      const res = await fetch(
        `/api/integrations/google/url?formId=${formId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!res.ok) {
        throw new Error('Failed to get Google auth URL.');
      }

      const { url } = await res.json();
      window.location.href = url;
    } catch (error) {
      console.error('Failed to connect to Google:', error);
      alert('Failed to connect to Google. Please try again.');
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-lg font-semibold flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          Integrations
        </Label>
        <p className="text-sm text-muted-foreground mt-1">
          Connect your form to send submission data automatically.
        </p>
      </div>
      
      <div className="p-4 border rounded-lg">
        <h3 className="font-semibold mb-2">Google Sheets</h3>
        <p className="text-sm text-muted-foreground mb-3">
          Send submissions directly to a Google Sheet.
        </p>
        <Button onClick={handleConnect}>Connect Google Sheets</Button>
      </div>
    </div>
  );
} 