import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { arrayMove } from '@dnd-kit/sortable';
import { produce } from 'immer';

export type Option = {
  label: string;
  value: string;
};

export type FormField = {
  id: string;
  type:
    | 'Input'
    | 'Textarea'
    | 'Email'
    | 'RadioGroup'
    | 'Select'
    | 'Checkbox'
    | 'DatePicker'
    | 'Number'
    | 'NumberInput'
    | 'FileUpload';
  label: string;
  description?: string;
  options?: (string | Option)[];
  placeholder?: string;
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
  };
  conditionalLogic?: {
    fieldId: string;
    operator: string;
    value: string;
  } | null;
};

export interface Theme {
  backgroundColor: string;
  formBackgroundColor: string;
  questionTextColor: string;
  answerTextColor: string;
  primaryColor: string;
  buttonTextColor: string;
  fontFamily: string;
  borderColor: string;
  borderWidth: number;
  borderRadius: number;
  textColor: string;
}

export interface FormSettings {
  titleIcon?: string; // Lucide icon name or emoji
  coverImage?: string; // URL to cover image
}

const defaultTheme: Theme = {
  backgroundColor: '#F3F4F6',
  formBackgroundColor: '#FFFFFF',
  questionTextColor: '#111827',
  answerTextColor: '#374151',
  primaryColor: '#3B82F6',
  buttonTextColor: '#FFFFFF',
  fontFamily: 'Inter, sans-serif',
  borderColor: '#E5E7EB',
  borderWidth: 1,
  borderRadius: 8,
  textColor: '#000000',
};

export type FormState = {
  fields: FormField[];
  theme: Theme;
  formSettings: FormSettings;
  selectedFieldId: string | null;
  setTheme: (theme: Partial<Theme>) => void;
  resetTheme: () => void;
  setFormSettings: (settings: Partial<FormSettings>) => void;
  addField: (field: FormField) => void;
  insertField: (field: FormField, index: number) => void;
  moveField: (oldIndex: number, newIndex: number) => void;
  setFields: (fields: FormField[]) => void;
  updateField: (id: string, updates: Partial<FormField>) => void;
  addOption: (fieldId: string) => void;
  removeOption: (fieldId: string, optionIndex: number) => void;
  updateOption: (fieldId: string, optionIndex: number, value: string | Option) => void;
  setSelectedFieldId: (id: string | null) => void;
  removeField: (id: string) => void;
  postSubmissionSettings: any;
  setPostSubmissionSettings: (settings: any) => void;
};

const initialFormState = {
  fields: [],
  selectedField: null,
  theme: {},
  formSettings: {},
  postSubmissionSettings: {
    type: 'message',
    message: 'Thanks for your submission!',
  },
};

export const useFormStore = create<FormState>()(
  devtools((set) => ({
    fields: [],
    theme: defaultTheme,
    formSettings: {},
    selectedFieldId: null,
    setTheme: (newTheme) =>
      set((state) => ({ theme: { ...state.theme, ...newTheme } })),
    resetTheme: () => set({ theme: defaultTheme }),
    setFormSettings: (newSettings) =>
      set((state) => ({ formSettings: { ...state.formSettings, ...newSettings } })),
    addField: (field) =>
      set((state) => ({
        fields: [...state.fields, field],
      })),
    insertField: (field, index) =>
      set((state) => ({
        fields: [
          ...state.fields.slice(0, index),
          field,
          ...state.fields.slice(index),
        ],
      })),
    moveField: (oldIndex, newIndex) =>
      set((state) => ({
        fields: arrayMove(state.fields, oldIndex, newIndex),
      })),
    setFields: (fields) => set({ fields }),
    updateField: (id, updates) =>
      set(
        produce((state: FormState) => {
          const field = state.fields.find((f) => f.id === id);
          if (field) {
            Object.assign(field, updates);
          }
        })
      ),
    addOption: (fieldId) =>
      set(
        produce((state: FormState) => {
          const field = state.fields.find((f) => f.id === fieldId);
          if (field) {
            if (!field.options) {
              field.options = [];
            }
            const newOption = `Option ${field.options.length + 1}`;
            if (field.type === 'Select' || field.type === 'RadioGroup' || field.type === 'Checkbox') {
              field.options.push({ label: newOption, value: newOption.toLowerCase().replace(/\s+/g, '_') });
            } else {
              field.options.push(newOption);
            }
          }
        })
      ),
    removeOption: (fieldId, optionIndex) =>
      set(
        produce((state: FormState) => {
          const field = state.fields.find((f) => f.id === fieldId);
          if (field && field.options) {
            field.options.splice(optionIndex, 1);
          }
        })
      ),
    updateOption: (fieldId, optionIndex, value) =>
      set(
        produce((state: FormState) => {
          const field = state.fields.find((f) => f.id === fieldId);
          if (field && field.options) {
            field.options[optionIndex] = value;
          }
        })
      ),
    setSelectedFieldId: (id) => set({ selectedFieldId: id }),
    removeField: (id) =>
      set((state) => ({
        fields: state.fields.filter((field) => field.id !== id),
        selectedFieldId: state.selectedFieldId === id ? null : state.selectedFieldId,
      })),
    postSubmissionSettings: initialFormState.postSubmissionSettings,
    setPostSubmissionSettings: (settings) => set({ postSubmissionSettings: settings }),
  }))
); 