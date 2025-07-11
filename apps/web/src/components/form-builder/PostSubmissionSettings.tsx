'use client';

import { useFormStore } from '@/store/form';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  RadioGroup,
  RadioGroupItem,
} from '@/components/ui/radio-group';
import { Zap, MessageSquare, Link } from 'lucide-react';

export function PostSubmissionSettings() {
  const { postSubmissionSettings, setPostSubmissionSettings } = useFormStore();

  const handleTypeChange = (type: 'message' | 'redirect') => {
    setPostSubmissionSettings({ ...postSubmissionSettings, type });
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPostSubmissionSettings({
      ...postSubmissionSettings,
      message: e.target.value,
    });
  };

  const handleRedirectUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPostSubmissionSettings({
      ...postSubmissionSettings,
      url: e.target.value,
    });
  };

  return (
    <div className="space-y-4 p-4 sm:p-6">
      <div className="space-y-2">
         <Label className="text-lg font-semibold flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            After Submission
        </Label>
        <p className="text-sm text-muted-foreground">
            Choose what happens after someone submits your form.
        </p>
      </div>

      <RadioGroup
        value={postSubmissionSettings.type}
        onValueChange={handleTypeChange}
        className="space-y-3"
      >
        <div className="space-y-2 p-3 sm:p-4 rounded-lg border bg-background has-[:checked]:bg-muted/80 has-[:checked]:border-primary/50 transition-all">
          <div className="flex items-center gap-3">
            <RadioGroupItem value="message" id="message" />
            <Label htmlFor="message" className="font-medium flex items-center gap-2 cursor-pointer text-sm">
                <MessageSquare className="h-4 w-4" />
                Show a thank you message
            </Label>
          </div>
          {postSubmissionSettings.type === 'message' && (
            <div className="pl-6 pt-2">
              <Textarea
                placeholder="Thank you for your submission!"
                value={postSubmissionSettings.message || ''}
                onChange={handleMessageChange}
                className="h-20 text-sm resize-none"
              />
            </div>
          )}
        </div>

        <div className="space-y-2 p-3 sm:p-4 rounded-lg border bg-background has-[:checked]:bg-muted/80 has-[:checked]:border-primary/50 transition-all">
           <div className="flex items-center gap-3">
            <RadioGroupItem value="redirect" id="redirect" />
            <Label htmlFor="redirect" className="font-medium flex items-center gap-2 cursor-pointer text-sm">
                <Link className="h-4 w-4" />
                Redirect to a URL
            </Label>
          </div>
          {postSubmissionSettings.type === 'redirect' && (
            <div className="pl-6 pt-2">
              <Input
                placeholder="https://example.com"
                value={postSubmissionSettings.url || ''}
                onChange={handleRedirectUrlChange}
                className="text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Make sure to include https:// or http://
              </p>
            </div>
          )}
        </div>
      </RadioGroup>
    </div>
  );
} 