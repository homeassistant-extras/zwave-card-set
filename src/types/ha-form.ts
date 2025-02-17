/**
 * Base schema interface for Home Assistant form elements
 * Contains the common properties required for all form elements
 */
export interface HaFormBaseSchema {
  /** Unique identifier for the form element */
  name: string;
  /** Display text shown to the user for this form element */
  label: string;
}

/**
 * Primary form schema type for Home Assistant forms
 * In this simplified version, only selector-based form elements are supported
 */
export type HaFormSchema = HaFormSelector;

/**
 * Interface for selector-based form elements
 * These are input fields using various selector types
 */
export interface HaFormSelector extends HaFormBaseSchema {
  /** Type is not used for selectors as they're identified by their selector property */
  type?: never;
  /** Indicates if this field must have a value */
  required?: boolean;
  /** The specific selector type that defines the input behavior */
  selector: Selector;
}

/**
 * Union type for supported selector types
 * This simplified version only supports area and select selectors
 */
export type Selector = NumberSelector | StringSelector;

export interface NumberSelector {
  number: {
    min?: number;
    max?: number;
  } | null;
}

/**
 * Selector for text-based inputs with various formats
 */
export interface StringSelector {
  text: {
    /** When true, allows entering multiple lines of text */
    multiline?: boolean;
    /** Specifies the HTML input type, affecting validation and keyboard on mobile devices */
    type?:
      | 'number'
      | 'text'
      | 'search'
      | 'tel'
      | 'url'
      | 'email'
      | 'password'
      | 'date'
      | 'month'
      | 'week'
      | 'time'
      | 'datetime-local'
      | 'color';
    /** Text to display after the input field (e.g., units like "°C" or "%") */
    suffix?: string;
  };
}
