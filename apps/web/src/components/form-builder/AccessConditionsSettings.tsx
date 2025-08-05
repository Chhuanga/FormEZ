'use client';

import { useFormStore } from '@/store/form';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Shield, Mail, Info } from 'lucide-react';

export function AccessConditionsSettings() {
  const { formSettings, setFormSettings } = useFormStore();

  const handleRequireLoginChange = (checked: boolean) => {
    setFormSettings({
      ...formSettings,
      accessConditions: {
        ...formSettings?.accessConditions,
        requireLogin: checked,
        allowedEmailDomains: formSettings?.accessConditions?.allowedEmailDomains || [],
      },
    });
  };

  const handleEmailDomainsChange = (value: string) => {
    const domains = value
      .split('\n')
      .map(domain => domain.trim())
      .filter(domain => domain.length > 0);
    
    setFormSettings({
      ...formSettings,
      accessConditions: {
        ...formSettings?.accessConditions,
        requireLogin: formSettings?.accessConditions?.requireLogin || false,
        allowedEmailDomains: domains,
      },
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Access Conditions</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Control who can access and fill out your form.
        </p>
      </div>

      <div className="space-y-4">
        {/* Require Login Section */}
        <div className="space-y-3 p-4 border border-border rounded-lg">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="require-login" className="text-sm font-medium">
                Require Login
              </Label>
              <p className="text-xs text-muted-foreground">
                Users must sign in before accessing the form
              </p>
            </div>
            <Switch
              id="require-login"
              checked={formSettings?.accessConditions?.requireLogin || false}
              onCheckedChange={handleRequireLoginChange}
            />
          </div>
        </div>

        {/* Email Domain Restrictions */}
        <div className="space-y-3 p-4 border border-border rounded-lg">
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email Domain Restrictions
            </Label>
            <p className="text-xs text-muted-foreground">
              Only allow users with specific email domains to access the form
            </p>
          </div>
          
          <div className="space-y-2">
            <Textarea
              placeholder="Enter allowed domains (one per line)&#10;example.com&#10;company.org&#10;university.edu"
              value={formSettings?.accessConditions?.allowedEmailDomains?.join('\n') || ''}
              onChange={(e) => handleEmailDomainsChange(e.target.value)}
              className="min-h-[100px] text-sm font-mono"
            />
            <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-md">
              <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="text-xs text-muted-foreground space-y-1">
                <p><strong>How it works:</strong></p>
                <p>• Leave empty to allow all email domains</p>
                <p>• Enter one domain per line (e.g., &quot;company.com&quot;)</p>
                <p>• Users must have an email ending with these domains</p>
                <p>• Works with the &quot;Require Login&quot; setting</p>
              </div>
            </div>
          </div>
        </div>

        {/* Status Preview */}
        <div className="p-4 bg-muted/30 rounded-lg border border-dashed border-border">
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Current Access Settings:</h4>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>
                <strong>Login Required:</strong>{' '}
                {formSettings?.accessConditions?.requireLogin ? 'Yes' : 'No'}
              </p>
              <p>
                <strong>Email Restrictions:</strong>{' '}
                {(formSettings?.accessConditions?.allowedEmailDomains?.length || 0) > 0 
                  ? `${formSettings?.accessConditions?.allowedEmailDomains?.length} domain(s) allowed`
                  : 'All domains allowed'
                }
              </p>
              {(formSettings?.accessConditions?.allowedEmailDomains?.length || 0) > 0 && (
                <p className="mt-1">
                  <strong>Allowed domains:</strong>{' '}
                  {formSettings?.accessConditions?.allowedEmailDomains?.join(', ') || ''}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
