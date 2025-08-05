'use client';

import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  DropAnimation,
  defaultDropAnimation,
} from '@dnd-kit/core';
import { Canvas } from './Canvas';
import { FormField, useFormStore } from '@/store/form';
import { nanoid } from 'nanoid';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { BlockPalette } from './BlockPalette';
import { FileText, Palette, Eye, Plus, Edit2 } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FormField as FormFieldComponent } from './FormField';
import Link from 'next/link';
import { SettingsSidebar } from './SettingsSidebar';
import { Badge } from '@/components/ui/badge';

// A "tab-like" overlay for palette items
function PaletteItemOverlay({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div
      className="flex items-center gap-3 p-3 rounded-md bg-background shadow-md ring-1 ring-border"
      style={{ opacity: 0.95 }}
    >
      <div className="text-primary">{icon}</div>
      <div className="font-medium text-card-foreground text-sm">{label}</div>
    </div>
  );
}

interface FormBuilderProps {
  initialData?: {
    id: string;
    title: string;
    fields: FormField[];
    theme?: any;
    formSettings?: any;
    postSubmissionSettings?: any;
  }
}

export function FormBuilder({ initialData }: FormBuilderProps) {
  const {
    fields,
    insertField,
    moveField,
    setFields,
    theme,
    setTheme,
    resetTheme,
    formSettings,
    setFormSettings,
    postSubmissionSettings,
    setPostSubmissionSettings,
  } = useFormStore();
  const { user } = useAuth();
  const [formTitle, setFormTitle] = useState('Untitled Form');
  const [saving, setSaving] = useState(false);
  const [activeField, setActiveField] = useState<FormField | null>(null);
  const [activePaletteItem, setActivePaletteItem] = useState<{
    label: string;
    icon: React.ReactNode;
  } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 0,
        distance: 0,
      },
    }),
  );

  useEffect(() => {
    if (initialData) {
      setFields(
        initialData.fields.length > 0
          ? initialData.fields
          : [],
      );
      setFormTitle(initialData.title);
      if (initialData.theme) {
        setTheme(initialData.theme);
      }
      if (initialData.formSettings) {
        setFormSettings(initialData.formSettings);
      }
      if (initialData.postSubmissionSettings) {
        setPostSubmissionSettings(initialData.postSubmissionSettings);
      }
    } else {
      // Form is being created, but initial data is not yet available.
      // The form will be blank until the user adds fields.
      setFields([]);
      setFormTitle('Untitled Form');
    }
  }, [initialData, setFields, setTheme, setFormSettings, setPostSubmissionSettings]);

  const handleSave = async () => {
    if (!user || !initialData) { // Also check for initialData
      alert('You must be logged in and on a valid form to save.');
      return;
    }

    setSaving(true);
    const endpoint = `/api/forms/${initialData.id}`;
    const method = 'PATCH';

    // Clean up fields to ensure proper structure
    const cleanedFields = fields.map(field => {
      const cleanField = { ...field };
      
      // If there's a direct 'required' property, move it to validation
      if ((cleanField as any).required !== undefined) {
        const required = (cleanField as any).required;
        delete (cleanField as any).required;
        cleanField.validation = { 
          ...cleanField.validation, 
          required: required 
        };
      }
      
      return cleanField;
    });

    const body = {
      title: formTitle,
      fields: cleanedFields,
      theme: theme,
      formSettings: formSettings,
      postSubmissionSettings: postSubmissionSettings,
    };

    try {
      const token = await user.getIdToken();
      const response = await fetch(endpoint, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error('Failed to save form');
      }

      const savedForm = await response.json();
      
      // Visual feedback that form was saved
      const originalTitle = document.title;
      document.title = '✓ Saved';
      setTimeout(() => {
        document.title = originalTitle;
      }, 2000);
      
    } catch (error) {
      console.error('Error saving form:', error);
      alert('Failed to save form. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const isPaletteItem = active.data.current?.isPaletteItem;

    if (isPaletteItem) {
      const { label, icon } = active.data.current || {};
      setActivePaletteItem({
        label: label as string,
        icon: icon as React.ReactNode,
      });
    } else {
      const field = fields.find((f) => f.id === active.id);
      if (field) {
        setActiveField(field);
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveField(null);
    setActivePaletteItem(null);
    const { active, over } = event;
    if (!over) return;

    // Handle dropping a new field from the palette
    if (active.data.current?.isPaletteItem) {
      const fieldType = active.data.current.type;
      const newField: FormField = {
        id: nanoid(),
        type: fieldType,
        label: `New ${fieldType} Field`,
        placeholder: '',
        validation: { required: false },
      };

      if (fieldType === 'NumberInput') {
        newField.validation = { required: false, min: 0, max: 100 };
      }

      if (
        fieldType === 'RadioGroup' ||
        fieldType === 'Select' ||
        fieldType === 'Checkbox'
      ) {
        newField.options = ['Option 1'];
      }
      
      const overIndex = fields.findIndex((f) => f.id === over.id);
      const insertIndex = overIndex !== -1 ? overIndex : fields.length;
      insertField(newField, insertIndex);
      return;
    }

    // Handle reordering an existing field
    if (active.id !== over.id) {
      const oldIndex = fields.findIndex((f) => f.id === active.id);
      const newIndex = fields.findIndex((f) => f.id === over.id);
      moveField(oldIndex, newIndex);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex-1 flex h-full bg-muted/30 overflow-hidden">
        {/* Block Palette Sidebar - Responsive with scrolling */}
        <aside id="block-palette" className="w-48 lg:w-64 bg-background border-r border-border hidden lg:block flex-shrink-0 overflow-y-auto">
          <BlockPalette />
        </aside>

        <div className="flex-1 flex flex-col min-w-0">
          {/* Header - Make more responsive */}
          <header className="bg-background/80 backdrop-blur-sm border-b border-border flex-shrink-0">
            <div className="w-full px-3 sm:px-6 py-3">
              <div className="flex items-center justify-between gap-2">
                {/* Left: Project Name */}
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <div className="flex items-center gap-2 min-w-0">
                    <Input
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      className="text-sm sm:text-lg font-semibold border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 px-0 py-1 h-auto truncate"
                    />
                    <Edit2 className="h-4 w-4 text-muted-foreground/60 hover:text-muted-foreground cursor-pointer flex-shrink-0" />
                  </div>
                </div>

                {/* Center: Primary Actions - Hide some on mobile */}
                <div className="flex items-center gap-1 sm:gap-3">
                  {/* Submissions Button */}
                  <Button variant="outline" size="sm" asChild id="submissions-button">
                    <Link href={`/form/${initialData?.id}/submissions?from=edit`}>
                      <FileText className="h-4 w-4 sm:mr-2" />
                      <span className="hidden sm:inline">Submissions</span>
                    </Link>
                  </Button>

                  {/* Preview Button */}
                  <Button variant="outline" size="sm" asChild id="preview-button">
                    <Link href={`/s/${initialData?.id}`} target="_blank">
                      <Eye className="h-4 w-4 sm:mr-2" />
                      <span className="hidden sm:inline">Preview</span>
                    </Link>
                  </Button>

                  {/* Theme Button - Hide on mobile */}
                  <div className="hidden md:block">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Palette className="h-4 w-4 mr-2" />
                          Theme
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80">
                        <div className="grid gap-4">
                          <div className="space-y-2">
                            <h4 className="font-medium leading-none">Theme</h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={resetTheme}
                              className="h-auto p-1 text-xs absolute top-3 right-3"
                            >
                              Reset
                            </Button>
                            <p className="text-sm text-muted-foreground">
                              Customize the look and feel of your form.
                            </p>
                          </div>
                          <div className="grid gap-3">
                            <div className="font-medium text-sm">Colors</div>
                            <div className="grid grid-cols-2 gap-2">
                              <ColorPicker
                                label="Primary"
                                value={theme.primaryColor}
                                onChange={(value) => setTheme({ ...theme, primaryColor: value })}
                              />
                              <ColorPicker
                                label="Button Text"
                                value={theme.buttonTextColor}
                                onChange={(value) => setTheme({ ...theme, buttonTextColor: value })}
                              />
                              <ColorPicker
                                label="Question"
                                value={theme.questionTextColor}
                                onChange={(value) => setTheme({ ...theme, questionTextColor: value })}
                              />
                              <ColorPicker
                                label="Answer"
                                value={theme.answerTextColor}
                                onChange={(value) => setTheme({ ...theme, answerTextColor: value })}
                              />
                              <ColorPicker
                                label="Form BG"
                                value={theme.formBackgroundColor}
                                onChange={(value) => setTheme({ ...theme, formBackgroundColor: value })}
                              />
                              <ColorPicker
                                label="Page BG"
                                value={theme.backgroundColor}
                                onChange={(value) => setTheme({ ...theme, backgroundColor: value })}
                              />
                            </div>
                            <div className="font-medium text-sm pt-2">Style</div>
                            <div className="grid grid-cols-3 items-center gap-4">
                              <Label htmlFor="fontFamily">Font</Label>
                              <Select
                                value={theme.fontFamily}
                                onValueChange={(value) =>
                                  setTheme({ ...theme, fontFamily: value })
                                }
                              >
                                <SelectTrigger className="col-span-2 h-8">
                                  <SelectValue placeholder="Select font" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Inter, sans-serif">Inter</SelectItem>
                                  <SelectItem value="Roboto, sans-serif">Roboto</SelectItem>
                                  <SelectItem value="Poppins, sans-serif">Poppins</SelectItem>
                                  <SelectItem value="Georgia, serif">Georgia</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="grid grid-cols-3 items-center gap-4">
                              <Label>Border</Label>
                               <input
                                 type="color"
                                 value={theme.borderColor}
                                 onChange={(e) => setTheme({ ...theme, borderColor: e.target.value })}
                                 className="w-full h-8 p-0 bg-white border-none rounded-md cursor-pointer"
                               />
                               <UnitInput
                                 value={theme.borderWidth}
                                 onChange={(value) => setTheme({ ...theme, borderWidth: value })}
                                 suffix="px"
                               />
                            </div>
                            <div className="grid grid-cols-3 items-center gap-4">
                             <Label>Radius</Label>
                             <UnitInput
                               value={theme.borderRadius}
                               onChange={(value) => setTheme({ ...theme, borderRadius: value })}
                               className="col-span-2"
                               suffix="px"
                             />
                            </div>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Right: Save Button */}
                <div className="flex items-center justify-end">
                  <Button 
                    onClick={handleSave} 
                    disabled={saving}
                    size="sm"
                    id="publish-button"
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        <span className="hidden sm:inline">Saving...</span>
                      </>
                    ) : (
                      <>
                        <span className="hidden sm:inline">Save Changes</span>
                        <span className="sm:hidden">Save</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </header>

          {/* Main content */}
          <main className="flex-1 flex min-h-0 overflow-hidden">
            <div className="flex-1 relative min-w-0 overflow-y-auto">
              <Canvas id="form-canvas" formTitle={formTitle} />
            </div>
            
            {/* Settings Sidebar - Responsive and sticky */}
            <aside id="settings-sidebar" className="w-72 xl:w-80 bg-background border-l border-border flex-shrink-0 overflow-y-auto">
              <SettingsSidebar />
            </aside>
          </main>
        </div>
      </div>
      <DragOverlay dropAnimation={defaultDropAnimation}>
        {activeField && <FormFieldComponent field={activeField} isOverlay />}
        {activePaletteItem && (
          <PaletteItemOverlay {...activePaletteItem} />
        )}
      </DragOverlay>
    </DndContext>
  );
}

function ColorPicker({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void; }) {
  return (
    <div>
      <Label className="text-sm">{label}</Label>
      <div className="relative h-8 mt-1">
        <input
          type="color"
          value={value || '#000000'}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div
          className="w-full h-full rounded-md border border-border"
          style={{ backgroundColor: value || '#000000' }}
        />
      </div>
    </div>
  );
}

function UnitInput({ value, onChange, suffix, className }: { value: number; onChange: (value: number) => void; suffix: string; className?: string; }) {
  return (
    <div className={`relative ${className}`}>
      <Input
        type="number"
        value={value || 0}
        onChange={(e) => onChange(e.target.valueAsNumber || 0)}
        className="h-8 pr-8"
     
      />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
        {suffix}
      </span>
    </div>
  );
} 