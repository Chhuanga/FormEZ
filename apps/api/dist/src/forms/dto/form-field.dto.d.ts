declare class FieldValidationDto {
    required?: boolean;
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
}
export declare class FormFieldDto {
    id: string;
    type: string;
    label: string;
    placeholder?: string;
    validation?: FieldValidationDto;
    options?: string[];
}
export {};
