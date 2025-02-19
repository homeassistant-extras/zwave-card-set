import type { Entity, HomeAssistant, State } from '@type/homeassistant';
import { processDeviceEntities } from '@util/hass';
import { expect } from 'chai';
import { describe, it } from 'mocha';

describe('util', () => {
  describe('hass.ts', () => {
    describe('processDeviceEntities', () => {
      // Mock data setup
      const mockState: State = {
        entity_id: 'light.living_room',
        state: 'on',
        attributes: {},
      };

      const mockEntity: Entity = {
        entity_id: 'light.living_room',
        device_id: 'device_123',
      };

      const mockHass: HomeAssistant = {
        entities: {
          'light.living_room': mockEntity,
          'light.bedroom': {
            entity_id: 'light.bedroom',
            device_id: 'different_device',
          },
        },
        states: {
          'light.living_room': mockState,
          'light.bedroom': {
            entity_id: 'light.bedroom',
            state: 'off',
            attributes: {},
          },
        },
        devices: {}, // Added to match HomeAssistant interface
      };

      it('should call callback for matching device_id', () => {
        let callCount = 0;
        let calledEntity: Entity | null = null;
        let calledState: State | null = null;

        processDeviceEntities(mockHass, 'device_123', (entity, state) => {
          callCount++;
          calledEntity = entity;
          calledState = state;
        });

        expect(callCount).to.equal(1);
        expect(calledEntity).to.deep.equal(mockEntity);
        expect(calledState).to.deep.equal(mockState);
      });

      it('should not call callback for non-matching device_id', () => {
        let callCount = 0;

        processDeviceEntities(mockHass, 'non_existent_device', () => {
          callCount++;
        });

        expect(callCount).to.equal(0);
      });

      it('should process multiple entities with same device_id', () => {
        const mockHassMultiple: HomeAssistant = {
          entities: {
            'light.living_room': mockEntity,
            'switch.living_room': {
              entity_id: 'switch.living_room',
              device_id: 'device_123',
            },
          },
          states: {
            'light.living_room': mockState,
            'switch.living_room': {
              entity_id: 'switch.living_room',
              state: 'on',
              attributes: {},
            },
          },
          devices: {},
        };

        let callCount = 0;
        const processedEntities: string[] = [];

        processDeviceEntities(mockHassMultiple, 'device_123', (entity) => {
          callCount++;
          processedEntities.push(entity.entity_id);
        });

        expect(callCount).to.equal(2);
        expect(processedEntities).to.include('light.living_room');
        expect(processedEntities).to.include('switch.living_room');
      });

      it('should handle empty entities object', () => {
        const emptyHass: HomeAssistant = {
          entities: {},
          states: {},
          devices: {},
        };

        let callCount = 0;

        processDeviceEntities(emptyHass, 'device_123', () => {
          callCount++;
        });

        expect(callCount).to.equal(0);
      });

      it('should handle undefined states gracefully', () => {
        const hassWithoutStates: HomeAssistant = {
          entities: {
            'light.living_room': mockEntity,
          },
          states: {},
          devices: {},
        };

        expect(() => {
          processDeviceEntities(hassWithoutStates, 'device_123', () => {});
        }).to.not.throw();
      });

      it('should maintain type safety in callback parameters', () => {
        processDeviceEntities(mockHass, 'device_123', (entity, state) => {
          // TypeScript checks
          expect(entity.entity_id).to.be.a('string');
          expect(entity.device_id).to.be.a('string');
          expect(state.state).to.be.a('string');
          expect(state.attributes).to.be.an('object');
        });
      });
    });
  });
});
