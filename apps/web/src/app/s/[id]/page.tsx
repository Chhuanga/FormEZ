'use client';

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useParams } from 'next/navigation';
import { FormField as FormFieldType, Theme } from '@/store/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Calendar as CalendarIcon, CheckCircle, AlertCircle, HelpCircle, Send } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface Form {
  id: string;
  title: string;
  fields: FormFieldType[];
  theme: Theme;
  postSubmissionSettings: {
    type: 'message' | 'redirect';
    message?: string;
    url?: string;
  };
  branding?: {
    logoUrl?: string;
    companyName?: string;
    privacyNote?: string;
  };
}

// Helper function to get smart placeholder text
const getSmartPlaceholder = (field: FormFieldType): string => {
  if (field.placeholder) return field.placeholder;
  
  const label = field.label.toLowerCase();
  
  // Smart placeholder generation based on field type and label
  switch (field.type) {
    case 'Textarea':
      if (label.includes('feedback') || label.includes('comment')) return 'Share your thoughts and feedback...';
      if (label.includes('improve') || label.includes('suggestion')) return 'Tell us how we can improve...';
      if (label.includes('experience')) return 'Describe your experience...';
      if (label.includes('message') || label.includes('note')) return 'Type your message here...';
      if (label.includes('reason') || label.includes('why')) return 'Please explain your reasoning...';
      return 'Please provide details...';
      
    case 'Input':
      if (label.includes('name')) return 'e.g. John Doe';
      if (label.includes('company') || label.includes('organization')) return 'e.g. Acme Corp';
      if (label.includes('job') || label.includes('title') || label.includes('position')) return 'e.g. Software Engineer';
      if (label.includes('phone')) return 'e.g. (555) 123-4567';
      if (label.includes('address')) return 'e.g. 123 Main St';
      if (label.includes('city')) return 'e.g. New York';
      if (label.includes('website') || label.includes('url')) return 'e.g. https://example.com';
      return 'Type your answer...';
      
    case 'Email':
      return 'e.g. john.doe@example.com';
      
    case 'NumberInput':
      if (label.includes('age')) return 'e.g. 25';
      if (label.includes('year')) return 'e.g. 2024';
      if (label.includes('amount') || label.includes('price') || label.includes('cost')) return 'e.g. 100';
      return 'Enter a number...';
      
    default:
      return 'Type your answer here...';
  }
};

// Helper function to determine if a field needs help tooltip
const needsHelpTooltip = (field: FormFieldType): string | null => {
  const label = field.label.toLowerCase();
  
  if (label.includes('scale') && label.includes('10')) {
    return 'Rate from 1 (lowest) to 10 (highest)';
  }
  if (label.includes('likely') && label.includes('recommend')) {
    return 'How likely are you to recommend us to others?';
  }
  if (label.includes('gdpr') || label.includes('privacy') || label.includes('terms')) {
    return 'Please review our privacy policy and terms of service';
  }
  if (label.includes('budget') || label.includes('price range')) {
    return 'Select the range that best fits your budget';
  }
  if (label.includes('urgency') || label.includes('priority')) {
    return 'How urgent is this request?';
  }
  if (field.validation?.required && (label.includes('optional') || label.includes('if any'))) {
    return 'This field is actually required for processing';
  }
  
  return null;
};

// Progress Bar Component with animation
const ProgressBar = ({ progress, theme }: { progress: number; theme: Theme }) => (
  <div className="w-full mb-8">
    <div className="flex justify-between text-sm mb-2">
      <span style={{ color: theme.questionTextColor }}>Progress</span>
      <span style={{ color: theme.questionTextColor }} className="transition-all duration-300">
        {Math.round(progress)}%
      </span>
    </div>
    <div 
      className="w-full bg-gray-200 rounded-full h-2 overflow-hidden"
      style={{ backgroundColor: theme.borderColor }}
    >
      <div
        className="h-2 rounded-full transition-all duration-500 ease-out transform"
        style={{
          width: `${progress}%`,
          backgroundColor: theme.primaryColor,
          boxShadow: progress > 0 ? `0 0 10px ${theme.primaryColor}40` : 'none',
        }}
      />
    </div>
  </div>
);

