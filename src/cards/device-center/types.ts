import type { Device } from '@type/homeassistant';

/**
 * System-wide configuration settings
 */
export interface Config {}

/**
 * Device center state
 */
export interface Center {
  /**
   * List of devices
   */
  zen55?: Device[] | undefined;
}
