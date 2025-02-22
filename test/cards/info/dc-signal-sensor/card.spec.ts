import { DcSignalSensorCard } from '@z55/card';
import { expect } from 'chai';

describe('DcSignalSensorCard', () => {
  let card: DcSignalSensorCard;

  beforeEach(() => {
    card = new DcSignalSensorCard();
  });

  describe('card.ts', () => {
    describe('defaultConfig', () => {
      it('should have correct default configuration', () => {
        const config = DcSignalSensorCard.defaultConfig();
        expect(config).to.deep.equal({
          icon: 'mdi:fire',
          entitySuffixes: ['_smoke_detected', '_carbon_monoxide_detected'],
          model: 'ZEN55 LR',
        });
      });
    });

    describe('configuration element', () => {
      it('should have correct model filter', () => {
        const editor = DcSignalSensorCard.getConfigElement();
        const deviceSelector = (editor as any).schema.find(
          (s: any) => s.name === 'device_id',
        );
        expect(deviceSelector.selector.device.filter).to.deep.equal({
          manufacturer: 'Zooz',
          model: 'ZEN55 LR',
        });
      });
    });
  });
});
