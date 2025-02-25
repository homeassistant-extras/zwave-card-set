import { ZWaveHubCard } from '@hub-card/card';
import type { Config } from '@hub-card/types';
import { fixture, fixtureCleanup } from '@open-wc/testing-helpers';
import type { Device, HomeAssistant } from '@type/homeassistant';
import { expect } from 'chai';

describe('ZWaveHubCard', () => {
  describe('card.ts', () => {
    let card: ZWaveHubCard;
    let mockHass: HomeAssistant;
    let mockConfig: Config;

    beforeEach(() => {
      // Create a new card instance for each test
      card = new ZWaveHubCard();

      // Basic config setup
      mockConfig = {};

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
        const config: Config = {};
        card.setConfig(config);
        expect((card as any)._config).to.equal(config);
      });
    });

    describe('getConfigElement', () => {
      it('should return correct editor element', () => {
        const editor = ZWaveHubCard.getConfigElement();
        expect(editor.tagName.toLowerCase()).to.equal('zwave-basic-editor');
      });
    });

    describe('hass property setter', () => {
      it('should set error when no Z-Wave hub is found', () => {
        // Setup mock with no Z-Wave hub devices
        card.hass = mockHass;

        // Check error message
        expect((card as any)._hub.error).to.equal('No Z-Wave hub found.');
      });

      it('should set error when multiple Z-Wave hubs are found', () => {
        // Create mock data with multiple Z-Wave hub devices
        mockHass.devices = {
          hub1: {
            id: 'hub1',
            name_by_user: 'Z-Wave Hub 1',
            manufacturer: 'ZWave',
            labels: ['hub'],
          },
          hub2: {
            id: 'hub2',
            name_by_user: 'Z-Wave Hub 2',
            manufacturer: 'ZWave',
            labels: ['hub'],
          },
        };

        card.hass = mockHass;

        // Check error message
        expect((card as any)._hub.error).to.equal(
          'Multiple Z-Wave hubs found. Please specify one.',
        );
      });

      it('should identify and configure a single Z-Wave hub correctly', () => {
        // Create mock data with a single Z-Wave hub
        mockHass.devices = {
          hub1: {
            id: 'hub1',
            name_by_user: 'Z-Wave Hub',
            manufacturer: 'ZWave',
            labels: ['hub'],
          },
          device1: {
            id: 'device1',
            name_by_user: 'Z-Wave Device 1',
            manufacturer: 'ZWave',
            labels: [],
          },
          otherDevice: {
            id: 'otherDevice',
            name_by_user: 'Other Device',
            manufacturer: 'Other',
            labels: [],
          },
        };

        mockHass.entities = {
          'sensor.hub1_status': {
            entity_id: 'sensor.hub1_status',
            device_id: 'hub1',
          },
          'sensor.hub1_rssi_1': {
            entity_id: 'sensor.hub1_rssi_1',
            device_id: 'hub1',
          },
        };

        mockHass.states = {
          'sensor.hub1_status': {
            entity_id: 'sensor.hub1_status',
            state: 'online',
            attributes: {},
          },
          'sensor.hub1_rssi_1': {
            entity_id: 'sensor.hub1_rssi_1',
            state: '-65',
            attributes: {},
          },
        };

        card.hass = mockHass;

        // Verify hub identification
        expect((card as any)._hub.error).to.be.empty;
        expect((card as any)._hub.name).to.equal('Z-Wave Hub');

        // Verify status entity
        expect((card as any)._hub.statusEntity.entity_id).to.equal(
          'sensor.hub1_status',
        );
        expect((card as any)._hub.statusEntity.state).to.equal('online');

        // Verify RSSI entities
        expect((card as any)._hub.rssiEntities).to.have.lengthOf(1);
        expect((card as any)._hub.rssiEntities[0].entity_id).to.equal(
          'sensor.hub1_rssi_1',
        );

        // Verify connected devices
        expect((card as any)._hub.connectedDevices).to.have.lengthOf(1);
        expect((card as any)._hub.connectedDevices[0].name_by_user).to.equal(
          'Z-Wave Device 1',
        );
      });

      it('should use the device name when name_by_user is not available', () => {
        mockHass.devices = {
          hub1: {
            id: 'hub1',
            name: 'Z-Wave Hub Device',
            manufacturer: 'ZWave',
            labels: ['hub'],
          },
        };

        card.hass = mockHass;

        expect((card as any)._hub.name).to.equal('Z-Wave Hub Device');
      });

      it('should fallback to "Z-Wave Hub" when no name is available', () => {
        mockHass.devices = {
          hub1: {
            id: 'hub1',
            manufacturer: 'ZWave',
            labels: ['hub'],
          },
        };

        card.hass = mockHass;

        expect((card as any)._hub.name).to.equal('Z-Wave Hub');
      });

      it('should collect all rssi entities related to the hub', () => {
        mockHass.devices = {
          hub1: {
            id: 'hub1',
            name_by_user: 'Z-Wave Hub',
            manufacturer: 'ZWave',
            labels: ['hub'],
          },
        };

        mockHass.entities = {
          'sensor.hub1_rssi_1': {
            entity_id: 'sensor.hub1_rssi_1',
            device_id: 'hub1',
          },
          'sensor.hub1_rssi_2': {
            entity_id: 'sensor.hub1_rssi_2',
            device_id: 'hub1',
          },
        };

        mockHass.states = {
          'sensor.hub1_rssi_1': {
            entity_id: 'sensor.hub1_rssi_1',
            state: '-65',
            attributes: {},
          },
          'sensor.hub1_rssi_2': {
            entity_id: 'sensor.hub1_rssi_2',
            state: '-75',
            attributes: {},
          },
        };

        card.hass = mockHass;

        expect((card as any)._hub.rssiEntities).to.have.lengthOf(2);
        expect((card as any)._hub.rssiEntities[0].state).to.equal('-65');
        expect((card as any)._hub.rssiEntities[1].state).to.equal('-75');
      });
    });

    describe('_getRssiClass', () => {
      it('should return "" for N/A RSSI', () => {
        const rssiClass = (card as any)._getRssiClass('N/A');
        expect(rssiClass).to.equal('');
      });

      it('should return "" for invalid RSSI', () => {
        const rssiClass = (card as any)._getRssiClass('invalid');
        expect(rssiClass).to.equal('');
      });

      it('should return "status-good" for RSSI better than -60dBm', () => {
        const rssiClass = (card as any)._getRssiClass('-55');
        expect(rssiClass).to.equal('status-good');
      });

      it('should return "status-warning" for RSSI between -60dBm and -80dBm', () => {
        const rssiClass = (card as any)._getRssiClass('-70');
        expect(rssiClass).to.equal('status-warning');
      });

      it('should return "status-bad" for RSSI worse than -80dBm', () => {
        const rssiClass = (card as any)._getRssiClass('-85');
        expect(rssiClass).to.equal('status-bad');
      });
    });

    describe('_toggleExpanded', () => {
      it('should toggle the expanded state', () => {
        expect((card as any).expanded).to.be.false;

        (card as any)._toggleExpanded();
        expect((card as any).expanded).to.be.true;

        (card as any)._toggleExpanded();
        expect((card as any).expanded).to.be.false;
      });
    });

    describe('render method', () => {
      it('should show "Loading..." when hub is not initialized', async () => {
        (card as any)._hub = null;

        const el = await fixture(card.render());
        expect(el.textContent?.trim()).to.equal('Loading...');
      });

      it('should show error message when hub has an error', async () => {
        (card as any)._hub = { error: 'Test error message' };

        const el = await fixture(card.render());
        expect(el.querySelector('.card-content')?.textContent).to.equal(
          'Test error message',
        );
      });

      it('should render hub name in header', async () => {
        (card as any)._hub = {
          name: 'My Z-Wave Hub',
          statusEntity: {
            state: 'online',
            entity_id: 'sensor.hub_status',
            attributes: {},
          },
          rssiEntities: [],
          connectedDevices: [],
          error: '',
        };

        (card as any)._hass = mockHass;

        const el = await fixture(card.render());
        expect(el.querySelector('.name')?.textContent).to.equal(
          'My Z-Wave Hub',
        );
      });

      it('should render status element with proper state', async () => {
        const statusEntity = {
          state: 'online',
          entity_id: 'sensor.hub_status',
          attributes: {},
        };

        (card as any)._hub = {
          name: 'My Z-Wave Hub',
          statusEntity: statusEntity,
          rssiEntities: [],
          connectedDevices: [],
          error: '',
        };

        (card as any)._hass = mockHass;

        const el = await fixture(card.render());

        const statusRow = el.querySelector('.status-row');
        expect(statusRow).to.exist;
        expect(statusRow?.querySelector('.status-label')?.textContent).to.equal(
          'Hub Status:',
        );

        const stateIcon = statusRow?.querySelector('ha-state-icon');
        expect(stateIcon).to.exist;

        const stateDisplay = statusRow?.querySelector('state-display');
        expect(stateDisplay).to.exist;
      });

      it('should render RSSI with proper class based on value', async () => {
        const rssiEntity = {
          state: '-55',
          entity_id: 'sensor.hub_rssi',
          attributes: {},
        };

        (card as any)._hub = {
          name: 'My Z-Wave Hub',
          statusEntity: {
            state: 'online',
            entity_id: 'sensor.hub_status',
            attributes: {},
          },
          rssiEntities: [rssiEntity],
          connectedDevices: [],
          error: '',
        };

        (card as any)._hass = mockHass;

        const el = await fixture(card.render());

        const rssiValue = el.querySelector('.status-value');
        expect(rssiValue).to.exist;
        expect(rssiValue?.classList.contains('status-good')).to.be.true;
        expect(rssiValue?.textContent?.trim()).to.equal('-55 dBm');
      });

      it('should render connected devices count', async () => {
        const devices = [
          { id: 'device1', name_by_user: 'Device 1' },
          { id: 'device2', name_by_user: 'Device 2' },
        ] as Device[];

        (card as any)._hub = {
          name: 'My Z-Wave Hub',
          statusEntity: {
            state: 'online',
            entity_id: 'sensor.hub_status',
            attributes: {},
          },
          rssiEntities: [],
          connectedDevices: devices,
          error: '',
        };

        (card as any)._hass = mockHass;

        const el = await fixture(card.render());

        const devicesCount = el.querySelector('.devices-count');
        expect(devicesCount).to.exist;
        expect(devicesCount?.textContent?.trim()).to.equal(
          '2 Connected Devices',
        );
      });

      it('should not show devices list when not expanded', async () => {
        const devices = [
          { id: 'device1', name_by_user: 'Device 1' },
          { id: 'device2', name_by_user: 'Device 2' },
        ] as Device[];

        (card as any)._hub = {
          name: 'My Z-Wave Hub',
          statusEntity: {
            state: 'online',
            entity_id: 'sensor.hub_status',
            attributes: {},
          },
          rssiEntities: [],
          connectedDevices: devices,
          error: '',
        };

        (card as any)._hass = mockHass;
        (card as any).expanded = false;

        const el = await fixture(card.render());

        const devicesList = el.querySelector('.devices-list');
        expect(devicesList).to.not.exist;
      });

      it('should show devices list when expanded', async () => {
        const devices = [
          { id: 'device1', name_by_user: 'Device 1' },
          { id: 'device2', name_by_user: 'Device 2' },
        ] as Device[];

        (card as any)._hub = {
          name: 'My Z-Wave Hub',
          statusEntity: {
            state: 'online',
            entity_id: 'sensor.hub_status',
            attributes: {},
          },
          rssiEntities: [],
          connectedDevices: devices,
          error: '',
        };

        (card as any)._hass = mockHass;
        (card as any).expanded = true;

        const el = await fixture(card.render());

        const devicesList = el.querySelector('.devices-list');
        expect(devicesList).to.exist;

        const deviceItems = devicesList?.querySelectorAll('.device-item');
        expect(deviceItems?.length).to.equal(2);

        const deviceNames = Array.from(deviceItems || []).map((item) =>
          item.textContent?.trim(),
        );
        expect(deviceNames).to.include('Device 1');
        expect(deviceNames).to.include('Device 2');
      });

      it('should use device name when name_by_user is not available in connected devices', async () => {
        const devices = [{ id: 'device1', name: 'Device 1 Name' }] as Device[];

        (card as any)._hub = {
          name: 'My Z-Wave Hub',
          statusEntity: {
            state: 'online',
            entity_id: 'sensor.hub_status',
            attributes: {},
          },
          rssiEntities: [],
          connectedDevices: devices,
          error: '',
        };

        (card as any)._hass = mockHass;
        (card as any).expanded = true;

        const el = await fixture(card.render());

        const devicesList = el.querySelector('.devices-list');
        const deviceItems = devicesList?.querySelectorAll('.device-item');
        const deviceNames = Array.from(deviceItems || []).map((item) =>
          item.textContent?.trim(),
        );

        expect(deviceNames).to.include('Device 1 Name');
      });
    });
  });
});
