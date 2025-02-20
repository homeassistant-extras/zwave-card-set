/**
 * @file Home Assistant TypeScript type definitions
 * @description Core type definitions for Home Assistant integration, including entities,
 * devices, states, and action handlers.
 */

/**
 * Main interface representing the Home Assistant system that manages devices, entities, and states
 */
export interface HomeAssistant {
  /** Dictionary of all states, keyed by entity_id */
  states: Record<string, State>;

  /** Dictionary of all entities, keyed by entity_id */
  entities: Record<string, Entity>;

  /** Dictionary of all devices, keyed by device_id */
  devices: Record<string, Device>;
}

/**
 * Represents a physical device in the system
 */
export type Device = {
  /** Unique identifier for the device */
  id: string;

  /** Name of the device */
  name?: string;

  /** Custom name assigned to the device by the user */
  name_by_user?: string;

  /** Name of the company that produced the device */
  manufacturer?: string;

  /** Model name or number of the device */
  model?: string;

  /** Array of tags or categories associated with the device */
  labels?: string[];
};

/**
 * Represents a specific function or capability within a device
 * A single device might have multiple entities (e.g., a smart bulb with separate
 * entities for brightness, color, and power state)
 */
export type Entity = {
  /** Unique identifier for the entity */
  entity_id: string;

  /** ID of the device this entity belongs to */
  device_id: string;
};

/**
 * Represents the current condition or value of an entity
 */
export type State = {
  /** ID of the entity this state belongs to */
  entity_id: string;

  /** Current state value as a string (e.g., "on", "off", "25.5") */
  state: string;

  /** Additional attributes associated with the state */
  attributes?: Record<string, any>;
};
