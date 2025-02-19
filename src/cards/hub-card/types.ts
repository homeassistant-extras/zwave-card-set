import type { Device, State } from '@/types/homeassistant';

/**
 * System-wide configuration settings
 */
export interface Config {}

/**
 * Represents a hub, including its name, status, signal strength indicators,
 * connected devices, and any error messages.
 */
export interface Hub {
  /**
   * The name of the hub.
   */
  name: string;

  /**
   * The state entity representing the hub's overall status.
   */
  statusEntity: State;

  /**
   * A list of state entities representing the signal strength (RSSI)
   * of connected devices.
   */
  rssiEntities: State[];

  /**
   * A list of devices currently connected to the hub.
   */
  connectedDevices: Device[];

  /**
   * Any error message related to the hub's operation.
   */
  error: string;
}
