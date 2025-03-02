import { ZWaveController } from '@controller-info/card';
import type { Config, Controller } from '@controller-info/types';
import { fixture, fixtureCleanup } from '@open-wc/testing-helpers';
import { createState as s } from '@test/test-helpers';
import type { Entity, HomeAssistant } from '@type/homeassistant';
import type { ZWaveDevice } from '@type/zwave';
import * as hassUtils from '@util/hass';
import * as renderUtils from '@util/render';
import { expect } from 'chai';
import { html, nothing, type TemplateResult } from 'lit';
import { stub } from 'sinon';

describe('ZWaveController', () => {
  describe('card.ts', () => {
    let card: ZWaveController;
    let mockHass: HomeAssistant;
    let mockConfig: Config;
    let getZWaveControllersStub: sinon.SinonStub;
    let getZWaveNonHubsStub: sinon.SinonStub;
    let getHassDeviceIfZWaveStub: sinon.SinonStub;
    let processDeviceEntitiesStub: sinon.SinonStub;
    let renderErrorStub: sinon.SinonStub;
    let renderStateDisplayStub: sinon.SinonStub;
    let renderChevronToggleStub: sinon.SinonStub;

    beforeEach(() => {
      // Create a new card instance for each test
      card = new ZWaveController();

      // Basic config setup
      mockConfig = {
        device_id: 'test_controller_id',
      };

      // Basic mock Hass setup with empty collections
      mockHass = {
        states: {},
        entities: {},
        devices: {},
      };

      // Stub utility functions
      getZWaveControllersStub = stub(hassUtils, 'getZWaveControllers');
      getZWaveNonHubsStub = stub(hassUtils, 'getZWaveNonHubs');
      getHassDeviceIfZWaveStub = stub(hassUtils, 'getHassDeviceIfZWave');
      processDeviceEntitiesStub = stub(
        hassUtils,
        'processDeviceEntitiesAndCheckIfController',
      );
      renderErrorStub = stub(renderUtils, 'renderError').returns(
        html`<div class="error">Error</div>`,
      );
      renderStateDisplayStub = stub(renderUtils, 'renderStateDisplay').returns(
        html`<div class="state-display">State</div>`,
      );
      renderChevronToggleStub = stub(
        renderUtils,
        'renderChevronToggle',
      ).returns(html`<div class="chevron">Chevron</div>`);

      // Initialize the card
      card.setConfig(mockConfig);
    });

    afterEach(async () => {
      getZWaveControllersStub.restore();
      getZWaveNonHubsStub.restore();
      getHassDeviceIfZWaveStub.restore();
      processDeviceEntitiesStub.restore();
      renderErrorStub.restore();
      renderStateDisplayStub.restore();
      renderChevronToggleStub.restore();
      await fixtureCleanup();
    });

    describe('setConfig', () => {
      it('should set the configuration correctly', () => {
        const config: Config = {
          device_id: 'test_id',
          title: 'Test Title',
        };
        card.setConfig(config);
        expect((card as any)._config).to.equal(config);
      });

      it('should support the config setter for device center compatibility', () => {
        const config: Config = {
          device_id: 'test_id',
          title: 'Test Title',
        };
        card.config = config;
        expect((card as any)._config).to.equal(config);
      });
    });

    describe('getConfigElement', () => {
      it('should return correct editor element', () => {
        const editor = ZWaveController.getConfigElement();
        expect(editor.tagName.toLowerCase()).to.equal('basic-editor');
        expect((editor as any).schema).to.be.an('array');
        expect((editor as any).schema.length).to.equal(2);
        expect((editor as any).schema[0].name).to.equal('device_id');
        expect((editor as any).schema[1].name).to.equal('title');
      });
    });

    describe('_getController', () => {
      it('should find controller by device_id when specified', () => {
        const mockDevice: ZWaveDevice = {
          id: 'test_controller_id',
          name: 'Test Controller',
        };

        getHassDeviceIfZWaveStub.returns(mockDevice);
        const controller = {} as Controller;
        (card as any)._hass = mockHass;
        const result = (card as any)._getController(controller);

        expect(
          getHassDeviceIfZWaveStub.calledOnceWith(
            mockHass,
            'test_controller_id',
          ),
        ).to.be.true;
        expect(result).to.equal(mockDevice);
        expect(controller.error).to.be.undefined;
      });

      it('should set error when device_id is invalid', () => {
        getHassDeviceIfZWaveStub.returns(undefined);

        const controller = {} as Controller;
        const result = (card as any)._getController(controller);

        expect(result).to.be.undefined;
        expect(controller.error).to.equal('Invalid Z-Wave device configured.');
      });

      it('should find first controller when no device_id is specified', () => {
        const mockController: ZWaveDevice = {
          id: 'auto_controller_id',
          name: 'Auto Controller',
        };

        card.setConfig({} as Config);
        (card as any)._hass = mockHass;
        getZWaveControllersStub.returns([mockController]);

        const controller = {} as Controller;
        const result = (card as any)._getController(controller);

        expect(getZWaveControllersStub.calledOnceWith(mockHass)).to.be.true;
        expect(result).to.equal(mockController);
        expect(controller.error).to.be.undefined;
      });

      it('should set error when multiple controllers are found and no device_id is specified', () => {
        card.setConfig({} as Config);
        getZWaveControllersStub.returns([
          { id: 'controller1', name: 'Controller 1' },
          { id: 'controller2', name: 'Controller 2' },
        ]);

        const controller = {} as Controller;
        const result = (card as any)._getController(controller);

        expect(result).to.be.undefined;
        expect(controller.error).to.equal(
          'Multiple Z-Wave controllers found. Please specify one.',
        );
      });

      it('should set error when no controllers are found and no device_id is specified', () => {
        card.setConfig({} as Config);
        card.hass = mockHass;
        getZWaveControllersStub.returns([]);

        const controller = {} as Controller;
        const result = (card as any)._getController(controller);

        expect(result).to.be.undefined;
        expect((card as any)._controller.error).to.equal(
          'No Z-Wave controller found.',
        );
      });
    });

    describe('hass property setter', () => {
      it('should identify and configure a controller correctly', () => {
        const mockDevice = {
          id: 'test_controller_id',
          name: 'Z-Wave Controller',
        };

        const mockConnectedDevices = [
          { id: 'device1', name: 'Z-Wave Device 1' },
          { id: 'device2', name: 'Z-Wave Device 2' },
        ];

        getHassDeviceIfZWaveStub.returns(mockDevice);
        getZWaveNonHubsStub.returns(mockConnectedDevices);

        // Simulate the controller status and RSSI entities
        processDeviceEntitiesStub.callsFake((hass, deviceId, callback) => {
          const statusEntity: Entity = {
            entity_id: 'sensor.controller_status',
            device_id: 'test_controller_id',
            translation_key: 'controller_status',
          };

          const rssiEntity: Entity = {
            entity_id: 'sensor.controller_rssi',
            device_id: 'test_controller_id',
            translation_key: 'current_background_rssi',
          };

          const statusState = s('sensor.controller_status', 'online');
          const rssiState = s('sensor.controller_rssi', '-65');

          callback(statusEntity, statusState);
          callback(rssiEntity, rssiState);

          return true; // Is a controller
        });

        card.hass = mockHass;

        // Verify controller is configured correctly
        expect((card as any)._controller.name).to.equal('Z-Wave Controller');
        expect((card as any)._controller.statusEntity.state).to.equal('online');
        expect((card as any)._controller.rssiEntities).to.have.lengthOf(1);
        expect((card as any)._controller.rssiEntities[0].state).to.equal('-65');
        expect((card as any)._controller.connectedDevices).to.equal(
          mockConnectedDevices,
        );
        expect((card as any)._controller.error).to.be.undefined;
      });

      it('should set error when device is not a controller', () => {
        const mockDevice = {
          id: 'test_device_id',
          name: 'Non-Controller Device',
        };

        getHassDeviceIfZWaveStub.returns(mockDevice);
        processDeviceEntitiesStub.returns(false); // Not a controller

        card.hass = mockHass;

        expect((card as any)._controller.error).to.equal(
          "Doesn't seem to be a Z-Wave Controller..",
        );
      });

      it('should not update controller if no changes detected', () => {
        const mockDevice = {
          id: 'test_controller_id',
          name: 'Z-Wave Controller',
        };

        const mockController: Controller = {
          name: 'Z-Wave Controller',
          statusEntity: s('sensor.controller_status', 'online'),
          rssiEntities: [s('sensor.controller_rssi', '-65')],
          connectedDevices: [{ id: 'device1', name: 'Z-Wave Device 1' }],
        };

        (card as any)._controller = mockController;
        const originalController = (card as any)._controller;

        getHassDeviceIfZWaveStub.returns(mockDevice);
        processDeviceEntitiesStub.callsFake((hass, deviceId, callback) => {
          const statusEntity: Entity = {
            entity_id: 'sensor.controller_status',
            device_id: 'test_controller_id',
            translation_key: 'controller_status',
          };

          const rssiEntity: Entity = {
            entity_id: 'sensor.controller_rssi',
            device_id: 'test_controller_id',
            translation_key: 'current_background_rssi',
          };

          const statusState = s('sensor.controller_status', 'online');
          const rssiState = s('sensor.controller_rssi', '-65');

          callback(statusEntity, statusState);
          callback(rssiEntity, rssiState);

          return true;
        });

        getZWaveNonHubsStub.returns([
          { id: 'device1', name: 'Z-Wave Device 1' },
        ]);

        card.hass = mockHass;

        // Check that the controller reference is still the same
        // (fast-deep-equal should determine no changes happened)
        expect((card as any)._controller).to.equal(originalController);
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

    describe('connectedCallback/disconnectedCallback', () => {
      it('should add event listener when connected', () => {
        const addEventListenerSpy = stub(window, 'addEventListener');

        card.connectedCallback();

        expect(addEventListenerSpy.calledOnce).to.be.true;
        expect(addEventListenerSpy.firstCall.args[0]).to.equal(
          'hass-update-controller',
        );

        addEventListenerSpy.restore();
      });

      it('should remove event listener when disconnected', () => {
        const removeEventListenerSpy = stub(window, 'removeEventListener');

        card.disconnectedCallback();

        expect(removeEventListenerSpy.calledOnce).to.be.true;
        expect(removeEventListenerSpy.firstCall.args[0]).to.equal(
          'hass-update-controller',
        );

        removeEventListenerSpy.restore();
      });

      it('should update hass when receiving hass-update-controller event', () => {
        const hassUpdateSpy = stub(card, 'hass').set(() => {});

        const event = new CustomEvent('hass-update-controller', {
          detail: {
            hass: { foo: 'bar' },
          },
        });

        (card as any)._handleHassUpdate(event);

        expect(hassUpdateSpy.calledOnce).to.be.true;
        expect(hassUpdateSpy.firstCall.args[0]).to.deep.equal({ foo: 'bar' });

        hassUpdateSpy.restore();
      });
    });

    describe('getStubConfig', () => {
      it('should return config with first controller device_id', async () => {
        const mockControllers = [
          { id: 'controller_123', name: 'Test Controller' },
        ];

        getZWaveControllersStub.returns(mockControllers);

        const config = await ZWaveController.getStubConfig(mockHass);

        expect(getZWaveControllersStub.calledOnceWith(mockHass)).to.be.true;
        expect(config).to.deep.equal({ device_id: 'controller_123' });
      });

      it('should return empty device_id when no controllers exist', async () => {
        getZWaveControllersStub.returns([]);

        const config = await ZWaveController.getStubConfig(mockHass);

        expect(getZWaveControllersStub.calledOnceWith(mockHass)).to.be.true;
        expect(config).to.deep.equal({ device_id: '' });
      });
    });

    describe('render method', () => {
      it('should return nothing when controller is not initialized', async () => {
        (card as any)._controller = undefined;
        const result = card.render();
        expect(result).to.equal(nothing);
      });

      it('should render error message when controller has an error', async () => {
        (card as any)._controller = { error: 'Test error message' };

        card.render();

        expect(renderErrorStub.calledOnceWith('Test error message')).to.be.true;
      });

      it('should limit RSSI entities in preview mode', async () => {
        // Set up controller with multiple RSSI entities
        (card as any)._controller = {
          name: 'Test Controller',
          statusEntity: s('sensor.controller_status', 'online'),
          rssiEntities: [
            s('sensor.controller_rssi_1', '-65'),
            s('sensor.controller_rssi_2', '-70'),
          ],
          connectedDevices: [{ id: 'device1', name: 'Device 1' }],
        };

        // Mock isPreview to return true
        Object.defineProperty(card, 'isPreview', {
          get: () => true,
        });

        card.render();

        // Check that rssiEntities were limited to 1 in preview mode
        expect((card as any)._controller.rssiEntities.length).to.equal(1);
      });

      it('should render the controller name or title', async () => {
        // Set up controller and config
        (card as any)._controller = {
          name: 'Test Controller',
          statusEntity: s('sensor.controller_status', 'online'),
          rssiEntities: [],
          connectedDevices: [],
        };

        (card as any)._hass = mockHass;
        (card as any)._config = { title: 'Custom Title' };

        const el = await fixture(card.render() as TemplateResult);
        const nameElement = el.querySelector('.name');

        expect(nameElement?.textContent?.trim()).to.equal('Custom Title');

        // Test fallback to controller name when no title is provided
        (card as any)._config = {};

        const el2 = await fixture(card.render() as TemplateResult);
        const nameElement2 = el2.querySelector('.name');

        expect(nameElement2?.textContent?.trim()).to.equal('Test Controller');
      });

      it('should render RSSI entities with proper formatting', async () => {
        // Set up controller with RSSI entity
        (card as any)._controller = {
          name: 'Test Controller',
          statusEntity: s('sensor.controller_status', 'online'),
          rssiEntities: [s('sensor.controller_rssi', '-65')],
          connectedDevices: [],
        };

        (card as any)._hass = mockHass;

        card.render();

        // Verify the renderStateDisplay function was called correctly
        expect(renderStateDisplayStub.calledOnce).to.be.true;
        expect(renderStateDisplayStub.firstCall.args[2].state).to.equal('-65');
        expect(renderStateDisplayStub.firstCall.args[3]).to.include(
          'status-row',
        );
        expect(renderStateDisplayStub.firstCall.args[3]).to.include(
          'status-warning',
        );
        expect(renderStateDisplayStub.firstCall.args[5]).to.equal('RSSI 0:');
      });

      it('should render connected devices count', async () => {
        // Set up controller with connected devices
        (card as any)._controller = {
          name: 'Test Controller',
          statusEntity: s('sensor.controller_status', 'online'),
          rssiEntities: [],
          connectedDevices: [
            { id: 'device1', name: 'Device 1' },
            { id: 'device2', name: 'Device 2' },
          ],
        };

        (card as any)._hass = mockHass;

        const el = await fixture(card.render() as TemplateResult);

        const devicesCount = el.querySelector('.devices-count');
        expect(devicesCount?.textContent?.trim()).to.equal(
          '2 Connected Devices',
        );
      });

      it('should render chevron toggle', async () => {
        // Set up controller
        (card as any)._controller = {
          name: 'Test Controller',
          statusEntity: s('sensor.controller_status', 'online'),
          rssiEntities: [],
          connectedDevices: [{ id: 'device1', name: 'Device 1' }],
        };

        (card as any)._hass = mockHass;
        (card as any).expanded = true;

        card.render();

        // Verify the renderChevronToggle function was called with correct params
        expect(renderChevronToggleStub.calledOnce).to.be.true;
        expect(renderChevronToggleStub.firstCall.args[0]).to.be.true; // expanded
        expect(renderChevronToggleStub.firstCall.args[2]).to.equal(
          'bottom-right',
        );
      });

      it('should not show devices list when not expanded', async () => {
        // Set up controller with devices
        (card as any)._controller = {
          name: 'Test Controller',
          statusEntity: s('sensor.controller_status', 'online'),
          rssiEntities: [],
          connectedDevices: [{ id: 'device1', name: 'Device 1' }],
        };

        (card as any)._hass = mockHass;
        (card as any).expanded = false;

        const el = await fixture(card.render() as TemplateResult);

        const devicesList = el.querySelector('.devices-list');
        expect(devicesList).to.not.exist;
      });

      it('should show devices list when expanded', async () => {
        // Set up controller with devices
        (card as any)._controller = {
          name: 'Test Controller',
          statusEntity: s('sensor.controller_status', 'online'),
          rssiEntities: [],
          connectedDevices: [
            { id: 'device1', name: 'Device 1' },
            { id: 'device2', name: 'Device 2' },
          ],
        };

        (card as any)._hass = mockHass;
        (card as any).expanded = true;

        // Create a simulated render that returns actual HTML instead of using the stubbed renderChevronToggle
        renderChevronToggleStub.restore();

        const el = await fixture(card.render() as TemplateResult);

        const devicesList = el.querySelector('.devices-list');
        expect(devicesList).to.exist;

        const deviceItems = devicesList?.querySelectorAll('.device-item');
        expect(deviceItems?.length).to.equal(2);
      });
    });
  });
});
