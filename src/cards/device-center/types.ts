import type { Device } from '@type/homeassistant';

/**
 * System-wide configuration settings
 */
export interface Config {
  /** Optional area to filter on */
  area?: string;
}

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
  devices: Record<string, Record<string, Device[]>>;
}
