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
        .find((call) => call.args[0] === 'zwave-smart-plug');

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
        .find((call) => call.args[0] === 'zwave-multi-relay');

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
        .find((call) => call.args[0] === 'zwave-double-switch');

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
        .find((call) => call.args[0] === 'zwave-scene-controller');

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
        .find((call) => call.args[0] === 'zwave-dry-contact-relay');

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
        .find((call) => call.args[0] === 'zwave-double-relay');

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
        .find((call) => call.args[0] === 'zwave-dc-signal-sensor');

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
        .find((call) => call.args[0] === 'zwave-on-off-switch');

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
        .find((call) => call.args[0] === 'zwave-open-close-sensor');

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
        .find((call) => call.args[0] === 'zwave-tilt-shock-sensor');

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
        .find((call) => call.args[0] === 'zwave-temperature-humidity-sensor');

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
    expect(calls.some((call) => call.args[0] === 'zwave-device-center')).to.be
      .true;
  });

  it('should register zwave-hub-card components', () => {
    require('@/index.ts');
    const calls = customElementsStub.getCalls();
    expect(calls.some((call) => call.args[0] === 'zwave-hub-card')).to.be.true;
  });

  it('should register zwave-nodes-status components', () => {
    require('@/index.ts');
    const calls = customElementsStub.getCalls();
    expect(calls.some((call) => call.args[0] === 'zwave-nodes-status')).to.be
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
    'zwave-smart-plug',
    'zwave-double-switch',
    'zwave-dry-contact-relay',
    'zwave-double-relay',
    'zwave-dc-signal-sensor',
    'zwave-on-off-switch',
    'zwave-scene-controller',
    'zwave-multi-relay',
    'zwave-open-close-sensor',
    'zwave-tilt-shock-sensor',
    'zwave-temperature-humidity-sensor',
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
        type: 'zwave-device-center',
        name: 'Z-Wave Device Center',
        description: 'A card to summarize all your devices in one place.',
        preview: true,
        documentationURL:
          'https://github.com/homeassistant-extras/zwave-card-set',
      },
      {
        type: 'zwave-hub-card',
        name: 'Z-Wave Hub Info',
        description: 'A card to summarize information about the hub.',
        preview: true,
        documentationURL:
          'https://github.com/homeassistant-extras/zwave-card-set',
      },
      {
        type: 'zwave-nodes-status',
        name: 'Z-Wave Nodes Status',
        description: 'A card to summarize the status of all the Z-Wave nodes.',
        preview: true,
        documentationURL:
          'https://github.com/homeassistant-extras/zwave-card-set',
      },
      {
        type: 'zwave-smart-plug',
        name: 'ZEN04 800LR - Smart Plug',
        description:
          'A card to control and monitor a Z-Wave smart plug device.',
        preview: true,
        documentationURL:
          'https://github.com/homeassistant-extras/zwave-card-set',
      },
      {
        type: 'zwave-multi-relay',
        name: 'ZEN16 - Multi Relay',
        description:
          'A card to control and monitor a Z-Wave multi relay device.',
        preview: true,
        documentationURL:
          'https://github.com/homeassistant-extras/zwave-card-set',
      },
      {
        type: 'zwave-double-switch',
        name: 'ZEN30 - Double Switch',
        description:
          'A card to control and monitor a Z-Wave double switch device.',
        preview: true,
        documentationURL:
          'https://github.com/homeassistant-extras/zwave-card-set',
      },
      {
        type: 'zwave-scene-controller',
        name: 'ZEN32 - Scene Controller',
        description: 'A card to control and monitor a Z-Wave scene controller.',
        preview: true,
        documentationURL:
          'https://github.com/homeassistant-extras/zwave-card-set',
      },
      {
        type: 'zwave-dry-contact-relay',
        name: 'ZEN51 - Dry Contact Relay',
        description:
          'A card to control and monitor a Z-Wave dry contact relay device.',
        preview: true,
        documentationURL:
          'https://github.com/homeassistant-extras/zwave-card-set',
      },
      {
        type: 'zwave-double-relay',
        name: 'ZEN52 - Double Relay',
        description:
          'A card to control and monitor a Z-Wave double relay device.',
        preview: true,
        documentationURL:
          'https://github.com/homeassistant-extras/zwave-card-set',
      },
      {
        type: 'zwave-dc-signal-sensor',
        name: 'ZEN55 LR - DC Signal Sensor',
        description: 'A card to monitor a Z-Wave DC signal sensor device.',
        preview: true,
        documentationURL:
          'https://github.com/homeassistant-extras/zwave-card-set',
      },
      {
        type: 'zwave-on-off-switch',
        name: 'ZEN71 - On/Off Switch',
        description:
          'A card to control and monitor a Z-Wave on/off switch device.',
        preview: true,
        documentationURL:
          'https://github.com/homeassistant-extras/zwave-card-set',
      },
      {
        type: 'zwave-open-close-sensor',
        name: 'ZSE41 - Open Close Sensor',
        description: 'A card to monitor a Z-Wave open close sensor device.',
        preview: true,
        documentationURL:
          'https://github.com/homeassistant-extras/zwave-card-set',
      },
      {
        type: 'zwave-tilt-shock-sensor',
        name: 'ZSE43 - Tilt Shock Sensor',
        description: 'A card to monitor a Z-Wave tilt shock sensor device.',
        preview: true,
        documentationURL:
          'https://github.com/homeassistant-extras/zwave-card-set',
      },
      {
        type: 'zwave-temperature-humidity-sensor',
        name: 'ZSE44 - Temperature Humidity Sensor',
        description:
          'A card to monitor a Z-Wave temperature humidity sensor device.',
        preview: true,
        documentationURL:
          'https://github.com/homeassistant-extras/zwave-card-set',
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
        `%c🐱 Poat's Tools: zwave-card-set - ${version}`,
        'color: #CFC493;',
      ),
    ).to.be.true;
  });
});
