import {
  actionHandler,
  handleClickAction,
  moreInfoAction,
} from '@common/action-handler';
import type { HomeAssistant, State } from '@type/homeassistant';
import { html, nothing, type TemplateResult } from 'lit';

export const renderError = (error: string) =>
  html`<ha-alert alert-type="error">${error}</ha-alert>`;

/**
 * Renders a state display section
 * @param state - The state object to display
 * @param divClasses - CSS classes for the container
 * @param spanClass - CSS class for the label
 * @param title - Display title
 */
export const renderStateDisplay = (
  element: HTMLElement,
  hass: HomeAssistant,
  state: State | undefined,
  divClasses: string[],
  spanClass: string,
  title?: string,
): TemplateResult | typeof nothing => {
  if (!state) {
    return nothing;
  }

  const entity = moreInfoAction(state.entity_id);

  return html`<div
    class="${divClasses.filter((c) => c !== undefined).join(' ')}"
    @action=${handleClickAction(element, entity)}
    .actionHandler=${actionHandler(entity)}
  >
    ${title ? html`<span class="${spanClass}">${title}</span>` : nothing}
    <state-display .hass=${hass} .stateObj=${state}></state-display>
  </div>`;
};

/**
 * Renders a chevron toggle button with consistent styling
 *
 * @param expanded - Whether the section is currently expanded
 * @param onClick - The click handler function
 * @param position - Optional positioning style ('default', 'bottom-right', 'inline')
 * @param label - Optional text label to show next to the chevron
 * @returns Template for rendering the chevron
 */
export const renderChevronToggle = (
  expanded: boolean,
  onClick: (e: Event) => void,
  position: 'default' | 'bottom-right' | 'inline' = 'default',
  label?: string,
): TemplateResult => {
  // Base class for all positions
  const baseClass = 'toggle-chevron';

  // Add position-specific class
  let positionClass = '';
  switch (position) {
    case 'bottom-right':
      positionClass = 'position-bottom-right';
      break;
    case 'inline':
      positionClass = 'position-inline';
      break;
    default:
      positionClass = 'position-default';
  }

  return html`
    <div class="${baseClass} ${positionClass}" @click="${onClick}">
      ${label ? html`<span class="toggle-label">${label}</span>` : ''}
      <ha-icon
        class="chevron-icon ${expanded ? 'expanded' : 'collapsed'}"
        icon="${expanded ? 'mdi:chevron-up' : 'mdi:chevron-down'}"
      ></ha-icon>
    </div>
  `;
};
