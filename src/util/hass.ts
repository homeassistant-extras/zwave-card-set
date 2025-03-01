import type { Device, Entity, HomeAssistant, State } from '@type/homeassistant';
import type { ZWaveDevice } from '@type/zwave';

const _transformDeviceFields = (device: Device): ZWaveDevice => {
  return {
    id: device.id,
    manufacturer: device.manufacturer,
    name: device.name_by_user || device.name,
    device_name: device.name,
    model: device.model,
  };
};

/**
 * Processes entities from the hass object, filtering by device ID and applying a callback.
 *
 * @param {HomeAssistant} hass - The Home Assistant object containing entities and states.
 * @param {string} device_id - The device ID to filter entities.
 * @param {string[]} domains - The list of domains to filter entities.
 * @param {Function} callback - The function to execute on each matching entity.
 * @returns {boolean} True if the device is a controller, false otherwise.
 */
const _processDeviceEntities = (
  hass: HomeAssistant,
  device_id: string,
  callback: (entity: Entity, state: State) => void,
): boolean => {
  const entities = Object.values(hass.entities);
  let isController = false;

  entities.forEach((entity) => {
    if (entity.device_id !== device_id) return;
    isController =
      isController || entity.translation_key === 'controller_status';

    if (entity.hidden) return;

    // if here we have matching entities
    const state = hass.states[entity.entity_id]!;
    if (!state) return;

    const device = getHassDevice(hass, device_id);
    callback(
      {
        entity_id: entity.entity_id,
        device_id: entity.device_id,
        entity_category: entity.entity_category,
        translation_key: entity.translation_key,
      },
      {
        state: state.state,
        entity_id: state.entity_id,
        domain: state.entity_id.split('.')[0]!,
        attributes: {
          ...state.attributes,
          // a convenienct to clean up the friendly name
          friendly_name: state.attributes?.friendly_name.replace(
            device?.name || '',
            '',
          ),
        },
      },
    );
  });

  return isController;
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
 * const allZWaveDeviceInfos = getZWaveDeviceInfos(hass);
 *
 * @example
 * // Get only Z-Wave hub devices
 * const zWaveHubs = getZWaveDeviceInfos(hass, true);
 *
 * @example
 * // Get only Z-Wave non-hub devices
 * const zWaveNonHubs = getZWaveDeviceInfos(hass, false, true);
 *
 * @example
 * // Get Z-Wave devices by model
 * const zen55Devices = getZWaveDeviceInfos(hass, false, false, 'ZEN55 LR');
 */
const _getZWaveHassDevices = (
  hass: HomeAssistant,
  hubOnly: Boolean = false,
  noHubs: Boolean = false,
  area?: string,
): ZWaveDevice[] => {
  let devices = Object.values(hass.devices).filter((device) => {
    return _isZWaveDevice(device);
  });

  // some short circuiting assuming a single controller
  let controllerFound = false;

  if (hubOnly) {
    devices = devices.filter((device) => {
      if (controllerFound) return false;
      controllerFound = _isZWaveController(hass, device);
      return controllerFound;
    });
  } else if (noHubs) {
    devices = devices.filter((device) => {
      if (controllerFound) return true;
      controllerFound = _isZWaveController(hass, device);
      return !controllerFound;
    });
  } else if (area) {
    devices = devices.filter((device) => device.area_id === area);
  }

  return devices.map((device) => _transformDeviceFields(device));
};

/**
 * Checks if a device is a Z-Wave controller
 * @param hass - The Home Assistant object containing entities and states.
 * @param device - The device to check
 * @returns {boolean} True if the device is a Z-Wave controller
 */
const _isZWaveController = (hass: HomeAssistant, device: Device): boolean =>
  Object.values(hass.entities).some(
    (entity) =>
      entity.device_id === device.id &&
      entity.translation_key === 'controller_status',
  );

/**
 * Checks if a device is a Z-Wave device
 * @param device - The device to check
 * @returns {boolean} True if the device is a Z-Wave device
 */
const _isZWaveDevice = (device: Device | undefined): boolean => {
  if (!device || !device.identifiers) {
    return false;
  }
  for (const parts of device.identifiers) {
    for (const part of parts) {
      if (part === 'zwave_js') {
        return true;
      }
    }
  }
  return false;
};

/**
 * Processes entities from the hass object, filtering by device ID and applying a callback.
 *
 * @param {HomeAssistant} hass - The Home Assistant object containing entities and states.
 * @param {string} device_id - The device ID to filter entities.
 * @param {string[]} domains - The list of domains to filter entities.
 * @param {Function} callback - The function to execute on each matching entity.
 * @returns {boolean} True if the device is a controller, false otherwise.
 */
export const processDeviceEntitiesAndCheckIfController = (
  hass: HomeAssistant,
  device_id: string,
  callback: (entity: Entity, state: State) => void,
): boolean => _processDeviceEntities(hass, device_id, callback);

/**
 * Gets all Z-Wave hub devices from the Home Assistant object.
 * A hub device is defined as any Z-Wave device that has the 'hub' label.
 *
 * @param {HomeAssistant} hass - The Home Assistant object containing devices, entities, and states.
 * @returns {Device[]} An array of Z-Wave hub devices.
 *
 * @example
 * const zWaveHubs = getZWaveHubs(hass);
 */
export const getZWaveControllers = (hass: HomeAssistant): ZWaveDevice[] =>
  _getZWaveHassDevices(hass, true);

/**
 * Gets all Z-Wave non-hub devices from the Home Assistant object.
 * A non-hub device is defined as any Z-Wave device that does not have the 'hub' label.
 *
 * @param {HomeAssistant} hass - The Home Assistant object containing devices, entities, and states.
 * @returns {Device[]} An array of Z-Wave non-hub devices (switches, dimmers, sensors, etc.).
 *
 * @example
 * const zWaveDevices = getZWaveNonHubs(hass);
 */
export const getZWaveNonHubs = (hass: HomeAssistant): ZWaveDevice[] =>
  _getZWaveHassDevices(hass, false, true);

export const getZWaveByArea = (
  hass: HomeAssistant,
  area?: string,
): ZWaveDevice[] => _getZWaveHassDevices(hass, false, false, area);

export const getHassDeviceIfZWave = (
  hass: HomeAssistant,
  device_id: string,
): ZWaveDevice | undefined => {
  const device = hass.devices[device_id];
  if (!device) return undefined;
  if (!_isZWaveDevice(device)) return undefined;
  return _transformDeviceFields(device);
};

export const getHassDevice = (
  hass: HomeAssistant,
  device_id: string,
): ZWaveDevice | undefined => {
  const device = hass.devices[device_id];
  if (!device) return undefined;
  return _transformDeviceFields(device);
};
