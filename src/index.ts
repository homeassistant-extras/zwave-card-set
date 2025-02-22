import { ZoozDeviceCenter } from '@center/card';
import { ZoozBasicEditor } from '@common/basic-editor';
import { ZoozHubCard } from '@hub-card/card';
import { ZoozNodesStatus } from '@node-states/card';
import { DoubleRelayCard } from '@z52/card';
import { DcSignalSensorCard } from '@z55/card';
import { version } from '../package.json';

interface CardConfig {
  element: CustomElementConstructor;
  type: string;
  name: string;
  description: string;
}

const CARDS: CardConfig[] = [
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
  {
    element: DoubleRelayCard,
    type: 'zooz-double-relay',
    name: 'ZEN52 - Double Relay',
    description: 'A card to control and monitor a Zooz double relay device.',
  },
  {
    element: DcSignalSensorCard,
    type: 'zooz-dc-signal-sensor',
    name: 'ZEN55 LR - DC Signal Sensor',
    description: 'A card to monitor a Zooz DC signal sensor device.',
  },
];

// Register the basic editor
customElements.define('zooz-basic-editor', ZoozBasicEditor);
window.customCards = window.customCards || [];

// Register all cards
CARDS.forEach((card) => {
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
