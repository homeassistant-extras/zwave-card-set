// Polymer legacy event helpers used courtesy of the Polymer project.
//
// Copyright (c) 2017 The Polymer Authors. All rights reserved.
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are
// met:
//
//    * Redistributions of source code must retain the above copyright
// notice, this list of conditions and the following disclaimer.
//    * Redistributions in binary form must reproduce the above
// copyright notice, this list of conditions and the following disclaimer
// in the documentation and/or other materials provided with the
// distribution.
//    * Neither the name of Google Inc. nor the names of its
// contributors may be used to endorse or promote products derived from
// this software without specific prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
// "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
// LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
// A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
// OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
// SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
// LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
// DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
// THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
// OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

import type { Config as HubCardConfig } from '@/cards/controller-info/types';
import type { Config as NodeStatusConfig } from '@/cards/node-states/types';
import type { ActionParams } from '@type/action';

/**
 * Event emitted when the configuration changes
 */
export interface ConfigChangedEvent {
  config: NodeStatusConfig | HubCardConfig;
}

/**
 * Global interface for Home Assistant DOM events
 */
declare global {
  // eslint-disable-next-line
  interface HASSDomEvents {}
}

declare global {
  // eslint-disable-next-line
  interface HASSDomEvents {
    'hass-action': ActionParams;
    'config-changed': ConfigChangedEvent;
  }
}

export type ValidHassDomEvent = keyof HASSDomEvents;

export interface HASSDomEvent<T> extends Event {
  detail: T;
}

/**
 * Dispatches a custom event with an optional detail value.
 *
 * @param {HTMLElement | Window} element The element to dispatch the event on.
 * @param {string} type Name of event type.
 * @param {*=} detail Detail value containing event-specific
 *   payload.]
 * @return {Event} The new event that was fired.
 */
export const fireEvent = <HassEvent extends ValidHassDomEvent>(
  element: HTMLElement | Window,
  type: HassEvent,
  detail?: HASSDomEvents[HassEvent],
): CustomEvent => {
  // Create and dispatch custom event for Home Assistant
  const event = new CustomEvent(type, {
    bubbles: true, // Event bubbles up through the DOM
    composed: true, // Event can cross shadow DOM boundaries
    detail,
  });

  element.dispatchEvent(event);
  return event;
};
