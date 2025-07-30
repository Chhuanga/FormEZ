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
      const response = await fetch('/api/forms', {
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
        <h1 className="text-4xl font-bold text-black">How do you want to start?</h1>
        <p className="text-gray-600 mt-3 text-lg">
          Create a form with AI or start from scratch.
        </p>
      </div>

      <div className="mb-8">
        <CreateWithAiCard />
      </div>

      <div className="relative my-12">
        <Separator className="bg-gray-200" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 bg-gray-50">
          <span className="text-sm text-gray-500 font-medium">Or</span>
        </div>
      </div>

      <div className="flex justify-center">
          <div
          className="border border-gray-200 rounded-xl p-8 flex flex-col items-center text-center hover:shadow-lg hover:border-gray-300 hover:scale-[1.02] transition-all duration-300 cursor-pointer w-full max-w-sm bg-white"
          onClick={handleCreateBlankForm}
          >
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <FileText className="h-10 w-10 text-gray-400" />
            </div>
          <h2 className="text-xl font-semibold text-black mb-2">Start from Scratch</h2>
            <p className="text-sm text-gray-600 mt-1 flex-grow leading-relaxed">
            Begin with a completely blank form and build exactly what you need.
            </p>
            <Button 
              variant="ghost" 
              className="mt-6 w-full bg-black text-white hover:bg-gray-800 border-0 h-11"
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