// Section Divider Component with fade-in animation
const SectionDivider = ({ theme }: { theme: Theme }) => (
  <div 
    className="my-8 border-t border-dashed opacity-30 animate-in fade-in duration-700"
    style={{ borderColor: theme.borderColor }}
  />
);

// Enhanced Number Slider Component with improved animations
const NumberSlider = ({ 
  field, 
  value, 
  onChange, 
  theme,
  onNext 
}: { 
  field: FormFieldType; 
  value: number | undefined; 
  onChange: (value: number) => void; 
  theme: Theme;
  onNext?: () => void;
}) => {
  const min = 1;
  const max = field.label?.includes('scale of 1-10') ? 10 : 
             field.label?.includes('1-5') ? 5 : 10;
  
  const handleChange = (newValue: number) => {
    onChange(newValue);
    // Auto-advance for rating scales after a short delay
    if (field.validation?.required && onNext) {
      setTimeout(onNext, 800);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between text-sm" style={{ color: theme.answerTextColor }}>
        <span className="animate-in slide-in-from-left duration-300">{min}</span>
        <span className="animate-in slide-in-from-right duration-300">{max}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value || min}
        onChange={(e) => handleChange(parseInt(e.target.value))}
        className="w-full h-3 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 hover:h-4"
        style={{
          background: `linear-gradient(to right, ${theme.primaryColor} 0%, ${theme.primaryColor} ${((value || min) - min) / (max - min) * 100}%, ${theme.borderColor} ${((value || min) - min) / (max - min) * 100}%, ${theme.borderColor} 100%)`,
          '--tw-ring-color': theme.primaryColor,
        } as React.CSSProperties}
        aria-label={field.label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value || min}
      />
      <div className="text-center">
        <span 
          className="inline-block px-4 py-2 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105 animate-in zoom-in"
          style={{ 
            backgroundColor: theme.primaryColor, 
            color: theme.buttonTextColor,
            boxShadow: `0 4px 12px ${theme.primaryColor}40`,
          }}
        >
          {value || min}
        </span>
      </div>
    </div>
  );
};

// Enhanced Radio Group with animations and auto-focus
const EnhancedRadioGroup = ({ 
  field, 
  value, 
  onChange, 
  theme,
  error,
  onNext 
}: { 
  field: FormFieldType; 
  value: string | undefined; 
  onChange: (value: string) => void; 
  theme: Theme;
  error?: string;
  onNext?: () => void;
}) => {
  const handleChange = (newValue: string) => {
    onChange(newValue);
    // Auto-advance for single selections after animation
    if (field.validation?.required && onNext) {
      setTimeout(onNext, 600);
    }
  };

  return (
    <RadioGroup value={value} onValueChange={handleChange} className="space-y-3">
      {field.options?.map((option, index) => {
        const optionValue = typeof option === 'object' ? option.value : option;
        const optionLabel = typeof option === 'object' ? option.label : option;
        return (
          <div 
            key={index} 
            className="relative animate-in slide-in-from-left duration-300"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <label
                          className={cn(
              "flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 hover:shadow-sm hover:scale-[1.01] active:scale-[0.99]",
              value === optionValue ? "border-current shadow-md scale-[1.01]" : "border-gray-200 hover:border-gray-300",
              error ? "border-red-300" : ""
            )}
              style={{
                borderColor: value === optionValue ? theme.primaryColor : theme.borderColor,
                backgroundColor: value === optionValue ? `${theme.primaryColor}15` : 'transparent',
                boxShadow: value === optionValue ? `0 4px 20px ${theme.primaryColor}20` : undefined,
              }}
              htmlFor={`${field.id}-${index}`}
            >
              <RadioGroupItem
                value={optionValue}
                id={`${field.id}-${index}`}
                className="text-lg transition-all duration-200"
                style={{ '--tw-ring-color': theme.primaryColor } as React.CSSProperties}
                aria-describedby={error ? `${field.id}-error` : undefined}
              />
              <span className="flex-1 text-base" style={{ color: theme.answerTextColor }}>{optionLabel}</span>
            </label>
          </div>
        )
      })}
    </RadioGroup>
  );
};

