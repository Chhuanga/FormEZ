'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FormField as FormFieldType, useFormStore } from '@/store/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useState, useRef } from 'react';
import {
  ArrowRight,
  Pilcrow,
  AtSign,
  GripVertical,
  CircleDotDashed,
  ChevronDownSquare,
  CheckSquare,
  CalendarDays,
  Hash,
  Upload,
  MoreVertical,
  Trash2,
  Copy,
  Star,
  StarOff,
  Move,
  HelpCircle,
  Zap,
} from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface FormFieldProps {
  field: FormFieldType;
  isOverlay?: boolean;
}

function RequiredToggle({ field }: { field: FormFieldType }) {
  const { updateField } = useFormStore();
  const isRequired = field.validation?.required || false;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateField(field.id, {
      validation: { ...field.validation, required: !isRequired },
    });
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        "h-8 w-8 transition-colors",
        isRequired 
          ? "text-orange-600 hover:text-orange-700 hover:bg-orange-50" 
          : "text-muted-foreground hover:text-orange-600 hover:bg-orange-50"
      )}
      onClick={handleToggle}
      title={isRequired ? "Remove required" : "Make required"}
    >
      {isRequired ? <Star className="h-4 w-4 fill-current" /> : <StarOff className="h-4 w-4" />}
    </Button>
  );
}

