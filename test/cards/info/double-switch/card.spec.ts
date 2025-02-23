import { DoubleSwitchCard } from '@z30/card';
import { expect } from 'chai';

describe('DoubleSwitchCard', () => {
  describe('defaultConfig', () => {
    it('should have correct default configuration', () => {
      const config = DoubleSwitchCard.defaultConfig();
      expect(config).to.deep.equal({
        entityDomains: ['light', 'switch'],
        icon: 'mdi:ceiling-light-multiple-outline',
        model: 'ZEN30',
      });
    });
  });

  describe('configuration element', () => {
    it('should have correct model filter', () => {
      const editor = DoubleSwitchCard.getConfigElement();
      const deviceSelector = (editor as any).schema.find(
        (s: any) => s.name === 'device_id',
      );
      expect(deviceSelector.selector.device.filter).to.deep.equal({
        manufacturer: 'Zooz',
        model: 'ZEN30',
      });
    });
  });
});
