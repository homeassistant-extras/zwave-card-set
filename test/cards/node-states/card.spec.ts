import { ZoozNodesStatus } from '@node-states/card';
import type { Config, HomeAssistant, NodeInfo } from '@node-states/types';
import { fixture, fixtureCleanup } from '@open-wc/testing-helpers';
import { expect } from 'chai';
import { nothing } from 'lit';

describe('ZoozNodesStatus', () => {
  let card: ZoozNodesStatus;
  let mockHass: HomeAssistant;
  let mockConfig: Config;

  beforeEach(() => {
    // Create a new card instance for each test
    card = new ZoozNodesStatus();

    // Basic config setup
    mockConfig = {
      title: 'Test Zooz Nodes',
    };

    // Basic mock Hass setup with empty collections
    mockHass = {
      states: {},
      entities: {},
      devices: {},
    };

    // Initialize the card
    card.setConfig(mockConfig);
  });

  afterEach(async () => {
    await fixtureCleanup();
  });

  describe('setConfig', () => {
    it('should set the configuration correctly', () => {
      const config: Config = { title: 'Custom Title' };
      card.setConfig(config);
      expect((card as any)._config).to.equal(config);
    });
  });

  describe('hass property setter', () => {
    it('should not process anything when no Zooz devices exist', () => {
      // Setup mock with no Zooz devices
      card.hass = mockHass;

      // Check internal state
      expect((card as any)._deadNodes).to.be.an('array').that.is.empty;
      expect((card as any)._liveNodes).to.be.an('array').that.is.empty;
      expect((card as any)._sleepingNodes).to.be.an('array').that.is.empty;
    });

    it('should identify and categorize Zooz devices correctly', () => {
      // Create mock data with Zooz devices in different states
      mockHass.devices = {
        device1: {
          id: 'device1',
          name_by_user: 'Zooz Switch 1',
          manufacturer: 'Zooz',
          labels: [],
        },
        device2: {
          id: 'device2',
          name_by_user: 'Zooz Switch 2',
          manufacturer: 'Zooz',
          labels: [],
        },
        device3: {
          id: 'device3',
          name_by_user: 'Zooz Switch 3',
          manufacturer: 'Zooz',
          labels: [],
        },
        hubDevice: {
          id: 'hubDevice',
          name_by_user: 'Zooz Hub',
          manufacturer: 'Zooz',
          labels: ['hub'],
        },
        otherDevice: {
          id: 'otherDevice',
          name_by_user: 'Other Device',
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
        'switch.device1_node_status': {
          entity_id: 'switch.device1_node_status',
          state: 'alive',
        },
        'sensor.device1_last_seen': {
          entity_id: 'sensor.device1_last_seen',
          state: now.toISOString(),
        },
        'switch.device2_node_status': {
          entity_id: 'switch.device2_node_status',
          state: 'dead',
        },
        'sensor.device2_last_seen': {
          entity_id: 'sensor.device2_last_seen',
          state: oneDayAgo.toISOString(),
        },
        'switch.device3_node_status': {
          entity_id: 'switch.device3_node_status',
          state: 'asleep',
        },
        'sensor.device3_last_seen': {
          entity_id: 'sensor.device3_last_seen',
          state: oneHourAgo.toISOString(),
        },
      };

      // Set hass property
      card.hass = mockHass;

      // Verify device categorization
      expect((card as any)._liveNodes).to.have.lengthOf(1);
      expect((card as any)._liveNodes[0].name).to.equal('Zooz Switch 1');

      expect((card as any)._deadNodes).to.have.lengthOf(1);
      expect((card as any)._deadNodes[0].name).to.equal('Zooz Switch 2');

      expect((card as any)._sleepingNodes).to.have.lengthOf(1);
      expect((card as any)._sleepingNodes[0].name).to.equal('Zooz Switch 3');
    });

    it('should sort live nodes by last seen timestamp', () => {
      mockHass.devices = {
        device1: {
          id: 'device1',
          name_by_user: 'Zooz Device 1',
          manufacturer: 'Zooz',
          labels: [],
        },
        device2: {
          id: 'device2',
          name_by_user: 'Zooz Device 2',
          manufacturer: 'Zooz',
          labels: [],
        },
        device3: {
          id: 'device3',
          name_by_user: 'Zooz Device 3',
          manufacturer: 'Zooz',
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
        'switch.device1_node_status': {
          entity_id: 'switch.device1_node_status',
          state: 'alive',
        },
        'sensor.device1_last_seen': {
          entity_id: 'sensor.device1_last_seen',
          state: twoHoursAgo.toISOString(),
        },
        'switch.device2_node_status': {
          entity_id: 'switch.device2_node_status',
          state: 'alive',
        },
        'sensor.device2_last_seen': {
          entity_id: 'sensor.device2_last_seen',
          state: now.toISOString(),
        },
        'switch.device3_node_status': {
          entity_id: 'switch.device3_node_status',
          state: 'alive',
        },
        'sensor.device3_last_seen': {
          entity_id: 'sensor.device3_last_seen',
          state: oneHourAgo.toISOString(),
        },
      };

      card.hass = mockHass;

      const liveNodes = (card as any)._liveNodes;
      expect(liveNodes).to.have.lengthOf(3);
      expect(liveNodes[0].name).to.equal('Zooz Device 2'); // most recent
      expect(liveNodes[1].name).to.equal('Zooz Device 3'); // second most recent
      expect(liveNodes[2].name).to.equal('Zooz Device 1'); // least recent
    });

    it('should sort sleeping nodes by last seen timestamp', () => {
      mockHass.devices = {
        device1: {
          id: 'device1',
          name_by_user: 'Zooz Device 1',
          manufacturer: 'Zooz',
          labels: [],
        },
        device2: {
          id: 'device2',
          name_by_user: 'Zooz Device 2',
          manufacturer: 'Zooz',
          labels: [],
        },
        device3: {
          id: 'device3',
          name_by_user: 'Zooz Device 3',
          manufacturer: 'Zooz',
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
        'switch.device1_node_status': {
          entity_id: 'switch.device1_node_status',
          state: 'asleep',
        },
        'sensor.device1_last_seen': {
          entity_id: 'sensor.device1_last_seen',
          state: twoHoursAgo.toISOString(),
        },
        'switch.device2_node_status': {
          entity_id: 'switch.device2_node_status',
          state: 'asleep',
        },
        'sensor.device2_last_seen': {
          entity_id: 'sensor.device2_last_seen',
          state: now.toISOString(),
        },
        'switch.device3_node_status': {
          entity_id: 'switch.device3_node_status',
          state: 'asleep',
        },
        'sensor.device3_last_seen': {
          entity_id: 'sensor.device3_last_seen',
          state: oneHourAgo.toISOString(),
        },
      };

      card.hass = mockHass;

      const sleepingNodes = (card as any)._sleepingNodes;
      expect(sleepingNodes).to.have.lengthOf(3);
      expect(sleepingNodes[0].name).to.equal('Zooz Device 2'); // most recent
      expect(sleepingNodes[1].name).to.equal('Zooz Device 3'); // second most recent
      expect(sleepingNodes[2].name).to.equal('Zooz Device 1'); // least recent
    });

    it('should handle nodes without last seen information', () => {
      mockHass.devices = {
        device1: {
          id: 'device1',
          name_by_user: 'Zooz Device With LastSeen',
          manufacturer: 'Zooz',
          labels: [],
        },
        device2: {
          id: 'device2',
          name_by_user: 'Zooz Device No LastSeen',
          manufacturer: 'Zooz',
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
        'switch.device1_node_status': {
          entity_id: 'switch.device1_node_status',
          state: 'alive',
        },
        'sensor.device1_last_seen': {
          entity_id: 'sensor.device1_last_seen',
          state: now.toISOString(),
        },
        'switch.device2_node_status': {
          entity_id: 'switch.device2_node_status',
          state: 'alive',
        },
      };

      card.hass = mockHass;

      const liveNodes = (card as any)._liveNodes;
      expect(liveNodes).to.have.lengthOf(2);

      // Device without last_seen should still be included
      const nodeNames = liveNodes.map((node: NodeInfo) => node.name);
      expect(nodeNames).to.include('Zooz Device No LastSeen');

      // Device without last_seen should be sorted after devices with last_seen
      expect(liveNodes[1].name).to.equal('Zooz Device No LastSeen');
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
    it('should show "No Zooz devices found" when no devices exist', async () => {
      card.hass = mockHass;
      const el = await fixture(card.render());

      const notFoundDiv = el.querySelector('.not-found')!;
      expect(notFoundDiv).to.exist;
      expect(notFoundDiv.textContent).to.equal('No Zooz devices found');
    });

    it('should render dead nodes section when dead nodes exist', async () => {
      mockHass.devices = {
        device1: {
          id: 'device1',
          name_by_user: 'Dead Zooz Device',
          manufacturer: 'Zooz',
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
        'switch.device1_node_status': {
          entity_id: 'switch.device1_node_status',
          state: 'dead',
        },
        'sensor.device1_last_seen': {
          entity_id: 'sensor.device1_last_seen',
          state: new Date().toISOString(),
        },
      };

      card.hass = mockHass;

      const el = await fixture(card.render());

      const sectionHeader = el.querySelector('.section-header')!;
      expect(sectionHeader).to.exist;
      expect(sectionHeader.textContent).to.equal('Dead Nodes');

      const nodeName = el.querySelector('.node-name')!;
      expect(nodeName).to.exist;
      expect(nodeName.textContent).to.equal('Dead Zooz Device');
    });

    it('should render active nodes section when live nodes exist', async () => {
      mockHass.devices = {
        device1: {
          id: 'device1',
          name_by_user: 'Live Zooz Device',
          manufacturer: 'Zooz',
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
        'switch.device1_node_status': {
          entity_id: 'switch.device1_node_status',
          state: 'alive',
        },
        'sensor.device1_last_seen': {
          entity_id: 'sensor.device1_last_seen',
          state: new Date().toISOString(),
        },
      };

      card.hass = mockHass;

      const el = await fixture(card.render());

      const sectionHeader = el.querySelector('.section-header')!;
      expect(sectionHeader).to.exist;
      expect(sectionHeader.textContent).to.equal('Active Nodes');

      const nodeName = el.querySelector('.node-name')!;
      expect(nodeName).to.exist;
      expect(nodeName.textContent).to.equal('Live Zooz Device');
    });

    it('should render sleeping nodes section when sleeping nodes exist', async () => {
      mockHass.devices = {
        device1: {
          id: 'device1',
          name_by_user: 'Sleeping Zooz Device',
          manufacturer: 'Zooz',
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
        'switch.device1_node_status': {
          entity_id: 'switch.device1_node_status',
          state: 'asleep',
        },
        'sensor.device1_last_seen': {
          entity_id: 'sensor.device1_last_seen',
          state: new Date().toISOString(),
        },
      };

      card.hass = mockHass;

      const el = await fixture(card.render());

      const sectionHeader = el.querySelector('.section-header')!;
      expect(sectionHeader).to.exist;
      expect(sectionHeader.textContent).to.equal('Sleeping Nodes');

      const nodeName = el.querySelector('.node-name')!;
      expect(nodeName).to.exist;
      expect(nodeName.textContent).to.equal('Sleeping Zooz Device');
    });

    it('should display multiple sections when different node types exist', async () => {
      mockHass.devices = {
        device1: {
          id: 'device1',
          name_by_user: 'Dead Device',
          manufacturer: 'Zooz',
          labels: [],
        },
        device2: {
          id: 'device2',
          name_by_user: 'Live Device',
          manufacturer: 'Zooz',
          labels: [],
        },
        device3: {
          id: 'device3',
          name_by_user: 'Sleeping Device',
          manufacturer: 'Zooz',
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
        'switch.device1_node_status': {
          entity_id: 'switch.device1_node_status',
          state: 'dead',
        },
        'sensor.device1_last_seen': {
          entity_id: 'sensor.device1_last_seen',
          state: new Date().toISOString(),
        },
        'switch.device2_node_status': {
          entity_id: 'switch.device2_node_status',
          state: 'alive',
        },
        'sensor.device2_last_seen': {
          entity_id: 'sensor.device2_last_seen',
          state: new Date().toISOString(),
        },
        'switch.device3_node_status': {
          entity_id: 'switch.device3_node_status',
          state: 'asleep',
        },
        'sensor.device3_last_seen': {
          entity_id: 'sensor.device3_last_seen',
          state: new Date().toISOString(),
        },
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

      expect(cardHeader).to.equal('Zooz Nodes Status');
    });
  });

  describe('_renderNode method', () => {
    it('should render node with status icon and last seen display', async () => {
      const mockNode: NodeInfo = {
        name: 'Test Node',
        device_id: 'test-device',
        statusState: { entity_id: 'switch.test_node_status', state: 'alive' },
        lastSeenState: {
          entity_id: 'sensor.test_node_last_seen',
          state: new Date().toISOString(),
        },
        lastSeen: Date.now(),
      };

      card.hass = mockHass; // Need to set this for ha-state-icon to work

      const el = await fixture((card as any)._renderNode(mockNode));

      const nameElement = el.querySelector('.node-name')!;
      expect(nameElement).to.exist;
      expect(nameElement.textContent).to.equal('Test Node');

      const stateIcon = el.querySelector('ha-state-icon');
      expect(stateIcon).to.exist;

      const stateDisplay = el.querySelector('state-display');
      expect(stateDisplay).to.exist;
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
  });
});
