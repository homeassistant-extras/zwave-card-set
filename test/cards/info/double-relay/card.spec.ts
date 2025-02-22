import { DoubleRelayCard } from '@z52/card';
import { expect } from 'chai';

describe('DoubleRelayCard', () => {
  let card: DoubleRelayCard;

  beforeEach(() => {
    card = new DoubleRelayCard();
  });

  describe('defaultConfig', () => {
    it('should have correct default configuration', () => {
      const config = DoubleRelayCard.defaultConfig();
      expect(config).to.deep.equal({
        icon: 'mdi:ceiling-fan-light',
        title: 'Double Relay',
        entitySuffixes: ['_relay', '_relay_2'],
        model: 'ZEN52',
      });
    });
  });

  describe('configuration element', () => {
    it('should have correct model filter', () => {
      const editor = DoubleRelayCard.getConfigElement();
      const deviceSelector = (editor as any).schema.find(
        (s: any) => s.name === 'device_id',
      );
      expect(deviceSelector.selector.device.filter).to.deep.equal({
        manufacturer: 'Zooz',
        model: 'ZEN52',
      });
    });
  });
});
