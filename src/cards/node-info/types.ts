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
 * Represents the states of various sensors in a device.
 */
export interface Sensor {
  /** The name of the device */
  name?: string;

  /** If this device is a controller */
  isController?: boolean;

  /** The manufacturer of the device */
  manufacturer?: string;

  /** The model of the device */
  model?: string;

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
