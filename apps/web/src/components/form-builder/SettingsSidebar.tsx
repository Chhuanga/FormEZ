'use client';

import { useState } from 'react';
// import { ThemeSettings } from './ThemeSettings';
import { SettingsTabs } from './SettingsTabs';
import { FormHeaderSettings } from './FormHeaderSettings';
import { useFormStore } from '@/store/form';
import { Eye, Brush, Settings, Send, Image } from 'lucide-react';
import { PostSubmissionSettings } from './PostSubmissionSettings';

function NoFieldSelected() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-6 bg-muted/50">
      <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center mb-4">
        <Eye className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="font-semibold">No field selected</h3>
      <p className="text-sm text-muted-foreground mt-1">
        Click on a field in the canvas to see its settings here.
      </p>
    </div>
  );
}


export function SettingsSidebar() {
  const { fields, selectedFieldId, setSelectedFieldId } = useFormStore();
  const [view, setView] = useState<'field' | 'header' | 'theme' | 'post-submission'>('field');

  const selectedField = fields.find((f) => f.id === selectedFieldId);

  // If a field is selected, always show field settings
  // If not, show the last active view (header, theme or post-submission)
  const currentView = selectedFieldId ? 'field' : view;

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Main Content Area - With sticky header */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 overflow-y-auto">
          {currentView === 'field' && selectedFieldId && selectedField && (
            <SettingsTabs key={selectedFieldId} field={selectedField} />
          )}
          {currentView === 'field' && !selectedFieldId && (
             <NoFieldSelected />
          )}
          {currentView === 'header' && <FormHeaderSettings />}
          {/* {currentView === 'theme' && <ThemeSettings />} */}
          {currentView === 'post-submission' && <PostSubmissionSettings />}
        </div>
      </div>

      {/* Sidebar Navigation - Sticky at bottom */}
      <div className="flex justify-around p-2 border-t border-border bg-background/95 backdrop-blur-sm sticky bottom-0 flex-shrink-0">
        <button
          onClick={() => {
            setView('field');
            // If you want to clear selection when clicking this, uncomment next line
            // setSelectedFieldId(null);
          }}
          className={`flex-1 flex flex-col items-center justify-center py-2 rounded-md transition-colors ${currentView === 'field' ? 'text-primary bg-muted' : 'text-muted-foreground hover:bg-muted/50'}`}
          title="Field Settings"
        >
          <Settings className="h-4 w-4 mb-1" />
          <span className="text-xs font-medium">Field</span>
        </button>
        
        <button
          onClick={() => {
            setView('header');
            setSelectedFieldId(null);
          }}
          className={`flex-1 flex flex-col items-center justify-center py-2 rounded-md transition-colors ${currentView === 'header' ? 'text-primary bg-muted' : 'text-muted-foreground hover:bg-muted/50'}`}
          title="Form Header"
        >
          <Image className="h-4 w-4 mb-1" />
          <span className="text-xs font-medium">Header</span>
        </button>
        
        {/* <button
          onClick={() => {
            setView('theme');
            setSelectedFieldId(null);
          }}
          className={`flex-1 flex flex-col items-center justify-center py-2 rounded-md ${currentView === 'theme' ? 'text-primary bg-muted' : 'text-muted-foreground hover:bg-muted/50'}`}
          title="Theme"
        >
          <Brush className="h-5 w-5 mb-1" />
           <span className="text-xs font-medium">Theme</span>
        </button> */}
        
        <button
          onClick={() => {
            setView('post-submission');
            setSelectedFieldId(null);
          }}
          className={`flex-1 flex flex-col items-center justify-center py-2 rounded-md transition-colors ${currentView === 'post-submission' ? 'text-primary bg-muted' : 'text-muted-foreground hover:bg-muted/50'}`}
          title="Post Submission"
        >
          <Send className="h-4 w-4 mb-1" />
           <span className="text-xs font-medium">After</span>
        </button>
      </div>
    </div>
  );
} 