import type { Device, Entity, HomeAssistant, State } from '@type/homeassistant';
import type { ZWaveDevice } from '@type/zwave';

/**
 * Transforms a HomeAssistant Device object into a ZWaveDevice with standardized fields.
 * This normalizes properties like names and adds type safety.
 *
 * @param {Device} device - The HomeAssistant device object to transform
 * @returns {ZWaveDevice} A standardized ZWaveDevice object
 */
const _transformDeviceFields = (device: Device): ZWaveDevice => {
  return {
    id: device.id,
    manufacturer: device.manufacturer,
    name: device.name_by_user ?? device.name,
    device_name: device.name,
    model: device.model,
  };
};

/**
 * Processes entities from the hass object, filtering by device ID and applying a callback.
 * Enhanced to detect controller status and clean up friendly names.
 *
 * @param {HomeAssistant} hass - The Home Assistant object containing entities and states.
 * @param {string} device_id - The device ID to filter entities.
 * @param {Function} callback - The function to execute on each matching entity.
 * @returns {boolean} True if the device is a controller, false otherwise.
 * @private
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
          // a convenience to clean up the friendly name
          friendly_name: state.attributes?.friendly_name?.replace(
            device?.name ?? '',
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
 * Internal implementation with various filtering options.
 *
 * @param {HomeAssistant} hass - The Home Assistant object containing devices, entities, and states.
 * @param {Boolean} hubOnly - When true, returns only Z-Wave controller devices.
 * @param {Boolean} noHubs - When true, returns only Z-Wave non-controller devices.
 * @param {string} [area] - Optional area ID to filter devices by specific area.
 * @returns {ZWaveDevice[]} An array of ZWaveDevice objects that match the specified criteria.
 * @private
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
 * Checks if a device is a Z-Wave controller by examining entity translation keys.
 * A controller device will have an entity with translation_key of 'controller_status'.
 *
 * @param {HomeAssistant} hass - The Home Assistant object containing entities.
 * @param {Device} device - The device to check.
 * @returns {boolean} True if the device is a Z-Wave controller.
 * @private
 */
const _isZWaveController = (hass: HomeAssistant, device: Device): boolean =>
  Object.values(hass.entities).some(
    (entity) =>
      entity.device_id === device.id &&
      entity.translation_key === 'controller_status',
  );

/**
 * Checks if a device is a Z-Wave device by examining its identifiers.
 * A Z-Wave device will have 'zwave_js' in its identifiers array.
 *
 * @param {Device | undefined} device - The device to check.
 * @returns {boolean} True if the device is a Z-Wave device.
 * @private
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
 * Also checks if the device is a controller.
 *
 * @param {HomeAssistant} hass - The Home Assistant object containing entities and states.
 * @param {string} device_id - The device ID to filter entities.
 * @param {Function} callback - The function to execute on each matching entity.
 * @returns {boolean} True if the device is a controller, false otherwise.
 */
export const processDeviceEntitiesAndCheckIfController = (
  hass: HomeAssistant,
  device_id: string,
  callback: (entity: Entity, state: State) => void,
): boolean => _processDeviceEntities(hass, device_id, callback);

/**
 * Gets all Z-Wave controller devices from the Home Assistant object.
 * A controller is a special Z-Wave device that manages the Z-Wave network.
 *
 * @param {HomeAssistant} hass - The Home Assistant object containing devices, entities, and states.
 * @returns {ZWaveDevice[]} An array of Z-Wave controller devices.
 *
 * @example
 * const zWaveControllers = getZWaveControllers(hass);
 * console.log(`Found ${zWaveControllers.length} Z-Wave controllers`);
 */
export const getZWaveControllers = (hass: HomeAssistant): ZWaveDevice[] =>
  _getZWaveHassDevices(hass, true);

/**
 * Gets all Z-Wave non-controller devices from the Home Assistant object.
 * These are the regular Z-Wave devices like switches, sensors, etc.
 *
 * @param {HomeAssistant} hass - The Home Assistant object containing devices, entities, and states.
 * @returns {ZWaveDevice[]} An array of Z-Wave non-controller devices.
 *
 * @example
 * const zWaveDevices = getZWaveNonHubs(hass);
 * console.log(`Found ${zWaveDevices.length} Z-Wave devices`);
 */
export const getZWaveNonHubs = (hass: HomeAssistant): ZWaveDevice[] =>
  _getZWaveHassDevices(hass, false, true);

/**
 * Gets Z-Wave devices from the specified area.
 *
 * @param {HomeAssistant} hass - The Home Assistant object containing devices.
 * @param {string} area - Optional area ID to filter devices.
 * @returns {ZWaveDevice[]} An array of Z-Wave devices in the specified area.
 *
 * @example
 * const livingRoomDevices = getZWaveByArea(hass, 'living_room');
 * console.log(`Found ${livingRoomDevices.length} Z-Wave devices in the living room`);
 */
export const getZWaveByArea = (
  hass: HomeAssistant,
  area?: string,
): ZWaveDevice[] => _getZWaveHassDevices(hass, false, false, area);

/**
 * Gets a device by ID if it's a Z-Wave device, otherwise returns undefined.
 *
 * @param {HomeAssistant} hass - The Home Assistant object.
 * @param {string} device_id - The device ID to retrieve.
 * @returns {ZWaveDevice | undefined} The Z-Wave device if found and is a Z-Wave device, undefined otherwise.
 *
 * @example
 * const zwaveDevice = getHassDeviceIfZWave(hass, 'device_123');
 * if (zwaveDevice) {
 *   console.log(`Found Z-Wave device: ${zwaveDevice.name}`);
 * }
 */
export const getHassDeviceIfZWave = (
  hass: HomeAssistant,
  device_id: string,
): ZWaveDevice | undefined => {
  const device = hass.devices[device_id];
  if (!device) return undefined;
  if (!_isZWaveDevice(device)) return undefined;
  return _transformDeviceFields(device);
};

/**
 * Gets any device by ID, regardless of whether it's a Z-Wave device.
 * Returns the device with standardized fields.
 *
 * @param {HomeAssistant} hass - The Home Assistant object.
 * @param {string} device_id - The device ID to retrieve.
 * @returns {ZWaveDevice | undefined} The device with standardized fields if found, undefined otherwise.
 *
 * @example
 * const device = getHassDevice(hass, 'device_123');
 * if (device) {
 *   console.log(`Found device: ${device.name}`);
 * }
 */
export const getHassDevice = (
  hass: HomeAssistant,
  device_id: string,
): ZWaveDevice | undefined => {
  const device = hass.devices[device_id];
  if (!device) return undefined;
  return _transformDeviceFields(device);
};
