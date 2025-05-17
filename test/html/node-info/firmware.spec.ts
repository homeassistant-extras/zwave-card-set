import { firmware } from '@/html/node-info/firmware';
import * as actionHandlerModule from '@common/action-handler';
import type { Config, Sensor } from '@node/types';
import { fixture } from '@open-wc/testing-helpers';
import { createState as s } from '@test/test-helpers';
import type { ActionHandlerEvent } from '@type/action';
import type { HomeAssistant } from '@type/homeassistant';
import { expect } from 'chai';
import { html, type TemplateResult } from 'lit';
import { stub } from 'sinon';

export default () => {
  describe('firmware.ts', () => {
    let mockElement: HTMLElement;
    let mockHass: HomeAssistant;
    let mockConfig: Config;
    let actionHandlerStub: sinon.SinonStub;
    let handleClickActionStub: sinon.SinonStub;
    let moreInfoActionStub: sinon.SinonStub;

    beforeEach(() => {
      // Create mock element and Home Assistant object
      mockElement = document.createElement('div');
      mockHass = {
        states: {
          'update.device_firmware': s('update.device_firmware', 'available', {
            device_class: 'firmware',
          }),
          'sensor.device_battery': s('sensor.device_battery', '75', {
            device_class: 'battery',
            state_class: 'measurement',
          }),
        },
        entities: {},
        devices: {},
      } as any as HomeAssistant;

      // Create mock config
      mockConfig = {
        device_id: 'test_device_id',
        title: 'Test Device',
        icon: 'mdi:test',
      };

      // Stub action handler functions
      actionHandlerStub = stub(actionHandlerModule, 'actionHandler').returns(
        'mock-action-handler',
      );
      handleClickActionStub = stub(
        actionHandlerModule,
        'handleClickAction',
      ).returns({
        handleEvent: (ev: ActionHandlerEvent): void => {},
      });
      moreInfoActionStub = stub(actionHandlerModule, 'moreInfoAction').returns({
        entity: 'update.device_firmware',
        tap_action: { action: 'more-info' },
      });
    });

    afterEach(() => {
      actionHandlerStub.restore();
      handleClickActionStub.restore();
      moreInfoActionStub.restore();
    });

    it('should render firmware info with battery indicator when battery state is available', async () => {
      // Create sensor with battery state
      const sensor = {
        name: 'Device Name',
        manufacturer: 'Test Manufacturer',
        model: 'Test Model',
        firmwareState: s('update.device_firmware', 'available', {
          device_class: 'firmware',
        }),
        batteryState: s('sensor.device_battery', '75', {
          device_class: 'battery',
          state_class: 'measurement',
        }),
      } as Sensor;

      // Render the firmware component
      const result = firmware(mockElement, mockHass, mockConfig, sensor);

      // Create a fixture for testing
      const el = await fixture(result as TemplateResult);

      // Check that the battery indicator is rendered
      const batteryIndicator = el.querySelector('battery-indicator');
      expect(batteryIndicator).to.exist;
      expect((batteryIndicator as any).level).to.equal(75);

      // Check that firmware info is rendered
      const firmwareInfo = el.querySelector('.firmware-info');
      expect(firmwareInfo).to.exist;

      // Check title and status label
      const title = firmwareInfo?.querySelector('.title');
      expect(title?.textContent).to.equal('Test Device'); // Should use config.title

      const statusLabel = firmwareInfo?.querySelector('.status-label');
      expect(statusLabel?.textContent?.trim()).to.equal(
        'Test Model by Test Manufacturer',
      );

      // Verify action handlers were called correctly
      expect(moreInfoActionStub.called).to.be.true;
      expect(handleClickActionStub.called).to.be.true;
      expect(actionHandlerStub.called).to.be.true;
    });

    it('should render firmware info with icon when battery state is not available', async () => {
      // Create sensor without battery state
      const sensor = {
        name: 'Device Name',
        manufacturer: 'Test Manufacturer',
        model: 'Test Model',
        firmwareState: s('update.device_firmware', 'available', {
          device_class: 'firmware',
        }),
      } as Sensor;

      // Make sure stateIcon is called correctly
      const stateIconStub = stub().returns(html`<div class="mock-icon"></div>`);
      const originalStateIcon = require('@/html/state-icon').stateIcon;
      require('@/html/state-icon').stateIcon = stateIconStub;

      // Render the firmware component
      const result = firmware(mockElement, mockHass, mockConfig, sensor);

      // Create a fixture for testing
      const el = await fixture(result as TemplateResult);

      // Check that state icon is rendered (not battery indicator)
      const batteryIndicator = el.querySelector('battery-indicator');
      expect(batteryIndicator).to.not.exist;

      expect(stateIconStub.called).to.be.true;
      expect(stateIconStub.firstCall.args[0]).to.equal(mockElement);
      expect(stateIconStub.firstCall.args[1]).to.equal(mockHass);
      expect(stateIconStub.firstCall.args[2]).to.equal(sensor.firmwareState);
      expect(stateIconStub.firstCall.args[4]).to.equal('mdi:test'); // Should use config.icon

      // Check firmware info
      const firmwareInfo = el.querySelector('.firmware-info');
      expect(firmwareInfo).to.exist;

      // Restore original stateIcon
      require('@/html/state-icon').stateIcon = originalStateIcon;
    });

    it('should use sensor name when config title is not provided', async () => {
      // Create sensor and config without title
      const sensor = {
        name: 'Device Name',
        manufacturer: 'Test Manufacturer',
        model: 'Test Model',
        firmwareState: s('update.device_firmware', 'available', {
          device_class: 'firmware',
        }),
      } as Sensor;

      const configWithoutTitle = {
        device_id: 'test_device_id',
        icon: 'mdi:test',
      };

      // Render the firmware component
      const result = firmware(
        mockElement,
        mockHass,
        configWithoutTitle,
        sensor,
      );

      // Create a fixture for testing
      const el = await fixture(result as TemplateResult);

      // Check title uses sensor name
      const title = el.querySelector('.title');
      expect(title?.textContent).to.equal('Device Name');
    });

    it('should handle missing manufacturer or model', async () => {
      // Create sensor with missing manufacturer and model
      const sensor = {
        name: 'Device Name',
        firmwareState: s('update.device_firmware', 'available', {
          device_class: 'firmware',
        }),
      } as Sensor;

      // Render the firmware component
      const result = firmware(mockElement, mockHass, mockConfig, sensor);

      // Create a fixture for testing
      const el = await fixture(result as TemplateResult);

      // Check status label handles missing info
      const statusLabel = el.querySelector('.status-label');
      expect(statusLabel?.textContent?.trim()).to.equal('by');
    });

    it('should use default Z-Wave icon when config icon is not provided', async () => {
      // Create sensor and config without icon
      const sensor = {
        name: 'Device Name',
        manufacturer: 'Test Manufacturer',
        model: 'Test Model',
        firmwareState: s('update.device_firmware', 'available', {
          device_class: 'firmware',
        }),
      } as Sensor;

      const configWithoutIcon = {
        device_id: 'test_device_id',
        title: 'Test Device',
      };

      // Mock stateIcon function
      const stateIconStub = stub().returns(html`<div class="mock-icon"></div>`);
      const originalStateIcon = require('@/html/state-icon').stateIcon;
      require('@/html/state-icon').stateIcon = stateIconStub;

      // Render the firmware component
      const result = firmware(mockElement, mockHass, configWithoutIcon, sensor);

      // Create a fixture for testing
      await fixture(result as TemplateResult);

      // Check that default Z-Wave icon is used
      expect(stateIconStub.called).to.be.true;
      expect(stateIconStub.firstCall.args[4]).to.equal('mdi:z-wave');

      // Restore original stateIcon
      require('@/html/state-icon').stateIcon = originalStateIcon;
    });
  });
};
