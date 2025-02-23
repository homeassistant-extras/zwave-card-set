import { BaseZoozCard } from '@base/card';
import type { BaseCardConfig, StaticCardConfig } from '@base/types';
import { ZoozDeviceCenter } from '@center/card';
import { ZoozBasicEditor } from '@common/basic-editor';
import { ZoozHubCard } from '@hub-card/card';
import { ZoozNodesStatus } from '@node-states/card';
import { version } from '../package.json';

interface CardConfig {
  element: CustomElementConstructor;
  type: string;
  name: string;
  description: string;
}

// Device-specific card configurations
const CARD_CONFIGS: Record<string, BaseCardConfig> = {
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
  'zooz-double-switch': {
    static: {
      model: 'ZEN30',
    },
    instance: {
      icon: 'mdi:ceiling-light-multiple-outline',
      entityDomains: ['light', 'switch'],
    },
  },
};

// Base cards that aren't device-specific
const BASE_CARDS: CardConfig[] = [
  {
    element: ZoozDeviceCenter,
    type: 'zooz-device-center',
    name: 'Zooz Device Center',
    description: 'A card to summarize all your devices in one place.',
  },
  {
    element: ZoozHubCard,
    type: 'zooz-hub-card',
    name: 'Zooz Hub Info',
    description: 'A card to summarize information about the hub.',
  },
  {
    element: ZoozNodesStatus,
    type: 'zooz-nodes-status',
    name: 'Zooz Nodes Status',
    description: 'A card to summarize the status of all the Zooz nodes.',
  },
];

// Device-specific cards using BaseZoozCard
const INFO_CARDS: CardConfig[] = [
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
    type: 'zooz-double-switch',
    name: 'ZEN30 - Double Switch',
    description: 'A card to monitor a Zooz double switch device.',
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

// Register the basic editor
customElements.define('zooz-basic-editor', ZoozBasicEditor);
window.customCards = window.customCards || [];

// Register all cards
[...BASE_CARDS, ...INFO_CARDS].forEach((card) => {
  // Register the custom element
  customElements.define(card.type, card.element);

  // Register with Home Assistant's custom card registry
  window.customCards.push({
    type: card.type,
    name: card.name,
    description: card.description,
    preview: true,
    documentationURL: 'https://github.com/homeassistant-extras/zooz-card-set',
  });
});

console.info(
  `%c🐱 Poat's Tools: zooz-card-set - ${version}`,
  'color: #CFC493;',
);
