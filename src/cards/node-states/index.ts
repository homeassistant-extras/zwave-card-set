/**
 * Zooz Nodes Status Card Registration Module
 *
 * This module handles the registration of the Zooz Nodes Status Card custom element
 * with the browser and Home Assistant's custom card registry. It makes the
 * component available for use in Home Assistant dashboards.
 */

import { ZoozNodesStatus } from './card';
import { ZoozNodesStatusEditor } from './editor';

// Register the custom element with the browser
customElements.define('zooz-nodes-status', ZoozNodesStatus);
customElements.define('zooz-nodes-status-editor', ZoozNodesStatusEditor);

// Ensure the customCards array exists on the window object
window.customCards = window.customCards || [];

// Register the card with Home Assistant's custom card registry
window.customCards.push({
  // Unique identifier for the card type
  type: 'zooz-nodes-status',

  // Display name in the UI
  name: 'Zooz Nodes Status',

  // Card description for the UI
  description: 'A card to summarize the status of all the Zooz nodes.',

  // Show a preview of the card in the UI
  preview: true,

  // URL for the card's documentation
  documentationURL: 'https://github.com/homeassistant-extras/zooz-card-set',
});
