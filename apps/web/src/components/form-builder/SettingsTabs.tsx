'use client';

import React from 'react';
import {
  FormField as FormFieldType,
} from '@/store/form';
import {
  FieldSettings,
  ValidationSettings,
  ConditionalLogicSettings,
} from './FormField';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { CheckSquare, Zap } from 'lucide-react';

export function SettingsTabs({ field }: { field: FormFieldType }) {
  if (!field) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-muted/30 rounded-lg">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <CheckSquare className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground">Select a field to get started</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Click on any field in your form to see its settings here.
        </p>
      </div>
    );
  }

  return (
    <Tabs defaultValue="field" className="w-full h-full flex flex-col">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="field">
          <CheckSquare className="h-4 w-4 mr-2" />
          Field
          </TabsTrigger>
        <TabsTrigger value="validation">
          <CheckSquare className="h-4 w-4 mr-2" />
          Rules
          </TabsTrigger>
        <TabsTrigger value="logic">
          <Zap className="h-4 w-4 mr-2" />
          Logic
          </TabsTrigger>
        </TabsList>
      <TabsContent value="field" className="flex-grow p-6 overflow-y-auto">
          <FieldSettings field={field} />
        </TabsContent>
      <TabsContent value="validation" className="flex-grow p-6 overflow-y-auto">
          <ValidationSettings field={field} />
        </TabsContent>
      <TabsContent value="logic" className="flex-grow p-6 overflow-y-auto">
          <ConditionalLogicSettings field={field} />
        </TabsContent>
    </Tabs>
  );
} 