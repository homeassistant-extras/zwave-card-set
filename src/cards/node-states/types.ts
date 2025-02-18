/**
 * System-wide configuration settings
 */
export interface Config {
  /** The name or title of the system */
  title?: string;

  /** The number of columns to display in the UI */
  columns?: number;

  /** Options to enable disable features **/
  features?: Features[];
}

/** Features to enable or disable functionality */
export type Features = 'compact';

/**
 * Represents information about a node (device) in the system
 */
export interface NodeInfo {
  /** Human-readable name of the node */
  name: string;

  /** Unique identifier for the device */
  device_id: string;

  /** Current state of the node */
  statusState: State;

  /** State when the node was last seen/detected */
  lastSeenState: State;

  /** Timestamp (Unix time) when the node was last detected */
  lastSeen: number;
}

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

  /** Custom name assigned to the device by the user */
  name_by_user: string;

  /** Name of the company that produced the device */
  manufacturer: string;

  /** Array of tags or categories associated with the device */
  labels: string[];
};

/**
 * Represents a specific function or capability within a device
 * A single device might have multiple entities (e.g., a smart bulb with separate
 * entities for brightness, color, and power state)
 */
type Entity = {
  /** Unique identifier for the entity */
  entity_id: string;

  /** ID of the device this entity belongs to */
  device_id: string;
};

/**
 * Represents the current condition or value of an entity
 */
type State = {
  /** ID of the entity this state belongs to */
  entity_id: string;

  /** Current state value as a string (e.g., "on", "off", "25.5") */
  state: string;
};

/**
 * Event emitted when the configuration changes
 */
export interface ConfigChangedEvent {
  config: Config;
}

/**
 * Global interface for Home Assistant DOM events
 */
declare global {
  // eslint-disable-next-line
  interface HASSDomEvents {
    'config-changed': ConfigChangedEvent;
  }
}
