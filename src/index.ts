import { BatteryIndicator } from '@base/battery-indicator';
import { infoCards } from '@base/info';
import { ZoozDeviceCenter } from '@center/card';
import { ZoozBasicEditor } from '@common/basic-editor';
import { ZoozHubCard } from '@hub-card/card';
import { ZoozNodesStatus } from '@node-states/card';
import type { CardConfig } from '@type/config';
import { version } from '../package.json';

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

// Register other custom elements
customElements.define('zooz-basic-editor', ZoozBasicEditor);
customElements.define('battery-indicator', BatteryIndicator);
window.customCards = window.customCards || [];

// Register all cards
[...BASE_CARDS, ...infoCards].forEach((card) => {
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
