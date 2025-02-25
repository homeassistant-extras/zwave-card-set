import type { Entity, HomeAssistant, State } from '@type/homeassistant';
import {
  getZWaveHubs,
  getZWaveNonHubs,
  processDeviceEntities,
} from '@util/hass';
import { expect } from 'chai';
import { describe, it } from 'mocha';

describe('util', () => {
  describe('hass.ts', () => {
    describe('processDeviceEntities', () => {
      // Mock data setup
      const mockState: State = {
        entity_id: 'sensor.living_room',
        state: 'on',
        attributes: {},
      };

      const mockEntity: Entity = {
        entity_id: 'sensor.living_room',
        device_id: 'device_123',
      };

      const mockHass: HomeAssistant = {
        entities: {
          'sensor.living_room': mockEntity,
          'light.living_room': {
            entity_id: 'light.living_room',
            device_id: 'device_123',
          },
          'sensor.bedroom': {
            entity_id: 'sensor.bedroom',
            device_id: 'different_device',
          },
        },
        states: {
          'sensor.living_room': mockState,
          'light.living_room': {
            entity_id: 'light.living_room',
            state: 'on',
            attributes: {},
          },
          'sensor.bedroom': {
            entity_id: 'sensor.bedroom',
            state: 'off',
            attributes: {},
          },
        },
        devices: {},
      };

      it('should call callback for matching device_id and domain', () => {
        let callCount = 0;
        let calledEntity: Entity | null = null;
        let calledState: State | null = null;

        processDeviceEntities(
          mockHass,
          'device_123',
          ['sensor'],
          (entity, state) => {
            callCount++;
            calledEntity = entity;
            calledState = state;
          },
        );

        expect(callCount).to.equal(1);
        expect(calledEntity).to.deep.equal(mockEntity);
        expect(calledState).to.deep.equal(mockState);
      });

      it('should not process hidden entities', () => {
        const mockHassWithHidden: HomeAssistant = {
          entities: {
            'sensor.living_room': {
              entity_id: 'sensor.living_room',
              device_id: 'device_123',
              hidden: true,
            },
            'sensor.kitchen': {
              entity_id: 'sensor.kitchen',
              device_id: 'device_123',
              hidden: false,
            },
          },
          states: {
            'sensor.living_room': {
              entity_id: 'sensor.living_room',
              state: 'on',
              attributes: {},
            },
            'sensor.kitchen': {
              entity_id: 'sensor.kitchen',
              state: 'off',
              attributes: {},
            },
          },
          devices: {},
        };

        let callCount = 0;
        const processedEntities: string[] = [];

        processDeviceEntities(
          mockHassWithHidden,
          'device_123',
          ['sensor'],
          (entity) => {
            callCount++;
            processedEntities.push(entity.entity_id);
          },
        );

        expect(callCount).to.equal(1);
        expect(processedEntities).to.not.include('sensor.living_room');
        expect(processedEntities).to.include('sensor.kitchen');
      });

      it('should not call callback for non-matching device_id', () => {
        let callCount = 0;

        processDeviceEntities(
          mockHass,
          'non_existent_device',
          ['sensor'],
          () => {
            callCount++;
          },
        );

        expect(callCount).to.equal(0);
      });

      it('should not call callback for non-matching domain', () => {
        let callCount = 0;

        processDeviceEntities(
          mockHass,
          'device_123',
          ['switch'], // Neither sensor nor light
          () => {
            callCount++;
          },
        );

        expect(callCount).to.equal(0);
      });

      it('should filter entities by multiple domains', () => {
        let callCount = 0;
        const processedEntities: string[] = [];

        processDeviceEntities(
          mockHass,
          'device_123',
          ['sensor', 'light'],
          (entity) => {
            callCount++;
            processedEntities.push(entity.entity_id);
          },
        );

        expect(callCount).to.equal(2);
        expect(processedEntities).to.include('sensor.living_room');
        expect(processedEntities).to.include('light.living_room');
      });

      it('should process multiple entities with same device_id and domain', () => {
        const mockHassMultiple: HomeAssistant = {
          entities: {
            'sensor.living_room': mockEntity,
            'sensor.living_room_2': {
              entity_id: 'sensor.living_room_2',
              device_id: 'device_123',
            },
          },
          states: {
            'sensor.living_room': mockState,
            'sensor.living_room_2': {
              entity_id: 'sensor.living_room_2',
              state: 'on',
              attributes: {},
            },
          },
          devices: {},
        };

        let callCount = 0;
        const processedEntities: string[] = [];

        processDeviceEntities(
          mockHassMultiple,
          'device_123',
          ['sensor'],
          (entity) => {
            callCount++;
            processedEntities.push(entity.entity_id);
          },
        );

        expect(callCount).to.equal(2);
        expect(processedEntities).to.include('sensor.living_room');
        expect(processedEntities).to.include('sensor.living_room_2');
      });

      it('should handle empty entities object', () => {
        const emptyHass: HomeAssistant = {
          entities: {},
          states: {},
          devices: {},
        };

        let callCount = 0;

        processDeviceEntities(emptyHass, 'device_123', ['sensor'], () => {
          callCount++;
        });

        expect(callCount).to.equal(0);
      });

      it('should handle undefined states gracefully', () => {
        const hassWithoutStates: HomeAssistant = {
          entities: {
            'sensor.living_room': mockEntity,
          },
          states: {},
          devices: {},
        };

        let callCount = 0;

        processDeviceEntities(
          hassWithoutStates,
          'device_123',
          ['sensor'],
          () => {
            callCount++;
          },
        );

        expect(callCount).to.equal(0); // Should skip entities with missing states
      });

      it('should handle empty domains array (no entities should match)', () => {
        let callCount = 0;

        processDeviceEntities(mockHass, 'device_123', [], () => {
          callCount++;
        });

        expect(callCount).to.equal(0);
      });

      it('should maintain type safety in callback parameters', () => {
        processDeviceEntities(
          mockHass,
          'device_123',
          ['sensor'],
          (entity, state) => {
            // TypeScript checks
            expect(entity.entity_id).to.be.a('string');
            expect(entity.device_id).to.be.a('string');
            expect(state.state).to.be.a('string');
            expect(state.attributes).to.be.an('object');
          },
        );
      });

      it('should handle invalid entity_id format gracefully', () => {
        const hassWithInvalidEntityId: HomeAssistant = {
          entities: {
            invalid_entity: {
              entity_id: 'invalid_entity', // No domain separator
              device_id: 'device_123',
            },
          },
          states: {
            invalid_entity: {
              entity_id: 'invalid_entity',
              state: 'unknown',
              attributes: {},
            },
          },
          devices: {},
        };

        let callCount = 0;

        // This should not throw an error
        expect(() => {
          processDeviceEntities(
            hassWithInvalidEntityId,
            'device_123',
            ['sensor'],
            () => {
              callCount++;
            },
          );
        }).to.not.throw();

        expect(callCount).to.equal(0);
      });
    });
  });

  describe('getZWaveHubs', () => {
    let mockHass: HomeAssistant;

    beforeEach(() => {
      // Setup mock HomeAssistant object with various devices
      mockHass = {
        states: {},
        entities: {},
        devices: {
          'zwave-hub-1': {
            id: 'zwave-hub-1',
            manufacturer: 'ZWave',
            model: 'ZST10',
            name: 'Z-Wave Hub',
            labels: ['hub', 'controller'],
          },
          'zwave-hub-2': {
            id: 'zwave-hub-2',
            manufacturer: 'ZWave',
            model: 'ZST11',
            name: 'Z-Wave Hub Pro',
            labels: ['hub', 'premium'],
          },
          'zwave-switch-1': {
            id: 'zwave-switch-1',
            manufacturer: 'ZWave',
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

    it('should return only Z-Wave hub devices', () => {
      const result = getZWaveHubs(mockHass);

      expect(result.length).to.equal(2);
      expect(result.map((d) => d.id)).to.have.members([
        'zwave-hub-1',
        'zwave-hub-2',
      ]);
      expect(result.every((d) => d.manufacturer === 'ZWave')).to.be.true;
      expect(result.every((d) => d.labels?.includes('hub'))).to.be.true;
    });

    it('should return empty array when no Z-Wave hub devices exist', () => {
      const noZWaveHubsHass: HomeAssistant = {
        states: {},
        entities: {},
        devices: {
          'zwave-switch-1': {
            id: 'zwave-switch-1',
            manufacturer: 'ZWave',
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

      const result = getZWaveHubs(noZWaveHubsHass);
      expect(result).to.deep.equal([]);
    });
  });

  describe('getZWaveNonHubs', () => {
    let mockHass: HomeAssistant;

    beforeEach(() => {
      // Setup mock HomeAssistant object with various devices
      mockHass = {
        states: {},
        entities: {},
        devices: {
          'zwave-hub-1': {
            id: 'zwave-hub-1',
            manufacturer: 'ZWave',
            model: 'ZST10',
            name: 'Z-Wave Hub',
            labels: ['hub', 'controller'],
          },
          'zwave-switch-1': {
            id: 'zwave-switch-1',
            manufacturer: 'ZWave',
            model: 'ZEN26',
            name: 'Z-Wave Switch',
            labels: ['switch', 'lighting'],
          },
          'zwave-dimmer-1': {
            id: 'zwave-dimmer-1',
            manufacturer: 'ZWave',
            model: 'ZEN72',
            name: 'Z-Wave Dimmer',
            labels: ['dimmer', 'lighting'],
          },
          'zwave-sensor-1': {
            id: 'zwave-sensor-1',
            manufacturer: 'ZWave',
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
      expect(result.map((d) => d.id)).to.have.members([
        'zwave-switch-1',
        'zwave-dimmer-1',
        'zwave-sensor-1',
      ]);
      expect(result.every((d) => d.manufacturer === 'ZWave')).to.be.true;
      expect(result.every((d) => !d.labels?.includes('hub'))).to.be.true;
    });

    it('should return empty array when no Z-Wave non-hub devices exist', () => {
      const onlyZWaveHubsHass: HomeAssistant = {
        states: {},
        entities: {},
        devices: {
          'zwave-hub-1': {
            id: 'zwave-hub-1',
            manufacturer: 'ZWave',
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
        manufacturer: 'ZWave',
        model: 'Unknown',
        name: 'Unlabeled Z-Wave Device',
        labels: undefined,
      };

      const result = getZWaveNonHubs(mockHass);
      expect(result.length).to.equal(4);
      expect(result.some((d) => d.id === 'zwave-unlabeled-1')).to.be.true;
    });
  });
});
