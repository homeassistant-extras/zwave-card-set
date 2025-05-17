import {
  actionHandler,
  handleClickAction,
  moreInfoAction,
  toggleAction,
} from '@common/action-handler';
import type { HomeAssistant, State } from '@type/homeassistant';
import { getEntityIconStyles } from '@util/styles';
import { html, type TemplateResult } from 'lit';

/**
 * Renders an icon with state
 * @param element - The element to attach the action to
 * @param hass - The Home Assistant instance
 * @param state - The state object
 * @param className - Additional CSS class
 * @param icon - Override icon
 */
export const stateIcon = (
  element: HTMLElement,
  hass: HomeAssistant,
  state: State | undefined,
  className: string | undefined = undefined,
  icon: string | undefined = undefined,
): TemplateResult => {
  const classes = ['icon', className].filter((c) => c !== undefined).join(' ');
  if (!state) {
    return html`<div class="${classes}" />`;
  }

  const params = ['switch', 'light'].includes(state.domain)
    ? toggleAction(state.entity_id)
    : moreInfoAction(state.entity_id);
  const styles = getEntityIconStyles(state);

  return html`<div
    style="${styles}"
    class="${classes}"
    @action=${handleClickAction(element, params)}
    .actionHandler=${actionHandler(params)}
  >
    <ha-state-icon
      .hass=${hass}
      .stateObj=${state}
      .icon="${icon}"
    ></ha-state-icon>
  </div>`;
};
