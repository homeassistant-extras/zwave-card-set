import { BaseZoozCard } from '@base/card';
import type { BaseCardConfig, StaticCardConfig } from '@base/types';
import type { CardConfig } from '@type/config';

// Device-specific card configurations
const CARD_CONFIGS: Record<string, BaseCardConfig> = {
  'zooz-smart-plug': {
    static: {
      model: 'ZEN04 800LR',
    },
    instance: {
      icon: 'mdi:power-socket-us',
      entityDomains: ['switch'],
    },
  },
  'zooz-double-switch': {
    static: {
      model: 'ZEN30',
    },
    instance: {
      icon: 'mdi:ceiling-light-multiple-outline',
      entityDomains: ['light', 'switch'],
    },
  },
  'zooz-dry-contact-relay': {
    static: {
      model: 'ZEN51',
    },
    instance: {
      icon: 'mdi:electric-switch',
      entityDomains: ['switch'],
    },
  },
  'zooz-double-relay': {
    static: {
      model: 'ZEN52',
    },
    instance: {
      icon: 'mdi:lightbulb-on-outline',
      entityDomains: ['switch'],
    },
  },
  'zooz-dc-signal-sensor': {
    static: {
      model: 'ZEN55 LR',
    },
    instance: {
      icon: 'mdi:fire',
      entityDomains: ['binary_sensor'],
    },
  },
  'zooz-on-off-switch': {
    static: {
      model: 'ZEN71',
    },
    instance: {
      icon: 'mdi:toggle-switch-variant-off',
      entityDomains: ['switch'],
    },
  },
};

// Device-specific cards using BaseZoozCard
export const infoCards: CardConfig[] = [
  {
    type: 'zooz-smart-plug',
    name: 'ZEN04 800LR - Smart Plug',
    description: 'A card to control and monitor a Zooz smart plug device.',
  },
  {
    type: 'zooz-double-switch',
    name: 'ZEN30 - Double Switch',
    description: 'A card to control and monitor a Zooz double switch device.',
  },
  {
    type: 'zooz-dry-contact-relay',
    name: 'ZEN51 - Dry Contact Relay',
    description:
      'A card to control and monitor a Zooz dry contact relay device.',
  },
  {
    type: 'zooz-double-relay',
    name: 'ZEN52 - Double Relay',
    description: 'A card to control and monitor a Zooz double relay device.',
  },
  {
    type: 'zooz-dc-signal-sensor',
    name: 'ZEN55 LR - DC Signal Sensor',
    description: 'A card to monitor a Zooz DC signal sensor device.',
  },
  {
    type: 'zooz-on-off-switch',
    name: 'ZEN71 - On/Off Switch',
    description: 'A card to control and monitor a Zooz on/off switch device.',
  },
].map((card) => ({
  ...card,
  element: class extends BaseZoozCard {
    constructor() {
      super();
      const config: BaseCardConfig = CARD_CONFIGS[card.type]!;
      this.instanceCardConfig = config.instance;
    }

    protected static override staticCardConfig: StaticCardConfig =
      CARD_CONFIGS[card.type]!.static;
  },
}));