// Enhanced Checkbox Group with staggered animations
const EnhancedCheckboxGroup = ({ 
  field, 
  value, 
  onChange, 
  theme,
  error 
}: { 
  field: FormFieldType; 
  value: string[] | undefined; 
  onChange: (value: string[]) => void; 
  theme: Theme;
  error?: string;
}) => (
  <div className="space-y-3">
    {field.options?.map((option, index) => {
      const optionValue = typeof option === 'object' ? option.value : option;
      const optionLabel = typeof option === 'object' ? option.label : option;
      const isChecked = value?.includes(optionValue);

      return (
        <div 
          key={index} 
          className="relative animate-in slide-in-from-left duration-300"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <label
            className={cn(
              "flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 hover:shadow-sm hover:scale-[1.01] active:scale-[0.99]",
              isChecked ? "border-current shadow-md scale-[1.01]" : "border-gray-200 hover:border-gray-300",
              error ? "border-red-300" : ""
            )}
            style={{
              borderColor: isChecked ? theme.primaryColor : theme.borderColor,
              backgroundColor: isChecked ? `${theme.primaryColor}15` : 'transparent',
              boxShadow: isChecked ? `0 4px 20px ${theme.primaryColor}20` : 'none',
            }}
            htmlFor={`${field.id}-${index}`}
          >
            <Checkbox
              id={`${field.id}-${index}`}
              checked={isChecked}
              onCheckedChange={(checked) => {
                const newValue = checked
                  ? [...(value || []), optionValue]
                  : (value || []).filter((v) => v !== optionValue);
                onChange(newValue);
              }}
              className="text-lg transition-all"
              style={{ '--tw-ring-color': theme.primaryColor } as React.CSSProperties}
              aria-describedby={error ? `${field.id}-error` : undefined}
            />
            <span className="flex-1 text-base" style={{ color: theme.answerTextColor }}>
              {optionLabel}
            </span>
          </label>
        </div>
      )
    })}
    {error && (
      <p id={`${field.id}-error`} className="text-sm font-medium text-red-500 animate-in fade-in">
        {error}
      </p>
    )}
  </div>
);

// Inline validation feedback component with animations
const ValidationFeedback = ({ 
  error, 
  success, 
  fieldId 
}: { 
  error?: string; 
  success?: boolean; 
  fieldId: string;
}) => {
  if (error) {
    return (
      <div 
        className="flex items-center mt-2 text-red-600 animate-in slide-in-from-top duration-300" 
        id={`${fieldId}-error`} 
        role="alert"
      >
        <AlertCircle className="h-4 w-4 mr-2 animate-pulse" />
        <span className="text-sm">{error}</span>
      </div>
    );
  }
  
  if (success) {
    return (
      <div className="flex items-center mt-2 text-green-600 animate-in slide-in-from-top duration-300">
        <CheckCircle className="h-4 w-4 mr-2" />
        <span className="text-sm">✓ Valid</span>
      </div>
    );
  }
  
  return null;
};

