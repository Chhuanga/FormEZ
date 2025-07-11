'use client';

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { TextHoverEffect } from "@/components/ui/text-hover-effect";
import { AnimatedBackground } from "@/components/ui/animated-background";

interface LandingPageProps {
  onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden flex items-center justify-center">
      {/* Static background gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900"></div>
      
      {/* Animated background with particles and moving gradients */}
      <AnimatedBackground />

      {/* Main Content */}
      <div className="relative z-10 text-center space-y-12 px-4">
        <div className="h-46 lg:h-60 w-full max-w-4xl mx-auto">
          <TextHoverEffect text="FormEz" duration={0.5} />
          </div>
          
                  <div>
          <Button 
            onClick={onGetStarted}
            size="lg" 
            className="bg-white text-black hover:bg-gray-100 font-medium px-8 py-4 text-lg h-auto"
          >
            Get Started
            <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
        </div>
        </div>
    </div>
  );
} 