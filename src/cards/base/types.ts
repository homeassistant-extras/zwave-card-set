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

/**
 * Configuration for the base info card.
 */
export interface BaseCardConfig {
  /** The static configuration */
  static: StaticCardConfig;

  /** The instance configuration */
  instance: InstanceCardConfig;
}

/**
 * Configuration object for a basic Z-Wave card.
 */
export interface StaticCardConfig {
  /** Model identifier for the device */
  model: string;
}

export interface InstanceCardConfig {
  /** Optional icon representing the device */
  icon: string;

  /** Entity domains for the device */
  entityDomains: string[];
}

/**
 * Represents the states of various sensors in a device.
 */
export interface Sensor {
  /** The name of the device */
  name?: string;

  /** The current firmware state of the device */
  firmwareState?: State;

  /** The last recorded state when the device was seen */
  lastSeenState?: State;

  /** The status of the node (e.g., online/offline) */
  nodeStatusState?: State;

  /** The battery state of the device */
  batteryState?: State;

  /** The status of the entities */
  entities: State[];
}
