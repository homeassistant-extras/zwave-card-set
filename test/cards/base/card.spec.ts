import { BaseZoozCard } from '@base/card';
import type { Config } from '@base/types';
import * as actionHandlerModule from '@common/action-handler';
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

// Test implementation of BaseZoozCard for testing abstract class
class TestZoozCard extends BaseZoozCard {
  static override defaultConfig() {
    return {
      icon: 'mdi:test',
      entityDomains: ['sensor', 'switch'],
      model: 'TEST-MODEL',
    };
  }
}

describe('BaseZoozCard', () => {
  let card: TestZoozCard;
  let mockHass: HomeAssistant;
  let mockConfig: Config;
  let actionHandlerStub: sinon.SinonStub;
  let handleClickActionStub: sinon.SinonStub;

  beforeEach(() => {
    card = new TestZoozCard();

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
      },
      devices: {
        test_device_id: {
          id: 'test_device_id',
          name_by_user: 'Test Device',
          labels: [],
        },
      },
    };

    card.setConfig(mockConfig);
  });

  afterEach(async () => {
    actionHandlerStub.restore();
    handleClickActionStub.restore();
    await fixtureCleanup();
  });

  describe('card.ts', () => {
    describe('defaultConfig', () => {
      it('should initialize with correct default config', () => {
        const defaultConfig = card.defaultConfig;
        expect(defaultConfig).to.deep.equal({
          entityDomains: ['sensor', 'switch'],
          icon: 'mdi:test',
          model: 'TEST-MODEL',
        });
      });
    });

    describe('hass property setter', () => {
      it('should not set sensor if no config', () => {
        card.setConfig(undefined as any as Config);
        card.hass = mockHass;
        expect((card as any)._sensor).to.be.undefined;
      });

      it('should initialize entities array', () => {
        card.hass = mockHass;
        expect((card as any)._sensor.entities).to.be.an('array');
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

        card.hass = mockHass;

        expect((card as any)._sensor.firmwareState).to.exist;
        expect((card as any)._sensor.lastSeenState).to.exist;
        expect((card as any)._sensor.nodeStatusState).to.exist;
      });

      it('should process entities matching suffixes', () => {
        mockHass.states['sensor.test_device_test_1'] = createState(
          'sensor.test_device_test_1',
          'test1',
        );
        mockHass.states['sensor.test_device_test_2'] = createState(
          'sensor.test_device_test_2',
          'test2',
        );

        card.hass = mockHass;

        expect((card as any)._sensor.entities).to.have.lengthOf(2);
      });

      it('should set sensor name from device name_by_user if available', () => {
        // Setup device with name_by_user
        mockHass.devices.test_device_id!.name_by_user = 'Custom Device Name';
        mockHass.devices.test_device_id!.name = 'Default Device Name';

        card.hass = mockHass;

        expect((card as any)._sensor.name).to.equal('Custom Device Name');
      });

      it('should fallback to device name if name_by_user not available', () => {
        // Setup device with only name
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
    });

    describe('configuration', () => {
      it('should get config element with correct schema', () => {
        const editor = TestZoozCard.getConfigElement();
        expect(editor.tagName.toLowerCase()).to.equal('zooz-basic-editor');
        expect((editor as any).schema).to.deep.include.members([
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

      it('should get stub config', async () => {
        const mockDevices = [{ id: 'device_123' }];
        const getZoozModelsStub = stub(hassUtils, 'getZoozModels').returns(
          mockDevices,
        );

        const config = await TestZoozCard.getStubConfig(mockHass);

        expect(getZoozModelsStub.calledOnceWith(mockHass, 'TEST-MODEL')).to.be
          .true;
        expect(config).to.deep.equal({ device_id: 'device_123' });

        getZoozModelsStub.restore();
      });
    });

    describe('_renderIcon method', () => {
      it('should use toggleAction for switch entities', async () => {
        // Create a switch state
        mockHass.states['switch.test_device_test_1'] = createState(
          'switch.test_device_test_1',
          'on',
        );

        card.hass = mockHass;

        // Get the rendered element
        await fixture(card.render() as TemplateResult);

        // Verify that toggleAction was used by checking the action handler
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
        // Create a sensor state
        mockHass.states['sensor.test_device_test_1'] = createState(
          'sensor.test_device_test_1',
          'active',
        );

        card.hass = mockHass;

        // Get the rendered element
        await fixture(card.render() as TemplateResult);

        // Verify that moreInfoAction was used by checking the action handler
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
        // Create a state with known style properties
        mockHass.states['switch.test_device_test_1'] = createState(
          'switch.test_device_test_1',
          'on',
          { on_color: 'blue' },
        );

        card.hass = mockHass;

        // Get the rendered element
        const el = await fixture(card.render() as TemplateResult);

        // Find the icon element
        const iconElement = el.querySelector('.icon.e1');

        // Verify styles were applied
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

        // Should render an empty div with just the icon class
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
  });
});
