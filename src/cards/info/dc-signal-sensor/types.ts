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
  /** The current firmware state of the device */
  firmwareState?: State;

  /** The last recorded state when the device was seen */
  lastSeenState?: State;

  /** The status of the node (e.g., online/offline) */
  nodeStatusState?: State;

  /** Indicates if smoke has been detected */
  smokeDetectedState?: State;

  /** Indicates if carbon monoxide has been detected */
  carbonMonoxideDetectedState?: State;
}
