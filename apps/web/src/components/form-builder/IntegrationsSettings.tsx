'use client';

import { Button } from '@/components/ui/button';
import { Zap } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { useFormStore } from '@/store/form';

export function IntegrationsSettings() {
  const { getToken } = useAuth();
  const { formId } = useFormStore();

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
        `http://localhost:3001/integrations/google/url?formId=${formId}`,
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
    <div className="space-y-4 p-4 sm:p-6">
      <div className="space-y-2">
        <Label className="text-lg font-semibold flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          Integrations
        </Label>
        <p className="text-sm text-muted-foreground">
          Connect your form to other services to send submission data
          automatically.
        </p>
      </div>
      
      <div className="p-4 border rounded-lg">
        <h3 className="font-semibold mb-2">Google Sheets</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Send submission data directly to a Google Sheet.
        </p>
        <Button onClick={handleConnect}>Connect to Google Sheets</Button>
      </div>
    </div>
  );
} 