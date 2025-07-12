'use client';

import { Button } from '@/components/ui/button';
import { BarChart3, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ResponsesPage() {
  return (
    <div className="flex-1 p-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-gray-200/50 shadow-lg p-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">All Responses</h1>
              <p className="text-muted-foreground mt-1">
                View and analyze responses across all your forms
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Coming Soon Content */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-gray-200/50 shadow-lg p-8">
        <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-border rounded-lg bg-accent/50">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <BarChart3 className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Unified Responses Dashboard</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            Coming soon! View and analyze responses from all your forms in one centralized dashboard with advanced filtering and export capabilities.
          </p>
          <Button asChild>
            <Link href="/dashboard">
              Back to My Forms
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
} 