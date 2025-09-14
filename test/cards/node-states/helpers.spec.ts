import { getZWaveNodes } from '@node-states/helpers';
import type { Config } from '@node-states/types';
import type { HomeAssistant } from '@type/homeassistant';
import * as hassUtils from '@util/hass';
import { expect } from 'chai';
import { stub } from 'sinon';

describe('ZWaveNodesStatus', () => {
  describe('helpers.ts', () => {
    /**
     * Suite for testing the getZWaveNodes function
     */
    describe('getZWaveNodes', () => {
      // Test hooks and setup
      let mockHass: HomeAssistant;
      let getZWaveNonHubsStub: sinon.SinonStub;
      let processDeviceEntitiesStub: sinon.SinonStub;

      beforeEach(() => {
        // Create a basic mock HomeAssistant object
        mockHass = {
          states: {},
          entities: {},
          devices: {},
        } as HomeAssistant;

        // Stub the imported utility functions
        getZWaveNonHubsStub = stub(hassUtils, 'getZWaveNonHubs');
        processDeviceEntitiesStub = stub(
          hassUtils,
          'processDeviceEntitiesAndCheckIfController',
        );
      });

      afterEach(() => {
        // Restore the original functions
        getZWaveNonHubsStub.restore();
        processDeviceEntitiesStub.restore();
      });

      /**
       * Tests that devices are correctly sorted into dead, live, and asleep categories
       */
      it('should categorize nodes into dead, live, and asleep nodes', () => {
        // Setup mock devices
        const mockDevices = [
          { id: 'device1', name: 'Device 1' },
          { id: 'device2', name: 'Device 2' },
          { id: 'device3', name: 'Device 3' },
        ];

        // Return the mock devices when getZWaveNonHubs is called
        getZWaveNonHubsStub.returns(mockDevices);

        // Set up processDeviceEntitiesAndCheckIfController to populate node states
        processDeviceEntitiesStub.callsFake((hass, deviceId, callback) => {
          if (deviceId === 'device1') {
            // Device 1 is alive
            callback(
              {
                entity_id: 'sensor.device1_node_status',
                translation_key: 'node_status',
              },
              { state: 'alive', entity_id: 'sensor.device1_node_status' },
            );
            callback(
              {
                entity_id: 'sensor.device1_last_seen',
                translation_key: 'last_seen',
              },
              {
                state: new Date().toISOString(),
                entity_id: 'sensor.device1_last_seen',
              },
            );
          } else if (deviceId === 'device2') {
            // Device 2 is asleep
            callback(
              {
                entity_id: 'sensor.device2_node_status',
                translation_key: 'node_status',
              },
              { state: 'asleep', entity_id: 'sensor.device2_node_status' },
            );
            callback(
              {
                entity_id: 'sensor.device2_last_seen',
                translation_key: 'last_seen',
              },
              {
                state: new Date().toISOString(),
                entity_id: 'sensor.device2_last_seen',
              },
            );
          } else if (deviceId === 'device3') {
            // Device 3 is dead
            callback(
              {
                entity_id: 'sensor.device3_node_status',
                translation_key: 'node_status',
              },
              { state: 'dead', entity_id: 'sensor.device3_node_status' },
            );
            callback(
              {
                entity_id: 'sensor.device3_last_seen',
                translation_key: 'last_seen',
              },
              {
                state: new Date().toISOString(),
                entity_id: 'sensor.device3_last_seen',
              },
            );
          }
          return false; // Not a controller
        });

        // Call the function under test
        const result = getZWaveNodes(mockHass, {} as Config);

        // Verify the results
        expect(result.liveNodes).to.have.lengthOf(1);
        expect(result.liveNodes[0]!.name).to.equal('Device 1');
        expect(result.liveNodes[0]!.statusState.state).to.equal('alive');

        expect(result.sleepingNodes).to.have.lengthOf(1);
        expect(result.sleepingNodes[0]!.name).to.equal('Device 2');
        expect(result.sleepingNodes[0]!.statusState.state).to.equal('asleep');

        expect(result.deadNodes).to.have.lengthOf(1);
        expect(result.deadNodes[0]!.name).to.equal('Device 3');
        expect(result.deadNodes[0]!.statusState.state).to.equal('dead');
      });

      /**
       * Tests that nodes are sorted by lastSeen time within each category
       */
      it('should sort nodes by lastSeen timestamp within categories', () => {
        const now = new Date();
        const oneHourAgo = new Date(now.getTime() - 3600000);
        const twoHoursAgo = new Date(now.getTime() - 7200000);

        // Setup mock devices
        const mockDevices = [
          { id: 'device1', name: 'Device 1' }, // alive, seen 2 hours ago
          { id: 'device2', name: 'Device 2' }, // alive, seen now
          { id: 'device3', name: 'Device 3' }, // alive, seen 1 hour ago
        ];

        getZWaveNonHubsStub.returns(mockDevices);

        // Set up processDeviceEntitiesAndCheckIfController with different last seen times
        processDeviceEntitiesStub.callsFake((hass, deviceId, callback) => {
          if (deviceId === 'device1') {
            callback(
              {
                entity_id: 'sensor.device1_node_status',
                translation_key: 'node_status',
              },
              { state: 'alive', entity_id: 'sensor.device1_node_status' },
            );
            callback(
              {
                entity_id: 'sensor.device1_last_seen',
                translation_key: 'last_seen',
              },
              {
                state: twoHoursAgo.toISOString(),
                entity_id: 'sensor.device1_last_seen',
              },
            );
          } else if (deviceId === 'device2') {
            callback(
              {
                entity_id: 'sensor.device2_node_status',
                translation_key: 'node_status',
              },
              { state: 'alive', entity_id: 'sensor.device2_node_status' },
            );
            callback(
              {
                entity_id: 'sensor.device2_last_seen',
                translation_key: 'last_seen',
              },
              {
                state: now.toISOString(),
                entity_id: 'sensor.device2_last_seen',
              },
            );
          } else if (deviceId === 'device3') {
            callback(
              {
                entity_id: 'sensor.device3_node_status',
                translation_key: 'node_status',
              },
              { state: 'alive', entity_id: 'sensor.device3_node_status' },
            );
            callback(
              {
                entity_id: 'sensor.device3_last_seen',
                translation_key: 'last_seen',
              },
              {
                state: oneHourAgo.toISOString(),
                entity_id: 'sensor.device3_last_seen',
              },
            );
          }
          return false;
        });

        // Call the function under test
        const result = getZWaveNodes(mockHass, {} as Config);

        // Verify sorting order - most recent first
        expect(result.liveNodes).to.have.lengthOf(3);
        expect(result.liveNodes[0]!.name).to.equal('Device 2'); // Most recent (now)
        expect(result.liveNodes[1]!.name).to.equal('Device 3'); // One hour ago
        expect(result.liveNodes[2]!.name).to.equal('Device 1'); // Two hours ago
      });

      /**
       * Tests handling of devices without a lastSeen state
       */
      it('should handle nodes without lastSeen state', () => {
        // Setup mock devices
        const mockDevices = [
          { id: 'device1', name: 'Device With LastSeen' },
          { id: 'device2', name: 'Device Without LastSeen' },
        ];

        getZWaveNonHubsStub.returns(mockDevices);

        // Device 1 has both status and lastSeen, Device 2 has only status
        processDeviceEntitiesStub.callsFake((hass, deviceId, callback) => {
          if (deviceId === 'device1') {
            callback(
              {
                entity_id: 'sensor.device1_node_status',
                translation_key: 'node_status',
              },
              { state: 'alive', entity_id: 'sensor.device1_node_status' },
            );
            callback(
              {
                entity_id: 'sensor.device1_last_seen',
                translation_key: 'last_seen',
              },
              {
                state: new Date().toISOString(),
                entity_id: 'sensor.device1_last_seen',
              },
            );
          } else if (deviceId === 'device2') {
            callback(
              {
                entity_id: 'sensor.device2_node_status',
                translation_key: 'node_status',
              },
              { state: 'alive', entity_id: 'sensor.device2_node_status' },
            );
            // No lastSeen callback for device2
          }
          return false;
        });

        // Call the function under test
        const result = getZWaveNodes(mockHass, {} as Config);

        // Both devices should be in liveNodes
        expect(result.liveNodes).to.have.lengthOf(2);

        // Device with lastSeen should be first
        expect(result.liveNodes[0]!.name).to.equal('Device With LastSeen');
        expect(result.liveNodes[0]!.lastSeen).to.be.a('number');

        // Device without lastSeen should be second
        expect(result.liveNodes[1]!.name).to.equal('Device Without LastSeen');
        expect(result.liveNodes[1]!.lastSeen).to.be.undefined;
      });

      /**
       * Tests handling of devices without a status state
       */
      it('should handle nodes without status state', () => {
        // Setup mock devices
        const mockDevices = [
          { id: 'device1', name: 'Device With Status' },
          { id: 'device2', name: 'Device Without Status' },
        ];

        getZWaveNonHubsStub.returns(mockDevices);

        // Device 1 has status, Device 2 has no status
        processDeviceEntitiesStub.callsFake((hass, deviceId, callback) => {
          if (deviceId === 'device1') {
            callback(
              {
                entity_id: 'sensor.device1_node_status',
                translation_key: 'node_status',
              },
              { state: 'alive', entity_id: 'sensor.device1_node_status' },
            );
          }
          // No callbacks for device2
          return false;
        });

        // Call the function under test
        const result = getZWaveNodes(mockHass, {} as Config);

        // Device with status should be categorized as alive
        expect(result.liveNodes).to.have.lengthOf(1);
        expect(result.liveNodes[0]!.name).to.equal('Device With Status');

        // Device without status should are 'dead'
        expect(result.deadNodes).to.have.lengthOf(1);
        expect(result.sleepingNodes).to.have.lengthOf(0);

        // Ensure all devices were processed
        expect(processDeviceEntitiesStub.callCount).to.equal(2);
      });

      /**
       * Tests handling of empty device list
       */
      it('should handle empty device list', () => {
        // Return empty array from getZWaveNonHubs
        getZWaveNonHubsStub.returns([]);

        // Call the function under test
        const result = getZWaveNodes(mockHass, {} as Config);

        // All categories should be empty
        expect(result.liveNodes).to.have.lengthOf(0);
        expect(result.deadNodes).to.have.lengthOf(0);
        expect(result.sleepingNodes).to.have.lengthOf(0);

        // Ensure getZWaveNonHubs was called
        expect(getZWaveNonHubsStub.calledOnce).to.be.true;
        // Ensure processDeviceEntitiesAndCheckIfController was never called
        expect(processDeviceEntitiesStub.called).to.be.false;
      });

      /**
       * Tests filtering based on hide-dead feature
       */
      it('should filter out dead nodes when hide-dead feature is enabled', () => {
        // Setup mock devices
        const mockDevices = [
          { id: 'device1', name: 'Alive Device' },
          { id: 'device2', name: 'Dead Device' },
          { id: 'device3', name: 'Sleeping Device' },
        ];

        getZWaveNonHubsStub.returns(mockDevices);

        processDeviceEntitiesStub.callsFake((hass, deviceId, callback) => {
          if (deviceId === 'device1') {
            callback(
              {
                entity_id: 'sensor.device1_node_status',
                translation_key: 'node_status',
              },
              { state: 'alive', entity_id: 'sensor.device1_node_status' },
            );
          } else if (deviceId === 'device2') {
            callback(
              {
                entity_id: 'sensor.device2_node_status',
                translation_key: 'node_status',
              },
              { state: 'dead', entity_id: 'sensor.device2_node_status' },
            );
          } else if (deviceId === 'device3') {
            callback(
              {
                entity_id: 'sensor.device3_node_status',
                translation_key: 'node_status',
              },
              { state: 'asleep', entity_id: 'sensor.device3_node_status' },
            );
          }
          return false;
        });

        // Call with hide-dead feature enabled
        const result = getZWaveNodes(mockHass, {
          features: ['hide-dead'],
        } as Config);

        // Verify dead nodes are filtered out
        expect(result.deadNodes).to.have.lengthOf(0);
        expect(result.liveNodes).to.have.lengthOf(1);
        expect(result.sleepingNodes).to.have.lengthOf(1);
        expect(result.liveNodes[0]!.name).to.equal('Alive Device');
        expect(result.sleepingNodes[0]!.name).to.equal('Sleeping Device');
      });

      /**
       * Tests filtering based on hide-active feature
       */
      it('should filter out active nodes when hide-active feature is enabled', () => {
        // Setup mock devices
        const mockDevices = [
          { id: 'device1', name: 'Alive Device' },
          { id: 'device2', name: 'Dead Device' },
          { id: 'device3', name: 'Sleeping Device' },
        ];

        getZWaveNonHubsStub.returns(mockDevices);

        processDeviceEntitiesStub.callsFake((hass, deviceId, callback) => {
          if (deviceId === 'device1') {
            callback(
              {
                entity_id: 'sensor.device1_node_status',
                translation_key: 'node_status',
              },
              { state: 'alive', entity_id: 'sensor.device1_node_status' },
            );
          } else if (deviceId === 'device2') {
            callback(
              {
                entity_id: 'sensor.device2_node_status',
                translation_key: 'node_status',
              },
              { state: 'dead', entity_id: 'sensor.device2_node_status' },
            );
          } else if (deviceId === 'device3') {
            callback(
              {
                entity_id: 'sensor.device3_node_status',
                translation_key: 'node_status',
              },
              { state: 'asleep', entity_id: 'sensor.device3_node_status' },
            );
          }
          return false;
        });

        // Call with hide-active feature enabled
        const result = getZWaveNodes(mockHass, {
          features: ['hide-active'],
        } as Config);

        // Verify active nodes are filtered out
        expect(result.liveNodes).to.have.lengthOf(0);
        expect(result.deadNodes).to.have.lengthOf(1);
        expect(result.sleepingNodes).to.have.lengthOf(1);
        expect(result.deadNodes[0]!.name).to.equal('Dead Device');
        expect(result.sleepingNodes[0]!.name).to.equal('Sleeping Device');
      });

      /**
       * Tests filtering based on hide-sleeping feature
       */
      it('should filter out sleeping nodes when hide-sleeping feature is enabled', () => {
        // Setup mock devices
        const mockDevices = [
          { id: 'device1', name: 'Alive Device' },
          { id: 'device2', name: 'Dead Device' },
          { id: 'device3', name: 'Sleeping Device' },
        ];

        getZWaveNonHubsStub.returns(mockDevices);

        processDeviceEntitiesStub.callsFake((hass, deviceId, callback) => {
          if (deviceId === 'device1') {
            callback(
              {
                entity_id: 'sensor.device1_node_status',
                translation_key: 'node_status',
              },
              { state: 'alive', entity_id: 'sensor.device1_node_status' },
            );
          } else if (deviceId === 'device2') {
            callback(
              {
                entity_id: 'sensor.device2_node_status',
                translation_key: 'node_status',
              },
              { state: 'dead', entity_id: 'sensor.device2_node_status' },
            );
          } else if (deviceId === 'device3') {
            callback(
              {
                entity_id: 'sensor.device3_node_status',
                translation_key: 'node_status',
              },
              { state: 'asleep', entity_id: 'sensor.device3_node_status' },
            );
          }
          return false;
        });

        // Call with hide-sleeping feature enabled
        const result = getZWaveNodes(mockHass, {
          features: ['hide-sleeping'],
        } as Config);

        // Verify sleeping nodes are filtered out
        expect(result.sleepingNodes).to.have.lengthOf(0);
        expect(result.liveNodes).to.have.lengthOf(1);
        expect(result.deadNodes).to.have.lengthOf(1);
        expect(result.liveNodes[0]!.name).to.equal('Alive Device');
        expect(result.deadNodes[0]!.name).to.equal('Dead Device');
      });

      /**
       * Tests combining multiple filter features
       */
      it('should filter out multiple node types when multiple hide features are enabled', () => {
        // Setup mock devices
        const mockDevices = [
          { id: 'device1', name: 'Alive Device' },
          { id: 'device2', name: 'Dead Device' },
          { id: 'device3', name: 'Sleeping Device' },
        ];

        getZWaveNonHubsStub.returns(mockDevices);

        processDeviceEntitiesStub.callsFake((hass, deviceId, callback) => {
          if (deviceId === 'device1') {
            callback(
              {
                entity_id: 'sensor.device1_node_status',
                translation_key: 'node_status',
              },
              { state: 'alive', entity_id: 'sensor.device1_node_status' },
            );
          } else if (deviceId === 'device2') {
            callback(
              {
                entity_id: 'sensor.device2_node_status',
                translation_key: 'node_status',
              },
              { state: 'dead', entity_id: 'sensor.device2_node_status' },
            );
          } else if (deviceId === 'device3') {
            callback(
              {
                entity_id: 'sensor.device3_node_status',
                translation_key: 'node_status',
              },
              { state: 'asleep', entity_id: 'sensor.device3_node_status' },
            );
          }
          return false;
        });

        // Call with multiple hide features enabled
        const result = getZWaveNodes(mockHass, {
          features: ['hide-dead', 'hide-sleeping'],
        } as Config);

        // Verify only active nodes remain
        expect(result.deadNodes).to.have.lengthOf(0);
        expect(result.sleepingNodes).to.have.lengthOf(0);
        expect(result.liveNodes).to.have.lengthOf(1);
        expect(result.liveNodes[0]!.name).to.equal('Alive Device');
      });

      /**
       * Tests that default behavior (no filtering) works when no features are specified
       */
      it('should not filter any nodes when no hide features are enabled', () => {
        // Setup mock devices
        const mockDevices = [
          { id: 'device1', name: 'Alive Device' },
          { id: 'device2', name: 'Dead Device' },
          { id: 'device3', name: 'Sleeping Device' },
        ];

        getZWaveNonHubsStub.returns(mockDevices);

        processDeviceEntitiesStub.callsFake((hass, deviceId, callback) => {
          if (deviceId === 'device1') {
            callback(
              {
                entity_id: 'sensor.device1_node_status',
                translation_key: 'node_status',
              },
              { state: 'alive', entity_id: 'sensor.device1_node_status' },
            );
          } else if (deviceId === 'device2') {
            callback(
              {
                entity_id: 'sensor.device2_node_status',
                translation_key: 'node_status',
              },
              { state: 'dead', entity_id: 'sensor.device2_node_status' },
            );
          } else if (deviceId === 'device3') {
            callback(
              {
                entity_id: 'sensor.device3_node_status',
                translation_key: 'node_status',
              },
              { state: 'asleep', entity_id: 'sensor.device3_node_status' },
            );
          }
          return false;
        });

        // Call with no filter features
        const result = getZWaveNodes(mockHass, {
          features: ['compact'],
        } as Config);

        // Verify all nodes are present
        expect(result.liveNodes).to.have.lengthOf(1);
        expect(result.deadNodes).to.have.lengthOf(1);
        expect(result.sleepingNodes).to.have.lengthOf(1);
        expect(result.liveNodes[0]!.name).to.equal('Alive Device');
        expect(result.deadNodes[0]!.name).to.equal('Dead Device');
        expect(result.sleepingNodes[0]!.name).to.equal('Sleeping Device');
      });
    });
  });
});
