'use client';

import React, { useState } from 'react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, AlertCircle, LogIn } from 'lucide-react';

interface RestrictedFormAccessProps {
  onAuthSuccess: () => void;
  formTitle: string;
  allowedEmailDomains?: string[];
}

export function RestrictedFormAccess({ 
  onAuthSuccess, 
  formTitle, 
  allowedEmailDomains = [] 
}: RestrictedFormAccessProps) {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    setError(null);
    
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Check if email domain is allowed (if restrictions exist)
      if (allowedEmailDomains.length > 0) {
        const userEmail = result.user.email;
        if (!userEmail) {
          throw new Error('Unable to retrieve your email address.');
        }
        
        const userDomain = userEmail.split('@')[1];
        if (!allowedEmailDomains.includes(userDomain)) {
          // Sign out the user if their domain is not allowed
          await auth.signOut();
          throw new Error(`Access restricted. Only users from ${allowedEmailDomains.join(', ')} are allowed to access this form.`);
        }
      }
      
      onAuthSuccess();
    } catch (error: any) {
      console.error('Error signing in:', error);
      
      let errorMessage = 'Authentication failed. Please try again.';
      
      switch (error.code) {
        case 'auth/popup-blocked':
          errorMessage = 'Popup was blocked. Please allow popups and try again.';
          break;
        case 'auth/popup-closed-by-user':
          errorMessage = 'Sign-in was cancelled. Please try again.';
          break;
        case 'auth/unauthorized-domain':
          errorMessage = 'This domain is not authorized. Please contact the form owner.';
          break;
        default:
          errorMessage = error.message || errorMessage;
      }
      
      setError(errorMessage);
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Shield className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-xl font-semibold">Authentication Required</CardTitle>
          <CardDescription className="text-gray-600">
            You need to sign in to access "<strong>{formTitle}</strong>"
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {allowedEmailDomains.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                <div className="text-sm">
                  <p className="text-amber-800 font-medium">Access Restricted</p>
                  <p className="text-amber-700">
                    Only users with email addresses from these domains can access this form:
                  </p>
                  <ul className="mt-1 text-amber-700 font-mono text-xs">
                    {allowedEmailDomains.map(domain => (
                      <li key={domain}>• @{domain}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}
          
          <Button 
            onClick={handleGoogleSignIn}
            disabled={isSigningIn}
            className="w-full"
            size="lg"
          >
            {isSigningIn ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Signing in...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <LogIn className="h-4 w-4" />
                Sign in with Google
              </div>
            )}
          </Button>
          
          <p className="text-xs text-gray-500 text-center">
            By signing in, you agree to access this form in accordance with the owner's access conditions.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