// Help Tooltip Component
const HelpTooltip = ({ content, theme }: { content: string; theme: Theme }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="ml-2 p-1 rounded-full hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
          style={{ '--tw-ring-color': theme.primaryColor } as React.CSSProperties}
          aria-label="Help information"
        >
          <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors duration-200" />
        </button>
      </TooltipTrigger>
      <TooltipContent 
        className="max-w-xs text-sm animate-in fade-in zoom-in duration-200"
        style={{ backgroundColor: theme.primaryColor, color: theme.buttonTextColor }}
      >
        <p>{content}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

// Privacy Note Component
const PrivacyNote = ({ note, theme }: { note: string; theme: Theme }) => (
  <div className="mt-6 p-4 rounded-lg border border-dashed opacity-60 animate-in fade-in duration-500">
    <div className="flex items-start space-x-2">
      <div className="flex-shrink-0 mt-0.5">
        <svg className="h-4 w-4" style={{ color: theme.primaryColor }} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
        </svg>
      </div>
      <p className="text-sm leading-relaxed" style={{ color: theme.answerTextColor }}>
        <span className="font-medium" style={{ color: theme.questionTextColor }}>Privacy:</span>{' '}
        {note}
      </p>
    </div>
  </div>
);

// Form Header with Branding
const FormHeader = ({ form, theme }: { form: Form; theme: Theme }) => (
  <div className="mb-6 sm:mb-8">
    {/* Logo/Branding Section */}
    {(form.branding?.logoUrl || form.branding?.companyName) && (
      <div className="flex items-center justify-center mb-6 animate-in slide-in-from-top duration-300">
        {form.branding.logoUrl && (
          <img 
            src={form.branding.logoUrl} 
            alt={form.branding.companyName || 'Company logo'} 
            className="h-12 w-auto max-w-[200px] object-contain"
          />
        )}
        {!form.branding.logoUrl && form.branding.companyName && (
          <div 
            className="text-2xl font-bold px-4 py-2 rounded-lg"
            style={{ 
              backgroundColor: `${theme.primaryColor}15`,
              color: theme.primaryColor 
            }}
          >
            {form.branding.companyName}
          </div>
        )}
      </div>
    )}
    
    {/* Form Title */}
    <h1 
      id="form-title"
      style={{color: theme.questionTextColor}} 
      className="text-2xl sm:text-3xl font-bold text-center animate-in slide-in-from-top duration-500"
    >
      {form.title}
    </h1>
  </div>
);

// Enhanced Field Label Component
const FieldLabel = ({ field, theme, helpContent }: { 
  field: FormFieldType; 
  theme: Theme; 
  helpContent?: string | null;
}) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center">
      <Label 
        style={{color: theme.questionTextColor}} 
        className="text-lg font-medium block" 
        htmlFor={field.id}
      >
        {field.label}
        {field.validation?.required ? (
          <span className="text-red-500 ml-1" aria-label="required">*</span>
        ) : (
          <span 
            className="ml-2 text-sm font-normal opacity-60"
            style={{ color: theme.answerTextColor }}
          >
            (optional)
          </span>
        )}
      </Label>
      
      {/* Help tooltip */}
      {helpContent && (
        <HelpTooltip content={helpContent} theme={theme} />
      )}
    </div>
  </div>
);

const isFieldVisible = (field: FormFieldType, answers: any): boolean => {
  const logic = field.conditionalLogic;
  if (!logic || !logic.fieldId) {
    return true;
  }

  const dependentValue = answers[logic.fieldId]?.value;
  if (dependentValue === undefined) {
    return false;
  }

  switch (logic.operator) {
    case 'equals':
      return dependentValue === logic.value;
    case 'not_equals':
      return dependentValue !== logic.value;
    default:
      return true;
  }
};

