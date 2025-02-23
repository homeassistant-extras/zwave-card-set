import { BaseZoozCard } from '@/cards/base/card';
import type { DefaultConfig } from '@base/types';

/**
 * Double Relay Card
 * Custom card implementation for Zooz ZEN52 Double Relay device
 * Displays and controls the state of two relays along with device status
 */
export class DoubleRelayCard extends BaseZoozCard {
  /**
   * Initializes the card
   */
  static override defaultConfig(): DefaultConfig {
    return {
      entityDomains: ['switch'],
      icon: 'mdi:ceiling-fan-light',
      model: 'ZEN52',
    };
  }
}
