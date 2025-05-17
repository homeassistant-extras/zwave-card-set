import { createState as s } from '@test/test-helpers';
import { getEntityIconStyles } from '@util/styles';
import { expect } from 'chai';
import { nothing } from 'lit';
import { styleMap } from 'lit-html/directives/style-map.js';

export default () => {
  describe('styles', () => {
    describe('getEntityIconStyles', () => {
      describe('Active States', () => {
        it('should handle "on" state', () => {
          const state = s('light', 'on');
          const result = getEntityIconStyles(state);

          expect(result).to.deep.equal(
            styleMap({
              '--icon-color': 'rgba(var(--rgb-amber), 1)',
              '--background-color': 'rgba(var(--rgb-amber), 0.2)',
            }),
          );
        });

        it('should handle "true" state', () => {
          const state = s('switch', 'true');
          const result = getEntityIconStyles(state);

          expect(result).to.deep.equal(
            styleMap({
              '--icon-color': 'rgba(var(--rgb-blue), 1)',
              '--background-color': 'rgba(var(--rgb-blue), 0.2)',
            }),
          );
        });

        it('should handle numeric state > 0', () => {
          const state = s('light', '100');
          const result = getEntityIconStyles(state);

          expect(result).to.deep.equal(
            styleMap({
              '--icon-color': 'rgba(var(--rgb-amber), 1)',
              '--background-color': 'rgba(var(--rgb-amber), 0.2)',
            }),
          );
        });
      });

      describe('Inactive States', () => {
        it('should handle "off" state', () => {
          const state = s('light', 'off', { off_color: 'grey' });
          const result = getEntityIconStyles(state);

          expect(result).to.deep.equal(
            styleMap({
              '--icon-color': 'rgba(var(--rgb-grey), 1)',
              '--background-color': 'rgba(var(--rgb-grey), 0.2)',
            }),
          );
        });

        it('should handle "false" state', () => {
          const state = s('switch', 'false', {
            off_color: 'grey',
          });
          const result = getEntityIconStyles(state);

          expect(result).to.deep.equal(
            styleMap({
              '--icon-color': 'rgba(var(--rgb-grey), 1)',
              '--background-color': 'rgba(var(--rgb-grey), 0.2)',
            }),
          );
        });

        it('should handle numeric state of 0', () => {
          const state = s('light', '0', { off_color: 'grey' });
          const result = getEntityIconStyles(state);

          expect(result).to.deep.equal(
            styleMap({
              '--icon-color': 'rgba(var(--rgb-grey), 1)',
              '--background-color': 'rgba(var(--rgb-grey), 0.2)',
            }),
          );
        });
      });

      describe('Domain-specific Colors', () => {
        const testCases = [
          { domain: 'light', expectedColor: 'amber' },
          { domain: 'switch', expectedColor: 'blue' },
          { domain: 'climate', expectedColor: 'teal' },
          { domain: 'alarm_control_panel', expectedColor: 'red' },
          { domain: 'cover', expectedColor: 'green' },
          { domain: 'media_player', expectedColor: 'indigo' },
          { domain: 'binary_sensor', expectedColor: 'cyan' },
          { domain: 'person', expectedColor: 'purple' },
          { domain: 'weather', expectedColor: 'orange' },
          { domain: 'vacuum', expectedColor: 'deep-purple' },
          { domain: 'timer', expectedColor: 'pink' },
        ];

        testCases.forEach(({ domain, expectedColor }) => {
          it(`should use correct color for ${domain} domain`, () => {
            const state = s(domain, 'on');
            const result = getEntityIconStyles(state);

            expect(result).to.deep.equal(
              styleMap({
                '--icon-color': `rgba(var(--rgb-${expectedColor}), 1)`,
                '--background-color': `rgba(var(--rgb-${expectedColor}), 0.2)`,
              }),
            );
          });
        });
      });

      describe('Custom Colors', () => {
        it('should handle custom on_color attribute', () => {
          const state = s('light', 'on', { on_color: 'purple' });
          const result = getEntityIconStyles(state);

          expect(result).to.deep.equal(
            styleMap({
              '--icon-color': 'rgba(var(--rgb-purple), 1)',
              '--background-color': 'rgba(var(--rgb-purple), 0.2)',
            }),
          );
        });

        it('should handle custom off_color attribute', () => {
          const state = s('light', 'off', { off_color: 'brown' });
          const result = getEntityIconStyles(state);

          expect(result).to.deep.equal(
            styleMap({
              '--icon-color': 'rgba(var(--rgb-brown), 1)',
              '--background-color': 'rgba(var(--rgb-brown), 0.2)',
            }),
          );
        });

        it('should handle primary color', () => {
          const state = s('light', 'on', { on_color: 'primary' });
          const result = getEntityIconStyles(state);

          expect(result).to.deep.equal(
            styleMap({
              '--icon-color': 'rgba(var(--rgb-primary-color), 1)',
              '--background-color': 'rgba(var(--rgb-primary-color), 0.2)',
            }),
          );
        });

        it('should handle accent color', () => {
          const state = s('light', 'on', { on_color: 'accent' });
          const result = getEntityIconStyles(state);

          expect(result).to.deep.equal(
            styleMap({
              '--icon-color': 'rgba(var(--rgb-accent-color), 1)',
              '--background-color': 'rgba(var(--rgb-accent-color), 0.2)',
            }),
          );
        });
      });

      describe('Edge Cases', () => {
        it('should handle undefined state', () => {
          const state = s('light', undefined as any as string);
          const result = getEntityIconStyles(state);
          expect(result).to.equal(nothing);
        });

        it('should handle invalid color names', () => {
          const state = s('light', 'on', {
            on_color: 'invalid-color',
          });
          const result = getEntityIconStyles(state);

          expect(result).to.deep.equal(
            styleMap({
              '--icon-color': '',
              '--background-color': '',
            }),
          );
        });

        it('should handle unknown domains', () => {
          const state = s('unknown_domain', 'on');
          const result = getEntityIconStyles(state);

          expect(result).to.deep.equal(
            styleMap({
              '--icon-color': 'rgba(var(--rgb-amber), 1)',
              '--background-color': 'rgba(var(--rgb-amber), 0.2)',
            }),
          );
        });

        it('should handle malformed entity_id', () => {
          const state = {
            ...s('light', 'on'),
            entity_id: 'malformed',
          };
          const result = getEntityIconStyles(state);

          expect(result).to.deep.equal(
            styleMap({
              '--icon-color': 'rgba(var(--rgb-amber), 1)',
              '--background-color': 'rgba(var(--rgb-amber), 0.2)',
            }),
          );
        });
      });
    });
  });
};
