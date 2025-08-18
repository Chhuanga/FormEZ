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
import { useAuth } from '@/context/AuthContext';
import { RestrictedFormAccess } from '@/components/auth/RestrictedFormAccess';

interface Form {
  id: string;
  title: string;
  fields: FormFieldType[];
  theme: Theme;
  formSettings?: {
    titleIcon?: string;
    coverImage?: string;
    accessConditions?: {
      requireLogin?: boolean;
      allowedEmailDomains?: string[];
    };
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
  value, 
  onChange, 
  min, 
  max, 
  theme 
}: { 
  value: number; 
  onChange: (value: number) => void; 
  min: number; 
  max: number; 
  theme: Theme;
}) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center text-sm text-gray-500">
        <span className="px-3 py-1 bg-gray-100 rounded-full font-medium">{min}</span>
        <span className="px-3 py-1 bg-gray-100 rounded-full font-medium">{max}</span>
      </div>
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          value={value || min}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          style={{
            background: `linear-gradient(to right, ${theme.primaryColor} 0%, ${theme.primaryColor} ${((value - min) / (max - min)) * 100}%, #e5e7eb ${((value - min) / (max - min)) * 100}%, #e5e7eb 100%)`,
          }}
        />
        <style jsx>{`
          .slider::-webkit-slider-thumb {
            appearance: none;
            height: 24px;
            width: 24px;
            border-radius: 50%;
            background: ${theme.primaryColor};
            cursor: pointer;
            border: 3px solid white;
            box-shadow: 0 2px 6px rgba(0,0,0,0.15);
          }
          .slider::-moz-range-thumb {
            height: 24px;
            width: 24px;
            border-radius: 50%;
            background: ${theme.primaryColor};
            cursor: pointer;
            border: 3px solid white;
            box-shadow: 0 2px 6px rgba(0,0,0,0.15);
          }
        `}</style>
      </div>
      <div className="text-center">
        <div
          className="inline-flex items-center justify-center w-16 h-16 rounded-2xl text-2xl font-bold shadow-lg"
          style={{
            backgroundColor: theme.primaryColor,
            color: theme.buttonTextColor,
          }}
        >
          {value || min}
        </div>
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

  // Function to convert Unsplash URLs to properly formatted URLs
  const getUnsplashImageUrl = (url: string) => {
    // Check if it's already a proper Unsplash URL
    if (url.startsWith('https://images.unsplash.com/')) {
      return url;
    }
    
    // Handle unsplash.com URLs
    if (url.includes('unsplash.com/photos/')) {
      const photoId = url.split('/photos/')[1]?.split('?')[0];
      if (photoId) {
        return `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=1200&q=80`;
      }
    }
    
    // Return original URL if no conversion needed
    return url;
  };

  return (
    <div className="space-y-8">
      {/* Cover Image */}
      {form.formSettings?.coverImage && (
        <div className="relative w-full h-64 rounded-2xl overflow-hidden shadow-lg">
          <img
            src={getUnsplashImageUrl(form.formSettings.coverImage)}
            alt="Form cover"
            className="w-full h-full object-cover"
            crossOrigin="anonymous"
            onLoad={(e) => {
              console.log('Cover image loaded successfully:', form.formSettings?.coverImage);
            }}
            onError={(e) => {
              console.error('Cover image failed to load:', form.formSettings?.coverImage);
              // Create a gradient fallback
              const fallbackDiv = document.createElement('div');
              fallbackDiv.className = 'w-full h-full bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500';
              e.currentTarget.parentNode?.replaceChild(fallbackDiv, e.currentTarget);
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
        </div>
      )}

      {/* Title and Description */}
      <div className="text-center space-y-6">
        {SelectedIcon && (
          <div className="flex justify-center">
            <div 
              className="inline-flex items-center justify-center w-20 h-20 rounded-2xl shadow-lg"
              style={{ 
                backgroundColor: `${theme.primaryColor}15`,
                border: `2px solid ${theme.primaryColor}25`
              }}
            >
              <SelectedIcon className="h-10 w-10" style={{ color: theme.primaryColor }} />
            </div>
          </div>
        )}
        
        <div className="space-y-4">
          <h1 
            id="form-title"
            style={{color: theme.questionTextColor}} 
            className="text-4xl sm:text-5xl font-bold leading-tight tracking-tight"
          >
            {form.title}
          </h1>
          
          {(form as any).description && (
            <p 
              className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed"
              style={{color: theme.textColor + '80'}}
            >
              {(form as any).description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const FieldLabel = ({ field, theme }: { 
  field: FormFieldType; 
  theme: Theme; 
}) => (
  <div className="space-y-2">
    <Label 
      style={{color: theme.questionTextColor}} 
      className="text-xl font-semibold block leading-tight" 
      htmlFor={field.id}
    >
      {field.label}
      {field.validation?.required && (
        <span className="text-red-500 ml-1" aria-label="required">*</span>
      )}
    </Label>
    {field.description && (
      <p className="text-base text-gray-600 leading-relaxed" style={{color: theme.textColor + '70'}}>
        {field.description}
      </p>
    )}
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
    fontSize: '16px',
    lineHeight: '1.5',
  } as React.CSSProperties;

  const inputClassName = "text-lg py-4 px-4 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 placeholder:text-gray-400";
  const textareaClassName = "text-lg py-4 px-4 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 placeholder:text-gray-400 min-h-[120px] resize-y";

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
            className={cn(inputClassName, error && "border-red-300 focus:border-red-500 focus:ring-red-100")}
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
            className={cn(textareaClassName, error && "border-red-300 focus:border-red-500 focus:ring-red-100")}
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
            className={cn(inputClassName, error && "border-red-300 focus:border-red-500 focus:ring-red-100")}
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
              value={value || 1}
              onChange={handleValueChange}
              min={1}
              max={field.validation?.max || 10}
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
                <RadioGroup value={value} onValueChange={handleValueChange} className="space-y-4">
                    {field.options?.map((option, index) => {
                        const optionValue = typeof option === 'object' ? option.value : option;
                        const optionLabel = typeof option === 'object' ? option.label : option;
                        return (
                            <div key={index} className="flex items-center space-x-4 p-4 rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-colors duration-200">
                                <RadioGroupItem value={optionValue} id={`${field.id}-${index}`} className="w-5 h-5" />
                                <Label htmlFor={`${field.id}-${index}`} className="text-lg cursor-pointer flex-1">{optionLabel}</Label>
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
            <SelectTrigger 
              style={inputStyle} 
              className={cn("text-lg py-4 px-4 h-auto rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200", error && "border-red-300 focus:border-red-500 focus:ring-red-100")}
            >
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-2 border-gray-200 shadow-lg">
              {field.options?.map((option, index) => {
                const optionValue = typeof option === 'object' ? option.value : option;
                const optionLabel = typeof option === 'object' ? option.label : option;
                return (
                  <SelectItem key={index} value={optionValue} className="text-lg py-3 px-4 hover:bg-gray-50">{optionLabel}</SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          <ValidationFeedback error={error} fieldId={field.id} />
        </div>
      );

    case 'Checkbox':
        return (
            <div className="space-y-4">
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
                        <div key={index} className="flex items-center space-x-4 p-4 rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-colors duration-200">
                            <Checkbox id={`${field.id}-${index}`} checked={isChecked} onCheckedChange={onCheckedChange} className="w-5 h-5" />
                            <Label htmlFor={`${field.id}-${index}`} className="text-lg cursor-pointer flex-1">{optionLabel}</Label>
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
  const params = useParams();
  const id = params?.id as string;
  const { user, loading: authLoading } = useAuth();
  const [form, setForm] = useState<Form | null>(null);
  const [answers, setAnswers] = useState<any>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<'success' | 'error' | null>(null);
  const [showAuthRequired, setShowAuthRequired] = useState(false);
  const [accessCheckComplete, setAccessCheckComplete] = useState(false);

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

  // Check access conditions after form is loaded and auth state is known
  useEffect(() => {
    if (authLoading || !form || accessCheckComplete) return;

    const accessConditions = form.formSettings?.accessConditions;
    
    // If no access conditions or login not required, allow access
    if (!accessConditions?.requireLogin) {
      setAccessCheckComplete(true);
      return;
    }

    // If login is required but user is not authenticated
    if (!user) {
      setShowAuthRequired(true);
      setAccessCheckComplete(true);
      return;
    }

    // Check email domain restrictions if user is authenticated
    const allowedDomains = accessConditions.allowedEmailDomains;
    if (allowedDomains && allowedDomains.length > 0) {
      const userEmail = user.email;
      if (!userEmail) {
        setShowAuthRequired(true);
        setAccessCheckComplete(true);
        return;
      }

      const userDomain = userEmail.split('@')[1];
      if (!allowedDomains.includes(userDomain)) {
        // User is authenticated but their domain is not allowed
        alert(`Access denied. This form is restricted to users from: ${allowedDomains.join(', ')}`);
        setShowAuthRequired(true);
        setAccessCheckComplete(true);
        return;
      }
    }

    // User has access
    setAccessCheckComplete(true);
  }, [form, user, authLoading, accessCheckComplete]);

  const handleAuthSuccess = () => {
    setShowAuthRequired(false);
    // Re-run access check
    setAccessCheckComplete(false);
  };

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

  if (authLoading || !accessCheckComplete) {
    return <div className="flex h-full items-center justify-center">Loading...</div>;
  }

  if (!form) {
    return <div className="flex h-full items-center justify-center">Form not found</div>;
  }

  // Show authentication screen if access is restricted
  if (showAuthRequired) {
    return (
      <RestrictedFormAccess
        onAuthSuccess={handleAuthSuccess}
        formTitle={form.title}
        allowedEmailDomains={form.formSettings?.accessConditions?.allowedEmailDomains}
      />
    );
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
      className="min-h-screen w-full"
      style={{ backgroundColor: theme.backgroundColor }}
    >
      {/* Header with FormEz branding */}
      <div className="w-full bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">F</span>
            </div>
            <span className="font-semibold text-gray-900">FormEz</span>
          </div>
          <div className="text-sm text-gray-500">
            Secure form submission
          </div>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="space-y-8">
          <FormHeader form={form} theme={theme} />
          
          <div 
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
            style={{ fontFamily: theme.fontFamily }}
          >
            <form onSubmit={handleSubmit} className="divide-y divide-gray-50" noValidate>
              {visibleFields.map((field, index) => (
                <div key={field.id} className="p-8 hover:bg-gray-50/50 transition-colors duration-200">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-600 mt-1">
                      {index + 1}
                    </div>
                    <div className="flex-1 space-y-4">
                      <FieldLabel field={field} theme={theme} />
                      <div className="max-w-xl">
                        {renderField(field, answers, setAnswers, theme, errors, setErrors)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="p-8 bg-gray-50/50">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    {visibleFields.length} {visibleFields.length === 1 ? 'question' : 'questions'}
                  </div>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="px-8 py-3 text-base font-medium rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
                    style={{
                      backgroundColor: theme.primaryColor,
                      color: theme.buttonTextColor,
                    }}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        <span>Submitting...</span>
                      </div>
                    ) : (
                      'Submit form'
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
        
        <footer className="text-center mt-12 text-sm text-gray-400">
          <div className="flex items-center justify-center space-x-1">
            <span>Powered by</span>
            <span className="font-medium text-gray-600">FormEz</span>
          </div>
        </footer>
      </main>
    </div>
  );
} 