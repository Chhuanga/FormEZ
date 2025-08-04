'use client';

import React, { useState } from 'react';
import { FormField as FormFieldType, FormSettings, Theme } from '@/store/form';
import { cn } from '@/lib/utils';
import { ChevronRight, ExternalLink } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Form {
  id: string;
  title: string;
  description?: string;
  fields: FormFieldType[];
  settings?: FormSettings;
  theme?: Theme;
}

interface PublicFormViewerProps {
  form: Form;
  onSubmit?: (data: any) => void;
  isSubmitting?: boolean;
}

interface PublicFormFieldProps {
  field: FormFieldType;
  value?: any;
  onChange: (value: any) => void;
}

// Component for rendering form fields in public view
const PublicFormField: React.FC<PublicFormFieldProps> = ({ field, value, onChange }) => {
  const handleChange = (newValue: any) => {
    onChange(newValue);
  };

  const renderField = () => {
    switch (field.type) {
      case 'Input':
        return (
          <Input
            placeholder={field.placeholder || ''}
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            className="text-lg py-3"
            required={field.validation?.required}
          />
        );

      case 'Email':
        return (
          <Input
            type="email"
            placeholder={field.placeholder || 'your.email@example.com'}
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            className="text-lg py-3"
            required={field.validation?.required}
          />
        );

      case 'Textarea':
        return (
          <Textarea
            placeholder={field.placeholder || ''}
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            className="text-lg py-3 min-h-[120px] resize-none"
            required={field.validation?.required}
          />
        );

      case 'NumberInput':
        return (
          <Input
            type="number"
            placeholder={field.placeholder || '0'}
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            className="text-lg py-3"
            required={field.validation?.required}
          />
        );

      case 'RadioGroup':
        return (
          <RadioGroup
            value={value}
            onValueChange={handleChange}
            className="space-y-3"
          >
            {field.options?.map((option, index) => {
              const optionValue = typeof option === 'string' ? option : option.value;
              const optionLabel = typeof option === 'string' ? option : option.label;
              return (
                <div key={index} className="flex items-center space-x-3">
                  <RadioGroupItem 
                    value={optionValue} 
                    id={`${field.id}-${index}`}
                    className="w-5 h-5"
                  />
                  <Label 
                    htmlFor={`${field.id}-${index}`}
                    className="text-base cursor-pointer"
                  >
                    {optionLabel}
                  </Label>
                </div>
              );
            })}
          </RadioGroup>
        );

      case 'Select':
        return (
          <Select value={value} onValueChange={handleChange}>
            <SelectTrigger className="text-lg py-3">
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option, index) => {
                const optionValue = typeof option === 'string' ? option : option.value;
                const optionLabel = typeof option === 'string' ? option : option.label;
                return (
                  <SelectItem key={index} value={optionValue}>
                    {optionLabel}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        );

      case 'Checkbox':
        return (
          <div className="space-y-3">
            {field.options?.map((option, index) => {
              const optionValue = typeof option === 'string' ? option : option.value;
              const optionLabel = typeof option === 'string' ? option : option.label;
              const isChecked = Array.isArray(value) ? value.includes(optionValue) : false;
              
              return (
                <div key={index} className="flex items-center space-x-3">
                  <Checkbox
                    id={`${field.id}-${index}`}
                    checked={isChecked}
                    onCheckedChange={(checked) => {
                      const currentValues = Array.isArray(value) ? value : [];
                      if (checked) {
                        handleChange([...currentValues, optionValue]);
                      } else {
                        handleChange(currentValues.filter((v: any) => v !== optionValue));
                      }
                    }}
                    className="w-5 h-5"
                  />
                  <Label 
                    htmlFor={`${field.id}-${index}`}
                    className="text-base cursor-pointer"
                  >
                    {optionLabel}
                  </Label>
                </div>
              );
            })}
          </div>
        );

      case 'DatePicker':
        return (
          <Input
            type="date"
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            className="text-lg py-3"
            required={field.validation?.required}
          />
        );

      case 'FileUpload':
        return (
          <Input
            type="file"
            onChange={(e) => handleChange(e.target.files?.[0] || null)}
            className="text-lg py-3"
            required={field.validation?.required}
          />
        );

      default:
        return (
          <Input
            placeholder={field.placeholder || ''}
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            className="text-lg py-3"
            required={field.validation?.required}
          />
        );
    }
  };

  return (
    <div className="space-y-3">
      <Label className="text-xl font-semibold text-gray-900 leading-tight">
        {field.label}
        {field.validation?.required && (
          <span className="text-red-500 ml-1">*</span>
        )}
      </Label>
      {field.description && (
        <p className="text-gray-600 text-base leading-relaxed">
          {field.description}
        </p>
      )}
      <div className="mt-4">
        {renderField()}
      </div>
    </div>
  );
};

// Utility function to convert Unsplash page URLs to proper image URLs (same as Canvas)
const validateAndConvertImageUrl = (url: string): { isValid: boolean; convertedUrl: string; errorMessage?: string } => {
  if (!url || typeof url !== 'string') {
    return { isValid: false, convertedUrl: url, errorMessage: 'Invalid URL provided' };
  }

  if (url.includes('images.unsplash.com')) {
    const unsplashMatch = url.match(/images\.unsplash\.com\/photo-([a-zA-Z0-9_-]{10,})/);
    if (!unsplashMatch || unsplashMatch[1].length < 10) {
      return { 
        isValid: false, 
        convertedUrl: url, 
        errorMessage: 'Invalid Unsplash photo ID' 
      };
    }
    return { isValid: true, convertedUrl: url };
  }
  
  if (url.includes('unsplash.com/photos/')) {
    const match = url.match(/unsplash\.com\/photos\/[^\/]*-([a-zA-Z0-9_-]+)$/);
    if (match && match[1] && match[1].length >= 10) {
      const convertedUrl = `https://images.unsplash.com/photo-${match[1]}?w=1200&h=600&fit=crop&crop=top`;
      return { isValid: true, convertedUrl };
    }
    return { 
      isValid: false, 
      convertedUrl: url, 
      errorMessage: 'Could not extract valid photo ID from Unsplash page URL' 
    };
  }

  try {
    new URL(url);
    return { isValid: true, convertedUrl: url };
  } catch {
    return { 
      isValid: false, 
      convertedUrl: url, 
      errorMessage: 'Invalid URL format' 
    };
  }
};

export const PublicFormViewer: React.FC<PublicFormViewerProps> = ({ 
  form, 
  onSubmit, 
  isSubmitting = false 
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});

  const iconMap = {
    'Smile': '😊',
    'Star': '⭐',
    'Heart': '❤️',
    'Zap': '⚡',
    'Award': '🏆',
    'Target': '🎯',
    'Rocket': '🚀',
    'Crown': '👑',
    'Gift': '🎁',
  };

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(formData);
    }
  };

  const handleNext = () => {
    if (currentStep < form.fields.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const coverImageValidation = form.settings?.coverImage 
    ? validateAndConvertImageUrl(form.settings.coverImage)
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cover Image */}
      {coverImageValidation?.isValid && (
        <div className="relative w-full h-64 md:h-80">
          <img
            src={coverImageValidation.convertedUrl}
            alt="Form cover"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30"></div>
        </div>
      )}

      {/* Main Content */}
      <div className="relative">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-4 py-3">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">F</span>
              </div>
              <span className="text-sm font-semibold text-gray-700">FormEZ</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-500">Live</span>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div className="max-w-4xl mx-auto px-4 py-8 md:py-16">
          {/* Form Header */}
          <div className="text-center mb-12">
            {form.settings?.titleIcon && (
              <div className="mb-6">
                <span className="text-6xl">
                  {iconMap[form.settings.titleIcon as keyof typeof iconMap] || '📋'}
                </span>
              </div>
            )}
            <h1 
              className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight"
              style={{ 
                color: form.theme?.questionTextColor || '#1f2937',
                fontFamily: form.theme?.fontFamily || 'inherit'
              }}
            >
              {form.title || 'Untitled Form'}
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              {form.description || "We'd love to hear from you. Please fill out this form and we'll get back to you soon."}
            </p>
            
            {/* Progress Bar */}
            {form.fields.length > 1 && (
              <div className="mt-8 max-w-md mx-auto">
                <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                  <span>Question {Math.min(currentStep + 1, form.fields.length)} of {form.fields.length}</span>
                  <span>{Math.round(((currentStep + 1) / form.fields.length) * 100)}% complete</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${((currentStep + 1) / form.fields.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          {/* Form Fields */}
          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
            <div className="space-y-8">
              {form.fields.map((field, index) => (
                <div 
                  key={field.id} 
                  className={cn(
                    "transition-all duration-300",
                    form.fields.length > 1 ? (
                      index === currentStep ? "block" : "hidden"
                    ) : "block"
                  )}
                >
                  {/* Field Number */}
                  <div className="flex items-start gap-4 mb-6">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1 pt-1">
                      <PublicFormField
                        field={field}
                        value={formData[field.id]}
                        onChange={(value: any) => handleFieldChange(field.id, value)}
                      />
                    </div>
                  </div>

                  {/* Navigation Buttons */}
                  {form.fields.length > 1 && (
                    <div className="flex items-center justify-between mt-8 pl-14">
                      <button
                        type="button"
                        onClick={handlePrevious}
                        disabled={currentStep === 0}
                        className={cn(
                          "px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                          currentStep === 0
                            ? "text-gray-400 cursor-not-allowed"
                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                        )}
                      >
                        ← Previous
                      </button>

                      {currentStep < form.fields.length - 1 ? (
                        <button
                          type="button"
                          onClick={handleNext}
                          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                          Next
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                          {isSubmitting ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Submitting...
                            </>
                          ) : (
                            <>
                              Submit form
                              <ChevronRight className="h-4 w-4" />
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {/* Single-page form submit */}
              {form.fields.length <= 1 && (
                <div className="flex justify-center mt-12">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        Submit form
                        <ChevronRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </form>

          {/* Keyboard Navigation Hint */}
          <div className="text-center mt-8 text-gray-500">
            <p className="text-sm">
              Press <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Tab</kbd> to navigate • 
              <kbd className="px-2 py-1 bg-gray-100 rounded text-xs mx-1">Enter</kbd> to continue
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 bg-white mt-16">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="flex items-center justify-center gap-2 text-gray-400">
              <span className="text-sm">Powered by</span>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-gradient-to-r from-purple-600 to-blue-600 rounded flex items-center justify-center">
                  <span className="text-white font-bold text-xs">F</span>
                </div>
                <span className="text-sm font-semibold text-gray-500">FormEZ</span>
                <ExternalLink className="h-3 w-3 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