function FieldContextMenu({ field }: { field: FormFieldType }) {
  const { removeField, setSelectedFieldId } = useFormStore();
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleDelete = () => {
    removeField(field.id);
    setSelectedFieldId(null);
    setIsOpen(false);
  };

  const handleDeleteClick = () => {
    setShowConfirmDelete(true);
  };

  const handleCancelDelete = () => {
    setShowConfirmDelete(false);
  };

  if (showConfirmDelete) {
    return (
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(true);
            }}
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-0" align="end">
          <div className="p-4">
            <h4 className="font-medium text-sm mb-2">Delete this field?</h4>
            <p className="text-xs text-muted-foreground mb-4">
              This action cannot be undone. The field "{field.label}" will be permanently removed.
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCancelDelete();
                  setIsOpen(false);
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete();
                }}
                className="flex-1"
              >
                Delete
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(true);
          }}
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-1" align="end">
        <div className="space-y-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              // TODO: Implement duplicate functionality
              setIsOpen(false);
            }}
            className="w-full justify-start gap-2 text-sm font-normal"
          >
            <Copy className="h-4 w-4" />
            Duplicate
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClick();
            }}
            className="w-full justify-start gap-2 text-sm font-normal text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
            Delete Field
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function FormField({ field, isOverlay }: FormFieldProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging, isOver } =
    useSortable({ id: field.id });
  const { updateField, theme, selectedFieldId, setSelectedFieldId } = useFormStore();
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isSelected = selectedFieldId === field.id;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging && !isOverlay ? 0 : 1,
    zIndex: isDragging || isFocused || isOverlay ? 10 : 'auto',
  };

  const containerStyle: React.CSSProperties = isOverlay
    ? {
        transform: 'scale(1.02) rotate(-0.5deg)',
        boxShadow:
          '0 15px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      }
    : {
        boxShadow: isSelected ? `0 0 0 2px ${theme.primaryColor}` : 'none',
        backgroundColor: theme.formBackgroundColor,
        borderColor: theme.borderColor,
      };

  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (e.relatedTarget && e.currentTarget.contains(e.relatedTarget as Node)) {
      return;
    }
    setIsFocused(false);
  };

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateField(field.id, { label: e.target.value });
  };

  const renderField = () => {
    const options = field.options || ['Option 1'];
    const inputStyle = {
      color: theme.answerTextColor,
      '--tw-ring-color': theme.primaryColor,
      borderColor: theme.borderColor,
    } as React.CSSProperties;

    switch (field.type) {
      case 'Input':
        return (
          <Input
            style={inputStyle}
            placeholder={field.placeholder || 'Type your answer here...'}
            className="border-b bg-transparent shadow-none focus-visible:ring-0 focus-visible:border-primary rounded-none p-2 h-auto"
            readOnly
          />
        );
      case 'Textarea':
        return (
          <Textarea
            style={inputStyle}
            placeholder={field.placeholder || 'Type your answer here...'}
            className="border-b bg-transparent shadow-none focus-visible:ring-0 focus-visible:border-primary rounded-none p-2 min-h-[40px] resize-none"
            readOnly
          />
        );
      case 'Email':
        return (
          <Input
            type="email"
            style={inputStyle}
            placeholder={field.placeholder || 'Enter your email address...'}
            className="border-b bg-transparent shadow-none focus-visible:ring-0 focus-visible:border-primary rounded-none p-2 h-auto"
            readOnly
          />
        );
      case 'RadioGroup':
        return (
          <RadioGroup>
            {options.map((option, index) => {
              const optionValue = typeof option === 'object' ? option.value : option;
              const optionLabel = typeof option === 'object' ? option.label : option;
              return (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem
                  style={{ '--tw-ring-color': theme.primaryColor } as React.CSSProperties}
                    value={optionValue}
                  id={`${field.id}-${index}`}
                />
                <Label
                  style={{ color: theme.answerTextColor }}
                  htmlFor={`${field.id}-${index}`}
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
          <Select>
            <SelectTrigger
              style={inputStyle}
              className="w-[180px]"
            >
              <SelectValue
                placeholder={
                  options[0]
                    ? typeof options[0] === 'object'
                      ? options[0].label
                      : options[0]
                    : 'Select...'
                }
              />
            </SelectTrigger>
            <SelectContent>
              {options.map((option, index) => {
                const optionValue = typeof option === 'object' ? option.value : option;
                const optionLabel = typeof option === 'object' ? option.label : option;
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
          <div>
            {options.map((option, index) => {
              const optionLabel = typeof option === 'object' ? option.label : option;
              return (
              <div key={index} className="flex items-center space-x-2 my-2">
                <Checkbox
                  style={{ '--tw-ring-color': theme.primaryColor } as React.CSSProperties}
                  id={`${field.id}-${index}`}
                />
                <Label
                  style={{ color: theme.answerTextColor }}
                  htmlFor={`${field.id}-${index}`}
                >
                    {optionLabel}
                </Label>
              </div>
              );
            })}
          </div>
        );
      case 'NumberInput':
        return (
          <Input
            type="number"
            style={inputStyle}
            placeholder={field.placeholder || 'Enter a number...'}
            className="border-b bg-transparent shadow-none focus-visible:ring-0 focus-visible:border-primary rounded-none p-2 h-auto"
            readOnly
          />
        );
      case 'DatePicker':
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={'outline'}
                className={cn(
                  'w-[240px] justify-start text-left font-normal border-b border-border/50 bg-transparent shadow-none rounded-none p-2 h-auto',
                  !field.placeholder && 'text-muted-foreground'
                )}
              >
                <CalendarDays className="mr-2 h-4 w-4" />
                {field.placeholder ? (
                  format(new Date(), 'PPP')
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" disabled />
            </PopoverContent>
          </Popover>
        );
      case 'FileUpload':
        return (
          <div className="flex items-center space-x-2">
            <Button variant="outline" disabled>
              <Upload className="mr-2 h-4 w-4" />
              Upload a file
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  const getFieldIcon = () => {
    switch (field.type) {
      case 'Input':
        return <ArrowRight className="h-5 w-5" />;
      case 'Textarea':
        return <Pilcrow className="h-5 w-5" />;
      case 'Email':
        return <AtSign className="h-5 w-5" />;
      case 'RadioGroup':
        return <CircleDotDashed className="h-5 w-5" />;
      case 'Select':
        return <ChevronDownSquare className="h-5 w-5" />;
      case 'Checkbox':
        return <CheckSquare className="h-5 w-5" />;
      case 'DatePicker':
        return <CalendarDays className="h-5 w-5" />;
      case 'NumberInput':
        return <Hash className="h-5 w-5" />;
      case 'FileUpload':
        return <Upload className="h-5 w-5" />;
      default:
        return <ArrowRight className="h-5 w-5" />;
    }
  };

  const showOptionsEditor =
    field.type === 'RadioGroup' ||
    field.type === 'Select' ||
    field.type === 'Checkbox';

  const showPlaceholderInput =
    field.type === 'Input' ||
    field.type === 'Textarea' ||
    field.type === 'Email';

  const showNumberValidation = field.type === 'NumberInput';

  // Enhanced visual hierarchy based on field type and requirements
  const getFieldStyling = () => {
    const isRequired = field.validation?.required || false;
    const baseClasses = "p-4 rounded-lg transition-all duration-200 border";
    
    // Different styling based on field type
    switch (field.type) {
      case 'Textarea':
        // Long text areas get more prominent styling
        return cn(
          baseClasses,
          "bg-gradient-to-br from-blue-50/30 to-indigo-50/30 border-blue-200/50",
          "hover:border-blue-300/70 hover:bg-gradient-to-br hover:from-blue-50/50 hover:to-indigo-50/50",
          isSelected && "border-primary/60 bg-gradient-to-br from-primary/10 to-blue-50/40",
          isOver && "border-primary/50 bg-gradient-to-br from-primary/15 to-blue-50/60"
        );
      case 'Email':
        // Email fields get subtle accent
        return cn(
          baseClasses,
          "bg-gradient-to-r from-green-50/20 to-emerald-50/20 border-green-200/40",
          "hover:border-green-300/60 hover:bg-gradient-to-r hover:from-green-50/40 hover:to-emerald-50/40",
          isSelected && "border-primary/60 bg-gradient-to-r from-primary/10 to-green-50/30",
          isOver && "border-primary/50 bg-gradient-to-r from-primary/15 to-green-50/50"
        );
      case 'DatePicker':
      case 'FileUpload':
        // Special input types get distinctive styling
        return cn(
          baseClasses,
          "bg-gradient-to-r from-purple-50/20 to-pink-50/20 border-purple-200/40",
          "hover:border-purple-300/60 hover:bg-gradient-to-r hover:from-purple-50/40 hover:to-pink-50/40",
          isSelected && "border-primary/60 bg-gradient-to-r from-primary/10 to-purple-50/30",
          isOver && "border-primary/50 bg-gradient-to-r from-primary/15 to-purple-50/50"
        );
      case 'RadioGroup':
      case 'Select':
      case 'Checkbox':
        // Choice fields get neutral but distinct styling
        return cn(
          baseClasses,
          "bg-gradient-to-r from-amber-50/20 to-orange-50/20 border-amber-200/40",
          "hover:border-amber-300/60 hover:bg-gradient-to-r hover:from-amber-50/40 hover:to-orange-50/40",
          isSelected && "border-primary/60 bg-gradient-to-r from-primary/10 to-amber-50/30",
          isOver && "border-primary/50 bg-gradient-to-r from-primary/15 to-amber-50/50"
        );
      default:
        // Default text inputs
        return cn(
          baseClasses,
          "bg-white/50 border-gray-200/50",
          "hover:border-gray-300/70 hover:bg-white/70",
          isSelected && "border-primary/60 bg-primary/5",
          isOver && "border-primary/50 bg-primary/10"
        );
    }
  };

  const getRequiredStyling = () => {
    const isRequired = field.validation?.required || false;
    return isRequired 
      ? "ring-1 ring-orange-200/50 shadow-sm shadow-orange-100/50" 
      : "";
  };

  return (
    <div
      ref={(node) => {
        setNodeRef(node);
        containerRef.current = node;
      }}
      style={style}
      className={cn(
        "relative group transition-all duration-200",
        isOver && "bg-primary/5 border-primary/20",
        isDragging && "scale-105 shadow-lg"
      )}
      onClick={() => setSelectedFieldId(field.id)}
    >
      {/* Prominent drag handle bar - appears on hover */}
      <div
        {...attributes}
        {...listeners}
        className={cn(
          "absolute top-0 left-0 right-0 h-2 cursor-grab active:cursor-grabbing transition-all duration-200 z-10",
          "opacity-0 group-hover:opacity-100",
          isSelected && "opacity-100",
          "bg-gradient-to-r from-primary/60 via-primary/80 to-primary/60 rounded-t-lg",
          "hover:from-primary/80 hover:via-primary hover:to-primary/80",
          "flex items-center justify-center"
        )}
        title="Drag to reorder"
      >
        <div className="flex items-center gap-1 text-white/90">
          <div className="w-1 h-1 bg-white/70 rounded-full"></div>
          <div className="w-1 h-1 bg-white/70 rounded-full"></div>
          <div className="w-1 h-1 bg-white/70 rounded-full"></div>
          <div className="w-1 h-1 bg-white/70 rounded-full"></div>
          <div className="w-1 h-1 bg-white/70 rounded-full"></div>
        </div>
      </div>

      {/* Side drag indicator */}
      <div
        className={cn(
          "absolute left-0 top-0 bottom-0 w-1 transition-all duration-200",
          "opacity-0 group-hover:opacity-100",
          isSelected && "opacity-100",
          "bg-gradient-to-b from-primary/40 via-primary/60 to-primary/40 rounded-l-lg"
        )}
      />

      <div
        className={cn(
          getFieldStyling(),
          getRequiredStyling(),
          "relative z-0" // Ensure content stays below the drag handle
        )}
        style={containerStyle}
      >
        <div className="flex items-start gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <div
                className="text-muted-foreground"
                style={{ color: theme.questionTextColor }}
              >
                {getFieldIcon()}
              </div>
              <p className="font-medium" style={{ color: theme.questionTextColor }}>
                {field.label}
                {field.validation?.required && (
                  <span className="text-orange-600 ml-1 font-bold">*</span>
                )}
              </p>
              
              {/* Optional label for non-required fields */}
              {!field.validation?.required && (
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  optional
                </span>
              )}
              
              {/* Required badge - shows on hover */}
              {field.validation?.required && (
                <Badge 
                  variant="secondary" 
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-xs bg-orange-100 text-orange-800 border-orange-200"
                >
                  Required
                </Badge>
              )}
            </div>
            {renderField()}
          </div>
          
          <div className="flex items-center gap-2">
            {/* Quick required toggle - shows on hover or when selected */}
            <div className={cn(
              "transition-opacity duration-200",
              (isSelected || field.validation?.required) ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            )}>
              <RequiredToggle field={field} />
            </div>
            
            {/* Contextual menu with three dots */}
            {isSelected && (
              <FieldContextMenu field={field} />
            )}
            
            {/* Drag indicator icon - shows on hover */}
            <div className={cn(
              "p-2 text-muted-foreground/50 transition-all duration-200",
              "opacity-0 group-hover:opacity-100",
              isSelected && "opacity-60"
            )}>
              <Move className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Drop zone indicator */}
      {isOver && (
        <div className="absolute inset-0 border-2 border-dashed border-primary rounded-lg bg-primary/5 pointer-events-none">
          <div className="absolute inset-2 border border-primary/20 rounded-md bg-primary/10"></div>
        </div>
      )}
    </div>
  );
}

function HelpTooltip({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button type="button" className="ml-2 text-muted-foreground hover:text-foreground">
            <HelpCircle className="h-4 w-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" align="center" className="max-w-xs">
          <p className="text-sm">{children}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function ValidationSettings({ field }: { field: FormFieldType }) {
  const { updateField } = useFormStore();
  
  if (field.type !== 'NumberInput' && field.type !== 'Input' && field.type !== 'Textarea') {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-3">
          <CheckSquare className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">
          No rules needed for this type of question
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {field.type === 'NumberInput' && (
        <div className="space-y-4">
          <div className="space-y-1">
            <Label className="text-sm font-medium flex items-center">
              Number Limits
              <HelpTooltip>Set the smallest and largest numbers people can enter.</HelpTooltip>
            </Label>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">Smallest number</Label>
              <Input 
                type="number"
                value={field.validation?.min ?? ''}
                onChange={(e) => updateField(field.id, { 
                  validation: { 
                    ...field.validation, 
                    min: e.target.value ? parseInt(e.target.value) : undefined 
                  } 
                })}
                placeholder="0"
                className="transition-all focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">Largest number</Label>
              <Input 
                type="number"
                value={field.validation?.max ?? ''}
                onChange={(e) => updateField(field.id, { 
                  validation: { 
                    ...field.validation, 
                    max: e.target.value ? parseInt(e.target.value) : undefined 
                  } 
                })}
                placeholder="100"
                className="transition-all focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        </div>
      )}

      {(field.type === 'Input' || field.type === 'Textarea') && (
        <div className="space-y-4">
          <div className="space-y-1">
            <Label className="text-sm font-medium flex items-center">
              Answer Length
              <HelpTooltip>Control how short or long people's answers can be (in characters).</HelpTooltip>
            </Label>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">Shortest answer</Label>
              <Input 
                type="number"
                value={field.validation?.minLength ?? ''}
                onChange={(e) => updateField(field.id, { 
                  validation: { 
                    ...field.validation, 
                    minLength: e.target.value ? parseInt(e.target.value) : undefined 
                  } 
                })}
                placeholder="2"
                className="transition-all focus:ring-2 focus:ring-primary/20"
              />
              <p className="text-xs text-muted-foreground">characters</p>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">Longest answer</Label>
              <Input 
                type="number"
                value={field.validation?.maxLength ?? ''}
                onChange={(e) => updateField(field.id, { 
                  validation: { 
                    ...field.validation, 
                    maxLength: e.target.value ? parseInt(e.target.value) : undefined 
                  } 
                })}
                placeholder="50"
                className="transition-all focus:ring-2 focus:ring-primary/20"
              />
              <p className="text-xs text-muted-foreground">characters</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function ConditionalLogicSettings({ field }: { field: FormFieldType }) {
  const { fields, updateField } = useFormStore();
  
  // Find fields that can be used as a basis for logic (dependee)
  const logicCapableFields = fields.filter(
    (f) =>
      f.id !== field.id &&
      (f.type === 'RadioGroup' || f.type === 'Select' || f.type === 'Checkbox')
  );

  const logic = field.conditionalLogic;

  const handleLogicChange = (updates: Partial<FormFieldType['conditionalLogic']>) => {
    const baseLogic = logic || { fieldId: '', operator: 'equals', value: '' };
    updateField(field.id, {
      conditionalLogic: {
        ...baseLogic,
        ...updates,
      },
    });
  };

  const toggleLogic = (enabled: boolean) => {
    if (enabled) {
      if (!logic) {
        // Initialize with the first available field
        handleLogicChange({
          fieldId: logicCapableFields[0]?.id || '',
          operator: 'equals',
          value: '',
        });
      }
    } else {
      // Set to null to remove the logic
      updateField(field.id, { conditionalLogic: null });
    }
  };

  // Find the target field ONLY from the safe, pre-filtered list.
  const targetField = logic ? logicCapableFields.find((f) => f.id === logic.fieldId) : undefined;

  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border">
        <div className="space-y-1">
          <Label htmlFor={`logic-enabled-${field.id}`} className="text-sm font-medium flex items-center gap-2">
            <Zap className="h-4 w-4 text-muted-foreground" />
            Smart Show/Hide
            <HelpTooltip>
              Create smart forms that react to answers. You can show or hide this field based on how someone answers another question.
            </HelpTooltip>
          </Label>
        </div>
        <Switch id={`logic-enabled-${field.id}`} checked={!!logic} onCheckedChange={toggleLogic} />
      </div>
      
      {logic && targetField && (
        <div className="space-y-4 p-4 bg-gradient-to-br from-muted/50 to-muted/30 rounded-lg border-2 border-dashed border-muted-foreground/20">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-primary rounded-full" />
            <p className="text-sm font-medium text-muted-foreground">
              Show this field when:
            </p>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Select
                value={logic.fieldId}
                onValueChange={(fieldId) => handleLogicChange({ fieldId, value: '' })}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select a field..." />
                </SelectTrigger>
                <SelectContent>
                  {logicCapableFields.map((f) => (
                    <SelectItem key={f.id} value={f.id}>{f.label || 'Untitled'}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={logic.operator}
                onValueChange={(operator) => handleLogicChange({ operator: operator as any })}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Select condition..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="equals">is equal to</SelectItem>
                  <SelectItem value="not_equals">is not equal to</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {targetField.options && (
              <Select
                value={logic.value as string}
                onValueChange={(value) => handleLogicChange({ value })}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select an answer..." />
                </SelectTrigger>
                <SelectContent>
                  {targetField.options.map((option, index) => {
                    const optionValue = typeof option === 'object' ? option.value : option;
                    const optionLabel = typeof option === 'object' ? option.label : option;
                    return <SelectItem key={index} value={optionValue}>{optionLabel}</SelectItem>
                  })}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function FieldSettings({ field }: { field: FormFieldType }) {
  const { updateField } = useFormStore();

  const showOptionsEditor =
    field.type === 'RadioGroup' ||
    field.type === 'Select' ||
    field.type === 'Checkbox';

  const showPlaceholderInput =
    field.type === 'Input' ||
    field.type === 'Textarea' ||
    field.type === 'Email';

  const showNumberValidation = field.type === 'NumberInput';

  return (
    <div className="mt-4 pt-4 border-t border-border/50 space-y-4">
      <div>
        <Label htmlFor={`label-${field.id}`} className="text-sm font-medium">
          Question
        </Label>
        <Input
          id={`label-${field.id}`}
          value={field.label}
          onChange={(e) => updateField(field.id, { label: e.target.value })}
          placeholder="Enter your question"
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor={`description-${field.id}`} className="text-sm font-medium">
          Description
        </Label>
        <Textarea
          id={`description-${field.id}`}
          value={field.description || ''}
          onChange={(e) => updateField(field.id, { description: e.target.value })}
          placeholder="Enter a description (optional)"
          className="mt-1"
          rows={3}
        />
      </div>

      {showOptionsEditor && <OptionsEditor field={field} />}

      {showNumberValidation && (
        <div className="flex gap-4">
          <div>
            <Label htmlFor={`min-${field.id}`} className="text-sm font-medium">Min</Label>
            <Input
              type="number"
              id={`min-${field.id}`}
              value={field.validation?.min || ''}
              onChange={(e) =>
                updateField(field.id, {
                  validation: { ...field.validation, min: e.target.valueAsNumber },
                })
              }
              className="h-8 mt-1"
            />
          </div>
          <div>
            <Label htmlFor={`max-${field.id}`} className="text-sm font-medium">Max</Label>
            <Input
              type="number"
              id={`max-${field.id}`}
              value={field.validation?.max || ''}
              onChange={(e) =>
                updateField(field.id, {
                  validation: { ...field.validation, max: e.target.valueAsNumber },
                })
              }
              className="h-8 mt-1"
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <Label htmlFor={`required-${field.id}`} className="text-sm font-medium">
          Required
        </Label>
        <Switch
          id={`required-${field.id}`}
          checked={field.validation?.required || false}
          onCheckedChange={(checked) =>
            updateField(field.id, {
              validation: { ...field.validation, required: checked },
            })
          }
        />
      </div>
    </div>
  );
}

function OptionsEditor({ field }: { field: FormFieldType }) {
  const { addOption, removeOption, updateOption } = useFormStore();
  const options = field.options || [];

  const handleAddOption = () => {
    addOption(field.id);
  };

  const handleRemoveOption = (index: number) => {
    removeOption(field.id, index);
  };

  const handleOptionChange = (index: number, value: string) => {
    const currentOption = options[index];
    if (typeof currentOption === 'object') {
      updateOption(field.id, index, { ...currentOption, label: value, value: value.toLowerCase().replace(/\s+/g, '_') });
    } else {
      updateOption(field.id, index, value);
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-border/50">
      <h3 className="text-sm font-medium mb-2">Options</h3>
      <div className="space-y-2">
        {(field.options || []).map((option, index) => (
          <div key={index} className="flex items-center gap-2">
            <Input
              type="text"
              value={typeof option === 'object' ? option.label : option}
              onChange={(e) => handleOptionChange(index, e.target.value)}
              className="flex-grow bg-white/50"
              placeholder={`Option ${index + 1}`}
            />
            <button onClick={() => handleRemoveOption(index)} className="text-muted-foreground hover:text-destructive">
              &times;
            </button>
          </div>
        ))}
      </div>
      <button onClick={handleAddOption} className="mt-2 text-sm text-primary">
        + Add option
      </button>
    </div>
  );
} 