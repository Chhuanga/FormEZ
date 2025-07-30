declare class FieldValidationDto {
    required?: boolean;
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
}
declare class OptionDto {
    label: string;
    value: string;
}
export declare class FormFieldDto {
    id: string;
    type: string;
    label: string;
    placeholder?: string;
    validation?: FieldValidationDto;
    options?: (string | OptionDto)[];
}
export {};
