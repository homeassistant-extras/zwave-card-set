import * as actionHandlerModule from '@common/action-handler';
import { fixture } from '@open-wc/testing-helpers';
import { createState as s } from '@test/test-helpers';
import type { State } from '@type/homeassistant';
import {
  renderChevronToggle,
  renderError,
  renderStateDisplay,
} from '@util/render';
import { expect } from 'chai';
import { nothing, type TemplateResult } from 'lit';
import { stub } from 'sinon';

export default () => {
  describe('render.ts', () => {
    describe('renderError', () => {
      it('should render an ha-alert with the error message', async () => {
        const errorMessage = 'Test error message';
        const result = renderError(errorMessage);
        const el = await fixture(result);

        expect(el.tagName.toLowerCase()).to.equal('ha-alert');
        expect(el.getAttribute('alert-type')).to.equal('error');
        expect(el.textContent).to.equal(errorMessage);
      });

      it('should handle empty error message', async () => {
        const result = renderError('');
        const el = await fixture(result);

        expect(el.tagName.toLowerCase()).to.equal('ha-alert');
        expect(el.getAttribute('alert-type')).to.equal('error');
        expect(el.textContent).to.equal('');
      });
    });

    describe('renderStateDisplay', () => {
      let mockElement: HTMLElement;
      let mockHass: any;
      let actionHandlerStub: sinon.SinonStub;
      let handleClickActionStub: sinon.SinonStub;
      let moreInfoActionStub: sinon.SinonStub;

      beforeEach(() => {
        mockElement = document.createElement('div');
        mockHass = { states: {} };

        actionHandlerStub = stub(actionHandlerModule, 'actionHandler').returns(
          'mock-action-handler',
        );
        handleClickActionStub = stub(
          actionHandlerModule,
          'handleClickAction',
        ).returns({
          handleEvent: () => {},
        });
        moreInfoActionStub = stub(
          actionHandlerModule,
          'moreInfoAction',
        ).returns({
          entity: 'light.test',
          tap_action: { action: 'more-info' },
        });
      });

      afterEach(() => {
        actionHandlerStub.restore();
        handleClickActionStub.restore();
        moreInfoActionStub.restore();
      });

      it('should return nothing when state is undefined', () => {
        const result = renderStateDisplay(
          mockElement,
          mockHass,
          undefined,
          ['test-class'],
          'test-span-class',
          'Test Title',
        );

        expect(result).to.equal(nothing);
      });

      it('should render state display with title when provided', async () => {
        const mockState: State = s('sensor.test', 'on');

        const result = renderStateDisplay(
          mockElement,
          mockHass,
          mockState,
          ['test-class-1', 'test-class-2'],
          'test-span-class',
          'Test Title',
        );

        expect(moreInfoActionStub.calledWith('sensor.test')).to.be.true;
        expect(handleClickActionStub.calledOnce).to.be.true;
        expect(actionHandlerStub.calledOnce).to.be.true;

        const el = await fixture(result as TemplateResult);

        expect(el.tagName.toLowerCase()).to.equal('div');
        expect([...el.classList]).to.include('test-class-1');
        expect([...el.classList]).to.include('test-class-2');

        const span = el.querySelector('span');
        expect(span).to.exist;
        expect(span?.className).to.equal('test-span-class');
        expect(span?.textContent).to.equal('Test Title');

        const stateDisplay = el.querySelector('state-display');
        expect(stateDisplay).to.exist;
        expect((stateDisplay as any).hass).to.exist;
        expect((stateDisplay as any).stateObj).to.deep.equal(mockState);
      });

      it('should render state display without title when not provided', async () => {
        const mockState: State = s('sensor.test', 'on');

        const result = renderStateDisplay(
          mockElement,
          mockHass,
          mockState,
          ['test-class'],
          'test-span-class',
        );

        const el = await fixture(result as TemplateResult);

        expect(el.tagName.toLowerCase()).to.equal('div');
        expect([...el.classList]).to.include('test-class');

        const span = el.querySelector('span');
        expect(span).to.not.exist;

        const stateDisplay = el.querySelector('state-display');
        expect(stateDisplay).to.exist;
      });

      it('should filter out undefined class names', async () => {
        const mockState: State = s('sensor.test', 'on');

        const result = renderStateDisplay(
          mockElement,
          mockHass,
          mockState,
          ['test-class', undefined as any, 'another-class'],
          'test-span-class',
        );

        const el = await fixture(result as TemplateResult);

        expect([...el.classList]).to.include('test-class');
        expect([...el.classList]).to.include('another-class');
        expect([...el.classList].length).to.equal(2);
      });
    });

    describe('renderChevronToggle', () => {
      it('should render with default position and no label', async () => {
        const clickHandler = stub();
        const result = renderChevronToggle(false, clickHandler);

        const el = await fixture(result);

        expect(el.tagName.toLowerCase()).to.equal('div');
        expect([...el.classList]).to.include('toggle-chevron');
        expect([...el.classList]).to.include('position-default');

        const icon = el.querySelector('ha-icon');
        expect(icon).to.exist;
        expect(icon?.classList.contains('collapsed')).to.be.true;
        expect(icon?.classList.contains('expanded')).to.be.false;
        expect(icon?.getAttribute('icon')).to.equal('mdi:chevron-down');

        const label = el.querySelector('.toggle-label');
        expect(label).to.not.exist;

        // Simulate click
        (el as any).click();
        expect(clickHandler.calledOnce).to.be.true;
      });

      it('should render expanded state with up chevron', async () => {
        const clickHandler = stub();
        const result = renderChevronToggle(true, clickHandler);

        const el = await fixture(result);
        const icon = el.querySelector('ha-icon');

        expect(icon?.classList.contains('expanded')).to.be.true;
        expect(icon?.classList.contains('collapsed')).to.be.false;
        expect(icon?.getAttribute('icon')).to.equal('mdi:chevron-up');
      });

      it('should render with bottom-right position', async () => {
        const clickHandler = stub();
        const result = renderChevronToggle(false, clickHandler, 'bottom-right');

        const el = await fixture(result);

        expect([...el.classList]).to.include('position-bottom-right');
        expect([...el.classList]).to.not.include('position-default');
        expect([...el.classList]).to.not.include('position-inline');
      });

      it('should render with inline position', async () => {
        const clickHandler = stub();
        const result = renderChevronToggle(false, clickHandler, 'inline');

        const el = await fixture(result);

        expect([...el.classList]).to.include('position-inline');
        expect([...el.classList]).to.not.include('position-default');
        expect([...el.classList]).to.not.include('position-bottom-right');
      });

      it('should render with label when provided', async () => {
        const clickHandler = stub();
        const result = renderChevronToggle(
          false,
          clickHandler,
          'default',
          'Show More',
        );

        const el = await fixture(result);

        const label = el.querySelector('.toggle-label');
        expect(label).to.exist;
        expect(label?.textContent).to.equal('Show More');
      });
    });
  });
};
