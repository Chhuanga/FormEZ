'use client';

import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AppShell } from "./AppShell";

interface FormData {
  formSettings?: {
    accessConditions?: {
      requireLogin?: boolean;
    };
  };
}

export function DynamicAppShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const [shouldUseMinimal, setShouldUseMinimal] = useState(false);
  const [checkingForm, setCheckingForm] = useState(false);

  useEffect(() => {
    // Check if this is a public form route (/s/[id])
    const isPublicFormRoute = pathname?.startsWith('/s/');
    
    if (!isPublicFormRoute || loading) {
      setShouldUseMinimal(false);
      return;
    }

    // If user is not logged in, don't use minimal mode (let AppShell handle it)
    if (!user) {
      setShouldUseMinimal(false);
      return;
    }

    // Extract form ID from pathname
    const formId = pathname.split('/s/')[1];
    if (!formId) {
      setShouldUseMinimal(false);
      return;
    }

    // Check if this form requires login
    const checkFormRequiresLogin = async () => {
      setCheckingForm(true);
      try {
        const response = await fetch(`/api/forms/public/${formId}`);
        if (response.ok) {
          const formData: FormData = await response.json();
          const requiresLogin = formData.formSettings?.accessConditions?.requireLogin;
          
          // If form requires login and user is logged in, use minimal mode
          setShouldUseMinimal(!!requiresLogin);
        } else {
          setShouldUseMinimal(false);
        }
      } catch (error) {
        console.error('Error checking form access conditions:', error);
        setShouldUseMinimal(false);
      } finally {
        setCheckingForm(false);
      }
    };

    checkFormRequiresLogin();
  }, [pathname, user, loading]);

  // Show loading while checking form conditions
  if (checkingForm) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return <AppShell minimal={shouldUseMinimal}>{children}</AppShell>;
}
