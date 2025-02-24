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
      // Set up test devices for all supported models
      mockHass.devices = {
        zen04_1: {
          id: 'zen04_1',
          name: 'ZEN04 Smart Plug 1',
          manufacturer: 'Zooz',
          model: 'ZEN04 800LR',
          area_id: 'area1',
        },
        zen04_2: {
          id: 'zen04_2',
          name: 'ZEN04 Smart Plug 2',
          manufacturer: 'Zooz',
          model: 'ZEN04 800LR',
          area_id: 'area2',
        },
        zen30_1: {
          id: 'zen30_1',
          name: 'ZEN30 Double Switch 1',
          manufacturer: 'Zooz',
          model: 'ZEN30',
          area_id: 'area1',
        },
        zen51_1: {
          id: 'zen51_1',
          name: 'ZEN51 Dry Contact 1',
          manufacturer: 'Zooz',
          model: 'ZEN51',
          area_id: 'area1',
        },
        zen52_1: {
          id: 'zen52_1',
          name: 'ZEN52 Double Relay 1',
          manufacturer: 'Zooz',
          model: 'ZEN52',
          area_id: 'area1',
        },
        zen55_1: {
          id: 'zen55_1',
          name: 'ZEN55 Sensor 1',
          manufacturer: 'Zooz',
          model: 'ZEN55 LR',
          area_id: 'area1',
        },
        zen71_1: {
          id: 'zen71_1',
          name: 'ZEN71 Switch 1',
          manufacturer: 'Zooz',
          model: 'ZEN71',
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

    it('should group all device types when area is not specified', () => {
      card.hass = mockHass;

      expect((card as any)._center.devices['ZEN04 800LR']).to.have.lengthOf(2);
      expect((card as any)._center.devices['ZEN30']).to.have.lengthOf(1);
      expect((card as any)._center.devices['ZEN51']).to.have.lengthOf(1);
      expect((card as any)._center.devices['ZEN52']).to.have.lengthOf(1);
      expect((card as any)._center.devices['ZEN55 LR']).to.have.lengthOf(1);
      expect((card as any)._center.devices['ZEN71']).to.have.lengthOf(1);
    });

    it('should filter devices by area when specified', () => {
      card.setConfig({ area: 'area1' });
      card.hass = mockHass;

      expect((card as any)._center.devices['ZEN04 800LR']).to.have.lengthOf(1);
      expect((card as any)._center.devices['ZEN30']).to.have.lengthOf(1);
      expect((card as any)._center.devices['ZEN51']).to.have.lengthOf(1);
      expect((card as any)._center.devices['ZEN52']).to.have.lengthOf(1);
      expect((card as any)._center.devices['ZEN55 LR']).to.have.lengthOf(1);
      expect((card as any)._center.devices['ZEN71']).to.have.lengthOf(1);
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
      // Set up complete test devices set in area1
      mockHass.devices = {
        zen04_1: {
          id: 'zen04_1',
          name: 'ZEN04 Smart Plug 1',
          manufacturer: 'Zooz',
          model: 'ZEN04 800LR',
          area_id: 'area1',
        },
        zen30_1: {
          id: 'zen30_1',
          name: 'ZEN30 Double Switch 1',
          manufacturer: 'Zooz',
          model: 'ZEN30',
          area_id: 'area1',
        },
        zen51_1: {
          id: 'zen51_1',
          name: 'ZEN51 Dry Contact 1',
          manufacturer: 'Zooz',
          model: 'ZEN51',
          area_id: 'area1',
        },
        zen52_1: {
          id: 'zen52_1',
          name: 'ZEN52 Double Relay 1',
          manufacturer: 'Zooz',
          model: 'ZEN52',
          area_id: 'area1',
        },
        zen55_1: {
          id: 'zen55_1',
          name: 'ZEN55 Sensor 1',
          manufacturer: 'Zooz',
          model: 'ZEN55 LR',
          area_id: 'area1',
        },
        zen71_1: {
          id: 'zen71_1',
          name: 'ZEN71 Switch 1',
          manufacturer: 'Zooz',
          model: 'ZEN71',
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

      expect(sections).to.have.lengthOf(6); // One for each device type

      // Verify all device type headings are present
      const headings = Array.from(sections).map(
        (section) => section.querySelector('span')?.textContent,
      );

      expect(headings).to.include('ZEN04 800LR Smart Plug');
      expect(headings).to.include('ZEN30 Double Switch');
      expect(headings).to.include('ZEN51 Dry Contact Relay');
      expect(headings).to.include('ZEN52 Double Relay');
      expect(headings).to.include('ZEN55 LR Sensors');
      expect(headings).to.include('ZEN71 On/Off Switch');
    });

    it('should limit to one device in preview mode', async () => {
      Object.defineProperty(card, 'isPreview', {
        get: () => true,
      });

      card.hass = mockHass;

      const el = await fixture(card.render() as TemplateResult);

      // Should only render the first device type's card
      const deviceCards = Array.from(el.querySelectorAll('*')).filter(
        (el) =>
          el.tagName.toLowerCase().startsWith('zooz-') &&
          el.tagName.toLowerCase() !== 'zooz-hub-card',
      );
      expect(deviceCards).to.have.lengthOf(1);
    });

    it('should render correct custom elements for each device type', async () => {
      card.hass = mockHass;

      const el = await fixture(card.render() as TemplateResult);

      expect(el.querySelector('zooz-smart-plug')).to.exist;
      expect(el.querySelector('zooz-double-switch')).to.exist;
      expect(el.querySelector('zooz-dry-contact-relay')).to.exist;
      expect(el.querySelector('zooz-double-relay')).to.exist;
      expect(el.querySelector('zooz-dc-signal-sensor')).to.exist;
      expect(el.querySelector('zooz-on-off-switch')).to.exist;
    });

    it('should set correct config and hass properties on all device cards', async () => {
      card.hass = mockHass;

      const el = await fixture(card.render() as TemplateResult);

      const deviceCards = Array.from(el.querySelectorAll('*')).filter((el) =>
        el.tagName.toLowerCase().startsWith('zooz-'),
      );

      deviceCards.forEach((card) => {
        expect(card).to.exist;
        expect(card.hasAttribute('config')).to.be.false;
        expect(card.hasAttribute('hass')).to.be.false;
      });
    });
  });
});
