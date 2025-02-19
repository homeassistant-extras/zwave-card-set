import type { Entity, HomeAssistant, State } from '@type/homeassistant';

/**
 * Processes entities from the hass object, filtering by device ID and applying a callback.
 *
 * @param {HomeAssistant} hass - The Home Assistant object containing entities and states.
 * @param {string} device_id - The device ID to filter entities.
 * @param {Function} callback - The function to execute on each matching entity.
 */
export const processDeviceEntities = (
  hass: HomeAssistant,
  device_id: string,
  callback: (entity: Entity, state: State) => void,
) => {
  Object.values(hass.entities).forEach((entity) => {
    if (entity.device_id !== device_id) return;
    callback(entity, hass.states[entity.entity_id]!);
  });
};
