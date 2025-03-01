/**
 * Represents a physical device in the system
 */
export type ZWaveDevice = {
  /** Unique identifier for the device */
  id: string;

  /** Name of the device */
  name?: string;

  /** Custom name assigned to the device by the user */
  device_name?: string;

  /** Name of the company that produced the device */
  manufacturer?: string;

  /** Model name or number of the device */
  model?: string;
};
