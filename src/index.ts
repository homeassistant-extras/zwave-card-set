import { ZWaveNodeCard } from '@/cards/node-info/card';
import { ZWaveDeviceCenter } from '@center/card';
import { BasicEditor } from '@common/basic-editor';
import { BatteryIndicator } from '@common/battery-indicator';
import { ZWaveHubCard } from '@controller-info/card';
import { ZWaveNodesStatus } from '@node-states/card';
import type { CardConfig } from '@type/config';
import { version } from '../package.json';

// Base cards that aren't device-specific
const BASE_CARDS: CardConfig[] = [
  {
    element: ZWaveNodeCard,
    type: 'zwave-node-info',
    name: 'Z-Wave Node Info',
    description: 'A card to summarize a Z-Wave node.',
  },
  {
    element: ZWaveHubCard,
    type: 'zwave-controller-info',
    name: 'Z-Wave Hub Info',
    description: 'A card to summarize information about the hub.',
  },
  {
    element: ZWaveDeviceCenter,
    type: 'zwave-device-center',
    name: 'Z-Wave Device Center',
    description: 'A card to summarize all your devices in one place.',
  },
  {
    element: ZWaveNodesStatus,
    type: 'zwave-nodes-status',
    name: 'Z-Wave Nodes Status',
    description: 'A card to summarize the status of all the Z-Wave nodes.',
  },
];

// Register other custom elements
customElements.define('basic-editor', BasicEditor);
customElements.define('battery-indicator', BatteryIndicator);
window.customCards = window.customCards || [];

// Register all cards
[...BASE_CARDS].forEach((card) => {
  // Register the custom element
  customElements.define(card.type, card.element);

  // Register with Home Assistant's custom card registry
  window.customCards.push({
    type: card.type,
    name: card.name,
    description: card.description,
    preview: true,
    documentationURL: 'https://github.com/homeassistant-extras/zwave-card-set',
  });
});

console.info(
  `%c🐱 Poat's Tools: zwave-card-set - ${version}`,
  'color: #CFC493;',
);
