import type { Device, Entity, HomeAssistant, State } from '@type/homeassistant';
import {
  getHassDevice,
  getHassDeviceIfZWave,
  getZWaveByArea,
  getZWaveControllers,
  getZWaveNonHubs,
  processDeviceEntitiesAndCheckIfController,
} from '@util/hass';
import { expect } from 'chai';
import { describe, it } from 'mocha';

describe('util', () => {
  describe('hass.ts', () => {
    describe('internal methods', () => {
      // Note: We can't directly test private methods (_isZWaveDevice, _transformDeviceFields, etc.)
      // so we'll test them through the public API

      describe('transformation functions', () => {
        it('should transform device fields correctly through getHassDevice', () => {
          const mockDevice: Device = {
            id: 'test-device',
            name: 'Test Device',
            name_by_user: 'Custom Name',
            manufacturer: 'Test Manufacturer',
            model: 'Test Model',
          };

          const mockHass: HomeAssistant = {
            devices: { 'test-device': mockDevice },
            entities: {},
            states: {},
          };

          const result = getHassDevice(mockHass, 'test-device');

          expect(result).to.deep.equal({
            id: 'test-device',
            name: 'Custom Name', // Should use name_by_user
            device_name: 'Test Device',
            manufacturer: 'Test Manufacturer',
            model: 'Test Model',
          });
        });

        it('should use device name when name_by_user is not available', () => {
          const mockDevice: Device = {
            id: 'test-device',
            name: 'Test Device',
            manufacturer: 'Test Manufacturer',
            model: 'Test Model',
          };

          const mockHass: HomeAssistant = {
            devices: { 'test-device': mockDevice },
            entities: {},
            states: {},
          };

          const result = getHassDevice(mockHass, 'test-device');

          expect(result?.name).to.equal('Test Device');
        });
      });
    });

    describe('processDeviceEntitiesAndCheckIfController', () => {
      // Mock data setup
      const mockState: State = {
        entity_id: 'sensor.living_room',
        state: 'on',
        domain: 'sensor',
        attributes: {
          friendly_name: 'Device Name Living Room',
        },
      };

      const mockEntity: Entity = {
        entity_id: 'sensor.living_room',
        device_id: 'device_123',
      };

      it('should return false for non-controller devices', () => {
        const mockHass: HomeAssistant = {
          entities: {
            'sensor.living_room': mockEntity,
          },
          states: {
            'sensor.living_room': mockState,
          },
          devices: {
            device_123: {
              id: 'device_123',
              name: 'Device Name',
            },
          },
        };

        let callCount = 0;
        const isController = processDeviceEntitiesAndCheckIfController(
          mockHass,
          'device_123',
          () => {
            callCount++;
          },
        );

        expect(isController).to.be.false;
        expect(callCount).to.equal(1);
      });

      it('should return true for controller devices', () => {
        const mockHass: HomeAssistant = {
          entities: {
            'sensor.living_room': mockEntity,
            'sensor.controller': {
              entity_id: 'sensor.controller',
              device_id: 'device_123',
              translation_key: 'controller_status',
            },
          },
          states: {
            'sensor.living_room': mockState,
            'sensor.controller': {
              entity_id: 'sensor.controller',
              state: 'ready',
              domain: 'sensor',
              attributes: {},
            },
          },
          devices: {
            device_123: {
              id: 'device_123',
              name: 'Device Name',
            },
          },
        };

        let callCount = 0;
        const isController = processDeviceEntitiesAndCheckIfController(
          mockHass,
          'device_123',
          () => {
            callCount++;
          },
        );

        expect(isController).to.be.true;
        expect(callCount).to.equal(2);
      });

      it('should clean up friendly names by removing device name', () => {
        const mockHass: HomeAssistant = {
          entities: {
            'sensor.living_room': mockEntity,
          },
          states: {
            'sensor.living_room': {
              entity_id: 'sensor.living_room',
              state: 'on',
              domain: 'sensor',
              attributes: {
                friendly_name: 'Test Device Living Room',
              },
            },
          },
          devices: {
            device_123: {
              id: 'device_123',
              name: 'Test Device',
            },
          },
        };

        let capturedState: State | null = null;
        processDeviceEntitiesAndCheckIfController(
          mockHass,
          'device_123',
          (_, state) => {
            capturedState = state;
          },
        );

        expect(capturedState).to.not.be.null;
        // Should have cleaned up the friendly name by removing the device name
        expect((capturedState as any)?.attributes.friendly_name).to.equal(
          ' Living Room',
        );
      });

      it('should add domain to the state object', () => {
        const mockHass: HomeAssistant = {
          entities: {
            'sensor.living_room': mockEntity,
          },
          states: {
            'sensor.living_room': mockState,
          },
          devices: {
            device_123: {
              id: 'device_123',
              name: 'Device Name',
            },
          },
        };

        let capturedState: State | null = null;
        processDeviceEntitiesAndCheckIfController(
          mockHass,
          'device_123',
          (_, state) => {
            capturedState = state;
          },
        );

        expect(capturedState).to.not.be.null;
        expect((capturedState as any)?.domain).to.equal('sensor');
      });
    });

    describe('getHassDevice', () => {
      it('should return device with standardized fields', () => {
        const mockHass: HomeAssistant = {
          devices: {
            device_123: {
              id: 'device_123',
              name: 'Device Name',
              manufacturer: 'Test Manufacturer',
              model: 'Test Model',
            },
          },
          entities: {},
          states: {},
        };

        const result = getHassDevice(mockHass, 'device_123');

        expect(result).to.deep.equal({
          id: 'device_123',
          name: 'Device Name',
          device_name: 'Device Name',
          manufacturer: 'Test Manufacturer',
          model: 'Test Model',
        });
      });

      it('should return undefined for non-existent device', () => {
        const mockHass: HomeAssistant = {
          devices: {},
          entities: {},
          states: {},
        };

        const result = getHassDevice(mockHass, 'device_123');

        expect(result).to.be.undefined;
      });
    });

    describe('getHassDeviceIfZWave', () => {
      it('should return device if it is a Z-Wave device', () => {
        const mockHass: HomeAssistant = {
          devices: {
            device_123: {
              id: 'device_123',
              name: 'Z-Wave Device',
              identifiers: [['zwave_js', '1234']],
            },
          },
          entities: {},
          states: {},
        };

        const result = getHassDeviceIfZWave(mockHass, 'device_123');

        expect(result).to.deep.equal({
          id: 'device_123',
          name: 'Z-Wave Device',
          device_name: 'Z-Wave Device',
          manufacturer: undefined,
          model: undefined,
        });
      });

      it('should return undefined for non-Z-Wave device', () => {
        const mockHass: HomeAssistant = {
          devices: {
            device_123: {
              id: 'device_123',
              name: 'Non Z-Wave Device',
              identifiers: [['zigbee', '1234']],
            },
          },
          entities: {},
          states: {},
        };

        const result = getHassDeviceIfZWave(mockHass, 'device_123');

        expect(result).to.be.undefined;
      });

      it('should return undefined for non-existent device', () => {
        const mockHass: HomeAssistant = {
          devices: {},
          entities: {},
          states: {},
        };

        const result = getHassDeviceIfZWave(mockHass, 'device_123');

        expect(result).to.be.undefined;
      });
    });

    describe('getZWaveControllers', () => {
      let mockHass: HomeAssistant;

      beforeEach(() => {
        // Setup mock HomeAssistant object with various devices
        mockHass = {
          states: {},
          entities: {
            'sensor.controller_status': {
              entity_id: 'sensor.controller_status',
              device_id: 'zwave-hub-1',
              translation_key: 'controller_status',
            },
            'sensor.other_controller_status': {
              entity_id: 'sensor.other_controller_status',
              device_id: 'zwave-hub-2',
              translation_key: 'controller_status',
            },
          },
          devices: {
            'zwave-hub-1': {
              id: 'zwave-hub-1',
              identifiers: [['zwave_js', '']],
              model: 'ZST10',
              name: 'Z-Wave Hub',
              labels: ['hub', 'controller'],
            },
            'zwave-hub-2': {
              id: 'zwave-hub-2',
              identifiers: [['zwave_js', '']],
              model: 'ZST11',
              name: 'Z-Wave Hub Pro',
              labels: ['hub', 'premium'],
            },
            'zwave-switch-1': {
              id: 'zwave-switch-1',
              identifiers: [['zwave_js', '']],
              model: 'ZEN26',
              name: 'Z-Wave Switch',
              labels: ['switch', 'lighting'],
            },
            'philips-hub-1': {
              id: 'philips-hub-1',
              manufacturer: 'Philips',
              model: 'Hue Bridge',
              name: 'Philips Hue Bridge',
              labels: ['hub', 'lighting'],
            },
          },
        };
      });

      it('should return only Z-Wave controller devices', () => {
        const result = getZWaveControllers(mockHass);

        // First controller should be found, but stops after that due to short-circuiting
        expect(result.length).to.equal(1);
        expect(result[0]!.id).to.equal('zwave-hub-1');
        expect(result[0]!.name).to.equal('Z-Wave Hub');
        expect(result[0]!.model).to.equal('ZST10');
      });

      it('should return empty array when no Z-Wave hub devices exist', () => {
        const noZWaveHubsHass: HomeAssistant = {
          states: {},
          entities: {},
          devices: {
            'zwave-switch-1': {
              id: 'zwave-switch-1',
              identifiers: [['zwave_js', '']],
              model: 'ZEN26',
              name: 'Z-Wave Switch',
              labels: ['switch'],
            },
            'philips-hub-1': {
              id: 'philips-hub-1',
              manufacturer: 'Philips',
              model: 'Hue Bridge',
              name: 'Philips Hue Bridge',
              labels: ['hub'],
            },
          },
        };

        const result = getZWaveControllers(noZWaveHubsHass);
        expect(result).to.deep.equal([]);
      });
    });

    describe('getZWaveNonHubs', () => {
      let mockHass: HomeAssistant;

      beforeEach(() => {
        // Setup mock HomeAssistant object with various devices
        mockHass = {
          states: {},
          entities: {
            'sensor.controller_status': {
              entity_id: 'sensor.controller_status',
              device_id: 'zwave-hub-1',
              translation_key: 'controller_status',
            },
          },
          devices: {
            'zwave-hub-1': {
              id: 'zwave-hub-1',
              identifiers: [['zwave_js', '']],
              model: 'ZST10',
              name: 'Z-Wave Hub',
              labels: ['hub', 'controller'],
            },
            'zwave-switch-1': {
              id: 'zwave-switch-1',
              identifiers: [['zwave_js', '']],
              model: 'ZEN26',
              name: 'Z-Wave Switch',
              labels: ['switch', 'lighting'],
            },
            'zwave-dimmer-1': {
              id: 'zwave-dimmer-1',
              identifiers: [['zwave_js', '']],
              model: 'ZEN72',
              name: 'Z-Wave Dimmer',
              labels: ['dimmer', 'lighting'],
            },
            'zwave-sensor-1': {
              id: 'zwave-sensor-1',
              identifiers: [['zwave_js', '']],
              model: 'ZSE11',
              name: 'Z-Wave Sensor',
            },
            'ge-switch-1': {
              id: 'ge-switch-1',
              manufacturer: 'GE',
              model: 'Switch',
              name: 'GE Switch',
            },
          },
        };
      });

      it('should return only Z-Wave non-hub devices', () => {
        const result = getZWaveNonHubs(mockHass);

        expect(result.length).to.equal(3);

        const ids = result.map((d) => d.id);
        expect(ids).to.include('zwave-switch-1');
        expect(ids).to.include('zwave-dimmer-1');
        expect(ids).to.include('zwave-sensor-1');

        // Verify it does not include the hub or non-zwave devices
        expect(ids).to.not.include('zwave-hub-1');
        expect(ids).to.not.include('ge-switch-1');
      });

      it('should return empty array when no Z-Wave non-hub devices exist', () => {
        const onlyZWaveHubsHass: HomeAssistant = {
          states: {},
          entities: {
            'sensor.controller_status': {
              entity_id: 'sensor.controller_status',
              device_id: 'zwave-hub-1',
              translation_key: 'controller_status',
            },
          },
          devices: {
            'zwave-hub-1': {
              id: 'zwave-hub-1',
              identifiers: [['zwave_js', '']],
              model: 'ZST10',
              name: 'Z-Wave Hub',
              labels: ['hub'],
            },
            'philips-device-1': {
              id: 'philips-device-1',
              manufacturer: 'Philips',
              model: 'Light',
              name: 'Philips Light',
            },
          },
        };

        const result = getZWaveNonHubs(onlyZWaveHubsHass);
        expect(result).to.deep.equal([]);
      });

      it('should handle devices with undefined labels', () => {
        mockHass.devices['zwave-unlabeled-1'] = {
          id: 'zwave-unlabeled-1',
          identifiers: [['zwave_js', '']],
          model: 'Unknown',
          name: 'Unlabeled Z-Wave Device',
          labels: undefined,
        };

        const result = getZWaveNonHubs(mockHass);
        expect(result.length).to.equal(4);
        expect(result.some((d) => d.id === 'zwave-unlabeled-1')).to.be.true;
      });
    });

    describe('getZWaveByArea', () => {
      let mockHass: HomeAssistant;

      beforeEach(() => {
        mockHass = {
          states: {},
          entities: {},
          devices: {
            'zwave-device-1': {
              id: 'zwave-device-1',
              identifiers: [['zwave_js', '']],
              name: 'Device 1',
              area_id: 'living_room',
            },
            'zwave-device-2': {
              id: 'zwave-device-2',
              identifiers: [['zwave_js', '']],
              name: 'Device 2',
              area_id: 'kitchen',
            },
            'zwave-device-3': {
              id: 'zwave-device-3',
              identifiers: [['zwave_js', '']],
              name: 'Device 3',
              area_id: 'living_room',
            },
            'non-zwave-device': {
              id: 'non-zwave-device',
              name: 'Non Z-Wave Device',
              area_id: 'living_room',
            },
          },
        };
      });

      it('should return Z-Wave devices in the specified area', () => {
        const result = getZWaveByArea(mockHass, 'living_room');

        expect(result.length).to.equal(2);

        const ids = result.map((d) => d.id);
        expect(ids).to.include('zwave-device-1');
        expect(ids).to.include('zwave-device-3');

        // Verify it does not include devices from other areas or non-zwave devices
        expect(ids).to.not.include('zwave-device-2');
        expect(ids).to.not.include('non-zwave-device');
      });

      it('should return all Z-Wave devices when no area is specified', () => {
        const result = getZWaveByArea(mockHass);

        expect(result.length).to.equal(3); // All Z-Wave devices

        const ids = result.map((d) => d.id);
        expect(ids).to.include('zwave-device-1');
        expect(ids).to.include('zwave-device-2');
        expect(ids).to.include('zwave-device-3');

        // Verify it does not include non-zwave devices
        expect(ids).to.not.include('non-zwave-device');
      });

      it('should return empty array when no Z-Wave devices exist in the area', () => {
        const result = getZWaveByArea(mockHass, 'bathroom');
        expect(result).to.deep.equal([]);
      });

      it('should transform devices to ZWaveDevice format', () => {
        mockHass.devices['zwave-device-1'] = {
          id: 'zwave-device-1',
          identifiers: [['zwave_js', '']],
          name: 'Original Name',
          name_by_user: 'Custom Name',
          manufacturer: 'Test Manufacturer',
          model: 'Test Model',
          area_id: 'living_room',
        };

        const result = getZWaveByArea(mockHass, 'living_room');

        expect(result.find((d) => d.id === 'zwave-device-1')).to.deep.include({
          id: 'zwave-device-1',
          name: 'Custom Name',
          device_name: 'Original Name',
          manufacturer: 'Test Manufacturer',
          model: 'Test Model',
        });
      });
    });
  });
});
