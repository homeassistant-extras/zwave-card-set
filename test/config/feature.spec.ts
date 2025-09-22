import { hasFeature } from '@config/feature';
import type { Config, Features } from '@node/types';
import { expect } from 'chai';
import { describe, it } from 'mocha';

export default () => {
  describe('feature', () => {
    it('should return false when config is null', () => {
      expect(hasFeature(null as any as Config, 'debug')).to.be.false;
    });

    it('should return false when config is undefined', () => {
      expect(hasFeature(undefined as any as Config, 'debug')).to.be.false;
    });

    it('should return false when config.features is undefined', () => {
      const config = {} as Config;
      expect(hasFeature(config, 'debug')).to.be.false;
    });

    it('should return false when config.features is empty', () => {
      const config = {} as Config;
      expect(hasFeature(config, 'debug')).to.be.false;
    });

    it('should return true when feature is present in config.features', () => {
      const config = {
        features: ['debug', 'exclude_default_entities'],
      } as Config;
      expect(hasFeature(config, 'debug')).to.be.true;
    });

    it('should return false when feature is not present in config.features', () => {
      const config = {
        features: ['use_icons_instead_of_names'],
      } as Config;
      expect(hasFeature(config, 'debug')).to.be.false;
    });

    it('should handle case-sensitive feature names', () => {
      const config = {
        features: ['debug'],
      } as Config;
      expect(hasFeature(config, 'use_icons_instead_of_names')).to.be.false;
      expect(hasFeature(config, 'debug')).to.be.true;
    });

    // Edge cases
    it('should handle empty string feature names', () => {
      const config = { features: ['' as any as Features] } as Config;
      expect(hasFeature(config, '' as any as Features)).to.be.true;
    });
  });
};
