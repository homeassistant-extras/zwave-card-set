import * as actionHandlerModule from '@common/action-handler';
import { fixture, fixtureCleanup } from '@open-wc/testing-helpers';
import type { ActionHandlerEvent } from '@type/action';
import type { HomeAssistant, State } from '@type/homeassistant';
import * as hassUtils from '@util/hass';
import { DcSignalSensorCard } from '@z55/card';
import type { Config } from '@z55/types';
import { expect } from 'chai';
import { nothing, type TemplateResult } from 'lit';
import { stub } from 'sinon';

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

describe('DcSignalSensorCard', () => {
  let card: DcSignalSensorCard;
  let mockHass: HomeAssistant;
  let mockConfig: Config;
  let actionHandlerStub: sinon.SinonStub;
  let handleClickActionStub: sinon.SinonStub;

  beforeEach(() => {
    // Create a new card instance for each test
    card = new DcSignalSensorCard();

    // Basic config setup
    mockConfig = {
      device_id: 'test_device_id',
      title: 'Test Smoke Sensor',
      icon: 'mdi:smoke-detector',
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

    // Basic mock Hass setup
    mockHass = {
      states: {},
      entities: {
        'update.test_device_sensor_firmware': {
          entity_id: 'update.test_device_sensor_firmware',
          device_id: 'test_device_id',
        },
        'sensor.test_device_last_seen': {
          entity_id: 'sensor.test_device_last_seen',
          device_id: 'test_device_id',
        },
        'sensor.test_device_node_status': {
          entity_id: 'sensor.test_device_node_status',
          device_id: 'test_device_id',
        },
        'binary_sensor.test_device_smoke_detected': {
          entity_id: 'binary_sensor.test_device_smoke_detected',
          device_id: 'test_device_id',
        },
        'binary_sensor.test_device_carbon_monoxide_detected': {
          entity_id: 'binary_sensor.test_device_carbon_monoxide_detected',
          device_id: 'test_device_id',
        },
        'sensor.other_device': {
          entity_id: 'sensor.other_device',
          device_id: 'other_device_id',
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

    // Initialize the card
    card.setConfig(mockConfig);
  });

  afterEach(async () => {
    actionHandlerStub.restore();
    handleClickActionStub.restore();
    await fixtureCleanup();
  });

  describe('setConfig', () => {
    it('should set the configuration correctly', () => {
      const config: Config = {
        device_id: 'new_device_id',
        title: 'New Title',
      };
      card.setConfig(config);
      expect((card as any)._config).to.equal(config);
    });
  });

  describe('config property', () => {
    it('should set the configuration correctly', () => {
      const config: Config = {
        device_id: 'new_device_id',
        title: 'New Title',
      };
      card.config = config;
      expect((card as any)._config).to.equal(config);
    });
  });

  describe('getConfigElement', () => {
    it('should return correct editor element', () => {
      const editor = DcSignalSensorCard.getConfigElement();
      expect(editor.tagName.toLowerCase()).to.equal('zooz-basic-editor');
      expect((editor as any).schema).to.deep.equal([
        {
          name: 'device_id',
          selector: {
            device: {
              filter: {
                manufacturer: 'Zooz',
                model: 'ZEN55 LR',
              },
            },
          },
          required: true,
          label: 'ZEN55 LR Device',
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
  });

  describe('hass property setter', () => {
    it('should not set sensor if no config', () => {
      // Set hass property
      card.setConfig(undefined as any as Config);
      card.hass = mockHass;

      // Check firmware state was set correctly
      expect((card as any)._sensor).to.be.undefined;
    });

    it('should identify and set the firmware state', () => {
      // Set up state
      mockHass.states['update.test_device_sensor_firmware'] = createState(
        'update.test_device_sensor_firmware',
        'available',
        { installed_version: '1.0', latest_version: '1.1' },
      );

      // Set hass property
      card.hass = mockHass;

      // Check firmware state was set correctly
      expect((card as any)._sensor.firmwareState).to.deep.equal(
        mockHass.states['update.test_device_sensor_firmware'],
      );
    });

    it('should identify and set the last seen state', () => {
      // Set up state
      mockHass.states['sensor.test_device_last_seen'] = createState(
        'sensor.test_device_last_seen',
        '2024-02-19T12:34:56Z',
      );

      // Set hass property
      card.hass = mockHass;

      // Check last seen state was set correctly
      expect((card as any)._sensor.lastSeenState).to.deep.equal(
        mockHass.states['sensor.test_device_last_seen'],
      );
    });

    it('should identify and set the node status state', () => {
      // Set up state
      mockHass.states['sensor.test_device_node_status'] = createState(
        'sensor.test_device_node_status',
        'online',
      );

      // Set hass property
      card.hass = mockHass;

      // Check node status state was set correctly
      expect((card as any)._sensor.nodeStatusState).to.deep.equal(
        mockHass.states['sensor.test_device_node_status'],
      );
    });

    it('should identify and set the smoke detected state', () => {
      // Set up state
      mockHass.states['binary_sensor.test_device_smoke_detected'] = createState(
        'binary_sensor.test_device_smoke_detected',
        'off',
      );

      // Set hass property
      card.hass = mockHass;

      // Check smoke detected state was set correctly
      expect((card as any)._sensor.smokeDetectedState).to.deep.equal(
        mockHass.states['binary_sensor.test_device_smoke_detected'],
      );
    });

    it('should identify and set the carbon monoxide detected state', () => {
      // Set up state
      mockHass.states['binary_sensor.test_device_carbon_monoxide_detected'] =
        createState(
          'binary_sensor.test_device_carbon_monoxide_detected',
          'off',
        );

      // Set hass property
      card.hass = mockHass;

      // Check carbon monoxide detected state was set correctly
      expect((card as any)._sensor.carbonMonoxideDetectedState).to.deep.equal(
        mockHass.states['binary_sensor.test_device_carbon_monoxide_detected'],
      );
    });

    it('should not modify sensor if no states have changed', () => {
      // Set up initial states
      mockHass.states['sensor.test_device_node_status'] = createState(
        'sensor.test_device_node_status',
        'online',
      );

      // First hass assignment
      card.hass = mockHass;
      const initialSensor = { ...(card as any)._sensor };

      // Second assignment with same values
      card.hass = mockHass;
      const updatedSensor = (card as any)._sensor;

      // Should be the same object reference (no update)
      expect(updatedSensor).to.deep.equal(initialSensor);
    });

    it('should update sensor when states change', () => {
      // Set up initial states
      mockHass.states['sensor.test_device_node_status'] = createState(
        'sensor.test_device_node_status',
        'online',
      );

      // First hass assignment
      card.hass = mockHass;
      const initialSensor = (card as any)._sensor;

      // Change state
      mockHass.states['sensor.test_device_node_status'] = createState(
        'sensor.test_device_node_status',
        'offline',
      );

      // Second assignment with changed values
      card.hass = mockHass;
      const updatedSensor = (card as any)._sensor;

      // Should be a different object (updated)
      expect(updatedSensor).to.not.equal(initialSensor);
      expect(updatedSensor.nodeStatusState.state).to.equal('offline');
    });

    it('should ignore entities from other devices', () => {
      // Set up states for a different device
      mockHass.states['sensor.other_device'] = createState(
        'sensor.other_device',
        'online',
      );

      // Set hass property
      card.hass = mockHass;

      // Should not have any state properties set
      expect((card as any)._sensor).to.deep.equal({});
    });
  });

  describe('render method', () => {
    it('should return nothing when sensor is not initialized', async () => {
      // Ensure sensor is undefined
      (card as any)._sensor = undefined;

      const result = card.render();
      expect(result).to.equal(nothing);
    });

    it('should render card with all sensor elements when available', async () => {
      // Set up all states
      mockHass.states['update.test_device_sensor_firmware'] = createState(
        'update.test_device_sensor_firmware',
        'available',
        { installed_version: '1.0', latest_version: '1.1' },
      );
      mockHass.states['sensor.test_device_last_seen'] = createState(
        'sensor.test_device_last_seen',
        '2024-02-19T12:34:56Z',
      );
      mockHass.states['sensor.test_device_node_status'] = createState(
        'sensor.test_device_node_status',
        'online',
      );
      mockHass.states['binary_sensor.test_device_smoke_detected'] = createState(
        'binary_sensor.test_device_smoke_detected',
        'off',
      );
      mockHass.states['binary_sensor.test_device_carbon_monoxide_detected'] =
        createState(
          'binary_sensor.test_device_carbon_monoxide_detected',
          'off',
        );

      // Set hass property to populate sensor state
      card.hass = mockHass;

      // Cache hass for render
      (card as any)._hass = mockHass;

      // Render the card
      const el = await fixture(card.render() as TemplateResult);

      // Verify main elements exist
      expect(el.tagName.toLowerCase()).to.equal('ha-card');
      expect(el.classList.contains('grid')).to.be.true;
      expect(el.querySelector('.firmware')).to.exist;
      expect(el.querySelector('.seen')).to.exist;
      expect(el.querySelector('.status')).to.exist;
      expect(el.querySelector('.smoke')).to.exist;
      expect(el.querySelector('.co')).to.exist;
    });

    it('should render with custom title and icon when provided', async () => {
      // Set up sensor with firmware state
      mockHass.states['update.test_device_sensor_firmware'] = createState(
        'update.test_device_sensor_firmware',
        'available',
      );

      // Set custom config
      card.setConfig({
        device_id: 'test_device_id',
        title: 'Custom Sensor Title',
        icon: 'mdi:custom-icon',
      });

      // Update hass
      card.hass = mockHass;
      (card as any)._hass = mockHass;

      // Render the card
      const el = await fixture(card.render() as TemplateResult);

      // Get the title and icon elements
      const titleElement = el.querySelector('.title');
      const iconElement = el.querySelector('ha-state-icon');

      // Verify custom title and icon
      expect(titleElement?.textContent).to.equal('Custom Sensor Title');
      expect(iconElement).to.exist;
    });

    it('should use default title when not provided', async () => {
      // Set up sensor with firmware state
      mockHass.states['update.test_device_sensor_firmware'] = createState(
        'update.test_device_sensor_firmware',
        'available',
      );

      // Set config without title
      card.setConfig({
        device_id: 'test_device_id',
      });

      // Update hass
      card.hass = mockHass;
      (card as any)._hass = mockHass;

      // Render the card
      const el = await fixture(card.render() as TemplateResult);

      // Get the title element
      const titleElement = el.querySelector('.title');

      // Verify default title
      expect(titleElement?.textContent).to.equal('Smoke Sensor');
    });
  });

  describe('_renderStateDisplay method', () => {
    it('should return nothing when state is undefined', () => {
      const result = (card as any)._renderStateDisplay(
        undefined,
        ['test-class'],
        'label-class',
        'Test Label',
      );
      expect(result).to.equal(nothing);
    });

    it('should render state display with proper classes and action handlers', async () => {
      // Set up a test state
      const testState = createState('sensor.test', 'on');
      (card as any)._hass = mockHass;

      // Call the method
      const result = (card as any)._renderStateDisplay(
        testState,
        ['class1', 'class2'],
        'test-label',
        'Test Label',
      );

      // Render the result
      const el = await fixture(result);

      // Verify structure and classes
      expect(el.classList.contains('class1')).to.be.true;
      expect(el.classList.contains('class2')).to.be.true;
      expect(el.querySelector('.test-label')?.textContent).to.equal(
        'Test Label',
      );
      expect(el.querySelector('state-display')).to.exist;

      // Verify action handlers are attached
      expect(actionHandlerStub.called).to.be.true;
      expect(handleClickActionStub.called).to.be.true;
    });
  });

  describe('_renderIcon method', () => {
    it('should return nothing when state is undefined', () => {
      const result = (card as any)._renderIcon(undefined);
      expect(result).to.equal(nothing);
    });

    it('should render icon with proper class and custom icon if provided', async () => {
      // Set up a test state
      const testState = createState('binary_sensor.test', 'on');
      (card as any)._hass = mockHass;

      // Call the method with custom icon and class
      const result = (card as any)._renderIcon(
        testState,
        'custom-class',
        'mdi:custom-icon',
      );

      // Render the result
      const el = await fixture(result);

      // Verify structure and classes
      expect(el.classList.contains('icon')).to.be.true;
      expect(el.classList.contains('custom-class')).to.be.true;

      // Verify the icon is set correctly
      const iconElement = el.querySelector('ha-state-icon');
      expect(iconElement).to.exist;
      expect((iconElement as any).icon).to.equal('mdi:custom-icon');

      // Verify action handlers are attached
      expect(actionHandlerStub.called).to.be.true;
      expect(handleClickActionStub.called).to.be.true;
    });

    it('should handle undefined className correctly', async () => {
      // Set up a test state
      const testState = createState('binary_sensor.test', 'on');
      (card as any)._hass = mockHass;

      // Call the method with undefined className
      const result = (card as any)._renderIcon(testState);

      // Render the result
      const el = await fixture(result);

      // Verify just the base 'icon' class is present
      expect(el.className).to.equal('icon');
    });
  });

  describe('getStubConfig', () => {
    it('should return an empty device_id when no devices are found', async () => {
      const getZoozModelsStub = stub(hassUtils, 'getZoozModels').returns([]);
      const config = await DcSignalSensorCard.getStubConfig(mockHass);

      expect(getZoozModelsStub.calledOnceWith(mockHass, 'ZEN55 LR')).to.be.true;
      expect(config).to.deep.equal({ device_id: '' });
      getZoozModelsStub.restore();
    });

    it('should return the first device id when devices are found', async () => {
      const mockDevices = [{ id: 'device_123' }, { id: 'device_456' }];
      const getZoozModelsStub = stub(hassUtils, 'getZoozModels').returns(
        mockDevices,
      );
      const config = await DcSignalSensorCard.getStubConfig(mockHass);

      expect(getZoozModelsStub.calledOnceWith(mockHass, 'ZEN55 LR')).to.be.true;
      expect(config).to.deep.equal({ device_id: 'device_123' });
      getZoozModelsStub.restore();
    });
  });
});