const renderField = (
  field: FormFieldType, 
  answers: any, 
  setAnswers: any, 
  theme: Theme, 
  errors: Record<string, string>,
  setErrors: (errors: any) => void,
  fieldRefs: Record<string, React.RefObject<HTMLInputElement | HTMLTextAreaElement | null>>,
  visibleFields: FormFieldType[],
  onNext?: () => void
) => {
  const inputStyle = {
    color: theme.answerTextColor,
    borderColor: theme.borderColor,
    '--tw-ring-color': theme.primaryColor,
  } as React.CSSProperties;

  const value = answers[field.id]?.value;
  const error = errors[field.id];
  const hasValue = value !== undefined && value !== null && value !== '';
  const placeholder = getSmartPlaceholder(field);

  const handleValueChange = (newValue: any) => {
    setAnswers((prev: any) => ({ ...prev, [field.id]: { value: newValue } }));
    
    // Clear error for this field
    setErrors((prev: any) => {
      const newErrors = { ...prev };
      delete newErrors[field.id];
      return newErrors;
    });
  };

  // Enhanced input validation
  const validateField = (value: any) => {
    if (field.validation?.required) {
      if (!value || value === '' || (Array.isArray(value) && value.length === 0)) {
        return 'This field is required.';
      }
    }
    
    if (field.type === 'Email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return 'Please enter a valid email address.';
      }
    }
    
    if (field.validation?.minLength && value && value.length < field.validation.minLength) {
      return `Minimum ${field.validation.minLength} characters required.`;
    }
    
    return null;
  };

  const handleBlur = () => {
    const validationError = validateField(value);
    if (validationError) {
      setErrors((prev: any) => ({ ...prev, [field.id]: validationError }));
    }
  };

  // Auto-focus helper
  const focusNextField = () => {
    if (!onNext) return;
    setTimeout(onNext, 300);
  };
  
  switch (field.type) {
    case 'Input':
      return (
        <div className="animate-in slide-in-from-bottom duration-500">
          <Input 
            ref={fieldRefs[field.id] as React.RefObject<HTMLInputElement | null>}
            style={inputStyle} 
            placeholder={placeholder}
            value={value || ''}
            onChange={(e) => handleValueChange(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && hasValue) {
                e.preventDefault();
                focusNextField();
              }
            }}
            className={cn(
              "transition-all duration-300 focus:scale-[1.01] hover:shadow-sm",
              error && "border-red-300 focus:border-red-500"
            )}
            aria-invalid={!!error}
            aria-describedby={error ? `${field.id}-error` : undefined}
          />
          <ValidationFeedback 
            error={error} 
            success={!error && hasValue && field.validation?.required} 
            fieldId={field.id}
          />
        </div>
      );
    
    case 'Textarea':
      return (
        <div className="animate-in slide-in-from-bottom duration-500">
          <Textarea 
            ref={fieldRefs[field.id] as React.RefObject<HTMLTextAreaElement | null>}
            style={inputStyle} 
            placeholder={placeholder}
            value={value || ''}
            onChange={(e) => handleValueChange(e.target.value)}
            onBlur={handleBlur}
            className={cn(
              "transition-all duration-300 focus:scale-[1.01] hover:shadow-sm min-h-[100px] resize-y",
              error && "border-red-300 focus:border-red-500"
            )}
            aria-invalid={!!error}
            aria-describedby={error ? `${field.id}-error` : undefined}
          />
          <ValidationFeedback 
            error={error} 
            success={!error && hasValue && field.validation?.required} 
            fieldId={field.id}
          />
        </div>
      );
      
    case 'Email':
      return (
        <div className="animate-in slide-in-from-bottom duration-500">
          <Input 
            ref={fieldRefs[field.id] as React.RefObject<HTMLInputElement | null>}
            style={inputStyle} 
            type="email" 
            placeholder={placeholder}
            value={value || ''}
            onChange={(e) => handleValueChange(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && hasValue && !validateField(value)) {
                e.preventDefault();
                focusNextField();
              }
            }}
            className={cn(
              "transition-all duration-300 focus:scale-[1.01] hover:shadow-sm",
              error && "border-red-300 focus:border-red-500"
            )}
            aria-invalid={!!error}
            aria-describedby={error ? `${field.id}-error` : undefined}
          />
          <ValidationFeedback 
            error={error} 
            success={!error && hasValue && field.validation?.required} 
            fieldId={field.id}
          />
        </div>
      );
      
    case 'Number':
    case 'NumberInput':
      // Check if this is a scale question - use slider for better UX
      const isScaleQuestion = field.label?.toLowerCase().includes('scale') || 
                             field.label?.toLowerCase().includes('rate') ||
                             field.label?.toLowerCase().includes('1-10') ||
                             field.label?.toLowerCase().includes('1-5');
      
      if (isScaleQuestion) {
        return (
          <div className="animate-in slide-in-from-bottom duration-500">
            <NumberSlider
              field={field}
              value={value}
              onChange={handleValueChange}
              theme={theme}
              onNext={focusNextField}
            />
            <ValidationFeedback 
              error={error} 
              success={!error && hasValue && field.validation?.required} 
              fieldId={field.id}
            />
          </div>
        );
      }
      
      return (
        <div className="animate-in slide-in-from-bottom duration-500">
          <Input 
            ref={fieldRefs[field.id] as React.RefObject<HTMLInputElement | null>}
            style={inputStyle} 
            type="number" 
            placeholder={placeholder}
            value={value || ''}
            onChange={(e) => handleValueChange(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && hasValue) {
                e.preventDefault();
                focusNextField();
              }
            }}
            className={cn(
              "transition-all duration-300 focus:scale-[1.01] hover:shadow-sm",
              error && "border-red-300 focus:border-red-500"
            )}
            aria-invalid={!!error}
            aria-describedby={error ? `${field.id}-error` : undefined}
          />
          <ValidationFeedback 
            error={error} 
            success={!error && hasValue && field.validation?.required} 
            fieldId={field.id}
          />
        </div>
      );
      
    case 'RadioGroup':
      return (
        <div className="animate-in slide-in-from-bottom duration-500">
          <EnhancedRadioGroup
            field={field}
            value={value}
            onChange={handleValueChange}
            theme={theme}
            error={error}
            onNext={focusNextField}
          />
          <ValidationFeedback 
            error={error} 
            success={!error && hasValue && field.validation?.required} 
            fieldId={field.id}
          />
        </div>
      );
      
    case 'Select':
      return (
        <div className="animate-in slide-in-from-bottom duration-500">
          <Select
            value={answers[field.id]}
            onValueChange={handleValueChange}
          >
            <SelectTrigger 
              ref={fieldRefs[field.id] as any}
              onBlur={handleBlur}
              className={cn(
                "w-full transition-all duration-300 hover:shadow-sm focus:scale-[1.01]",
                error && "border-red-300 focus:border-red-500"
              )}
              style={inputStyle}
              aria-describedby={error ? `${field.id}-error` : undefined}
            >
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option, index) => {
                const optionValue = typeof option === 'object' ? option.value : option;
                const optionLabel = typeof option === 'object' ? option.label : option;
                return (
                  <SelectItem key={index} value={optionValue}>
                    {optionLabel}
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
          <ValidationFeedback 
            error={error} 
            success={!error && hasValue && field.validation?.required} 
            fieldId={field.id}
          />
        </div>
      );
      
    case 'Checkbox':
      return (
        <div className="animate-in slide-in-from-bottom duration-500">
          <EnhancedCheckboxGroup
            field={field}
            value={value}
            onChange={handleValueChange}
            theme={theme}
            error={error}
          />
          <ValidationFeedback 
            error={error} 
            success={!error && value && value.length > 0 && field.validation?.required} 
            fieldId={field.id}
          />
        </div>
      );
      
    case 'DatePicker':
      return (
        <div className="animate-in slide-in-from-bottom duration-500">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={'outline'}
                style={inputStyle}
                              className={cn(
                'w-full justify-start text-left font-normal transition-all duration-300 hover:shadow-sm focus:scale-[1.01]',
                !value && 'text-muted-foreground',
                error && "border-red-300 focus:border-red-500"
              )}
                aria-invalid={!!error}
                aria-describedby={error ? `${field.id}-error` : undefined}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {value ? format(new Date(value), 'PPP') : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 animate-in zoom-in duration-200">
              <Calendar
                mode="single"
                selected={value ? new Date(value) : undefined}
                onSelect={(date) => {
                  handleValueChange(date);
                  focusNextField();
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <ValidationFeedback 
            error={error} 
            success={!error && hasValue && field.validation?.required} 
            fieldId={field.id}
          />
        </div>
      );
      
    default:
      return null;
  }
};

export default function SubmissionPage() {
  const params = useParams();
  const [form, setForm] = useState<Form | null>(null);
  const [answers, setAnswers] = useState<any>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submissionData, setSubmissionData] = useState<any>(null);
  const [isMobile, setIsMobile] = useState(false);
  
  // Refs for auto-focus functionality
  const fieldRefs = useRef<Record<string, React.RefObject<HTMLInputElement | HTMLTextAreaElement | null>>>({});

  const visibleFields = useMemo(() => {
    if (!form) return [];
    return form.fields.filter(field => isFieldVisible(field, answers))
  }, [form, answers]);

  // Initialize refs for visible fields
  useEffect(() => {
    const newRefs: Record<string, React.RefObject<HTMLInputElement | HTMLTextAreaElement | null>> = {};
    visibleFields.forEach(field => {
      if (['Input', 'Email', 'NumberInput', 'Textarea'].includes(field.type)) {
        newRefs[field.id] = React.createRef<HTMLInputElement | HTMLTextAreaElement>();
      }
    });
    fieldRefs.current = newRefs;
  }, [visibleFields]);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-focus to next field
  const focusNextField = () => {
    const currentIndex = visibleFields.findIndex(field => 
      ['Input', 'Email', 'NumberInput', 'Textarea'].includes(field.type) &&
      (!answers[field.id] || !answers[field.id].value)
    );
    
    if (currentIndex !== -1 && currentIndex < visibleFields.length - 1) {
      const nextField = visibleFields[currentIndex];
      const nextRef = fieldRefs.current[nextField.id];
      if (nextRef?.current) {
        setTimeout(() => {
          nextRef.current?.focus();
          nextRef.current?.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
        }, 300);
      }
    }
  };

  // Calculate progress based on completed required fields
  const progress = useMemo(() => {
    if (!visibleFields.length) return 0;
    
    const requiredFields = visibleFields.filter(field => field.validation?.required);
    if (!requiredFields.length) return 100;
    
    const completedRequired = requiredFields.filter(field => {
      const answer = answers[field.id];
      return answer && 
             answer.value !== null && 
             answer.value !== undefined && 
             answer.value !== '' &&
             (!Array.isArray(answer.value) || answer.value.length > 0);
    });
    
    return (completedRequired.length / requiredFields.length) * 100;
  }, [visibleFields, answers]);

  useEffect(() => {
    if (!params.id) return;

    const fetchForm = async () => {
      try {
        const response = await fetch(`http://localhost:3001/forms/public/${params.id as string}`);
        if (!response.ok) throw new Error('Form not found');
        const data = await response.json();
        setForm(data);
      } catch (error) {
        console.error('Failed to fetch form', error);
      } finally {
        setLoading(false);
      }
    };
    fetchForm();
  }, [params.id, setForm, setLoading]);

  useEffect(() => {
    if (!params.id) return;
    // Fire-and-forget request to log the form view
    fetch(`http://localhost:3001/forms/${params.id as string}/view`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }, [params.id]);

  const validateForm = () => {
    if (!form) return false;
    const newErrors: Record<string, string> = {};
    visibleFields.forEach(field => {
      if (field.validation?.required) {
        const answer = answers[field.id];
        if (
          !answer ||
          answer.value === null ||
          answer.value === undefined ||
          answer.value === '' ||
          (Array.isArray(answer.value) && answer.value.length === 0)
        ) {
          newErrors[field.id] = 'This field is required.';
        }
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      // Focus on first error field for accessibility
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField) {
        const element = document.getElementById(firstErrorField);
        element?.focus();
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    if (!form) return;
    setSubmitting(true);
    try {
      const response = await fetch(`http://localhost:3001/submissions/${form.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit form');
      }
      setSubmitted(true);
      const data = await response.json();
      setSubmissionData(data);

      if (form?.postSubmissionSettings?.type === 'redirect' && form?.postSubmissionSettings?.url) {
        window.location.href = form.postSubmissionSettings.url;
      }
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen" role="status" aria-label="Loading form">
        <div className="animate-pulse text-lg">Loading form...</div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="flex justify-center items-center h-screen" role="alert">
        <div className="text-lg">Form not found or failed to load.</div>
      </div>
    );
  }
  
  if (submitted && form?.postSubmissionSettings?.type === 'message') {
    return (
      <div 
        style={{ backgroundColor: form.theme.backgroundColor, fontFamily: form.theme.fontFamily }} 
        className="flex justify-center items-center h-screen p-4"
      >
        <div 
          style={{
            backgroundColor: form.theme.formBackgroundColor, 
            borderColor: form.theme.borderColor, 
            borderWidth: form.theme.borderWidth, 
            borderRadius: form.theme.borderRadius
          }} 
          className="p-8 rounded-lg shadow-xl text-center max-w-lg w-full animate-in zoom-in duration-500"
          role="status"
          aria-live="polite"
        >
          {/* Success Animation */}
          <div className="relative mb-6">
            <div className="absolute inset-0 rounded-full bg-green-100 animate-ping opacity-75"></div>
            <CheckCircle className="relative mx-auto h-16 w-16 text-green-500 animate-bounce" />
          </div>
          
          {/* Branding in success message */}
          {form.branding?.companyName && (
            <p className="text-sm opacity-60 mb-2" style={{ color: form.theme.answerTextColor }}>
              from {form.branding.companyName}
            </p>
          )}
          
          <h1 style={{color: form.theme.questionTextColor}} className="text-2xl font-bold mb-4">
            Thank you!
          </h1>
          
          <p style={{color: form.theme.answerTextColor}} className="whitespace-pre-wrap mb-6 leading-relaxed">
            {form.postSubmissionSettings.message || 'Your submission has been received and we appreciate your time.'}
          </p>
          
          {/* Additional confirmation details */}
          <div 
            className="text-sm p-3 rounded border border-dashed opacity-60"
            style={{ borderColor: form.theme.borderColor, color: form.theme.answerTextColor }}
          >
            <p>✓ Your response has been securely recorded</p>
            <p className="mt-1">Response ID: {submissionData?.id?.slice(-8) || 'Generated'}</p>
          </div>
          
          {/* Privacy reminder in success */}
          {form.branding?.privacyNote && (
            <p className="text-xs mt-4 opacity-50" style={{ color: form.theme.answerTextColor }}>
              {form.branding.privacyNote}
            </p>
          )}
        </div>
      </div>
    )
  }

  if (submitted && form?.postSubmissionSettings?.type === 'redirect') {
    return (
      <div className="flex justify-center items-center h-screen" role="status" aria-label="Redirecting">
        <div className="animate-pulse">Redirecting...</div>
      </div>
    );
  }

  return (
    <div 
      style={{ backgroundColor: form.theme.backgroundColor, fontFamily: form.theme.fontFamily }} 
      className="flex justify-center items-center min-h-screen py-4 px-4 sm:py-12"
    >
      <div className="w-full max-w-2xl relative">
        <form 
          onSubmit={handleSubmit} 
          style={{
            backgroundColor: form.theme.formBackgroundColor, 
            borderColor: form.theme.borderColor, 
            borderWidth: form.theme.borderWidth, 
            borderRadius: form.theme.borderRadius
          }} 
          className="p-4 sm:p-8 rounded-lg shadow-lg animate-in slide-in-from-bottom duration-700"
          role="form"
          aria-labelledby="form-title"
          noValidate
        >
          {/* Form Header with Branding */}
          <FormHeader form={form} theme={form.theme} />
          
          {/* Progress Indicator */}
          {visibleFields.length > 3 && (
            <ProgressBar progress={progress} theme={form.theme} />
          )}
          
          <div className="space-y-6 sm:space-y-8">
            {visibleFields.map((field, index) => {
              console.log(`Rendering field: ${field.label}, Visible: ${isFieldVisible(field, answers)}`);
              return (
                <div key={field.id}>
                  {/* Section divider after every 3 fields */}
                  {index > 0 && index % 3 === 0 && (
                    <SectionDivider theme={form.theme} />
                  )}
                  
                  <div className="space-y-3">
                    <FieldLabel 
                      field={field} 
                      theme={form.theme} 
                      helpContent={needsHelpTooltip(field)} 
                    />
                    
                    <div className="mt-2">
                      {renderField(field, answers, setAnswers, form.theme, errors, setErrors, fieldRefs.current, visibleFields, focusNextField)}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          
          {/* Privacy Note */}
          {form.branding?.privacyNote && (
            <PrivacyNote note={form.branding.privacyNote} theme={form.theme} />
          )}
          
          {/* Desktop Submit Button */}
          {!isMobile && (
            <Button 
              type="submit" 
              disabled={submitting} 
              style={{backgroundColor: form.theme.primaryColor, color: form.theme.buttonTextColor}} 
              className="mt-8 w-full py-4 text-lg font-semibold transition-all duration-300 hover:shadow-md hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
              aria-describedby={Object.keys(errors).length > 0 ? "form-errors" : undefined}
            >
              {submitting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Submitting...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Send className="h-5 w-5 mr-2" />
                  Submit
                </div>
              )}
            </Button>
          )}
          
          {/* Screen reader accessible error summary */}
          {Object.keys(errors).length > 0 && (
            <div id="form-errors" className="sr-only" role="alert">
              There are {Object.keys(errors).length} errors in the form. Please review and correct them.
            </div>
          )}
        </form>

        {/* Mobile Sticky Submit Button */}
        {isMobile && visibleFields.length > 2 && (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-sm border-t shadow-xl animate-in slide-in-from-bottom duration-300">
            <Button 
              type="submit" 
              disabled={submitting}
              onClick={handleSubmit}
              style={{backgroundColor: form.theme.primaryColor, color: form.theme.buttonTextColor}} 
              className="w-full py-4 text-lg font-semibold transition-all duration-300 hover:shadow-md active:scale-95 disabled:opacity-50"
              aria-describedby={Object.keys(errors).length > 0 ? "form-errors" : undefined}
            >
              {submitting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Submitting...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Send className="h-5 w-5 mr-2" />
                  Submit Form
                  {progress > 0 && (
                    <span className="ml-2 text-sm opacity-80">
                      ({Math.round(progress)}%)
                    </span>
                  )}
                </div>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
} 