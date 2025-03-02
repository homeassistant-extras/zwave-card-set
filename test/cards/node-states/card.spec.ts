import * as actionHandlerModule from '@common/action-handler';
import { ZWaveNodesStatus } from '@node-states/card';
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
      };

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

      // Initialize the card
      card.setConfig(mockConfig);
    });

    afterEach(async () => {
      await fixtureCleanup();
      actionHandlerStub.restore();
      handleClickActionStub.restore();
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
                ],
              },
            },
          },
        ]);
      });
    });

    describe('hass property setter', () => {
      it('should not process anything when no Z-Wave devices exist', () => {
        // Setup mock with no Z-Wave devices
        card.hass = mockHass;

        // Check internal state
        expect((card as any)._deadNodes).to.be.an('array').that.is.empty;
        expect((card as any)._liveNodes).to.be.an('array').that.is.empty;
        expect((card as any)._sleepingNodes).to.be.an('array').that.is.empty;
      });

      it('should identify and categorize Z-Wave devices correctly', () => {
        // Create mock data with Z-Wave devices in different states
        mockHass.devices = {
          device1: {
            id: 'device1',
            name: 'Z-Wave Switch 1',
            identifiers: [['zwave_js', '']],
            labels: [],
          },
          device2: {
            id: 'device2',
            name: 'Z-Wave Switch 2',
            identifiers: [['zwave_js', '']],
            labels: [],
          },
          device3: {
            id: 'device3',
            name: 'Z-Wave Switch 3',
            identifiers: [['zwave_js', '']],
            labels: [],
          },
          hubDevice: {
            id: 'hubDevice',
            name: 'Z-Wave Hub',
            identifiers: [['zwave_js', '']],
            labels: ['hub'],
          },
          otherDevice: {
            id: 'otherDevice',
            name: 'Other Device',
            manufacturer: 'Other',
            labels: [],
          },
        };

        mockHass.entities = {
          'switch.device1_node_status': {
            entity_id: 'switch.device1_node_status',
            device_id: 'device1',
          },
          'sensor.device1_last_seen': {
            entity_id: 'sensor.device1_last_seen',
            device_id: 'device1',
          },
          'switch.device2_node_status': {
            entity_id: 'switch.device2_node_status',
            device_id: 'device2',
          },
          'sensor.device2_last_seen': {
            entity_id: 'sensor.device2_last_seen',
            device_id: 'device2',
          },
          'switch.device3_node_status': {
            entity_id: 'switch.device3_node_status',
            device_id: 'device3',
          },
          'sensor.device3_last_seen': {
            entity_id: 'sensor.device3_last_seen',
            device_id: 'device3',
          },
        };

        const now = new Date();
        const oneHourAgo = new Date(now.getTime() - 3600000);
        const oneDayAgo = new Date(now.getTime() - 86400000 * 2);

        mockHass.states = {
          'switch.device1_node_status': s(
            'switch.device1_node_status',
            'alive',
          ),
          'sensor.device1_last_seen': s(
            'sensor.device1_last_seen',
            now.toISOString(),
          ),
          'switch.device2_node_status': s('switch.device2_node_status', 'dead'),
          'sensor.device2_last_seen': s(
            'sensor.device2_last_seen',
            oneDayAgo.toISOString(),
          ),
          'switch.device3_node_status': s(
            'switch.device3_node_status',
            'asleep',
          ),
          'sensor.device3_last_seen': s(
            'sensor.device3_last_seen',
            oneHourAgo.toISOString(),
          ),
        };

        // Mock getZWaveNonHubs function
        const getZWaveNonHubsStub = stub(hassUtils, 'getZWaveNonHubs');
        getZWaveNonHubsStub.returns([
          { id: 'device1', name: 'Z-Wave Switch 1' },
          { id: 'device2', name: 'Z-Wave Switch 2' },
          { id: 'device3', name: 'Z-Wave Switch 3' },
        ]);

        // Set hass property
        card.hass = mockHass;

        // Verify device categorization
        expect((card as any)._liveNodes).to.have.lengthOf(1);
        expect((card as any)._liveNodes[0].name).to.equal('Z-Wave Switch 1');

        expect((card as any)._deadNodes).to.have.lengthOf(1);
        expect((card as any)._deadNodes[0].name).to.equal('Z-Wave Switch 2');

        expect((card as any)._sleepingNodes).to.have.lengthOf(1);
        expect((card as any)._sleepingNodes[0].name).to.equal(
          'Z-Wave Switch 3',
        );

        // Restore stub after this test
        getZWaveNonHubsStub.restore();
      });

      it('should sort live nodes by last seen timestamp', () => {
        mockHass.devices = {
          device1: {
            id: 'device1',
            name_by_user: 'Z-Wave Device 1',
            identifiers: [['zwave_js', '']],
            labels: [],
          },
          device2: {
            id: 'device2',
            name_by_user: 'Z-Wave Device 2',
            identifiers: [['zwave_js', '']],
            labels: [],
          },
          device3: {
            id: 'device3',
            name_by_user: 'Z-Wave Device 3',
            identifiers: [['zwave_js', '']],
            labels: [],
          },
        };

        mockHass.entities = {
          'switch.device1_node_status': {
            entity_id: 'switch.device1_node_status',
            device_id: 'device1',
          },
          'sensor.device1_last_seen': {
            entity_id: 'sensor.device1_last_seen',
            device_id: 'device1',
          },
          'switch.device2_node_status': {
            entity_id: 'switch.device2_node_status',
            device_id: 'device2',
          },
          'sensor.device2_last_seen': {
            entity_id: 'sensor.device2_last_seen',
            device_id: 'device2',
          },
          'switch.device3_node_status': {
            entity_id: 'switch.device3_node_status',
            device_id: 'device3',
          },
          'sensor.device3_last_seen': {
            entity_id: 'sensor.device3_last_seen',
            device_id: 'device3',
          },
        };

        const now = new Date();
        const oneHourAgo = new Date(now.getTime() - 3600000);
        const twoHoursAgo = new Date(now.getTime() - 7200000);

        mockHass.states = {
          'switch.device1_node_status': s(
            'switch.device1_node_status',
            'alive',
          ),
          'sensor.device1_last_seen': s(
            'sensor.device1_last_seen',
            twoHoursAgo.toISOString(),
          ),
          'switch.device2_node_status': s(
            'switch.device2_node_status',
            'alive',
          ),
          'sensor.device2_last_seen': s(
            'sensor.device2_last_seen',
            now.toISOString(),
          ),
          'switch.device3_node_status': s(
            'switch.device3_node_status',
            'alive',
          ),
          'sensor.device3_last_seen': s(
            'sensor.device3_last_seen',
            oneHourAgo.toISOString(),
          ),
        };

        card.hass = mockHass;

        const liveNodes = (card as any)._liveNodes;
        expect(liveNodes).to.have.lengthOf(3);
        expect(liveNodes[0].name).to.equal('Z-Wave Device 2'); // most recent
        expect(liveNodes[1].name).to.equal('Z-Wave Device 3'); // second most recent
        expect(liveNodes[2].name).to.equal('Z-Wave Device 1'); // least recent
      });

      it('should sort sleeping nodes by last seen timestamp', () => {
        mockHass.devices = {
          device1: {
            id: 'device1',
            name_by_user: 'Z-Wave Device 1',
            identifiers: [['zwave_js', '']],
            labels: [],
          },
          device2: {
            id: 'device2',
            name_by_user: 'Z-Wave Device 2',
            identifiers: [['zwave_js', '']],
            labels: [],
          },
          device3: {
            id: 'device3',
            name_by_user: 'Z-Wave Device 3',
            identifiers: [['zwave_js', '']],
            labels: [],
          },
        };

        mockHass.entities = {
          'switch.device1_node_status': {
            entity_id: 'switch.device1_node_status',
            device_id: 'device1',
          },
          'sensor.device1_last_seen': {
            entity_id: 'sensor.device1_last_seen',
            device_id: 'device1',
          },
          'switch.device2_node_status': {
            entity_id: 'switch.device2_node_status',
            device_id: 'device2',
          },
          'sensor.device2_last_seen': {
            entity_id: 'sensor.device2_last_seen',
            device_id: 'device2',
          },
          'switch.device3_node_status': {
            entity_id: 'switch.device3_node_status',
            device_id: 'device3',
          },
          'sensor.device3_last_seen': {
            entity_id: 'sensor.device3_last_seen',
            device_id: 'device3',
          },
        };

        const now = new Date();
        const oneHourAgo = new Date(now.getTime() - 3600000);
        const twoHoursAgo = new Date(now.getTime() - 7200000);

        mockHass.states = {
          'switch.device1_node_status': s(
            'switch.device1_node_status',
            'asleep',
          ),
          'sensor.device1_last_seen': s(
            'sensor.device1_last_seen',
            twoHoursAgo.toISOString(),
          ),
          'switch.device2_node_status': s(
            'switch.device2_node_status',
            'asleep',
          ),
          'sensor.device2_last_seen': s(
            'sensor.device2_last_seen',
            now.toISOString(),
          ),
          'switch.device3_node_status': s(
            'switch.device3_node_status',
            'asleep',
          ),
          'sensor.device3_last_seen': s(
            'sensor.device3_last_seen',
            oneHourAgo.toISOString(),
          ),
        };

        card.hass = mockHass;

        const sleepingNodes = (card as any)._sleepingNodes;
        expect(sleepingNodes).to.have.lengthOf(3);
        expect(sleepingNodes[0].name).to.equal('Z-Wave Device 2'); // most recent
        expect(sleepingNodes[1].name).to.equal('Z-Wave Device 3'); // second most recent
        expect(sleepingNodes[2].name).to.equal('Z-Wave Device 1'); // least recent
      });

      it('should handle nodes without last seen information', () => {
        mockHass.devices = {
          device1: {
            id: 'device1',
            name_by_user: 'Z-Wave Device With LastSeen',
            identifiers: [['zwave_js', '']],
            labels: [],
          },
          device2: {
            id: 'device2',
            name_by_user: 'Z-Wave Device No LastSeen',
            identifiers: [['zwave_js', '']],
            labels: [],
          },
        };

        mockHass.entities = {
          'switch.device1_node_status': {
            entity_id: 'switch.device1_node_status',
            device_id: 'device1',
          },
          'sensor.device1_last_seen': {
            entity_id: 'sensor.device1_last_seen',
            device_id: 'device1',
          },
          'switch.device2_node_status': {
            entity_id: 'switch.device2_node_status',
            device_id: 'device2',
          },
          // No last_seen entity for device2
        };

        const now = new Date();

        mockHass.states = {
          'switch.device1_node_status': s(
            'switch.device1_node_status',
            'alive',
          ),
          'sensor.device1_last_seen': s(
            'sensor.device1_last_seen',
            now.toISOString(),
          ),
          'switch.device2_node_status': s(
            'switch.device2_node_status',
            'alive',
          ),
        };

        card.hass = mockHass;

        const liveNodes = (card as any)._liveNodes;
        expect(liveNodes).to.have.lengthOf(2);

        // Device without last_seen should still be included
        const nodeNames = liveNodes.map((node: NodeInfo) => node.name);
        expect(nodeNames).to.include('Z-Wave Device No LastSeen');

        // Device without last_seen should be sorted after devices with last_seen
        expect(liveNodes[1].name).to.equal('Z-Wave Device No LastSeen');
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

    describe('render method', () => {
      it('should show "No Z-Wave devices found" when no devices exist', async () => {
        card.hass = mockHass;
        const el = await fixture(card.render());

        const notFoundDiv = el.querySelector('.not-found')!;
        expect(notFoundDiv).to.exist;
        expect(notFoundDiv.textContent).to.equal('No Z-Wave devices found');
      });

      it('should render dead nodes section when dead nodes exist', async () => {
        mockHass.devices = {
          device1: {
            id: 'device1',
            name_by_user: 'Dead Z-Wave Device',
            identifiers: [['zwave_js', '']],
            labels: [],
          },
        };

        mockHass.entities = {
          'switch.device1_node_status': {
            entity_id: 'switch.device1_node_status',
            device_id: 'device1',
          },
          'sensor.device1_last_seen': {
            entity_id: 'sensor.device1_last_seen',
            device_id: 'device1',
          },
        };

        mockHass.states = {
          'switch.device1_node_status': s('switch.device1_node_status', 'dead'),
          'sensor.device1_last_seen': s(
            'sensor.device1_last_seen',
            new Date().toISOString(),
          ),
        };

        card.hass = mockHass;

        const el = await fixture(card.render());

        const sectionHeader = el.querySelector('.section-header')!;
        expect(sectionHeader).to.exist;
        expect(sectionHeader.textContent).to.equal('Dead Nodes');

        const nodeName = el.querySelector('.node-name')!;
        expect(nodeName).to.exist;
        expect(nodeName.textContent).to.equal('Dead Z-Wave Device');
      });

      it('should render active nodes section when live nodes exist', async () => {
        mockHass.devices = {
          device1: {
            id: 'device1',
            name_by_user: 'Live Z-Wave Device',
            identifiers: [['zwave_js', '']],
            labels: [],
          },
        };

        mockHass.entities = {
          'switch.device1_node_status': {
            entity_id: 'switch.device1_node_status',
            device_id: 'device1',
          },
          'sensor.device1_last_seen': {
            entity_id: 'sensor.device1_last_seen',
            device_id: 'device1',
          },
        };

        mockHass.states = {
          'switch.device1_node_status': s(
            'switch.device1_node_status',
            'alive',
          ),
          'sensor.device1_last_seen': s(
            'sensor.device1_last_seen',
            new Date().toISOString(),
          ),
        };

        card.hass = mockHass;

        const el = await fixture(card.render());

        const sectionHeader = el.querySelector('.section-header')!;
        expect(sectionHeader).to.exist;
        expect(sectionHeader.textContent).to.equal('Active Nodes');

        const nodeName = el.querySelector('.node-name')!;
        expect(nodeName).to.exist;
        expect(nodeName.textContent).to.equal('Live Z-Wave Device');
      });

      it('should render sleeping nodes section when sleeping nodes exist', async () => {
        mockHass.devices = {
          device1: {
            id: 'device1',
            name_by_user: 'Sleeping Z-Wave Device',
            identifiers: [['zwave_js', '']],
            labels: [],
          },
        };

        mockHass.entities = {
          'switch.device1_node_status': {
            entity_id: 'switch.device1_node_status',
            device_id: 'device1',
          },
          'sensor.device1_last_seen': {
            entity_id: 'sensor.device1_last_seen',
            device_id: 'device1',
          },
        };

        mockHass.states = {
          'switch.device1_node_status': s(
            'switch.device1_node_status',
            'asleep',
          ),
          'sensor.device1_last_seen': s(
            'sensor.device1_last_seen',
            new Date().toISOString(),
          ),
        };

        card.hass = mockHass;

        const el = await fixture(card.render());

        const sectionHeader = el.querySelector('.section-header')!;
        expect(sectionHeader).to.exist;
        expect(sectionHeader.textContent).to.equal('Sleeping Nodes');

        const nodeName = el.querySelector('.node-name')!;
        expect(nodeName).to.exist;
        expect(nodeName.textContent).to.equal('Sleeping Z-Wave Device');
      });

      it('should display multiple sections when different node types exist', async () => {
        mockHass.devices = {
          device1: {
            id: 'device1',
            name_by_user: 'Dead Device',
            identifiers: [['zwave_js', '']],
            labels: [],
          },
          device2: {
            id: 'device2',
            name_by_user: 'Live Device',
            identifiers: [['zwave_js', '']],
            labels: [],
          },
          device3: {
            id: 'device3',
            name_by_user: 'Sleeping Device',
            identifiers: [['zwave_js', '']],
            labels: [],
          },
        };

        mockHass.entities = {
          'switch.device1_node_status': {
            entity_id: 'switch.device1_node_status',
            device_id: 'device1',
          },
          'sensor.device1_last_seen': {
            entity_id: 'sensor.device1_last_seen',
            device_id: 'device1',
          },
          'switch.device2_node_status': {
            entity_id: 'switch.device2_node_status',
            device_id: 'device2',
          },
          'sensor.device2_last_seen': {
            entity_id: 'sensor.device2_last_seen',
            device_id: 'device2',
          },
          'switch.device3_node_status': {
            entity_id: 'switch.device3_node_status',
            device_id: 'device3',
          },
          'sensor.device3_last_seen': {
            entity_id: 'sensor.device3_last_seen',
            device_id: 'device3',
          },
        };

        mockHass.states = {
          'switch.device1_node_status': s('switch.device1_node_status', 'dead'),
          'sensor.device1_last_seen': s(
            'sensor.device1_last_seen',
            new Date().toISOString(),
          ),
          'switch.device2_node_status': s(
            'switch.device2_node_status',
            'alive',
          ),
          'sensor.device2_last_seen': s(
            'sensor.device2_last_seen',
            new Date().toISOString(),
          ),
          'switch.device3_node_status': s(
            'switch.device3_node_status',
            'asleep',
          ),
          'sensor.device3_last_seen': s(
            'sensor.device3_last_seen',
            new Date().toISOString(),
          ),
        };

        card.hass = mockHass;

        const el = await fixture(card.render());

        const sectionHeaders = el.querySelectorAll('.section-header');
        expect(sectionHeaders.length).to.equal(3);

        const headerTexts = Array.from(sectionHeaders).map(
          (header) => header.textContent,
        );
        expect(headerTexts).to.include('Dead Nodes');
        expect(headerTexts).to.include('Active Nodes');
        expect(headerTexts).to.include('Sleeping Nodes');

        const nodeNames = el.querySelectorAll('.node-name');
        expect(nodeNames.length).to.equal(3);

        const nameTexts = Array.from(nodeNames).map((name) => name.textContent);
        expect(nameTexts).to.include('Dead Device');
        expect(nameTexts).to.include('Live Device');
        expect(nameTexts).to.include('Sleeping Device');
      });

      it('should use the configured title when provided', async () => {
        card.setConfig({ title: 'Custom Card Title' });

        const el = await fixture(card.render());
        const cardHeader = el.getAttribute('header');

        expect(cardHeader).to.equal('Custom Card Title');
      });

      it('should use default title when not provided in config', async () => {
        card.setConfig({} as Config);

        const el = await fixture(card.render());
        const cardHeader = el.getAttribute('header');

        expect(cardHeader).to.equal('Z-Wave Nodes Status');
      });

      it('should splice arrays to length 1 when in preview mode', async () => {
        // Create multiple devices of each type
        mockHass.devices = {
          device1: {
            id: 'device1',
            name_by_user: 'Dead Device 1',
            identifiers: [['zwave_js', '']],
            labels: [],
          },
          device2: {
            id: 'device2',
            name_by_user: 'Dead Device 2',
            identifiers: [['zwave_js', '']],
            labels: [],
          },
          device3: {
            id: 'device3',
            name_by_user: 'Live Device 1',
            identifiers: [['zwave_js', '']],
            labels: [],
          },
          device4: {
            id: 'device4',
            name_by_user: 'Live Device 2',
            identifiers: [['zwave_js', '']],
            labels: [],
          },
          device5: {
            id: 'device5',
            name_by_user: 'Sleeping Device 1',
            identifiers: [['zwave_js', '']],
            labels: [],
          },
          device6: {
            id: 'device6',
            name_by_user: 'Sleeping Device 2',
            identifiers: [['zwave_js', '']],
            labels: [],
          },
        };

        mockHass.entities = {
          ...Object.keys(mockHass.devices).reduce(
            (acc, deviceId) => ({
              ...acc,
              [`switch.${deviceId}_node_status`]: {
                entity_id: `switch.${deviceId}_node_status`,
                device_id: deviceId,
              },
              [`sensor.${deviceId}_last_seen`]: {
                entity_id: `sensor.${deviceId}_last_seen`,
                device_id: deviceId,
              },
            }),
            {},
          ),
        };

        mockHass.states = {
          'switch.device1_node_status': s('switch.device1_node_status', 'dead'),
          'switch.device2_node_status': s('switch.device2_node_status', 'dead'),
          'switch.device3_node_status': s(
            'switch.device3_node_status',
            'alive',
          ),
          'switch.device4_node_status': s(
            'switch.device4_node_status',
            'alive',
          ),
          'switch.device5_node_status': s(
            'switch.device5_node_status',
            'asleep',
          ),
          'switch.device6_node_status': s(
            'switch.device6_node_status',
            'asleep',
          ),
          ...Object.keys(mockHass.devices).reduce(
            (acc, deviceId) => ({
              ...acc,
              [`sensor.${deviceId}_last_seen`]: s(
                `sensor.${deviceId}_last_seen`,
                new Date().toISOString(),
              ),
            }),
            {},
          ),
        };

        card.hass = mockHass;

        // Mock isPreview to return true
        Object.defineProperty(card, 'isPreview', {
          get: () => true,
        });

        const el = await fixture(card.render());

        // Check that each section only shows one node
        expect((card as any)._deadNodes)
          .to.be.an('array')
          .that.has.lengthOf(1);
        expect((card as any)._liveNodes)
          .to.be.an('array')
          .that.has.lengthOf(1);
        expect((card as any)._sleepingNodes)
          .to.be.an('array')
          .that.has.lengthOf(1);

        // Verify specific nodes that should be shown
        const nodeNames = Array.from(el.querySelectorAll('.node-name')).map(
          (node) => node.textContent,
        );
        expect(nodeNames).to.include('Dead Device 1');
        expect(nodeNames).to.include('Live Device 1');
        expect(nodeNames).to.include('Sleeping Device 1');

        // Verify that second devices are not shown
        expect(nodeNames).to.not.include('Dead Device 2');
        expect(nodeNames).to.not.include('Live Device 2');
        expect(nodeNames).to.not.include('Sleeping Device 2');

        // Verify action handlers are attached
        expect(actionHandlerStub.called).to.be.true;
        expect(handleClickActionStub.called).to.be.true;
      });
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
    });
  });
});
