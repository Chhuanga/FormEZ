'use client';

import { useDraggable } from '@dnd-kit/core';
import { FormField as FormFieldType } from '@/store/form';
import {
  Type,
  AlignLeft,
  AtSign,
  Circle,
  ChevronDown,
  Square,
  Calendar,
  Hash,
  Upload,
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

type PaletteGroup = {
  name: string;
  items: (Pick<FormFieldType, 'type'> & {
  icon: React.ReactNode; 
  label: string; 
    description: string;
  })[];
};

const PALETTE_GROUPS: PaletteGroup[] = [
  {
    name: 'Promoted Fields',
    items: [
      {
        type: 'Input',
        icon: <Type className="h-5 w-5" />,
        label: 'Short Text',
        description: 'A simple text input field.',
      },
      {
        type: 'Email',
        icon: <AtSign className="h-5 w-5" />,
        label: 'Email',
        description: 'A text input that validates for a proper email format.',
      },
      {
        type: 'Select',
        icon: <ChevronDown className="h-5 w-5" />,
        label: 'Select',
        description: 'A dropdown list of options.',
      },
    ],
  },
  {
    name: 'Text Inputs',
    items: [
      {
        type: 'Textarea',
        icon: <AlignLeft className="h-5 w-5" />,
        label: 'Long Text',
        description: 'A larger text area for longer responses.',
      },
      {
        type: 'NumberInput',
        icon: <Hash className="h-5 w-5" />,
        label: 'Number',
        description: 'A text input that only accepts numbers.',
      },
    ],
  },
  {
    name: 'Choice Inputs',
    items: [
  {
    type: 'RadioGroup',
        icon: <Circle className="h-5 w-5" />,
    label: 'Radio Group',
        description: 'A set of options where only one can be selected.',
      },
      {
        type: 'Checkbox',
        icon: <Square className="h-5 w-5" />,
        label: 'Checkbox',
        description: 'A set of options where multiple can be selected.',
      },
    ],
  },
  {
    name: 'Data Inputs',
    items: [
      {
        type: 'DatePicker',
        icon: <Calendar className="h-5 w-5" />,
        label: 'Date',
        description: 'A date picker for selecting a specific date.',
      },
      {
        type: 'FileUpload',
        icon: <Upload className="h-5 w-5" />,
        label: 'File Upload',
        description: 'Allows users to upload a file.',
      },
    ],
  },
];

function PaletteItem({
  type,
  icon,
  label,
}: {
  type: FormFieldType['type'];
  icon: React.ReactNode;
  label: string;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${type}`,
    data: { isPaletteItem: true, type, label, icon },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`
        group flex items-center gap-3 p-3 border border-transparent rounded-lg 
        cursor-grab active:cursor-grabbing transition-colors duration-150
        hover:bg-accent hover:border-border
        ${isDragging ? 'invisible' : ''}
      `}
    >
      <div className="w-8 h-8 bg-muted rounded-md flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
        {icon}
      </div>
      <div className="font-medium text-card-foreground text-sm">
        {label}
      </div>
    </div>
  );
}

export function BlockPalette() {
  return (
    <div className="p-1">
      <p className="text-xs font-semibold text-muted-foreground px-2 pt-1 pb-2">
        Blocks
      </p>
      <Accordion type="multiple" defaultValue={['Promoted Fields', 'Text Inputs', 'Choice Inputs', 'Data Inputs']} className="w-full">
        {PALETTE_GROUPS.map((group) => (
          <AccordionItem value={group.name} key={group.name} className="border-none">
            <AccordionTrigger className="text-sm px-2 py-2 hover:no-underline">{group.name}</AccordionTrigger>
            <AccordionContent className="pb-1">
              <div className="px-1">
                {group.items.map((item, index) => (
                  <div key={item.type}>
                    <div className="px-1">
        <PaletteItem 
          type={item.type} 
          icon={item.icon}
          label={item.label}
        />
                    </div>
                    {index < group.items.length - 1 && (
                      <div className="mx-2 my-1 border-t border-border/30" />
                    )}
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
      ))}
      </Accordion>
    </div>
  );
} 