import { expect } from 'chai';
import { stub, type SinonStub } from 'sinon';
import { version } from '../package.json';

describe('index.ts', () => {
  let customElementsStub: SinonStub;
  let customCardsStub: Array<Object> | undefined;
  let consoleInfoStub: sinon.SinonStub;

  beforeEach(() => {
    // Mock customElements if it doesn't exist
    if (!global.customElements) {
      global.customElements = {
        define: () => {},
      } as unknown as typeof customElements;
    }
    consoleInfoStub = stub(console, 'info');

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
    consoleInfoStub.restore();
    customCardsStub = undefined;
    delete require.cache[require.resolve('@/index.ts')];
  });

  describe('card configuration', () => {
    it('should properly configure ZEN52 double relay card', () => {
      require('@/index.ts');

      // Get the double relay card registration
      const cardRegistration = customElementsStub
        .getCalls()
        .find((call) => call.args[0] === 'zooz-double-relay');

      const CardClass = cardRegistration?.args[1];
      const card = new CardClass();

      // Check static config
      expect(CardClass.staticCardConfig).to.deep.equal({
        model: 'ZEN52',
      });

      // Check instance config
      expect(card.instanceCardConfig).to.deep.equal({
        icon: 'mdi:lightbulb-on-outline',
        entityDomains: ['switch'],
      });
    });

    it('should properly configure ZEN55 DC signal sensor card', () => {
      require('@/index.ts');

      const cardRegistration = customElementsStub
        .getCalls()
        .find((call) => call.args[0] === 'zooz-dc-signal-sensor');

      const CardClass = cardRegistration?.args[1];
      const card = new CardClass();

      expect(CardClass.staticCardConfig).to.deep.equal({
        model: 'ZEN55 LR',
      });

      expect(card.instanceCardConfig).to.deep.equal({
        icon: 'mdi:fire',
        entityDomains: ['binary_sensor'],
      });
    });

    it('should properly configure ZEN30 double switch card', () => {
      require('@/index.ts');

      const cardRegistration = customElementsStub
        .getCalls()
        .find((call) => call.args[0] === 'zooz-double-switch');

      const CardClass = cardRegistration?.args[1];
      const card = new CardClass();

      expect(CardClass.staticCardConfig).to.deep.equal({
        model: 'ZEN30',
      });

      expect(card.instanceCardConfig).to.deep.equal({
        icon: 'mdi:ceiling-light-multiple-outline',
        entityDomains: ['light', 'switch'],
      });
    });
  });

  it('should register device-center', () => {
    require('@/index.ts');
    const calls = customElementsStub.getCalls();
    const hasDeviceCenter = calls.some(
      (call) => call.args[0] === 'zooz-device-center',
    );
    expect(hasDeviceCenter).to.be.true;
  });

  it('should register zooz-hub-card components', () => {
    require('@/index.ts');
    const calls = customElementsStub.getCalls();
    const hasHubCard = calls.some((call) => call.args[0] === 'zooz-hub-card');

    expect(hasHubCard).to.be.true;
  });

  it('should register zooz-nodes-status components', () => {
    require('@/index.ts');
    const calls = customElementsStub.getCalls();
    const hasNodesStatus = calls.some(
      (call) => call.args[0] === 'zooz-nodes-status',
    );

    expect(hasNodesStatus).to.be.true;
  });

  it('should register dc-signal-sensor components', () => {
    require('@/index.ts');
    const calls = customElementsStub.getCalls();
    const hasSignalSensor = calls.some(
      (call) => call.args[0] === 'zooz-dc-signal-sensor',
    );

    expect(hasSignalSensor).to.be.true;
  });

  it('should register double-relay components', () => {
    require('@/index.ts');
    const calls = customElementsStub.getCalls();
    const hasSignalSensor = calls.some(
      (call) => call.args[0] === 'zooz-double-relay',
    );

    expect(hasSignalSensor).to.be.true;
  });

  it('should initialize window.customCards if undefined', () => {
    customCardsStub = undefined;
    require('@/index.ts');

    expect(window.customCards).to.be.an('array');
  });

  it('should add card configuration with all fields to window.customCards', () => {
    require('@/index.ts');

    // Check total count is correct
    expect(window.customCards).to.have.lengthOf(6);

    // Define the expected card configurations
    const expectedCards = [
      {
        type: 'zooz-device-center',
        name: 'Zooz Device Center',
        description: 'A card to summarize all your devices in one place.',
        preview: true,
        documentationURL:
          'https://github.com/homeassistant-extras/zooz-card-set',
      },
      {
        type: 'zooz-hub-card',
        name: 'Zooz Hub Info',
        description: 'A card to summarize information about the hub.',
        preview: true,
        documentationURL:
          'https://github.com/homeassistant-extras/zooz-card-set',
      },
      {
        type: 'zooz-nodes-status',
        name: 'Zooz Nodes Status',
        description: 'A card to summarize the status of all the Zooz nodes.',
        preview: true,
        documentationURL:
          'https://github.com/homeassistant-extras/zooz-card-set',
      },
      {
        type: 'zooz-double-relay',
        name: 'ZEN52 - Double Relay',
        description:
          'A card to control and monitor a Zooz double relay device.',
        preview: true,
        documentationURL:
          'https://github.com/homeassistant-extras/zooz-card-set',
      },
      {
        type: 'zooz-dc-signal-sensor',
        name: 'ZEN55 LR - DC Signal Sensor',
        description: 'A card to monitor a Zooz DC signal sensor device.',
        preview: true,
        documentationURL:
          'https://github.com/homeassistant-extras/zooz-card-set',
      },
      {
        type: 'zooz-double-switch',
        name: 'ZEN30 - Double Switch',
        description: 'A card to monitor a Zooz double switch device.',
        preview: true,
        documentationURL:
          'https://github.com/homeassistant-extras/zooz-card-set',
      },
    ];

    // Check that each expected card exists in window.customCards
    expect(window.customCards).to.deep.equal(expectedCards);
  });

  it('should preserve existing cards when adding new card', () => {
    // Add an existing card
    window.customCards = [
      {
        type: 'existing-card',
        name: 'Existing Card',
      },
    ];

    require('@/index.ts');

    expect(window.customCards).to.have.lengthOf(7);
    expect(window.customCards[0]).to.deep.equal({
      type: 'existing-card',
      name: 'Existing Card',
    });
  });

  it('should handle multiple imports without duplicating registration', () => {
    require('@/index.ts');
    require('@/index.ts');

    expect(window.customCards).to.have.lengthOf(6);
    expect(customElementsStub.callCount).to.equal(7);
  });

  it('should log the version with proper formatting', () => {
    require('@/index.ts');

    // Assert that console.info was called once
    expect(consoleInfoStub.calledOnce).to.be.true;

    // Assert that it was called with the expected arguments
    expect(
      consoleInfoStub.calledWithExactly(
        `%c🐱 Poat's Tools: zooz-card-set - ${version}`,
        'color: #CFC493;',
      ),
    ).to.be.true;
  });
});
