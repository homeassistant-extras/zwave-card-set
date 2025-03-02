import { BasicEditor } from '@common/basic-editor';
import type { Config } from '@controller-info/types';
import { fixture } from '@open-wc/testing-helpers';
import type { HomeAssistant } from '@type/homeassistant';
import { expect } from 'chai';
import { nothing, type TemplateResult } from 'lit';
import { stub } from 'sinon';

describe('BasicEditor', () => {
  describe('editor.ts', () => {
    let card: BasicEditor;
    let hass: HomeAssistant;
    let dispatchStub: sinon.SinonStub;

    beforeEach(async () => {
      // Create mock HomeAssistant instance
      hass = {
        states: {},
        titles: {},
        entities: {},
        devices: {},
      } as HomeAssistant;
      card = new BasicEditor();
      dispatchStub = stub(card, 'dispatchEvent');

      card.hass = hass;
    });

    afterEach(() => {
      dispatchStub.restore();
    });

    describe('initialization', () => {
      it('should be defined', () => {
        expect(card).to.be.instanceOf(BasicEditor);
      });

      it('should have default properties', () => {
        expect(card.hass).to.exist;
        expect(card['_config']).to.be.undefined;
      });
    });

    describe('setConfig', () => {
      it('should set the configuration correctly', () => {
        const testConfig: Config = {
          title: 'title_1',
          device_id: 'device_1',
        };

        card.setConfig(testConfig);
        expect(card['_config']).to.deep.equal(testConfig);
      });
    });

    describe('render', () => {
      it('should return nothing when hass is not set', async () => {
        card.hass = undefined as any;
        const result = card.render();
        expect(result).to.equal(nothing);
      });

      it('should return nothing when config is not set', async () => {
        const result = card.render();
        expect(result).to.equal(nothing);
      });

      it('should render ha-form when both hass and config are set', async () => {
        const testConfig: Config = {
          title: 'title_1',
          device_id: 'device_1',
        };
        card.setConfig(testConfig);

        const el = await fixture(card.render() as TemplateResult);
        expect(el.outerHTML).to.equal('<ha-form></ha-form>');
      });

      it('should pass correct props to ha-form', async () => {
        const testConfig: Config = {
          title: 'title_1',
          device_id: 'device_1',
        };
        card.setConfig(testConfig);

        const el = await fixture(card.render() as TemplateResult);
        expect((el as any).hass).to.deep.equal(hass);
        expect((el as any).data).to.deep.equal(testConfig);
        expect((el as any).schema).to.deep.equal([]);
      });
    });

    describe('form behavior', () => {
      it('should compute labels correctly', async () => {
        const testConfig: Config = {
          title: 'title_1',
          device_id: 'device_1',
        };
        card.setConfig(testConfig);

        const el = await fixture(card.render() as TemplateResult);
        const computeLabelFn = (el as any).computeLabel;
        expect(computeLabelFn).to.be.a('function');

        // Test the compute label function
        const testSchema = { name: 'test', label: 'Test Label' };
        const result = computeLabelFn(testSchema);
        expect(result).to.equal('Test Label');
      });
    });

    describe('_valueChanged', () => {
      it('should fire config-changed event with config when features are present', () => {
        const testConfig: Config = {
          title: 'title_1',
          device_id: 'device_1',
        };
        card.setConfig(testConfig);

        // Simulate value-changed event
        const detail = {
          value: {
            title: 'title_1',
            features: ['hide_climate_label'],
          },
        };

        const event = new CustomEvent('value-changed', { detail });
        card['_valueChanged'](event);

        // Verify event was dispatched with correct data
        expect(dispatchStub.calledOnce).to.be.true;
        expect(dispatchStub.firstCall.args[0].type).to.equal('config-changed');
        expect(dispatchStub.firstCall.args[0].detail.config).to.deep.equal({
          title: 'title_1',
          features: ['hide_climate_label'],
        });
      });
    });
  });
});
