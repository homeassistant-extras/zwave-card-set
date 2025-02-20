/**
 * DC Signal Sensor Card Registration Module
 *
 * This module handles the registration of the DC Signal Sensor Card custom element
 * with the browser and Home Assistant's custom card registry. It makes the
 * component available for use in Home Assistant dashboards.
 */

import { DcSignalSensorCard } from './card';
import { DcSignalSensorCardEditor } from './editor';

// Register the custom element with the browser
customElements.define('zooz-dc-signal-sensor', DcSignalSensorCard);
customElements.define('zooz-dc-signal-sensor-editor', DcSignalSensorCardEditor);

// Ensure the customCards array exists on the window object
window.customCards = window.customCards || [];

// Register the card with Home Assistant's custom card registry
window.customCards.push({
  // Unique identifier for the card type
  type: 'zooz-dc-signal-sensor',

  // Display name in the UI
  name: 'ZEN55 LR - DC Signal Sensor',

  // Card description for the UI
  description: 'A card to summarize the status of a ZEN55 DC Signal Sensor.',

  // Show a preview of the card in the UI
  preview: true,

  // URL for the card's documentation
  documentationURL: 'https://github.com/homeassistant-extras/zooz-card-set',
});
