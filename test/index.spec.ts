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

  // Base component registration tests
  it('should register zwave-node-info', () => {
    require('@/index.ts');
    const calls = customElementsStub.getCalls();
    expect(calls.some((call) => call.args[0] === 'zwave-node-info')).to.be.true;
  });

  it('should register device-center', () => {
    require('@/index.ts');
    const calls = customElementsStub.getCalls();
    expect(calls.some((call) => call.args[0] === 'zwave-device-center')).to.be
      .true;
  });

  it('should register zwave-controller-info components', () => {
    require('@/index.ts');
    const calls = customElementsStub.getCalls();
    expect(calls.some((call) => call.args[0] === 'zwave-controller-info')).to.be
      .true;
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
    expect(calls.some((call) => call.args[0] === 'basic-editor')).to.be.true;
  });

  it('should register basic-editor component', () => {
    require('@/index.ts');
    const calls = customElementsStub.getCalls();
    expect(calls.some((call) => call.args[0] === 'battery-indicator')).to.be
      .true;
  });

  it('should initialize window.customCards if undefined', () => {
    customCardsStub = undefined;
    require('@/index.ts');
    expect(window.customCards).to.be.an('array');
  });

  it('should add card configuration with all fields to window.customCards', () => {
    require('@/index.ts');

    // Updated expected length to include only base cards
    expect(window.customCards).to.have.lengthOf(4);

    const expectedCards = [
      {
        type: 'zwave-node-info',
        name: 'Z-Wave Node Info',
        description: 'A card to summarize a Z-Wave node.',
        preview: true,
        documentationURL:
          'https://github.com/homeassistant-extras/zwave-card-set',
      },
      {
        type: 'zwave-controller-info',
        name: 'Z-Wave Hub Info',
        description: 'A card to summarize information about the hub.',
        preview: true,
        documentationURL:
          'https://github.com/homeassistant-extras/zwave-card-set',
      },
      {
        type: 'zwave-device-center',
        name: 'Z-Wave Device Center',
        description: 'A card to summarize all your devices in one place.',
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

    expect(window.customCards).to.have.lengthOf(5);
    expect(window.customCards[0]).to.deep.equal({
      type: 'existing-card',
      name: 'Existing Card',
    });
  });

  it('should handle multiple imports without duplicating registration', () => {
    require('@/index.ts');
    require('@/index.ts');

    expect(window.customCards).to.have.lengthOf(4);
    expect(customElementsStub.callCount).to.equal(6); // 4 cards + 2 utility components
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
