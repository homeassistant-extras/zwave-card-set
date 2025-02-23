import type { Entity, HomeAssistant, State } from '@type/homeassistant';
import { getZoozHubs, getZoozNonHubs, processDeviceEntities } from '@util/hass';
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

  describe('getZoozHubs', () => {
    let mockHass: HomeAssistant;

    beforeEach(() => {
      // Setup mock HomeAssistant object with various devices
      mockHass = {
        states: {},
        entities: {},
        devices: {
          'zooz-hub-1': {
            id: 'zooz-hub-1',
            manufacturer: 'Zooz',
            model: 'ZST10',
            name: 'Zooz Hub',
            labels: ['hub', 'controller'],
          },
          'zooz-hub-2': {
            id: 'zooz-hub-2',
            manufacturer: 'Zooz',
            model: 'ZST11',
            name: 'Zooz Hub Pro',
            labels: ['hub', 'premium'],
          },
          'zooz-switch-1': {
            id: 'zooz-switch-1',
            manufacturer: 'Zooz',
            model: 'ZEN26',
            name: 'Zooz Switch',
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

    it('should return only Zooz hub devices', () => {
      const result = getZoozHubs(mockHass);

      expect(result.length).to.equal(2);
      expect(result.map((d) => d.id)).to.have.members([
        'zooz-hub-1',
        'zooz-hub-2',
      ]);
      expect(result.every((d) => d.manufacturer === 'Zooz')).to.be.true;
      expect(result.every((d) => d.labels?.includes('hub'))).to.be.true;
    });

    it('should return empty array when no Zooz hub devices exist', () => {
      const noZoozHubsHass: HomeAssistant = {
        states: {},
        entities: {},
        devices: {
          'zooz-switch-1': {
            id: 'zooz-switch-1',
            manufacturer: 'Zooz',
            model: 'ZEN26',
            name: 'Zooz Switch',
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

      const result = getZoozHubs(noZoozHubsHass);
      expect(result).to.deep.equal([]);
    });
  });

  describe('getZoozNonHubs', () => {
    let mockHass: HomeAssistant;

    beforeEach(() => {
      // Setup mock HomeAssistant object with various devices
      mockHass = {
        states: {},
        entities: {},
        devices: {
          'zooz-hub-1': {
            id: 'zooz-hub-1',
            manufacturer: 'Zooz',
            model: 'ZST10',
            name: 'Zooz Hub',
            labels: ['hub', 'controller'],
          },
          'zooz-switch-1': {
            id: 'zooz-switch-1',
            manufacturer: 'Zooz',
            model: 'ZEN26',
            name: 'Zooz Switch',
            labels: ['switch', 'lighting'],
          },
          'zooz-dimmer-1': {
            id: 'zooz-dimmer-1',
            manufacturer: 'Zooz',
            model: 'ZEN72',
            name: 'Zooz Dimmer',
            labels: ['dimmer', 'lighting'],
          },
          'zooz-sensor-1': {
            id: 'zooz-sensor-1',
            manufacturer: 'Zooz',
            model: 'ZSE11',
            name: 'Zooz Sensor',
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

    it('should return only Zooz non-hub devices', () => {
      const result = getZoozNonHubs(mockHass);

      expect(result.length).to.equal(3);
      expect(result.map((d) => d.id)).to.have.members([
        'zooz-switch-1',
        'zooz-dimmer-1',
        'zooz-sensor-1',
      ]);
      expect(result.every((d) => d.manufacturer === 'Zooz')).to.be.true;
      expect(result.every((d) => !d.labels?.includes('hub'))).to.be.true;
    });

    it('should return empty array when no Zooz non-hub devices exist', () => {
      const onlyZoozHubsHass: HomeAssistant = {
        states: {},
        entities: {},
        devices: {
          'zooz-hub-1': {
            id: 'zooz-hub-1',
            manufacturer: 'Zooz',
            model: 'ZST10',
            name: 'Zooz Hub',
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

      const result = getZoozNonHubs(onlyZoozHubsHass);
      expect(result).to.deep.equal([]);
    });

    it('should handle devices with undefined labels', () => {
      mockHass.devices['zooz-unlabeled-1'] = {
        id: 'zooz-unlabeled-1',
        manufacturer: 'Zooz',
        model: 'Unknown',
        name: 'Unlabeled Zooz Device',
        labels: undefined,
      };

      const result = getZoozNonHubs(mockHass);
      expect(result.length).to.equal(4);
      expect(result.some((d) => d.id === 'zooz-unlabeled-1')).to.be.true;
    });
  });
});
