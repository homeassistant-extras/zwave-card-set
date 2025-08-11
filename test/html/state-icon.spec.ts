import * as actionHandlerModule from '@delegates/action-handler-delegate';
import * as haIconModule from '@html/ha-icon';
import { stateIcon } from '@html/state-icon';
import { fixture } from '@open-wc/testing-helpers';
import { createState as s } from '@test/test-helpers';
import type { ActionHandlerEvent } from '@type/action';
import type { HomeAssistant } from '@type/homeassistant';
import * as getEntityIconStylesModule from '@util/styles';
import { expect } from 'chai';
import { html, type TemplateResult } from 'lit';
import { stub } from 'sinon';
export default () => {
  describe('state-icon.ts', () => {
    let mockElement: HTMLElement;
    let mockHass: HomeAssistant;
    let actionHandlerStub: sinon.SinonStub;
    let handleClickActionStub: sinon.SinonStub;
    let moreInfoActionStub: sinon.SinonStub;
    let toggleActionStub: sinon.SinonStub;
    let getEntityIconStylesStub: sinon.SinonStub;
    let haIconStub: sinon.SinonStub;

    beforeEach(() => {
      // Create mock element and hass
      mockElement = document.createElement('div');
      mockHass = {
        states: {},
        entities: {},
        devices: {},
      } as unknown as HomeAssistant;

      // Set up stubs for imported functions
      actionHandlerStub = stub(actionHandlerModule, 'actionHandler').returns({
        bind: () => {},
        handleAction: () => {},
      });
      handleClickActionStub = stub(
        actionHandlerModule,
        'handleClickAction',
      ).returns({
        handleEvent: (ev: ActionHandlerEvent): void => {},
      });
      haIconStub = stub(haIconModule, 'haIcon').returns(
        html`<div class="ha-icon-mock"></div>`,
      );

      // Set default return values
      moreInfoActionStub = stub(actionHandlerModule, 'moreInfoAction').returns({
        entity: 'light.test',
        tap_action: { action: 'more-info' },
      });
      toggleActionStub = stub(actionHandlerModule, 'toggleAction').returns({
        entity: 'light.test',
        tap_action: { action: 'toggle' },
      });
      getEntityIconStylesStub = stub(
        getEntityIconStylesModule,
        'getEntityIconStyles',
      ).returns(html`style="--color: var(--rgb-blue)"`);
    });

    afterEach(() => {
      actionHandlerStub.restore();
      handleClickActionStub.restore();
      moreInfoActionStub.restore();
      toggleActionStub.restore();
      getEntityIconStylesStub.restore();
      haIconStub.restore();
    });

    it('should render an empty div when state is undefined', async () => {
      const result = stateIcon(mockElement, mockHass, undefined);
      const el = await fixture(result);

      expect(el.tagName.toLowerCase()).to.equal('div');
      expect(el.classList.contains('icon')).to.be.true;
      expect(el.children.length).to.equal(0);

      // Should not call any of the action functions
      expect(actionHandlerStub.called).to.be.false;
      expect(handleClickActionStub.called).to.be.false;
      expect(moreInfoActionStub.called).to.be.false;
      expect(toggleActionStub.called).to.be.false;
    });

    it('should apply additional className when provided', async () => {
      const result = stateIcon(mockElement, mockHass, undefined, 'test-class');
      const el = await fixture(result);

      expect(el.classList.contains('icon')).to.be.true;
      expect(el.classList.contains('test-class')).to.be.true;
    });

    it('should render with ha-state-icon for valid state', async () => {
      const mockState = s('sensor.test', 'on');
      const result = stateIcon(mockElement, mockHass, mockState);
      const el = await fixture(result);

      expect(el.tagName.toLowerCase()).to.equal('div');

      const icon = el.querySelector('ha-state-icon');
      expect(icon).to.exist;
      expect((icon as any).stateObj).to.equal(mockState);
      expect((icon as any).hass).to.equal(mockHass);
    });

    it('should use toggleAction for switch and light domains', async () => {
      // Test with switch domain
      const switchState = s('switch.test', 'on');
      stateIcon(mockElement, mockHass, switchState);

      expect(toggleActionStub.calledWith('switch.test')).to.be.true;
      expect(moreInfoActionStub.called).to.be.false;

      // Reset stubs
      toggleActionStub.resetHistory();
      moreInfoActionStub.resetHistory();

      // Test with light domain
      const lightState = s('light.test', 'on');
      stateIcon(mockElement, mockHass, lightState);

      expect(toggleActionStub.calledWith('light.test')).to.be.true;
      expect(moreInfoActionStub.called).to.be.false;
    });

    it('should use moreInfoAction for non-switch/light domains', async () => {
      // Test with sensor domain
      const sensorState = s('sensor.test', '22');
      stateIcon(mockElement, mockHass, sensorState);

      expect(moreInfoActionStub.calledWith('sensor.test')).to.be.true;
      expect(toggleActionStub.called).to.be.false;

      // Reset stubs
      toggleActionStub.resetHistory();
      moreInfoActionStub.resetHistory();

      // Test with binary_sensor domain
      const binarySensorState = s('binary_sensor.test', 'on');
      stateIcon(mockElement, mockHass, binarySensorState);

      expect(moreInfoActionStub.calledWith('binary_sensor.test')).to.be.true;
      expect(toggleActionStub.called).to.be.false;
    });

    it('should use custom icon when provided', async () => {
      const mockState = s('sensor.test', 'on');
      const customIcon = 'mdi:custom-icon';

      const result = stateIcon(
        mockElement,
        mockHass,
        mockState,
        undefined,
        customIcon,
      );
      const el = await fixture(result);

      const icon = el.querySelector('ha-state-icon');
      expect((icon as any).icon).to.equal(customIcon);
    });

    it('should attach action handler and click handler', async () => {
      const mockState = s('sensor.test', 'on');
      const mockParams = {
        entity: 'sensor.test',
        tap_action: { action: 'more-info' },
      };

      moreInfoActionStub.returns(mockParams);
      actionHandlerStub.returns('mock-handler');
      handleClickActionStub.returns({ handleEvent: () => {} });

      const result = stateIcon(mockElement, mockHass, mockState);
      const el = await fixture(result);

      expect(moreInfoActionStub.calledWith('sensor.test')).to.be.true;
      expect(actionHandlerStub.calledWith(mockParams)).to.be.true;
      expect(handleClickActionStub.calledWith(mockElement, mockParams)).to.be
        .true;

      expect((el as any).actionHandler).to.equal('mock-handler');
    });

    it('should filter out undefined class names', async () => {
      const result = stateIcon(mockElement, mockHass, undefined, undefined);
      const el = await fixture(result);

      // Should only have the 'icon' class
      expect(el.className).to.equal('icon');
    });

    it('should call haIcon when no state is provided but icon is provided', async () => {
      const result = stateIcon(
        mockElement,
        mockHass,
        undefined, // no state
        'test-class',
        'mdi:test-icon',
      );

      // Verify haIcon was called with correct parameters
      expect(haIconStub.calledOnce).to.be.true;
      expect(haIconStub.calledWith('mdi:test-icon', 'icon test-class')).to.be
        .true;

      // Verify the result is what haIcon returned
      const el = await fixture(result as TemplateResult);
      expect(el.classList.contains('ha-icon-mock')).to.be.true;
    });
  });
};
