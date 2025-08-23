'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useParams, useRouter } from 'next/navigation';
import { useCollaboration } from '@/context/CollaborationContext';
import { FormBuilder } from '@/components/form-builder/FormBuilder';
import { FormField } from '@/store/form';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, Lock } from 'lucide-react';
import Link from 'next/link';

interface Form {
  id: string;
  title: string;
  fields: FormField[];
  theme?: any;
  formSettings?: any;
  postSubmissionSettings?: any;
  ownerId: string;
  collaborators?: string[];
}

export default function CollaborateFormPage() {
  const { user, loading: authLoading } = useAuth();
  const { startCollaboration } = useCollaboration();
  const params = useParams();
  const router = useRouter();
  const { id } = params;

  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    if (!user || !id || authLoading) return;

    const fetchForm = async () => {
      try {
        const token = await user.getIdToken();
        const response = await fetch(`/api/forms/${id}/collaborate`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 403) {
            setHasAccess(false);
            setLoading(false);
            return;
          }
          throw new Error('Failed to fetch form data.');
        }

        const data = await response.json();
        setForm(data);
        setHasAccess(true);
      } catch (error) {
        console.error(error);
        setHasAccess(false);
      } finally {
        setLoading(false);
      }
    };

    fetchForm();
  }, [id, user, authLoading]);

  const handleJoinCollaboration = async () => {
    if (!id || !form) return;
    
    setJoining(true);
    try {
      // Start collaboration session
      startCollaboration(id as string);
      
      // Request access to collaborate if not already granted
      const token = await user?.getIdToken();
      await fetch(`/api/forms/${id}/collaborators/request`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
    } catch (error) {
      console.error('Failed to join collaboration:', error);
    } finally {
      setJoining(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p>Loading collaboration session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <Lock className="h-12 w-12 text-gray-400 mx-auto" />
          <h2 className="text-2xl font-semibold">Login Required</h2>
          <p className="text-gray-600">
            You need to be logged in to collaborate on this form.
          </p>
          <Button asChild>
            <Link href="/auth/signin?redirectTo=/form/{id}/collaborate">
              Sign In
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <Lock className="h-12 w-12 text-red-400 mx-auto" />
          <h2 className="text-2xl font-semibold">Access Denied</h2>
          <p className="text-gray-600">
            You don't have permission to collaborate on this form. 
            Please ask the form owner to invite you.
          </p>
          <Button variant="outline" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-semibold">Form not found</h2>
          <Button variant="outline" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Collaboration Header */}
      <div className="bg-blue-50 border-b border-blue-200 p-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-blue-600" />
            <div>
              <h1 className="font-semibold text-blue-900">Collaborative Editing</h1>
              <p className="text-sm text-blue-700">
                You're collaborating on "{form.title}" with others
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {!joining && (
              <Button 
                onClick={handleJoinCollaboration}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                Join Session
              </Button>
            )}
            <Button variant="outline" size="sm" asChild>
              <Link href={`/form/${id}/edit`}>
                Exit Collaboration
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Form Builder */}
      <div className="flex-1">
        <FormBuilder initialData={form} />
      </div>
    </div>
  );
}
