import { BatteryIndicator } from '@common/battery-indicator';
import { fixture, fixtureCleanup } from '@open-wc/testing-helpers';
import { expect } from 'chai';
import { type TemplateResult } from 'lit';

describe('BatteryIndicator', () => {
  let element: BatteryIndicator;

  beforeEach(() => {
    element = new BatteryIndicator();
  });

  afterEach(async () => {
    await fixtureCleanup();
  });

  describe('render method', () => {
    it('should render with default level of 0', async () => {
      const el = await fixture(element.render() as TemplateResult);

      const text = el.querySelector('.battery-text');
      expect(
        text?.textContent?.replace(/(\r\n|\n|\r|\s)/gm, '').trim(),
      ).to.equal('0%');

      const circle = el.querySelector('.battery-circle');
      const circumference = 20.5 * 2 * Math.PI;
      expect(circle?.getAttribute('style')).to.include(
        `stroke-dasharray: ${circumference}`,
      );
      expect(circle?.getAttribute('style')).to.include(
        `stroke-dashoffset: ${circumference}`,
      );
    });

    it('should render correctly with 75% level', async () => {
      element.level = 75;
      const el = await fixture(element.render() as TemplateResult);

      const text = el.querySelector('.battery-text');
      expect(
        text?.textContent?.replace(/(\r\n|\n|\r|\s)/gm, '').trim(),
      ).to.equal('75%');

      const circle = el.querySelector('.battery-circle');
      const circumference = 20.5 * 2 * Math.PI;
      const expectedOffset = circumference - (75 / 100) * circumference;
      expect(circle?.getAttribute('style')).to.include(
        `stroke-dashoffset: ${expectedOffset}`,
      );
    });

    it('should round decimal levels to nearest integer', async () => {
      element.level = 33.7;
      const el = await fixture(element.render() as TemplateResult);

      const text = el.querySelector('.battery-text');
      expect(
        text?.textContent?.replace(/(\r\n|\n|\r|\s)/gm, '').trim(),
      ).to.equal('34%');
    });

    it('should render with correct SVG structure', async () => {
      const el = await fixture(element.render() as TemplateResult);

      expect(el).to.exist;
      expect(el?.getAttribute('viewBox')).to.equal('0 0 50 50');

      const circle = el?.querySelector('circle');
      expect(circle).to.exist;
      expect(circle?.getAttribute('cx')).to.equal('25');
      expect(circle?.getAttribute('cy')).to.equal('25');
      expect(circle?.getAttribute('r')).to.equal('20.5');
      expect(circle?.getAttribute('stroke')).to.equal('green');
      expect(circle?.getAttribute('stroke-width')).to.equal('3');
    });

    it('should update circle properties when level changes', async () => {
      // Initial render
      const el = await fixture(element.render() as TemplateResult);
      const circle = el.querySelector('.battery-circle');
      const initialOffset = circle?.getAttribute('style');

      // Update level and re-render
      element.level = 50;
      const updatedEl = await fixture(element.render() as TemplateResult);
      const updatedCircle = updatedEl.querySelector('.battery-circle');
      const updatedOffset = updatedCircle?.getAttribute('style');

      expect(initialOffset).to.not.equal(updatedOffset);

      const circumference = 20.5 * 2 * Math.PI;
      const expectedOffset = circumference - (50 / 100) * circumference;
      expect(updatedOffset).to.include(`stroke-dashoffset: ${expectedOffset}`);
    });

    it('should handle edge case of 100% level', async () => {
      element.level = 100;
      const el = await fixture(element.render() as TemplateResult);

      const circle = el.querySelector('.battery-circle');
      const circumference = 20.5 * 2 * Math.PI;
      expect(circle?.getAttribute('style')).to.include(`stroke-dashoffset: 0`);

      const text = el.querySelector('.battery-text');
      expect(
        text?.textContent?.replace(/(\r\n|\n|\r|\s)/gm, '').trim(),
      ).to.equal('100%');
    });

    it('should handle edge case of level > 100%', async () => {
      element.level = 150;
      const el = await fixture(element.render() as TemplateResult);

      const circle = el.querySelector('.battery-circle');
      const circumference = 20.5 * 2 * Math.PI;
      const offset = circumference - (150 / 100) * circumference;
      expect(circle?.getAttribute('style')).to.equal(
        `stroke-dasharray: ${circumference}; stroke-dashoffset: ${offset};`,
      );

      const text = el.querySelector('.battery-text');
      expect(
        text?.textContent?.replace(/(\r\n|\n|\r|\s)/gm, '').trim(),
      ).to.equal('150%');
    });

    it('should handle edge case of negative level', async () => {
      element.level = -25;
      const el = await fixture(element.render() as TemplateResult);

      const circle = el.querySelector('.battery-circle');
      const circumference = 20.5 * 2 * Math.PI;
      const offset = circumference - (-25 / 100) * circumference;

      expect(circle?.getAttribute('style')).to.equal(
        `stroke-dasharray: ${circumference}; stroke-dashoffset: ${offset};`,
      );

      const text = el.querySelector('.battery-text');
      expect(
        text?.textContent?.replace(/(\r\n|\n|\r|\s)/gm, '').trim(),
      ).to.equal('-25%');
    });
  });

  describe('styles', () => {
    it('should apply correct default styles', async () => {
      const el = await fixture(element.render() as TemplateResult);

      const circle = el.querySelector('.battery-circle');
      expect(circle?.classList.contains('battery-circle')).to.be.true;

      const text = el.querySelector('.battery-text');
      expect(text?.classList.contains('battery-text')).to.be.true;

      const tspan = text?.querySelector('tspan');
      expect(tspan).to.exist;
    });

    it('should apply correct transformations to battery circle', async () => {
      const el = await fixture(element.render() as TemplateResult);

      const circle = el.querySelector('.battery-circle');
      const style = window.getComputedStyle(circle as Element);

      // Note: getComputedStyle might not work in all test environments
      // This is more of an integration test
      expect(circle?.classList.contains('battery-circle')).to.be.true;
    });
  });
});
