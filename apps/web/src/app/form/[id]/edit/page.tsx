'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useParams } from 'next/navigation';
import { FormBuilder } from '@/components/form-builder/FormBuilder';
import { FormField } from '@/store/form';

interface Form {
  id: string;
  title: string;
  fields: FormField[];
}

export default function EditFormPage() {
  const { user } = useAuth();
  const params = useParams();
  const { id } = params;

  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !id) return;

    const fetchForm = async () => {
      try {
        const token = await user.getIdToken();
        const response = await fetch(`http://localhost:3001/forms/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch form data.');
        }

        const data = await response.json();
        setForm(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchForm();
  }, [id, user]);

  if (loading) {
    return <div className="flex h-full items-center justify-center">Loading form...</div>;
  }

  if (!form) {
    return <div className="flex h-full items-center justify-center">Form not found.</div>;
  }

  return <FormBuilder initialData={form} />;
} 