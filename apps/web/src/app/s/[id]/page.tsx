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
import { Calendar as CalendarIcon, CheckCircle, AlertCircle, HelpCircle, Send, Smile, Star, Heart, Zap, Award, Target, Rocket, Crown, Gift } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface Form {
  id: string;
  title: string;
  fields: FormFieldType[];
  theme: Theme;
  formSettings?: {
    titleIcon?: string;
    coverImage?: string;
  };
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

const NumberSlider = ({
  field,
  value,
  onChange,
  theme
}: {
  field: FormFieldType;
  value: number | undefined;
  onChange: (value: number) => void;
  theme: Theme;
}) => {
  const min = 1;
  const max = 10;

  const handleChange = (newValue: number) => {
    onChange(newValue);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between text-sm" style={{ color: theme.answerTextColor }}>
        <span>{min}</span>
        <span>{max}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value || min}
        onChange={(e) => handleChange(parseInt(e.target.value))}
        className="w-full h-3 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2"
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
          className="inline-block px-4 py-2 rounded-full text-lg font-semibold"
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

const ValidationFeedback = ({ 
  error,
  fieldId 
}: { 
  error?: string; 
  fieldId: string;
}) => {
  if (error) {
    return (
      <div 
        className="flex items-center mt-2 text-red-600" 
        id={`${fieldId}-error`} 
        role="alert"
      >
        <AlertCircle className="h-4 w-4 mr-2" />
        <span className="text-sm">{error}</span>
      </div>
    );
  }
  
  return null;
};

const FormHeader = ({ form, theme }: { form: Form; theme: Theme }) => {
  const iconMap = {
    'Smile': Smile,
    'Star': Star,
    'Heart': Heart,
    'Zap': Zap,
    'Award': Award,
    'Target': Target,
    'Rocket': Rocket,
    'Crown': Crown,
    'Gift': Gift,
  };

  const SelectedIcon = form.formSettings?.titleIcon ? iconMap[form.formSettings.titleIcon as keyof typeof iconMap] : null;

  return (
    <div className="mb-6 sm:mb-8">
      {/* Cover Image */}
      {form.formSettings?.coverImage && (
        <div className="relative w-full h-48 mb-6 -mx-8 -mt-8 rounded-t-lg overflow-hidden">
          <img
            src={form.formSettings.coverImage}
            alt="Form cover"
            className="w-full h-full object-cover"
            crossOrigin="anonymous"
            onLoad={(e) => {
              console.log('Cover image loaded successfully:', form.formSettings?.coverImage);
            }}
            onError={(e) => {
              console.error('Cover image failed to load:', form.formSettings?.coverImage);
              e.currentTarget.style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-black/20"></div>
        </div>
      )}

      {/* Title with Icon */}
      <div className="text-center">
        {SelectedIcon && (
          <div className="mb-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-opacity-10 border-2 border-opacity-20 mb-4" style={{ backgroundColor: `${theme.primaryColor}20`, borderColor: `${theme.primaryColor}40` }}>
              <SelectedIcon className="h-8 w-8" style={{ color: theme.primaryColor }} />
            </div>
          </div>
        )}
        <h1 
          id="form-title"
          style={{color: theme.questionTextColor}} 
          className="text-2xl sm:text-3xl font-bold"
        >
          {form.title}
        </h1>
      </div>
    </div>
  );
};

const FieldLabel = ({ field, theme }: { 
  field: FormFieldType; 
  theme: Theme; 
}) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center">
      <Label 
        style={{color: theme.questionTextColor}} 
        className="text-lg font-medium block" 
        htmlFor={field.id}
      >
        {field.label}
        {field.validation?.required && (
          <span className="text-red-500 ml-1" aria-label="required">*</span>
        )}
      </Label>
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
  setErrors: (errors: any) => void
) => {
  const inputStyle = {
    color: theme.answerTextColor,
    borderColor: theme.borderColor,
    '--tw-ring-color': theme.primaryColor,
  } as React.CSSProperties;

  const value = answers[field.id]?.value;
  const error = errors[field.id];
  const placeholder = field.placeholder || 'Type your answer...';

  const handleValueChange = (newValue: any) => {
    setAnswers((prev: any) => ({ ...prev, [field.id]: { value: newValue } }));
    
    setErrors((prev: any) => {
      const newErrors = { ...prev };
      delete newErrors[field.id];
      return newErrors;
    });
  };
  
  switch (field.type) {
    case 'Input':
      return (
        <div>
          <Input 
            style={inputStyle} 
            placeholder={placeholder}
            value={value || ''}
            onChange={(e) => handleValueChange(e.target.value)}
            className={cn(error && "border-red-300 focus:border-red-500")}
            aria-invalid={!!error}
            aria-describedby={error ? `${field.id}-error` : undefined}
          />
          <ValidationFeedback error={error} fieldId={field.id} />
        </div>
      );
    
    case 'Textarea':
      return (
        <div>
          <Textarea 
            style={inputStyle} 
            placeholder={placeholder}
            value={value || ''}
            onChange={(e) => handleValueChange(e.target.value)}
            className={cn("min-h-[100px] resize-y", error && "border-red-300 focus:border-red-500")}
            aria-invalid={!!error}
            aria-describedby={error ? `${field.id}-error` : undefined}
          />
          <ValidationFeedback error={error} fieldId={field.id} />
        </div>
      );
      
    case 'Email':
      return (
        <div>
          <Input 
            style={inputStyle} 
            type="email" 
            placeholder={placeholder}
            value={value || ''}
            onChange={(e) => handleValueChange(e.target.value)}
            className={cn(error && "border-red-300 focus:border-red-500")}
            aria-invalid={!!error}
            aria-describedby={error ? `${field.id}-error` : undefined}
          />
          <ValidationFeedback error={error} fieldId={field.id} />
        </div>
      );
      
    case 'Number':
    case 'NumberInput':
      const isScaleQuestion = field.label?.toLowerCase().includes('scale') ||
                             field.label?.toLowerCase().includes('rate') ||
                             field.label?.toLowerCase().includes('1-10') ||
                             field.label?.toLowerCase().includes('1-5');

      if (isScaleQuestion) {
        return (
          <div>
            <NumberSlider
              field={field}
              value={value}
              onChange={handleValueChange}
              theme={theme}
            />
            <ValidationFeedback
              error={error}
              fieldId={field.id}
            />
          </div>
        );
      }
      return (
        <div>
          <Input 
            style={inputStyle} 
            type="number" 
            placeholder={placeholder}
            value={value || ''}
            onChange={(e) => handleValueChange(e.target.value)}
            className={cn(error && "border-red-300 focus:border-red-500")}
            aria-invalid={!!error}
            aria-describedby={error ? `${field.id}-error` : undefined}
          />
          <ValidationFeedback error={error} fieldId={field.id} />
        </div>
      );
      
    case 'RadioGroup':
        return (
            <div>
                <RadioGroup value={value} onValueChange={handleValueChange} className="space-y-3">
                    {field.options?.map((option, index) => {
                        const optionValue = typeof option === 'object' ? option.value : option;
                        const optionLabel = typeof option === 'object' ? option.label : option;
                        return (
                            <div key={index} className="flex items-center space-x-3">
                                <RadioGroupItem value={optionValue} id={`${field.id}-${index}`} />
                                <Label htmlFor={`${field.id}-${index}`}>{optionLabel}</Label>
                            </div>
                        );
                    })}
                </RadioGroup>
                <ValidationFeedback error={error} fieldId={field.id} />
            </div>
        );
      
    case 'Select':
      return (
        <div>
          <Select value={value} onValueChange={handleValueChange}>
            <SelectTrigger style={inputStyle} className={cn(error && "border-red-300 focus:border-red-500")}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option, index) => {
                const optionValue = typeof option === 'object' ? option.value : option;
                const optionLabel = typeof option === 'object' ? option.label : option;
                return (
                  <SelectItem key={index} value={optionValue}>{optionLabel}</SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          <ValidationFeedback error={error} fieldId={field.id} />
        </div>
      );

    case 'Checkbox':
        return (
            <div>
                {field.options?.map((option, index) => {
                    const optionValue = typeof option === 'object' ? option.value : option;
                    const optionLabel = typeof option === 'object' ? option.label : option;
                    const isChecked = value?.includes(optionValue);

                    const onCheckedChange = (checked: boolean) => {
                        const currentVal = value || [];
                        const newVal = checked 
                            ? [...currentVal, optionValue]
                            : currentVal.filter((v: string) => v !== optionValue);
                        handleValueChange(newVal);
                    }

                    return (
                        <div key={index} className="flex items-center space-x-2">
                            <Checkbox id={`${field.id}-${index}`} checked={isChecked} onCheckedChange={onCheckedChange} />
                            <Label htmlFor={`${field.id}-${index}`}>{optionLabel}</Label>
                        </div>
                    )
                })}
                <ValidationFeedback error={error} fieldId={field.id} />
            </div>
        );
      
    case 'DatePicker':
      return (
        <div>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className={cn("w-[280px] justify-start text-left font-normal", !value && "text-muted-foreground", error && "border-red-300 focus:border-red-500")}
                        style={inputStyle}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {value ? format(new Date(value), "PPP") : <span>Pick a date</span>}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                    <Calendar
                        mode="single"
                        selected={value ? new Date(value) : undefined}
                        onSelect={handleValueChange}
                        initialFocus
                    />
                </PopoverContent>
            </Popover>
            <ValidationFeedback error={error} fieldId={field.id} />
        </div>
      );
      
    default:
      return (
        <div>
          <p>Unsupported field type: {field.type}</p>
        </div>
      );
  }
};

export default function SubmissionPage() {
  const { id } = useParams();
  const [form, setForm] = useState<Form | null>(null);
  const [answers, setAnswers] = useState<any>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<'success' | 'error' | null>(null);

  const { fields, theme, title } = useMemo(() => {
    return {
      fields: form?.fields || [],
      theme: form?.theme || {
        backgroundColor: '#ffffff',
        formBackgroundColor: '#ffffff',
        primaryColor: '#007bff',
        textColor: '#000000',
        buttonTextColor: '#ffffff',
        borderColor: '#ced4da',
        borderWidth: 1,
        borderRadius: 8,
        fontFamily: 'sans-serif',
        questionTextColor: '#000000',
        answerTextColor: '#000000',
      },
      title: form?.title || 'Form',
    };
  }, [form]);

  const visibleFields = useMemo(() => {
    return fields.filter(field => isFieldVisible(field, answers));
  }, [fields, answers]);

  useEffect(() => {
    if (!id) return;

    const fetchForm = async () => {
      try {
        const response = await fetch(`/api/forms/public/${id as string}`);
        if (!response.ok) throw new Error('Form not found');
        const data = await response.json();
        setForm(data);
      } catch (error) {
        console.error('Failed to fetch form', error);
      }
    };

    fetchForm();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/forms/${id as string}/view`, {
      method: 'POST',
    });
  }, [id]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    visibleFields.forEach(field => {
      if (field.validation?.required) {
        const answer = answers[field.id]?.value;
        if (answer === undefined || answer === null || answer === '' || (Array.isArray(answer) && answer.length === 0)) {
          newErrors[field.id] = 'This field is required.';
        }
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (!form) return;
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/forms/${form.id}/submissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: answers }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit form');
      }
      setSubmissionResult('success');

      if (form?.postSubmissionSettings?.type === 'redirect' && form?.postSubmissionSettings?.url) {
        window.location.href = form.postSubmissionSettings.url;
      }
    } catch (error: any) {
      setSubmissionResult('error');
      alert(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!form) {
    return <div className="flex h-full items-center justify-center">Loading...</div>;
  }
  
  if (submissionResult === 'success') {
    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-4">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
          <h2 className="text-2xl font-semibold">Submission Successful!</h2>
          <p className="text-muted-foreground max-w-md">
            {form?.postSubmissionSettings?.message || 'Thank you for your submission.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen w-full flex flex-col items-center justify-center p-4"
      style={{ backgroundColor: theme.backgroundColor, color: theme.textColor }}
    >
      <main className="w-full max-w-2xl">
        <div 
          className="p-8 rounded-lg shadow-xl border"
          style={{
            backgroundColor: theme.formBackgroundColor,
            borderColor: theme.borderColor,
            borderWidth: `${theme.borderWidth}px`,
            borderRadius: `${theme.borderRadius}px`,
            fontFamily: theme.fontFamily,
          }}
        >
          <FormHeader form={form} theme={theme} />
          
          <form onSubmit={handleSubmit} className="space-y-8" noValidate>
            {visibleFields.map((field) => (
              <div key={field.id} className="space-y-2">
                <FieldLabel field={field} theme={theme} />
                {renderField(field, answers, setAnswers, theme, errors, setErrors)}
              </div>
            ))}
            
            <div className="pt-4">
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full text-lg py-6"
                style={{
                  backgroundColor: theme.primaryColor,
                  color: theme.buttonTextColor,
                }}
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </Button>
            </div>
          </form>
        </div>
        
        <footer className="text-center mt-8 text-sm text-muted-foreground/60">
          Powered by FormEz
        </footer>
      </main>
    </div>
  );
} 