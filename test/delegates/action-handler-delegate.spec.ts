import {
  actionHandler,
  handleClickAction,
} from '@delegates/action-handler-delegate';
import * as fireEventModule from '@hass/common/dom/fire_event';
import type { ActionHandlerEvent } from '@hass/data/lovelace/action_handler';
import * as actionHandlerDirective from '@hass/panels/lovelace/common/directives/action-handler-directive';
import { expect } from 'chai';
import { restore, type SinonStub, stub } from 'sinon';

describe('action-handler-delegate.ts', () => {
  let fireEventStub: SinonStub;
  let hassActionHandlerStub: SinonStub;

  beforeEach(() => {
    // Set up stubs for the dependencies
    fireEventStub = stub(fireEventModule, 'fireEvent');
    hassActionHandlerStub = stub(actionHandlerDirective, 'actionHandler');
  });

  afterEach(() => {
    // Clean up all stubs
    restore();
  });

  describe('actionHandler', () => {
    it('should handle undefined config values gracefully', () => {
      // Arrange
      const entity = {
        entity: 'light.living_room',
      };

      // Act
      actionHandler(entity as any);

      // Assert
      expect(hassActionHandlerStub.calledOnce).to.be.true;
      expect(hassActionHandlerStub.firstCall.args[0]).to.deep.equal({
        hasDoubleClick: true,
        hasHold: true,
      });
    });
  });

  describe('handleClickAction', () => {
    it('should not fire an event if no action is provided', () => {
      // Arrange
      const element = document.createElement('div');
      const entity = {
        config: {
          entity_id: 'light.living_room',
        },
      };
      const handler = handleClickAction(element, entity as any);
      const event = { detail: {} } as ActionHandlerEvent;

      // Act
      handler.handleEvent(event);

      // Assert
      expect(fireEventStub.called).to.be.false;
    });

    it('should fire a "hass-action" event with the correct parameters when an action is provided', () => {
      // Arrange
      const element = document.createElement('div');
      const entity = {
        entity: 'light.living_room',
        tap_action: { action: 'toggle' },
      };
      const handler = handleClickAction(element, entity as any);
      const event = { detail: { action: 'tap' } } as ActionHandlerEvent;

      // Act
      handler.handleEvent(event);

      // Assert
      expect(fireEventStub.calledOnce).to.be.true;
      expect(fireEventStub.firstCall.args[0]).to.equal(element);
      expect(fireEventStub.firstCall.args[1]).to.equal('hass-action');
      expect(fireEventStub.firstCall.args[2]).to.deep.equal({
        config: {
          entity: 'light.living_room',
          tap_action: { action: 'toggle' },
        },
        action: 'tap',
      });
    });

    it('should include all entity config properties in the fired event', () => {
      // Arrange
      const element = document.createElement('div');
      const entity = {
        entity: 'light.living_room',
        name: 'Living Room Light',
        icon: 'mdi:lightbulb',
        tap_action: { action: 'toggle' },
        double_tap_action: { action: 'more-info' },
        hold_action: { action: 'call-service' },
      };
      const handler = handleClickAction(element, entity as any);
      const event = { detail: { action: 'hold' } } as ActionHandlerEvent;

      // Act
      handler.handleEvent(event);

      // Assert
      expect(fireEventStub.calledOnce).to.be.true;
      expect(fireEventStub.firstCall.args[2].config).to.include({
        entity: 'light.living_room',
        name: 'Living Room Light',
        icon: 'mdi:lightbulb',
      });
      expect(fireEventStub.firstCall.args[2].action).to.equal('hold');
    });
  });
});
