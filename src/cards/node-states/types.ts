import type { State } from '@type/homeassistant';

/**
 * System-wide configuration settings
 */
export interface Config {
  /** The name or title of the system */
  title?: string;

  /** The number of columns to display in the UI */
  columns?: number;

  /** Options to enable disable features **/
  features?: Features[];
}

/** Features to enable or disable functionality */
export type Features = 'compact';

/**
 * Represents information about a node (device) in the system
 */
export interface NodeInfo {
  /** Human-readable name of the node */
  name: string;

  /** Unique identifier for the device */
  device_id: string;

  /** Current state of the node */
  statusState: State;

  /** State when the node was last seen/detected */
  lastSeenState: State;

  /** Timestamp (Unix time) when the node was last detected */
  lastSeen: number;
}
