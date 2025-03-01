import * as actionHandlerModule from '@common/action-handler';
import { ZWaveDeviceInfo } from '@node/card';
import type { Config } from '@node/types';
import { fixture, fixtureCleanup } from '@open-wc/testing-helpers';
import type { ActionHandlerEvent } from '@type/action';
import type { HomeAssistant, State } from '@type/homeassistant';
import * as hassUtils from '@util/hass';
import { expect } from 'chai';
import { nothing, type TemplateResult } from 'lit';
import { match, stub } from 'sinon';

// Helper function to create state objects for testing
const createState = (
  entity_id: string,
  state: string,
  attributes: Record<string, any> = {},
): State => {
  return {
    entity_id,
    state,
    attributes,
  };
};

describe('ZWaveDeviceInfo', () => {
  let card: ZWaveDeviceInfo;
  let mockHass: HomeAssistant;
  let mockConfig: Config;
  let actionHandlerStub: sinon.SinonStub;
  let handleClickActionStub: sinon.SinonStub;
  let getZWaveNonHubsStub: sinon.SinonStub;

  beforeEach(() => {
    card = new ZWaveDeviceInfo();

    mockConfig = {
      device_id: 'test_device_id',
      title: 'Test Device',
      icon: 'mdi:test',
    };

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

    getZWaveNonHubsStub = stub(hassUtils, 'getZWaveNonHubs');

    mockHass = {
      states: {},
      entities: {
        'update.test_device_firmware': {
          entity_id: 'update.test_device_firmware',
          device_id: 'test_device_id',
          entity_category: 'config',
        },
        'sensor.test_device_last_seen': {
          entity_id: 'sensor.test_device_last_seen',
          device_id: 'test_device_id',
          entity_category: 'diagnostic',
        },
        'sensor.test_device_node_status': {
          entity_id: 'sensor.test_device_node_status',
          device_id: 'test_device_id',
          entity_category: 'diagnostic',
        },
        'sensor.test_device_battery_level': {
          entity_id: 'sensor.test_device_battery_level',
          device_id: 'test_device_id',
          entity_category: 'diagnostic',
        },
        'sensor.test_device_test_1': {
          entity_id: 'sensor.test_device_test_1',
          device_id: 'test_device_id',
        },
        'sensor.test_device_test_2': {
          entity_id: 'sensor.test_device_test_2',
          device_id: 'test_device_id',
        },
        'switch.test_device_test_1': {
          entity_id: 'switch.test_device_test_1',
          device_id: 'test_device_id',
        },
        // Add controller status entity for testing controller detection
        'sensor.test_controller_status': {
          entity_id: 'sensor.test_controller_status',
          device_id: 'test_controller_id',
          translation_key: 'controller_status',
        },
      },
      devices: {
        test_device_id: {
          id: 'test_device_id',
          name_by_user: 'Test Device',
          manufacturer: 'Test Manufacturer',
          model: 'Test Model',
          labels: [],
          identifiers: [['zwave_js', '1234']],
        },
        test_controller_id: {
          id: 'test_controller_id',
          name_by_user: 'Test Controller',
          manufacturer: 'Test Manufacturer',
          model: 'Controller Model',
          labels: ['hub'],
          identifiers: [['zwave_js', '5678']],
        },
        non_zwave_device_id: {
          id: 'non_zwave_device_id',
          name_by_user: 'Non Z-Wave Device',
          manufacturer: 'Other Manufacturer',
          model: 'Other Model',
          identifiers: [['other_protocol', '9012']],
        },
      },
    };

    card.setConfig(mockConfig);
  });

  afterEach(async () => {
    actionHandlerStub.restore();
    handleClickActionStub.restore();
    getZWaveNonHubsStub.restore();
    await fixtureCleanup();
  });

  describe('card.ts', () => {
    describe('hass property setter', () => {
      it('should not set sensor if no config', () => {
        card.setConfig(undefined as any as Config);
        card.hass = mockHass;
        expect((card as any)._sensor).to.be.undefined;
      });

      it('should not set sensor if device is not a Z-Wave device', () => {
        card.setConfig({ device_id: 'non_zwave_device_id' });
        card.hass = mockHass;
        expect((card as any)._sensor).to.be.undefined;
      });

      it('should initialize entities array', () => {
        card.hass = mockHass;
        expect((card as any)._sensor.entities).to.be.an('array');
      });

      it('should set manufacturer and model from device', () => {
        card.hass = mockHass;
        expect((card as any)._sensor.manufacturer).to.equal(
          'Test Manufacturer',
        );
        expect((card as any)._sensor.model).to.equal('Test Model');
      });

      it('should detect controller status correctly', () => {
        // Use a normal device - should not be a controller
        card.setConfig({ device_id: 'test_device_id' });
        card.hass = mockHass;
        expect((card as any)._sensor.isController).to.not.be.true;

        // Use a controller device - should be identified as a controller
        card.setConfig({ device_id: 'test_controller_id' });
        card.hass = mockHass;
        expect((card as any)._sensor.isController).to.be.true;
      });

      it('should identify and set common states', () => {
        mockHass.states['update.test_device_firmware'] = createState(
          'update.test_device_firmware',
          'available',
        );
        mockHass.states['sensor.test_device_last_seen'] = createState(
          'sensor.test_device_last_seen',
          '2024-02-19T12:34:56Z',
        );
        mockHass.states['sensor.test_device_node_status'] = createState(
          'sensor.test_device_node_status',
          'online',
        );
        mockHass.states['sensor.test_device_battery_level'] = createState(
          'sensor.test_device_battery_level',
          '75',
          { device_class: 'battery' },
        );

        card.hass = mockHass;

        expect((card as any)._sensor.firmwareState).to.exist;
        expect((card as any)._sensor.lastSeenState).to.exist;
        expect((card as any)._sensor.nodeStatusState).to.exist;
        expect((card as any)._sensor.batteryState).to.exist;
        expect((card as any)._sensor.batteryState.state).to.equal('75');
      });

      it('should process entities that are not special categories', () => {
        mockHass.states['sensor.test_device_test_1'] = createState(
          'sensor.test_device_test_1',
          'test1',
        );
        mockHass.states['sensor.test_device_test_2'] = createState(
          'sensor.test_device_test_2',
          'test2',
        );
        mockHass.states['switch.test_device_test_1'] = createState(
          'switch.test_device_test_1',
          'on',
        );

        card.hass = mockHass;

        // Should find entities that aren't in diagnostic or config categories
        expect((card as any)._sensor.entities).to.have.lengthOf(3);
      });

      it('should set sensor name from device name_by_user if available', () => {
        mockHass.devices.test_device_id!.name_by_user = 'Custom Device Name';
        mockHass.devices.test_device_id!.name = 'Default Device Name';

        card.hass = mockHass;

        expect((card as any)._sensor.name).to.equal('Custom Device Name');
      });

      it('should fallback to device name if name_by_user not available', () => {
        mockHass.devices.test_device_id!.name_by_user = undefined;
        mockHass.devices.test_device_id!.name = 'Default Device Name';

        card.hass = mockHass;

        expect((card as any)._sensor.name).to.equal('Default Device Name');
      });
    });

    describe('render method', () => {
      it('should return nothing when sensor is not initialized', () => {
        (card as any)._sensor = undefined;
        const result = card.render();
        expect(result).to.equal(nothing);
      });

      it('should render hub card when device is a controller', async () => {
        (card as any)._sensor = {
          name: 'Test Controller',
          isController: true,
          entities: [],
        };

        const el = await fixture(card.render() as TemplateResult);

        expect(el.tagName.toLowerCase()).to.equal('zwave-controller');
      });

      it('should render all card sections when data is available', async () => {
        mockHass.states['update.test_device_firmware'] = createState(
          'update.test_device_firmware',
          'available',
        );
        mockHass.states['sensor.test_device_last_seen'] = createState(
          'sensor.test_device_last_seen',
          'recent',
        );
        mockHass.states['sensor.test_device_node_status'] = createState(
          'sensor.test_device_node_status',
          'online',
        );

        card.hass = mockHass;

        const el = await fixture(card.render() as TemplateResult);

        expect(el.querySelector('.firmware')).to.exist;
        expect(el.querySelector('.seen')).to.exist;
        expect(el.querySelector('.status')).to.exist;
      });

      it('should render device-specific entities', async () => {
        mockHass.states['sensor.test_device_test_1'] = createState(
          'sensor.test_device_test_1',
          'test1',
        );
        mockHass.states['sensor.test_device_test_2'] = createState(
          'sensor.test_device_test_2',
          'test2',
        );

        card.hass = mockHass;

        const el = await fixture(card.render() as TemplateResult);

        expect(el.querySelector('.e1')).to.exist;
        expect(el.querySelector('.e2')).to.exist;
      });

      it('should render title using sensor name', async () => {
        mockHass.states['update.test_device_firmware'] = createState(
          'update.test_device_firmware',
          'available',
        );
        mockHass.devices.test_device_id!.name_by_user = 'Custom Device Name';
        card.hass = mockHass;

        const el = await fixture(card.render() as TemplateResult);

        expect(el.querySelector('.title')?.textContent).to.equal(
          'Custom Device Name',
        );
      });

      it('should render manufacturer and model information', async () => {
        mockHass.states['update.test_device_firmware'] = createState(
          'update.test_device_firmware',
          'available',
        );

        card.hass = mockHass;

        const el = await fixture(card.render() as TemplateResult);

        const firmwareInfo = el.querySelector('.firmware-info');
        expect(firmwareInfo?.textContent).to.include(
          'Test Model by Test Manufacturer',
        );
      });

      it('should use mdi:z-wave as default icon when none provided', async () => {
        // Override the config to remove the icon
        card.setConfig({
          device_id: 'test_device_id',
        });

        mockHass.states['update.test_device_firmware'] = createState(
          'update.test_device_firmware',
          'available',
        );

        card.hass = mockHass;

        const el = await fixture(card.render() as TemplateResult);
        const iconElement = el.querySelector('ha-state-icon');

        // Check that the z-wave icon is used by default
        expect((iconElement as any)?.icon).to.equal('mdi:z-wave');
      });
    });

    describe('configuration', () => {
      it('should get config element with correct schema', () => {
        const editor = ZWaveDeviceInfo.getConfigElement();
        expect(editor.tagName.toLowerCase()).to.equal('basic-editor');
        expect((editor as any).schema).to.deep.include.members([
          {
            name: 'device_id',
            selector: {
              device: {
                filter: {
                  integration: 'zwave_js',
                },
              },
            },
            required: true,
            label: `Z Wave Devices`,
          },
          {
            name: 'title',
            required: false,
            label: 'Card Title',
            selector: {
              text: {},
            },
          },
          {
            name: 'icon',
            required: false,
            label: 'Icon',
            selector: {
              icon: {},
            },
          },
        ]);
      });

      it('should get stub config with first non-hub device', async () => {
        const mockDevices = [{ id: 'device_123' }];
        getZWaveNonHubsStub.returns(mockDevices);

        const config = await ZWaveDeviceInfo.getStubConfig(mockHass);

        expect(getZWaveNonHubsStub.calledOnceWith(mockHass)).to.be.true;
        expect(config).to.deep.equal({ device_id: 'device_123' });
      });

      it('should return empty device_id when no non-hub devices exist', async () => {
        getZWaveNonHubsStub.returns([]);

        const config = await ZWaveDeviceInfo.getStubConfig(mockHass);

        expect(config).to.deep.equal({ device_id: '' });
      });
    });

    describe('_renderIcon method', () => {
      it('should use toggleAction for switch entities', async () => {
        mockHass.states['switch.test_device_test_1'] = createState(
          'switch.test_device_test_1',
          'on',
        );

        card.hass = mockHass;

        await fixture(card.render() as TemplateResult);

        expect(
          handleClickActionStub.calledWith(
            match.any,
            match((config: any) => {
              return (
                config.tap_action?.action === 'toggle' &&
                config.entity === 'switch.test_device_test_1'
              );
            }),
          ),
        ).to.be.true;
      });

      it('should use moreInfoAction for non-switch entities', async () => {
        mockHass.states['sensor.test_device_test_1'] = createState(
          'sensor.test_device_test_1',
          'active',
        );

        card.hass = mockHass;

        await fixture(card.render() as TemplateResult);

        expect(
          handleClickActionStub.calledWith(
            match.any,
            match((config: any) => {
              return (
                config.tap_action?.action === 'more-info' &&
                config.entity === 'sensor.test_device_test_1'
              );
            }),
          ),
        ).to.be.true;
      });

      it('should apply entity styles to icon', async () => {
        mockHass.states['switch.test_device_test_1'] = createState(
          'switch.test_device_test_1',
          'on',
          { on_color: 'blue' },
        );

        card.hass = mockHass;

        const el = await fixture(card.render() as TemplateResult);

        const iconElement = el.querySelector('.icon.e1');

        expect(
          (iconElement as any)?.style.getPropertyValue('--icon-color'),
        ).to.include('blue');
        expect(
          (iconElement as any)?.style.getPropertyValue('--background-color'),
        ).to.exist;
      });

      it('should handle undefined state gracefully', async () => {
        const result = (card as any)._renderIcon(undefined);
        const el = await fixture(result);

        expect(el.tagName.toLowerCase()).to.equal('div');
        expect(el.classList.contains('icon')).to.be.true;
        expect(el.children.length).to.equal(0);
      });

      it('should apply custom class name when provided', async () => {
        mockHass.states['sensor.test_device_test_1'] = createState(
          'sensor.test_device_test_1',
          'active',
        );

        card.hass = mockHass;

        const result = (card as any)._renderIcon(
          mockHass.states['sensor.test_device_test_1'],
          'custom-class',
        );
        const el = await fixture(result);

        expect(el.classList.contains('custom-class')).to.be.true;
        expect(el.classList.contains('icon')).to.be.true;
      });
    });

    it('should render battery indicator when battery state is available', async () => {
      mockHass.states['update.test_device_firmware'] = createState(
        'update.test_device_firmware',
        'available',
      );
      mockHass.states['sensor.test_device_battery_level'] = createState(
        'sensor.test_device_battery_level',
        '75',
        { device_class: 'battery' },
      );

      card.hass = mockHass;

      const el = await fixture(card.render() as TemplateResult);
      const batt = el.querySelector('battery-indicator');
      expect(batt).to.exist;
      expect((batt as any).level).to.equal(75);
    });

    it('should not render battery indicator when battery state is not available', async () => {
      mockHass.states['update.test_device_firmware'] = createState(
        'update.test_device_firmware',
        'available',
      );
      // No battery state

      card.hass = mockHass;

      const el = await fixture(card.render() as TemplateResult);

      expect(el.querySelector('battery-indicator')).to.not.exist;
    });
  });
});
