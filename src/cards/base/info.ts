import { BaseZWaveCard } from '@base/card';
import type { BaseCardConfig, StaticCardConfig } from '@base/types';
import type { CardConfig } from '@type/config';

// Device-specific card configurations
const CARD_CONFIGS: Record<string, BaseCardConfig> = {
  'zwave-smart-plug': {
    static: {
      model: 'ZEN04 800LR',
    },
    instance: {
      icon: 'mdi:power-socket-us',
      entityDomains: ['switch'],
    },
  },
  'zwave-multi-relay': {
    static: {
      model: 'ZEN16',
    },
    instance: {
      icon: 'mdi:garage-open-variant',
      entityDomains: ['switch'],
    },
  },
  'zwave-double-switch': {
    static: {
      model: 'ZEN30',
    },
    instance: {
      icon: 'mdi:ceiling-light-multiple-outline',
      entityDomains: ['light', 'switch'],
    },
  },
  'zwave-scene-controller': {
    static: {
      model: 'ZEN32',
    },
    instance: {
      icon: 'mdi:gesture-double-tap',
      entityDomains: ['switch', 'light'],
    },
  },
  'zwave-dry-contact-relay': {
    static: {
      model: 'ZEN51',
    },
    instance: {
      icon: 'mdi:electric-switch',
      entityDomains: ['switch'],
    },
  },
  'zwave-double-relay': {
    static: {
      model: 'ZEN52',
    },
    instance: {
      icon: 'mdi:lightbulb-on-outline',
      entityDomains: ['switch'],
    },
  },
  'zwave-dc-signal-sensor': {
    static: {
      model: 'ZEN55 LR',
    },
    instance: {
      icon: 'mdi:fire',
      entityDomains: ['binary_sensor'],
    },
  },
  'zwave-on-off-switch': {
    static: {
      model: 'ZEN71',
    },
    instance: {
      icon: 'mdi:toggle-switch-variant-off',
      entityDomains: ['switch'],
    },
  },
  'zwave-open-close-sensor': {
    static: {
      model: 'ZSE41',
    },
    instance: {
      icon: 'mdi:door-open',
      entityDomains: ['binary_sensor'],
    },
  },
  'zwave-tilt-shock-sensor': {
    static: {
      model: 'ZSE43',
    },
    instance: {
      icon: 'mdi:angle-acute',
      entityDomains: ['binary_sensor'],
    },
  },
  'zwave-temperature-humidity-sensor': {
    static: {
      model: 'ZSE44',
    },
    instance: {
      icon: 'mdi:thermometer',
      entityDomains: ['sensor'],
    },
  },
};

// Device-specific cards using BaseZWaveCard
export const infoCards: CardConfig[] = [
  {
    type: 'zwave-smart-plug',
    name: 'ZEN04 800LR - Smart Plug',
    description: 'A card to control and monitor a Z-Wave smart plug device.',
  },
  {
    type: 'zwave-multi-relay',
    name: 'ZEN16 - Multi Relay',
    description: 'A card to control and monitor a Z-Wave multi relay device.',
  },
  {
    type: 'zwave-double-switch',
    name: 'ZEN30 - Double Switch',
    description: 'A card to control and monitor a Z-Wave double switch device.',
  },
  {
    type: 'zwave-scene-controller',
    name: 'ZEN32 - Scene Controller',
    description: 'A card to control and monitor a Z-Wave scene controller.',
  },
  {
    type: 'zwave-dry-contact-relay',
    name: 'ZEN51 - Dry Contact Relay',
    description:
      'A card to control and monitor a Z-Wave dry contact relay device.',
  },
  {
    type: 'zwave-double-relay',
    name: 'ZEN52 - Double Relay',
    description: 'A card to control and monitor a Z-Wave double relay device.',
  },
  {
    type: 'zwave-dc-signal-sensor',
    name: 'ZEN55 LR - DC Signal Sensor',
    description: 'A card to monitor a Z-Wave DC signal sensor device.',
  },
  {
    type: 'zwave-on-off-switch',
    name: 'ZEN71 - On/Off Switch',
    description: 'A card to control and monitor a Z-Wave on/off switch device.',
  },
  {
    type: 'zwave-open-close-sensor',
    name: 'ZSE41 - Open Close Sensor',
    description: 'A card to monitor a Z-Wave open close sensor device.',
  },
  {
    type: 'zwave-tilt-shock-sensor',
    name: 'ZSE43 - Tilt Shock Sensor',
    description: 'A card to monitor a Z-Wave tilt shock sensor device.',
  },
  {
    type: 'zwave-temperature-humidity-sensor',
    name: 'ZSE44 - Temperature Humidity Sensor',
    description:
      'A card to monitor a Z-Wave temperature humidity sensor device.',
  },
].map((card) => ({
  ...card,
  element: class extends BaseZWaveCard {
    constructor() {
      super();
      const config: BaseCardConfig = CARD_CONFIGS[card.type]!;
      this.instanceCardConfig = config.instance;
    }

    protected static override staticCardConfig: StaticCardConfig =
      CARD_CONFIGS[card.type]!.static;
  },
}));
