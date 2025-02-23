import type { State } from '@type/homeassistant';
import { nothing } from 'lit';
import {
  type StyleMapDirective,
  styleMap,
} from 'lit-html/directives/style-map.js';
import type { DirectiveResult } from 'lit/directive';

const HA_COLORS = [
  'primary',
  'accent',
  'red',
  'pink',
  'purple',
  'deep-purple',
  'indigo',
  'blue',
  'light-blue',
  'cyan',
  'teal',
  'green',
  'light-green',
  'lime',
  'yellow',
  'amber',
  'orange',
  'deep-orange',
  'brown',
  'light-grey',
  'grey',
  'dark-grey',
  'blue-grey',
  'black',
  'white',
  'disabled',
];

const translateColorToRgb = (color: string, alpha: number = 1): string => {
  // use the primary or accent color from HA default theme
  if (color === 'primary' || color === 'accent') {
    // this will be a HA theme variable already in rgb format
    return `rgba(var(--rgb-${color}-color), ${alpha})`;
  }

  // use a supported HA theme color
  if (HA_COLORS.includes(color)) {
    return `rgba(var(--rgb-${color}), ${alpha})`;
  }

  return '';
};

/**
 * Maps Home Assistant domains to their conventional active state colors
 * Returns a color name from the standard HA_COLORS list
 *
 * @param domain - The Home Assistant domain (e.g., 'light', 'switch', 'cover')
 * @returns Color name from HA_COLORS (e.g., 'amber', 'blue')
 */
const activeColorFromDomain = (domain: string | undefined) => {
  switch (domain) {
    // Lighting
    case 'light':
    case 'switch_as_x':
      return 'amber';

    // Switches & Electric
    case 'switch':
    case 'input_boolean':
    case 'automation':
    case 'script':
      return 'blue';

    // Climate & Environment
    case 'climate':
    case 'fan':
      return 'teal';

    // Security & Safety
    case 'alarm_control_panel':
    case 'lock':
      return 'red';

    // Covers & Doors
    case 'cover':
    case 'garage_door':
    case 'door':
      return 'green';

    // Media
    case 'media_player':
      return 'indigo';

    // Sensors & Binary Sensors
    case 'binary_sensor':
    case 'sensor':
      return 'cyan';

    // Person & Presence
    case 'person':
    case 'device_tracker':
      return 'purple';

    // Weather
    case 'weather':
      return 'orange';

    // Vacuum
    case 'vacuum':
      return 'deep-purple';

    // Timer & Schedule
    case 'timer':
    case 'schedule':
      return 'pink';

    // Default for unknown domains
    default:
      return 'amber';
  }
};

const isEntityActive = (state: State) =>
  ['on', 'true'].includes(state.state?.toLowerCase()) ||
  Number(state.state) > 0;

/**
 * Generates styles for entity icons based on their state
 *
 * @param {State} [state] - Current entity state
 * @returns {Object} Style maps for icon, container, and text
 */
export const getEntityIconStyles = (
  state: State,
): DirectiveResult<typeof StyleMapDirective> | typeof nothing => {
  const domain = state?.entity_id.split('.')[0];
  const isActive = isEntityActive(state);
  const onColor = state?.attributes?.on_color || activeColorFromDomain(domain);
  const offColor = state?.attributes?.off_color;
  const iconColor = isActive ? onColor : offColor;

  return iconColor
    ? styleMap({
        '--icon-color': translateColorToRgb(iconColor, 1),
        '--background-color': translateColorToRgb(iconColor, 0.2),
      })
    : nothing;
};
