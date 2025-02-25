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
  Object.values(hass.entities)
    .filter((entity) => !entity.hidden)
    .forEach((entity) => {
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
 * Gets Z-Wave devices from the Home Assistant object with optional filtering.
 *
 * @param {HomeAssistant} hass - The Home Assistant object containing devices, entities, and states.
 * @param {Boolean} hubOnly - When true, returns only Z-Wave hub devices (devices with 'hub' label).
 * @param {Boolean} noHubs - When true, returns only Z-Wave non-hub devices (devices without 'hub' label).
 * @param {string} [model] - Optional model name to filter devices by specific model.
 *                           Note: If both hubOnly and noHubs are true, hubOnly takes precedence.
 * @returns {Device[]} An array of Device objects that match the specified criteria.
 *
 * @example
 * // Get all Z-Wave devices
 * const allZWaveDevices = getZWaveDevices(hass);
 *
 * @example
 * // Get only Z-Wave hub devices
 * const zWaveHubs = getZWaveDevices(hass, true);
 *
 * @example
 * // Get only Z-Wave non-hub devices
 * const zWaveNonHubs = getZWaveDevices(hass, false, true);
 *
 * @example
 * // Get Z-Wave devices by model
 * const zen55Devices = getZWaveDevices(hass, false, false, 'ZEN55 LR');
 */
const getZWaveDevices = (
  hass: HomeAssistant,
  hubOnly: Boolean = false,
  noHubs: Boolean = false,
  model?: string,
  area?: string,
): Device[] => {
  let devices = Object.values(hass.devices).filter((device) => {
    return device.manufacturer === 'ZWave';
  });

  if (hubOnly) {
    devices = devices.filter((device) => device.labels?.includes('hub'));
  } else if (noHubs) {
    devices = devices.filter((device) => !device.labels?.includes('hub'));
  } else if (model) {
    devices = devices.filter((device) => device.model === model);
  } else if (area) {
    devices = devices.filter((device) => device.area_id === area);
  }

  return devices.map((device) => {
    return {
      id: device.id,
      name: device.name,
      manufacturer: device.manufacturer,
      name_by_user: device.name_by_user,
      model: device.model,
      area_id: device.area_id,
      labels: device.labels,
    };
  });
};

/**
 * Gets all Z-Wave hub devices from the Home Assistant object.
 * A hub device is defined as any Z-Wave device that has the 'hub' label.
 *
 * @param {HomeAssistant} hass - The Home Assistant object containing devices, entities, and states.
 * @returns {Device[]} An array of Z-Wave hub devices.
 *
 * @example
 * const zWaveHubs = getZWaveHubs(hass);
 * console.log(`Found ${zWaveHubs.length} Z-Wave hubs`);
 */
export const getZWaveHubs = (hass: HomeAssistant): Device[] =>
  getZWaveDevices(hass, true);

/**
 * Gets all Z-Wave non-hub devices from the Home Assistant object.
 * A non-hub device is defined as any Z-Wave device that does not have the 'hub' label.
 *
 * @param {HomeAssistant} hass - The Home Assistant object containing devices, entities, and states.
 * @returns {Device[]} An array of Z-Wave non-hub devices (switches, dimmers, sensors, etc.).
 *
 * @example
 * const zWaveDevices = getZWaveNonHubs(hass);
 * console.log(`Found ${zWaveDevices.length} Z-Wave peripheral devices`);
 */
export const getZWaveNonHubs = (hass: HomeAssistant): Device[] =>
  getZWaveDevices(hass, false, true);

/**
 * Gets Z-Wave devices filtered by a specific model.
 *
 * @param {HomeAssistant} hass - The Home Assistant object containing devices.
 * @param {string} model - The model name to filter devices.
 * @returns {Device[]} An array of Z-Wave devices matching the specified model.
 *
 * @example
 * const zen55Devices = getZWaveModels(hass, 'ZEN55 LR');
 * console.log(`Found ${zen55Devices.length} ZEN55 LR devices`);
 */
export const getZWaveModels = (hass: HomeAssistant, model: string): Device[] =>
  getZWaveDevices(hass, false, false, model);

export const getZWaveByArea = (hass: HomeAssistant, area?: string): Device[] =>
  getZWaveDevices(hass, false, false, undefined, area);
