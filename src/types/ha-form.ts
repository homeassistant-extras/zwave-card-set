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
 * Union type representing different selector types.
 * This version supports DeviceSelector, NumberSelector, SelectSelector, and StringSelector.
 */
export type Selector =
  | DeviceSelector
  | NumberSelector
  | SelectSelector
  | StringSelector;

/**
 * Selector for devices, allowing filtering by integration, manufacturer, and model.
 * Can also filter by entity and specify if multiple selections are allowed.
 */
export interface DeviceSelector {
  device: {
    /**
     * Optional filter criteria for selecting devices.
     * Can be a single filter or an array of filters.
     */
    filter?: DeviceSelectorFilter | readonly DeviceSelectorFilter[];

    /**
     * Optional filter criteria for selecting entities.
     * Can be a single filter or an array of filters.
     */
    entity?: EntitySelectorFilter | readonly EntitySelectorFilter[];

    /**
     * Indicates whether multiple devices can be selected.
     */
    multiple?: boolean;
  } | null;
}

/**
 * Selector for numeric values, defining an optional min and max range.
 */
export interface NumberSelector {
  number: {
    /**
     * Minimum allowed value (optional).
     */
    min?: number;

    /**
     * Maximum allowed value (optional).
     */
    max?: number;
  } | null;
}

/**
 * Selector for dropdown or multi-select inputs
 */
export interface SelectSelector {
  select: {
    /** When true, allows selecting multiple options */
    multiple?: boolean;
    /** When true, allows entering custom values not in the options list */
    custom_value?: boolean;
    /** Defines the display mode for the options */
    mode?: 'list';
    /** Available options, either as simple strings or as value-label pairs */
    options: string[] | SelectOption[];
  };
}

/**
 * Interface for defining select options with separate values and display labels
 */
export interface SelectOption {
  /** The data value to be stored when this option is selected */
  value: string;
  /** The human-readable text shown for this option in the UI */
  label: string;
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

/**
 * Criteria for filtering devices based on integration, manufacturer, or model.
 */
interface DeviceSelectorFilter {
  /**
   * Specifies the integration the device belongs to.
   */
  integration?: string;

  /**
   * Specifies the manufacturer of the device.
   */
  manufacturer?: string;

  /**
   * Specifies the model of the device.
   */
  model?: string;
}

/**
 * Filter criteria for selecting entities based on various attributes.
 */
interface EntitySelectorFilter {
  /**
   * Specifies the integration the entity belongs to.
   */
  integration?: string;

  /**
   * Specifies the domain of the entity (e.g., "light", "switch").
   * Can be a single domain or an array of domains.
   */
  domain?: string | readonly string[];

  /**
   * Specifies the device class of the entity (e.g., "motion", "temperature").
   * Can be a single class or an array of classes.
   */
  device_class?: string | readonly string[];

  /**
   * Specifies the supported features of the entity using numeric flags.
   * Can be a single number or an array with one number.
   */
  supported_features?: number | [number];
}
