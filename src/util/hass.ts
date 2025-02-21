import type { Device, Entity, HomeAssistant, State } from '@type/homeassistant';

/**
 * Processes entities from the hass object, filtering by device ID and applying a callback.
 *
 * @param {HomeAssistant} hass - The Home Assistant object containing entities and states.
 * @param {string} device_id - The device ID to filter entities.
 * @param {string[]} domains - The list of domains to filter entities.
 * @param {Function} callback - The function to execute on each matching entity.
 */
export const processDeviceEntities = (
  hass: HomeAssistant,
  device_id: string,
  domains: string[],
  callback: (entity: Entity, state: State) => void,
): void => {
  Object.values(hass.entities).forEach((entity) => {
    if (!domains.includes(entity.entity_id.split('.')[0]!)) return;
    if (entity.device_id !== device_id) return;
    const state = hass.states[entity.entity_id]!;
    if (!state) return;
    callback(entity, {
      state: state.state,
      entity_id: state.entity_id,
      attributes: state.attributes,
    });
  });
};

/**
 * Gets Zooz devices from the Home Assistant object with optional filtering.
 *
 * @param {HomeAssistant} hass - The Home Assistant object containing devices, entities, and states.
 * @param {Boolean} hubOnly - When true, returns only Zooz hub devices (devices with 'hub' label).
 * @param {Boolean} noHubs - When true, returns only Zooz non-hub devices (devices without 'hub' label).
 * @param {string} [model] - Optional model name to filter devices by specific model.
 *                           Note: If both hubOnly and noHubs are true, hubOnly takes precedence.
 * @returns {Device[]} An array of Device objects that match the specified criteria.
 *
 * @example
 * // Get all Zooz devices
 * const allZoozDevices = getZoozDevices(hass);
 *
 * @example
 * // Get only Zooz hub devices
 * const zoozHubs = getZoozDevices(hass, true);
 *
 * @example
 * // Get only Zooz non-hub devices
 * const zoozNonHubs = getZoozDevices(hass, false, true);
 *
 * @example
 * // Get Zooz devices by model
 * const zen55Devices = getZoozDevices(hass, false, false, 'ZEN55 LR');
 */
export const getZoozDevices = (
  hass: HomeAssistant,
  hubOnly: Boolean = false,
  noHubs: Boolean = false,
  model?: string,
): Device[] => {
  let devices = Object.values(hass.devices).filter((device) => {
    return device.manufacturer === 'Zooz';
  });

  if (hubOnly) {
    devices = devices.filter((device) => device.labels?.includes('hub'));
  } else if (noHubs) {
    devices = devices.filter((device) => !device.labels?.includes('hub'));
  } else if (model) {
    devices = devices.filter((device) => device.model === model);
  }

  return devices.map((device) => {
    return {
      id: device.id,
      model: device.model,
      name: device.name,
      labels: device.labels,
      manufacturer: device.manufacturer,
      name_by_user: device.name_by_user,
    };
  });
};

/**
 * Gets all Zooz hub devices from the Home Assistant object.
 * A hub device is defined as any Zooz device that has the 'hub' label.
 *
 * @param {HomeAssistant} hass - The Home Assistant object containing devices, entities, and states.
 * @returns {Device[]} An array of Zooz hub devices.
 *
 * @example
 * const zoozHubs = getZoozHubs(hass);
 * console.log(`Found ${zoozHubs.length} Zooz hubs`);
 */
export const getZoozHubs = (hass: HomeAssistant): Device[] =>
  getZoozDevices(hass, true);

/**
 * Gets all Zooz non-hub devices from the Home Assistant object.
 * A non-hub device is defined as any Zooz device that does not have the 'hub' label.
 *
 * @param {HomeAssistant} hass - The Home Assistant object containing devices, entities, and states.
 * @returns {Device[]} An array of Zooz non-hub devices (switches, dimmers, sensors, etc.).
 *
 * @example
 * const zoozDevices = getZoozNonHubs(hass);
 * console.log(`Found ${zoozDevices.length} Zooz peripheral devices`);
 */
export const getZoozNonHubs = (hass: HomeAssistant): Device[] =>
  getZoozDevices(hass, false, true);

/**
 * Gets Zooz devices filtered by a specific model.
 *
 * @param {HomeAssistant} hass - The Home Assistant object containing devices.
 * @param {string} model - The model name to filter devices.
 * @returns {Device[]} An array of Zooz devices matching the specified model.
 *
 * @example
 * const zen55Devices = getZoozModels(hass, 'ZEN55 LR');
 * console.log(`Found ${zen55Devices.length} ZEN55 LR devices`);
 */
export const getZoozModels = (hass: HomeAssistant, model: string): Device[] =>
  getZoozDevices(hass, false, false, model);
