/**
 * Zooz Nodes Status Card Registration Module
 *
 * This module handles the registration of the Zooz Nodes Status Card custom element
 * with the browser and Home Assistant's custom card registry. It makes the
 * component available for use in Home Assistant dashboards.
 */

import { ZoozDeviceCenter } from './card';

// Register the custom element with the browser
customElements.define('zooz-device-center', ZoozDeviceCenter);

// Ensure the customCards array exists on the window object
window.customCards = window.customCards || [];

// Register the card with Home Assistant's custom card registry
window.customCards.push({
  // Unique identifier for the card type
  type: 'zooz-device-center',

  // Display name in the UI
  name: 'Zooz Device Center',

  // Card description for the UI
  description: 'A card to summarize all your devices in one place.',

  // Show a preview of the card in the UI
  preview: true,

  // URL for the card's documentation
  documentationURL: 'https://github.com/homeassistant-extras/zooz-card-set',
});
