import type { Entity, HomeAssistant, State } from '@type/homeassistant';
import { processDeviceEntities } from '@util/hass';
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
});
