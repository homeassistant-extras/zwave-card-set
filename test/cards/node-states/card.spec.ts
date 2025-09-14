import * as actionHandlerModule from '@delegates/action-handler-delegate';
import { ZWaveNodesStatus } from '@node-states/card';
import * as helpersModule from '@node-states/helpers';
import { styles } from '@node-states/styles';
import type { Config, NodeInfo } from '@node-states/types';
import { fixture, fixtureCleanup } from '@open-wc/testing-helpers';
import { createState as s } from '@test/test-helpers';
import type { ActionHandlerEvent } from '@type/action';
import type { HomeAssistant } from '@type/homeassistant';
import * as hassUtils from '@util/hass';
import { expect } from 'chai';
import { nothing } from 'lit';
import { stub } from 'sinon';

describe('ZWaveNodesStatus', () => {
  describe('card.ts', () => {
    let card: ZWaveNodesStatus;
    let mockHass: HomeAssistant;
    let mockConfig: Config;
    let actionHandlerStub: sinon.SinonStub;
    let handleClickActionStub: sinon.SinonStub;
    let getZWaveNonHubsStub: sinon.SinonStub;

    beforeEach(() => {
      // Create a new card instance for each test
      card = new ZWaveNodesStatus();

      // Basic config setup
      mockConfig = {
        title: 'Test Z-Wave Nodes',
      };

      // Basic mock Hass setup with empty collections
      mockHass = {
        states: {},
        entities: {},
        devices: {},
      } as HomeAssistant;

      // Setup stubs for action handlers
      actionHandlerStub = stub(actionHandlerModule, 'actionHandler').returns({
        bind: () => {},
        handleAction: () => {},
      });

      handleClickActionStub = stub(
        actionHandlerModule,
        'handleClickAction',
      ).returns({
        handleEvent: (ev: ActionHandlerEvent): void => {},
      });

      // Set up getZWaveNonHubs stub
      getZWaveNonHubsStub = stub(hassUtils, 'getZWaveNonHubs').returns([]);

      // Initialize the card
      card.setConfig(mockConfig);
    });

    afterEach(async () => {
      await fixtureCleanup();
      actionHandlerStub.restore();
      handleClickActionStub.restore();
      getZWaveNonHubsStub.restore();
    });

    describe('setConfig', () => {
      it('should set the configuration correctly', () => {
        const config: Config = { title: 'Custom Title' };
        card.setConfig(config);
        expect((card as any)._config).to.equal(config);
      });
    });

    describe('getConfigElement', () => {
      it('should return correct editor element', () => {
        const editor = ZWaveNodesStatus.getConfigElement();
        expect(editor.tagName.toLowerCase()).to.equal('basic-editor');
        expect((editor as any).schema).to.deep.equal([
          {
            name: 'content',
            label: 'Content',
            type: 'expandable',
            flatten: true,
            icon: 'mdi:text-short',
            schema: [
              {
                name: 'title',
                label: 'Card title.',
                required: false,
                selector: { text: {} },
              },
              {
                name: 'columns',
                label: 'Number of columns.',
                required: false,
                selector: { number: { min: 1, max: 3 } },
              },
              {
                name: 'layout',
                label: 'Node Layout',
                required: false,
                selector: {
                  select: {
                    options: [
                      { label: 'Left Aligned', value: 'left-aligned' },
                      { label: 'Centered', value: 'centered' },
                    ],
                  },
                },
              },
            ],
          },
          {
            name: 'features',
            label: 'Features',
            type: 'expandable',
            flatten: true,
            icon: 'mdi:list-box',
            schema: [
              {
                name: 'features',
                label: 'Features',
                required: false,
                selector: {
                  select: {
                    multiple: true,
                    mode: 'list',
                    options: [
                      {
                        label: 'Show the card more compact.',
                        value: 'compact',
                      },
                      {
                        label: 'Hide dead nodes.',
                        value: 'hide-dead',
                      },
                      {
                        label: 'Hide active nodes.',
                        value: 'hide-active',
                      },
                      {
                        label: 'Hide sleeping nodes.',
                        value: 'hide-sleeping',
                      },
                    ],
                  },
                },
              },
            ],
          },
          {
            name: 'interactions',
            label: 'Interactions',
            type: 'expandable',
            flatten: true,
            icon: 'mdi:gesture-tap',
            schema: [
              {
                name: 'tap_action',
                label: 'Tap Action',
                selector: {
                  ui_action: {},
                },
              },
              {
                name: 'hold_action',
                label: 'Hold Action',
                selector: {
                  ui_action: {},
                },
              },
              {
                name: 'double_tap_action',
                label: 'Double Tap Action',
                selector: {
                  ui_action: {},
                },
              },
            ],
          },
        ]);
      });
    });

    describe('hass property setter', () => {
      let card: ZWaveNodesStatus;
      let mockHass: HomeAssistant;
      let getZWaveNodesStub: sinon.SinonStub;

      // Create node mock data
      const deadNode = {
        name: 'Dead Node',
        device_id: 'dead_device',
        statusState: s('sensor.dead_node_status', 'dead'),
        lastSeen: Date.now() - 48 * 60 * 60 * 1000,
      } as NodeInfo;

      const liveNode = {
        name: 'Live Node',
        device_id: 'live_device',
        statusState: s('sensor.live_node_status', 'alive'),
        lastSeen: Date.now(),
      } as NodeInfo;

      const sleepingNode = {
        name: 'Sleeping Node',
        device_id: 'sleeping_device',
        statusState: s('sensor.sleeping_node_status', 'asleep'),
        lastSeen: Date.now() - 3 * 60 * 60 * 1000,
      } as NodeInfo;

      beforeEach(() => {
        // Create a new card instance
        card = new ZWaveNodesStatus();

        // Create basic mock Hass object
        mockHass = {
          states: {},
          entities: {},
          devices: {},
        } as HomeAssistant;

        // Create stub for getZWaveNodes
        getZWaveNodesStub = stub(helpersModule, 'getZWaveNodes');

        // Set up the card with basic config
        card.setConfig({ title: 'Test Z-Wave Nodes' });
      });

      afterEach(() => {
        getZWaveNodesStub.restore();
      });

      it('should update node arrays when nodes change', () => {
        // Set up the mock response for getZWaveNodes
        const mockNodes = {
          deadNodes: [deadNode],
          liveNodes: [liveNode],
          sleepingNodes: [sleepingNode],
        };

        getZWaveNodesStub.returns(mockNodes);

        // Verify initial state
        expect((card as any)._deadNodes).to.be.an('array').that.is.empty;
        expect((card as any)._liveNodes).to.be.an('array').that.is.empty;
        expect((card as any)._sleepingNodes).to.be.an('array').that.is.empty;

        // Call the hass setter
        card.hass = mockHass;

        // Verify getZWaveNodes was called with config
        expect(
          getZWaveNodesStub.calledOnceWith(mockHass, {
            title: 'Test Z-Wave Nodes',
          }),
        ).to.be.true;

        // Verify arrays were updated
        expect((card as any)._deadNodes).to.deep.equal([deadNode]);
        expect((card as any)._liveNodes).to.deep.equal([liveNode]);
        expect((card as any)._sleepingNodes).to.deep.equal([sleepingNode]);
      });

      it('should not update node arrays when nodes have not changed', () => {
        // Set up initial nodes
        const initialNodes = {
          deadNodes: [deadNode],
          liveNodes: [liveNode],
          sleepingNodes: [sleepingNode],
        };

        getZWaveNodesStub.returns(initialNodes);

        // First call to set initial state
        card.hass = mockHass;

        // Get references to the original arrays
        const originalDeadNodes = (card as any)._deadNodes;
        const originalLiveNodes = (card as any)._liveNodes;
        const originalSleepingNodes = (card as any)._sleepingNodes;

        // Reset the stub so we can verify it's called again
        getZWaveNodesStub.resetHistory();

        // Call hass setter again with same data
        card.hass = mockHass;

        // Verify getZWaveNodes was called with config
        expect(
          getZWaveNodesStub.calledOnceWith(mockHass, {
            title: 'Test Z-Wave Nodes',
          }),
        ).to.be.true;

        // Verify references remain the same (arrays were not recreated)
        expect((card as any)._deadNodes).to.equal(originalDeadNodes);
        expect((card as any)._liveNodes).to.equal(originalLiveNodes);
        expect((card as any)._sleepingNodes).to.equal(originalSleepingNodes);
      });

      it('should update only changed node arrays', () => {
        // Set up initial nodes
        const initialNodes = {
          deadNodes: [deadNode],
          liveNodes: [liveNode],
          sleepingNodes: [sleepingNode],
        };

        getZWaveNodesStub.returns(initialNodes);

        // First call to set initial state
        card.hass = mockHass;

        // Get references to the original arrays
        const originalDeadNodes = (card as any)._deadNodes;
        const originalLiveNodes = (card as any)._liveNodes;
        const originalSleepingNodes = (card as any)._sleepingNodes;

        // Create modified nodes with only liveNodes changed
        const updatedLiveNode: NodeInfo = {
          ...liveNode,
          lastSeen: Date.now() + 1000, // just change the lastSeen value
        };

        const modifiedNodes = {
          deadNodes: [deadNode], // Same as before
          liveNodes: [updatedLiveNode], // Changed
          sleepingNodes: [sleepingNode], // Same as before
        };

        getZWaveNodesStub.returns(modifiedNodes);

        // Reset the stub so we can verify it's called again
        getZWaveNodesStub.resetHistory();

        // Call hass setter again with modified data
        card.hass = mockHass;

        // Verify getZWaveNodes was called with config
        expect(
          getZWaveNodesStub.calledOnceWith(mockHass, {
            title: 'Test Z-Wave Nodes',
          }),
        ).to.be.true;

        // Verify only liveNodes was updated
        expect((card as any)._deadNodes).to.equal(originalDeadNodes);
        expect((card as any)._liveNodes).to.not.equal(originalLiveNodes);
        expect((card as any)._sleepingNodes).to.equal(originalSleepingNodes);

        // Verify content of liveNodes was updated
        expect((card as any)._liveNodes).to.deep.equal([updatedLiveNode]);
      });

      it('should handle empty arrays from getZWaveNodes', () => {
        // Set up empty mock response
        const emptyNodes = {
          deadNodes: [],
          liveNodes: [],
          sleepingNodes: [],
        };

        getZWaveNodesStub.returns(emptyNodes);

        // Call the hass setter
        card.hass = mockHass;

        // Verify all arrays are empty
        expect((card as any)._deadNodes).to.be.an('array').that.is.empty;
        expect((card as any)._liveNodes).to.be.an('array').that.is.empty;
        expect((card as any)._sleepingNodes).to.be.an('array').that.is.empty;
      });
    });

    describe('_getStatusColor', () => {
      it('should return the correct color for alive status', () => {
        const color = (card as any)._getStatusColor('alive');
        expect(color).to.equal('rgb(var(--rgb-green))');
      });

      it('should return the correct color for asleep status', () => {
        const color = (card as any)._getStatusColor('asleep');
        expect(color).to.equal('rgb(var(--rgb-amber))');
      });

      it('should return the correct color for dead status', () => {
        const color = (card as any)._getStatusColor('dead');
        expect(color).to.equal('rgb(var(--rgb-red))');
      });

      it('should return the default color for unknown status', () => {
        const color = (card as any)._getStatusColor('unknown');
        expect(color).to.equal('rgb(var(--rgb-grey))');
      });
    });

    describe('_getLastSeenColor', () => {
      it('should return green for devices seen less than 2 hours ago', () => {
        const now = Date.now();
        const oneHourAgo = now - 1 * 60 * 60 * 1000;
        const color = (card as any)._getLastSeenColor(oneHourAgo);
        expect(color).to.equal('rgb(var(--rgb-green))');
      });

      it('should return amber for devices seen between 2 and 24 hours ago', () => {
        const now = Date.now();
        const threeHoursAgo = now - 3 * 60 * 60 * 1000;
        const color = (card as any)._getLastSeenColor(threeHoursAgo);
        expect(color).to.equal('rgb(var(--rgb-amber))');
      });

      it('should return red for devices seen more than 24 hours ago', () => {
        const now = Date.now();
        const twoDaysAgo = now - 2 * 24 * 60 * 60 * 1000;
        const color = (card as any)._getLastSeenColor(twoDaysAgo);
        expect(color).to.equal('rgb(var(--rgb-red))');
      });

      it('should handle invalid last seen times', () => {
        const color = (card as any)._getLastSeenColor(nothing);
        expect(color).to.equal('rgb(var(--rgb-grey))');
      });
    });

    describe('styles', () => {
      it('should return expected styles', () => {
        const actual = ZWaveNodesStatus.styles;
        expect(actual).to.deep.equal(styles);
      });
    });

    describe('render method', () => {
      it('should show "No Z-Wave devices found" when no devices exist', async () => {
        card.hass = mockHass;
        const el = await fixture(card.render());

        const notFoundDiv = el.querySelector('.not-found')!;
        expect(notFoundDiv).to.exist;
        expect(notFoundDiv.textContent).to.equal('No Z-Wave devices found');
      });

      it('should use the configured title when provided', async () => {
        card.setConfig({ title: 'Custom Card Title' });

        const el = await fixture(card.render());
        const cardHeader = el
          .getElementsByClassName('card-header')[0]!
          .textContent?.trim();

        expect(cardHeader).to.equal('Custom Card Title');
      });

      it('should use default title when not provided in config', async () => {
        card.setConfig({} as Config);

        const el = await fixture(card.render());
        const cardHeader = el
          .getElementsByClassName('card-header')[0]!
          .textContent?.trim();

        expect(cardHeader).to.equal('Z-Wave Nodes Status');
      });

      // it('should splice arrays to length 1 when in preview mode', async () => {
      //   // Create multiple devices of each type
      //   mockHass.devices = {
      //     device1: {
      //       id: 'device1',
      //       name_by_user: 'Dead Device 1',
      //       identifiers: [['zwave_js', '']],
      //       labels: [],
      //     },
      //     device2: {
      //       id: 'device2',
      //       name_by_user: 'Dead Device 2',
      //       identifiers: [['zwave_js', '']],
      //       labels: [],
      //     },
      //     device3: {
      //       id: 'device3',
      //       name_by_user: 'Live Device 1',
      //       identifiers: [['zwave_js', '']],
      //       labels: [],
      //     },
      //     device4: {
      //       id: 'device4',
      //       name_by_user: 'Live Device 2',
      //       identifiers: [['zwave_js', '']],
      //       labels: [],
      //     },
      //     device5: {
      //       id: 'device5',
      //       name_by_user: 'Sleeping Device 1',
      //       identifiers: [['zwave_js', '']],
      //       labels: [],
      //     },
      //     device6: {
      //       id: 'device6',
      //       name_by_user: 'Sleeping Device 2',
      //       identifiers: [['zwave_js', '']],
      //       labels: [],
      //     },
      //   };

      //   mockHass.entities = {
      //     ...Object.keys(mockHass.devices).reduce(
      //       (acc, deviceId) => ({
      //         ...acc,
      //         [`switch.${deviceId}_node_status`]: {
      //           entity_id: `switch.${deviceId}_node_status`,
      //           device_id: deviceId,
      //         },
      //         [`sensor.${deviceId}_last_seen`]: {
      //           entity_id: `sensor.${deviceId}_last_seen`,
      //           device_id: deviceId,
      //         },
      //       }),
      //       {},
      //     ),
      //   };

      //   mockHass.states = {
      //     'switch.device1_node_status': s('switch.device1_node_status', 'dead'),
      //     'switch.device2_node_status': s('switch.device2_node_status', 'dead'),
      //     'switch.device3_node_status': s(
      //       'switch.device3_node_status',
      //       'alive',
      //     ),
      //     'switch.device4_node_status': s(
      //       'switch.device4_node_status',
      //       'alive',
      //     ),
      //     'switch.device5_node_status': s(
      //       'switch.device5_node_status',
      //       'asleep',
      //     ),
      //     'switch.device6_node_status': s(
      //       'switch.device6_node_status',
      //       'asleep',
      //     ),
      //     ...Object.keys(mockHass.devices).reduce(
      //       (acc, deviceId) => ({
      //         ...acc,
      //         [`sensor.${deviceId}_last_seen`]: s(
      //           `sensor.${deviceId}_last_seen`,
      //           new Date().toISOString(),
      //         ),
      //       }),
      //       {},
      //     ),
      //   };

      //   card.hass = mockHass;

      //   // Mock isPreview to return true
      //   Object.defineProperty(card, 'isPreview', {
      //     get: () => true,
      //   });

      //   const el = await fixture(card.render());

      //   // Check that each section only shows one node
      //   expect((card as any)._deadNodes)
      //     .to.be.an('array')
      //     .that.has.lengthOf(1);
      //   expect((card as any)._liveNodes)
      //     .to.be.an('array')
      //     .that.has.lengthOf(1);
      //   expect((card as any)._sleepingNodes)
      //     .to.be.an('array')
      //     .that.has.lengthOf(1);

      //   // Verify specific nodes that should be shown
      //   const nodeNames = Array.from(el.querySelectorAll('.node-name')).map(
      //     (node) => node.textContent,
      //   );
      //   expect(nodeNames).to.include('Dead Device 1');
      //   expect(nodeNames).to.include('Live Device 1');
      //   expect(nodeNames).to.include('Sleeping Device 1');

      //   // Verify that second devices are not shown
      //   expect(nodeNames).to.not.include('Dead Device 2');
      //   expect(nodeNames).to.not.include('Live Device 2');
      //   expect(nodeNames).to.not.include('Sleeping Device 2');

      //   // Verify action handlers are attached
      //   expect(actionHandlerStub.called).to.be.true;
      //   expect(handleClickActionStub.called).to.be.true;
      // });
    });

    describe('_renderNode method', () => {
      it('should render node with status icon and last seen display', async () => {
        const mockNode: NodeInfo = {
          name: 'Test Node',
          device_id: 'test-device',
          statusState: s('switch.test_node_status', 'alive'),
          lastSeenState: s(
            'sensor.test_node_last_seen',
            new Date().toISOString(),
          ),
          lastSeen: Date.now(),
        };

        card.hass = mockHass; // Need to set this for ha-state-icon to work

        const el = await fixture((card as any)._renderNode(mockNode));

        const nodeitem = document.querySelector('.node-item')!;
        expect(nodeitem).to.exist;
        expect([...nodeitem.classList]).to.not.contain('compact');

        const statusContainer = document.querySelector(
          '.node-status-container',
        )!;
        expect(statusContainer).to.exist;
        expect(statusContainer.children[1]?.tagName).to.equal('STATE-DISPLAY');

        const nameElement = el.querySelector('.node-name')!;
        expect(nameElement).to.exist;
        expect(nameElement.textContent).to.equal('Test Node');

        const stateIcon = el.querySelector('ha-state-icon');
        expect(stateIcon).to.exist;

        const stateDisplay = el.querySelector('state-display');
        expect(stateDisplay).to.exist;

        // Verify action handlers are attached
        expect(actionHandlerStub.called).to.be.true;
        expect(handleClickActionStub.called).to.be.true;
      });

      it('should handle nodes without lastSeenState', async () => {
        const mockNode: NodeInfo = {
          name: 'Test Node',
          device_id: 'test-device',
          statusState: { entity_id: 'switch.test_node_status', state: 'alive' },
          lastSeen: Date.now(),
        } as NodeInfo; // deliberately missing lastSeenState

        card.hass = mockHass;

        const el = await fixture((card as any)._renderNode(mockNode));

        const stateIcon = el.querySelector('ha-state-icon');
        expect(stateIcon).to.exist;

        const stateDisplay = el.querySelector('state-display');
        expect(stateDisplay).to.not.exist;
      });

      it('should handle nodes without statusState', async () => {
        const mockNode: NodeInfo = {
          name: 'Test Node',
          device_id: 'test-device',
          lastSeenState: {
            entity_id: 'sensor.test_node_last_seen',
            state: new Date().toISOString(),
          },
          lastSeen: Date.now(),
        } as NodeInfo; // deliberately missing statusState

        card.hass = mockHass;

        const el = await fixture((card as any)._renderNode(mockNode));

        const stateIcon = el.querySelector('ha-state-icon');
        expect(stateIcon).to.not.exist;

        const stateDisplay = el.querySelector('state-display');
        expect(stateDisplay).to.exist;
      });

      it('should apply the compact class when the compact feature is enabled', async () => {
        const mockNode: NodeInfo = {
          name: 'Test Node',
          device_id: 'test-device',
          statusState: s('switch.test_node_status', 'alive'),
          lastSeenState: s(
            'sensor.test_node_last_seen',
            new Date().toISOString(),
          ),
          lastSeen: Date.now(),
        };
        card.setConfig({
          features: ['compact'],
        });

        const el = await fixture((card as any)._renderNode(mockNode));

        const nodeitem = document.querySelector('.node-item')!;
        expect(nodeitem).to.exist;
        expect([...nodeitem.classList]).to.contain('compact');

        const statusContainer = document.querySelector(
          '.node-status-container',
        )!;
        expect(statusContainer).to.exist;
        expect(statusContainer.children[1]?.tagName).to.equal('DIV');
        expect([...statusContainer.children[1]!.classList]).to.contain(
          'node-name',
        );
      });

      it('should call userNodeStatusActions with correct parameters', async () => {
        const userNodeStatusActionsStub = stub(
          actionHandlerModule,
          'userNodeStatusActions',
        );
        const mockNode: NodeInfo = {
          name: 'Test Node',
          device_id: 'test-device',
          statusState: s('switch.test_node_status', 'alive'),
          lastSeenState: s(
            'sensor.test_node_last_seen',
            new Date().toISOString(),
          ),
          lastSeen: Date.now(),
        };

        card.hass = mockHass;

        await fixture((card as any)._renderNode(mockNode));

        // Verify userNodeStatusActions was called with correct parameters
        expect(userNodeStatusActionsStub.called).to.be.true;
        expect(
          userNodeStatusActionsStub.calledWith(
            'switch.test_node_status',
            mockConfig,
          ),
        ).to.be.true;

        userNodeStatusActionsStub.restore();
      });
    });
  });
});
