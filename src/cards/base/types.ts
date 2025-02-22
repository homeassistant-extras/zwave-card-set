import type { State } from '@type/homeassistant';

/**
 * Configuration object for a device.
 */
export interface Config {
  /** Unique identifier for the device */
  device_id: string;

  /** Optional display title for the device */
  title?: string;

  /** Optional icon representing the device */
  icon?: string;
}

export interface DefaultConfig {
  /** Optional display title for the device */
  title: string;

  /** Optional icon representing the device */
  icon: string;

  /** Entity suffixes for the device */
  entitySuffixes: string[];

  /** Model identifier for the device */
  model: string;
}

/**
 * Represents the states of various sensors in a device.
 */
export interface Sensor {
  /** The current firmware state of the device */
  firmwareState?: State;

  /** The last recorded state when the device was seen */
  lastSeenState?: State;

  /** The status of the node (e.g., online/offline) */
  nodeStatusState?: State;

  /** The status of the entities */
  entities: State[];
}
