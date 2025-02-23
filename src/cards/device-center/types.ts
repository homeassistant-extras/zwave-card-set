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
   * List of devices
   */
  devices?: Record<string, Device[]>;
}
