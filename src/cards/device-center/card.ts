import type { Config as BaseConfig } from '@base/types';
import type { Config } from '@hub-card/types';
import type { HomeAssistant } from '@type/homeassistant';
import { getZoozDevices } from '@util/hass';
import { CSSResult, LitElement, html, nothing, type TemplateResult } from 'lit';
import { state } from 'lit/decorators.js';
import { literal, html as staticHTML } from 'lit/static-html.js';
import { styles } from './styles';
import type { Center } from './types';
const equal = require('fast-deep-equal');

const DEVICES_CARD_MAP = {
  'ZEN55 LR': {
    type: literal`zooz-dc-signal-sensor`,
    title: 'ZEN55 LR Sensors',
  },
  ZEN52: {
    type: literal`zooz-double-relay`,
    title: 'ZEN52 Double Relay',
  },
};

/**
 * Zooz Device Center Card
 */
export class ZoozDeviceCenter extends LitElement {
  /**
   * Card configuration object
   */
  @state()
  private _config!: Config;

  /**
   * Device center state
   */
  @state()
  private _center!: Center;

  /**
   * Home Assistant instance
   * Not marked as @state as it's handled differently
   */
  private _hass!: HomeAssistant;

  /**
   * Returns the component's styles
   */
  static override get styles(): CSSResult {
    return styles;
  }

  /**
   * Sets up the card configuration
   * @param {Config} config - The card configuration
   */
  setConfig(config: Config) {
    this._config = config;
  }

  /**
   * Updates the card's state when Home Assistant state changes
   * @param {HomeAssistant} hass - The Home Assistant instance
   */
  set hass(hass: HomeAssistant) {
    this._hass = hass;

    const center: Center = {
      devices: {},
    };

    const devices = getZoozDevices(hass);

    Object.keys(DEVICES_CARD_MAP).forEach((key) => {
      center.devices![key] = devices.filter((device) => device.model === key);
    });

    if (!equal(center, this._center)) {
      this._center = center;
    }
  }

  // card configuration
  static getConfigElement() {
    return document.createElement('zooz-basic-editor');
  }

  /**
   * Renders the lit element card
   * @returns {TemplateResult} The rendered HTML template
   */
  override render(): TemplateResult | typeof nothing {
    return html`<span>Zooz Hub</span>
      <zooz-hub-card .hass=${this._hass}></zooz-hub-card>

      ${Object.entries(DEVICES_CARD_MAP).map(
        ([model, { type, title }]) => html`
          <div class="devices">
            <span>${title}</span>
            ${this._center.devices?.[model]?.map((device) => {
              const config: BaseConfig = {
                device_id: device.id,
              };
              return staticHTML`<${type} .config=${config} .hass=${this._hass}></${type}>`;
            })}
          </div>
        `,
      )}`;
  }
}
