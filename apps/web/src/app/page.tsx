'use client';

import { useAuth } from "@/context/AuthContext";
import { FormBuilder } from "@/components/form-builder/FormBuilder";
import { LandingPage } from "@/components/landing/LandingPage";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.replace('/dashboard');
    }
  }, [user, router]);

  const handleGetStarted = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error("Error signing in with Google", error);
      
      // Provide specific error messages for common issues
      let errorMessage = "Authentication failed. Please try again.";
      
      switch (error.code) {
        case 'auth/internal-error':
          errorMessage = "Authentication service configuration error. Please check your Firebase setup.";
          break;
        case 'auth/invalid-api-key':
          errorMessage = "Invalid API key. Please check your Firebase configuration.";
          break;
        case 'auth/unauthorized-domain':
          errorMessage = "This domain is not authorized. Please add it to your Firebase project.";
          break;
        case 'auth/operation-not-allowed':
          errorMessage = "Google sign-in is not enabled. Please enable it in your Firebase console.";
          break;
        case 'auth/popup-closed-by-user':
          errorMessage = "Sign-in cancelled. Please try again.";
          return; // Don't show error for user cancellation
        case 'auth/popup-blocked':
          errorMessage = "Pop-up blocked by browser. Please allow pop-ups and try again.";
          break;
        default:
          errorMessage = `Authentication failed: ${error.message}`;
      }
      
      alert(errorMessage);
    }
  };

  if (loading || user) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          Loading...
        </div>
      </div>
    );
  }

    return <LandingPage onGetStarted={handleGetStarted} />;
}
