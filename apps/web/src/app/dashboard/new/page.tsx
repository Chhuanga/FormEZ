'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { FileText, Loader2 } from 'lucide-react';
import { CreateWithAiCard } from '@/components/form-builder/CreateWithAiCard';
import { Separator } from '@/components/ui/separator';

export default function NewFormPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [creating, setCreating] = useState(false);

  const handleCreateBlankForm = async () => {
    if (!user) {
      alert('You must be logged in to create a form.');
      return;
    }
    setCreating(true);

    try {
      const token = await user.getIdToken();
      const response = await fetch('http://localhost:3001/forms', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'Untitled Form',
          fields: [],
          theme: {},
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create form');
      }

      const newForm = await response.json();
      router.push(`/form/${newForm.id}/edit`);
    } catch (error) {
      console.error('Error creating form:', error);
      alert('Failed to create a new form.');
      setCreating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold">How do you want to start?</h1>
        <p className="text-muted-foreground mt-2">
          Create a form with AI or start from scratch.
        </p>
      </div>

      <div className="mb-8">
        <CreateWithAiCard />
      </div>

      <div className="relative my-12">
        <Separator />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 bg-background">
          <span className="text-sm text-muted-foreground">Or</span>
        </div>
      </div>

      <div className="flex justify-center">
          <div
          className="border rounded-lg p-6 flex flex-col items-center text-center hover:shadow-md hover:border-primary hover:scale-[1.01] transition-all cursor-pointer w-full max-w-sm"
          onClick={handleCreateBlankForm}
          >
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          <h2 className="text-lg font-semibold">Start from Scratch</h2>
            <p className="text-sm text-muted-foreground mt-1 flex-grow">
            Begin with a completely blank form.
            </p>
            <Button 
              variant="ghost" 
              className="mt-4 w-full"
            disabled={creating}
            >
            {creating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
              'Create Form'
              )}
            </Button>
          </div>
      </div>
    </div>
  );
} 