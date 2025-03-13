import { ZWaveDeviceCenter } from '@center/card';
import type { Config } from '@center/types';
import { fixture, fixtureCleanup } from '@open-wc/testing-helpers';
import type { HomeAssistant } from '@type/homeassistant';
import * as hassUtils from '@util/hass';
import { expect } from 'chai';
import { type TemplateResult } from 'lit';
import { stub } from 'sinon';

describe('ZWaveDeviceCenter', () => {
  let card: ZWaveDeviceCenter;
  let mockHass: HomeAssistant;
  let mockConfig: Config;
  let getZWaveByAreaStub: sinon.SinonStub;

  beforeEach(() => {
    card = new ZWaveDeviceCenter();

    mockConfig = {
      features: ['show_headers'],
    };

    mockHass = {
      states: {},
      entities: {},
      devices: {},
    } as HomeAssistant;

    // Stub the getZWaveByArea function to control test data
    getZWaveByAreaStub = stub(hassUtils, 'getZWaveByArea');

    card.setConfig(mockConfig);
  });

  afterEach(async () => {
    getZWaveByAreaStub.restore();
    await fixtureCleanup();
  });

  describe('setConfig', () => {
    it('should set the configuration correctly', () => {
      const config: Config = { area: 'test_area' };
      card.setConfig(config);
      expect((card as any)._config).to.equal(config);
    });
  });

  describe('getConfigElement', () => {
    it('should return correct editor element with schema', () => {
      const editor = ZWaveDeviceCenter.getConfigElement();
      expect(editor.tagName.toLowerCase()).to.equal('basic-editor');
      expect((editor as any).schema).to.deep.equal([
        {
          name: 'area',
          selector: {
            area: {},
          },
          required: false,
          label: 'Device Area',
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
                {
                  label: 'Show the Manufacturer and Model Headers',
                  value: 'show_headers',
                },
              ],
            },
          },
        },
      ]);
    });
  });

  describe('hass property setter', () => {
    beforeEach(() => {
      // Create test devices
      const testDevices = [
        {
          id: 'device1',
          device_name: 'Device 1',
          manufacturer: 'Zooz',
          model: 'ZEN71',
          identifiers: [['zwave_js', '123']],
          area_id: 'area1',
        },
        {
          id: 'device2',
          device_name: 'Device 2',
          manufacturer: 'Zooz',
          model: 'ZEN71',
          identifiers: [['zwave_js', '456']],
          area_id: 'area1',
        },
        {
          id: 'device3',
          device_name: 'Device 3',
          manufacturer: 'GE',
          model: 'Switch',
          identifiers: [['zwave_js', '789']],
          area_id: 'area1',
        },
        {
          id: 'device4',
          device_name: 'Device 4',
          manufacturer: 'Zooz',
          model: 'ZEN51',
          identifiers: [['zwave_js', '101']],
          area_id: 'area2',
        },
      ];

      // Set default return value
      getZWaveByAreaStub.returns(testDevices);
    });

    it('should group devices by manufacturer and model', () => {
      card.hass = mockHass;

      // Check that manufacturer grouping exists
      expect((card as any)._center.devices).to.have.property('Zooz');
      expect((card as any)._center.devices).to.have.property('GE');

      // Check model grouping within manufacturers
      expect((card as any)._center.devices['Zooz']).to.have.property(
        'ZEN71 Device 1',
      );
      expect((card as any)._center.devices['Zooz']).to.have.property(
        'ZEN71 Device 2',
      );
      expect((card as any)._center.devices['Zooz']).to.have.property(
        'ZEN51 Device 4',
      );
      expect((card as any)._center.devices['GE']).to.have.property(
        'Switch Device 3',
      );

      // Check device arrays within model groups
      expect(
        (card as any)._center.devices['Zooz']['ZEN71 Device 1'],
      ).to.have.lengthOf(1);
      expect(
        (card as any)._center.devices['Zooz']['ZEN71 Device 2'],
      ).to.have.lengthOf(1);
      expect(
        (card as any)._center.devices['Zooz']['ZEN51 Device 4'],
      ).to.have.lengthOf(1);
      expect(
        (card as any)._center.devices['GE']['Switch Device 3'],
      ).to.have.lengthOf(1);
    });

    it('should handle missing manufacturer information', () => {
      const devicesWithMissingInfo = [
        {
          id: 'device5',
          device_name: 'Device 5',
          // No manufacturer property
          model: 'TestModel',
          identifiers: [['zwave_js', '123']],
          area_id: 'area1',
        },
      ];

      getZWaveByAreaStub.returns(devicesWithMissingInfo);

      card.hass = mockHass;

      // Should use "unknown_manufacturer" and still group the device correctly
      expect((card as any)._center.devices).to.have.property(
        'unknown_manufacturer',
      );
      expect(
        (card as any)._center.devices['unknown_manufacturer'],
      ).to.have.property('TestModel Device 5');
    });

    it('should handle missing model information', () => {
      const devicesWithMissingInfo = [
        {
          id: 'device6',
          device_name: 'Device 6',
          manufacturer: 'TestManufacturer',
          // No model property
          identifiers: [['zwave_js', '123']],
          area_id: 'area1',
        },
      ];

      getZWaveByAreaStub.returns(devicesWithMissingInfo);

      card.hass = mockHass;

      // Should use "unknown_model" and still group the device correctly
      expect((card as any)._center.devices).to.have.property(
        'TestManufacturer',
      );
      expect(
        (card as any)._center.devices['TestManufacturer'],
      ).to.have.property('unknown_model Device 6');
    });

    it('should filter devices by area when specified', () => {
      card.setConfig({ area: 'area1' });
      card.hass = mockHass;

      // Check that getZWaveByArea was called with the area parameter
      expect(getZWaveByAreaStub.calledOnceWith(mockHass, 'area1')).to.be.true;
    });

    it('should not update _center if devices have not changed', () => {
      card.hass = mockHass;
      const initialCenter = (card as any)._center;

      // Call hass setter again with the same data
      card.hass = mockHass;

      // Center should not be replaced (reference equality)
      expect((card as any)._center).to.equal(initialCenter);
    });
  });

  describe('render method', () => {
    it('should show message when no devices found in specified area', async () => {
      card.setConfig({ area: 'empty_area' });
      getZWaveByAreaStub.returns([]);
      card.hass = mockHass;

      const el = await fixture(card.render() as TemplateResult);
      expect(el.textContent).to.equal('No devices found in area empty_area');
    });

    it('should not render headers when show_headers feature is not enabled', async () => {
      const testDevices = [
        {
          id: 'device1',
          device_name: 'Device 1',
          manufacturer: 'Zooz',
          model: 'ZEN71',
          identifiers: [['zwave_js', '123']],
          area_id: 'area1',
        },
      ];

      getZWaveByAreaStub.returns(testDevices);
      card.setConfig({ features: [] });
      card.hass = mockHass;

      const el = await fixture(card.render() as TemplateResult);

      // No headers should be rendered
      const manufacturerHeading = el.querySelector('h1');
      const modelHeading = el.querySelector('h2');

      expect(manufacturerHeading).to.be.null;
      expect(modelHeading).to.be.null;
    });

    it('should render headers when show_headers feature is enabled', async () => {
      const testDevices = [
        {
          id: 'device1',
          device_name: 'Device 1',
          manufacturer: 'Zooz',
          model: 'ZEN71',
          identifiers: [['zwave_js', '123']],
          area_id: 'area1',
        },
      ];

      card.setConfig({ features: ['show_headers'] });
      getZWaveByAreaStub.returns(testDevices);
      card.hass = mockHass;

      const el = await fixture(card.render() as TemplateResult);

      // Headers should be rendered
      const manufacturerHeading = el.querySelector('h1');
      const modelHeading = el.querySelector('h2');

      expect(manufacturerHeading?.textContent).to.equal('Zooz');
      expect(modelHeading?.textContent).to.equal('ZEN71 Device 1');
    });

    it('should pass features to zwave-device component', async () => {
      const testDevices = [
        {
          id: 'device1',
          device_name: 'Device 1',
          manufacturer: 'Zooz',
          model: 'ZEN71',
          identifiers: [['zwave_js', '123']],
          area_id: 'area1',
        },
      ];

      card.setConfig({
        features: ['use_icons_instead_of_names'],
      });
      getZWaveByAreaStub.returns(testDevices);
      card.hass = mockHass;

      const el = await fixture(card.render() as TemplateResult);

      // Check zwave-device element
      const nodeInfoElement = el.querySelector('zwave-device');
      const nodeInfoConfig = (nodeInfoElement as any).config;

      expect(nodeInfoConfig.features).to.deep.equal([
        'use_icons_instead_of_names',
      ]);
    });

    it('should pass showController flag to zwave-device component', async () => {
      const testDevices = [
        {
          id: 'device1',
          device_name: 'Device 1',
          manufacturer: 'Zooz',
          model: 'ZEN71',
          identifiers: [['zwave_js', '123']],
          area_id: 'area1',
        },
      ];

      getZWaveByAreaStub.returns(testDevices);
      card.hass = mockHass;

      const el = await fixture(card.render() as TemplateResult);

      // Check zwave-device element
      const nodeInfoElement = el.querySelector('zwave-device');

      expect((nodeInfoElement as any).showController).to.be.true;
    });

    it('should render manufacturer and model sections', async () => {
      // Set up test devices for rendering
      const testDevices = [
        {
          id: 'device1',
          device_name: 'Light Switch',
          manufacturer: 'Zooz',
          model: 'ZEN71',
          identifiers: [['zwave_js', '123']],
          area_id: 'area1',
        },
        {
          id: 'device2',
          device_name: 'Garage Door',
          manufacturer: 'Zooz',
          model: 'ZEN51',
          identifiers: [['zwave_js', '456']],
          area_id: 'area1',
        },
      ];

      getZWaveByAreaStub.returns(testDevices);
      card.hass = mockHass;

      const el = await fixture(card.render() as TemplateResult);

      // Check manufacturer heading
      const manufacturerHeading = el.querySelector('h1');
      expect(manufacturerHeading?.textContent).to.equal('Zooz');

      // Check model headings
      const modelHeadings = el.querySelectorAll('h2');
      expect(modelHeadings).to.have.lengthOf(2);

      const headingTexts = Array.from(modelHeadings).map((h) => h.textContent);
      expect(headingTexts).to.include('ZEN71 Light Switch');
      expect(headingTexts).to.include('ZEN51 Garage Door');
    });

    it('should render zwave-device for each device', async () => {
      const testDevices = [
        {
          id: 'device1',
          device_name: 'Device 1',
          manufacturer: 'Zooz',
          model: 'ZEN71',
          identifiers: [['zwave_js', '123']],
          area_id: 'area1',
        },
        {
          id: 'device2',
          device_name: 'Device 2',
          manufacturer: 'Zooz',
          model: 'ZEN51',
          identifiers: [['zwave_js', '456']],
          area_id: 'area1',
        },
      ];

      getZWaveByAreaStub.returns(testDevices);
      card.hass = mockHass;

      const el = await fixture(card.render() as TemplateResult);

      // Check that zwave-device elements are created for each device
      const nodeInfoElements = el.querySelectorAll('zwave-device');
      expect(nodeInfoElements).to.have.lengthOf(2);

      // Check that device IDs are passed correctly to the node info components
      const nodeInfoConfigs = Array.from(nodeInfoElements).map(
        (el) => (el as any).config,
      );

      expect(nodeInfoConfigs).to.deep.include({
        device_id: 'device1',
        features: [],
      });
      expect(nodeInfoConfigs).to.deep.include({
        device_id: 'device2',
        features: [],
      });
    });

    it('should limit to one device in preview mode', async () => {
      const testDevices = [
        {
          id: 'device1',
          device_name: 'Device 1',
          manufacturer: 'Zooz',
          model: 'ZEN71',
          identifiers: [['zwave_js', '123']],
          area_id: 'area1',
        },
        {
          id: 'device2',
          device_name: 'Device 2',
          manufacturer: 'Zooz',
          model: 'ZEN51',
          identifiers: [['zwave_js', '456']],
          area_id: 'area1',
        },
        {
          id: 'device3',
          device_name: 'Device 3',
          manufacturer: 'GE',
          model: 'Switch',
          identifiers: [['zwave_js', '789']],
          area_id: 'area1',
        },
      ];

      getZWaveByAreaStub.returns(testDevices);

      // Set preview mode to true
      Object.defineProperty(card, 'isPreview', {
        get: () => true,
      });

      card.hass = mockHass;

      const el = await fixture(card.render() as TemplateResult);

      // In preview mode, should only show one node-info component
      const nodeInfoElements = el.querySelectorAll('zwave-device');
      expect(nodeInfoElements).to.have.lengthOf(1);
    });

    it('should pass hass property to node-info components', async () => {
      const testDevices = [
        {
          id: 'device1',
          device_name: 'Device 1',
          manufacturer: 'Zooz',
          model: 'ZEN71',
          identifiers: [['zwave_js', '123']],
          area_id: 'area1',
        },
      ];

      getZWaveByAreaStub.returns(testDevices);
      card.hass = mockHass;

      const el = await fixture(card.render() as TemplateResult);

      const nodeInfoElement = el.querySelector('zwave-device');
      expect(nodeInfoElement).to.exist;
      expect((nodeInfoElement as any).hass).to.equal(mockHass);
    });
  });
});
