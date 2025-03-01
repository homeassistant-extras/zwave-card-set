import type { State } from '@/types/homeassistant';
import type { ZWaveDevice } from '@type/zwave';

/**
 * System-wide configuration settings
 */
export interface Config {
  /** Unique identifier for the device */
  device_id: string;

  /** Optional display title for the device */
  title?: string;
}

/**
 * Represents a hub, including its name, status, signal strength indicators,
 * connected devices, and any error messages.
 */
export interface Controller {
  /**
   * The name of the hub.
   */
  name: string;

  /**
   * The state entity representing the hub's overall status.
   */
  statusEntity?: State;

  /**
   * A list of state entities representing the signal strength (RSSI)
   * of connected devices.
   */
  rssiEntities: State[];

  /**
   * A list of devices currently connected to the hub.
   */
  connectedDevices: ZWaveDevice[];

  /**
   * Any error message related to the hub's operation.
   */
  error?: string;
}
