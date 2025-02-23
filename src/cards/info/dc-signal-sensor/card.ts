import { BaseZoozCard } from '@/cards/base/card';
import type { DefaultConfig } from '@base/types';

/**
 * DC Signal Sensor Card
 * Custom card implementation for Zooz ZEN55 LR Smoke/CO Detector
 * Displays smoke and carbon monoxide detection states along with device status
 */
export class DcSignalSensorCard extends BaseZoozCard {
  /**
   * Initializes the card
   */
  static override defaultConfig(): DefaultConfig {
    return {
      entityDomains: ['binary_sensor'],
      icon: 'mdi:fire',
      model: 'ZEN55 LR',
    };
  }
}
