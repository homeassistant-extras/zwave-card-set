import {
  actionHandler,
  handleClickAction,
  moreInfoAction,
} from '@delegates/action-handler-delegate';
import type { Config, Sensor } from '@node/types';
import type { HomeAssistant } from '@type/homeassistant';
import { html } from 'lit';
import { stateIcon } from '../state-icon';

/**
 * Renders a firmware information card for a Z-Wave sensor.
 *
 * This function generates an HTML template that displays firmware-related
 * information for a given sensor. It includes a battery indicator if the
 * sensor has a battery state, or an icon if not. Additionally, it displays
 * the sensor's name, model, and manufacturer, with click actions for more
 * information.
 *
 * @param element - The HTML element where the firmware card will be rendered.
 * @param hass - The Home Assistant object providing context and state.
 * @param config - The configuration object for the firmware card.
 * @param sensor - The sensor object containing firmware and battery state information.
 * @returns An HTML template for the firmware card.
 */
export const firmware = (
  element: HTMLElement,
  hass: HomeAssistant,
  config: Config,
  sensor: Sensor,
) => {
  const action = sensor.firmwareState
    ? handleClickAction(element, moreInfoAction(sensor.firmwareState.entity_id))
    : undefined;
  const handler = sensor.firmwareState
    ? actionHandler(moreInfoAction(sensor.firmwareState.entity_id))
    : undefined;

  return html`<div class="firmware">
    ${sensor.batteryState
      ? html`<battery-indicator
          .level=${Number(sensor.batteryState.state)}
          @action=${handleClickAction(
            element,
            moreInfoAction(sensor.batteryState!.entity_id),
          )}
          .actionHandler=${actionHandler(
            moreInfoAction(sensor.batteryState!.entity_id),
          )}
        ></battery-indicator>`
      : stateIcon(
          element,
          hass,
          sensor.firmwareState,
          undefined,
          config.icon ?? 'mdi:z-wave',
        )}
    <div class="firmware-info" @action=${action} .actionHandler=${handler}>
      <span class="title ellipsis">${config.title ?? sensor.name}</span>
      <span class="status-label ellipsis"
        >${sensor.model} by ${sensor.manufacturer}</span
      >
    </div>
  </div>`;
};
