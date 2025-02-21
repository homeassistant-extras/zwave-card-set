import { expect } from 'chai';
import { stub, type SinonStub } from 'sinon';

describe('ZoozDeviceCenter', () => {
  describe('index.ts', () => {
    let customElementsStub: SinonStub;
    let customCardsStub: Array<Object> | undefined;

    beforeEach(() => {
      // Mock customElements if it doesn't exist
      if (!global.customElements) {
        global.customElements = {
          define: () => {},
        } as unknown as typeof customElements;
      }

      // Stub customElements.define to prevent actual registration
      customElementsStub = stub(customElements, 'define');

      // Create a stub for window.customCards
      customCardsStub = [];
      Object.defineProperty(window, 'customCards', {
        get: () => customCardsStub,
        set: (value) => {
          customCardsStub = value;
        },
        configurable: true,
      });
    });

    afterEach(() => {
      // Restore the original customElements.define
      customElementsStub.restore();
      customCardsStub = undefined;
      delete require.cache[require.resolve('@center/index.ts')];
    });

    it('should register both zooz-device-center', () => {
      require('@center/index.ts');
      expect(customElementsStub.calledOnce).to.be.true;
      expect(customElementsStub.firstCall.args[0]).to.equal(
        'zooz-device-center',
      );
    });

    it('should initialize window.customCards if undefined', () => {
      customCardsStub = undefined;
      require('@center/index.ts');

      expect(window.customCards).to.be.an('array');
    });

    it('should add card configuration with all fields to window.customCards', () => {
      require('@center/index.ts');

      expect(window.customCards).to.have.lengthOf(1);
      expect(window.customCards[0]).to.deep.equal({
        type: 'zooz-device-center',
        name: 'Zooz Device Center',
        description: 'A card to summarize all your devices in one place.',
        preview: true,
        documentationURL:
          'https://github.com/homeassistant-extras/zooz-card-set',
      });
    });

    it('should preserve existing cards when adding new card', () => {
      // Add an existing card
      window.customCards = [
        {
          type: 'existing-card',
          name: 'Existing Card',
        },
      ];

      require('@center/index.ts');

      expect(window.customCards).to.have.lengthOf(2);
      expect(window.customCards[0]).to.deep.equal({
        type: 'existing-card',
        name: 'Existing Card',
      });
    });

    it('should handle multiple imports without duplicating registration', () => {
      require('@center/index.ts');
      require('@center/index.ts');

      expect(window.customCards).to.have.lengthOf(1);
      expect(customElementsStub.callCount).to.equal(1);
    });
  });
});
