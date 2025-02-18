import { expect } from 'chai';
import { stub, type SinonStub } from 'sinon';

describe('ZoozHubCard', () => {
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
      delete require.cache[require.resolve('@hub-card/index.ts')];
    });

    it('should register both zooz-hub-card and editor custom elements', () => {
      require('@hub-card/index.ts');
      expect(customElementsStub.calledTwice).to.be.true;
      expect(customElementsStub.firstCall.args[0]).to.equal('zooz-hub-card');
      expect(customElementsStub.secondCall.args[0]).to.equal(
        'zooz-hub-card-editor',
      );
    });

    it('should initialize window.customCards if undefined', () => {
      customCardsStub = undefined;
      require('@hub-card/index.ts');

      expect(window.customCards).to.be.an('array');
    });

    it('should add card configuration with all fields to window.customCards', () => {
      require('@hub-card/index.ts');

      expect(window.customCards).to.have.lengthOf(1);
      expect(window.customCards[0]).to.deep.equal({
        type: 'zooz-hub-card',
        name: 'Zooz Hub Card',
        description: 'A card to summarize information about the hub.',
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

      require('@hub-card/index.ts');

      expect(window.customCards).to.have.lengthOf(2);
      expect(window.customCards[0]).to.deep.equal({
        type: 'existing-card',
        name: 'Existing Card',
      });
    });

    it('should handle multiple imports without duplicating registration', () => {
      require('@hub-card/index.ts');
      require('@hub-card/index.ts');

      expect(window.customCards).to.have.lengthOf(1);
      expect(customElementsStub.callCount).to.equal(2); // Called twice for initial registration only
    });
  });
});
