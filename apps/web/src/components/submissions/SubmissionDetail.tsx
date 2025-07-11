'use client';

import { format } from 'date-fns';
import { X, File as FileIcon, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FormField {
  id: string;
  label: string;
  type: string;
}

interface Submission {
  id: string;
  createdAt: string;
  answers: Array<{
    fieldId: string;
    value: any;
    file?: {
      url: string;
      name: string;
      size: number;
    } | null;
  }>;
}

interface SubmissionDetailProps {
  submission: Submission;
  formFields: FormField[];
  onClose: () => void;
}

export function SubmissionDetail({
  submission,
  formFields,
  onClose,
}: SubmissionDetailProps) {
  const formatValue = (value: any, file?: any) => {
    if (file) {
      return (
        <a
          href={file.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-primary hover:underline"
        >
          <FileIcon className="h-4 w-4" />
          <span>{file.name}</span>
          <Download className="h-4 w-4" />
        </a>
      );
    }
    if (value === null || value === undefined) return '—';
    if (Array.isArray(value)) return value.join(', ');
    return String(value);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <header className="p-6 border-b bg-muted/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
              <FileIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Submission Details</h2>
              <p className="text-sm text-muted-foreground">
                Submitted on{' '}
                {format(new Date(submission.createdAt), 'MMMM d, yyyy, h:mm a')}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="shadow-sm">
            <X className="h-5 w-5" />
          </Button>
        </header>
        <div className="p-6 overflow-y-auto">
          <div className="space-y-4">
            {formFields.map((field) => {
              const answer = submission.answers.find(
                (a) => a.fieldId === field.id,
              );
              return (
                <div key={field.id} className="border border-border/50 rounded-lg p-4 hover:bg-muted/20 transition-colors">
                  <p className="font-medium mb-3 text-foreground">{field.label}</p>
                  <div className="text-foreground text-sm p-3 bg-muted/30 rounded-md min-h-[40px] flex items-center">
                    {formatValue(answer?.value, answer?.file)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
} 