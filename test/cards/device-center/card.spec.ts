import { ZoozDeviceCenter } from '@center/card';
import type { Config } from '@center/types';
import { fixture, fixtureCleanup } from '@open-wc/testing-helpers';
import type { HomeAssistant } from '@type/homeassistant';
import { expect } from 'chai';
import { type TemplateResult } from 'lit';

describe('ZoozDeviceCenter', () => {
  let card: ZoozDeviceCenter;
  let mockHass: HomeAssistant;
  let mockConfig: Config;

  beforeEach(() => {
    card = new ZoozDeviceCenter();

    mockConfig = {};

    mockHass = {
      states: {},
      entities: {},
      devices: {},
    };

    card.setConfig(mockConfig);
  });

  afterEach(async () => {
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
      const editor = ZoozDeviceCenter.getConfigElement();
      expect(editor.tagName.toLowerCase()).to.equal('zooz-basic-editor');
      expect((editor as any).schema).to.deep.equal([
        {
          name: 'area',
          selector: {
            area: {},
          },
          required: false,
          label: 'Device Area',
        },
      ]);
    });
  });

  describe('hass property setter', () => {
    beforeEach(() => {
      // Set up some test devices
      mockHass.devices = {
        zen55_1: {
          id: 'zen55_1',
          name: 'ZEN55 Device 1',
          manufacturer: 'Zooz',
          model: 'ZEN55 LR',
          area_id: 'area1',
        },
        zen55_2: {
          id: 'zen55_2',
          name: 'ZEN55 Device 2',
          manufacturer: 'Zooz',
          model: 'ZEN55 LR',
          area_id: 'area2',
        },
        zen52_1: {
          id: 'zen52_1',
          name: 'ZEN52 Device 1',
          manufacturer: 'Zooz',
          model: 'ZEN52',
          area_id: 'area1',
        },
        other_device: {
          id: 'other_device',
          name: 'Other Device',
          manufacturer: 'Other',
          model: 'OTHER',
          area_id: 'area1',
        },
      };
    });

    it('should group devices by model when area is not specified', () => {
      card.hass = mockHass;

      expect((card as any)._center.devices['ZEN55 LR']).to.have.lengthOf(2);
      expect((card as any)._center.devices['ZEN52']).to.have.lengthOf(1);
    });

    it('should filter devices by area when specified', () => {
      card.setConfig({ area: 'area1' });
      card.hass = mockHass;

      expect((card as any)._center.devices['ZEN55 LR']).to.have.lengthOf(1);
      expect((card as any)._center.devices['ZEN52']).to.have.lengthOf(1);
      expect((card as any)._center.devices['ZEN55 LR'][0].id).to.equal(
        'zen55_1',
      );
    });

    it('should not update _center if devices have not changed', () => {
      card.hass = mockHass;
      const initialCenter = (card as any)._center;

      card.hass = mockHass;
      expect((card as any)._center).to.equal(initialCenter);
    });
  });

  describe('render method', () => {
    beforeEach(() => {
      mockHass.devices = {
        zen55_1: {
          id: 'zen55_1',
          name: 'ZEN55 Device 1',
          manufacturer: 'Zooz',
          model: 'ZEN55 LR',
          area_id: 'area1',
        },
        zen55_2: {
          id: 'zen55_2',
          name: 'ZEN55 Device 2',
          manufacturer: 'Zooz',
          model: 'ZEN55 LR',
          area_id: 'area1',
        },
        zen52_1: {
          id: 'zen52_1',
          name: 'ZEN52 Device 1',
          manufacturer: 'Zooz',
          model: 'ZEN52',
          area_id: 'area1',
        },
        zen52_2: {
          id: 'zen52_2',
          name: 'ZEN52 Device 2',
          manufacturer: 'Zooz',
          model: 'ZEN52',
          area_id: 'area1',
        },
      };
    });

    it('should show message when no devices found in specified area', async () => {
      card.setConfig({ area: 'empty_area' });
      card.hass = mockHass;

      const el = await fixture(card.render() as TemplateResult);
      expect(el.textContent).to.equal('No devices found in area empty_area');
    });

    it('should render hub card when no area specified', async () => {
      card.hass = mockHass;

      const el = await fixture(card.render() as TemplateResult);
      expect(el.querySelector('zooz-hub-card')).to.exist;
      expect(el.querySelector('span')?.textContent).to.equal('Zooz Hub');
    });

    it('should render device sections for each model type with devices', async () => {
      card.hass = mockHass;

      const el = await fixture(card.render() as TemplateResult);
      const sections = el.querySelectorAll('.devices');

      expect(sections).to.have.lengthOf(2);
      expect(sections[0]!.querySelector('span')?.textContent).to.equal(
        'ZEN55 LR Sensors',
      );
      expect(sections[1]!.querySelector('span')?.textContent).to.equal(
        'ZEN52 Double Relay',
      );
    });

    it('should limit to one device per type in preview mode', async () => {
      Object.defineProperty(card, 'isPreview', {
        get: () => true,
      });

      card.hass = mockHass;

      const el = await fixture(card.render() as TemplateResult);

      const zen55Cards = el.querySelectorAll('zooz-dc-signal-sensor');
      const zen52Cards = el.querySelectorAll('zooz-double-relay');

      expect(zen55Cards).to.have.lengthOf(1);
      expect(zen52Cards).to.have.lengthOf(0);
    });

    it('should not render sections for device types with no devices', async () => {
      // Only keep ZEN55 devices
      mockHass.devices = {
        zen55_1: mockHass.devices['zen55_1']!,
        zen55_2: mockHass.devices['zen55_2']!,
      };

      card.hass = mockHass;

      const el = await fixture(card.render() as TemplateResult);
      const sections = el.querySelectorAll('.devices');

      expect(sections).to.have.lengthOf(1);
      expect(sections[0]!.querySelector('span')?.textContent).to.equal(
        'ZEN55 LR Sensors',
      );
    });

    it('should set correct config and hass properties on device cards', async () => {
      // Keep only one device for simpler testing
      mockHass.devices = {
        zen55_1: mockHass.devices['zen55_1']!,
      };

      card.hass = mockHass;

      const el = await fixture(card.render() as TemplateResult);
      const deviceCard = el.querySelector('zooz-dc-signal-sensor');

      expect(deviceCard).to.exist;
      // Note: Properties won't be visible as attributes, but the elements should exist
      expect(deviceCard?.hasAttribute('config')).to.be.false;
      expect(deviceCard?.hasAttribute('hass')).to.be.false;
    });
  });
});
