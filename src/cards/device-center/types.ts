import type { ZWaveDevice } from '@type/zwave';

/**
 * System-wide configuration settings
 */
export interface Config {
  /** Optional area to filter on */
  area?: string;

  /** Options to enable disable features **/
  features?: Features[];
}

/** Features to enable or disable functionality */
export type Features = 'use_icons_instead_of_names' | 'show_headers';

/**
 * Device center state
 */
export interface Center {
  /**
   * Devices grouped by manufacturer and then by model
   * First level keys: manufacturer names
   * Second level keys: model names
   * Values: arrays of devices
   */
  devices: Record<string, Record<string, ZWaveDevice[]>>;
}
