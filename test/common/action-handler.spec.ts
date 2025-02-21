import { handleClickAction, moreInfoAction } from '@common/action-handler';
import type {
  ActionConfigParams,
  ActionHandlerElement,
  ActionHandlerEvent,
} from '@type/action';
import { expect } from 'chai';
import { stub } from 'sinon';
const proxyquire = require('proxyquire');

// Create a function that will be returned when _actionHandler is called with options
const mockDirectiveFunction = (options: any) => {
  return 'mock directive result';
};

// Create stubs for the lit directive system
const directiveStub = stub().returns(mockDirectiveFunction); // Now returns a function that returns a value
const noChangeStub = Symbol('noChange');

// Use proxyquire to replace both the lit and lit/directive modules
const { actionHandler } = proxyquire('@common/action-handler', {
  lit: {
    noChange: noChangeStub,
  },
  'lit/directive.js': {
    directive: directiveStub,
    Directive: class MockDirective {
      update() {
        return noChangeStub;
      }
      render() {}
    },
  },
});

describe('common', () => {
  describe('action-handler.ts', () => {
    describe('actionHandler directive', () => {
      it('should call the directive function', () => {
        // Your test logic here
        expect(directiveStub.called).to.be.true;
      });

      it('should call _actionHandler which binds', () => {
        const element = document.createElement('div') as ActionHandlerElement;
        const result = actionHandler({
          config: {
            entity_id: 'light.test',
            tap_action: { action: 'toggle' },
          },
          state: undefined,
        });
        expect(result).to.equal('mock directive result');
      });
    });

    describe('handleClickAction', () => {
      let element: HTMLElement;
      let mockEvent: ActionHandlerEvent;
      let entityInfo: ActionConfigParams;
      let dispatchStub: sinon.SinonStub;

      beforeEach(() => {
        element = document.createElement('div');
        dispatchStub = stub(element, 'dispatchEvent');
        mockEvent = {
          detail: { action: 'hold' },
        } as ActionHandlerEvent;
        entityInfo = {
          entity: 'light.test',
          tap_action: { action: 'toggle' },
        };
      });

      afterEach(() => {
        dispatchStub.restore();
      });

      it('should dispatch hass-action event with correct config', () => {
        const handler = handleClickAction(element, entityInfo);
        handler.handleEvent(mockEvent);

        // Ensure the stub was called once
        expect(dispatchStub.calledOnce).to.be.true;

        // Retrieve the event argument passed to dispatchEvent
        const event = dispatchStub.firstCall.args[0] as CustomEvent;
        expect(event.type).to.equal('hass-action');
        expect(event.detail.config.entity).to.equal('light.test');

        // Restore the original method
        dispatchStub.restore();
      });

      it('should not dispatch event if no action in event detail', () => {
        const handler = handleClickAction(element, entityInfo);
        handler.handleEvent({} as ActionHandlerEvent);

        expect(dispatchStub.called).to.be.false;
      });
    });

    describe('moreInfoAction', () => {
      it('should return an object with the correct structure', () => {
        const result = moreInfoAction('light.kitchen');

        expect(result).to.be.an('object');
        expect(result).to.have.property('entity');
        expect(result).to.have.property('tap_action');
        expect(result).to.have.property('hold_action');
        expect(result).to.have.property('double_tap_action');
      });

      it('should set the entity property to the provided entity_id', () => {
        const entityId = 'sensor.temperature';
        const result = moreInfoAction(entityId);

        expect(result.entity).to.equal(entityId);
      });

      it('should set all action types to "more-info"', () => {
        const result = moreInfoAction('switch.office');

        expect(result.tap_action).to.deep.equal({ action: 'more-info' });
        expect(result.hold_action).to.deep.equal({ action: 'more-info' });
        expect(result.double_tap_action).to.deep.equal({ action: 'more-info' });
      });

      it('should work with various entity ID formats', () => {
        const testCases = [
          'light.living_room',
          'binary_sensor.door',
          'media_player.tv',
          'climate.bedroom',
        ];

        testCases.forEach((entityId) => {
          const result = moreInfoAction(entityId);
          expect(result.entity).to.equal(entityId);
        });
      });

      it('should handle empty string input', () => {
        const result = moreInfoAction('');
        expect(result.entity).to.equal('');
        expect(result.tap_action).to.deep.equal({ action: 'more-info' });
      });
    });
  });
});
