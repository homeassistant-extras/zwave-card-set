import { expect } from 'chai';
import { stub, type SinonStub } from 'sinon';
import { version } from '../package.json';

describe('index.ts', () => {
  let customElementsStub: SinonStub;
  let customCardsStub: Array<Object> | undefined;
  let consoleInfoStub: sinon.SinonStub;

  beforeEach(() => {
    if (!global.customElements) {
      global.customElements = {
        define: () => {},
      } as unknown as typeof customElements;
    }
    consoleInfoStub = stub(console, 'info');
    customElementsStub = stub(customElements, 'define');
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
    customElementsStub.restore();
    consoleInfoStub.restore();
    customCardsStub = undefined;
    delete require.cache[require.resolve('@/index.ts')];
  });

  describe('card configuration', () => {
    it('should properly configure ZEN04 smart plug card', () => {
      require('@/index.ts');
      const cardRegistration = customElementsStub
        .getCalls()
        .find((call) => call.args[0] === 'zooz-smart-plug');

      const CardClass = cardRegistration?.args[1];
      const card = new CardClass();

      expect(CardClass.staticCardConfig).to.deep.equal({
        model: 'ZEN04 800LR',
      });

      expect(card.instanceCardConfig).to.deep.equal({
        icon: 'mdi:power-socket-us',
        entityDomains: ['switch'],
      });
    });

    it('should properly configure ZEN16 multi-relay card', () => {
      require('@/index.ts');
      const cardRegistration = customElementsStub
        .getCalls()
        .find((call) => call.args[0] === 'zooz-multi-relay');

      const CardClass = cardRegistration?.args[1];
      const card = new CardClass();

      expect(CardClass.staticCardConfig).to.deep.equal({
        model: 'ZEN16',
      });

      expect(card.instanceCardConfig).to.deep.equal({
        icon: 'mdi:garage-open-variant',
        entityDomains: ['switch'],
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

    it('should properly configure ZEN32 scene controller card', () => {
      require('@/index.ts');
      const cardRegistration = customElementsStub
        .getCalls()
        .find((call) => call.args[0] === 'zooz-scene-controller');

      const CardClass = cardRegistration?.args[1];
      const card = new CardClass();

      expect(CardClass.staticCardConfig).to.deep.equal({
        model: 'ZEN32',
      });

      expect(card.instanceCardConfig).to.deep.equal({
        icon: 'mdi:gesture-double-tap',
        entityDomains: ['switch', 'light'],
      });
    });

    it('should properly configure ZEN51 dry contact relay card', () => {
      require('@/index.ts');
      const cardRegistration = customElementsStub
        .getCalls()
        .find((call) => call.args[0] === 'zooz-dry-contact-relay');

      const CardClass = cardRegistration?.args[1];
      const card = new CardClass();

      expect(CardClass.staticCardConfig).to.deep.equal({
        model: 'ZEN51',
      });

      expect(card.instanceCardConfig).to.deep.equal({
        icon: 'mdi:electric-switch',
        entityDomains: ['switch'],
      });
    });

    it('should properly configure ZEN52 double relay card', () => {
      require('@/index.ts');
      const cardRegistration = customElementsStub
        .getCalls()
        .find((call) => call.args[0] === 'zooz-double-relay');

      const CardClass = cardRegistration?.args[1];
      const card = new CardClass();

      expect(CardClass.staticCardConfig).to.deep.equal({
        model: 'ZEN52',
      });

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

    it('should properly configure ZEN71 on/off switch card', () => {
      require('@/index.ts');
      const cardRegistration = customElementsStub
        .getCalls()
        .find((call) => call.args[0] === 'zooz-on-off-switch');

      const CardClass = cardRegistration?.args[1];
      const card = new CardClass();

      expect(CardClass.staticCardConfig).to.deep.equal({
        model: 'ZEN71',
      });

      expect(card.instanceCardConfig).to.deep.equal({
        icon: 'mdi:toggle-switch-variant-off',
        entityDomains: ['switch'],
      });
    });

    it('should properly configure ZSE41 open close sensor card', () => {
      require('@/index.ts');
      const cardRegistration = customElementsStub
        .getCalls()
        .find((call) => call.args[0] === 'zooz-open-close-sensor');

      const CardClass = cardRegistration?.args[1];
      const card = new CardClass();

      expect(CardClass.staticCardConfig).to.deep.equal({
        model: 'ZSE41',
      });

      expect(card.instanceCardConfig).to.deep.equal({
        icon: 'mdi:door-open',
        entityDomains: ['binary_sensor'],
      });
    });

    it('should properly configure ZSE43 tilt shock sensor card', () => {
      require('@/index.ts');
      const cardRegistration = customElementsStub
        .getCalls()
        .find((call) => call.args[0] === 'zooz-tilt-shock-sensor');

      const CardClass = cardRegistration?.args[1];
      const card = new CardClass();

      expect(CardClass.staticCardConfig).to.deep.equal({
        model: 'ZSE43',
      });

      expect(card.instanceCardConfig).to.deep.equal({
        icon: 'mdi:angle-acute',
        entityDomains: ['binary_sensor'],
      });
    });

    it('should properly configure ZSE44 temperature humidity sensor card', () => {
      require('@/index.ts');
      const cardRegistration = customElementsStub
        .getCalls()
        .find((call) => call.args[0] === 'zooz-temperature-humidity-sensor');

      const CardClass = cardRegistration?.args[1];
      const card = new CardClass();

      expect(CardClass.staticCardConfig).to.deep.equal({
        model: 'ZSE44',
      });

      expect(card.instanceCardConfig).to.deep.equal({
        icon: 'mdi:thermometer',
        entityDomains: ['sensor'],
      });
    });
  });

  // Base component registration tests
  it('should register device-center', () => {
    require('@/index.ts');
    const calls = customElementsStub.getCalls();
    expect(calls.some((call) => call.args[0] === 'zooz-device-center')).to.be
      .true;
  });

  it('should register zooz-hub-card components', () => {
    require('@/index.ts');
    const calls = customElementsStub.getCalls();
    expect(calls.some((call) => call.args[0] === 'zooz-hub-card')).to.be.true;
  });

  it('should register zooz-nodes-status components', () => {
    require('@/index.ts');
    const calls = customElementsStub.getCalls();
    expect(calls.some((call) => call.args[0] === 'zooz-nodes-status')).to.be
      .true;
  });

  it('should register battery-indicator component', () => {
    require('@/index.ts');
    const calls = customElementsStub.getCalls();
    expect(calls.some((call) => call.args[0] === 'battery-indicator')).to.be
      .true;
  });

  // Device-specific component registration tests
  const deviceComponents = [
    'zooz-smart-plug',
    'zooz-double-switch',
    'zooz-dry-contact-relay',
    'zooz-double-relay',
    'zooz-dc-signal-sensor',
    'zooz-on-off-switch',
    'zooz-scene-controller',
    'zooz-multi-relay',
    'zooz-open-close-sensor',
    'zooz-tilt-shock-sensor',
    'zooz-temperature-humidity-sensor',
  ];

  deviceComponents.forEach((component) => {
    it(`should register ${component} component`, () => {
      require('@/index.ts');
      const calls = customElementsStub.getCalls();
      expect(calls.some((call) => call.args[0] === component)).to.be.true;
    });
  });

  it('should initialize window.customCards if undefined', () => {
    customCardsStub = undefined;
    require('@/index.ts');
    expect(window.customCards).to.be.an('array');
  });

  it('should add card configuration with all fields to window.customCards', () => {
    require('@/index.ts');

    // Updated expected length to include all cards
    expect(window.customCards).to.have.lengthOf(14);

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
        type: 'zooz-smart-plug',
        name: 'ZEN04 800LR - Smart Plug',
        description: 'A card to control and monitor a Zooz smart plug device.',
        preview: true,
        documentationURL:
          'https://github.com/homeassistant-extras/zooz-card-set',
      },
      {
        type: 'zooz-multi-relay',
        name: 'ZEN16 - Multi Relay',
        description: 'A card to control and monitor a Zooz multi relay device.',
        preview: true,
        documentationURL:
          'https://github.com/homeassistant-extras/zooz-card-set',
      },
      {
        type: 'zooz-double-switch',
        name: 'ZEN30 - Double Switch',
        description:
          'A card to control and monitor a Zooz double switch device.',
        preview: true,
        documentationURL:
          'https://github.com/homeassistant-extras/zooz-card-set',
      },
      {
        type: 'zooz-scene-controller',
        name: 'ZEN32 - Scene Controller',
        description: 'A card to control and monitor a Zooz scene controller.',
        preview: true,
        documentationURL:
          'https://github.com/homeassistant-extras/zooz-card-set',
      },
      {
        type: 'zooz-dry-contact-relay',
        name: 'ZEN51 - Dry Contact Relay',
        description:
          'A card to control and monitor a Zooz dry contact relay device.',
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
        type: 'zooz-on-off-switch',
        name: 'ZEN71 - On/Off Switch',
        description:
          'A card to control and monitor a Zooz on/off switch device.',
        preview: true,
        documentationURL:
          'https://github.com/homeassistant-extras/zooz-card-set',
      },
      {
        type: 'zooz-open-close-sensor',
        name: 'ZSE41 - Open Close Sensor',
        description: 'A card to monitor a Zooz open close sensor device.',
        preview: true,
        documentationURL:
          'https://github.com/homeassistant-extras/zooz-card-set',
      },
      {
        type: 'zooz-tilt-shock-sensor',
        name: 'ZSE43 - Tilt Shock Sensor',
        description: 'A card to monitor a Zooz tilt shock sensor device.',
        preview: true,
        documentationURL:
          'https://github.com/homeassistant-extras/zooz-card-set',
      },
      {
        type: 'zooz-temperature-humidity-sensor',
        name: 'ZSE44 - Temperature Humidity Sensor',
        description:
          'A card to monitor a Zooz temperature humidity sensor device.',
        preview: true,
        documentationURL:
          'https://github.com/homeassistant-extras/zooz-card-set',
      },
    ];

    expect(window.customCards).to.deep.equal(expectedCards);
  });

  it('should preserve existing cards when adding new card', () => {
    window.customCards = [
      {
        type: 'existing-card',
        name: 'Existing Card',
      },
    ];

    require('@/index.ts');

    expect(window.customCards).to.have.lengthOf(15);
    expect(window.customCards[0]).to.deep.equal({
      type: 'existing-card',
      name: 'Existing Card',
    });
  });

  it('should handle multiple imports without duplicating registration', () => {
    require('@/index.ts');
    require('@/index.ts');

    expect(window.customCards).to.have.lengthOf(14);
    expect(customElementsStub.callCount).to.equal(16); // 14 cards + 2 utility components
  });

  it('should log the version with proper formatting', () => {
    require('@/index.ts');
    expect(consoleInfoStub.calledOnce).to.be.true;
    expect(
      consoleInfoStub.calledWithExactly(
        `%c🐱 Poat's Tools: zooz-card-set - ${version}`,
        'color: #CFC493;',
      ),
    ).to.be.true;
  });
});
