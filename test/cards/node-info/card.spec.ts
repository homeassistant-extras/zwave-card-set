import * as actionHandlerModule from '@common/action-handler';
import { ZWaveDeviceInfo } from '@node/card';
import type { Config } from '@node/types';
import { fixture, fixtureCleanup } from '@open-wc/testing-helpers';
import { createState as s } from '@test/test-helpers';
import type { ActionHandlerEvent } from '@type/action';
import type { HomeAssistant } from '@type/homeassistant';
import * as hassUtils from '@util/hass';
import * as renderUtils from '@util/render';
import { expect } from 'chai';
import { html, nothing, type TemplateResult } from 'lit';
import { spy, stub } from 'sinon';

describe('ZWaveDeviceInfo', () => {
  let card: ZWaveDeviceInfo;
  let mockHass: HomeAssistant;
  let mockConfig: Config;
  let actionHandlerStub: sinon.SinonStub;
  let handleClickActionStub: sinon.SinonStub;
  let getZWaveNonHubsStub: sinon.SinonStub;
  let getHassDeviceIfZWaveStub: sinon.SinonStub;
  let renderStateDisplayStub: sinon.SinonStub;
  let renderChevronToggleStub: sinon.SinonStub;

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
    getHassDeviceIfZWaveStub = stub(hassUtils, 'getHassDeviceIfZWave');
    renderStateDisplayStub = stub(renderUtils, 'renderStateDisplay').returns(
      html`<div class="state-display-mock"></div>`,
    );
    renderChevronToggleStub = stub(renderUtils, 'renderChevronToggle').returns(
      html`<div class="chevron-toggle-mock"></div>`,
    );

    mockHass = {
      states: {},
      entities: {
        'update.test_device_firmware': {
          entity_id: 'update.test_device_firmware',
          device_id: 'test_device_id',
          entity_category: 'config',
          translation_key: undefined,
        },
        'sensor.test_device_last_seen': {
          entity_id: 'sensor.test_device_last_seen',
          device_id: 'test_device_id',
          entity_category: 'diagnostic',
          translation_key: 'last_seen',
        },
        'sensor.test_device_node_status': {
          entity_id: 'sensor.test_device_node_status',
          device_id: 'test_device_id',
          entity_category: 'diagnostic',
          translation_key: 'node_status',
        },
        'sensor.test_device_battery_level': {
          entity_id: 'sensor.test_device_battery_level',
          device_id: 'test_device_id',
          entity_category: 'diagnostic',
          translation_key: undefined,
        },
        'sensor.test_device_test_1': {
          entity_id: 'sensor.test_device_test_1',
          device_id: 'test_device_id',
          translation_key: undefined,
        },
        'sensor.test_device_test_2': {
          entity_id: 'sensor.test_device_test_2',
          device_id: 'test_device_id',
          translation_key: undefined,
        },
        'switch.test_device_test_1': {
          entity_id: 'switch.test_device_test_1',
          device_id: 'test_device_id',
          translation_key: undefined,
        },
        // Sensor data entities for testing _isSensorData
        'sensor.test_device_power': {
          entity_id: 'sensor.test_device_power',
          device_id: 'test_device_id',
          translation_key: undefined,
        },
        'sensor.test_device_energy': {
          entity_id: 'sensor.test_device_energy',
          device_id: 'test_device_id',
          translation_key: undefined,
        },
        'sensor.test_device_heat': {
          entity_id: 'sensor.test_device_heat',
          device_id: 'test_device_id',
          translation_key: undefined,
        },
        'event.test_device_scene': {
          entity_id: 'event.test_device_scene',
          device_id: 'test_device_id',
          translation_key: undefined,
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
          name: 'Default Device Name',
          manufacturer: 'Test Manufacturer',
          model: 'Test Model',
          labels: [],
          identifiers: [['zwave_js', '1234']],
        },
        test_controller_id: {
          id: 'test_controller_id',
          name_by_user: 'Test Controller',
          name: 'Default Controller Name',
          manufacturer: 'Test Manufacturer',
          model: 'Controller Model',
          labels: ['hub'],
          identifiers: [['zwave_js', '5678']],
        },
        non_zwave_device_id: {
          id: 'non_zwave_device_id',
          name_by_user: 'Non Z-Wave Device',
          name: 'Default Non-Z-Wave Device',
          manufacturer: 'Other Manufacturer',
          model: 'Other Model',
          identifiers: [['other_protocol', '9012']],
        },
      },
    };

    // Set up states with appropriate attributes for testing
    mockHass.states['update.test_device_firmware'] = s(
      'update.test_device_firmware',
      'available',
      { device_class: 'firmware' },
    );
    mockHass.states['sensor.test_device_last_seen'] = s(
      'sensor.test_device_last_seen',
      '2024-02-19T12:34:56Z',
    );
    mockHass.states['sensor.test_device_node_status'] = s(
      'sensor.test_device_node_status',
      'online',
    );
    mockHass.states['sensor.test_device_battery_level'] = s(
      'sensor.test_device_battery_level',
      '75',
      { device_class: 'battery', state_class: 'measurement' },
    );
    mockHass.states['sensor.test_device_power'] = s(
      'sensor.test_device_power',
      '120',
      { state_class: 'measurement', device_class: 'power' },
    );
    mockHass.states['sensor.test_device_energy'] = s(
      'sensor.test_device_energy',
      '15',
      { state_class: 'total_increasing', device_class: 'energy' },
    );
    mockHass.states['sensor.test_device_heat'] = s(
      'sensor.test_device_heat',
      'normal',
      { device_class: 'heat' },
    );
    mockHass.states['event.test_device_scene'] = s(
      'event.test_device_scene',
      'activated',
    );
    mockHass.states['sensor.test_device_test_1'] = s(
      'sensor.test_device_test_1',
      'test1',
      { friendly_name: 'Test Sensor 1' },
    );
    mockHass.states['sensor.test_device_test_2'] = s(
      'sensor.test_device_test_2',
      'test2',
      { friendly_name: 'Test Sensor 2' },
    );
    mockHass.states['switch.test_device_test_1'] = s(
      'switch.test_device_test_1',
      'on',
      { friendly_name: 'Test Switch 1' },
    );
    mockHass.states['sensor.test_controller_status'] = s(
      'sensor.test_controller_status',
      'ready',
    );

    // Setup getHassDeviceIfZWave to return the test device
    getHassDeviceIfZWaveStub
      .withArgs(mockHass, 'test_device_id')
      .returns(mockHass.devices.test_device_id);
    getHassDeviceIfZWaveStub
      .withArgs(mockHass, 'test_controller_id')
      .returns(mockHass.devices.test_controller_id);
    getHassDeviceIfZWaveStub
      .withArgs(mockHass, 'non_zwave_device_id')
      .returns(undefined);

    card.setConfig(mockConfig);
  });

  afterEach(async () => {
    actionHandlerStub.restore();
    handleClickActionStub.restore();
    getZWaveNonHubsStub.restore();
    getHassDeviceIfZWaveStub.restore();
    renderStateDisplayStub.restore();
    renderChevronToggleStub.restore();
    await fixtureCleanup();
  });

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

    it('should initialize entities and sensors arrays', () => {
      card.hass = mockHass;
      expect((card as any)._sensor.entities).to.be.an('array');
      expect((card as any)._sensor.sensors).to.be.an('array');
    });

    it('should set manufacturer and model from device', () => {
      card.hass = mockHass;
      expect((card as any)._sensor.manufacturer).to.equal('Test Manufacturer');
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
      card.hass = mockHass;

      expect((card as any)._sensor.firmwareState).to.exist;
      expect((card as any)._sensor.lastSeenState).to.exist;
      expect((card as any)._sensor.nodeStatusState).to.exist;
      expect((card as any)._sensor.batteryState).to.exist;
      expect((card as any)._sensor.batteryState.state).to.equal('75');
    });

    // it('should separate entities and sensors correctly', () => {
    //   card.hass = mockHass;

    //   // Regular entities
    //   expect((card as any)._sensor.entities).to.have.lengthOf(1);
    //   expect((card as any)._sensor.entities[0].entity_id).to.equal(
    //     'switch.test_device_test_1',
    //   );

    //   // Sensor data entities
    //   expect((card as any)._sensor.sensors).to.have.lengthOf(4);
    //   const sensorIds = (card as any)._sensor.sensors.map(
    //     (s: State) => s.entity_id,
    //   );
    //   expect(sensorIds).to.include('sensor.test_device_power');
    //   expect(sensorIds).to.include('sensor.test_device_energy');
    //   expect(sensorIds).to.include('sensor.test_device_heat');
    //   expect(sensorIds).to.include('event.test_device_scene');
    // });

    // it('should set sensor name from device name_by_user if available', () => {
    //   card.hass = mockHass;
    //   expect((card as any)._sensor.name).to.equal('Test Device');
    // });

    it('should fallback to device name if name_by_user not available', () => {
      mockHass.devices.test_device_id!.name_by_user = undefined;

      card.hass = mockHass;
      expect((card as any)._sensor.name).to.equal('Default Device Name');
    });

    // it('should dispatch hass-update-controller event for controllers', () => {
    //   const fireEventSpy = spy(fireEvent);

    //   // Set up a controller
    //   card.setConfig({ device_id: 'test_controller_id' });
    //   card.hass = mockHass;

    //   // Update with same data to trigger the else branch for controllers
    //   card.hass = mockHass;

    //   expect(
    //     fireEventSpy.calledWith(card, 'hass-update-controller', {
    //       hass: mockHass,
    //     }),
    //   ).to.be.true;

    //   fireEventSpy.restore();
    // });
  });

  describe('_isSensorData method', () => {
    it('should identify measurement state_class entities as sensors', () => {
      const powerState = s('sensor.test_power', '120', {
        state_class: 'measurement',
        device_class: 'power',
      });

      expect((card as any)._isSensorData(powerState)).to.be.true;
    });

    it('should identify total_increasing state_class entities as sensors', () => {
      const energyState = s('sensor.test_energy', '15', {
        state_class: 'total_increasing',
        device_class: 'energy',
      });

      expect((card as any)._isSensorData(energyState)).to.be.true;
    });

    it('should exclude climate sensors from sensor data', () => {
      const humidityState = s('sensor.test_humidity', '65', {
        state_class: 'measurement',
        device_class: 'humidity',
      });

      const temperatureState = s('sensor.test_temperature', '22', {
        state_class: 'measurement',
        device_class: 'temperature',
      });

      expect((card as any)._isSensorData(humidityState)).to.be.false;
      expect((card as any)._isSensorData(temperatureState)).to.be.false;
    });

    it('should identify heat device_class entities as sensors', () => {
      const heatState = s('sensor.test_heat', 'normal', {
        device_class: 'heat',
      });

      expect((card as any)._isSensorData(heatState)).to.be.true;
    });

    it('should identify event domain entities as sensors', () => {
      const eventState = s('event.test_scene', 'activated');

      expect((card as any)._isSensorData(eventState)).to.be.true;
    });

    it('should not identify other entities as sensors', () => {
      const lightState = s('light.test_light', 'on');

      const switchState = s('switch.test_switch', 'off');

      expect((card as any)._isSensorData(lightState)).to.be.false;
      expect((card as any)._isSensorData(switchState)).to.be.false;
    });
  });

  describe('render method', () => {
    it('should return nothing when sensor is not initialized', () => {
      (card as any)._sensor = undefined;
      const result = card.render();
      expect(result).to.equal(nothing);
    });

    it('should render controller component when device is a controller', async () => {
      (card as any)._sensor = {
        name: 'Test Controller',
        isController: true,
        entities: [],
        sensors: [],
      };

      const el = await fixture(card.render() as TemplateResult);

      expect(el.tagName.toLowerCase()).to.equal('zwave-controller');
      expect((el as any).config).to.deep.equal({ device_id: 'test_device_id' });
    });

    it('should render card with sensors section when sensors exist', async () => {
      (card as any)._sensor = {
        name: 'Test Device',
        manufacturer: 'Test Manufacturer',
        model: 'Test Model',
        entities: [],
        sensors: [
          s('sensor.test_sensor_1', '10', {
            friendly_name: 'Sensor 1',
          }),
          s('sensor.test_sensor_2', '20', {
            friendly_name: 'Sensor 2',
          }),
        ],
        firmwareState: s('update.firmware', 'available'),
      };

      const el = await fixture(card.render() as TemplateResult);

      expect(el.querySelector('.sensors-container')).to.exist;
      expect(renderChevronToggleStub.called).to.be.true;
    });

    it('should apply expanded class when _sensorsExpanded is true', async () => {
      (card as any)._sensor = {
        name: 'Test Device',
        manufacturer: 'Test Manufacturer',
        model: 'Test Model',
        entities: [],
        sensors: [
          s('sensor.test_sensor_1', '10', {
            friendly_name: 'Sensor 1',
          }),
        ],
        firmwareState: s('update.firmware', 'available'),
      };
      (card as any)._sensorsExpanded = true;

      const el = await fixture(card.render() as TemplateResult);

      expect(el.classList.contains('expanded')).to.be.true;
      expect(
        el.querySelector('.sensors-container')?.classList.contains('expanded'),
      ).to.be.true;
    });

    it('should render battery indicator when battery state is available', async () => {
      (card as any)._sensor = {
        name: 'Test Device',
        manufacturer: 'Test Manufacturer',
        model: 'Test Model',
        entities: [],
        sensors: [],
        batteryState: s('sensor.battery', '75', {
          device_class: 'battery',
          state_class: 'measurement',
        }),
        firmwareState: s('update.firmware', 'available'),
      };

      const el = await fixture(card.render() as TemplateResult);

      const batteryIndicator = el.querySelector('battery-indicator');
      expect(batteryIndicator).to.exist;
      expect((batteryIndicator as any).level).to.equal(75);
    });

    it('should handle small card layout', async () => {
      (card as any)._sensor = {
        name: 'Test Device',
        manufacturer: 'Test Manufacturer',
        model: 'Test Model',
        entities: [],
        sensors: [],
        nodeStatusState: s('sensor.status', 'online'),
        lastSeenState: s('sensor.last_seen', '2024-02-19T12:34:56Z'),
        firmwareState: s('update.firmware', 'available'),
      };
      (card as any)._isSmallCard = true;

      const el = await fixture(card.render() as TemplateResult);

      // In small card mode, these should not be rendered directly
      expect(el.querySelector('.seen')).to.not.exist;
      expect(el.querySelector('.status')).to.not.exist;

      // Verify sensors array includes status and last seen
      expect(renderStateDisplayStub.callCount).to.be.at.least(2);
    });

    it('should use icons instead of names when feature is enabled', async () => {
      // Create a spy on the _renderIcon method
      const renderIconSpy = stub(card as any, '_renderIcon').returns(
        html`<div class="mock-icon"></div>`,
      );

      (card as any)._sensor = {
        name: 'Test Device',
        manufacturer: 'Test Manufacturer',
        model: 'Test Model',
        entities: [],
        sensors: [
          s('sensor.test_sensor_1', '10', {
            friendly_name: 'Sensor 1',
          }),
        ],
        firmwareState: s('update.firmware', 'available'),
      };
      (card as any)._config.features = ['use_icons_instead_of_names'];
      (card as any)._sensorsExpanded = true;

      await fixture(card.render() as TemplateResult);

      // Verify the spy was called (at least once for the sensor)
      expect(renderIconSpy.called).to.be.true;

      // Restore the original method
      renderIconSpy.restore();
    });
  });

  describe('_toggleSensors method', () => {
    it('should toggle _sensorsExpanded state', () => {
      expect((card as any)._sensorsExpanded).to.be.false;

      (card as any)._toggleSensors(new Event('click'));
      expect((card as any)._sensorsExpanded).to.be.true;

      (card as any)._toggleSensors(new Event('click'));
      expect((card as any)._sensorsExpanded).to.be.false;
    });
  });

  describe('_handleResize method', () => {
    it('should set _isSmallCard to true when width is less than 450px', () => {
      // Stub _getCardWidth to return a small width
      const getCardWidthStub = stub(card as any, '_getCardWidth').returns(400);

      (card as any)._handleResize(new Event('resize'));

      expect((card as any)._isSmallCard).to.be.true;

      getCardWidthStub.restore();
    });

    it('should set _isSmallCard to false when width is 450px or greater', () => {
      // Stub _getCardWidth to return a larger width
      const getCardWidthStub = stub(card as any, '_getCardWidth').returns(500);

      (card as any)._handleResize(new Event('resize'));

      expect((card as any)._isSmallCard).to.be.false;

      getCardWidthStub.restore();
    });
  });

  describe('lifecycle methods', () => {
    it('should add event listeners in connectedCallback', () => {
      const addEventListenerSpy = spy(window, 'addEventListener');

      card.connectedCallback();

      expect(addEventListenerSpy.calledWith('hass-update')).to.be.true;
      expect(addEventListenerSpy.calledWith('resize')).to.be.true;

      addEventListenerSpy.restore();
    });

    it('should remove event listeners in disconnectedCallback', () => {
      const removeEventListenerSpy = spy(window, 'removeEventListener');

      card.disconnectedCallback();

      expect(removeEventListenerSpy.calledWith('hass-update')).to.be.true;

      removeEventListenerSpy.restore();
    });

    it('should call _handleResize in firstUpdated', () => {
      const handleResizeSpy = spy(card as any, '_handleResize');

      (card as any).firstUpdated({});

      expect(handleResizeSpy.called).to.be.true;

      handleResizeSpy.restore();
    });
  });

  describe('_handleHassUpdate method', () => {
    it('should update hass property when event is triggered', () => {
      const newHass = { ...mockHass, states: { ...mockHass.states } };
      const event = new CustomEvent('hass-update', {
        detail: { hass: newHass },
      });

      const hassSetter = spy(card, 'hass', ['set']);

      (card as any)._handleHassUpdate(event);

      expect(hassSetter.set.calledOnceWith(newHass)).to.be.true;

      hassSetter.set.restore();
    });
  });

  describe('_getCardWidth method', () => {
    it('should return the width of the card element if available', () => {
      // Create a mock element with getBoundingClientRect
      const mockElement = {
        getBoundingClientRect: () => ({ width: 480 }) as DOMRect,
      };

      // Create a mock host
      const mockHost = mockElement;

      // Create a mock shadowRoot
      const mockShadowRoot = {
        host: mockHost,
      };

      // Stub shadowRoot getter to return our mock
      const shadowRootStub = stub(card, 'shadowRoot').get(
        () => mockShadowRoot as unknown as ShadowRoot,
      );

      const width = (card as any)._getCardWidth();

      expect(width).to.equal(480);

      shadowRootStub.restore();
    });

    it('should return 500 as fallback if shadowRoot is not available', () => {
      // Stub shadowRoot getter to return null
      const shadowRootStub = stub(card, 'shadowRoot').get(() => null);

      const width = (card as any)._getCardWidth();

      expect(width).to.equal(500);

      shadowRootStub.restore();
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
                  label: 'Use Icons instead of Labels for Sensors',
                  value: 'use_icons_instead_of_names',
                },
              ],
            },
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
});
