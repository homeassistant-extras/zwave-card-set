/**
 * @file types.ts
 * @description Type definitions for Z-Wave card components
 * Contains interfaces for configuration, sensors, and controllers
 */

import type { State } from '@type/homeassistant';

/**
 * Configuration object for a Z-Wave device card
 */
export interface Config {
  /** Unique identifier for the device */
  device_id: string;

  /** Optional display title for the device */
  title?: string;

  /** Optional icon representing the device */
  icon?: string;

  /** Options to enable disable features **/
  features?: Features[];
}

/** Features to enable or disable functionality */
export type Features = 'debug' | 'use_icons_instead_of_names';

/**
 * Represents the states of various sensors in a Z-Wave device
 */
export interface Sensor {
  /** The name of the device */
  name?: string;

  /** If this device is a controller/hub */
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

  /** The entites of the device */
  entities: State[];

  /** The sensors of the device */
  sensors: State[];
}
