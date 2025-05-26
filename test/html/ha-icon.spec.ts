import { haIcon } from '@html/ha-icon';
import { fixture, fixtureCleanup } from '@open-wc/testing-helpers';
import { expect } from 'chai';
import { type TemplateResult } from 'lit';

export default () => {
  describe('ha-icon.ts', () => {
    afterEach(async () => {
      await fixtureCleanup();
    });

    describe('haIcon', () => {
      it('should render ha-icon with icon name', async () => {
        const result = haIcon('mdi:lightbulb');
        const el = await fixture(result as TemplateResult);

        expect(el.tagName.toLowerCase()).to.equal('div');

        const haIconElement = el.querySelector('ha-icon');
        expect(haIconElement).to.exist;
        expect(haIconElement?.getAttribute('icon')).to.equal('mdi:lightbulb');
      });

      it('should render ha-icon with custom className', async () => {
        const result = haIcon('mdi:home', 'custom-class');
        const el = await fixture(result as TemplateResult);

        expect(el.tagName.toLowerCase()).to.equal('div');
        expect(el.classList.contains('custom-class')).to.be.true;

        const haIconElement = el.querySelector('ha-icon');
        expect(haIconElement).to.exist;
        expect(haIconElement?.getAttribute('icon')).to.equal('mdi:home');
      });
    });
  });
};
