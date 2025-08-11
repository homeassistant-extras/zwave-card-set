import { fireEvent } from '@hass/common/dom/fire_event';
import type { ActionConfig } from '@hass/data/lovelace/config/action';
import { actionHandler as hassActionHandler } from '@hass/panels/lovelace/common/directives/action-handler-directive';
import type { ActionConfigParams } from '@hass/panels/lovelace/common/handle-action';
import type { Config } from '@node-states/types';
import type { ActionHandlerEvent } from '@type/action';
import type { HomeAssistant } from '@type/homeassistant';

export interface HassUpdateEvent {
  hass: HomeAssistant;
}

declare global {
  // eslint-disable-next-line
  interface HASSDomEvents {
    'hass-update': HassUpdateEvent;
    'hass-update-controller': HassUpdateEvent;
  }
}

/**
 * Processes an action configuration to add data.entity_id if it's a perform-action
 * with zwave_js.ping that doesn't have a data attribute.
 *
 * @param {ActionConfig | undefined} action - The action configuration to process
 * @param {string} entity_id - The entity ID to add to the data.entity_id array
 * @returns {ActionConfig | undefined} The processed action configuration
 */
const processAction = (
  action: ActionConfig | undefined,
  entity_id: string,
): ActionConfig | undefined => {
  if (!action) return action;

  // Check if it's a perform-action with zwave_js.ping
  if (
    action.action === 'perform-action' &&
    action.perform_action === 'zwave_js.ping' &&
    !action.data
  ) {
    return {
      ...action,
      data: {
        entity_id: [entity_id],
      },
    };
  }

  return action;
};

/**
 * Creates an action configuration that sets all interaction types to trigger the 'more-info' action
 * for a specified entity.
 *
 * @param {string} entity_id - The ID of the entity to associate with the action.
 * @param {Config} config - The configuration for the action.
 * @returns {ActionConfigParams} An object containing entity ID and action configurations for tap,
 *                               hold, and double tap interactions.
 *
 * @example
 * // Create more-info actions for a light entity
 */
export const userNodeStatusActions = (
  entity_id: string,
  config: Config,
): ActionConfigParams => {
  return {
    entity: entity_id,
    tap_action: processAction(config.tap_action, entity_id),
    hold_action: processAction(config.hold_action, entity_id),
    double_tap_action: processAction(config.double_tap_action, entity_id),
  };
};

/**
 * Creates an action handler for an entity with specified configuration.
 * This is the main export that should be used by consumers of this module.
 *
 * @param {ActionConfigParams} entity - The entity to create an action handler for
 * @returns {Directive} A directive configured with the entity's action options
 */
export const actionHandler = (entity: ActionConfigParams) => {
  return hassActionHandler({
    hasDoubleClick: entity?.double_tap_action?.action !== 'none',
    hasHold: entity?.hold_action?.action !== 'none',
  });
};

/**
 * Creates a click action handler for a given element and entity.
 * The handler processes click events and dispatches them as Home Assistant actions.
 *
 * @param {HTMLElement} element - The DOM element that will receive the action
 * @param {ActionConfigParams} entity - The entity information containing configuration and state
 * @returns {Object} An object with a handleEvent method that processes actions
 *
 * @example
 * ```typescript
 * // Usage in a component
 * const element = document.querySelector('.my-element');
 * const entityInfo = { config: { entity_id: 'light.living_room', ... } };
 * element.addEventListener('click', handleClickAction(element, entityInfo));
 * ```
 */
export const handleClickAction = (
  element: HTMLElement,
  entity: ActionConfigParams,
): { handleEvent: (ev: ActionHandlerEvent) => void } => {
  return {
    /**
     * Handles an action event by creating and dispatching a 'hass-action' custom event.
     *
     * @param {ActionHandlerEvent} ev - The action handler event to process
     */
    handleEvent: (ev: ActionHandlerEvent): void => {
      // Extract action from event detail
      const action = ev.detail?.action;
      if (!action) return;

      // @ts-ignore
      fireEvent(element, 'hass-action', {
        config: entity,
        action,
      });
    },
  };
};

/**
 * Creates an action configuration that sets all interaction types to trigger the 'more-info' action
 * for a specified entity.
 *
 * @param {string} entity_id - The ID of the entity to associate with the action.
 * @returns {ActionConfigParams} An object containing entity ID and action configurations for tap,
 *                               hold, and double tap interactions.
 *
 * @example
 * // Create more-info actions for a light entity
 * const lightActions = moreInfoAction('light.living_room');
 */
export const moreInfoAction = (entity_id: string): ActionConfigParams => {
  return {
    entity: entity_id,
    tap_action: { action: 'more-info' },
    hold_action: { action: 'more-info' },
    double_tap_action: { action: 'more-info' },
  };
};

/**
 * Creates an action configuration that sets tap action to 'toggle' and other interactions
 * to trigger the 'more-info' action for a specified entity.
 *
 * @param {string} entity_id - The ID of the entity to associate with the action.
 * @returns {ActionConfigParams} An object containing entity ID and action configurations where
 *                              tap triggers toggle, while hold and double tap show more info.
 *
 * @example
 * // Create toggle action for a light entity
 * const lightActions = toggleAction('light.living_room');
 */
export const toggleAction = (entity_id: string): ActionConfigParams => {
  return {
    entity: entity_id,
    tap_action: { action: 'toggle' },
    hold_action: { action: 'more-info' },
    double_tap_action: { action: 'more-info' },
  };
};
