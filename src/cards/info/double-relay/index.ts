/**
 * Double Relay Card Registration Module
 *
 * This module handles the registration of the Double Relay Card custom element
 * with the browser and Home Assistant's custom card registry. It makes the
 * component available for use in Home Assistant dashboards.
 */

import { DoubleRelayCard } from './card';

// Register the custom element with the browser
customElements.define('zooz-double-relay', DoubleRelayCard);

// Ensure the customCards array exists on the window object
window.customCards = window.customCards || [];

// Register the card with Home Assistant's custom card registry
window.customCards.push({
  // Unique identifier for the card type
  type: 'zooz-double-relay',

  // Display name in the UI
  name: 'ZEN52 - Double Relay',

  // Card description for the UI
  description: 'A card to summarize the status of a ZEN52 Double Relay.',

  // Show a preview of the card in the UI
  preview: true,

  // URL for the card's documentation
  documentationURL: 'https://github.com/homeassistant-extras/zooz-card-set',
});
